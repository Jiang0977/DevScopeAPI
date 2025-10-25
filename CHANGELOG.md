# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- WebSocket support for real-time diagnostics updates
- Authentication and security features
- Performance metrics endpoint
- Configurable CORS settings

## [0.1.0] - 2024-01-25

### Added
- **Core Functionality**
  - Automatic local HTTP server startup on VS Code activation
  - Real-time VS Code diagnostics exposure via HTTP API
  - Support for multiple diagnostic scopes (active file, workspace, all)
  - Automatic port detection and dynamic allocation when ports are busy
  - Comprehensive error handling with user-friendly notifications

- **API Endpoints**
  - `/health` - Server health check and status information
  - `/diagnostics` - Diagnostic information with filtering options

- **User Interface**
  - Status bar integration showing server status
  - Click-to-toggle server functionality
  - Visual indicators for server states (running, stopped, error)

- **Configuration**
  - Configurable server port (default: 3000)
  - Configurable listening host (default: 127.0.0.1)
  - Default diagnostic scope setting
  - Multi-language support (English, Chinese)

- **Development Tools**
  - Comprehensive debugging system with detailed logging
  - Server testing script for validation
  - Developer-friendly error messages and troubleshooting guides

- **Documentation**
  - Complete README with installation and usage instructions
  - Debugging guide for troubleshooting
  - Publishing guide for Marketplace distribution
  - API documentation with examples

### Technical Details
- **Technology Stack**
  - TypeScript with strict type checking
  - Express.js for HTTP server functionality
  - Jest for testing framework
  - VS Code Extension API v1.85.0+

- **Code Quality**
  - Comprehensive error handling and logging
  - Memory-efficient server management
  - Graceful shutdown and cleanup procedures
  - Security-first design (localhost binding by default)

- **Internationalization**
  - Built-in localization support
  - Chinese (Simplified) and English language packs
  - Configurable display language

### Breaking Changes
- None (initial release)

### Known Issues
- None

### Security Notes
- Server binds to localhost (127.0.0.1) by default for security
- No external network access by default
- User must explicitly configure host binding for external access

---

## Version History

### Why 0.1.0?
This is the initial release of DevScope API. The version starts at 0.1.0 to indicate that while the core functionality is complete and tested, the extension may receive additional features and improvements in future releases.

### Future Roadmap
1. **0.2.0** - WebSocket support and real-time updates
2. **0.3.0** - Authentication and security features
3. **0.4.0** - Performance monitoring and metrics
4. **1.0.0** - Full feature set with stable API

---

## Support

- **Issues**: [GitHub Issues](https://github.com/Jiang0977/DevScopeAPI/issues)
- **Documentation**: [README](https://github.com/Jiang0977/DevScopeAPI/blob/main/README.md)
- **Marketplace**: [VS Code Marketplace](https://marketplace.visualstudio.com/)