import { Request, Response } from 'express';
import { getDiagnostics, Scope, Severity } from '../services/diagnosticsService';
import { HttpError, toErrorResponse } from '../utils/errors';

function validateSeverity(val: unknown): Severity {
  if (typeof val !== 'string') return 'Error';
  const normalized = val.toLowerCase();
  switch (normalized) {
    case 'error':
      return 'Error';
    case 'warning':
      return 'Warning';
    case 'info':
    case 'information':
      return 'Info';
    case 'hint':
      return 'Hint';
    default:
      return 'Error';
  }
}

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

    // Check if scope parameters are explicitly set
    const hasActiveOnly = q.activeOnly !== undefined;
    const hasWorkspaceOnly = q.workspaceOnly !== undefined;

    // Only use defaults when no scope parameters are explicitly set
    const activeOnly = hasActiveOnly ? toBool(q.activeOnly, true) : true;
    const workspaceOnly = hasWorkspaceOnly ? toBool(q.workspaceOnly, false) : false;
    const severity = validateSeverity(q.severity);

    let scope: Scope = 'all';
    // Priority: explicit settings override defaults
    if (hasActiveOnly && activeOnly) {
      scope = 'active';
    } else if (hasWorkspaceOnly && workspaceOnly) {
      scope = 'workspace';
    } else if (hasActiveOnly && !activeOnly && !hasWorkspaceOnly) {
      // explicit activeOnly=false without workspaceOnly
      scope = 'all';
    } else if (!hasActiveOnly && !hasWorkspaceOnly) {
      // no scope parameters set, use default behavior (active)
      scope = 'active';
    } else if (activeOnly && workspaceOnly) {
      // both set true, activeOnly takes priority for backward compatibility
      scope = 'active';
    } else if (!activeOnly && workspaceOnly) {
      scope = 'workspace';
    } else {
      // fallback to all
      scope = 'all';
    }

    const data = await getDiagnostics(scope, severity);
    res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const code = err instanceof HttpError ? err.code : 'InternalError';
    const status = err instanceof HttpError ? err.status : 500;
    res.status(status).json(toErrorResponse(code, message, requestId));
  }
}
