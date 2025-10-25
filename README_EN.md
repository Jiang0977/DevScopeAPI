# DevScope API - VS Code Extension

A VS Code extension that starts a local HTTP service to standardize project diagnostics (Problems) and basic status information, enabling AI agents, scripts, or external systems to integrate uniformly.

## Features Overview
- Start/stop local HTTP service (default `127.0.0.1:3000`)
- Endpoints:
  - `GET /health`: Health check and meta information
  - `GET /diagnostics`: Diagnostic information (returns active file by default)
- VS Code status bar displays running status; command palette supports start/stop/restart/view status
- Configuration: port, host, default scope, response version
- Intelligent port detection and conflict resolution

## Requirements
- Node.js 18+ (recommended 18/20/22)
- VS Code version ≥ `1.85.0`

## Installation & Compilation
```bash
npm install
npm run compile
```

## Debugging in VS Code
1. Open this repository in VS Code
2. Select "Run Extension" in the Run view, press F5 to start extension development host
3. New window status bar should display `DevScope: Running @ 127.0.0.1:3000`

## Quick Validation (Command Line)
```bash
# Health check (default port 3000)
curl -s http://127.0.0.1:3000/health | jq .

# Use custom port (e.g., 8080)
curl -s http://127.0.0.1:8080/health | jq .

# Active file only (default)
curl -s "http://127.0.0.1:3000/diagnostics" | jq .

# Workspace scope
curl -s "http://127.0.0.1:3000/diagnostics?workspaceOnly=true&activeOnly=false" | jq .

# Filter by severity level
curl -s "http://127.0.0.1:3000/diagnostics?severity=warning" | jq .
curl -s "http://127.0.0.1:3000/diagnostics?severity=info" | jq .

# Combined: workspace scope + info level and above
curl -s "http://127.0.0.1:3000/diagnostics?workspaceOnly=true&severity=info" | jq .

# Custom port + severity filtering
curl -s "http://127.0.0.1:8080/diagnostics?workspaceOnly=true&severity=warning" | jq .
```

## Configuration (Settings)

### Network Configuration
- **`devscopeapi.port: number`** (default `3000`, range `1024-65535`)
  - Sets HTTP server listening port
  - Automatically searches for available port if specified port is occupied
  - Shows notifications and solutions on port conflicts
- **`devscopeapi.host: string`** (default `127.0.0.1`)
  - Sets listening address, recommended to use `127.0.0.1` for security

### Feature Configuration
- **`devscopeapi.response.format: string`** (default `v1`)
  - API response format version
- **`devscopeapi.diagnostics.defaultScope: "active" | "workspace" | "all"`** (default `"active"`)
  - Default diagnostics scope setting

### Port Configuration Methods

1. **VS Code Settings UI**:
   - Open Settings (`Ctrl/Cmd + ,`)
   - Search for "devscope" or "DevScope"
   - Modify "DevScope Api › Port" number value

2. **settings.json Configuration**:
   ```json
   {
     "devscopeapi.port": 8080
   }
   ```

3. **Command Line Verification**:
   ```bash
   # Access API using custom port
   curl "http://127.0.0.1:8080/health"
   curl "http://127.0.0.1:8080/diagnostics"
   ```

### Port Conflict Handling
- **Automatic Detection**: Checks port availability before startup
- **Intelligent Selection**: Automatically finds available port when requested port is busy
- **Friendly Notifications**: Displays conflict reasons and resolution suggestions
- **Quick Actions**: Provides open settings, retry, and other quick operations

**Important Notes**:
- Changing `host/port` requires service restart
- Extension will automatically prompt whether to restart immediately
- Ports below 1024 may require administrator privileges

## API Contract
- OpenAPI documentation: `docs/api/openapi.yaml`

### Diagnostics API Parameters
`GET /diagnostics` supports the following query parameters:

- **activeOnly** (boolean, default true): Return diagnostics from active file only
- **workspaceOnly** (boolean, default false): Return workspace scope diagnostics only
- **severity** (string, default error): Filter diagnostic information by severity level
  - `error`: Return error level only
  - `warning`: Return warning level and above (warning + error)
  - `info`: Return information level and above (info + warning + error)
  - `hint`: Return all levels (hint + info + warning + error)

### Parameter Priority Rules

1. **Scope Parameter Priority**:
   - If user explicitly sets `workspaceOnly=true`, it overrides default `activeOnly=true` behavior
   - `activeOnly=false` and no `workspaceOnly` set → return all file diagnostics (`all`)
   - Both parameters true → for backward compatibility, use `active` scope

2. **Parameter Combination Rules**:
   - severity parameter is orthogonal to scope parameters, can be used in combination
   - severity controls diagnostic severity filtering
   - activeOnly/workspaceOnly controls spatial scope

3. **Common Usage Scenarios**:
   - Get workspace all warnings: `?workspaceOnly=true&severity=warning`
   - Get active file info and above: `?severity=info` (default behavior)
   - Get all project hints and above: `?activeOnly=false&severity=hint`

### Example Responses

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

## Commands & Status Bar
- Command Palette:
  - `DevScope: Start Server`
  - `DevScope: Stop Server`
  - `DevScope: Restart Server`
  - `DevScope: Show Status`
- Status Bar:
  - Normal: `DevScope: Running @ 127.0.0.1:3000`
  - Stopped: `DevScope: Stopped`
  - Error: `DevScope: Error` (hover tooltip with specific reason)
  - Port Changed: `DevScope: Running @ 127.0.0.1:8080 (requested: 3000)`

## Security & Notes
- Default only listens on `127.0.0.1` to avoid local network access
- If external access needed (`0.0.0.0`), ensure system firewall and future token authentication (M2 planned)
- Intelligent port management prevents startup failures
- For large projects, consider using `active` or `workspace` scope for better performance

## Running Tests
```bash
npm test
```

## Main Files
- Extension entry: `src/extension.ts:1`
- Service startup: `src/server.ts:1`
- Diagnostics controller: `src/api/diagnosticsController.ts:1`
- Diagnostics service: `src/services/diagnosticsService.ts:1`
- Configuration: `src/config/index.ts:1`
- Types & errors: `src/utils/types.ts:1`, `src/utils/errors.ts:1`
- Logger: `src/utils/logger.ts:1`

## Troubleshooting

- **Port Conflicts**:
  - Status bar displays `Error` with specific port information
  - Automatic port search and user notifications
  - Provides "Open Settings" and "Retry" quick actions
  - Clear error messages with actionable solutions

- **API 404**: Verify route path is correct (`/health`, `/diagnostics`)

- **Empty Results**: Active file having no diagnostics is normal, try `workspaceOnly=true`

- **Permission Issues**: Ports below 1024 may require administrator privileges

## Version History & Releases
- **0.1.0**: Initial version with basic health check and diagnostics API
- **0.2.0**: Added severity parameter filtering for diagnostics API
- **0.3.0**: Enhanced port handling with intelligent detection and error management

## Upload to Marketplace
```bash
# Generate .vsix package for local installation
npm run package

# For publishing to VS Code Marketplace, configure publisher in package.json first
```

For detailed API documentation, see `docs/api/openapi.yaml`.