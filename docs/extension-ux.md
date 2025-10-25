# DevScope 扩展 UX（MVP）

## 状态栏

- 文案：
  - 运行中：`DevScope: Running @ 127.0.0.1:3000`
  - 已停止：`DevScope: Stopped`
  - 异常：`DevScope: Error`（悬浮提示具体错误）
- 行为：点击切换启动/停止（同命令面板）。

## 命令面板（Commands）

- `DevScope: Start Server` —— 启动本地 API 服务。
- `DevScope: Stop Server` —— 停止本地 API 服务并释放端口。
- `DevScope: Restart Server` —— 重启，常用于配置变更后。
- `DevScope: Show Status` —— 弹窗显示 host/port/uptime/requests 等信息。

## 反馈与日志

- 端口占用（EADDRINUSE）：信息提示 + 状态栏标红 + 日志通道 `DevScope` 记录堆栈。
- 诊断读取失败：以 5xx 响应返回，带 `requestId`，日志通道记录溯源信息。
- host 设置为 `0.0.0.0`：首次启用强提示风险确认，可选“仅本次/永久允许”。

