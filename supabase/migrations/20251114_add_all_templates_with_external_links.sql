-- =====================================================
-- All Templates Library - 数据库迁移
-- 创建时间: 2025-11-14
-- 描述: 添加9个新模板到 "All Templates" 部分
--       包含6个文件下载模板和3个外部链接模板
-- =====================================================

-- =====================================================
-- 插入 All Templates (9个模板)
-- 6个文件下载 + 3个外部链接
-- =====================================================

INSERT INTO global_templates (
  title, description, category, region, authority,
  country, country_code, country_flag,
  file_path, file_name, file_size, file_format,
  completeness, is_official, is_featured, last_updated
) VALUES

-- ========== 文件下载类型（6个）==========

-- 1. 510(k) Premarket Notification Template
(
  '510(k) Premarket Notification Template',
  'Official FDA template for 510(k) premarket notification submissions',
  'Medical Device',
  'us',
  'FDA',
  'United States',
  'US',
  '🇺🇸',
  'all-templates/510k-premarket-notification-template.pdf',
  '510(k) Premarket Notification Template.pdf',
  40512,
  'PDF',
  85,
  true,
  false,
  '2024-08-15'
),

-- 2. IND Application Template
(
  'IND Application Template',
  'Investigational New Drug application template',
  'Drug/Pharmaceutical',
  'us',
  'FDA',
  'United States',
  'US',
  '🇺🇸',
  'all-templates/ind-application-template-2024.pdf',
  'ind-application-template-2024.pdf',
  345163,
  'PDF',
  91,
  true,
  false,
  '2024-08-05'
),

-- 3. EU MDR Technical Documentation Template
(
  'EU MDR Technical Documentation Template',
  'Complete template for EU MDR technical documentation',
  'Medical Device',
  'eu',
  'EMA/Notified Bodies',
  'European Union',
  'EU',
  '🇪🇺',
  'all-templates/eu-mdr-technical-documentation-template.pdf',
  'EU MDR Technical Documentation Template.pdf',
  48239,
  'PDF',
  89,
  true,
  false,
  '2024-08-01'
),

-- 4. PMA Application Template
(
  'PMA Application Template',
  'Comprehensive template for Premarket Approval applications',
  'Medical Device',
  'us',
  'FDA',
  'United States',
  'US',
  '🇺🇸',
  'all-templates/pma-application-template-2024.pdf',
  'pma-application-template-2024.pdf',
  97124,
  'PDF',
  87,
  true,
  false,
  '2024-07-20'
),

-- 5. NDA Submission Template
(
  'NDA Submission Template',
  'New Drug Application comprehensive template',
  'Drug/Pharmaceutical',
  'us',
  'FDA',
  'United States',
  'US',
  '🇺🇸',
  'all-templates/nda-application-template-2024.pdf',
  'nda-application-template-2024.pdf',
  3532049,
  'PDF',
  88,
  true,
  false,
  '2024-07-28'
),

-- 6. EU Clinical Evaluation Report Template
(
  'EU Clinical Evaluation Report Template',
  'Template for clinical evaluation reports under EU MDR',
  'Medical Device',
  'eu',
  'EMA',
  'European Union',
  'EU',
  '🇪🇺',
  'all-templates/eu-clinical-evaluation-report-template.pdf',
  'EU Clinical Evaluation Report Template.pdf',
  268419,
  'PDF',
  76,
  true,
  false,
  '2024-07-15'
),

-- ========== 外部链接类型（3个）==========

-- 7. Health Canada Medical Device License Application
(
  'Health Canada Medical Device License Application',
  'Medical device license application for Canada',
  'Medical Device',
  'ca',
  'Health Canada',
  'Canada',
  'CA',
  '🇨🇦',
  'https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices/application-information/forms.html',
  'Health Canada Medical Device License Application',
  0,
  'PDF',
  74,
  true,
  false,
  '2024-07-25'
),

-- 8. De Novo Classification Request Template
(
  'De Novo Classification Request Template',
  'Template for novel device classification requests',
  'Medical Device',
  'us',
  'FDA',
  'United States',
  'US',
  '🇺🇸',
  'https://www.fda.gov/medical-devices/premarket-submissions-selecting-and-preparing-correct-submission/de-novo-classification-request',
  'De Novo Classification Request Template',
  0,
  'PDF',
  72,
  true,
  false,
  '2024-06-10'
),

-- 9. TGA Conformity Assessment Template
(
  'TGA Conformity Assessment Template',
  'Australian TGA conformity assessment template',
  'Medical Device',
  'au',
  'TGA',
  'Australia',
  'AU',
  '🇦🇺',
  'https://www.tga.gov.au/resources/resources/forms/australian-declaration-conformity-templates-medical-devices',
  'TGA Conformity Assessment Template',
  0,
  'XLSX',
  68,
  true,
  false,
  '2024-06-20'
);

-- =====================================================
-- 验证插入结果
-- =====================================================

-- 查询所有非精选模板（应该有9条记录）
-- SELECT COUNT(*) as all_templates_count 
-- FROM global_templates 
-- WHERE is_featured = false;

-- 查询所有模板总数（应该有14条记录：5个精选 + 9个全部）
-- SELECT COUNT(*) as total_templates_count 
-- FROM global_templates;

