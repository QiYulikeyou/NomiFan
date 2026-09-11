import{r,k as t}from"./index-BfwY-Z1G.js";function n(e){const o=r.useSyncExternalStore(s=>t.subscribe(e,s),()=>t.get(e)),a=r.useCallback(s=>t.set(e,s),[e]);return[o,a]}export{n as u};
