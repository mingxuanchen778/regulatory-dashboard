"use client";

/**
 * 用户注册页面
 * 
 * 功能：
 * - 提供三种注册方式：Email/Password、Microsoft OAuth、Google OAuth
 * - Email/Password 注册表单包含 4 个字段：Full Name、Email、Password、Confirm Password
 * - 完整的客户端表单验证
 * - 注册成功后自动登录并重定向到首页
 * - 与登录页面保持一致的设计风格
 * 
 * 表单验证规则：
 * - Full Name：必填，至少 2 个字符
 * - Email：必填，有效的邮箱格式
 * - Password：必填，至少 6 位字符
 * - Confirm Password：必填，必须与 Password 完全一致
 */

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, Loader2, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { signUp, signInWithMicrosoft, signInWithGoogle, error, clearError } = useAuth();

  // ============================================================
  // 表单状态管理
  // ============================================================

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ============================================================
  // 表单验证
  // ============================================================

  const validateForm = (): boolean => {
    clearError();
    setFormError(null);

    // 验证全名
    if (!fullName.trim()) {
      setFormError("请输入您的全名");
      return false;
    }
    if (fullName.trim().length < 2) {
      setFormError("全名至少需要 2 个字符");
      return false;
    }

    // 验证邮箱
    if (!email) {
      setFormError("请输入邮箱地址");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("请输入有效的邮箱地址");
      return false;
    }

    // 验证密码
    if (!password) {
      setFormError("请输入密码");
      return false;
    }
    if (password.length < 6) {
      setFormError("密码至少需要 6 位字符");
      return false;
    }

    // 验证确认密码
    if (!confirmPassword) {
      setFormError("请确认密码");
      return false;
    }
    if (password !== confirmPassword) {
      setFormError("两次输入的密码不一致");
      return false;
    }

    return true;
  };

  // ============================================================
  // Email/Password 注册处理
  // ============================================================

  const handleEmailSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      // 调用 AuthContext 的 signUp 方法，传入 email、password 和 fullName
      await signUp(email, password, fullName);

      // 注册成功提示
      // 注意：如果 Supabase 启用了邮箱验证，用户需要先验证邮箱才能登录
      // AuthContext 会在 error 状态中显示 "注册成功！请检查您的邮箱以完成验证。"
      // 如果没有启用邮箱验证，则会自动登录并重定向到首页

      // 检查是否有 error（实际上是成功提示）
      if (error && error.includes("请检查您的邮箱")) {
        // 邮箱验证已启用，不重定向，让用户看到提示
        console.log("Email verification required");
      } else {
        // 没有启用邮箱验证，自动登录成功，重定向到首页
        router.push("/");
      }
    } catch (err) {
      console.error("Signup failed:", err);
      // 错误已由 AuthContext 处理，这里不需要额外操作
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // Microsoft OAuth 注册处理
  // ============================================================

  const handleMicrosoftSignup = async () => {
    try {
      setIsLoading(true);
      clearError();
      setFormError(null);
      await signInWithMicrosoft();
      // OAuth 会自动重定向，不需要手动跳转
    } catch (err) {
      console.error("Microsoft signup failed:", err);
      setIsLoading(false);
    }
  };

  // ============================================================
  // Google OAuth 注册处理
  // ============================================================

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);
      clearError();
      setFormError(null);
      await signInWithGoogle();
      // OAuth 会自动重定向，不需要手动跳转
    } catch (err) {
      console.error("Google signup failed:", err);
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
          {/* Logo 和品牌标识 */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">M</span>
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold">加入 mycq.ai</CardTitle>
          <CardDescription className="text-base">
            创建您的账户，开始使用 AI 驱动的合规平台
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 错误提示 */}
          {(formError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {formError || error}
            </div>
          )}

          {/* Email/Password 注册表单 */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            {/* Full Name 输入框 */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                全名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="您的全名"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email 输入框 */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password 输入框 */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="至少 6 位字符"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password 输入框 */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                确认密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 注册按钮 */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  注册中...
                </>
              ) : (
                "注册"
              )}
            </Button>
          </form>

          {/* 分隔线 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">或使用以下方式注册</span>
            </div>
          </div>

          {/* OAuth 注册按钮 */}
          <div className="space-y-2">
            {/* Microsoft 注册按钮 */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleMicrosoftSignup}
              disabled={isLoading}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 23 23">
                <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              使用 Microsoft 注册
            </Button>

            {/* Google 注册按钮 */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
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
              使用 Google 注册
            </Button>
          </div>

          {/* 登录链接 */}
          <div className="text-center text-sm text-gray-600">
            已有账户？{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

