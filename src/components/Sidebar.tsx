"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, Bookmark, Bell, MessageSquare, Menu, X, Activity, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type NavigationItem = {
  name: string;
  href: string;
  icon: string | LucideIcon;
  isEmoji: boolean;
};

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 获取认证状态和用户信息
  const { user, loading, signOut } = useAuth();

  // 计算显示名称：优先使用 full_name，其次使用 email 前缀，最后使用 "用户"
  const displayName = user?.user_metadata?.full_name ||
                      user?.email?.split('@')[0] ||
                      "用户";

  // 处理登出
  const handleSignOut = async () => {
    try {
      await signOut();
      // 登出成功后，middleware 会自动重定向到登录页
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const navigation: NavigationItem[] = [
    { name: "Dashboard", href: "/", icon: "📊", isEmoji: true },
    { name: "Documents", href: "/documents", icon: FileText, isEmoji: false },
    { name: "Bookmarks", href: "/bookmarks", icon: Bookmark, isEmoji: false },
    { name: "Alerts", href: "/alerts", icon: Bell, isEmoji: false },
    { name: "Contact Us", href: "/contact", icon: MessageSquare, isEmoji: false },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Logo图标 - 医疗心电图风格 */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
              <Activity className="w-6 h-6 text-white" />
            </div>
            {/* 品牌名称 */}
            <div>
              <h1 className="font-bold text-gray-900 text-lg tracking-tight">mycq.ai</h1>
              <p className="text-xs text-blue-600 font-medium">Regulatory Intelligence</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {item.isEmoji ? (
                      <div className="w-5 h-5 flex items-center justify-center text-lg">
                        {item.icon as string}
                      </div>
                    ) : (
                      React.createElement(item.icon as LucideIcon, { className: "w-5 h-5" })
                    )}
                    <span className={isActive ? "font-medium" : ""}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 用户信息和登出区域 */}
        <div className="p-4 border-t border-gray-200">
          {loading ? (
            // 加载状态：显示骨架屏
            <div className="space-y-3">
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-20 bg-gray-300 rounded"></div>
                  <div className="h-3 w-32 bg-gray-300 rounded"></div>
                </div>
              </div>
              <div className="h-9 w-full bg-gray-300 rounded animate-pulse"></div>
            </div>
          ) : user ? (
            // 已登录：显示真实用户信息
            <>
              <div className="flex items-center gap-3 mb-3">
                {/* 用户头像：优先显示真实头像，否则显示首字母占位符 */}
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="User avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* 用户名称和邮箱 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email || ""}
                  </p>
                </div>
              </div>

              {/* 登出按钮 */}
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </>
          ) : (
            // 未登录：显示登录和注册按钮
            <div className="space-y-2">
              <Link href="/login" className="block">
                <Button variant="default" className="w-full text-sm">
                  登录
                </Button>
              </Link>
              <Link href="/signup" className="block">
                <Button variant="outline" className="w-full text-sm">
                  注册
                </Button>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
