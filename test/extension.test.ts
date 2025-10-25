import * as vscode from 'vscode';
import * as extension from '../src/extension';

// Mock vscode module
jest.mock('vscode');

describe('extension', () => {
  let mockContext: any;
  let mockCommands: any[] = [];
  let mockStatusBar: any;
  let mockWindow: any;

  beforeEach(() => {
    mockCommands = [];
    mockStatusBar = {
      text: '',
      tooltip: '',
      color: undefined,
      show: jest.fn(),
      command: ''
    };

    mockWindow = {
      createStatusBarItem: jest.fn(() => mockStatusBar),
      showInformationMessage: jest.fn(),
      showWarningMessage: jest.fn(),
      showErrorMessage: jest.fn()
    };

    (vscode as any).window = mockWindow;
    (vscode as any).commands = {
      registerCommand: jest.fn((command, callback) => {
        mockCommands.push({ command, callback });
        return { dispose: jest.fn() };
      })
    };
    (vscode as any).StatusBarAlignment = { Left: 1 };
    (vscode as any).ThemeColor = jest.fn();

    mockContext = {
      subscriptions: [],
      workspace: {
        getConfiguration: jest.fn(() => ({
          get: jest.fn((key: string, defaultValue: any) => {
            switch (key) {
              case 'port': return 3000;
              case 'host': return '127.0.0.1';
              case 'response.format': return 'v1';
              case 'diagnostics.defaultScope': return 'active';
              default: return defaultValue;
            }
          })
        }))
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('activate', () => {
    it('should register commands', async () => {
      await extension.activate(mockContext);

      expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(5);

      const registeredCommands = mockCommands.map(c => c.command);
      expect(registeredCommands).toContain('devscope.startServer');
      expect(registeredCommands).toContain('devscope.stopServer');
      expect(registeredCommands).toContain('devscope.restartServer');
      expect(registeredCommands).toContain('devscope.showStatus');
      expect(registeredCommands).toContain('devscope.toggle');
    });

    it('should create status bar item', async () => {
      await extension.activate(mockContext);

      expect(vscode.window.createStatusBarItem).toHaveBeenCalledWith(
        expect.any(String),
        vscode.StatusBarAlignment.Left,
        100
      );
    });

    it('should set initial status', async () => {
      await extension.activate(mockContext);

      expect(mockStatusBar.text).toBe('DevScope: Stopped');
      expect(mockStatusBar.tooltip).toBe('Click to start');
    });
  });

  describe('server control', () => {
    beforeEach(async () => {
      await extension.activate(mockContext);
    });

    it('should show correct message when showing status', async () => {
      const showStatusCommand = mockCommands.find(c => c.command === 'devscope.showStatus');
      await showStatusCommand.callback(mockContext);

      expect(mockWindow.showInformationMessage).toHaveBeenCalledWith(
        expect.stringContaining('DevScope @ http://127.0.0.1:3000')
      );
    });
  });

  describe('port handling', () => {
    it('should use port from configuration', async () => {
      await extension.activate(mockContext);

      const mockWorkspace = mockContext.workspace.getConfiguration();
      expect(mockWorkspace.get).toHaveBeenCalledWith('devscopeapi');
    });
  });
});