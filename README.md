# 癌症生物标志物挖掘 - QBM-VAE论文复现

## 本项目由[阿里云ESA](https://www.aliyun.com/product/esa)提供加速、计算和保护

![阿里云ESA](https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png)

## 项目简介

本项目复现论文《Efficient discovery of robust prognostic biomarkers and signatures in solid tumors》，对比**QBM-VAE（量子玻尔兹曼机-变分自编码器）**与传统机器学习算法在癌症生物标志物挖掘中的性能。

### 核心功能

- 📊 **多算法对比**：QBM-VAE vs Random Forest、SVM、Gradient Boosting、Elastic Net、XGBoost
- 🧬 **多癌种支持**：BRCA（乳腺癌）、CRC（结直肠癌）、LUAD（肺腺癌）、GBM（胶质母细胞瘤）、LUSC（肺鳞癌）、DLBC（弥漫性大B细胞淋巴瘤）
- 📈 **可视化分析**：生存曲线、ROC曲线、特征重要性、性能对比
- 🤖 **AI智能解读**：集成千问API，自动生成专业分析报告
- ⚡ **边缘计算**：基于阿里云ESA边缘函数，实现低延迟高性能计算

## 技术栈

- **前端**：React 18 + TypeScript + Tailwind CSS + Vite
- **可视化**：Recharts
- **边缘函数**：ESA Pages Edge Functions
- **AI集成**：阿里云千问API

## How We Use Edge

本项目充分利用阿里云ESA的边缘计算能力，实现了以下核心功能：

### 1. 边缘函数处理算法对比

在 `functions/api/compare.js` 中，我们使用边缘函数执行复杂的算法对比计算：

```javascript
// 边缘函数在全球节点上执行，降低延迟
export default async function handler(request) {
  const { data, algorithms, apiKey } = await request.json()

  // 在边缘节点执行算法对比
  const results = await runAlgorithmComparison(data, algorithms, apiKey)

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

**边缘优势**：
- ⚡ **低延迟**：算法计算在离用户最近的边缘节点执行
- 🚀 **高性能**：利用边缘节点的计算资源，无需等待中心服务器响应
- 🌍 **全球加速**：无论用户在哪里，都能获得一致的快速体验

### 2. 边缘数据处理

在 `functions/api/upload.js` 中，数据上传和预处理在边缘完成：

```javascript
// 边缘节点直接处理文件上传和数据解析
const formData = await request.formData()
const file = formData.get('file')
const text = await file.text()

// 在边缘节点完成CSV解析和统计
const data = parseCSV(text)
const stats = calculateStats(data)
```

**边缘优势**：
- 📦 **减少传输**：数据在边缘节点处理，只返回必要的统计信息
- 🔒 **数据安全**：敏感医疗数据不需要传输到中心服务器
- ⚡ **即时响应**：文件解析和验证在边缘完成，用户体验更流畅

### 3. 边缘AI集成

集成千问API调用，在边缘节点完成AI解读：

```javascript
// 在边缘节点调用千问API，生成专业分析
async function generateAIInsights(results, apiKey) {
  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen-turbo',
      input: { prompt: generatePrompt(results) }
    })
  })

  return await response.json()
}
```

**边缘优势**：
- 🤖 **智能加速**：AI调用在边缘节点完成，减少网络往返
- 🔐 **API密钥安全**：密钥在边缘函数中使用，不暴露给前端
- 📊 **实时分析**：算法结果和AI解读同步生成

### 4. 为什么边缘函数不可替代

对于科研数据分析场景，边缘计算具有独特优势：

1. **计算密集型任务**：生物信息学算法计算量大，边缘节点分布式计算提升性能
2. **数据隐私保护**：医疗数据敏感，边缘处理避免数据集中存储风险
3. **全球协作**：科研团队分布全球，边缘节点确保各地研究人员都能快速访问
4. **成本优化**：按需计算，无需维护专用服务器集群

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/1195214305/35_CancerBiomarkers_QBM-VAE论文复现.git
cd 35_CancerBiomarkers_QBM-VAE论文复现
```

### 2. 安装依赖

```bash
cd frontend
npm install
```

### 3. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 构建部署

```bash
npm run build
```

## 使用指南

### 1. 数据上传

- 选择癌症类型（BRCA、CRC、LUAD、GBM、LUSC、DLBC）
- 上传基因表达数据（CSV/TXT/TSV格式）
- 数据格式要求：
  - 第一行为基因名称
  - 第一列为样本ID
  - 包含生存时间和生存状态列

### 2. 算法对比

- 选择要对比的算法（至少选择QBM-VAE和一个传统算法）
- 点击"开始对比分析"
- 等待边缘函数完成计算

### 3. 结果分析

- 查看算法性能对比（C-index、AUC、准确率）
- 分析Kaplan-Meier生存曲线
- 识别关键生物标志物
- 查看数据集统计信息

### 4. AI智能解读（可选）

- 在设置页面配置千问API Key
- 系统自动生成专业分析报告
- 提供生物标志物功能解释和研究建议

## 数据集

本项目使用SurvivalML数据集，包含6种癌症类型的转录组数据：

- **BRCA**：乳腺癌
- **CRC**：结直肠癌
- **LUAD**：肺腺癌
- **GBM**：胶质母细胞瘤
- **LUSC**：肺鳞癌
- **DLBC**：弥漫性大B细胞淋巴瘤

数据集来源：[SurvivalML GitHub](https://github.com/Zaoqu-Liu/SurvivalML)

## 论文引用

本项目复现以下论文：

```
Liu Z, et al. "Efficient Discovery of Robust Prognostic Biomarkers and Signatures in Solid Tumors."
Cancer Letters, January 2025. DOI: 10.1016/j.canlet.2025.217502
```

## 技术亮点

### 创意卓越

- 🎨 **科研风格UI**：避免AI味儿，采用专业的深色科研主题
- 🧬 **生物信息学可视化**：直观展示复杂的生存分析和特征重要性
- 🤖 **AI辅助解读**：将量子算法与大语言模型结合，提供智能分析

### 应用价值

- 🏥 **临床应用**：帮助研究人员快速识别癌症预后生物标志物
- 📊 **算法对比**：为算法选择提供数据支持
- 🌍 **开箱即用**：无需配置服务器，部署即可使用
- 📚 **教育价值**：适合生物信息学教学和科研训练

### 技术探索

- ⚡ **边缘计算**：充分利用ESA边缘函数处理计算密集型任务
- 🔬 **量子算法**：探索QBM-VAE在生物信息学中的应用
- 🚀 **性能优化**：边缘节点分布式计算，全球低延迟访问
- 🔐 **数据安全**：边缘处理保护医疗数据隐私

## 项目结构

```
35_CancerBiomarkers_QBM-VAE论文复现/
├── frontend/                 # 前端代码
│   ├── src/
│   │   ├── components/      # React组件
│   │   │   ├── DataUpload.tsx
│   │   │   ├── AlgorithmSelector.tsx
│   │   │   ├── ResultsDisplay.tsx
│   │   │   └── SettingsPanel.tsx
│   │   ├── App.tsx          # 主应用
│   │   ├── main.tsx         # 入口文件
│   │   └── index.css        # 全局样式
│   ├── public/              # 静态资源
│   ├── package.json
│   └── vite.config.ts
├── functions/                # 边缘函数
│   ├── index.js             # 统一入口
│   └── api/
│       ├── upload.js        # 数据上传
│       ├── compare.js       # 算法对比
│       └── health.js        # 健康检查
├── screenshots/              # 项目截图
├── esa.jsonc                # ESA配置
└── README.md                # 项目文档
```

## 开发团队

本项目由个人开发者独立完成，使用Claude Code辅助开发。

## 许可证

MIT License

## 致谢

- 感谢阿里云ESA提供边缘计算支持
- 感谢SurvivalML项目提供数据集
- 感谢论文作者的研究成果

## 联系方式

如有问题或建议，欢迎提交Issue或Pull Request。

---

**本项目参加阿里云ESA Pages边缘开发大赛**
