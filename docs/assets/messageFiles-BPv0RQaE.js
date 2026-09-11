import{b3 as i,b4 as p}from"./index-BfwY-Z1G.js";const f=t=>t.replayed?t.completed?"replayed_completed":"replayed_in_flight":"fresh",g=(t,s)=>{const r=s.map(e=>typeof e=="string"?e:e.path).filter(Boolean);return Array.from(new Set([...t,...r]))},m=(t,s,r)=>{if(!s.length)return t;const e=r==null?void 0:r.replace(/[\\/]+$/,""),c=s.map(n=>{const a=n.replace(i,"$1");if(!e)return a;if(n.startsWith("/")||/^[A-Za-z]:/.test(n)){const l=n.replace(/\\/g,"/"),o=e.replace(/\\/g,"/");if(l.startsWith(o+"/")){const d=l.slice(o.length+1);return`${e}/${d.replace(i,"$1")}`}return a}return`${e}/${a}`});return`${t}

${p}
${c.join(`
`)}`};export{g as a,m as b,f as c};
