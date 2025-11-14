# All Templates 功能设置指南

本文档说明如何设置和部署 "All Templates" 功能。

## 📋 概述

"All Templates" 功能为 Global Templates Library 添加了9个新模板：
- **6个文件下载模板**：从本地文件上传到 Supabase Storage
- **3个外部链接模板**：点击后跳转到官方网站

## 🎯 功能特性

### 1. 文件下载模板（6个）
这些模板的文件存储在 Supabase Storage 中，用户点击 "Download" 按钮后会下载PDF文件。

| # | 模板名称 | 国家 | 机构 | 文件大小 |
|---|---------|------|------|---------|
| 1 | 510(k) Premarket Notification Template | US | FDA | 39.56 KB |
| 2 | IND Application Template | US | FDA | 337.07 KB |
| 3 | EU MDR Technical Documentation Template | EU | EMA | 47.11 KB |
| 4 | PMA Application Template | US | FDA | 94.85 KB |
| 5 | NDA Submission Template | US | FDA | 3.37 MB |
| 6 | EU Clinical Evaluation Report Template | EU | EMA | 262.13 KB |

### 2. 外部链接模板（3个）
这些模板不存储文件，点击 "Download" 按钮后会在新标签页打开官方网站。

| # | 模板名称 | 国家 | 机构 | 外部链接 |
|---|---------|------|------|---------|
| 7 | Health Canada Medical Device License Application | CA | Health Canada | [链接](https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices/application-information/forms.html) |
| 8 | De Novo Classification Request Template | US | FDA | [链接](https://www.fda.gov/medical-devices/premarket-submissions-selecting-and-preparing-correct-submission/de-novo-classification-request) |
| 9 | TGA Conformity Assessment Template | AU | TGA | [链接](https://www.tga.gov.au/resources/resources/forms/australian-declaration-conformity-templates-medical-devices) |

## 🚀 部署步骤

### 步骤1：准备环境

确保你有以下环境变量配置在 `.env.local` 文件中：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 步骤2：运行数据库迁移

在项目根目录执行以下命令：

```bash
# 使用 Supabase CLI 运行迁移
npx supabase db push

# 或者手动在 Supabase Dashboard 中执行 SQL
# 打开 SQL Editor，复制并执行以下文件的内容：
# supabase/migrations/20251114_add_all_templates_with_external_links.sql
```

**验证迁移成功：**

在 Supabase Dashboard 的 SQL Editor 中运行：

```sql
-- 查询所有非精选模板（应该有9条记录）
SELECT COUNT(*) as all_templates_count 
FROM global_templates 
WHERE is_featured = false;

-- 查询所有模板总数（应该有14条记录：5个精选 + 9个全部）
SELECT COUNT(*) as total_templates_count 
FROM global_templates;

-- 查看所有非精选模板的详细信息
SELECT id, title, country_code, authority, file_path, is_featured
FROM global_templates
WHERE is_featured = false
ORDER BY id;
```

### 步骤3：上传文件到 Supabase Storage

**3.1 确认源文件存在**

确保以下6个PDF文件存在于 `D:\AI\创业项目\FDA\reports_v2` 目录：

- ✅ 510(k) Premarket Notification Template.pdf
- ✅ ind-application-template-2024.pdf
- ✅ EU MDR Technical Documentation Template.pdf
- ✅ pma-application-template-2024.pdf
- ✅ nda-application-template-2024.pdf
- ✅ EU Clinical Evaluation Report Template.pdf

**3.2 运行上传脚本**

在项目根目录执行：

```bash
# 安装依赖（如果尚未安装）
npm install

# 运行上传脚本
node scripts/upload-all-templates.js
```

**预期输出：**

```
╔════════════════════════════════════════════════════════════╗
║  Upload All Templates Files to Supabase Storage           ║
╚════════════════════════════════════════════════════════════╝

📂 Source Directory: D:\AI\创业项目\FDA\reports_v2
📦 Total Files to Upload: 6
🎯 Target Bucket: templates/all-templates/

📄 Processing: 510(k) Premarket Notification Template
   Source: 510(k) Premarket Notification Template.pdf
   Storage: all-templates/510k-premarket-notification-template.pdf
   ✓ File read successfully (0.04 MB, 40512 bytes)
   ⬆️  Uploading to Supabase Storage...
   ✅ Upload successful!
   📍 Storage path: all-templates/510k-premarket-notification-template.pdf
   🔗 Public URL: https://...

... (其他5个文件)

╔════════════════════════════════════════════════════════════╗
║  Upload Summary                                            ║
╚════════════════════════════════════════════════════════════╝

✅ Successful: 6/6
❌ Failed: 0/6

📝 Note: 3 external link templates do not require file uploads:
   - Health Canada Medical Device License Application
   - De Novo Classification Request Template
   - TGA Conformity Assessment Template

🎉 All files uploaded successfully!

Next steps:
1. Run the database migration to insert template records
2. Verify templates appear in the Global Templates Library
3. Test download functionality for each template
```

**3.3 验证文件上传成功**

在 Supabase Dashboard 中：
1. 打开 Storage
2. 选择 `templates` bucket
3. 进入 `all-templates` 文件夹
4. 确认6个PDF文件已上传

### 步骤4：前端验证

**4.1 启动开发服务器**

```bash
npm run dev
```

**4.2 测试功能**

1. 打开浏览器访问 `http://localhost:3000`
2. 点击 "Global Templates Library" 按钮
3. 验证以下内容：

**Featured Templates 部分：**
- ✅ 显示5个精选模板
- ✅ 所有模板卡片样式正确（黄色背景、边框）
- ✅ 点击 "Download" 按钮可以下载文件

**All Templates 部分：**
- ✅ 显示 "All Templates (9)" 标题
- ✅ 显示9个模板卡片
- ✅ 文件下载模板（前6个）点击后下载PDF文件
- ✅ 外部链接模板（后3个）点击后在新标签页打开URL
- ✅ 所有模板卡片样式一致

**搜索和筛选：**
- ✅ 搜索功能对所有14个模板生效
- ✅ 按国家筛选功能正常
- ✅ 按类别筛选功能正常

## 🧪 测试清单

### 数据库测试
- [ ] 数据库中有14条记录（5个精选 + 9个全部）
- [ ] 所有记录的 `is_featured` 字段正确设置
- [ ] 外部链接模板的 `file_path` 字段包含完整URL
- [ ] 文件下载模板的 `file_size` 字段正确

### 存储测试
- [ ] Supabase Storage 中有11个文件（5个精选 + 6个全部）
- [ ] 所有文件路径正确
- [ ] 所有文件可以通过公共URL访问

### 前端测试
- [ ] "Featured Templates" 部分显示5个模板
- [ ] "All Templates" 部分显示9个模板
- [ ] 文件下载功能正常
- [ ] 外部链接跳转功能正常
- [ ] 搜索功能正常
- [ ] 筛选功能正常
- [ ] 响应式布局正常
- [ ] 无控制台错误

## 🐛 故障排除

### 问题1：数据库迁移失败

**症状：** 运行迁移时出现错误

**解决方案：**
1. 检查 Supabase 连接是否正常
2. 确认 `global_templates` 表已存在
3. 检查是否有重复的记录（根据 `title` 字段）
4. 手动在 Supabase Dashboard 中执行 SQL

### 问题2：文件上传失败

**症状：** 上传脚本报错或文件未出现在 Storage 中

**解决方案：**
1. 检查 `.env.local` 中的 `SUPABASE_SERVICE_ROLE_KEY` 是否正确
2. 确认源文件路径正确：`D:\AI\创业项目\FDA\reports_v2`
3. 检查文件权限
4. 确认 `templates` bucket 存在且为 public
5. 手动在 Supabase Dashboard 中上传文件

### 问题3：前端不显示新模板

**症状：** "All Templates" 部分不显示或显示为空

**解决方案：**
1. 清除浏览器缓存
2. 检查浏览器控制台是否有错误
3. 确认数据库记录的 `is_featured` 字段为 `false`
4. 检查 `TemplateContext` 是否正确加载数据
5. 重启开发服务器

### 问题4：外部链接不跳转

**症状：** 点击外部链接模板的按钮没有反应

**解决方案：**
1. 检查浏览器是否阻止了弹出窗口
2. 确认 `file_path` 字段包含完整的 `https://` URL
3. 检查浏览器控制台是否有错误
4. 测试URL是否可以直接在浏览器中打开

## 📝 维护说明

### 添加新的文件下载模板

1. 将PDF文件放入 `D:\AI\创业项目\FDA\reports_v2` 目录
2. 在 `upload-all-templates.js` 中添加文件映射
3. 在数据库迁移文件中添加记录
4. 运行上传脚本

### 添加新的外部链接模板

1. 在数据库迁移文件中添加记录
2. 确保 `file_path` 字段包含完整URL
3. 设置 `file_size` 为 0
4. 运行数据库迁移

### 更新现有模板

1. 如果是文件：上传新文件到 Storage（使用 `upsert: true`）
2. 更新数据库记录（使用 `UPDATE` 语句）
3. 清除前端缓存

## 🔗 相关文档

- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
- [Supabase Database 文档](https://supabase.com/docs/guides/database)
- [项目历史文档](./PROJECT_HISTORY.md)

## ✅ 完成确认

部署完成后，请确认以下所有项目：

- [ ] 数据库迁移成功执行
- [ ] 6个PDF文件成功上传到 Supabase Storage
- [ ] 前端显示 "Featured Templates (5)" 和 "All Templates (9)"
- [ ] 所有文件下载功能正常
- [ ] 所有外部链接跳转功能正常
- [ ] 搜索和筛选功能正常
- [ ] 无控制台错误
- [ ] 响应式布局正常
- [ ] 项目文档已更新

---

**最后更新：** 2024-11-14  
**版本：** 1.0.0

