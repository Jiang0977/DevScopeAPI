import { getDiagnostics } from '../src/services/diagnosticsService';

describe('diagnosticsService.getDiagnostics', () => {
  it('returns active scope items and summary', async () => {
    const res = await getDiagnostics('active');
    expect(res.meta.scope).toBe('active');
    expect(res.summary.errors).toBe(1);
    expect(res.summary.warnings).toBe(0);
    expect(res.summary.infos).toBe(0);
    expect(res.summary.hints).toBe(0);
    expect(res.items.length).toBe(1);
  });

  it('returns workspace scope aggregated', async () => {
    const res = await getDiagnostics('workspace');
    expect(res.meta.scope).toBe('workspace');
    expect(res.summary.errors).toBe(0);
    expect(res.summary.warnings).toBe(1);
    expect(res.summary.infos).toBe(1);
    expect(res.summary.hints).toBe(1);
    expect(res.items.length).toBe(3);
  });
});

