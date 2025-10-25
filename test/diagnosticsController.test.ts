import express from 'express';
import request from 'supertest';
import { diagnosticsHandler } from '../src/api/diagnosticsController';

jest.mock('../src/services/diagnosticsService', () => ({
  getDiagnostics: async (scope: 'active' | 'workspace' | 'all', severity?: 'Error' | 'Warning' | 'Info' | 'Hint') => ({
    meta: { version: 'v1', scope, ts: Date.now() },
    summary: { errors: 0, warnings: 0, infos: 0, hints: 0 },
    items: []
  })
}));

describe('diagnosticsController', () => {
  const app = express();
  app.get('/diagnostics', (req, res) => diagnosticsHandler(req, res));

  it('defaults to activeOnly=true and severity=error', async () => {
    const res = await request(app).get('/diagnostics');
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('active');
  });

  it('workspaceOnly=true selects workspace scope', async () => {
    const res = await request(app).get('/diagnostics').query({ workspaceOnly: 'true', activeOnly: 'false' });
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('workspace');
  });

  it('handles severity parameter with error value', async () => {
    const res = await request(app).get('/diagnostics').query({ severity: 'error' });
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('active');
  });

  it('handles severity parameter with warning value', async () => {
    const res = await request(app).get('/diagnostics').query({ severity: 'warning' });
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('active');
  });

  it('handles severity parameter with info value', async () => {
    const res = await request(app).get('/diagnostics').query({ severity: 'info' });
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('active');
  });

  it('handles severity parameter with hint value', async () => {
    const res = await request(app).get('/diagnostics').query({ severity: 'hint' });
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('active');
  });

  it('handles information as alias for info', async () => {
    const res = await request(app).get('/diagnostics').query({ severity: 'information' });
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('active');
  });

  it('handles invalid severity value (defaults to error)', async () => {
    const res = await request(app).get('/diagnostics').query({ severity: 'invalid' });
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('active');
  });

  it('handles case-insensitive severity values', async () => {
    const res = await request(app).get('/diagnostics').query({ severity: 'WARNING' });
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('active');
  });

  it('combines workspace scope with severity filter', async () => {
    const res = await request(app).get('/diagnostics').query({
      workspaceOnly: 'true',
      activeOnly: 'false',
      severity: 'info'
    });
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('workspace');
  });

  it('handles non-string severity parameter (defaults to error)', async () => {
    const res = await request(app).get('/diagnostics').query({ severity: 123 });
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('active');
  });

  // New tests for parameter priority logic
  it('workspaceOnly=true takes priority over default activeOnly', async () => {
    const res = await request(app).get('/diagnostics').query({ workspaceOnly: 'true' });
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('workspace');
  });

  it('explicit activeOnly=false with no workspaceOnly uses all scope', async () => {
    const res = await request(app).get('/diagnostics').query({ activeOnly: 'false' });
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('all');
  });

  it('no scope parameters uses default active behavior', async () => {
    const res = await request(app).get('/diagnostics');
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('active');
  });

  it('both parameters true uses activeOnly for backward compatibility', async () => {
    const res = await request(app).get('/diagnostics').query({
      activeOnly: 'true',
      workspaceOnly: 'true'
    });
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('active');
  });

  it('activeOnly=false and workspaceOnly=true uses workspace', async () => {
    const res = await request(app).get('/diagnostics').query({
      activeOnly: 'false',
      workspaceOnly: 'true'
    });
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('workspace');
  });

  it('activeOnly=true and workspaceOnly=false uses active', async () => {
    const res = await request(app).get('/diagnostics').query({
      activeOnly: 'true',
      workspaceOnly: 'false'
    });
    expect(res.status).toBe(200);
    expect(res.body.meta.scope).toBe('active');
  });
});

