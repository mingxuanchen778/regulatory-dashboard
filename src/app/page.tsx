"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Bookmark, Compass, BookOpen, FileCheck, MessageSquare, TrendingUp, Bell, Upload } from "lucide-react";
import { useDocuments } from "@/contexts/DocumentContext";
import { useRef, useState } from "react";
import { GlobalTemplatesModal } from "@/components/GlobalTemplatesModal";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { documents, addDocument } = useDocuments();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取认证状态和用户信息
  const { user, loading } = useAuth();

  // 计算显示名称：优先使用 full_name，其次使用 email 前缀，最后使用 "用户"
  const displayName = user?.user_metadata?.full_name ||
                      user?.email?.split('@')[0] ||
                      "用户";

  // 全局模板库模态对话框状态
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => addDocument(file));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
      />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header - 动态显示用户欢迎语 */}
        <div className="mb-6 lg:mb-8">
          {loading ? (
            // 加载状态：显示占位符动画
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome back, <span className="inline-block w-20 h-7 bg-gray-300 rounded animate-pulse align-middle"></span>
            </h1>
          ) : (
            // 已加载：显示真实用户名
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {displayName}
            </h1>
          )}
          <p className="text-sm sm:text-base text-gray-600">Your regulatory compliance dashboard - Navigate with confidence</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6">
          <Card className="border-green-200 bg-green-50/50 transition-all hover:shadow-lg hover:scale-[1.02] duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">{documents.length}</div>
                  <div className="text-sm font-medium text-gray-700">Documents</div>
                  <div className="text-xs text-gray-500">Regulatory documents uploaded</div>
                </div>
                <button
                  onClick={handleUploadClick}
                  className="text-xs text-green-700 hover:underline flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  Upload Document
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50 transition-all hover:shadow-lg hover:scale-[1.02] duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                    <Bookmark className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">0</div>
                  <div className="text-sm font-medium text-gray-700">Bookmarked</div>
                  <div className="text-xs text-gray-500">Saved regulatory searches</div>
                </div>
                <a href="/bookmarks" className="text-xs text-purple-700 hover:underline">View Bookmarks</a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <Card className="border-purple-200 bg-purple-50/30 transition-all hover:shadow-lg hover:scale-[1.02] duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">Regulatory Compass</CardTitle>
              <CardDescription className="text-sm">
                End-to-end regulatory strategy for devices, drugs, and biologics across 50 global markets with AI-powered gap analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge variant="outline" className="text-purple-700 border-purple-300 text-xs">🧭 COMPREHENSIVE STRATEGY</Badge>
                <a href="/regulatory-compass" className="text-sm text-purple-700 hover:underline">Start Strategy</a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/30 transition-all hover:shadow-lg hover:scale-[1.02] duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">FDA Guidance Library</CardTitle>
              <CardDescription className="text-sm">
                Complete FDA guidance library with direct links to all drug and device guidance documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge variant="outline" className="text-blue-700 border-blue-300 text-xs">📚 ALL FDA GUIDANCE</Badge>
                <a href="/fda-guidance" className="text-sm text-blue-700 hover:underline">Search FDA</a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/30 transition-all hover:shadow-lg hover:scale-[1.02] duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-3">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">Global Templates</CardTitle>
              <CardDescription className="text-sm">
                200+ regulatory submission templates for all 50 markets with smart auto-fill and compliance validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge variant="outline" className="text-green-700 border-green-300 text-xs">📄 200+ TEMPLATES</Badge>
                <button
                  onClick={() => setIsTemplatesModalOpen(true)}
                  className="text-sm text-green-700 hover:underline"
                >
                  Browse Templates
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/30 transition-all hover:shadow-lg hover:scale-[1.02] duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">FDA Tracker</CardTitle>
              <CardDescription className="text-sm">
                Track FDA inspections, Form 483s, and warning letters across six critical quality systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge variant="outline" className="text-orange-700 border-orange-300 text-xs">📊 LIVE DATA</Badge>
                <a href="/fda-tracker" className="text-sm text-orange-700 hover:underline">View Tracker</a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Discussion Board */}
          <Card className="transition-all hover:shadow-lg duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <CardTitle className="text-lg">Discussion Board</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 lg:py-12">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Start a Discussion</h3>
                <p className="text-sm text-gray-600 mb-4">Be the first to start a regulatory discussion thread</p>
                <Button className="bg-purple-600 hover:bg-purple-700">Create New Thread</Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="transition-all hover:shadow-lg duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 lg:py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Ready to explore?</h3>
                <p className="text-sm text-gray-600 mb-4">Start by searching regulatory intelligence or uploading documents</p>
                <Button className="bg-blue-600 hover:bg-blue-700">Start Global Search</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regulatory Updates */}
        <Card className="mt-6 transition-all hover:shadow-lg duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                <CardTitle className="text-lg">Regulatory Updates</CardTitle>
              </div>
              <a href="/alerts" className="text-sm text-blue-600 hover:underline">View All</a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                    <h4 className="font-semibold text-gray-900">FDA 510(k) GAMP Framework Updated</h4>
                    <Badge className="bg-red-500 flex-shrink-0">NEW</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">New premarket submission requirements for AI-enabled medical devices with enhanced cybersecurity provisions</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900">EMA Digital Health Technology Guidance</h4>
                  <p className="text-sm text-gray-600 mb-2">European Medicines Agency published comprehensive guidance on digital health technologies</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900">ISO 13485 Clinical Investigation Amendment</h4>
                  <p className="text-sm text-gray-600 mb-2">Updated clinical investigation requirements for medical devices - Amendment 7 2024 published</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 全局模板库模态对话框 */}
      <GlobalTemplatesModal
        open={isTemplatesModalOpen}
        onOpenChange={setIsTemplatesModalOpen}
      />
    </div>
  );
}
