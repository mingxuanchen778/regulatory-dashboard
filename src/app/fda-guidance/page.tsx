"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBookmarks } from "@/contexts/BookmarkContext";
import {
  Search,
  Filter,
  FileText,
  Calendar,
  Building2,
  Download,
  ChevronDown,
  ExternalLink,
  Heart,
  Edit,
  AlertCircle,
  Bookmark,
  FileDown,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import type { GuidanceDocument, DateRange } from "@/types/fda-guidance";
import {
  fetchGuidanceDocuments,
  fetchStatusOptions,
  fetchOrganizationOptions,
  fetchTopicOptions,
  type FetchGuidanceParams
} from "@/lib/fda-guidance-api";


export default function FDAGuidancePage() {
  // 搜索状态
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // 筛选状态
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedOrganization, setSelectedOrganization] = useState("All Organizations");
  const [selectedTopic, setSelectedTopic] = useState("All Topics");

  // 日期范围筛选状态
  const [dateRange, setDateRange] = useState<DateRange>({ start: "", end: "" });

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  // 数据状态
  const [documents, setDocuments] = useState<GuidanceDocument[]>([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 筛选选项状态
  const [statusOptions, setStatusOptions] = useState<string[]>(["All Statuses", "Final", "Draft"]);
  const [organizationOptions, setOrganizationOptions] = useState<string[]>(["All Organizations"]);
  const [topicOptions, setTopicOptions] = useState<string[]>(["All Topics"]);

  // UI 状态
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());
  const [previewDoc, setPreviewDoc] = useState<GuidanceDocument | null>(null);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // 书签功能
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  // 日期格式化函数：将 "2025/8/18" 转换为 "Aug 18, 2025"
  const formatDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // 搜索防抖：300ms 延迟
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 加载筛选选项
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [statuses, organizations, topics] = await Promise.all([
          fetchStatusOptions(),
          fetchOrganizationOptions(),
          fetchTopicOptions()
        ]);
        setStatusOptions(statuses);
        setOrganizationOptions(organizations);
        setTopicOptions(topics);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    loadFilterOptions();
  }, []);

  // 加载文档数据
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params: FetchGuidanceParams = {
          page: currentPage,
          pageSize,
          status: selectedStatus !== "All Statuses" ? selectedStatus : undefined,
          organization: selectedOrganization !== "All Organizations" ? selectedOrganization : undefined,
          topics: selectedTopic !== "All Topics" ? [selectedTopic] : undefined,
          searchQuery: debouncedSearchQuery || undefined,
          dateRange: (dateRange.start || dateRange.end) ? {
            start: dateRange.start || undefined,
            end: dateRange.end || undefined
          } : undefined
        };

        const result = await fetchGuidanceDocuments(params);
        setDocuments(result.data);
        setTotalDocuments(result.total);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.error('Failed to load documents:', err);
        setError('Failed to load documents. Please try again.');
        setDocuments([]);
        setTotalDocuments(0);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [currentPage, pageSize, selectedStatus, selectedOrganization, selectedTopic, debouncedSearchQuery, dateRange]);

  // 日期范围快捷选项
  const setDateRangePreset = (preset: string) => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
    let start = "";

    switch(preset) {
      case "30days": {
        const date = new Date(today);
        date.setDate(date.getDate() - 30);
        start = date.toISOString().split('T')[0];
        break;
      }
      case "6months": {
        const date = new Date(today);
        date.setMonth(date.getMonth() - 6);
        start = date.toISOString().split('T')[0];
        break;
      }
      case "1year": {
        const date = new Date(today);
        date.setFullYear(date.getFullYear() - 1);
        start = date.toISOString().split('T')[0];
        break;
      }
      case "all":
        start = "";
        setDateRange({ start: "", end: "" });
        return;
    }

    setDateRange({ start, end });
  };

  // 清除所有筛选
  const clearAllFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setSelectedStatus("All Statuses");
    setSelectedOrganization("All Organizations");
    setSelectedTopic("All Topics");
    setDateRange({ start: "", end: "" });
    setCurrentPage(1); // 重置到第一页
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedDocs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedDocs(newExpanded);
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "edit": return <Edit className="w-5 h-5 text-blue-600" />;
      case "heart": return <Heart className="w-5 h-5 text-pink-600" />;
      default: return <FileText className="w-5 h-5 text-blue-600" />;
    }
  };

  const handleBookmark = (doc: GuidanceDocument) => {
    if (isBookmarked(doc.id)) {
      removeBookmark(doc.id);
    } else {
      addBookmark({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        date: doc.date,
        organization: doc.organization,
        topics: doc.topics,
        bookmarkedAt: new Date().toISOString()
      });
    }
  };

  const exportToCSV = () => {
    const headers = ["Title", "Description", "Date", "Organization", "Size", "Status", "Topics"];
    const rows = documents.map(doc => [
      doc.title,
      doc.description,
      formatDate(doc.date),
      doc.organization,
      doc.size || "N/A",
      doc.status,
      doc.topics.join("; ")
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fda-guidance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Simple PDF export (in production, you'd use a library like jsPDF)
    const printContent = documents.map(doc => `
      ${doc.title}
      ${doc.description}
      Date: ${formatDate(doc.date)} | Organization: ${doc.organization}
      Status: ${doc.status}${doc.size ? ` | Size: ${doc.size}` : ''}
      Topics: ${doc.topics.join(", ")}
      ${doc.commentPeriodCloses ? `Comment period closes: ${formatDate(doc.commentPeriodCloses)}` : ''}
      ---
    `).join("\n\n");

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>FDA Guidance Documents Export</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              h1 { color: #1e40af; }
              pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
            </style>
          </head>
          <body>
            <h1>FDA Guidance Documents</h1>
            <p>Exported on: ${new Date().toLocaleDateString()}</p>
            <p>Total documents: ${documents.length}</p>
            <hr />
            <pre>${printContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50" lang="en-US">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FDA Guidance Library</h1>
              <p className="text-sm text-gray-600">Database across 50 global markets with PubMed, ClinicalTrials.gov and other research databases</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Comprehensive FDA Guidance Documents</h2>
          <p className="text-gray-600">Real-time search across ALL FDA guidance documents for drugs, devices, and biologics</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search FDA guidance documents, topics, or regulations..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button
                variant="outline"
                className="px-4"
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isFiltersExpanded ? 'rotate-180' : ''}`} />
              </Button>
              <Button className="px-6 bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Collapsible Filter Section */}
            {isFiltersExpanded && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                {/* Filter Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => {
                        setSelectedStatus(e.target.value);
                        setCurrentPage(1); // 重置到第一页
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {statusOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">FDA Organization</label>
                    <select
                      value={selectedOrganization}
                      onChange={(e) => {
                        setSelectedOrganization(e.target.value);
                        setCurrentPage(1); // 重置到第一页
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {organizationOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                    <select
                      value={selectedTopic}
                      onChange={(e) => {
                        setSelectedTopic(e.target.value);
                        setCurrentPage(1); // 重置到第一页
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {topicOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="border-t border-gray-200 pt-4" lang="en-US">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>

                  {/* Quick Presets */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDateRangePreset("30days")}
                      className="text-xs"
                    >
                      Last 30 Days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDateRangePreset("6months")}
                      className="text-xs"
                    >
                      Last 6 Months
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDateRangePreset("1year")}
                      className="text-xs"
                    >
                      Last Year
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDateRangePreset("all")}
                      className="text-xs"
                    >
                      All Time
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Clear Filters Button */}
            {(debouncedSearchQuery || selectedStatus !== "All Statuses" || selectedOrganization !== "All Organizations" || selectedTopic !== "All Topics" || dateRange.start || dateRange.end) && (
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-700">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </span>
            ) : (
              <>Found <span className="font-semibold">{totalDocuments}</span> guidance documents</>
            )}
          </p>
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Documents List */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="mt-1">
                      {getIcon(doc.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{doc.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(doc.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {doc.organization}
                        </div>
                        {doc.size && (
                          <div className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {doc.size}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {doc.status === "Final" ? (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            ✓ Final
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                            ○ Draft (Open for Comment)
                          </Badge>
                        )}
                        {doc.topics.map(topic => (
                          <Badge key={topic} variant="outline" className="text-blue-700 border-blue-300">
                            {topic}
                          </Badge>
                        ))}
                      </div>

                      {doc.commentPeriodCloses && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-orange-800">Comment period closes: {formatDate(doc.commentPeriodCloses)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* Bookmark Button */}
                    <button
                      onClick={() => handleBookmark(doc)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title={isBookmarked(doc.id) ? "Remove bookmark" : "Add bookmark"}
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          isBookmarked(doc.id)
                            ? 'fill-pink-600 text-pink-600'
                            : 'text-gray-400 hover:text-pink-400'
                        }`}
                      />
                    </button>

                    {/* View Document Button - 如果有URL则打开链接，否则禁用 */}
                    {doc.url ? (
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        asChild
                      >
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Document
                        </a>
                      </Button>
                    ) : (
                      <Button
                        className="bg-gray-400 cursor-not-allowed"
                        disabled
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Document
                      </Button>
                    )}

                    <button
                      onClick={() => toggleExpanded(doc.id)}
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedDocs.has(doc.id) ? 'rotate-180' : ''}`} />
                      More Info
                    </button>
                  </div>
                </div>

                {expandedDocs.has(doc.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Document Type:</span>
                        <span className="ml-2 text-gray-600">Guidance for Industry</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Docket Number:</span>
                        <span className="ml-2 text-gray-600">FDA-2023-D-{doc.id.padStart(4, '0')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Format:</span>
                        <span className="ml-2 text-gray-600">PDF</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Language:</span>
                        <span className="ml-2 text-gray-600">English</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalDocuments)} of {totalDocuments} documents
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
