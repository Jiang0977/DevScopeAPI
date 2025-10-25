import * as vscode from 'vscode';

export class Logger {
  private channel: vscode.OutputChannel;

  constructor(name = 'DevScope') {
    this.channel = vscode.window.createOutputChannel(name);
  }

  info(msg: string) {
    this.channel.appendLine(`[INFO] ${new Date().toISOString()} ${msg}`);
  }

  warn(msg: string) {
    this.channel.appendLine(`[WARN] ${new Date().toISOString()} ${msg}`);
  }

  error(msg: string, err?: unknown) {
    const details = err instanceof Error ? `\n${err.stack || err.message}` : err ? `\n${String(err)}` : '';
    this.channel.appendLine(`[ERROR] ${new Date().toISOString()} ${msg}${details}`);
  }

  show() {
    this.channel.show(true);
  }
}

