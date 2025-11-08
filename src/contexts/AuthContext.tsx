"use client";

/**
 * AuthContext - 用户认证状态管理
 * 
 * 功能：
 * - 管理用户登录/登出状态
 * - 支持三种登录方式：Email/Password、Microsoft OAuth、Google OAuth
 * - 监听认证状态变化（onAuthStateChange）
 * - 提供全局认证状态和方法
 */

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import type { User, Session, AuthError } from "@supabase/supabase-js";

// ============================================================
// 类型定义
// ============================================================

interface AuthContextType {
  // 状态
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;

  // 认证方法
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;

  // 密码重置方法
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;

  // 工具方法
  clearError: () => void;
}

// ============================================================
// Context 创建
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// Provider 组件
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabase();

  // ============================================================
  // 错误处理辅助函数
  // ============================================================

  const handleAuthError = (error: AuthError | Error, defaultMessage: string) => {
    console.error(defaultMessage, error);
    
    // 根据错误类型提供友好的错误消息
    if ('status' in error) {
      switch (error.status) {
        case 400:
          setError("请求无效，请检查输入信息");
          break;
        case 401:
          setError("邮箱或密码错误");
          break;
        case 422:
          setError("邮箱格式不正确");
          break;
        case 429:
          setError("操作过于频繁，请稍后再试");
          break;
        default:
          setError(error.message || defaultMessage);
      }
    } else {
      setError(error.message || defaultMessage);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================
  // 邮箱密码登录
  // ============================================================

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // 状态会通过 onAuthStateChange 自动更新
      console.log("Email sign in successful:", data.user?.email);
    } catch (err) {
      handleAuthError(err as AuthError, "登录失败");
      throw err; // 重新抛出错误，让调用者可以处理
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // ============================================================
  // Microsoft OAuth 登录
  // ============================================================

  const signInWithMicrosoft = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'email profile openid',
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signInError) throw signInError;

      // OAuth 会重定向到 Microsoft 登录页面
      console.log("Redirecting to Microsoft OAuth...");
    } catch (err) {
      handleAuthError(err as AuthError, "Microsoft 登录失败");
      setLoading(false);
      throw err;
    }
  }, [supabase]);

  // ============================================================
  // Google OAuth 登录
  // ============================================================

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signInError) throw signInError;

      // OAuth 会重定向到 Google 登录页面
      console.log("Redirecting to Google OAuth...");
    } catch (err) {
      handleAuthError(err as AuthError, "Google 登录失败");
      setLoading(false);
      throw err;
    }
  }, [supabase]);

  // ============================================================
  // 邮箱注册
  // ============================================================

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // 邮箱验证后重定向到 /auth/confirm 页面
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            full_name: fullName || email.split('@')[0], // 默认使用邮箱前缀作为昵称
          },
        },
      });

      if (signUpError) throw signUpError;

      // 如果启用了邮箱确认，提示用户检查邮箱
      if (data.user && !data.session) {
        setError("注册成功！请检查您的邮箱以完成验证。");
      }

      console.log("Sign up successful:", data.user?.email);
    } catch (err) {
      handleAuthError(err as AuthError, "注册失败");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // ============================================================
  // 登出
  // ============================================================

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) throw signOutError;

      // 清除本地状态
      setUser(null);
      setSession(null);

      console.log("Sign out successful");
    } catch (err) {
      handleAuthError(err as AuthError, "登出失败");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // ============================================================
  // 密码重置 - 发送重置邮件
  // ============================================================

  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      console.log("Password reset email sent to:", email);
    } catch (err) {
      handleAuthError(err as AuthError, "发送密码重置邮件失败");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // ============================================================
  // 更新密码
  // ============================================================

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      console.log("Password updated successfully");
    } catch (err) {
      handleAuthError(err as AuthError, "更新密码失败");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // ============================================================
  // 监听认证状态变化
  // ============================================================

  useEffect(() => {
    // 获取初始会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 清理订阅
    return () => subscription.unsubscribe();
  }, [supabase]);

  // ============================================================
  // Context Value
  // ============================================================

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signInWithEmail,
    signInWithMicrosoft,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================
// Hook
// ============================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

