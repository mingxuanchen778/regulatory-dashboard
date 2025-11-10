"use client";

/**
 * Password Reset Page
 *
 * Features:
 * - User arrives at this page after clicking reset link in email
 * - Displays form to set new password (Password and Confirm Password)
 * - Calls updatePassword(newPassword) to update password
 * - Redirects to login page after successful password update
 * - Shows success message: "Password has been reset, please sign in with your new password"
 *
 * Form Validation Rules:
 * - Password: Required, at least 6 characters
 * - Confirm Password: Required, must match Password exactly
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
  // Form State Management
  // ============================================================

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // ============================================================
  // Check if User is Authenticated
  // ============================================================

  useEffect(() => {
    // If user is not logged in or has no valid session, redirect to login
    if (!session) {
      console.log("No session found, redirecting to login");
      // Give user some time to see the page, then redirect
      const timer = setTimeout(() => {
        router.push("/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session, router]);

  // ============================================================
  // Form Validation
  // ============================================================

  const validateForm = (): boolean => {
    clearError();
    setFormError(null);

    // Validate password
    if (!password) {
      setFormError("Please enter a new password");
      return false;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setFormError("Please confirm your new password");
      return false;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return false;
    }

    return true;
  };

  // ============================================================
  // Update Password
  // ============================================================

  const handleUpdatePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      // Call AuthContext's updatePassword method
      await updatePassword(password);
      // Update successful
      setIsSuccess(true);
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      console.error("Update password failed:", err);
      // Error is already handled by AuthContext, no additional action needed here
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // Render
  // ============================================================

  // If no session, show message
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
            <CardTitle className="text-2xl font-bold">Invalid Access</CardTitle>
            <CardDescription className="text-base">
              Please access this page through the reset link in your email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-gray-600 text-center mb-4">
                Redirecting to login page...
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
          {/* Logo and Brand */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">M</span>
            </div>
          </div>

          <CardTitle className="text-2xl font-bold">
            {isSuccess ? "Password Reset" : "Set New Password"}
          </CardTitle>
          <CardDescription className="text-base">
            {isSuccess
              ? "Your password has been successfully reset"
              : "Please enter your new password"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Success State */}
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-gray-600 text-center mb-2">
                Password successfully reset!
              </p>
              <p className="text-sm text-gray-500 text-center mb-6">
                Redirecting to login page, please sign in with your new password...
              </p>
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <>
              {/* Error Message */}
              {(formError || error) && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {formError || error}
                </div>
              )}

              {/* Password Reset Form */}
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {/* Password Input */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
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

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter new password"
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

                {/* Reset Password Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>

              {/* Back to Login Link */}
              <div className="text-center text-sm text-gray-600">
                Remember your password?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

