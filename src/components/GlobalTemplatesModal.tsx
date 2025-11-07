/**
 * 全局模板库模态对话框组件
 * 
 * 功能：
 * - 展示200+监管提交模板
 * - 支持搜索、分类筛选、国家筛选
 * - 精选模板展示
 * - 模板下载功能
 * 
 * 包含5处关键修正：
 * 1. 国家选项包含国旗emoji
 * 2. 使用completeness字段显示完成度
 * 3. 卡片使用黄色背景和边框
 * 4. 标题左侧有紫色图标
 * 5. 元数据使用emoji显示
 */

"use client";

import * as React from "react";
import { Search, FileText, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MOCK_TEMPLATES,
  CATEGORIES,
  COUNTRIES,
  filterTemplates,
} from "@/lib/templates-data";
import type { Category, Country, Template } from "@/types/template";

/**
 * GlobalTemplatesModal 组件属性
 */
interface GlobalTemplatesModalProps {
  /** 对话框是否打开 */
  open: boolean;
  /** 对话框打开/关闭状态变化回调 */
  onOpenChange: (open: boolean) => void;
}

/**
 * 全局模板库模态对话框组件
 * 
 * @param open - 对话框是否打开
 * @param onOpenChange - 对话框状态变化回调
 */
export function GlobalTemplatesModal({
  open,
  onOpenChange,
}: GlobalTemplatesModalProps) {
  // 状态管理
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] =
    React.useState<Category>("All Categories");
  const [selectedCountry, setSelectedCountry] =
    React.useState<Country>("All Countries");

  // 筛选模板
  const filteredTemplates = React.useMemo(() => {
    return filterTemplates(
      MOCK_TEMPLATES,
      searchQuery,
      selectedCategory,
      selectedCountry
    );
  }, [searchQuery, selectedCategory, selectedCountry]);

  // 仅显示精选模板
  const featuredTemplates = filteredTemplates.filter((t) => t.isFeatured);

  /**
   * 处理模板下载
   * @param template - 要下载的模板
   */
  const handleDownload = (template: Template) => {
    // TODO: 实现真实的下载逻辑
    // 目前显示提示信息
    alert(`下载模板: ${template.name}\n格式: ${template.format}\n完成度: ${template.completeness}%`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* 头部 - 包含紫色图标（关键修正4） */}
        <DialogHeader>
          <div className="flex items-start gap-3">
            {/* 紫色圆形图标 */}
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">
                Global Templates Library
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                Access official submission templates from 50 major regulatory
                authorities worldwide
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 搜索和筛选区域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* 搜索框 - 浅绿色背景 */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-green-50 border-green-200 focus:border-green-300 focus:ring-green-300"
            />
          </div>

          {/* 分类筛选器 - 浅绿色背景 */}
          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value as Category)}
          >
            <SelectTrigger className="bg-green-50 border-green-200 focus:border-green-300 focus:ring-green-300">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 国家筛选器 - 浅绿色背景，包含国旗emoji（关键修正1） */}
          <Select
            value={selectedCountry}
            onValueChange={(value) => setSelectedCountry(value as Country)}
          >
            <SelectTrigger className="bg-green-50 border-green-200 focus:border-green-300 focus:ring-green-300">
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 精选模板区域 */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>⭐</span>
            <span>Featured Templates</span>
          </h3>

          {/* 模板网格 - 3列布局 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTemplates.length > 0 ? (
              featuredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onDownload={handleDownload}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <p>No templates found matching your criteria.</p>
                <p className="text-sm mt-2">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            <strong>Global Templates Library:</strong> Official submission
            templates from 50 major regulatory authorities. All templates are
            sourced directly from official regulatory body websites and updated
            regularly.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 模板卡片组件属性
 */
interface TemplateCardProps {
  /** 模板数据 */
  template: Template;
  /** 下载回调 */
  onDownload: (template: Template) => void;
}

/**
 * 模板卡片组件
 * 展示单个模板的详细信息
 * 
 * 包含关键修正：
 * - 黄色背景和边框（关键修正3）
 * - 使用completeness字段（关键修正2）
 * - 元数据使用emoji（关键修正5）
 */
function TemplateCard({ template, onDownload }: TemplateCardProps) {
  return (
    <div className="bg-yellow-50/50 border border-yellow-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300">
      {/* 卡片头部：国家标识和Official标签 */}
      <div className="flex items-start justify-between mb-3">
        {/* 国家标识徽章 */}
        <div className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
          {template.countryCode}
        </div>
        {/* Official标签 */}
        {template.isOfficial && (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-700 border-green-300 text-xs"
          >
            ✓ Official
          </Badge>
        )}
      </div>

      {/* 模板标题 */}
      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
        {template.name}
      </h4>

      {/* 监管机构 */}
      <p className="text-xs text-gray-600 mb-2">{template.authority}</p>

      {/* 模板描述 */}
      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
        {template.description}
      </p>

      {/* 元数据行 - 使用emoji（关键修正5） */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
        <span>📅 {template.date}</span>
        <span>📄 {template.completeness}%</span>
        <span>{template.format}</span>
      </div>

      {/* 下载按钮 - 紫粉渐变 */}
      <Button
        onClick={() => onDownload(template)}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
      >
        <Download className="w-4 h-4 mr-2" />
        Download Template
      </Button>
    </div>
  );
}

