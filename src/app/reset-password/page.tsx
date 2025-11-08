"use client";

/**
 * 密码重置页面
 * 
 * 功能：
 * - 用户从邮件点击重置链接后到达此页面
 * - 显示设置新密码的表单（Password 和 Confirm Password）
 * - 调用 updatePassword(newPassword) 更新密码
 * - 密码更新成功后重定向到登录页
 * - 显示成功提示："密码已重置，请使用新密码登录"
 * 
 * 表单验证规则：
 * - Password：必填，至少 6 位字符
 * - Confirm Password：必填，必须与 Password 完全一致
 */

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword, session, error, clearError } = useAuth();

  // ============================================================
  // 表单状态管理
  // ============================================================

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // ============================================================
  // 检查用户是否已通过验证
  // ============================================================

  useEffect(() => {
    // 如果用户未登录或没有有效会话，重定向到登录页
    if (!session) {
      console.log("No session found, redirecting to login");
      // 给用户一些时间看到页面，然后重定向
      const timer = setTimeout(() => {
        router.push("/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session, router]);

  // ============================================================
  // 表单验证
  // ============================================================

  const validateForm = (): boolean => {
    clearError();
    setFormError(null);

    // 验证密码
    if (!password) {
      setFormError("请输入新密码");
      return false;
    }
    if (password.length < 6) {
      setFormError("密码至少需要 6 位字符");
      return false;
    }

    // 验证确认密码
    if (!confirmPassword) {
      setFormError("请确认新密码");
      return false;
    }
    if (password !== confirmPassword) {
      setFormError("两次输入的密码不一致");
      return false;
    }

    return true;
  };

  // ============================================================
  // 更新密码
  // ============================================================

  const handleUpdatePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      // 调用 AuthContext 的 updatePassword 方法
      await updatePassword(password);
      // 更新成功
      setIsSuccess(true);
      // 3 秒后重定向到登录页
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      console.error("Update password failed:", err);
      // 错误已由 AuthContext 处理，这里不需要额外操作
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // 渲染
  // ============================================================

  // 如果没有会话，显示提示
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">M</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">无效的访问</CardTitle>
            <CardDescription className="text-base">
              请通过邮件中的重置链接访问此页面
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-gray-600 text-center mb-4">
                正在重定向到登录页...
              </p>
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

          <CardTitle className="text-2xl font-bold">
            {isSuccess ? "密码已重置" : "设置新密码"}
          </CardTitle>
          <CardDescription className="text-base">
            {isSuccess
              ? "您的密码已成功重置"
              : "请输入您的新密码"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 成功状态 */}
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-gray-600 text-center mb-2">
                密码已成功重置！
              </p>
              <p className="text-sm text-gray-500 text-center mb-6">
                正在跳转到登录页，请使用新密码登录...
              </p>
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <>
              {/* 错误提示 */}
              {(formError || error) && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {formError || error}
                </div>
              )}

              {/* 密码重置表单 */}
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {/* Password 输入框 */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    新密码
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
                      autoFocus
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
                    确认新密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="再次输入新密码"
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

                {/* 重置密码按钮 */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      更新中...
                    </>
                  ) : (
                    "重置密码"
                  )}
                </Button>
              </form>

              {/* 返回登录链接 */}
              <div className="text-center text-sm text-gray-600">
                记起密码了？{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                  返回登录
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

