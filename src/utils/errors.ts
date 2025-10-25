import { ErrorResponseDTO } from './types';

export class HttpError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function toErrorResponse(code: string, message: string, requestId?: string): ErrorResponseDTO {
  return { version: 'v1', requestId, error: { code, message } };
}

