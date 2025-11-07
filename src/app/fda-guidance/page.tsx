"use client";

import { useState, useMemo } from "react";
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
  X
} from "lucide-react";

interface GuidanceDocument {
  id: string;
  title: string;
  description: string;
  date: string;
  organization: string;
  size: string;
  status: "Final" | "Draft";
  topics: string[];
  commentPeriodCloses?: string;
  icon: "edit" | "file" | "heart";
}

// 模拟文档数据（移到组件外部以避免 React Hook 依赖警告）
const ALL_DOCUMENTS: GuidanceDocument[] = [
  {
    id: "1",
    title: "Oncology Therapeutic Radiopharmaceuticals: Dosage Optimization During Clinical Development",
    description: "Draft guidance for industry on dosage optimization strategies for oncology therapeutic radiopharmaceuticals during clinical development",
    date: "2025/8/18",
    organization: "Oncology Center of Excellence",
    size: "362.51 KB",
    status: "Draft",
    topics: ["Clinical - Medical", "Oncology"],
    commentPeriodCloses: "2025/11/18",
    icon: "edit"
  },
  {
    id: "2",
    title: "Artificial Intelligence and Machine Learning (AI/ML)-Enabled Medical Devices",
    description: "Marketing submission recommendations for AI/ML-enabled medical devices",
    date: "2024/10/15",
    organization: "Center for Devices and Radiological Health",
    size: "1.23 MB",
    status: "Final",
    topics: ["AI/ML", "Digital Health", "Premarket"],
    icon: "file"
  },
  {
    id: "3",
    title: "Cybersecurity in Medical Devices: Quality System Considerations and Content of Premarket Submissions",
    description: "Draft guidance on cybersecurity considerations for medical device manufacturers",
    date: "2024/9/29",
    organization: "Center for Devices and Radiological Health",
    size: "856.34 KB",
    status: "Draft",
    topics: ["Cybersecurity", "Quality Systems", "Premarket"],
    commentPeriodCloses: "2024/12/29",
    icon: "edit"
  },
  {
    id: "4",
    title: "Software as a Medical Device (SaMD): Clinical Evaluation",
    description: "Guidance on clinical evaluation requirements for software as a medical device",
    date: "2024/8/22",
    organization: "Center for Devices and Radiological Health",
    size: "678.90 KB",
    status: "Final",
    topics: ["Software", "Digital Health", "Clinical - Medical"],
    icon: "file"
  },
  {
    id: "5",
    title: "Decentralized Clinical Trials for Drugs, Biological Products, and Devices",
    description: "Guidance on conducting decentralized clinical trials",
    date: "2024/7/10",
    organization: "Center for Drug Evaluation and Research",
    size: "945.12 KB",
    status: "Final",
    topics: ["Clinical Trials", "Clinical - Medical"],
    icon: "file"
  },
  {
    id: "6",
    title: "Biosimilar Product Development: Chemistry, Manufacturing, and Controls",
    description: "Guidance on CMC considerations for biosimilar product development",
    date: "2024/6/18",
    organization: "Center for Biologics Evaluation and Research",
    size: "1.45 MB",
    status: "Final",
    topics: ["Biosimilars", "Manufacturing"],
    icon: "file"
  },
  {
    id: "7",
    title: "Generic Drug User Fee Amendments (GDUFA): Regulatory Science Initiatives",
    description: "Overview of GDUFA regulatory science initiatives",
    date: "2024/5/25",
    organization: "Center for Drug Evaluation and Research",
    size: "523.67 KB",
    status: "Final",
    topics: ["Generic Drugs", "ANDA"],
    icon: "file"
  },
  {
    id: "8",
    title: "Investigational New Drug Applications: Determining Whether Human Research Studies Can Be Conducted Without an IND",
    description: "Guidance on when an IND application is required for human research studies",
    date: "2024/4/30",
    organization: "Center for Drug Evaluation and Research",
    size: "789.23 KB",
    status: "Final",
    topics: ["IND", "Clinical Trials"],
    icon: "file"
  },
  {
    id: "9",
    title: "Biologics License Applications: Chemistry, Manufacturing, and Controls Information",
    description: "Guidance on CMC information requirements for BLA submissions",
    date: "2024/3/15",
    organization: "Center for Biologics Evaluation and Research",
    size: "1.12 MB",
    status: "Final",
    topics: ["BLA", "Manufacturing"],
    icon: "file"
  },
  {
    id: "10",
    title: "Oncology Drug Development: Considerations for Accelerated Approval",
    description: "Guidance on accelerated approval pathways for oncology drugs",
    date: "2024/2/20",
    organization: "Oncology Center of Excellence",
    size: "834.56 KB",
    status: "Final",
    topics: ["Oncology", "Product Development"],
    icon: "heart"
  },
  {
    id: "11",
    title: "Administrative Procedures: Meetings with FDA Staff",
    description: "Guidance on requesting and conducting meetings with FDA staff",
    date: "2024/1/10",
    organization: "Office of the Commissioner",
    size: "456.78 KB",
    status: "Final",
    topics: ["Administrative / Procedural"],
    icon: "file"
  },
  {
    id: "12",
    title: "Women's Health Research: Considerations for Clinical Trials",
    description: "Guidance on including women in clinical trials and analyzing sex differences",
    date: "2023/12/5",
    organization: "Office of Women's Health",
    size: "712.34 KB",
    status: "Final",
    topics: ["Clinical Trials", "Clinical - Medical"],
    icon: "heart"
  },
  {
    id: "13",
    title: "ICH E6(R3) Good Clinical Practice: Integrated Addendum",
    description: "ICH guidance on good clinical practice standards",
    date: "2023/11/15",
    organization: "Center for Drug Evaluation and Research",
    size: "1.67 MB",
    status: "Final",
    topics: ["ICH-Efficacy", "Clinical Trials"],
    icon: "file"
  },
  {
    id: "14",
    title: "Design Controls for Medical Devices",
    description: "Guidance on design control requirements for medical device development",
    date: "2024/6/12",
    organization: "Center for Devices and Radiological Health",
    size: "567.89 KB",
    status: "Final",
    topics: ["Design Controls", "Premarket"],
    icon: "file"
  }
];

export default function FDAGuidancePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedOrganization, setSelectedOrganization] = useState("All Organizations");
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());
  const [previewDoc, setPreviewDoc] = useState<GuidanceDocument | null>(null);

  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  const statusOptions = ["All Statuses", "Final", "Draft"];

  const organizationOptions = [
    "All Organizations",
    "Center for Drug Evaluation and Research",
    "Center for Devices and Radiological Health",
    "Center for Biologics Evaluation and Research",
    "Oncology Center of Excellence",
    "Office of the Commissioner",
    "Office of Women's Health"
  ];

  const topicOptions = [
    "All Topics",
    "Clinical - Medical",
    "Digital Health",
    "Cybersecurity",
    "Premarket",
    "Quality Systems",
    "Software",
    "AI/ML",
    "Manufacturing",
    "Design Controls",
    "ICH-Efficacy",
    "Clinical Trials",
    "Biosimilars",
    "Generic Drugs",
    "ANDA",
    "IND",
    "BLA",
    "Oncology",
    "Administrative / Procedural",
    "Product Development"
  ];

  // 使用组件外部定义的常量数据

  const filteredDocuments = useMemo(() => {
    return ALL_DOCUMENTS.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doc.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === "All Statuses" || doc.status === selectedStatus;
      const matchesOrganization = selectedOrganization === "All Organizations" ||
                                  doc.organization === selectedOrganization;
      const matchesTopic = selectedTopic === "All Topics" ||
                          doc.topics.includes(selectedTopic);

      return matchesSearch && matchesStatus && matchesOrganization && matchesTopic;
    });
  }, [searchQuery, selectedStatus, selectedOrganization, selectedTopic]);

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
    const rows = filteredDocuments.map(doc => [
      doc.title,
      doc.description,
      doc.date,
      doc.organization,
      doc.size,
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
    const printContent = filteredDocuments.map(doc => `
      ${doc.title}
      ${doc.description}
      Date: ${doc.date} | Organization: ${doc.organization}
      Status: ${doc.status} | Size: ${doc.size}
      Topics: ${doc.topics.join(", ")}
      ${doc.commentPeriodCloses ? `Comment period closes: ${doc.commentPeriodCloses}` : ''}
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
            <p>Total documents: ${filteredDocuments.length}</p>
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
    <div className="w-full min-h-screen bg-gray-50">
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
              <Button variant="outline" className="px-4">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button className="px-6 bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
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
                  onChange={(e) => setSelectedOrganization(e.target.value)}
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
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {topicOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-700">Found <span className="font-semibold">{filteredDocuments.length}</span> guidance documents</p>
          <p className="text-sm text-gray-500">Last updated: 2025/11/3</p>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
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
                          {doc.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {doc.organization}
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {doc.size}
                        </div>
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
                          <span className="text-sm text-orange-800">Comment period closes: {doc.commentPeriodCloses}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Document
                    </Button>
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
      </div>
    </div>
  );
}
