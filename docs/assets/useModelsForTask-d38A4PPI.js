import{r as l,l as p,ci as P}from"./index-BfwY-Z1G.js";/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */const v=(e,o)=>(o==null?void 0:o.trim())||e,A=(e,o)=>o!=null&&o.trim()&&o.trim()!==e?e:void 0;/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */const u="nomifun-free-model",I=e=>e.platform===u,c=e=>e===u?1:0,_=e=>e.map((o,r)=>({provider:o,index:r})).sort((o,r)=>c(o.provider.platform)-c(r.provider.platform)||o.index-r.index).map(({provider:o})=>o),M="providers",O={revalidateOnFocus:!1,revalidateOnReconnect:!1,shouldRetryOnError:!1},R=async()=>await P.listProviders.invoke()??[],f=()=>p(M,R,O),h=()=>{const{data:e,isLoading:o}=f(),r=l.useMemo(()=>Array.isArray(e)?e:[],[e]),t=l.useMemo(()=>_(r.filter(n=>n.enabled!==!1)),[r]),s=l.useCallback((n,i)=>{var d;if(!i)return"";const a=(d=n==null?void 0:n.models)==null?void 0:d.find(m=>m.model===i);return v(i,a==null?void 0:a.display_name)},[]);return{providers:t,configuredProviders:r,isLoading:o||!Array.isArray(e),formatModelLabel:s}};/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */const g=(e,o)=>e==null?void 0:e.models.find(r=>r.model===o),k=(e,o,r)=>{var t;return(t=g(e,o))==null?void 0:t.capabilities.find(s=>s.task===r)},x=(e,o,r)=>{var t;return(t=k(e,o,r))==null?void 0:t.health},L=(e,o,r=[])=>{const t=e.capabilities.find(s=>s.task===o);return!!(t&&r.every(s=>t.traits.includes(s)))},S=e=>({task:e.task,traits:e.traits,protocol:e.protocol,connection_role:e.connection_role,base_url_override:e.base_url_override,endpoint:e.endpoint,poll_endpoint:e.poll_endpoint,content_endpoint:e.content_endpoint,realtime_endpoint:e.realtime_endpoint,allow_cross_origin_credentials:e.allow_cross_origin_credentials,provider_params:e.provider_params,context_limit:e.context_limit,output_limit:e.output_limit}),D=e=>({model:e.model,display_name:e.display_name,enabled:e.enabled,description:e.description,sort_order:e.sort_order,capabilities:e.capabilities.map(S)});/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */const b=(e,o,r=[])=>_(e.filter(t=>t.enabled!==!1)).flatMap(t=>{const s=t.models.filter(n=>n.enabled&&L(n,o,r)).map(n=>n.model);return s.length===0?[]:[{provider:t,models:s}]});function F(e,o){const{data:r,error:t,isLoading:s,mutate:n}=f(),i=l.useMemo(()=>b(r??[],e,o),[r,o,e]),a=l.useCallback(()=>{n()},[n]);return{groups:i,isLoading:s||!Array.isArray(r),error:t,refresh:a}}export{u as N,M as P,f as a,x as b,k as c,L as d,h as e,b as f,A as g,I as i,v as m,_ as o,D as t,F as u};
