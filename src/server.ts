import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { diagnosticsHandler } from './api/diagnosticsController';
import { Logger } from './utils/logger';
import { toErrorResponse } from './utils/errors';
import * as net from 'net';

export interface ServerConfig {
  port: number;
  host: string;
}

/**
 * Check if a port is available
 */
function isPortAvailable(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.listen(port, host, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });

    server.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Find an available port starting from the given port
 */
async function findAvailablePort(startPort: number, host: string, maxAttempts = 100): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (await isPortAvailable(port, host)) {
      return port;
    }
  }
  throw new Error(`No available ports found in range ${startPort}-${startPort + maxAttempts - 1}`);
}

export interface RunningServerInfo {
  app: express.Express;
  server: http.Server;
  startedAt: Date;
}

export function createServer(logger: Logger, cfg: ServerConfig) {
  let running: RunningServerInfo | null = null;
  let actualPort = cfg.port;

  function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
    const id = Math.random().toString(36).slice(2, 10);
    res.locals.requestId = id;
    res.setHeader('X-Request-Id', id);
    next();
  }

  async function start(): Promise<void> {
    if (running) return;

    // Check port availability first
    logger.info(`Checking port availability for ${cfg.host}:${cfg.port}`);
    const portAvailable = await isPortAvailable(cfg.port, cfg.host);

    if (!portAvailable) {
      logger.warn(`Port ${cfg.port} is not available, searching for alternative...`);
      try {
        actualPort = await findAvailablePort(cfg.port, cfg.host);
        logger.info(`Found available port: ${actualPort}`);
      } catch (e) {
        throw new Error(`Port ${cfg.port} and alternative ports are not available. Please free up port ${cfg.port} or choose a different port.`);
      }
    } else {
      actualPort = cfg.port;
    }

    const app = express();

    app.disable('x-powered-by');
    app.use(requestIdMiddleware);
    app.use(express.json());

    // Health endpoint
    app.get('/health', (_req: Request, res: Response) => {
      const startedAt = running?.startedAt ?? new Date();
      res.json({ status: 'ok', version: 'v1', pid: process.pid, startedAt: startedAt.toISOString(), host: cfg.host, port: actualPort });
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
      const server = app.listen(actualPort, cfg.host);
      server.once('listening', () => {
        running = { app, server, startedAt: new Date() };
        const portInfo = actualPort === cfg.port ? `${actualPort}` : `${actualPort} (requested: ${cfg.port})`;
        logger.info(`Server listening on http://${cfg.host}:${portInfo}`);
        resolve();
      });
      server.once('error', (e) => {
        logger.error(`Failed to start server on port ${actualPort}`, e);
        if (actualPort !== cfg.port) {
          reject(new Error(`Failed to start on alternative port ${actualPort}. Port ${cfg.port} may be in use.`));
        } else {
          reject(e);
        }
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

  function getActualPort(): number {
    return actualPort;
  }

  return { start, stop, isRunning, getStartedAt, getActualPort };
}

