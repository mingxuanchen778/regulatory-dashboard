"use client";

/**
 * 邮箱验证和密码重置确认页面
 *
 * 功能：
 * - 处理邮箱验证回调（type=email）
 * - 处理密码重置回调（type=recovery）
 * - 从 URL 提取 token_hash 和 type 参数
 * - 调用 supabase.auth.verifyOtp() 验证
 * - 验证成功后根据类型重定向：
 *   - email: 重定向到首页
 *   - recovery: 重定向到密码重置页面
 * - 验证失败时显示错误信息
 */

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import type { EmailOtpType } from "@supabase/supabase-js";

type VerificationStatus = "loading" | "success" | "error";

function ConfirmPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabase();

  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [verificationType, setVerificationType] = useState<string>("");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // 从 URL 提取参数
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type") as EmailOtpType | null;
        const next = searchParams.get("next") || "/";

        console.log("Verification params:", { token_hash, type, next });

        // 验证参数是否存在
        if (!token_hash || !type) {
          setStatus("error");
          setErrorMessage("验证链接无效或已过期");
          return;
        }

        setVerificationType(type);

        // 调用 Supabase verifyOtp 方法
        const { error } = await supabase.auth.verifyOtp({
          type,
          token_hash,
        });

        if (error) {
          console.error("Verification error:", error);
          setStatus("error");

          // 根据错误类型提供友好的错误消息
          if (error.message.includes("expired")) {
            setErrorMessage("验证链接已过期，请重新发送验证邮件");
          } else if (error.message.includes("invalid")) {
            setErrorMessage("验证链接无效，请检查邮件中的链接");
          } else {
            setErrorMessage(error.message || "验证失败，请稍后再试");
          }
          return;
        }

        // 验证成功
        setStatus("success");
        console.log("Verification successful, type:", type);

        // 根据验证类型重定向
        setTimeout(() => {
          if (type === "recovery") {
            // 密码重置：重定向到密码重置页面
            router.push("/reset-password");
          } else if (type === "email") {
            // 邮箱验证：重定向到首页或指定页面
            router.push(next);
          } else {
            // 其他类型：重定向到首页
            router.push("/");
          }
        }, 2000);
      } catch (err) {
        console.error("Unexpected error during verification:", err);
        setStatus("error");
        setErrorMessage("发生意外错误，请稍后再试");
      }
    };

    verifyToken();
  }, [searchParams, supabase, router]);

  // ============================================================
  // 渲染不同的状态
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
            {status === "loading" && "正在验证..."}
            {status === "success" && "验证成功"}
            {status === "error" && "验证失败"}
          </CardTitle>

          <CardDescription className="text-base">
            {status === "loading" && "请稍候，我们正在验证您的信息"}
            {status === "success" && verificationType === "email" && "您的邮箱已成功验证"}
            {status === "success" && verificationType === "recovery" && "正在跳转到密码重置页面"}
            {status === "error" && "验证过程中出现问题"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 加载状态 */}
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 text-center">
                正在验证您的信息，请稍候...
              </p>
            </div>
          )}

          {/* 成功状态 */}
          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-gray-600 text-center mb-2">
                {verificationType === "email" && "您的邮箱已成功验证！"}
                {verificationType === "recovery" && "验证成功！正在跳转..."}
              </p>
              <p className="text-sm text-gray-500 text-center">
                {verificationType === "email" && "正在跳转到首页..."}
                {verificationType === "recovery" && "请在下一页设置新密码"}
              </p>
            </div>
          )}

          {/* 错误状态 */}
          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <p className="text-red-600 text-center mb-4 font-medium">
                {errorMessage}
              </p>
              <div className="space-y-2 w-full">
                <button
                  onClick={() => router.push("/login")}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  返回登录页
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  重新注册
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



export default function ConfirmPage() {
  return (
    <Suspense fallback={<div>正在验证...</div>}>
      <ConfirmPageInner />
    </Suspense>
  );
}
