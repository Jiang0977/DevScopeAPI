import * as vscode from 'vscode';
import { createServer } from './server';
import { Logger } from './utils/logger';
import { getConfig, onConfigChange } from './config';

let statusBarItem: vscode.StatusBarItem;
let serverCtl: ReturnType<typeof createServer> | null = null;
let logger: Logger;
let cfgWatcher: vscode.Disposable | null = null;

function updateStatus(text: string, tooltip?: string, error = false) {
  if (!statusBarItem) return;
  statusBarItem.text = text;
  statusBarItem.tooltip = tooltip;
  statusBarItem.color = error ? new vscode.ThemeColor('errorForeground') : undefined;
  statusBarItem.show();
}

async function startServer(context: vscode.ExtensionContext) {
  const cfg = getConfig();
  if (!serverCtl) serverCtl = createServer(logger, { port: cfg.port, host: cfg.host });
  try {
    await serverCtl.start();
    const actualPort = serverCtl.getActualPort();
    const portDisplay = actualPort === cfg.port ? `${cfg.port}` : `${actualPort} (requested: ${cfg.port})`;
    updateStatus(`DevScope: Running @ ${cfg.host}:${portDisplay}`, 'Click to stop');

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
    let msg = e?.message || 'Failed to start server';
    let actions: string[] = [];

    // Provide specific guidance for common errors
    if (e?.code === 'EADDRINUSE' || e?.message?.includes('busy') || e?.message?.includes('in use')) {
      msg = `Port ${cfg.port} is already in use. Please free up the port or choose a different port.`;
      actions = ['Open Settings', 'Retry'];
    } else if (e?.message?.includes('No available ports found')) {
      msg = `Ports ${cfg.port}-${cfg.port + 99} are all in use. Please check your network or change to a different port range.`;
      actions = ['Open Settings'];
    } else if (e?.message?.includes('EACCES') || e?.message?.includes('permission')) {
      msg = `Permission denied for port ${cfg.port}. Try using a higher port (above 1024) or run with administrator privileges.`;
      actions = ['Open Settings'];
    }

    updateStatus('DevScope: Error', msg, true);
    logger.error('Failed to start server', e);

    const choice = await vscode.window.showErrorMessage(`DevScope server failed to start: ${msg}`, ...actions);

    if (choice === 'Open Settings') {
      vscode.commands.executeCommand('workbench.action.openSettings', 'devscopeapi.port');
    } else if (choice === 'Retry') {
      setTimeout(() => startServer(context), 1000); // Delay before retry
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
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'devscope.toggle';
  updateStatus('DevScope: Stopped', 'Click to start');

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
    vscode.window.showInformationMessage(`DevScope @ http://${cfg.host}:${portDisplay} | startedAt: ${startedAt}`);
  }));

  // Status bar click toggles
  context.subscriptions.push(vscode.commands.registerCommand('devscope.toggle', async () => {
    if (serverCtl?.isRunning()) await stopServer(); else await startServer(context);
  }));

  // Config watcher
  cfgWatcher = onConfigChange(async () => {
    const pick = await vscode.window.showInformationMessage('DevScope config changed. Restart server to apply?', 'Restart now', 'Later');
    if (pick === 'Restart now') await restartServer(context);
  });
  context.subscriptions.push(cfgWatcher);

  // Auto-start on activation
  await startServer(context);
}

export async function deactivate() {
  await stopServer();
  cfgWatcher?.dispose();
}
