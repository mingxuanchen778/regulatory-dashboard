"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Trash2, Download } from "lucide-react";
import { useDocuments } from "@/contexts/DocumentContext";
import { useRef } from "react";

export default function DocumentsPage() {
  const { documents, addDocument, deleteDocument, downloadDocument, loading, error } = useDocuments();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        try {
          await addDocument(file);
        } catch (err) {
          console.error("Failed to upload file:", file.name, err);
        }
      }
    }
    // 重置 input，允许重复上传同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = async (doc: typeof documents[0]) => {
    try {
      await downloadDocument(doc);
    } catch (err) {
      console.error("Failed to download file:", doc.name, err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
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
        {/* Header */}
        <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Documents</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your regulatory documents</p>
          </div>
          <Button
            onClick={handleUploadClick}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Documents
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="transition-all hover:shadow-lg duration-300">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-gray-900 mb-1">{documents.length}</div>
              <div className="text-sm text-gray-600">Total Documents</div>
            </CardContent>
          </Card>
          <Card className="transition-all hover:shadow-lg duration-300">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {(documents.reduce((acc, doc) => acc + doc.file_size, 0) / (1024 * 1024)).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Size (MB)</div>
            </CardContent>
          </Card>
          <Card className="transition-all hover:shadow-lg duration-300">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {documents.length > 0 ? new Date(Math.max(...documents.map(d => new Date(d.upload_date).getTime()))).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Last Upload</div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <Card className="transition-all hover:shadow-lg duration-300">
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">No documents yet</h3>
                <p className="text-sm text-gray-600 mb-4">Upload your first regulatory document to get started</p>
                <Button onClick={handleUploadClick} className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Loading documents...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>•</span>
                          <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
                          {doc.file_type && (
                            <>
                              <span>•</span>
                              <span>{doc.file_type.split('/').pop()?.toUpperCase()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-blue-600"
                        onClick={() => handleDownload(doc)}
                        disabled={loading}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-red-600"
                        onClick={() => deleteDocument(doc.id)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
