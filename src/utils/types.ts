export type Severity = 'Error' | 'Warning' | 'Info' | 'Hint';

export interface PositionDTO {
  line: number;
  char: number;
}

export interface RangeDTO {
  start: PositionDTO;
  end: PositionDTO;
}

export interface DiagnosticItemDTO {
  uri: string;
  range: RangeDTO;
  severity: Severity;
  source?: string | null;
  code?: string | number | null;
  message: string;
}

export interface DiagnosticsResponseDTO {
  meta: { version: 'v1'; scope: 'active' | 'workspace' | 'all'; ts: number };
  summary: { errors: number; warnings: number; infos: number; hints: number };
  items: DiagnosticItemDTO[];
}

export interface ErrorResponseDTO {
  version: 'v1';
  requestId?: string;
  error: { code: string; message: string };
}

