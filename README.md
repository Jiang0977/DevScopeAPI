# DevScope API（VS Code 扩展）

在 VS Code 内启动本地 HTTP 服务，标准化暴露工程的诊断信息（Problems）与基本运行状态，便于 AI Agent、脚本或外部系统统一接入。

## 功能概览
- 启动/停止本地 HTTP 服务（默认 `127.0.0.1:3000`）
- 端点：
  - `GET /health`：健康检查与元信息
  - `GET /diagnostics`：诊断信息（默认返回活动文件）
- VS Code 状态栏显示运行状态；命令面板支持启动/停止/重启/查看状态
- 配置项：端口、主机、默认范围、响应版本

## 环境要求
- Node.js 18+（建议 18/20/22）
- VS Code 版本 ≥ `1.85.0`

## 安装与编译
```bash
npm install
npm run compile
```

## 在 VS Code 中调试运行
1. 打开本仓库于 VS Code
2. 运行视图选择配置 “Run Extension”，按 F5 启动扩展开发主机
3. 新窗口状态栏应显示 `DevScope: Running @ 127.0.0.1:3000`

## 快速验证（命令行）
```bash
# 健康检查（默认端口 3000）
curl -s http://127.0.0.1:3000/health | jq .

# 使用自定义端口（例如 8080）
curl -s http://127.0.0.1:8080/health | jq .

# 仅活动文件（默认）
curl -s "http://127.0.0.1:3000/diagnostics" | jq .

# 工作区范围
curl -s "http://127.0.0.1:3000/diagnostics?workspaceOnly=true&activeOnly=false" | jq .

# 按严重性级别过滤
curl -s "http://127.0.0.1:3000/diagnostics?severity=warning" | jq .
curl -s "http://127.0.0.1:3000/diagnostics?severity=info" | jq .

# 组合使用：工作区范围 + info 级别及以上
curl -s "http://127.0.0.1:3000/diagnostics?workspaceOnly=true&severity=info" | jq .

# 自定义端口 + 严重性过滤
curl -s "http://127.0.0.1:8080/diagnostics?workspaceOnly=true&severity=warning" | jq .
```

## 配置项（Settings）

### 网络配置
- **`devscopeapi.port: number`**（默认 `3000`，范围 `1024-65535`）
  - 设置 HTTP 服务器监听端口
  - 如果指定端口被占用，自动寻找可用端口
  - 端口冲突时会显示提示和解决方案
- **`devscopeapi.host: string`**（默认 `127.0.0.1`）
  - 设置监听地址，建议使用 `127.0.0.1` 保证安全

### 功能配置
- **`devscopeapi.response.format: string`**（默认 `v1`）
  - API 响应格式版本
- **`devscopeapi.diagnostics.defaultScope: "active" | "workspace" | "all"`**（默认 `"active"`）
  - 默认诊断范围设置

### 端口配置方法

1. **VS Code 设置界面**：
   - 打开设置 (`Ctrl/Cmd + ,`)
   - 搜索 "devscope" 或 "DevScope"
   - 修改 "DevScope Api › Port" 数值

2. **settings.json 配置**：
   ```json
   {
     "devscopeapi.port": 8080
   }
   ```

3. **命令行验证**：
   ```bash
   # 使用自定义端口访问 API
   curl "http://127.0.0.1:8080/health"
   curl "http://127.0.0.1:8080/diagnostics"
   ```

### 端口冲突处理
- **自动检测**：启动前检查端口可用性
- **智能选择**：端口被占用时自动寻找可用端口
- **友好提示**：显示冲突原因和解决建议
- **快速操作**：提供打开设置、重试等快捷操作

**注意事项**：
- 变更 `host/port` 需重启服务
- 扩展会自动提示是否立即重启生效
- 低于 1024 的端口可能需要管理员权限

## API 契约
- OpenAPI 文档：`docs/api/openapi.yaml`

### 诊断 API 参数说明
`GET /diagnostics` 支持以下查询参数：

- **activeOnly** (boolean, 默认 true)：仅返回活动文件的诊断
- **workspaceOnly** (boolean, 默认 false)：仅返回工作区范围诊断
- **severity** (string, 默认 error)：按严重性级别过滤诊断信息
  - `error`：仅返回错误级别
  - `warning`：返回警告及以上级别（警告 + 错误）
  - `info`：返回信息及以上级别（信息 + 警告 + 错误）
  - `hint`：返回所有级别（提示 + 信息 + 警告 + 错误）

**参数优先级说明**：

1. **范围参数优先级**：
   - 如果用户显式设置 `workspaceOnly=true`，将覆盖默认的 `activeOnly=true` 行为
   - `activeOnly=false` 且未设置 `workspaceOnly` → 返回所有文件诊断 (`all`)
   - 两个参数都为 true → 为了向后兼容，使用 `active` 范围

2. **参数组合规则**：
   - severity 参数与 scope 参数正交独立，可组合使用
   - severity 控制诊断的严重性过滤
   - activeOnly/workspaceOnly 控制空间范围

3. **常见使用场景**：
   - 获取工作区所有警告：`?workspaceOnly=true&severity=warning`
   - 获取活动文件信息及以上：`?severity=info`（默认行为）
   - 获取全项目提示及以上：`?activeOnly=false&severity=hint`

### 示例响应
- `GET /health`
```json
{
  "status": "ok",
  "version": "v1",
  "pid": 12345,
  "startedAt": "2025-01-01T00:00:00.000Z",
  "host": "127.0.0.1",
  "port": 3000
}
```

- `GET /diagnostics`
```json
{
  "meta": { "version": "v1", "scope": "active", "ts": 1730000000000 },
  "summary": { "errors": 0, "warnings": 1, "infos": 0, "hints": 0 },
  "items": [
    {
      "uri": "file:///path/to/file.ts",
      "range": { "start": { "line": 1, "char": 0 }, "end": { "line": 1, "char": 2 } },
      "severity": "Warning",
      "source": "ts",
      "code": "1234",
      "message": "Something to fix"
    }
  ]
}
```

## 命令与状态栏
- 命令面板：
  - `DevScope: Start Server`
  - `DevScope: Stop Server`
  - `DevScope: Restart Server`
  - `DevScope: Show Status`
- 状态栏：
  - 正常：`DevScope: Running @ 127.0.0.1:3000`
  - 停止：`DevScope: Stopped`
  - 异常：`DevScope: Error`（悬浮提示具体原因）

## 安全与注意事项
- 默认仅监听 `127.0.0.1`，避免被局域网访问
- 如需对外 (`0.0.0.0`)，务必结合系统防火墙与后续的 Token 鉴权（M2 计划）
- 诊断可能较多，大仓建议按需使用 `active` 或 `workspace` 范围

## 运行测试
```bash
npm test
```
测试使用了 `jest` + `supertest`，并对 `vscode` API 做了轻量 mock。

## 主要文件
- 扩展入口：`src/extension.ts:1`
- 服务启动：`src/server.ts:1`
- 诊断控制器：`src/api/diagnosticsController.ts:1`
- 诊断服务：`src/services/diagnosticsService.ts:1`
- 配置读取：`src/config/index.ts:1`
- 类型与错误：`src/utils/types.ts:1`、`src/utils/errors.ts:1`
- 日志通道：`src/utils/logger.ts:1`

## 故障排查
- 端口被占用：
  - 状态栏显示 `Error`；命令面板/弹窗提示具体端口
  - 修改 `devscopeapi.port` 或释放占用后重试
- 接口 404：确认路由路径是否正确（`/health`、`/diagnostics`）
- 返回为空：活动文件无诊断属正常，可切换到 `workspaceOnly=true`

## 版本与发布
- 响应格式当前为 `v1`，后续变更将通过 `meta.version` 进行版本化
- 打包：
```bash
npm run package
```
将生成 `.vsix` 包，便于本地安装或上传到 Marketplace（需要配置 publisher）。

