"use client";

/**
 * OAuth 回调处理页面
 * 
 * 功能：
 * - 处理 Microsoft OAuth 和 Google OAuth 的回调重定向
 * - 从 URL 查询参数中提取授权码（code）
 * - 使用 Supabase Auth 交换授权码获取会话
 * - 成功后重定向到首页
 * - 失败时显示错误并自动返回登录页
 * 
 * 流程：
 * 1. OAuth 提供商重定向到此页面，URL 包含 code 参数
 * 2. 提取 code 并调用 exchangeCodeForSession
 * 3. 成功：跳转到首页
 * 4. 失败：显示错误，3 秒后返回登录页
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabase();

  // ============================================================
  // 状态管理
  // ============================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  // ============================================================
  // OAuth 回调处理
  // ============================================================

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // 1. 从 URL 获取授权码
        const code = searchParams.get("code");

        if (!code) {
          throw new Error("未找到授权码，请重新登录");
        }

        console.log("Processing OAuth callback with code:", code.substring(0, 10) + "...");

        // 2. 交换授权码获取会话
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          throw exchangeError;
        }

        if (!data.session) {
          throw new Error("无法创建会话，请重新登录");
        }

        console.log("OAuth login successful:", data.user?.email);

        // 3. 成功：重定向到首页
        setLoading(false);
        router.push("/");
      } catch (err) {
        // 4. 失败：显示错误并启动倒计时
        console.error("OAuth callback error:", err);
        
        const errorMessage = err instanceof Error ? err.message : "登录验证失败";
        setError(errorMessage);
        setLoading(false);

        // 启动倒计时重定向
        startCountdown();
      }
    };

    handleOAuthCallback();
  }, [searchParams, supabase, router, startCountdown]);

  // ============================================================
  // 倒计时重定向
  // ============================================================

  const startCountdown = useCallback(() => {
    let count = 3;
    setCountdown(count);

    const timer = setInterval(() => {
      count -= 1;
      setCountdown(count);

      if (count <= 0) {
        clearInterval(timer);
        router.push("/login");
      }
    }, 1000);

    // 清理定时器
    return () => clearInterval(timer);
  }, [router]);

  // ============================================================
  // 渲染
  // ============================================================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          {/* Logo 和品牌 */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">M</span>
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold">
            {loading ? "验证登录" : error ? "登录失败" : "登录成功"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 加载状态 */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-gray-600 text-center">
                正在验证登录...
              </p>
              <p className="text-sm text-gray-500 text-center">
                请稍候，我们正在处理您的登录请求
              </p>
            </div>
          )}

          {/* 错误状态 */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-gray-900 font-medium">登录验证失败</p>
                <p className="text-sm text-gray-600">{error}</p>
              </div>

              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center w-full">
                {countdown} 秒后自动返回登录页...
              </div>

              <button
                onClick={() => router.push("/login")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
              >
                立即返回登录页
              </button>
            </div>
          )}

          {/* 成功状态（可选，通常会立即跳转） */}
          {!loading && !error && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-gray-900 font-medium">登录成功！</p>
                <p className="text-sm text-gray-600">正在跳转到首页...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

