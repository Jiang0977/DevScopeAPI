# 🚀 DevScope API Marketplace 发布指南

## 📋 发布前最终检查

### ✅ 已完成的准备工作
- [x] **扩展图标**: 128x128 PNG 图标已生成
- [x] **Package.json**: 已配置发布者信息和元数据
- [x] **文档**: README、LICENSE、CHANGELOG 已创建
- [x] **本地化**: 中英文本地化支持
- [x] **打包**: VSIX 文件已生成 (40.38 KB)
- [x] **代码质量**: TypeScript 编译无错误，功能完整

### 📦 打包信息
- **文件名**: `devscope-api-0.1.0.vsix`
- **大小**: 40.38 KB (32 个文件)
- **发布者**: Jonan
- **版本**: 0.1.0

## 🔐 设置发布账户

### 步骤 1: 创建 Marketplace 发布者
1. 访问 [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/)
2. 点击右上角 **"Sign in"**
3. 使用微软账户登录
4. 登录后访问 [Publishers 页面](https://marketplace.visualstudio.com/manage)
5. 点击 **"Create New Publisher"**
6. 填写信息：
   - **Publisher Name**: `Jonan`
   - **Display Name**: `Jiang Xiaogang`
   - **Email**: 您的邮箱
   - **Website**: (可选) 您的网站

### 步骤 2: 获取个人访问令牌
1. 在发布者页面，找到 **"Security"** 或 **"Personal Access Tokens"**
2. 点击 **"Create New Token"**
3. 设置令牌权限：
   - **Scopes**: 选择 `Marketplace -> Publish`
   - **Expiration**: 设置合适的过期时间
4. 复制生成的令牌（注意：只显示一次，请妥善保存）

## 🛠️ 发布工具设置

### 安装 vsce 工具
```bash
# 全局安装
npm install -g @vscode/vsce

# 或使用项目本地版本（推荐）
npx @vscode/vsce --help
```

### 登录发布者账户
```bash
# 使用您创建的发布者名称
npx @vscode/vsce login Jonan

# 系统会提示输入 Personal Access Token
# 粘贴之前保存的令牌
```

## 📤 发布步骤

### 方法一：直接发布（推荐）
```bash
# 在项目根目录执行
npx @vscode/vsce publish

# 或指定版本
npx @vscode/vsce publish 0.1.0
```

### 方法二：使用 GitHub Actions（可选）
您可以创建 `.github/workflows/publish.yml` 自动化发布流程。

## 🧪 发布前测试

### 本地安装测试
```bash
# 安装生成的 VSIX 文件
code --install-extension devscope-api-0.1.0.vsix

# 或在 VS Code 中：
# 1. Ctrl+Shift+X 打开扩展面板
# 2. 点击右上角 "..."
# 3. 选择 "Install from VSIX..."
# 4. 选择 devscope-api-0.1.0.vsix
```

### 测试清单
- [ ] 扩展正确安装
- [ ] 状态栏显示 "DevScope: Running @ 127.0.0.1:3000"
- [ ] 服务器自动启动
- [ ] 命令面板中的 DevScope 命令可用
- [ ] 访问 `http://127.0.0.1:3000/health` 返回正确响应
- [ ] 访问 `http://127.0.0.1:3000/diagnostics` 返回诊断信息
- [ ] 配置选项正确工作
- [ ] 中英文切换正常

## 📋 发布命令执行

### 完整发布流程
```bash
# 1. 确保代码是最新的
git status
git add .
git commit -m "Prepare for marketplace release v0.1.0"
git push origin main

# 2. 重新编译和打包
npm run compile
npm run package

# 3. 登录发布者（如果尚未登录）
npx @vscode/vsce login Jonan

# 4. 发布到 Marketplace
npx @vscode/vsce publish

# 5. 验证发布
npx @vscode/vsce show Jonan.devscope-api
```

## 📈 发布后验证

### Marketplace 检查
1. 访问 [您的扩展页面](https://marketplace.visualstudio.com/items?itemName=Jonan.devscope-api)
2. 验证扩展信息显示正确
3. 下载并安装测试

### 分享链接
- **Marketplace 链接**: `https://marketplace.visualstudio.com/items?itemName=Jonan.devscope-api`
- **安装命令**: `ext install Jonan.devscope-api`

## 🔄 版本更新流程

### 发布新版本
```bash
# 1. 更新版本号
npm version patch  # 0.1.0 -> 0.1.1
# 或
npm version minor  # 0.1.0 -> 0.2.0
# 或
npm version major  # 0.1.0 -> 1.0.0

# 2. 更新 CHANGELOG.md
# 3. 提交代码
git add .
git commit -m "Release v0.1.1"
git tag v0.1.1
git push origin main --tags

# 4. 发布
npx @vscode/vsce publish
```

## 🚨 故障排除

### 常见问题及解决方案

#### 1. 令牌过期
```bash
# 重新登录
npx @vscode/vsce logout Jonan
npx @vscode/vsce login Jonan
```

#### 2. 发布者名称错误
确保 package.json 中的 publisher 字段与 Marketplace 创建的发布者名称一致。

#### 3. 扩展包验证失败
```bash
# 检查包内容
npx @vscode/vsce ls

# 检查依赖
npm ls
```

#### 4. 权限问题
确保 Personal Access Token 具有 `Marketplace -> Publish` 权限。

## 📞 获取帮助

### 官方资源
- [VS Code 扩展 API 文档](https://code.visualstudio.com/api)
- [vsce 工具文档](https://github.com/microsoft/vscode-vsce)
- [Marketplace 发布指南](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

### 社区支持
- [GitHub Issues](https://github.com/Jiang0977/DevScopeAPI/issues)
- [VS Code 扩展开发社区](https://github.com/microsoft/vscode/discussions)

## 🎯 发布成功后的工作

### 推广您的扩展
1. **社交媒体**: 分享扩展链接
2. **技术博客**: 写使用教程
3. **开源社区**: 提交到相关项目列表
4. **用户反馈**: 积极回应问题和建议

### 监控和维护
- 定期查看下载统计
- 关注用户评价
- 及时修复问题
- 根据反馈添加新功能

---

**🎉 恭喜！您的 DevScope API 扩展已准备好发布到 VS Code Marketplace！**

按照以上步骤，您将成功发布第一个 VS Code 扩展。如果在发布过程中遇到任何问题，请参考故障排除部分或创建 GitHub Issue。