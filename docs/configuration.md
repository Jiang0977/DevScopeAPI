# DevScope API 配置清单（MVP）

- `devscopeapi.port: number`（默认 `3000`，范围 1024–65535）
  - 用于本地 HTTP 服务监听端口。
  - 变更后需重启服务方可生效（扩展可提示是否立即重启）。

- `devscopeapi.host: string`（默认 `"127.0.0.1"`）
  - 建议仅监听本机。设置为 `"0.0.0.0"` 时需要显式风险确认（对局域网可见）。

- `devscopeapi.response.format: string`（默认 `"v1"`）
  - 响应格式版本标识，当前仅 `v1`。预留后续升级通道。

- `devscopeapi.diagnostics.defaultScope: string`（`"active"|"workspace"|"all"`，默认 `"active"`）
  - 控制在未提供查询参数时 `/diagnostics` 的默认范围。

预留（M2，不在 MVP 内）：

- `devscopeapi.security.token: string`（默认空）
  - 开启后以 Bearer Token 校验请求；为空表示关闭鉴权。

- `devscopeapi.rateLimit.rps: number`（默认关闭）
  - 每秒请求上限，防止滥用；本地开发通常无需开启。

## 配置变更与热重载

- 端口或 host 变更涉及套接字监听，需要重启服务；扩展将弹窗提示是否立即重启。
- 其他配置（默认范围、响应版本）可热生效，必要时更新状态栏提示。

## 安全建议

- 默认仅绑定 `127.0.0.1`，避免被网络扫描。
- 需要对外暴露时，建议配合 Token 鉴权、系统防火墙与明确的调用白名单。

