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
    updateStatus(`DevScope: Running @ ${cfg.host}:${cfg.port}`, 'Click to stop');
  } catch (e: any) {
    const msg = e?.code === 'EADDRINUSE' ? `Port ${cfg.port} is in use` : (e?.message || 'Failed to start server');
    updateStatus('DevScope: Error', msg, true);
    logger.error('Failed to start server', e);
    vscode.window.showErrorMessage(`DevScope server failed to start: ${msg}`);
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
    vscode.window.showInformationMessage(`DevScope @ http://${cfg.host}:${cfg.port} | startedAt: ${startedAt}`);
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
