# DevScope API 调试指南

## 问题诊断步骤

### 1. 检查扩展是否正确加载

1. 打开一个新的 VS Code 窗口（扩展开发模式）
2. 按 `Ctrl+Shift+P` 打开命令面板
3. 输入 "Developer: Reload Window" 重新加载窗口
4. 查看左下角状态栏是否出现 "DevScope: 已停止" 或 "DevScope: Stopped"

### 2. 查看调试日志

1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 "View: Show Output"
3. 在输出面板下拉菜单中选择 "DevScope"
4. 查看是否有以下关键日志：
   ```
   [INFO] 2024-XX-XX XX:XX:XX.XXX DevScope extension activating...
   [INFO] 2024-XX-XX XX:XX:XX.XXX Status bar item initialized
   [INFO] 2024-XX-XX XX:XX:XX.XXX Commands and watchers registered
   [INFO] 2024-XX-XX XX:XX:XX.XXX Attempting to start server automatically...
   [INFO] 2024-XX-XX XX:XX:XX.XXX Starting server with config: host=127.0.0.1, port=3000
   ```

### 3. 检查端口状态

#### 方法一：使用 netstat 命令
```bash
# Windows
netstat -an | findstr :3000

# Mac/Linux
netstat -an | grep :3000
```

#### 方法二：使用测试脚本
```bash
node test-server.js
```

### 4. 常见问题及解决方案

#### 问题1：扩展没有自动启动
**症状**：状态栏没有显示 DevScope 相关信息
**可能原因**：
- 激活事件配置问题
- 扩展编译失败

**解决方案**：
```bash
# 重新编译
npm run compile

# 手动重启扩展
Ctrl+Shift+P -> Developer: Reload Window
```

#### 问题2：端口被占用
**症状**：日志显示 "Port 3000 is already in use"
**解决方案**：
1. 找到占用端口的进程：
   ```bash
   # Windows
   netstat -ano | findstr :3000
   tasklist | findstr <PID>

   # Mac/Linux
   lsof -i :3000
   ```

2. 终止占用进程或更改端口：
   - 打开 VS Code 设置
   - 搜索 "devscopeapi.port"
   - 更改为其他端口（如 3001）

#### 问题3：权限被拒绝
**症状**：日志显示 "Permission denied for port 3000"
**解决方案**：
- 使用高于 1024 的端口
- 或者以管理员权限运行 VS Code

#### 问题4：扩展激活事件问题
**症状**：扩展没有在启动时自动激活
**解决方案**：
我们已经修复了激活事件配置，使用 `onStartupFinished` 替代了具体的命令激活。

### 5. 手动测试步骤

1. **启动服务器**：
   - 点击状态栏上的 DevScope 项目
   - 或使用命令：`Ctrl+Shift+P` -> "DevScope: 启动服务器"

2. **验证服务器运行**：
   - 状态栏应显示：`DevScope: Running @ 127.0.0.1:3000`
   - 在浏览器中访问：`http://127.0.0.1:3000/health`
   - 应返回类似：`{"status":"ok","version":"v1","pid":12345,"startedAt":"2024-XX-XX..."}`

3. **测试诊断 API**：
   - 访问：`http://127.0.0.1:3000/diagnostics`
   - 应返回当前工作区的诊断信息

### 6. 调试命令

在 VS Code 中可以使用以下命令：
- `DevScope: 启动服务器` - 手动启动服务器
- `DevScope: 停止服务器` - 停止服务器
- `DevScope: 重启服务器` - 重启服务器
- `DevScope: 显示状态` - 显示当前服务器状态

### 7. 日志级别

- `[INFO]`：正常操作信息
- `[WARN]`：警告信息（如端口冲突）
- `[ERROR]`：错误信息（如启动失败）

### 8. 性能监控

扩展会自动记录以下信息：
- 服务器启动时间
- 实际监听端口（如果与配置不同）
- 错误详情和堆栈跟踪

## 获取帮助

如果问题仍然存在：
1. 查看 DevScope 输出面板的完整日志
2. 检查 VS Code 开发者工具的控制台错误（`Help -> Toggle Developer Tools`）
3. 尝试在新的 VS Code 窗口中运行扩展
4. 检查系统防火墙是否阻止了本地连接