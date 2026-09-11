import{k as a}from"./index-BfwY-Z1G.js";/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */const t="tools.speechToText",r="nomifun:speech-to-text-config-changed",o={enabled:!1,language:""},d=e=>({enabled:(e==null?void 0:e.enabled)??!1,language:(e==null?void 0:e.language)??"",...(e==null?void 0:e.autoSend)===void 0?{}:{autoSend:e.autoSend},...(e==null?void 0:e.provider_id)===void 0?{}:{provider_id:e.provider_id},...(e==null?void 0:e.model)===void 0?{}:{model:e.model}}),E=()=>d(a.get(t)),_=async e=>{const s=d(e);try{await a.set(t,s)}catch(T){throw await a.reload(),T}finally{typeof window<"u"&&window.dispatchEvent(new CustomEvent(r))}};export{o as D,r as S,E as g,d as n,_ as s};
