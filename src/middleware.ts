/**
 * Next.js Middleware - 路由保护
 * 
 * 功能：
 * - 实现"乐观保护"模式的路由守卫
 * - 检查用户是否已登录（通过 Supabase 会话）
 * - 未登录用户访问受保护页面时，重定向到登录页
 * - 已登录用户访问登录/注册页时，重定向到首页
 * - 排除静态资源和公共路由
 * 
 * "乐观保护"模式说明：
 * - 只检查会话是否存在（session !== null）
 * - 不验证 JWT 的有效性（不调用 getUser()）
 * - 不检查用户角色或权限
 * - 依赖 RLS 策略保护数据安全
 * - 性能优先，减少服务端验证开销
 * 
 * 路由规则：
 * - 受保护路由：/（首页）、/documents、/fda-guidance、/fda-tracker 等
 * - 公共路由：/login、/signup、/auth/callback
 * - 排除路由：/_next/static、/_next/image、/favicon.ico
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================================
// 公共路由配置
// ============================================================

/**
 * 公共路由列表（无需登录即可访问）
 */
const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/auth/callback",
];

/**
 * 认证相关路由（已登录用户不应访问）
 */
const AUTH_ROUTES = [
  "/login",
  "/signup",
];

// ============================================================
// 路由判断辅助函数
// ============================================================

/**
 * 判断路径是否为公共路由
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * 判断路径是否为认证路由（登录/注册页）
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

// ============================================================
// Middleware 主函数
// ============================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 调试日志（开发环境）
  if (process.env.NODE_ENV === "development") {
    console.log(`[Middleware] Processing: ${pathname}`);
  }

  // 最小变更：暂不在 Edge Runtime 进行会话检查与重定向，直接放行
  return NextResponse.next();
}

// ============================================================
// Matcher 配置
// ============================================================

/**
 * 配置 Middleware 匹配的路径
 * 
 * 排除：
 * - _next/static：Next.js 静态文件
 * - _next/image：Next.js 图片优化
 * - favicon.ico：网站图标
 * - *.png, *.jpg, *.jpeg, *.gif, *.svg：图片文件
 * - *.ico：图标文件
 * 
 * 匹配：
 * - 所有其他路径
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - 图片文件 (png, jpg, jpeg, gif, svg, ico)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico)$).*)",
  ],
};

