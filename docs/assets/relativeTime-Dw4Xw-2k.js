/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */function s(o,i){const r=Date.now()-o,t=Math.floor(r/6e4),n=Math.floor(t/60),e=Math.floor(n/24);return t<1?i("miniApps.time.justNow"):t<60?i("miniApps.time.minutesAgo",{count:t}):n<24?i("miniApps.time.hoursAgo",{count:n}):e===1?i("miniApps.time.yesterday"):e<7?i("miniApps.time.daysAgo",{count:e}):i("miniApps.time.weeksAgo")}export{s as f};
