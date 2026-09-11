/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */const s=r=>{if(!r)return{head:"",tail:""};const e=r.replace(/[\\/]+$/,""),a=Math.max(e.lastIndexOf("/"),e.lastIndexOf("\\"));return a<=0?{head:"",tail:e}:{head:e.slice(0,a),tail:e.slice(a)}},l=(r,e)=>{const t=r.trim().replace(/\\/g,"/").replace(/\/{2,}/g,"/").replace(/^\.\//,"")||e,i=t.lastIndexOf("/");return i<0?{directoryPath:"",fileName:t||e,fullPath:t}:{directoryPath:t.slice(0,i+1),fileName:t.slice(i+1)||e,fullPath:t}};export{l as a,s};
