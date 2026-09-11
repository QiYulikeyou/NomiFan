import{r}from"./index-BfwY-Z1G.js";/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */function f(n){const t=(n==null?void 0:n.fallbackToWindowWidth)??!1,d=r.useRef(null),[w,o]=r.useState(()=>t&&typeof window<"u"?window.innerWidth:0);return r.useEffect(()=>{const i=d.current;if(!i){t&&o(typeof window>"u"?0:window.innerWidth);return}const e=()=>o(i.getBoundingClientRect().width);e();const s=new ResizeObserver(e);return s.observe(i),window.addEventListener("resize",e),()=>{s.disconnect(),window.removeEventListener("resize",e)}},[t]),{ref:d,width:w}}export{f as u};
