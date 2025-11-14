/**
 * FDA Guidance Library - Data Layer
 * 
 * 包含所有 FDA 指导文档的静态数据和筛选选项
 */

import type { GuidanceDocument } from "@/types/fda-guidance";

/**
 * 状态筛选选项
 */
export const STATUS_OPTIONS = ["All Statuses", "Final", "Draft"] as const;

/**
 * 组织筛选选项
 */
export const ORGANIZATION_OPTIONS = [
  "All Organizations",
  "Center for Drug Evaluation and Research",
  "Center for Devices and Radiological Health",
  "Center for Biologics Evaluation and Research",
  "Oncology Center of Excellence"
] as const;

/**
 * 主题筛选选项
 */
export const TOPIC_OPTIONS = [
  "All Topics",
  "Clinical - Medical",
  "Digital Health",
  "Cybersecurity",
  "Premarket",
  "Quality Systems",
  "Software",
  "Manufacturing",
  "Design Controls",
  "ICH-Efficacy",
  "Clinical Trials",
  "Biosimilars",
  "Generic Drugs",
  "ANDA",
  "IND",
  "BLA",
  "NDA",
  "Drug Approval",
  "Biologics Approval",
  "Oncology",
  "Administrative / Procedural",
  "Product Development",
  "Clinical - Antimicrobial",
  "Infectious Diseases"
] as const;

/**
 * FDA 指导文档数据
 *
 * 包含20个真实的 FDA 指导文档
 * 数据来源：regulatorynav.com/regulatory-intelligence-hub 网站截图
 *
 * 文档1-10有文件大小信息，文档11-20没有文件大小信息
 */
export const FDA_GUIDANCE_DOCUMENTS: GuidanceDocument[] = [
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
    title: "Approaches to Assessment of Overall Survival in Oncology Clinical Trials",
    description: "Draft guidance for industry on methodological approaches to assess overall survival endpoints in oncology clinical trials",
    date: "2025/4/18",
    organization: "Oncology Center of Excellence",
    size: "599.31 KB",
    status: "Draft",
    topics: ["Clinical - Medical", "Oncology"],
    commentPeriodCloses: "2025/11/18",
    icon: "edit"
  },
  {
    id: "3",
    title: "Marketing Submission Recommendations for a Predetermined Change Control Plan for Artificial Intelligence-Enabled Device Software Functions",
    description: "Final guidance for industry and FDA staff on marketing submission recommendations for predetermined change control plans for AI-enabled device software functions",
    date: "2023/8/7",
    organization: "Center for Devices and Radiological Health",
    size: "650.59 KB",
    status: "Final",
    topics: ["Premarket", "Digital Health"],
    icon: "file"
  },
  {
    id: "4",
    title: "E21 Inclusion of Pregnant and Breastfeeding Women in Clinical Trials",
    description: "Draft ICH guidance for industry on the inclusion of pregnant and breastfeeding women in clinical trials",
    date: "2025/7/30",
    organization: "Center for Biologics Evaluation and Research",
    size: "743.62 KB",
    status: "Draft",
    topics: ["ICH-Efficacy"],
    commentPeriodCloses: "2025/10/30",
    icon: "edit"
  },
  {
    id: "5",
    title: "Formal Meetings Between the FDA and Sponsors or Applicants of BsUFA Products",
    description: "Final guidance for industry on formal meetings between FDA and sponsors or applicants of BsUFA products",
    date: "2025/7/10",
    organization: "Center for Drug Evaluation and Research",
    size: "398.07 KB",
    status: "Final",
    topics: ["Administrative / Procedural", "Biosimilars"],
    icon: "file"
  },
  {
    id: "6",
    title: "Development of Cancer Drugs for Use in Novel Combination - Determining the Contribution of the Individual Drugs' Effects",
    description: "Draft guidance for industry on developing cancer drugs for use in novel combinations and determining individual drug contribution",
    date: "2025/4/18",
    organization: "Oncology Center of Excellence",
    size: "678.46 KB",
    status: "Draft",
    topics: ["Clinical - Medical", "Oncology"],
    commentPeriodCloses: "2025/10/18",
    icon: "edit"
  },
  {
    id: "7",
    title: "Small Volume Parenteral Drug Products and Pharmacy Bulk Packages for Parenteral Nutrition: Aluminum Content and Labeling Recommendations",
    description: "Draft guidance on aluminum content and labeling recommendations for small volume parenteral drug products and pharmacy bulk packages",
    date: "2025/3/12",
    organization: "Center for Drug Evaluation and Research",
    size: "424.58 KB",
    status: "Draft",
    topics: ["Clinical - Medical"],
    icon: "edit"
  },
  {
    id: "8",
    title: "Myelodysplastic Syndromes: Developing Drug and Biological Products for Treatment",
    description: "Draft guidance for industry on developing drug and biological products for treatment of myelodysplastic syndromes",
    date: "2025/3/11",
    organization: "Oncology Center of Excellence",
    size: "469.61 KB",
    status: "Draft",
    topics: ["Clinical - Medical", "Oncology"],
    icon: "edit"
  },
  {
    id: "9",
    title: "Antibacterial Therapies for Patients With an Unmet Medical Need for the Treatment of Serious Bacterial Diseases – Questions and Answers",
    description: "Final guidance for industry on antibacterial therapies for patients with unmet medical needs in serious bacterial diseases",
    date: "2024/4/25",
    organization: "Center for Drug Evaluation and Research",
    size: "288.25 KB",
    status: "Final",
    topics: ["Clinical - Antimicrobial", "Infectious Diseases"],
    icon: "file"
  },
  {
    id: "10",
    title: "Early Lyme Disease as Manifested by Erythema Migrans: Developing Drugs for Treatment",
    description: "Final guidance for industry on developing drugs for treatment of early Lyme disease as manifested by erythema migrans",
    date: "2024/4/25",
    organization: "Center for Drug Evaluation and Research",
    size: "308.37 KB",
    status: "Final",
    topics: ["Clinical - Medical", "Infectious Diseases"],
    icon: "file"
  },
  {
    id: "11",
    title: "Software as a Medical Device (SaMD): Clinical Evaluation",
    description: "Guidance for industry and FDA staff on clinical evaluation of Software as a Medical Device",
    date: "2017/12/7",
    organization: "Center for Devices and Radiological Health",
    status: "Final",
    topics: ["Digital Health", "Software"],
    icon: "file"
  },
  {
    id: "12",
    title: "Cybersecurity in Medical Devices: Quality System Considerations and Content of Premarket Submissions",
    description: "Final guidance on cybersecurity considerations for medical device premarket submissions",
    date: "2024/9/17",
    organization: "Center for Devices and Radiological Health",
    status: "Final",
    topics: ["Cybersecurity", "Premarket"],
    icon: "file"
  },
  {
    id: "13",
    title: "Clinical Decision Support Software",
    description: "Draft guidance on clinical decision support software regulatory considerations",
    date: "2022/9/27",
    organization: "Center for Devices and Radiological Health",
    status: "Draft",
    topics: ["Digital Health", "Software"],
    icon: "edit"
  },
  {
    id: "14",
    title: "Quality System (QS) Regulation/Medical Device Good Manufacturing Practices",
    description: "Guidance on quality system regulations and good manufacturing practices for medical devices",
    date: "2025/9/18",
    organization: "Center for Devices and Radiological Health",
    status: "Final",
    topics: ["Quality Systems", "Manufacturing"],
    icon: "file"
  },
  {
    id: "15",
    title: "Design Controls Guidance for Medical Device Manufacturers",
    description: "Guidance for medical device manufacturers on design controls implementation",
    date: "2021/3/18",
    organization: "Center for Devices and Radiological Health",
    status: "Final",
    topics: ["Design Controls", "Quality Systems"],
    icon: "file"
  },
  {
    id: "16",
    title: "New Drug Application (NDA)",
    description: "Comprehensive guidance on New Drug Application submission requirements and process",
    date: "2023/10/8",
    organization: "Center for Drug Evaluation and Research",
    status: "Final",
    topics: ["NDA", "Drug Approval"],
    icon: "file"
  },
  {
    id: "17",
    title: "Abbreviated New Drug Application (ANDA)",
    description: "Guidance on Abbreviated New Drug Application for generic drug approval",
    date: "2022/3/8",
    organization: "Center for Drug Evaluation and Research",
    status: "Final",
    topics: ["ANDA", "Generic Drugs"],
    icon: "file"
  },
  {
    id: "18",
    title: "Investigational New Drug (IND) Application",
    description: "Guidance on IND application requirements for clinical studies",
    date: "2023/10/4",
    organization: "Center for Drug Evaluation and Research",
    status: "Final",
    topics: ["IND", "Clinical Trials"],
    icon: "file"
  },
  {
    id: "19",
    title: "Biologics License Application (BLA) Process",
    description: "Guidance on Biologics License Application submission requirements and process",
    date: "2023/3/14",
    organization: "Center for Biologics Evaluation and Research",
    status: "Final",
    topics: ["BLA", "Biologics Approval"],
    icon: "file"
  },
  {
    id: "20",
    title: "Biosimilar Product Development",
    description: "Guidance on biosimilar product development and approval pathway",
    date: "2023/4/11",
    organization: "Center for Drug Evaluation and Research",
    status: "Final",
    topics: ["Biosimilars", "Product Development"],
    icon: "file"
  }
];

