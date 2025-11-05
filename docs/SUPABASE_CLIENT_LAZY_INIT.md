# Supabase 客户端“懒加载 + 仅服务端 Admin”改造说明

本次改造解决了生产环境白屏的根因：在模块顶层创建 Supabase 客户端并校验环境变量，导致当 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 未正确注入时，客户端初始化阶段直接抛错（如浏览器 Console 报错：`supabaseKey is required`）。

## 变更摘要

- 移除 `src/lib/supabase.ts` 中的顶层环境变量校验与顶层 `createClient(...)` 调用。
- 提供按需创建的 `getSupabase()` 方法（仅使用 `NEXT_PUBLIC_SUPABASE_*`）：
  - 首次调用时才创建客户端；
  - 缺失变量时在调用点抛出可读错误（避免整站在导入阶段白屏）。
- `supabaseAdmin` 仅在服务端创建并导出，客户端 Bundle 不再包含 `SUPABASE_SERVICE_ROLE_KEY`。
- 更新所有使用点，将 `import { supabase }` 改为 `import { getSupabase }` 并在组件内调用。

## 受影响文件

- 修改：`src/lib/supabase.ts`
- 修改：`src/contexts/DocumentContext.tsx`

## 关键实现片段

```ts
// src/lib/supabase.ts（要点节选）
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
const isServer = typeof window === 'undefined';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let browserClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase public env missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
  if (!browserClient) {
    browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return browserClient;
}

export const supabaseAdmin = isServer && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : undefined;
```

```ts
// src/contexts/DocumentContext.tsx（要点节选）
import { getSupabase } from "@/lib/supabase";
...
export function DocumentProvider(...) {
  ...
  const supabase = getSupabase();
  ...
}
```

## 验证步骤

1. 本地验证
   - `npm run build`：应成功完成；
   - `npm start`：主页可加载，不再出现初始化阶段白屏；
   - Console 不应再出现 `supabaseKey is required`。
2. 生产验证（Vercel）
   - 确认 Production 环境存在：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - 触发部署后访问生产 URL，页面可正常渲染。

## 风险与回退

- 该改造是“最小、可回退”的：如需回退，仅需将 `getSupabase()` 改回顶层 `export const supabase = ...`。
- 若生产仍白屏，请优先检查 Vercel 环境变量是否在 Production 环境正确配置。

## 结论

- 避免模块顶层抛错与顶层创建客户端，可显著降低初始化白屏风险；
- `service_role_key` 不再进入客户端 Bundle，符合安全最佳实践；
- 与 Next.js 15 App Router、RSC/CSR 的运行模型相容性更好。
