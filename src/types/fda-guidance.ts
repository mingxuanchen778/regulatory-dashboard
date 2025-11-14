/**
 * FDA Guidance Library - Type Definitions
 * 
 * 定义 FDA 指导文档的数据结构和相关类型
 */

/**
 * FDA 指导文档接口
 *
 * @property id - 文档唯一标识符
 * @property title - 文档标题
 * @property description - 文档描述
 * @property date - 发布日期（格式：YYYY/M/D）
 * @property organization - FDA 组织/中心
 * @property size - 文件大小（可选，如 "362.51 KB"）
 * @property status - 文档状态（Final 或 Draft）
 * @property topics - 主题标签数组
 * @property commentPeriodCloses - 评论截止日期（可选，仅 Draft 状态）
 * @property icon - 图标类型
 * @property regulatoryPathways - 监管路径（可选）
 * @property deviceClass - 设备分类（可选）
 * @property url - FDA官方文档链接（可选）
 */
export interface GuidanceDocument {
  id: string;
  title: string;
  description: string;
  date: string;
  organization: string;
  size?: string;
  status: "Final" | "Draft";
  topics: string[];
  commentPeriodCloses?: string;
  icon: "edit" | "file" | "heart";
  regulatoryPathways?: string[];
  deviceClass?: string[];
  url?: string;
}

/**
 * 文档状态类型
 */
export type DocumentStatus = "Final" | "Draft";

/**
 * 图标类型
 */
export type IconType = "edit" | "file" | "heart";

/**
 * 日期范围接口
 */
export interface DateRange {
  start: string;
  end: string;
}

/**
 * 筛选选项类型
 */
export type FilterOption = string;

