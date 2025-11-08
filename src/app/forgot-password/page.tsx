"use client";

/**
 * 忘记密码页面
 * 
 * 功能：
 * - 用户输入邮箱地址
 * - 调用 resetPassword(email) 发送密码重置邮件
 * - 显示成功提示："请检查您的邮箱并点击重置链接"
 * - 与登录/注册页面保持一致的设计风格
 * 
 * 表单验证规则：
 * - Email：必填，有效的邮箱格式
 */

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPasswordPage() {
  const { resetPassword, error, clearError } = useAuth();

  // ============================================================
  // 表单状态管理
  // ============================================================

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // ============================================================
  // 表单验证
  // ============================================================

  const validateForm = (): boolean => {
    clearError();
    setFormError(null);

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

    return true;
  };

  // ============================================================
  // 发送密码重置邮件
  // ============================================================

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      // 调用 AuthContext 的 resetPassword 方法
      await resetPassword(email);
      // 发送成功
      setIsSuccess(true);
    } catch (err) {
      console.error("Reset password failed:", err);
      // 错误已由 AuthContext 处理，这里不需要额外操作
    } finally {
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

          <CardTitle className="text-2xl font-bold">
            {isSuccess ? "邮件已发送" : "重置密码"}
          </CardTitle>
          <CardDescription className="text-base">
            {isSuccess
              ? "请检查您的邮箱并点击重置链接"
              : "输入您的邮箱地址，我们将发送密码重置链接"}
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
                密码重置邮件已发送到：
              </p>
              <p className="text-gray-900 font-medium text-center mb-4">
                {email}
              </p>
              <p className="text-sm text-gray-500 text-center mb-6">
                请检查您的邮箱（包括垃圾邮件文件夹），并点击邮件中的链接重置密码。
              </p>
              <div className="space-y-2 w-full">
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    返回登录页
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                >
                  重新发送
                </Button>
              </div>
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
              <form onSubmit={handleResetPassword} className="space-y-4">
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
                      autoFocus
                    />
                  </div>
                </div>

                {/* 发送重置邮件按钮 */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      发送中...
                    </>
                  ) : (
                    "发送重置邮件"
                  )}
                </Button>
              </form>

              {/* 返回登录链接 */}
              <div className="text-center text-sm text-gray-600">
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline inline-flex items-center">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  返回登录页
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

