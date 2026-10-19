import test from 'node:test';
import assert from 'node:assert/strict';
import { requireEntityList } from '../lib/entityResponse.js';

test('accepts standard Base44 entity arrays', () => {
  const rows = [{ id: 'a' }];
  assert.equal(requireEntityList(rows, 'Package'), rows);
});

test('unwraps data array responses', () => {
  assert.deepEqual(requireEntityList({ data: [{ id: 'a' }] }, 'Package'), [{ id: 'a' }]);
});

test('rejects malformed entity responses instead of treating them as no patient records', () => {
  const log = console.error;
  console.error = () => {};
  try {
    assert.throws(() => requireEntityList({ message: 'Unauthorized' }, 'Package'), /Package API returned an unexpected result/);
    assert.throws(() => requireEntityList(null, 'Package'), /unexpected result/);
  } finally {
    console.error = log;
  }
});
