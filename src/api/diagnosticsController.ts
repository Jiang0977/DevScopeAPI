import { Request, Response } from 'express';
import { getDiagnostics, Scope } from '../services/diagnosticsService';
import { HttpError, toErrorResponse } from '../utils/errors';

export async function diagnosticsHandler(req: Request, res: Response) {
  const requestId = res.locals.requestId as string | undefined;
  try {
    const q = req.query as Record<string, unknown>;
    const toBool = (val: unknown, def: boolean) => {
      if (val === undefined) return def;
      if (typeof val === 'string') return val.toLowerCase() === 'true' || val === '1';
      if (typeof val === 'number') return val === 1;
      if (typeof val === 'boolean') return val;
      return def;
    };
    const activeOnly = toBool(q.activeOnly, true);
    const workspaceOnly = toBool(q.workspaceOnly, false);

    let scope: Scope = 'all';
    if (activeOnly) scope = 'active';
    else if (workspaceOnly) scope = 'workspace';

    const data = await getDiagnostics(scope);
    res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const code = err instanceof HttpError ? err.code : 'InternalError';
    const status = err instanceof HttpError ? err.status : 500;
    res.status(status).json(toErrorResponse(code, message, requestId));
  }
}
