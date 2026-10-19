import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
const requireSettings = createRequire(import.meta.resolve('@deepseek-ai/dsh-settings'));
const { updateVolatile } = requireSettings('@deepseek-ai/cosmokit');
import { Context } from '@deepseek-ai/cordis';
import { SettingsForms } from '@deepseek-ai/dsh-settings';
import * as Tapd from '../lib/index.js';
import { TYPERT } from '../lib/typert.js';

test('DSH 0.2 settings persist through live Config and credential events reconcile', async () => {
  const ctx = new Context();
  const saved = { tapdBaseUrl: 'https://www.tapd.cn', tapdApiBaseUrl: 'https://api.tapd.cn', mcpEnabled: false };
  const entry = { id: 'tapd-mcp', options: { id: 'tapd-mcp', config: { ...saved } } };
  let resolutions = 0;
  const services = ctx.plugin((child) => {
    child.provide('credentials', {
      async resolve() { resolutions++; return undefined; },
      async describe() { return { configured: false, writable: true }; },
      async set() {}, async unset() {},
    });
    child.provide('tools', {});
    child.provide('loader', { await: () => new Promise(() => {}) });
    child.provide('profileContext', {});
    child.provide('configEditor', {
      entries: () => [entry],
      configuration: () => [{ entry, inherited: {}, override: entry.options.config }],
      async edit(target, change) {
        target.options.config = change(target.options.config, {});
        // In-memory persistence seam mirrors Loader committing volatile references.
        const next = Tapd.Config(target.options.config);
        for (const key of Object.keys(saved)) updateVolatile(target.fiber.config[key], next[key]);
      },
    });
  });
  await services;
  const settings = ctx.plugin(SettingsForms);
  await settings;
  const plugin = ctx.plugin(Tapd, saved);
  entry.fiber = plugin;
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
    const originalUid = plugin.uid;
    await runtime.save({ ...saved, tapdBaseUrl: 'https://example.tapd.cn', tapdToken: '', clearTapdToken: false });
    assert.equal(entry.options.config.tapdBaseUrl, 'https://example.tapd.cn');
    assert.equal((await runtime.status()).tapdBaseUrl, 'https://example.tapd.cn');
    assert.equal(plugin.uid, originalUid, 'live changes do not recreate the service');
    await assert.rejects(runtime.save({ ...saved, tapdApiBaseUrl: 'http://insecure.example', tapdToken: '', clearTapdToken: false }), /HTTPS/);
    assert.equal(entry.options.config.tapdBaseUrl, 'https://example.tapd.cn');

  } finally {
    await plugin.dispose();
    await settings.dispose();
    await services.dispose();
  }
});

test('host RPC codecs expose the DSH 0.2 schema factory contract', () => {
  for (const invocation of TYPERT.invocations) {
    assert.equal(typeof invocation.result.create, 'function');
    assert.equal(typeof invocation.result.create().parse, 'function');
    for (const parameter of invocation.parameters) assert.equal(typeof parameter.codec.create, 'function');
  }
});
