/**
 * Storage Utilities
 * 
 * 共享的 Supabase Storage 下载工具函数
 * 用于 DocumentContext 和 TemplateContext
 */

import { getSupabase } from '@/lib/supabase';

/**
 * 从 Supabase Storage 下载文件
 * 
 * @param bucket - Storage bucket 名称（如 'documents' 或 'templates'）
 * @param filePath - 文件在 bucket 中的路径
 * @param fileName - 下载时使用的文件名（保留原始文件名，包括中文）
 * @throws {Error} 如果下载失败
 */
export async function downloadFromStorage(
  bucket: string,
  filePath: string,
  fileName: string
): Promise<void> {
  const supabase = getSupabase();

  try {
    // 1. 从 Supabase Storage 下载文件
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (error) {
      console.error(`Failed to download from ${bucket}/${filePath}:`, error);
      throw error;
    }

    if (!data) {
      throw new Error('No data received from storage');
    }

    // 2. 创建 Blob URL
    const url = URL.createObjectURL(data);

    // 3. 创建临时 <a> 标签并触发下载
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName; // 使用原始文件名（保留中文）
    document.body.appendChild(a);
    a.click();

    // 4. 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

/**
 * 获取文件的公共 URL（仅用于 public bucket）
 * 
 * @param bucket - Storage bucket 名称
 * @param filePath - 文件在 bucket 中的路径
 * @returns 文件的公共 URL
 */
export function getPublicUrl(bucket: string, filePath: string): string {
  const supabase = getSupabase();

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * 格式化文件大小
 * 
 * @param bytes - 文件大小（字节）
 * @returns 格式化后的文件大小字符串（如 "2.5 MB"）
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

