import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { diagnosticsHandler } from './api/diagnosticsController';
import { Logger } from './utils/logger';
import { toErrorResponse } from './utils/errors';

export interface ServerConfig {
  port: number;
  host: string;
}

export interface RunningServerInfo {
  app: express.Express;
  server: http.Server;
  startedAt: Date;
}

export function createServer(logger: Logger, cfg: ServerConfig) {
  let running: RunningServerInfo | null = null;

  function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
    const id = Math.random().toString(36).slice(2, 10);
    res.locals.requestId = id;
    res.setHeader('X-Request-Id', id);
    next();
  }

  async function start(): Promise<void> {
    if (running) return;
    const app = express();

    app.disable('x-powered-by');
    app.use(requestIdMiddleware);
    app.use(express.json());

    // Health endpoint
    app.get('/health', (_req: Request, res: Response) => {
      const startedAt = running?.startedAt ?? new Date();
      res.json({ status: 'ok', version: 'v1', pid: process.pid, startedAt: startedAt.toISOString(), host: cfg.host, port: cfg.port });
    });

    // Diagnostics
    app.get('/diagnostics', diagnosticsHandler);

    // Not found
    app.use((req: Request, res: Response) => {
      res.status(404).json(toErrorResponse('NotFound', `No route for ${req.method} ${req.path}`, res.locals.requestId));
    });

    // Error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      logger.error('Unhandled error', err);
      res.status(500).json(toErrorResponse('InternalError', 'Unexpected error', res.locals.requestId));
    });

    await new Promise<void>((resolve, reject) => {
      const server = app.listen(cfg.port, cfg.host);
      server.once('listening', () => {
        running = { app, server, startedAt: new Date() };
        logger.info(`Server listening on http://${cfg.host}:${cfg.port}`);
        resolve();
      });
      server.once('error', (e) => {
        reject(e);
      });
    });
  }

  async function stop(): Promise<void> {
    if (!running) return;
    const server = running.server;
    await new Promise<void>((resolve) => server.close(() => resolve()));
    logger.info('Server stopped');
    running = null;
  }

  function isRunning(): boolean {
    return !!running;
  }

  function getStartedAt(): Date | null {
    return running?.startedAt ?? null;
  }

  return { start, stop, isRunning, getStartedAt };
}

