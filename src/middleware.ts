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
import { getSupabase } from "@/lib/supabase";

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

  try {
    // ============================================================
    // 1. 获取 Supabase 客户端并检查会话
    // ============================================================

    const supabase = getSupabase();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error("[Middleware] Error getting session:", error);
      // 错误时默认允许请求继续，避免阻塞
      return NextResponse.next();
    }

    const isLoggedIn = session !== null;

    // 调试日志
    if (process.env.NODE_ENV === "development") {
      console.log(`[Middleware] User logged in: ${isLoggedIn}`);
    }

    // ============================================================
    // 2. 路由保护逻辑
    // ============================================================

    // 情况 1：已登录用户访问认证页面（登录/注册）→ 重定向到首页
    if (isLoggedIn && isAuthRoute(pathname)) {
      console.log(`[Middleware] Logged in user accessing auth route, redirecting to /`);
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // 情况 2：未登录用户访问受保护路由 → 重定向到登录页
    if (!isLoggedIn && !isPublicRoute(pathname)) {
      console.log(`[Middleware] Unauthenticated user accessing protected route, redirecting to /login`);
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      // 保存原始路径，登录后可以重定向回来（可选）
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // 情况 3：其他情况 → 允许请求继续
    return NextResponse.next();
  } catch (error) {
    // 捕获所有未预期的错误
    console.error("[Middleware] Unexpected error:", error);
    // 错误时默认允许请求继续，避免阻塞
    return NextResponse.next();
  }
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

