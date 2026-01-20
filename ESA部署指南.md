# ESA Pages 部署指南

## 项目信息

- **项目名称**：癌症生物标志物挖掘 - QBM-VAE论文复现
- **GitHub仓库**：https://github.com/1195214305/35_CancerBiomarkers_QBM-VAE-
- **项目类型**：React + TypeScript + ESA边缘函数

## 部署步骤

### 1. 登录阿里云ESA控制台

访问：https://esa.console.aliyun.com/

### 2. 创建Pages项目

1. 进入 **边缘函数** > **Pages** 页面
2. 点击 **创建函数**
3. 选择 **从GitHub导入**

### 3. 配置项目参数

#### 基本配置

| 配置项 | 值 |
|--------|-----|
| 项目名称 | cancer-biomarkers-qbm-vae（或自定义） |
| 生产分支 | main |
| 非生产分支构建 | 关闭（可选） |

#### 构建配置

**重要：请使用esa.jsonc中的配置，不要在控制台手动填写！**

ESA会自动读取项目根目录的 `esa.jsonc` 文件，其中已包含以下配置：

```json
{
  "name": "cancer-biomarkers-qbm-vae",
  "entry": "./functions/index.js",
  "installCommand": "cd frontend && npm install",
  "buildCommand": "cd frontend && npm run build",
  "assets": {
    "directory": "./frontend/dist"
  }
}
```

如果控制台要求填写，请使用以下值：

| 配置项 | 值 |
|--------|-----|
| 安装命令 | `cd frontend && npm install` |
| 构建命令 | `cd frontend && npm run build` |
| 根目录 | （留空） |
| 静态资源目录 | `frontend/dist` |
| 函数文件路径 | （留空，使用esa.jsonc配置） |
| Node.js 版本 | 22.x |

#### 环境变量

无需配置环境变量（千问API Key由用户在前端设置页面配置）

### 4. 开始部署

1. 点击 **创建** 按钮
2. 等待构建完成（约2-3分钟）
3. 查看构建日志，确认无错误

### 5. 验证部署

部署成功后，ESA会提供一个访问URL，格式如下：

```
https://[项目名].[随机字符串].er.aliyun-esa.net
```

访问该URL，验证以下功能：

- [ ] 页面正常加载，UI显示正确
- [ ] 可以选择癌症类型
- [ ] 可以上传CSV文件（测试用小文件）
- [ ] 算法选择界面正常
- [ ] 设置页面可以配置千问API Key
- [ ] 边缘函数健康检查：访问 `https://[你的域名]/api/health`

### 6. 常见问题排查

#### 问题1：构建失败 - "vite: command not found"

**原因**：npm install未正确执行

**解决方案**：
1. 检查 `esa.jsonc` 中的 `installCommand` 是否正确
2. 确认 `frontend/package.json` 文件存在
3. 查看构建日志，确认npm install是否成功

#### 问题2：页面404错误

**原因**：静态资源目录配置错误

**解决方案**：
1. 确认 `esa.jsonc` 中 `assets.directory` 为 `./frontend/dist`
2. 检查构建日志，确认 `npm run build` 成功生成了dist目录

#### 问题3：API请求失败

**原因**：边缘函数未正确部署

**解决方案**：
1. 访问 `/api/health` 检查边缘函数是否运行
2. 检查 `functions/index.js` 是否正确导出
3. 确认 `esa.jsonc` 中 `entry` 配置为 `./functions/index.js`

#### 问题4：Tailwind样式未生效

**原因**：PostCSS配置问题

**解决方案**：
1. 确认 `frontend/postcss.config.js` 存在
2. 确认 `frontend/tailwind.config.js` 存在
3. 检查 `frontend/src/index.css` 中是否包含Tailwind指令

### 7. 性能优化建议

部署成功后，可以进行以下优化：

1. **启用缓存**：在ESA控制台配置静态资源缓存规则
2. **压缩优化**：ESA自动启用Gzip/Brotli压缩
3. **CDN加速**：ESA自动使用全球边缘节点加速

### 8. 更新部署

当代码更新后，推送到GitHub即可自动触发重新部署：

```bash
git add .
git commit -m "更新说明"
git push origin main
```

ESA会自动检测到代码变更并重新构建部署。

## 技术支持

如遇到问题，可以：

1. 查看ESA控制台的构建日志
2. 访问阿里云ESA文档：https://help.aliyun.com/product/esa
3. 在GitHub仓库提交Issue

## 部署检查清单

部署前请确认：

- [ ] 代码已推送到GitHub
- [ ] `esa.jsonc` 配置正确
- [ ] `frontend/package.json` 包含所有依赖
- [ ] `functions/index.js` 正确导出边缘函数
- [ ] README.md 包含ESA声明和Logo

部署后请验证：

- [ ] 页面可以正常访问
- [ ] 所有功能正常工作
- [ ] 边缘函数API响应正常
- [ ] 移动端显示正常
- [ ] 性能表现良好

---

**祝部署顺利！**
