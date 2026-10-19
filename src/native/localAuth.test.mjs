import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeEmail, readLocalSession, startLocalSession, clearLocalSession, localAccountDataKey, LOCAL_SESSION_KEY } from './localAuth.js';
class Storage { data = new Map(); getItem(k) { return this.data.get(k) ?? null; } setItem(k,v) { this.data.set(k,String(v)); } removeItem(k) { this.data.delete(k); } }

test('local sign-in saves only non-secret profile fields and restores a session', () => {
  const storage = new Storage();
  assert.deepEqual(startLocalSession({email:'  Someone@Example.COM ',name:' BATO Tester ',password:'should-not-save'},storage), {email:'someone@example.com',name:'BATO Tester'});
  assert.deepEqual(readLocalSession(storage), {email:'someone@example.com',name:'BATO Tester'});
  assert.equal(storage.getItem(LOCAL_SESSION_KEY).includes('should-not-save'),false);
  assert.equal(Object.keys(JSON.parse(storage.getItem(LOCAL_SESSION_KEY))).sort().join(','), 'email,name');
  clearLocalSession(storage);
  assert.equal(readLocalSession(storage),null);
});
test('account scopes are isolated and invalid emails are rejected', () => {
  assert.notEqual(localAccountDataKey('one@example.com'),localAccountDataKey('two@example.com'));
  assert.equal(normalizeEmail(' A@B.C '),'a@b.c');
  assert.throws(() => normalizeEmail('invalid'),/valid email/);
  const storage = new Storage(); storage.setItem(LOCAL_SESSION_KEY,'{broken}');
  assert.equal(readLocalSession(storage),null);
});
