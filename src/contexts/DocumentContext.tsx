"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";

export interface Document {
  id: number;
  name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  upload_date: string;
  category?: string;
  tags?: string[];
  content_text?: string;
}

interface DocumentContextType {
  documents: Document[];
  addDocument: (file: File) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabase();


  // 从 Supabase 加载文档列表
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .order('upload_date', { ascending: false });

      if (fetchError) throw fetchError;

      setDocuments(data || []);
    } catch (err) {
      console.error("Failed to load documents:", err);
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const addDocument = async (file: File) => {
    try {
      setLoading(true);
      setError(null);

      // 1. 生成唯一的文件路径
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `documents/${fileName}`;

      // 2. 上传文件到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 3. 在数据库中创建文档记录
      const { data, error: dbError } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type || 'application/octet-stream',
        })
        .select()
        .single();

      if (dbError) {
        // 如果数据库插入失败，删除已上传的文件
        await supabase.storage.from('documents').remove([filePath]);
        throw dbError;
      }

      // 4. 更新本地状态
      setDocuments((prev) => [data, ...prev]);

      // 5. 触发后台文本提取（可选，暂时注释）
      // triggerTextExtraction(data.id, filePath);

    } catch (err) {
      console.error("Failed to add document:", err);
      setError(err instanceof Error ? err.message : "Failed to add document");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      // 1. 获取文档信息
      const doc = documents.find(d => d.id === id);
      if (!doc) throw new Error("Document not found");

      // 2. 从 Storage 删除文件
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.file_path]);

      if (storageError) {
        console.warn("Failed to delete file from storage:", storageError);
        // 继续删除数据库记录，即使文件删除失败
      }

      // 3. 从数据库删除记录
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // 4. 更新本地状态
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));

    } catch (err) {
      console.error("Failed to delete document:", err);
      setError(err instanceof Error ? err.message : "Failed to delete document");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DocumentContext.Provider value={{ documents, addDocument, deleteDocument, loading, error }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentProvider");
  }
  return context;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}
