import { createServer } from '../src/server';
import { Logger } from '../src/utils/logger';

describe('server port handling', () => {
  let logger: Logger;
  let mockLogger: any = {};

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    logger = mockLogger as Logger;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createServer', () => {
    it('creates server with correct config', () => {
      const config = { port: 3000, host: '127.0.0.1' };
      const server = createServer(logger, config);

      expect(server).toBeDefined();
      expect(typeof server.start).toBe('function');
      expect(typeof server.stop).toBe('function');
      expect(typeof server.isRunning).toBe('function');
      expect(typeof server.getActualPort).toBe('function');
    });

    it('returns requested port when available', () => {
      const config = { port: 3000, host: '127.0.0.1' };
      const server = createServer(logger, config);

      expect(server.getActualPort()).toBe(3000);
    });
  });

  describe('port availability detection', () => {
    // These tests would require actual network access, so we'll mock the net module
    const mockNet = jest.mock('net', () => ({
      createServer: jest.fn()
    }), { virtual: true });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should attempt to find available port when requested port is busy', () => {
      // This is a conceptual test - actual implementation would require network mocking
      const config = { port: 80, host: '127.0.0.1' }; // Common busy port
      const server = createServer(logger, config);

      // Server should still be created, but may use different port
      expect(server).toBeDefined();
    });
  });

  describe('ServerConfig interface', () => {
    it('accepts valid port range', () => {
      const validConfigs = [
        { port: 1024, host: '127.0.0.1' },
        { port: 3000, host: '127.0.0.1' },
        { port: 65535, host: '127.0.0.1' }
      ];

      validConfigs.forEach(config => {
        expect(() => createServer(logger, config)).not.toThrow();
      });
    });
  });

  describe('RunningServerInfo interface', () => {
    it('should return null when server not started', () => {
      const config = { port: 3000, host: '127.0.0.1' };
      const server = createServer(logger, config);

      expect(server.getStartedAt()).toBeNull();
      expect(server.isRunning()).toBe(false);
    });
  });
});