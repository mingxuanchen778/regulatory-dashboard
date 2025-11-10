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

    // Provide friendly error messages based on error type
    if ('status' in error) {
      switch (error.status) {
        case 400:
          setError("Invalid request, please check your input");
          break;
        case 401:
          setError("Invalid email or password");
          break;
        case 422:
          setError("Invalid email format");
          break;
        case 429:
          setError("Too many requests, please try again later");
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
      handleAuthError(err as AuthError, "Sign in failed");
      throw err; // Re-throw error so caller can handle it
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

      // OAuth will redirect to Microsoft login page
      console.log("Redirecting to Microsoft OAuth...");
    } catch (err) {
      handleAuthError(err as AuthError, "Microsoft sign in failed");
      setLoading(false);
      throw err;
    }
  }, [supabase]);

  // ============================================================
  // Google OAuth Sign In
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

      // OAuth will redirect to Google login page
      console.log("Redirecting to Google OAuth...");
    } catch (err) {
      handleAuthError(err as AuthError, "Google sign in failed");
      setLoading(false);
      throw err;
    }
  }, [supabase]);

  // ============================================================
  // Email Sign Up
  // ============================================================

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Redirect to /auth/confirm page after email verification
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            full_name: fullName || email.split('@')[0], // Default to email prefix as nickname
          },
        },
      });

      if (signUpError) throw signUpError;

      // If email confirmation is enabled, prompt user to check email
      if (data.user && !data.session) {
        setError("Sign up successful! Please check your email to complete verification.");
      }

      console.log("Sign up successful:", data.user?.email);
    } catch (err) {
      handleAuthError(err as AuthError, "Sign up failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // ============================================================
  // Sign Out
  // ============================================================

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) throw signOutError;

      // Clear local state
      setUser(null);
      setSession(null);

      console.log("Sign out successful");
    } catch (err) {
      handleAuthError(err as AuthError, "Sign out failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // ============================================================
  // Password Reset - Send Reset Email
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
      handleAuthError(err as AuthError, "Failed to send password reset email");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // ============================================================
  // Update Password
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
      handleAuthError(err as AuthError, "Failed to update password");
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

