import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { DocumentProvider } from "@/contexts/DocumentContext";
import { BookmarkProvider } from "@/contexts/BookmarkContext";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "mycq.ai - Regulatory Intelligence",
  description: "AI-powered regulatory compliance platform for FDA and global markets",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning className="antialiased">
        <ClientBody>
          {/* AuthProvider: 提供全局认证状态和方法 */}
          <AuthProvider>
            <DocumentProvider>
              <BookmarkProvider>
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </BookmarkProvider>
            </DocumentProvider>
          </AuthProvider>
        </ClientBody>
      </body>
    </html>
  );
}
