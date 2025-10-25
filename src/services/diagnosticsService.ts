import * as vscode from 'vscode';
import { DiagnosticItemDTO, DiagnosticsResponseDTO, Severity } from '../utils/types';

export { Severity } from '../utils/types';

function mapSeverity(sev: vscode.DiagnosticSeverity): Severity {
  switch (sev) {
    case vscode.DiagnosticSeverity.Error:
      return 'Error';
    case vscode.DiagnosticSeverity.Warning:
      return 'Warning';
    case vscode.DiagnosticSeverity.Information:
      return 'Info';
    case vscode.DiagnosticSeverity.Hint:
      return 'Hint';
    default:
      return 'Info';
  }
}

function getSeverityLevel(severity: Severity): number {
  switch (severity) {
    case 'Error':
      return 1;
    case 'Warning':
      return 2;
    case 'Info':
      return 3;
    case 'Hint':
      return 4;
    default:
      return 3;
  }
}

function shouldIncludeDiagnostic(diagnostic: vscode.Diagnostic, minSeverity: Severity): boolean {
  const diagnosticSeverity = mapSeverity(diagnostic.severity);
  const diagnosticLevel = getSeverityLevel(diagnosticSeverity);
  const minLevel = getSeverityLevel(minSeverity);
  return diagnosticLevel <= minLevel;
}

function toItem(uri: vscode.Uri, d: vscode.Diagnostic): DiagnosticItemDTO {
  return {
    uri: uri.toString(),
    range: {
      start: { line: d.range.start.line, char: d.range.start.character },
      end: { line: d.range.end.line, char: d.range.end.character }
    },
    severity: mapSeverity(d.severity),
    source: d.source ?? null,
    code: (typeof d.code === 'object' ? (d.code?.value ?? undefined) : d.code) ?? null,
    message: d.message
  };
}

export type Scope = 'active' | 'workspace' | 'all';

export async function getDiagnostics(scope: Scope, severity?: Severity): Promise<DiagnosticsResponseDTO> {
  const ts = Date.now();
  let entries: [vscode.Uri, readonly vscode.Diagnostic[]][] = [];

  if (scope === 'active') {
    const uri = vscode.window.activeTextEditor?.document.uri;
    if (uri) {
      const diags = vscode.languages.getDiagnostics(uri);
      entries = [[uri, diags]];
    }
  } else {
    entries = vscode.languages.getDiagnostics();
  }

  const items: DiagnosticItemDTO[] = [];
  let errors = 0, warnings = 0, infos = 0, hints = 0;
  const minSeverity = severity || 'Error';

  for (const [uri, arr] of entries) {
    for (const d of arr) {
      if (shouldIncludeDiagnostic(d, minSeverity)) {
        items.push(toItem(uri, d));
        switch (d.severity) {
          case vscode.DiagnosticSeverity.Error: errors++; break;
          case vscode.DiagnosticSeverity.Warning: warnings++; break;
          case vscode.DiagnosticSeverity.Information: infos++; break;
          case vscode.DiagnosticSeverity.Hint: hints++; break;
        }
      }
    }
  }

  return {
    meta: { version: 'v1', scope, ts },
    summary: { errors, warnings, infos, hints },
    items
  };
}

