import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { DocumentProvider } from "@/contexts/DocumentContext";
import { BookmarkProvider } from "@/contexts/BookmarkContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Regulatory Navigator",
  description: "Your regulatory compliance dashboard",
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
          <DocumentProvider>
            <BookmarkProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </BookmarkProvider>
          </DocumentProvider>
        </ClientBody>
      </body>
    </html>
  );
}
