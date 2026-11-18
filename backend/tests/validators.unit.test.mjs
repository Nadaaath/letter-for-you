import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createVaultSchema, updateVaultSchema, unlockVaultSchema,
} from '../src/validators/vault.validator.js';
import {
  createLetterSchema, updateLetterSchema,
} from '../src/validators/letter.validator.js';
import {
  generateManagementToken, normalizeCode,
} from '../src/services/code.service.js';

test('garden validation accepts a normal name and rejects an empty or long name', () => {
  assert.equal(createVaultSchema.safeParse({ name: 'My garden' }).success, true);
  assert.equal(createVaultSchema.safeParse({ name: '' }).success, false);
  assert.equal(createVaultSchema.safeParse({ name: 'x'.repeat(81) }).success, false);
  assert.equal(updateVaultSchema.safeParse({ description: 'Updated' }).success, true);
});

test('recipient access code validation requires a non-empty usable code', () => {
  assert.equal(unlockVaultSchema.safeParse({ code: 'ROSE-12345678' }).success, true);
  assert.equal(unlockVaultSchema.safeParse({ code: 'A' }).success, false);
  assert.equal(normalizeCode(' rose-ab12 '), 'ROSE-AB12');
});

test('letter validation rejects missing and oversized content', () => {
  assert.equal(createLetterSchema.safeParse({ content: 'Hello' }).success, true);
  assert.equal(createLetterSchema.safeParse({ content: '' }).success, false);
  assert.equal(createLetterSchema.safeParse({ content: 'x'.repeat(10001) }).success, false);
  assert.equal(updateLetterSchema.safeParse({ title: 'Updated title' }).success, true);
});

test('management tokens are 32 cryptographically random bytes encoded as hex', () => {
  const first = generateManagementToken();
  const second = generateManagementToken();
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.notEqual(first, second);
});
