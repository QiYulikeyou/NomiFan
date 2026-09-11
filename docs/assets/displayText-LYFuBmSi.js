/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */const o=(t,n="")=>{if(typeof t=="string")return t;if(t==null)return n;if(typeof t=="number"||typeof t=="boolean"||typeof t=="bigint")return String(t);try{const r=JSON.stringify(t,null,2);return r===void 0?n:r}catch{return String(t)}},e=t=>{if(t!=null)return o(t)},i=t=>typeof t=="string"?t:t&&typeof t=="object"&&"content"in t?o(t.content):"";export{i as e,e as o,o as t};
