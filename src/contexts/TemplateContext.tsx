"use client";

/**
 * Template Context
 * 
 * 全局模板库的状态管理
 * 负责从 Supabase 加载模板数据并提供下载功能
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getSupabase } from '@/lib/supabase';
import { downloadFromStorage } from '@/lib/storage-utils';
import type { Template } from '@/types/template';

/**
 * 数据库模板类型（从 global_templates 表返回的数据）
 */
interface DatabaseTemplate {
  id: number;
  title: string;
  description: string;
  category: string;
  region: string;
  authority: string;
  country: string;
  country_code: string;
  country_flag: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_format: string;
  version: string | null;
  effective_date: string | null;
  last_updated: string | null;
  completeness: number;
  is_official: boolean;
  is_featured: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Context 类型定义
 */
interface TemplateContextType {
  /** 模板列表 */
  templates: Template[];
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 下载模板 */
  downloadTemplate: (template: Template) => Promise<void>;
  /** 重新加载模板列表 */
  refreshTemplates: () => Promise<void>;
}

/**
 * 创建 Context
 */
const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

/**
 * 将数据库模板转换为前端模板格式
 */
function convertDatabaseTemplateToTemplate(dbTemplate: DatabaseTemplate): Template {
  return {
    id: dbTemplate.id.toString(),
    name: dbTemplate.title,
    country: dbTemplate.country,
    countryCode: dbTemplate.country_code,
    countryFlag: dbTemplate.country_flag,
    authority: dbTemplate.authority,
    category: dbTemplate.category as Template['category'],
    description: dbTemplate.description,
    date: dbTemplate.last_updated || dbTemplate.created_at.split('T')[0],
    completeness: dbTemplate.completeness,
    format: dbTemplate.file_format,
    isOfficial: dbTemplate.is_official,
    isFeatured: dbTemplate.is_featured,
    downloadUrl: dbTemplate.file_path, // 使用 file_path 作为 downloadUrl
  };
}

/**
 * Template Provider 组件
 */
export function TemplateProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 从 Supabase 加载模板列表
   */
  const fetchTemplates = async () => {
    const supabase = getSupabase();

    try {
      setLoading(true);
      setError(null);

      // 从 global_templates 表查询所有模板
      const { data, error: fetchError } = await supabase
        .from('global_templates')
        .select('*')
        .order('is_featured', { ascending: false }) // 精选模板优先
        .order('created_at', { ascending: false }); // 然后按创建时间倒序

      if (fetchError) {
        console.error('Failed to fetch templates:', fetchError);
        throw fetchError;
      }

      // 转换数据格式
      const convertedTemplates = (data || []).map(convertDatabaseTemplateToTemplate);
      setTemplates(convertedTemplates);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load templates';
      console.error('Error fetching templates:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 下载模板
   */
  const downloadTemplate = async (template: Template) => {
    const supabase = getSupabase();

    try {
      setLoading(true);
      setError(null);

      // 使用共享的下载工具函数
      await downloadFromStorage(
        'templates',           // bucket 名称
        template.downloadUrl,  // file_path
        template.name + '.' + template.format.toLowerCase() // 文件名
      );

      // 可选：更新下载次数
      const templateId = parseInt(template.id);
      if (!isNaN(templateId)) {
        // 使用 RPC 调用来增加下载次数（需要在数据库中创建函数）
        // 或者先获取当前值再更新
        const { data: currentTemplate } = await supabase
          .from('global_templates')
          .select('download_count')
          .eq('id', templateId)
          .single();

        if (currentTemplate) {
          await supabase
            .from('global_templates')
            .update({ download_count: (currentTemplate.download_count || 0) + 1 })
            .eq('id', templateId);
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download template';
      console.error('Error downloading template:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 重新加载模板列表
   */
  const refreshTemplates = async () => {
    await fetchTemplates();
  };

  /**
   * 组件挂载时加载模板
   */
  useEffect(() => {
    fetchTemplates();
  }, []);

  const value: TemplateContextType = {
    templates,
    loading,
    error,
    downloadTemplate,
    refreshTemplates,
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
}

/**
 * 使用 Template Context 的 Hook
 */
export function useTemplates() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplates must be used within TemplateProvider');
  }
  return context;
}

