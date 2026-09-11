import{ak as e}from"./index-BfwY-Z1G.js";/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */const s="miniapp.html",n="miniapp",t=`[NomiFun 小程序构建模式]
你正在为用户构建一个「小程序」— 独立、自包含的网页小工具。规则:
1. 产物永远是工作区根目录下的单个文件 ${s},用文件工具创建与修改它。
2. ${s} 必须完全自包含:内联全部 CSS 与 JavaScript;需要第三方库时可经 CDN 引入;不得依赖工作区内其他文件。
3. 界面追求现代、美观、可即时上手;无需任何构建步骤。
4. 需要持久化数据时优先使用 localStorage,键名加应用专属前缀;但沙箱可能禁用存储,所有存储读写必须包在 try/catch 里并在失败时优雅降级,核心功能不得依赖持久化。
5. 每一轮回复结束时 ${s} 都必须是完整可运行的版本:首轮直接给出可用版本,之后按用户反馈迭代。
6. 除非用户明确要求,不创建其他文件;回复里简述改动即可,不要粘贴大段代码。`,p=16,r=(a,i)=>i("miniApps.iterate.firstMessage",{name:a.name,id:a.miniAppId,path:a.sourcePath}),l=(a,i)=>i("miniApps.iterate.conversationName",{name:a});function c(a){return a==null||typeof a!="object"?!1:a[n]===!0}function A(a){return`${e()}/api/miniapps/${encodeURIComponent(a)}/serve`}const I="allow-scripts allow-forms allow-popups allow-modals";export{I as M,l as a,r as b,t as c,s as d,n as e,p as f,c as i,A as r};
