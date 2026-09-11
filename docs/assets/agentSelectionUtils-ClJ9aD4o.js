import{k as n}from"./index-BfwY-Z1G.js";/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */async function i(e,o){try{if(e==="nomi"){const t=n.get("nomi.config");await n.set("nomi.config",{...t,preferredMode:o})}}catch{}}async function r(e,o){try{await n.set("nomi.defaultModel",{provider_id:e,model:o})}catch{}}const a=e=>{const o=e.agent_type==="remote"||e.agent_source==="custom",t=e.agent_id??e.id;return o&&t?t:e.backend||e.agent_type};export{r as a,a as g,i as s};
