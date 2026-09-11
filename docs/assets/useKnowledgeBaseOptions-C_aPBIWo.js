import{r as t,aR as u,a3 as f}from"./index-BfwY-Z1G.js";/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */const d=()=>{const[a,c]=t.useState([]),[s,l]=t.useState(!0),e=t.useCallback(async()=>{l(!0);try{c(await u.listAgents.invoke()??[])}catch{c([])}finally{l(!1)}},[]);t.useEffect(()=>{e()},[e]);const n=t.useCallback(async r=>{const i=await u.createAgent.invoke(r);return await e(),i},[e]);return{agents:a,loading:s,refresh:e,create:n}},k=a=>{const[c,s]=t.useState(null),[l,e]=t.useState(!0),n=t.useCallback(async()=>{if(!a){s(null),e(!1);return}e(!0);try{s(await u.getAgent.invoke({cs_agent_id:a}))}catch{s(null)}finally{e(!1)}},[a]);t.useEffect(()=>{n()},[n]);const r=t.useCallback(async i=>{if(a){s(o=>o&&{...o,...i});try{const o=await u.patchAgent.invoke({cs_agent_id:a,patch:i});return s(o),o}catch(o){throw await n(),o}}},[a,n]);return{agent:c,loading:l,reload:n,patch:r}};/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */const y=()=>{const[a,c]=t.useState([]),[s,l]=t.useState(!0),e=t.useCallback(async()=>{l(!0);try{const n=await f.listBases.invoke()??[];c(n.map(r=>({value:r.knowledge_base_id,label:r.name})))}catch{c([])}finally{l(!1)}},[]);return t.useEffect(()=>{e()},[e]),{options:a,loading:s,refresh:e}};export{d as a,k as b,y as u};
