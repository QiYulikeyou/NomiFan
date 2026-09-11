/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */const n=/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,o=e=>{const t=String(e);if(n.test(t))return t.slice(-12);const s=t.split(/[\\/]/).filter(Boolean).pop()??t;return s.length>24?`…${s.slice(-24)}`:s};export{o as s};
