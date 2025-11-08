"use client";

/**
 * 登录页面
 * 
 * 功能：
 * - 支持三种登录方式：Email/Password、Microsoft OAuth、Google OAuth
 * - 表单验证（邮箱格式、密码长度）
 * - 错误提示和加载状态
 * - 登录成功后重定向到首页
 * 
 * 用户体验：
 * - 响应式设计（移动端和桌面端）
 * - 美观的 UI（shadcn/ui 组件）
 * - 友好的错误提示
 */

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signInWithMicrosoft, signInWithGoogle, error, clearError } = useAuth();

  // ============================================================
  // 表单状态
  // ============================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ============================================================
  // 表单验证
  // ============================================================

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateForm = (): boolean => {
    if (!email || !password) {
      setFormError("请填写邮箱和密码");
      return false;
    }

    if (!validateEmail(email)) {
      setFormError("邮箱格式不正确");
      return false;
    }

    if (!validatePassword(password)) {
      setFormError("密码至少需要 6 位字符");
      return false;
    }

    setFormError(null);
    return true;
  };

  // ============================================================
  // 邮箱密码登录
  // ============================================================

  const handleEmailLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      await signInWithEmail(email, password);
      
      // 登录成功，重定向到首页
      router.push("/");
    } catch (err) {
      // 错误已在 AuthContext 中处理
      console.error("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // Microsoft OAuth 登录
  // ============================================================

  const handleMicrosoftLogin = async () => {
    try {
      setIsLoading(true);
      clearError();
      await signInWithMicrosoft();
      // OAuth 会自动重定向，不需要手动跳转
    } catch (err) {
      console.error("Microsoft login failed:", err);
      setIsLoading(false);
    }
  };

  // ============================================================
  // Google OAuth 登录
  // ============================================================

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      clearError();
      await signInWithGoogle();
      // OAuth 会自动重定向，不需要手动跳转
    } catch (err) {
      console.error("Google login failed:", err);
      setIsLoading(false);
    }
  };

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
          
          <CardTitle className="text-2xl font-bold">欢迎回到 mycq.ai</CardTitle>
          <CardDescription className="text-base">
            登录您的账户以继续使用 AI 驱动的合规平台
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 错误提示 */}
          {(formError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {formError || error}
            </div>
          )}

          {/* Email/Password 登录表单 */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* 邮箱输入 */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* 忘记密码链接 */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                忘记密码？
              </Link>
            </div>

            {/* 登录按钮 */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  登录中...
                </>
              ) : (
                "登录"
              )}
            </Button>
          </form>

          {/* 分隔线 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">或使用以下方式登录</span>
            </div>
          </div>

          {/* OAuth 登录按钮 */}
          <div className="space-y-3">
            {/* Microsoft 登录 */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleMicrosoftLogin}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23">
                <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              使用 Microsoft 账户登录
            </Button>

            {/* Google 登录 */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              使用 Google 账户登录
            </Button>
          </div>

          {/* 注册链接 */}
          <div className="text-center text-sm text-gray-600">
            还没有账户？{" "}
            <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              立即注册
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

