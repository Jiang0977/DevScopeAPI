# MVP 验收清单

## 本地运行

- F5 启动扩展，状态栏显示 `DevScope: Running @ 127.0.0.1:3000`。
- 端口冲突时，弹窗提示+状态栏标红+日志通道记录；服务未启动。

## API 行为

- `GET /health` 返回：
  - 200 且包含 `status: "ok"`、`version: "v1"`、`host`、`port`、`pid`、`startedAt`。

- `GET /diagnostics`（默认 activeOnly=true）：
  - 200，返回结构：`{ meta:{version,scope,ts}, summary:{errors,warnings,infos,hints}, items:[...] }`。
  - 在活动文件无诊断时，`items` 为空但结构稳定，`summary` 计数为 0。

## 配置与重载

- 修改 `devscopeapi.port` 或 `devscopeapi.host` 后，扩展提示是否重启；重启后新配置生效。
- 修改 `devscopeapi.diagnostics.defaultScope` 后，无需重启即生效。

## curl 示例

```bash
curl -s http://127.0.0.1:3000/health | jq .
curl -s "http://127.0.0.1:3000/diagnostics?activeOnly=true" | jq .
curl -s "http://127.0.0.1:3000/diagnostics?workspaceOnly=true" | jq .
```

