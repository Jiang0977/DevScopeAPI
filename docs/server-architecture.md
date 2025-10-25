# Server 架构与错误处理（MVP）

## 启停与结构

- `createServer(config) -> { start, stop, isRunning }`
- 模块划分：
  - `server`: Express 实例、路由挂载、统一中间件与错误处理。
  - `controllers/diagnostics`: 参数解析、调用 service、序列化输出。
  - `services/diagnostics`: 封装 `vscode.languages.getDiagnostics()`，支持 `active|workspace|all` 范围与轻量节流/缓存（200–500ms）。
  - `utils`: requestId、日志、端口探测、错误映射。

## 中间件

- 请求 ID：响应头 `X-Request-Id` 与响应体 `requestId`（错误时）。
- JSON：统一 `application/json`；错误使用统一 `ErrorResponse`。
- 日志：启动/停止日志、请求摘要（方法、路径、耗时、状态码）。

## 错误映射

- 参数错误 → 400 `BadRequest`
- 端口占用 → 启动失败（扩展弹窗+日志），不返回 HTTP。
- VS Code API 异常 → 500 `InternalError`（附 `requestId`）。
- 未捕获异常 → 500；集中在统一错误处理中兜底。

## 安全

- 仅绑定 `127.0.0.1`（MVP），CORS 默认关闭。
- 后续支持 Token 鉴权（可通过请求头 `Authorization: Bearer <token>`）。

