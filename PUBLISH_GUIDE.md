# DevScope API 发布指南

## 📋 发布前检查清单

### ✅ 必需文件和资源

1. **扩展图标** (resources/ 文件夹)
   - `icon.png`: 128x128 像素的主图标 (必需)
   - `icon.svg`: SVG 格式的可缩放图标 (推荐)

2. **配置文件**
   - `package.json`: 更新 publisher、repository、bugs 等字段
   - `README.md`: 详细的扩展说明
   - `LICENSE`: 许可证文件

3. **文档文件**
   - `CHANGELOG.md`: 版本更新记录
   - `README_EN.md`: 英文版说明 (可选)

### 🎨 图标设计指南

#### 主图标 (icon.png) - 128x128px
- **尺寸**: 128x128 像素
- **格式**: PNG (支持透明背景)
- **设计建议**:
  - 简洁明了，易于识别
  - 使用 VS Code 的设计风格
  - 避免过于复杂的细节
  - 在小尺寸下也能清晰识别

#### 图标创意建议
- **主题**: API/诊断/监控
- **元素**:
  - 服务器图标 + 诊断符号
  - 网络/连接图标
  - 放大镜 + 代码符号
  - 心跳图 + 代码符号
- **颜色**:
  - 主色: VS Code 蓝色 (#007ACC)
  - 辅助色: 绿色 (成功状态)、橙色 (警告)
  - 背景白色或透明

#### 推荐设计方案
```
┌─────────────────────┐
│  [服务器图标] + 🔍   │
│        API           │
│   [心跳线图案]       │
└─────────────────────┘
```

## 📝 Package.json 发布配置

### 必需字段更新
```json
{
  "publisher": "你的发布者名称",
  "repository": {
    "type": "git",
    "url": "https://github.com/用户名/DevScopeAPI.git"
  },
  "bugs": {
    "url": "https://github.com/用户名/DevScopeAPI/issues"
  },
  "homepage": "https://github.com/用户名/DevScopeAPI#readme",
  "license": "MIT",
  "keywords": ["vscode", "api", "diagnostics", "development", "server"],
  "icon": "resources/icon.png",
  "badges": [
    {
      "url": "https://img.shields.io/badge/version-0.1.0-blue.svg",
      "href": "https://github.com/用户名/DevScopeAPI/releases",
      "description": "Version"
    }
  ]
}
```

## 🚀 发布步骤

### 步骤 1: 创建发布者账户

1. 访问 [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/)
2. 点击 "Sign in" 使用微软账户登录
3. 点击 "Publishers" 创建新的发布者
4. 记录你的发布者名称 (用于 package.json)

### 步骤 2: 安装发布工具

```bash
# 安装 vsce (Visual Studio Code Extension)
npm install -g @vscode/vsce

# 或使用 yarn
yarn global add @vscode/vsce
```

### 步骤 3: 准备发布令牌

1. 在 Marketplace 中找到你的发布者页面
2. 点击 "Create Personal Access Token"
3. 复制生成的令牌

### 步骤 4: 配置和验证

```bash
# 创建个人访问令牌后，登录
vsce login <你的发布者名称>

# 验证包配置
vsce ls
vsce verify
```

### 步骤 5: 打包扩展

```bash
# 编译 TypeScript
npm run compile

# 打包扩展
npm run package
# 或
vsce package

# 这将生成 .vsix 文件，如: devscope-api-0.1.0.vsix
```

### 步骤 6: 本地测试

```bash
# 安装本地打包的扩展进行测试
code --install-extension devscope-api-0.1.0.vsix

# 或在 VS Code 中
# 1. 打开扩展面板 (Ctrl+Shift+X)
# 2. 点击右上角 "..."
# 3. 选择 "Install from VSIX..."
# 4. 选择生成的 .vsix 文件
```

### 步骤 7: 发布到 Marketplace

```bash
# 发布扩展
vsce publish

# 或发布特定版本
vsce publish 0.1.0
```

## 📋 发布前验证清单

### 功能测试
- [ ] 扩展正确安装和激活
- [ ] 状态栏正确显示
- [ ] 服务器成功启动
- [ ] API 端点正常工作
- [ ] 配置选项生效
- [ ] 错误处理正常

### 文档检查
- [ ] README.md 语法正确
- [ ] 所有链接有效
- [ ] 安装说明清晰
- [ ] 使用示例完整

### 技术验证
- [ ] 通过 `vsce verify` 检查
- [ ] 没有编译错误
- [ ] 依赖项正确声明
- [ ] 版本号语义正确

## 🔄 版本管理

### 语义化版本控制
- **主版本号 (MAJOR)**: 不兼容的 API 修改
- **次版本号 (MINOR)**: 向下兼容的功能性新增
- **修订号 (PATCH)**: 向下兼容的问题修正

### 发布流程
1. 更新 `package.json` 中的版本号
2. 更新 `CHANGELOG.md`
3. 运行完整测试
4. 提交代码到仓库
5. 创建 Git 标签: `git tag v0.1.0`
6. 发布新版本

## 📈 发布后监控

### Marketplace 分析
- 定期查看下载统计
- 监控用户评价和反馈
- 关注问题报告

### 持续改进
- 根据用户反馈优化功能
- 定期更新依赖项
- 保持与 VS Code 版本兼容

## 🆘 常见问题

### Q: 发布失败怎么办？
A: 检查 `vsce verify` 输出，确保所有必需字段都已填写。

### Q: 如何更新已发布的扩展？
A: 更新版本号后重新运行 `vsce publish`。

### Q: 可以使用免费发布者吗？
A: 可以，但需要微软账户验证。

### Q: 如何设置扩展价格？
A: VS Code Marketplace 目前只支持免费扩展。

## 📞 支持

如有问题，可以查看:
- [VS Code 扩展 API 文档](https://code.visualstudio.com/api)
- [vsce 工具文档](https://github.com/microsoft/vscode-vsce)
- [Marketplace 发布指南](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)