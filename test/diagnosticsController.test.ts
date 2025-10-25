import express from 'express';
import request from 'supertest';
import { diagnosticsHandler } from '../src/api/diagnosticsController';

jest.mock('../src/services/diagnosticsService', () => ({
  getDiagnostics: async (scope: 'active' | 'workspace' | 'all') => ({
    meta: { version: 'v1', scope, ts: Date.now() },
    summary: { errors: 0, warnings: 0, infos: 0, hints: 0 },
    items: []
  })
}));

describe('diagnosticsController', () => {
  const app = express();
  app.get('/diagnostics', (req, res) => diagnosticsHandler(req, res));

  it('defaults to activeOnly=true', async () => {
    const res = await request(app).get('/diagnostics');
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('active');
  });

  it('workspaceOnly=true selects workspace scope', async () => {
    const res = await request(app).get('/diagnostics').query({ workspaceOnly: 'true', activeOnly: 'false' });
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('workspace');
  });
});

