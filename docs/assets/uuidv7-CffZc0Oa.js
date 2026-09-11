/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */function r(){const t=new Uint8Array(16),e=globalThis.crypto;if(!e||typeof e.getRandomValues!="function")throw new Error("WebCrypto getRandomValues is required to mint stable UUIDv7 business IDs");return e.getRandomValues(t),t}function s(){const t=r();let e=BigInt(Date.now());for(let o=5;o>=0;o-=1)t[o]=Number(e&0xffn),e>>=8n;t[6]=t[6]&15|112,t[8]=t[8]&63|128;const n=Array.from(t,o=>o.toString(16).padStart(2,"0")).join("");return`${n.slice(0,8)}-${n.slice(8,12)}-${n.slice(12,16)}-${n.slice(16,20)}-${n.slice(20)}`}export{s as u};
