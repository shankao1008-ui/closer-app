const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('lib/deviceSession.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;
function load() {
  const exports = {};
  vm.runInNewContext(source, { exports, require: () => ({ supabase: {} }) });
  return exports.ensureDeviceSession;
}
for (const anonymous of [false, true]) test(`preserves saved ${anonymous ? 'guest' : 'email'} identity`, async () => {
  const session = { user: { id: 'existing', is_anonymous: anonymous } };
  const client = { auth: { getSession: async () => ({ data: { session } }), signInAnonymously: () => assert.fail('must not replace identity') } };
  assert.equal(await load()(client), session);
});
test('concurrent startup and pairing create only one guest', async () => {
  let count = 0;
  const session = { user: { id: 'new', is_anonymous: true } };
  const client = { auth: { getSession: async () => ({ data: { session: null } }), signInAnonymously: async () => { count++; return { data: { session } }; } } };
  const ensure = load();
  const results = await Promise.all([ensure(client), ensure(client), ensure(client)]);
  assert.equal(count, 1);
  results.forEach(result => assert.equal(result, session));
});
test('failed creation can be retried without caching failure', async () => {
  let count = 0;
  const session = { user: { id: 'retry' } };
  const client = { auth: { getSession: async () => ({ data: { session: null } }), signInAnonymously: async () => ++count === 1 ? { error: new Error('disabled') } : { data: { session } } } };
  const ensure = load();
  await assert.rejects(ensure(client), /disabled/);
  assert.equal(await ensure(client), session);
});
test('session read error does not silently create a replacement account', async () => {
  const client = { auth: { getSession: async () => ({ error: new Error('storage') }), signInAnonymously: () => assert.fail('must not replace identity') } };
  await assert.rejects(load()(client), /storage/);
});
test('missing session fails explicitly', async () => {
  const client = { auth: { getSession: async () => ({ data: { session: null } }), signInAnonymously: async () => ({ data: { session: null } }) } };
  await assert.rejects(load()(client), /DEVICE_SESSION_MISSING/);
});
