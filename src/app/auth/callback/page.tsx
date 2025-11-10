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

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabase();

  // ============================================================
  // State Management
  // ============================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  // ============================================================
  // Countdown Redirect
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

    // Clean up timer
    return () => clearInterval(timer);
  }, [router]);

  // ============================================================
  // OAuth Callback Handler
  // ============================================================

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // 详细日志：记录完整的 URL 信息
        const fullUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));

        console.log("=== OAuth Callback Debug Info ===");
        console.log("Full URL:", fullUrl);
        console.log("Search params:", Object.fromEntries(urlParams.entries()));
        console.log("Hash params:", Object.fromEntries(hashParams.entries()));
        console.log("================================");

        // 检查是否是 Implicit Flow（返回 access_token）
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          // Implicit Flow: 直接使用 access_token 和 refresh_token
          console.log("Detected Implicit Flow (access_token found)");
          console.log("Setting session with tokens...");

          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error("Session error:", sessionError);
            throw sessionError;
          }

          if (!data.session) {
            throw new Error("Unable to create session from tokens");
          }

          console.log("OAuth login successful (Implicit Flow):", data.user?.email);

          // Success: redirect to homepage
          setLoading(false);
          router.push("/");
          return;
        }

        // PKCE Flow: 查找 authorization code
        let code = searchParams.get("code");

        // 如果查询参数中没有 code，尝试从 hash fragment 中获取
        if (!code) {
          code = hashParams.get("code");
          console.log("Code from hash:", code ? code.substring(0, 10) + "..." : "null");
        } else {
          console.log("Code from query:", code.substring(0, 10) + "...");
        }

        if (!code) {
          // 既没有 access_token 也没有 code
          const errorDetails = {
            url: fullUrl,
            hasQueryParams: urlParams.toString().length > 0,
            hasHashParams: hashParams.toString().length > 0,
            queryParamKeys: Array.from(urlParams.keys()),
            hashParamKeys: Array.from(hashParams.keys()),
          };

          console.error("Neither authorization code nor access token found. Details:", errorDetails);

          throw new Error(
            "OAuth callback failed: No authorization code or access token found. " +
            "Please try logging in again."
          );
        }

        console.log("Detected PKCE Flow (code found)");
        console.log("Processing OAuth callback with code:", code.substring(0, 10) + "...");

        // PKCE Flow: Exchange authorization code for session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("Exchange error:", exchangeError);
          throw exchangeError;
        }

        if (!data.session) {
          throw new Error("Unable to create session from code");
        }

        console.log("OAuth login successful (PKCE Flow):", data.user?.email);

        // Success: redirect to homepage
        setLoading(false);
        router.push("/");
      } catch (err) {
        // Failure: show error and start countdown
        console.error("OAuth callback error:", err);

        const errorMessage = err instanceof Error ? err.message : "Login verification failed";
        setError(errorMessage);
        setLoading(false);

        // Start countdown redirect
        startCountdown();
      }
    };

    handleOAuthCallback();
  }, [searchParams, supabase, router, startCountdown]);

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          {/* Logo and Brand */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">M</span>
            </div>
          </div>

          <CardTitle className="text-2xl font-bold">
            {loading ? "Verifying Login" : error ? "Login Failed" : "Login Successful"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-gray-600 text-center">
                Verifying login...
              </p>
              <p className="text-sm text-gray-500 text-center">
                Please wait, we are processing your login request
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>

              <div className="text-center space-y-2">
                <p className="text-gray-900 font-medium">Login Verification Failed</p>
                <p className="text-sm text-gray-600">{error}</p>
              </div>

              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center w-full">
                Redirecting to login page in {countdown} seconds...
              </div>

              <button
                onClick={() => router.push("/login")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
              >
                Return to Login Page Now
              </button>
            </div>
          )}

          {/* Success State (optional, usually redirects immediately) */}
          {!loading && !error && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>

              <div className="text-center space-y-2">
                <p className="text-gray-900 font-medium">Login Successful!</p>
                <p className="text-sm text-gray-600">Redirecting to homepage...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">M</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Verifying Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-gray-600 text-center">Verifying login...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
