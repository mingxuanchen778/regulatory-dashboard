"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, Bookmark, Bell, MessageSquare, Menu, X, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavigationItem = {
  name: string;
  href: string;
  icon: string | LucideIcon;
  isEmoji: boolean;
};

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation: NavigationItem[] = [
    { name: "Dashboard", href: "/", icon: "📊", isEmoji: true },
    { name: "Regulatory Compass", href: "/regulatory-compass", icon: "🧭", isEmoji: true },
    { name: "Documents", href: "/documents", icon: FileText, isEmoji: false },
    { name: "FDA Guidance Library", href: "/fda-guidance", icon: "📚", isEmoji: true },
    { name: "FDA Tracker", href: "/fda-tracker", icon: "📈", isEmoji: true },
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Regulatory</h1>
              <p className="text-sm text-gray-600">Navigator</p>
            </div>
          </div>
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

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Nick Chou</p>
              <p className="text-xs text-gray-500">nick@example.com</p>
            </div>
          </div>
          <Button variant="outline" className="w-full text-sm">
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}
