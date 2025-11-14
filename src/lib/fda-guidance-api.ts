/**
 * FDA Guidance Documents - Supabase API Layer
 * 
 * 提供从Supabase数据库查询FDA指导文档的函数
 */

import { createClient } from '@supabase/supabase-js';
import type { GuidanceDocument } from '@/types/fda-guidance';

// 创建Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 查询参数接口
 */
export interface FetchGuidanceParams {
  page?: number;
  pageSize?: number;
  status?: string;
  organization?: string;
  topics?: string[];
  searchQuery?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

/**
 * 查询结果接口
 */
export interface FetchGuidanceResult {
  data: GuidanceDocument[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 将数据库记录转换为GuidanceDocument格式
 */
function transformDatabaseRecord(record: any): GuidanceDocument {
  // 将ISO日期格式（YYYY-MM-DD）转换为显示格式（YYYY/M/D）
  const formatDateForDisplay = (isoDate: string): string => {
    const date = new Date(isoDate);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 根据status确定icon
  const getIcon = (status: string): "edit" | "file" | "heart" => {
    return status === 'Draft' ? 'edit' : 'file';
  };

  return {
    id: record.id,
    title: record.title,
    description: record.description,
    date: formatDateForDisplay(record.issue_date),
    organization: record.organization,
    size: record.file_size || undefined,
    status: record.status as "Final" | "Draft",
    topics: record.topics || [],
    commentPeriodCloses: record.comment_period_closes 
      ? formatDateForDisplay(record.comment_period_closes) 
      : undefined,
    icon: getIcon(record.status),
    regulatoryPathways: record.regulatory_pathways || undefined,
    deviceClass: record.device_class || undefined,
    url: record.url || undefined
  };
}

/**
 * 查询FDA指导文档列表（支持分页和筛选）
 */
export async function fetchGuidanceDocuments(
  params: FetchGuidanceParams = {}
): Promise<FetchGuidanceResult> {
  const {
    page = 1,
    pageSize = 50,
    status,
    organization,
    topics,
    searchQuery,
    dateRange
  } = params;

  try {
    // 构建查询
    let query = supabase
      .from('fda_guidance_documents')
      .select('*', { count: 'exact' });

    // 状态筛选
    if (status && status !== 'All Statuses') {
      query = query.eq('status', status);
    }

    // 组织筛选
    if (organization && organization !== 'All Organizations') {
      query = query.eq('organization', organization);
    }

    // 主题筛选（数组包含）
    if (topics && topics.length > 0) {
      query = query.contains('topics', topics);
    }

    // 搜索查询（使用全文搜索或ILIKE）
    if (searchQuery && searchQuery.trim()) {
      // 使用PostgreSQL的全文搜索
      query = query.or(
        `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
      );
    }

    // 日期范围筛选
    if (dateRange?.start) {
      query = query.gte('issue_date', dateRange.start);
    }
    if (dateRange?.end) {
      query = query.lte('issue_date', dateRange.end);
    }

    // 排序：按发布日期降序
    query = query.order('issue_date', { ascending: false });

    // 分页
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // 执行查询
    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw new Error(`Failed to fetch guidance documents: ${error.message}`);
    }

    // 转换数据格式
    const documents = (data || []).map(transformDatabaseRecord);

    return {
      data: documents,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  } catch (error) {
    console.error('Error fetching guidance documents:', error);
    throw error;
  }
}

/**
 * 获取所有可用的状态选项
 */
export async function fetchStatusOptions(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('fda_guidance_documents')
      .select('status')
      .order('status');

    if (error) throw error;

    // 去重并添加"All Statuses"选项
    const uniqueStatuses = Array.from(new Set(data?.map(d => d.status) || []));
    return ['All Statuses', ...uniqueStatuses.sort()];
  } catch (error) {
    console.error('Error fetching status options:', error);
    return ['All Statuses', 'Final', 'Draft'];
  }
}

/**
 * 获取所有可用的组织选项
 */
export async function fetchOrganizationOptions(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('fda_guidance_documents')
      .select('organization')
      .order('organization');

    if (error) throw error;

    // 去重并添加"All Organizations"选项
    const uniqueOrgs = Array.from(new Set(data?.map(d => d.organization) || []));
    return ['All Organizations', ...uniqueOrgs.sort()];
  } catch (error) {
    console.error('Error fetching organization options:', error);
    return ['All Organizations'];
  }
}

/**
 * 获取所有可用的主题选项
 */
export async function fetchTopicOptions(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('fda_guidance_documents')
      .select('topics');

    if (error) throw error;

    // 展开所有主题数组并去重
    const allTopics = data?.flatMap(d => d.topics || []) || [];
    const uniqueTopics = Array.from(new Set(allTopics));
    
    return ['All Topics', ...uniqueTopics.sort()];
  } catch (error) {
    console.error('Error fetching topic options:', error);
    return ['All Topics'];
  }
}

/**
 * 获取文档总数统计
 */
export async function fetchDocumentStats(): Promise<{
  total: number;
  final: number;
  draft: number;
}> {
  try {
    const { count: total } = await supabase
      .from('fda_guidance_documents')
      .select('*', { count: 'exact', head: true });

    const { count: final } = await supabase
      .from('fda_guidance_documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Final');

    const { count: draft } = await supabase
      .from('fda_guidance_documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Draft');

    return {
      total: total || 0,
      final: final || 0,
      draft: draft || 0
    };
  } catch (error) {
    console.error('Error fetching document stats:', error);
    return { total: 0, final: 0, draft: 0 };
  }
}

