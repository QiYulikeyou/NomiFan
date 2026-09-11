import{l as g,D as s,n as c,r as n,o,p as A}from"./index-BfwY-Z1G.js";/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */const d=3e4;let r=0,t=null;async function u(){await A.refreshCustomAgents.invoke(),await o(s)}async function E(){const e=Date.now();if(t)return t;if(!(r>0&&e-r<d))return r=e,t=u().catch(a=>{console.error("Failed to refresh detected agents:",a)}).finally(()=>{t=null}),t}const _=()=>{const{data:e,isLoading:a,error:i}=g(s,c),l=n.useCallback(()=>o(s),[]),f=n.useCallback(u,[]);return n.useEffect(()=>{E()},[]),{agents:e??[],isLoading:a,error:i,revalidate:l,refreshCustomAgents:f}};async function C(){const e=await c();return await o(s,e,{revalidate:!1}),e}export{C as g,_ as u};
