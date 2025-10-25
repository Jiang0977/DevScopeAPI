export enum DiagnosticSeverity { Error = 0, Warning = 1, Information = 2, Hint = 3 }

export type Uri = { toString(): string } & { __raw?: string };

function makeUri(raw: string): Uri {
  return { toString: () => raw, __raw: raw };
}

const activeUri = makeUri('file:///active.ts');

export const window = {
  activeTextEditor: {
    document: { uri: activeUri }
  }
};

type Diagnostic = {
  range: { start: { line: number; character: number }; end: { line: number; character: number } };
  severity: DiagnosticSeverity;
  source?: string;
  code?: string | number | { value?: string | number };
  message: string;
};

const diagActive: Diagnostic[] = [
  { range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } }, severity: DiagnosticSeverity.Error, message: 'active err' }
];

const uri1 = makeUri('file:///a.ts');
const uri2 = makeUri('file:///b.ts');
const diag1: Diagnostic[] = [
  { range: { start: { line: 1, character: 0 }, end: { line: 1, character: 2 } }, severity: DiagnosticSeverity.Warning, message: 'w1' }
];
const diag2: Diagnostic[] = [
  { range: { start: { line: 2, character: 0 }, end: { line: 2, character: 2 } }, severity: DiagnosticSeverity.Information, message: 'i1' },
  { range: { start: { line: 3, character: 0 }, end: { line: 3, character: 2 } }, severity: DiagnosticSeverity.Hint, message: 'h1' }
];

export const languages = {
  getDiagnostics: (arg?: Uri) => {
    if (arg) {
      // active-only variant
      return diagActive;
    }
    // all diagnostics variant
    return [ [uri1, diag1], [uri2, diag2] ] as const;
  }
};

export const workspace = {} as any;

