import assert from 'node:assert/strict';
import test from 'node:test';
import { Context } from '@deepseek-ai/cordis';
import { SettingsProvider } from '@deepseek-ai/dsh-settings';
import * as Tapd from '../lib/index.js';

test('current DSH loads saved settings and reconciles credential reference updates', async () => {
  const ctx = new Context();
  const saved = { tapdBaseUrl: 'https://www.tapd.cn', tapdApiBaseUrl: 'https://api.tapd.cn', mcpEnabled: false };
  const document = { 'tapd-mcp': { ...saved } };
  class MemorySettings extends SettingsProvider {
    writable = true;
    async load() { return document; }
    async persist(ns, value) { document[ns] = value; }
  }
  let resolutions = 0;
  const services = ctx.plugin((child) => {
    child.provide('credentials', {
      async resolve() { resolutions++; return undefined; },
      async describe() { return { configured: false, writable: true }; },
      async set() {}, async unset() {},
    });
    child.provide('tools', {});
  });
  await services;
  const settings = ctx.plugin(MemorySettings);
  await settings;
  const plugin = ctx.plugin(Tapd, {});
  try {
    await plugin;
    const runtime = ctx.get('tapdMcp');
    assert.ok(runtime);
    assert.deepEqual(await runtime.status(), { ...saved, tapdTokenConfigured: false, tapdTokenWritable: true, mcpPhase: 'stopped', mcpError: '' });
    const before = resolutions;
    ctx.emit('credentials/reference-updated', 'TAPD_ACCESS_TOKEN');
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(resolutions, before + 1);
    ctx.emit('credentials/reference-updated', 'UNRELATED_TOKEN');
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(resolutions, before + 1);
    await runtime.save({ ...saved, tapdBaseUrl: 'https://example.tapd.cn', tapdToken: '', clearTapdToken: false });
    assert.equal(document['tapd-mcp'].tapdBaseUrl, 'https://example.tapd.cn');
    assert.equal((await runtime.status()).tapdBaseUrl, 'https://example.tapd.cn');
  } finally {
    await plugin.dispose();
    await settings.dispose();
    await services.dispose();
  }
});
