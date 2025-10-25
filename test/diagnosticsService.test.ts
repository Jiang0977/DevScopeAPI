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

  it('returns workspace scope aggregated (default error severity)', async () => {
    const res = await getDiagnostics('workspace');
    expect(res.meta.scope).toBe('workspace');
    expect(res.summary.errors).toBe(0);
    expect(res.summary.warnings).toBe(0);
    expect(res.summary.infos).toBe(0);
    expect(res.summary.hints).toBe(0);
    expect(res.items.length).toBe(0);
  });

  it('filters by error severity (default behavior)', async () => {
    const res = await getDiagnostics('workspace', 'Error');
    expect(res.meta.scope).toBe('workspace');
    expect(res.summary.errors).toBe(0);
    expect(res.summary.warnings).toBe(0);
    expect(res.summary.infos).toBe(0);
    expect(res.summary.hints).toBe(0);
    expect(res.items.length).toBe(0);
  });

  it('filters by warning severity', async () => {
    const res = await getDiagnostics('workspace', 'Warning');
    expect(res.meta.scope).toBe('workspace');
    expect(res.summary.errors).toBe(0);
    expect(res.summary.warnings).toBe(1);
    expect(res.summary.infos).toBe(0);
    expect(res.summary.hints).toBe(0);
    expect(res.items.length).toBe(1);
  });

  it('filters by info severity', async () => {
    const res = await getDiagnostics('workspace', 'Info');
    expect(res.meta.scope).toBe('workspace');
    expect(res.summary.errors).toBe(0);
    expect(res.summary.warnings).toBe(1);
    expect(res.summary.infos).toBe(1);
    expect(res.summary.hints).toBe(0);
    expect(res.items.length).toBe(2);
  });

  it('filters by hint severity (includes all)', async () => {
    const res = await getDiagnostics('workspace', 'Hint');
    expect(res.meta.scope).toBe('workspace');
    expect(res.summary.errors).toBe(0);
    expect(res.summary.warnings).toBe(1);
    expect(res.summary.infos).toBe(1);
    expect(res.summary.hints).toBe(1);
    expect(res.items.length).toBe(3);
  });

  it('defaults to error severity when no severity provided', async () => {
    const resWithSeverity = await getDiagnostics('workspace', 'Error');
    const resWithoutSeverity = await getDiagnostics('workspace');
    expect(resWithSeverity.summary).toEqual(resWithoutSeverity.summary);
    expect(resWithSeverity.items).toEqual(resWithoutSeverity.items);
  });
});

