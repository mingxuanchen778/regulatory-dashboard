-- =====================================================
-- Global Templates Library - 数据库迁移
-- 创建时间: 2025-11-10
-- 描述: 创建全局模板库的数据库表、Storage bucket 和 RLS 策略
-- =====================================================

-- =====================================================
-- 1. 创建 global_templates 表
-- =====================================================

CREATE TABLE IF NOT EXISTS global_templates (
  -- 主键
  id SERIAL PRIMARY KEY,
  
  -- 基本信息
  title VARCHAR(255) NOT NULL,                    -- 模板标题（如 "510(k) Premarket Notification"）
  description TEXT,                                -- 模板描述
  
  -- 分类信息
  category VARCHAR(100) NOT NULL,                  -- 类别（Medical Device, Drug/Pharmaceutical, Biologic）
  region VARCHAR(50) NOT NULL,                     -- 地区代码（us, eu, jp, cn 等）
  authority VARCHAR(100) NOT NULL,                 -- 监管机构（FDA, EMA, PMDA 等）
  country VARCHAR(100) NOT NULL,                   -- 国家全称（United States, European Union 等）
  country_code VARCHAR(10) NOT NULL,               -- 国家代码（US, EU, JP 等）
  country_flag VARCHAR(10),                        -- 国旗 emoji（🇺🇸, 🇪🇺 等）
  
  -- 文件信息
  file_path VARCHAR(500) NOT NULL,                 -- Storage 中的文件路径
  file_name VARCHAR(255) NOT NULL,                 -- 原始文件名
  file_size BIGINT,                                -- 文件大小（字节）
  file_format VARCHAR(20) DEFAULT 'PDF',           -- 文件格式（PDF, DOCX 等）
  
  -- 元数据
  version VARCHAR(50),                             -- 版本号
  effective_date DATE,                             -- 生效日期
  last_updated DATE,                               -- 最后更新日期
  completeness INTEGER DEFAULT 100,                -- 完成度（0-100）
  
  -- 标记
  is_official BOOLEAN DEFAULT true,                -- 是否官方模板
  is_featured BOOLEAN DEFAULT false,               -- 是否精选模板
  
  -- 统计
  download_count INTEGER DEFAULT 0,                -- 下载次数
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. 创建索引
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_templates_category ON global_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_region ON global_templates(region);
CREATE INDEX IF NOT EXISTS idx_templates_featured ON global_templates(is_featured);
CREATE INDEX IF NOT EXISTS idx_templates_country ON global_templates(country);
CREATE INDEX IF NOT EXISTS idx_templates_country_code ON global_templates(country_code);

-- =====================================================
-- 3. 创建 Storage Bucket
-- =====================================================

-- 创建 templates bucket（public 访问）
INSERT INTO storage.buckets (id, name, public)
VALUES ('templates', 'templates', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. 启用 RLS（Row Level Security）
-- =====================================================

ALTER TABLE global_templates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. 创建 RLS 策略 - global_templates 表
-- =====================================================

-- 策略 1：所有人可以读取（包括未登录用户）
CREATE POLICY "Anyone can view templates"
  ON global_templates
  FOR SELECT
  USING (true);

-- 策略 2：只有管理员可以插入
CREATE POLICY "Only admins can insert templates"
  ON global_templates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- 策略 3：只有管理员可以更新
CREATE POLICY "Only admins can update templates"
  ON global_templates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- 策略 4：只有管理员可以删除
CREATE POLICY "Only admins can delete templates"
  ON global_templates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- =====================================================
-- 6. 创建 RLS 策略 - Storage Objects
-- =====================================================

-- 策略 1：所有人可以读取 templates bucket
CREATE POLICY "Anyone can view templates"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'templates');

-- 策略 2：只有管理员可以上传到 templates bucket
CREATE POLICY "Only admins can upload templates"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'templates'
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- 策略 3：只有管理员可以更新 templates bucket 中的文件
CREATE POLICY "Only admins can update templates"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'templates'
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- 策略 4：只有管理员可以删除 templates bucket 中的文件
CREATE POLICY "Only admins can delete templates"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'templates'
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- =====================================================
-- 7. 创建触发器 - 自动更新 updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_global_templates_updated_at
  BEFORE UPDATE ON global_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. 插入初始测试数据（6 个精选模板）
-- =====================================================

INSERT INTO global_templates (
  title, description, category, region, authority,
  country, country_code, country_flag,
  file_path, file_name, file_size, file_format,
  completeness, is_official, is_featured, last_updated
) VALUES
  -- 模板 1: 510(k) Premarket Notification
  (
    '510(k) Premarket Notification',
    'Official FDA template for 510(k) premarket notification submissions',
    'Medical Device',
    'us',
    'FDA',
    'United States',
    'US',
    '🇺🇸',
    'us/510k/510k-premarket-notification-2024.pdf',
    '510k-premarket-notification-2024.pdf',
    2048576,  -- 2MB
    'PDF',
    85,
    true,
    true,
    '2024-08-15'
  ),
  -- 模板 2: IND Application Template
  (
    'IND Application Template',
    'Investigational New Drug application template',
    'Drug/Pharmaceutical',
    'us',
    'FDA',
    'United States',
    'US',
    '🇺🇸',
    'us/ind/ind-application-template-2024.pdf',
    'ind-application-template-2024.pdf',
    3145728,  -- 3MB
    'PDF',
    91,
    true,
    true,
    '2024-08-05'
  ),
  -- 模板 3: EU MDR Technical Documentation Template
  (
    'EU MDR Technical Documentation Template',
    'Complete template for EU MDR technical documentation',
    'Medical Device',
    'eu',
    'EMA/Notified Bodies',
    'European Union',
    'EU',
    '🇪🇺',
    'eu/mdr/mdr-technical-documentation-2024.pdf',
    'mdr-technical-documentation-2024.pdf',
    4194304,  -- 4MB
    'PDF',
    89,
    true,
    true,
    '2024-08-01'
  ),
  -- 模板 4: PMA Application Template
  (
    'PMA Application Template',
    'Comprehensive template for Premarket Approval applications',
    'Medical Device',
    'us',
    'FDA',
    'United States',
    'US',
    '🇺🇸',
    'us/pma/pma-application-template-2024.pdf',
    'pma-application-template-2024.pdf',
    5242880,  -- 5MB
    'PDF',
    87,
    true,
    true,
    '2024-07-20'
  ),
  -- 模板 5: BLA Application Template
  (
    'BLA Application Template',
    'Biologics License Application template',
    'Biologic',
    'us',
    'FDA',
    'United States',
    'US',
    '🇺🇸',
    'us/bla/bla-application-template-2024.pdf',
    'bla-application-template-2024.pdf',
    3670016,  -- 3.5MB
    'PDF',
    83,
    true,
    true,
    '2024-06-10'
  ),
  -- 模板 6: NDA Application Template
  (
    'NDA Application Template',
    'New Drug Application template',
    'Drug/Pharmaceutical',
    'us',
    'FDA',
    'United States',
    'US',
    '🇺🇸',
    'us/nda/nda-application-template-2024.pdf',
    'nda-application-template-2024.pdf',
    4718592,  -- 4.5MB
    'PDF',
    88,
    true,
    true,
    '2024-05-15'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- 迁移完成
-- =====================================================

