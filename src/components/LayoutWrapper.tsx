"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ReactNode } from "react";

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFDATracker = pathname.startsWith("/fda-tracker");
  const isRegulatoryCompass = pathname.startsWith("/regulatory-compass");
  const isFDAGuidance = pathname.startsWith("/fda-guidance");

  if (isFDATracker || isRegulatoryCompass || isFDAGuidance) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-sky-100/50 via-purple-100/30 to-pink-100/40">
      <Sidebar />
      <main className="flex-1 overflow-auto lg:ml-0 w-full">
        {children}
      </main>
    </div>
  );
}
