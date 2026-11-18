import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const base = process.env.API_BASE_URL?.replace(/\/$/, '');
if (!base || !base.startsWith('https://')) {
  throw new Error('API_BASE_URL must be the HTTPS API Gateway base URL ending in /dev');
}

async function request(path, { method = 'GET', body, key, idempotencyKey } = {}) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await fetch(base + path, {
      method,
      signal: AbortSignal.timeout(15000),
      headers: {
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        ...(key ? { 'x-garden-key': key } : {}),
        ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.status === 429 && attempt < 4) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      continue;
    }
    const data = await response.json().catch(() => ({}));
    return { status: response.status, data };
  }
  throw new Error(`No response from ${path}`);
}

let gardenId;
let managementToken;
let failure;
try {
  const health = await request('/health');
  assert.equal(health.status, 200, 'API health endpoint failed');
  console.log('PASS: API health check');

  const dbHealth = await request('/health/db');
  assert.equal(dbHealth.status, 200, 'DynamoDB connectivity check failed');
  console.log('PASS: database connectivity');

  const created = await request('/api/vaults', {
    method: 'POST', body: { name: `AWS smoke ${randomUUID()}`, description: 'Synthetic test' },
  });
  assert.equal(created.status, 201, `Garden creation failed: HTTP ${created.status}`);
  gardenId = created.data.vault?.id;
  managementToken = created.data.managementToken;
  const accessCode = created.data.accessCode;
  assert.ok(gardenId && managementToken && accessCode, 'Missing garden credentials');
  console.log('PASS: create synthetic garden');

  const denied = await request(`/api/vaults/${gardenId}`, { key: '0'.repeat(64) });
  assert.equal(denied.status, 403, 'Invalid management token was accepted');
  console.log('PASS: invalid management token rejected');

  const letterBody = { title: 'Synthetic AWS test', content: 'Temporary test content' };
  const idempotencyKey = randomUUID();
  const letter = await request(`/api/vaults/${gardenId}/letters`, {
    method: 'POST', key: managementToken, idempotencyKey, body: letterBody,
  });
  assert.equal(letter.status, 201, `Letter creation failed: HTTP ${letter.status}`);
  assert.ok(letter.data.letter?.id);
  console.log('PASS: create letter');

  const repeated = await request(`/api/vaults/${gardenId}/letters`, {
    method: 'POST', key: managementToken, idempotencyKey, body: letterBody,
  });
  assert.equal(repeated.status, 201, 'Idempotent retry failed');
  assert.equal(repeated.data.letter?.id, letter.data.letter.id, 'Retry produced a duplicate letter');
  console.log('PASS: idempotent letter creation');

  const unlocked = await request('/api/vaults/unlock', {
    method: 'POST', body: { code: accessCode },
  });
  assert.equal(unlocked.status, 200, 'Recipient unlock failed');
  assert.equal(unlocked.data.vault?.letters?.length, 1, 'Unexpected letter count');
  console.log('PASS: recipient code unlock and read');
} catch (error) {
  failure = error;
} finally {
  if (gardenId && managementToken) {
    try {
      const removed = await request(`/api/vaults/${gardenId}`, {
        method: 'DELETE', key: managementToken,
      });
      assert.equal(removed.status, 200, `Synthetic garden cleanup failed: HTTP ${removed.status}`);
      console.log('PASS: remove synthetic garden');
    } catch (cleanupError) {
      console.error('FAILED CLEANUP for synthetic garden:', gardenId, cleanupError.message);
      failure ??= cleanupError;
    }
  }
}
if (failure) throw failure;
console.log('PASS: all AWS API smoke checks');
