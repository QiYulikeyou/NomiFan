//! `comfyui.api` — Local ComfyUI HTTP API image generation.
//!
//! Local-first image generation against a self-hosted ComfyUI server
//! (default `http://127.0.0.1:8188`). The adapter drives the standard
//! ComfyUI workflow API end-to-end inside [`ProtocolAdapter::submit`], so
//! the executor stays synchronous (`ModelInvoke`):
//!   1. `POST {base}/prompt`     — submit the workflow graph, get `prompt_id`
//!   2. `GET {base}/history/{id}` — poll until the run reports `completed`
//!   3. `GET {base}/view?...`     — download every rendered image as bytes
//!
//! The workflow graph is supplied per request in `extra.workflow` (a ComfyUI
//! *API-format* workflow JSON exported from the ComfyUI UI, not the UI graph
//! layout). The text prompt is injected into the workflow's positive
//! `CLIPTextEncode` node; optional overrides live in `extra` too:
//!   - `prompt_node`: node id whose `inputs.text` receives the prompt
//!     (default: first `CLIPTextEncode` node in the graph)
//!   - `seed`: forwarded to the first `KSampler` / `KSamplerAdvanced` /
//!     `SamplerCustom` node's `inputs.seed`
//!   - `width` / `height`: forwarded to the empty-latent node's dimensions

use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use async_trait::async_trait;
use nomifun_api_types::ModelTask;
use serde_json::{Value, json};

use crate::adapter::ProtocolAdapter;
use crate::call::ResolvedCall;
use crate::error::{InvokeError, InvokeErrorKind};
use crate::transport::{
    error_from_response, post_json, read_body_capped, send_with_rotation,
};
use crate::types::{
    ImageGenRequest, ProducedAsset, ProducedData, TaskOutcome, TaskResult, TaskRequest,
};

/// Submit call timeout: only enqueueing the workflow, not running it.
const SUBMIT_TIMEOUT: Duration = Duration::from_secs(30);
/// Poll cadence while the queue processes the graph.
const POLL_INTERVAL: Duration = Duration::from_secs(2);
/// Local GPU renders can take minutes; cap the whole wait at 5 minutes.
const POLL_TIMEOUT: Duration = Duration::from_secs(300);
const POLL_HTTP_TIMEOUT: Duration = Duration::from_secs(15);
const DOWNLOAD_TIMEOUT: Duration = Duration::from_secs(120);
/// 16 MiB ceiling per rendered image.
const MAX_IMAGE_BYTES: u64 = 16 * 1024 * 1024;

/// Local ComfyUI workflow-API protocol.
pub struct ComfyUiAdapter;

#[async_trait]
impl ProtocolAdapter for ComfyUiAdapter {
    fn id(&self) -> &'static str {
        "comfyui.api"
    }

    fn supports(&self, task: ModelTask) -> bool {
        matches!(task, ModelTask::ImageGeneration)
    }

    async fn submit(
        &self,
        http: &reqwest::Client,
        call: &ResolvedCall,
    ) -> Result<TaskOutcome, InvokeError> {
        match &call.request {
            TaskRequest::ImageGeneration(req) => run(http, call, req).await,
            other => Err(InvokeError::new(
                InvokeErrorKind::UnsupportedTask,
                format!("comfyui.api cannot serve task {:?}", other.task()),
            )),
        }
    }
}

async fn run(
    http: &reqwest::Client,
    call: &ResolvedCall,
    req: &ImageGenRequest,
) -> Result<TaskOutcome, InvokeError> {
    let submit_url = call.endpoint_url()?; // {base}/prompt

    // The workflow graph lives either on the request (`extra.workflow`) or,
    // more conveniently for the workshop, pinned on the model itself
    // (`model_params.workflow`). Request-level wins.
    let mut workflow = req
        .extra
        .get("workflow")
        .cloned()
        .or_else(|| call.model_params.get("workflow").cloned())
        .ok_or_else(|| {
            InvokeError::config(
                "comfyui.api requires a workflow: set extra.workflow (per request) or \
                 the model's model_params.workflow (pinned). It must be a ComfyUI \
                 API-format workflow JSON, exported via the ComfyUI UI's \
                 (Save (API Format)) button.",
            )
        })?;
    inject_workflow(&mut workflow, &req.prompt, &req.extra)?;

    // 1. Enqueue the workflow.
    let client_id = format!(
        "nomifun-{}",
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or(0)
    );
    let body = json!({ "prompt": workflow, "client_id": client_id });
    let resp = post_json(http, &submit_url, SUBMIT_TIMEOUT, &call.connection.auth, &body).await?;
    if !resp.status().is_success() {
        return Err(error_from_response(resp).await);
    }
    let submitted: Value = resp
        .json()
        .await
        .map_err(|e| InvokeError::response_json("invalid comfyui /prompt JSON", &e))?;
    let prompt_id = submitted
        .get("prompt_id")
        .and_then(Value::as_str)
        .ok_or_else(|| InvokeError::parse("comfyui /prompt response missing prompt_id"))?;
    if let Some(node_errors) = submitted
        .get("node_errors")
        .and_then(Value::as_object)
        .filter(|errs| !errs.is_empty())
    {
        return Err(InvokeError::parse(format!(
            "comfyui rejected the workflow with node errors: {node_errors:?}"
        )));
    }

    // history/view live under the same root, without the /prompt suffix.
    let base = submit_url.trim_end_matches("/prompt").trim_end_matches('/');

    // 2. Poll the history endpoint until the queue finishes this prompt.
    let history_url = format!("{base}/history/{prompt_id}");
    let deadline = Instant::now() + POLL_TIMEOUT;
    let images: Vec<(String, String, String)>;
    loop {
        if Instant::now() >= deadline {
            return Err(InvokeError::new(
                InvokeErrorKind::Timeout,
                format!("comfyui generation did not finish within {}s", POLL_TIMEOUT.as_secs()),
            ));
        }
        tokio::time::sleep(POLL_INTERVAL).await;
        let resp = send_with_rotation(&call.connection.auth, || {
            Ok(http.get(&history_url).timeout(POLL_HTTP_TIMEOUT))
        })
        .await?;
        if !resp.status().is_success() {
            return Err(error_from_response(resp).await);
        }
        let history: Value = resp
            .json()
            .await
            .map_err(|e| InvokeError::response_json("invalid comfyui history JSON", &e))?;
        let Some(entry) = history.get(prompt_id) else {
            // Not visible in history yet — still queued.
            continue;
        };
        let status_str = entry
            .get("status")
            .and_then(|s| s.get("status_str"))
            .and_then(Value::as_str);
        let completed = entry
            .get("status")
            .and_then(|s| s.get("completed"))
            .and_then(Value::as_bool)
            .unwrap_or(false);
        match status_str {
            Some("error") => {
                return Err(InvokeError::new(
                    InvokeErrorKind::JobFailed,
                    format!("comfyui reported a generation error for prompt {prompt_id}"),
                ));
            }
            Some("success") => {}
            _ if completed => {}
            _ => continue,
        }
        let mut found = Vec::new();
        if let Some(outputs) = entry.get("outputs").and_then(Value::as_object) {
            for output in outputs.values() {
                if let Some(list) = output.get("images").and_then(Value::as_array) {
                    for image in list {
                        let filename = image.get("filename").and_then(Value::as_str).unwrap_or("");
                        if filename.is_empty() {
                            continue;
                        }
                        let subfolder = image.get("subfolder").and_then(Value::as_str).unwrap_or("");
                        let kind = image.get("type").and_then(Value::as_str).unwrap_or("output");
                        found.push((filename.to_owned(), subfolder.to_owned(), kind.to_owned()));
                    }
                }
            }
        }
        if found.is_empty() {
            return Err(InvokeError::parse(
                "comfyui history shows completion but no output images were produced",
            ));
        }
        images = found;
        break;
    }

    // 3. Download every rendered image.
    let mut assets = Vec::with_capacity(images.len());
    for (filename, subfolder, kind) in images {
        let view_url =
            format!("{base}/view?filename={filename}&subfolder={subfolder}&type={kind}");
        let resp = send_with_rotation(&call.connection.auth, || {
            Ok(http.get(&view_url).timeout(DOWNLOAD_TIMEOUT))
        })
        .await?;
        if !resp.status().is_success() {
            return Err(error_from_response(resp).await);
        }
        let bytes = read_body_capped(resp, MAX_IMAGE_BYTES).await?;
        assets.push(ProducedAsset {
            data: ProducedData::Bytes(bytes),
            mime: Some(mime_from_path(&filename)),
        });
    }

    Ok(TaskOutcome::Done(TaskResult::Assets(assets)))
}

/// Set a single `node.inputs[key]` value. Reaching through `node["inputs"]`
/// on a node that lacks an `inputs` object would panic serde_json's IndexMut,
/// so every write goes through this accessor.
fn set_node_input(node: &mut Value, key: &str, val: Value) {
    if let Some(inputs) = node.get_mut("inputs").and_then(Value::as_object_mut) {
        inputs.insert(key.to_owned(), val);
    }
}

/// Inject the prompt and optional generation overrides into a ComfyUI
/// API-format workflow graph. Pure and side-effect free — unit tested.
fn inject_workflow(
    workflow: &mut Value,
    prompt: &str,
    extra: &Value,
) -> Result<(), InvokeError> {
    let object = workflow.as_object_mut().ok_or_else(|| {
        InvokeError::config("comfyui.api extra.workflow must be a ComfyUI API-format workflow object")
    })?;

    // Positive prompt node: explicit id wins, otherwise first CLIPTextEncode.
    match extra.get("prompt_node").and_then(Value::as_str) {
        Some(node_id) => {
            let node = object.get_mut(node_id).ok_or_else(|| {
                InvokeError::config(format!(
                    "comfyui.api extra.prompt_node {node_id:?} was not found in the workflow"
                ))
            })?;
            set_node_input(node, "text", Value::String(prompt.to_owned()));
        }
        None => {
            let mut injected = false;
            for node in object.values_mut() {
                if node.get("class_type").and_then(Value::as_str) == Some("CLIPTextEncode") {
                    set_node_input(node, "text", Value::String(prompt.to_owned()));
                    injected = true;
                    break;
                }
            }
            if !injected {
                return Err(InvokeError::config(
                    "comfyui.api workflow has no CLIPTextEncode node; set extra.prompt_node",
                ));
            }
        }
    }

    // Seed override → first KSampler-family node.
    if let Some(seed) = extra.get("seed").and_then(Value::as_u64) {
        for node in object.values_mut() {
            if matches!(
                node.get("class_type").and_then(Value::as_str),
                Some("KSampler") | Some("KSamplerAdvanced") | Some("SamplerCustom")
            ) {
                set_node_input(node, "seed", Value::from(seed));
                break;
            }
        }
    }

    // Width/height override → empty-latent nodes.
    if let Some(width) = extra.get("width").and_then(Value::as_u64) {
        for node in object.values_mut() {
            if matches!(
                node.get("class_type").and_then(Value::as_str),
                Some("EmptyLatentImage") | Some("EmptySD3LatentImage")
            ) {
                set_node_input(node, "width", Value::from(width));
                break;
            }
        }
    }
    if let Some(height) = extra.get("height").and_then(Value::as_u64) {
        for node in object.values_mut() {
            if matches!(
                node.get("class_type").and_then(Value::as_str),
                Some("EmptyLatentImage") | Some("EmptySD3LatentImage")
            ) {
                set_node_input(node, "height", Value::from(height));
                break;
            }
        }
    }

    Ok(())
}

fn mime_from_path(filename: &str) -> String {
    match filename.rsplit_once('.').map(|(_, ext)| ext.to_ascii_lowercase()) {
        Some(ext) => match ext.as_str() {
            "jpg" | "jpeg" => "image/jpeg",
            "webp" => "image/webp",
            _ => "image/png",
        }
        .to_owned(),
        None => "image/png".to_owned(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn injects_prompt_into_first_clip_text_encode_node() {
        let mut workflow = json!({
            "3": { "class_type": "KSampler", "inputs": { "seed": 12345, "steps": 20 } },
            "6": { "class_type": "CLIPTextEncode", "inputs": { "text": "old prompt" } },
            "7": { "class_type": "CLIPTextEncode", "inputs": { "text": "negative" } },
        });
        inject_workflow(
            &mut workflow,
            "a red dragon on mars",
            &json!({}),
        )
        .expect("injects");
        assert_eq!(workflow["6"]["inputs"]["text"], json!("a red dragon on mars"));
        // Second CLIPTextEncode (negative) is left untouched.
        assert_eq!(workflow["7"]["inputs"]["text"], json!("negative"));
    }

    #[test]
    fn respects_explicit_prompt_node_and_seed_and_size_overrides() {
        let mut workflow = json!({
            "3": { "class_type": "KSampler", "inputs": { "seed": 0, "steps": 25 } },
            "5": { "class_type": "EmptyLatentImage", "inputs": { "width": 512, "height": 512, "batch_size": 1 } },
            "6": { "class_type": "CLIPTextEncode", "inputs": { "text": "unused" } },
            "10": { "class_type": "CLIPTextEncode", "inputs": { "text": "target" } },
        });
        inject_workflow(
            &mut workflow,
            "night city rain",
            &json!({ "prompt_node": "10", "seed": 42, "width": 768, "height": 1024 }),
        )
        .expect("overrides");
        assert_eq!(workflow["10"]["inputs"]["text"], json!("night city rain"));
        assert_eq!(workflow["6"]["inputs"]["text"], json!("unused"));
        assert_eq!(workflow["3"]["inputs"]["seed"], json!(42));
        assert_eq!(workflow["5"]["inputs"]["width"], json!(768));
        assert_eq!(workflow["5"]["inputs"]["height"], json!(1024));
    }

    #[test]
    fn rejects_workflow_without_any_clip_text_encode_node() {
        let mut workflow = json!({ "3": { "class_type": "KSampler", "inputs": { "seed": 1 } } });
        let err = inject_workflow(&mut workflow, "x", &json!({})).unwrap_err();
        assert_eq!(err.kind, InvokeErrorKind::Config);
        assert!(err.message.contains("CLIPTextEncode"));
    }
}
