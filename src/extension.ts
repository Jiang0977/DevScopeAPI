import * as vscode from 'vscode';
import * as path from 'path';
import { createServer } from './server';
import { Logger } from './utils/logger';
import { getConfig, onConfigChange } from './config';

// Localization helper
function localize(key: string, ...args: any[]): string {
  const config = vscode.workspace.getConfiguration('devscopeapi');
  const language = config.get<string>('language', 'en');

  try {
    const localization = require(path.join(__dirname, '..', '..', 'package.nls.' + language + '.json'));
    let message = localization[key] || key;

    // Replace placeholders with arguments
    if (args.length > 0) {
      args.forEach((arg, index) => {
        message = message.replace('{' + index + '}', arg.toString());
      });
    }

    return message;
  } catch (error) {
    // Fallback to key if localization fails
    return key;
  }
}

let statusBarItem: vscode.StatusBarItem;
let serverCtl: ReturnType<typeof createServer> | null = null;
let logger: Logger;
let cfgWatcher: vscode.Disposable | null = null;

function updateStatus(text: string, tooltip?: string, error = false) {
  try {
    if (!statusBarItem) {
      console.error('Status bar item not initialized');
      return;
    }
    statusBarItem.text = text;
    statusBarItem.tooltip = tooltip || 'DevScope API Server';
    statusBarItem.color = error ? new vscode.ThemeColor('errorForeground') : undefined;
    statusBarItem.show();
    logger.info(`Status updated: ${text}${error ? ' (ERROR)' : ''}`);
  } catch (e) {
    console.error('Failed to update status bar:', e);
  }
}

async function startServer(context: vscode.ExtensionContext) {
  const cfg = getConfig();
  logger.info(`Starting server with config: host=${cfg.host}, port=${cfg.port}`);

  if (!serverCtl) serverCtl = createServer(logger, { port: cfg.port, host: cfg.host });
  try {
    await serverCtl.start();
    const actualPort = serverCtl.getActualPort();
    const portDisplay = actualPort === cfg.port ? `${cfg.port}` : `${actualPort} (requested: ${cfg.port})`;
    updateStatus(`DevScope: Running @ ${cfg.host}:${portDisplay}`, 'Click to stop');
    logger.info(`Server successfully started on http://${cfg.host}:${actualPort}`);

    // Show port changed notification
    if (actualPort !== cfg.port) {
      vscode.window.showWarningMessage(
        `DevScope: Requested port ${cfg.port} was busy, using port ${actualPort} instead. You can change the port in settings.`,
        'Open Settings',
        'Learn More'
      ).then(selection => {
        if (selection === 'Open Settings') {
          vscode.commands.executeCommand('workbench.action.openSettings', 'devscopeapi.port');
        } else if (selection === 'Learn More') {
          vscode.env.openExternal(vscode.Uri.parse('https://code.visualstudio.com/docs/editor/settings'));
        }
      });
    }
  } catch (e: any) {
    logger.error('Server startup failed with error:', e);
    let msg = e?.message || 'Failed to start server';
    let actions: string[] = [];

    // Provide specific guidance for common errors
    if (e?.code === 'EADDRINUSE' || e?.message?.includes('busy') || e?.message?.includes('in use')) {
      msg = `Port ${cfg.port} is already in use. Please free up the port or choose a different port.`;
      actions = ['Open Settings', 'Retry'];
      logger.warn(`Port ${cfg.port} conflict detected`);
    } else if (e?.message?.includes('No available ports found')) {
      msg = `Ports ${cfg.port}-${cfg.port + 99} are all in use. Please check your network or change to a different port range.`;
      actions = ['Open Settings'];
      logger.warn(`All ports in range ${cfg.port}-${cfg.port + 99} are busy`);
    } else if (e?.message?.includes('EACCES') || e?.message?.includes('permission')) {
      msg = `Permission denied for port ${cfg.port}. Try using a higher port (above 1024) or run with administrator privileges.`;
      actions = ['Open Settings'];
      logger.warn(`Permission denied for port ${cfg.port}`);
    }

    updateStatus('DevScope: Error', msg, true);
    logger.error('Failed to start server', e);

    const choice = await vscode.window.showErrorMessage(`DevScope server failed to start: ${msg}`, ...actions);

    if (choice === 'Open Settings') {
      vscode.commands.executeCommand('workbench.action.openSettings', 'devscopeapi.port');
    } else if (choice === 'Retry') {
      logger.info('Retrying server startup in 1 second...');
      setTimeout(() => startServer(context), 1000); // Delay before retry
    } else {
      // User cancelled, update status to show stopped state
      updateStatus(localize('notifications.serverStopped'), 'Click to start');
    }
  }
}

async function stopServer() {
  if (serverCtl) {
    await serverCtl.stop();
    serverCtl = null;
  }
  updateStatus('DevScope: Stopped', 'Click to start');
}

async function restartServer(context: vscode.ExtensionContext) {
  await stopServer();
  await startServer(context);
}

export async function activate(context: vscode.ExtensionContext) {
  logger = new Logger('DevScope');
  logger.info('DevScope extension activating...');

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'devscope.toggle';
  updateStatus(localize('notifications.serverStopped'), localize('commands.showStatus'));
  logger.info('Status bar item initialized');

  context.subscriptions.push(statusBarItem);

  // Commands
  context.subscriptions.push(vscode.commands.registerCommand('devscope.startServer', () => startServer(context)));
  context.subscriptions.push(vscode.commands.registerCommand('devscope.stopServer', () => stopServer()));
  context.subscriptions.push(vscode.commands.registerCommand('devscope.restartServer', () => restartServer(context)));
  context.subscriptions.push(vscode.commands.registerCommand('devscope.showStatus', () => {
    const cfg = getConfig();
    const startedAt = (serverCtl?.getStartedAt() || undefined)?.toISOString() || 'n/a';
    const actualPort = serverCtl?.getActualPort() || cfg.port;
    const portDisplay = actualPort === cfg.port ? `${actualPort}` : `${actualPort} (requested: ${cfg.port})`;
    const statusMessage = `DevScope @ http://${cfg.host}:${portDisplay} | ${localize('notifications.configChangedActions.later')}: ${startedAt}`;
    vscode.window.showInformationMessage(statusMessage);
  }));

  // Status bar click toggles
  context.subscriptions.push(vscode.commands.registerCommand('devscope.toggle', async () => {
    if (serverCtl?.isRunning()) await stopServer(); else await startServer(context);
  }));

  // Config watcher
  cfgWatcher = onConfigChange(async () => {
    const pick = await vscode.window.showInformationMessage(localize('notifications.configChanged'), localize('notifications.configChangedActions.restartNow'), localize('notifications.configChangedActions.later'));
    if (pick === localize('notifications.configChangedActions.restartNow')) await restartServer(context);
  });
  context.subscriptions.push(cfgWatcher);

  logger.info('Commands and watchers registered');

  // Auto-start on activation
  logger.info('Attempting to start server automatically...');
  await startServer(context);
  logger.info('Extension activation completed');
}

export async function deactivate() {
  try {
    logger?.info('Deactivating DevScope extension...');
    await stopServer();
    cfgWatcher?.dispose();
    statusBarItem?.dispose();
    logger?.info('DevScope extension deactivated successfully');
  } catch (e) {
    console.error('Error during extension deactivation:', e);
  }
}
