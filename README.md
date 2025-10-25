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
# 健康检查
curl -s http://127.0.0.1:3000/health | jq .

# 仅活动文件（默认）
curl -s "http://127.0.0.1:3000/diagnostics" | jq .

# 工作区范围
curl -s "http://127.0.0.1:3000/diagnostics?workspaceOnly=true&activeOnly=false" | jq .
```

## 配置项（Settings）
- `devscopeapi.port: number`（默认 `3000`）
- `devscopeapi.host: string`（默认 `127.0.0.1`）
- `devscopeapi.response.format: string`（默认 `v1`）
- `devscopeapi.diagnostics.defaultScope: "active" | "workspace" | "all"`（默认 `"active"`）

变更 `host/port` 需重启服务；扩展会提示是否立即重启生效。

## API 契约
- OpenAPI 文档：`docs/api/openapi.yaml`

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

