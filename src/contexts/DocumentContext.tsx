"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface Document {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  type: string;
}

interface DocumentContextType {
  documents: Document[];
  addDocument: (file: File) => void;
  deleteDocument: (id: string) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

const STORAGE_KEY = "regulatory-documents";

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);

  // Load documents from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setDocuments(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to load documents:", error);
      }
    }
  }, []);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    if (documents.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    }
  }, [documents]);

  const addDocument = (file: File) => {
    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: formatFileSize(file.size),
      uploadDate: new Date().toISOString(),
      type: file.type || "Unknown",
    };
    setDocuments((prev) => [...prev, newDoc]);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  return (
    <DocumentContext.Provider value={{ documents, addDocument, deleteDocument }}>
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
