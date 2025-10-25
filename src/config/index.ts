import * as vscode from 'vscode';

export interface DevScopeConfig {
  port: number;
  host: string;
  responseFormat: 'v1';
  defaultScope: 'active' | 'workspace' | 'all';
}

export function getConfig(): DevScopeConfig {
  const cfg = vscode.workspace.getConfiguration('devscopeapi');
  const port = cfg.get<number>('port', 3000);
  const host = cfg.get<string>('host', '127.0.0.1');
  const responseFormat = cfg.get<'v1'>('response.format', 'v1');
  const defaultScope = cfg.get<'active' | 'workspace' | 'all'>('diagnostics.defaultScope', 'active');
  return { port, host, responseFormat, defaultScope };
}

export function onConfigChange(listener: () => void): vscode.Disposable {
  return vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('devscopeapi')) {
      listener();
    }
  });
}

