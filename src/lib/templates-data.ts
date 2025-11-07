/**
 * 全局模板库 - 数据层
 * 
 * 包含模板的模拟数据和常量定义
 * 数据来源：基于截图中显示的精确模板信息
 * 
 * 关键修正：
 * 1. 所有国家选项包含国旗emoji
 * 2. 模板数据使用completeness字段（百分比）
 * 3. 包含countryFlag字段
 */

import type { Template, Category, Country } from "@/types/template";

/**
 * 模板分类选项列表
 * 用于分类筛选下拉器
 */
export const CATEGORIES: Category[] = [
  "All Categories",
  "Medical Device",
  "Drug/Pharmaceutical",
  "Biologic",
];

/**
 * 国家/地区选项列表
 * 包含国旗emoji前缀 - 关键修正1
 * 用于国家筛选下拉器
 */
export const COUNTRIES: Country[] = [
  "All Countries",
  "🇺🇸 United States (FDA)",
  "🇪🇺 European Union (EMA)",
  "🇯🇵 Japan (PMDA)",
  "🇨🇦 Canada (Health Canada)",
  "🇦🇺 Australia (TGA)",
  "🇨🇳 China (NMPA)",
  "🇧🇷 Brazil (ANVISA)",
  "🇮🇳 India (CDSCO)",
  "🇰🇷 South Korea (MFDS)",
  "🇷🇺 Russia (Roszdravnadzor)",
];

/**
 * 模板模拟数据
 * 基于截图中显示的6个精确模板
 * 所有模板都标记为官方(isOfficial)和精选(isFeatured)
 */
export const MOCK_TEMPLATES: Template[] = [
  {
    id: "1",
    name: "510(k) Premarket Notification",
    country: "United States",
    countryCode: "US",
    countryFlag: "🇺🇸",
    authority: "FDA",
    category: "Medical Device",
    description: "Official FDA template for 510(k) premarket notification submissions",
    date: "2024-08-15",
    completeness: 85,  // 完成度：85%
    format: "PDF",
    isOfficial: true,
    isFeatured: true,
    downloadUrl: "#",
  },
  {
    id: "2",
    name: "IND Application Template",
    country: "United States",
    countryCode: "US",
    countryFlag: "🇺🇸",
    authority: "FDA",
    category: "Drug/Pharmaceutical",
    description: "Investigational New Drug application template",
    date: "2024-08-05",
    completeness: 91,  // 完成度：91%
    format: "PDF",
    isOfficial: true,
    isFeatured: true,
    downloadUrl: "#",
  },
  {
    id: "3",
    name: "EU MDR Technical Documentation Template",
    country: "European Union",
    countryCode: "EU",
    countryFlag: "🇪🇺",
    authority: "EMA/Notified Bodies",
    category: "Medical Device",
    description: "Complete template for EU MDR technical documentation",
    date: "2024-08-01",
    completeness: 89,  // 完成度：89%
    format: "PDF",
    isOfficial: true,
    isFeatured: true,
    downloadUrl: "#",
  },
  {
    id: "4",
    name: "PMA Application Template",
    country: "United States",
    countryCode: "US",
    countryFlag: "🇺🇸",
    authority: "FDA",
    category: "Medical Device",
    description: "Comprehensive template for Premarket Approval applications",
    date: "2024-07-20",
    completeness: 87,  // 完成度：87%
    format: "PDF",
    isOfficial: true,
    isFeatured: true,
    downloadUrl: "#",
  },
  {
    id: "5",
    name: "BLA Application Template",
    country: "United States",
    countryCode: "US",
    countryFlag: "🇺🇸",
    authority: "FDA",
    category: "Biologic",
    description: "Biologics License Application template",
    date: "2024-06-10",
    completeness: 83,  // 完成度：83%
    format: "PDF",
    isOfficial: true,
    isFeatured: true,
    downloadUrl: "#",
  },
  {
    id: "6",
    name: "NDA Application Template",
    country: "United States",
    countryCode: "US",
    countryFlag: "🇺🇸",
    authority: "FDA",
    category: "Drug/Pharmaceutical",
    description: "New Drug Application template",
    date: "2024-05-15",
    completeness: 88,  // 完成度：88%
    format: "PDF",
    isOfficial: true,
    isFeatured: true,
    downloadUrl: "#",
  },
  // 额外的模板数据（用于演示筛选功能）
  {
    id: "7",
    name: "PMDA Medical Device Application",
    country: "Japan",
    countryCode: "JP",
    countryFlag: "🇯🇵",
    authority: "PMDA",
    category: "Medical Device",
    description: "Japanese medical device application template",
    date: "2024-04-20",
    completeness: 82,
    format: "PDF",
    isOfficial: true,
    isFeatured: false,
    downloadUrl: "#",
  },
  {
    id: "8",
    name: "Health Canada Drug Submission",
    country: "Canada",
    countryCode: "CA",
    countryFlag: "🇨🇦",
    authority: "Health Canada",
    category: "Drug/Pharmaceutical",
    description: "Canadian drug submission template",
    date: "2024-03-10",
    completeness: 86,
    format: "PDF",
    isOfficial: true,
    isFeatured: false,
    downloadUrl: "#",
  },
  {
    id: "9",
    name: "TGA Therapeutic Goods Application",
    country: "Australia",
    countryCode: "AU",
    countryFlag: "🇦🇺",
    authority: "TGA",
    category: "Medical Device",
    description: "Australian therapeutic goods application template",
    date: "2024-02-15",
    completeness: 84,
    format: "PDF",
    isOfficial: true,
    isFeatured: false,
    downloadUrl: "#",
  },
  {
    id: "10",
    name: "NMPA Registration Dossier",
    country: "China",
    countryCode: "CN",
    countryFlag: "🇨🇳",
    authority: "NMPA",
    category: "Medical Device",
    description: "Chinese medical device registration dossier template",
    date: "2024-01-20",
    completeness: 80,
    format: "PDF",
    isOfficial: true,
    isFeatured: false,
    downloadUrl: "#",
  },
];

/**
 * 筛选模板的辅助函数
 * 
 * @param templates - 模板数组
 * @param searchQuery - 搜索关键词
 * @param category - 选中的分类
 * @param country - 选中的国家
 * @returns 筛选后的模板数组
 */
export function filterTemplates(
  templates: Template[],
  searchQuery: string,
  category: Category,
  country: Country
): Template[] {
  return templates.filter((template) => {
    // 搜索筛选：匹配名称、描述、机构
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.authority.toLowerCase().includes(searchQuery.toLowerCase());

    // 分类筛选
    const matchesCategory =
      category === "All Categories" || template.category === category;

    // 国家筛选：需要从带emoji的字符串中提取国家名称
    const matchesCountry =
      country === "All Countries" ||
      country.includes(template.country) ||
      country.includes(template.countryCode);

    return matchesSearch && matchesCategory && matchesCountry;
  });
}

