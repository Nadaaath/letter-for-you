import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const base = process.env.API_BASE_URL?.replace(/\/$/, "");
if (!base || !base.startsWith("https://")) {
  throw new Error("Set API_BASE_URL to the HTTPS base ending in /dev");
}

async function request(path, { method = "GET", body, key } = {}) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const response = await fetch(base + path, {
      method,
      headers: {
        ...(body ? { "content-type": "application/json" } : {}),
        ...(key ? { "x-garden-key": key } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.status === 429 && attempt < 5) {
      await new Promise(resolve => setTimeout(resolve, 700 * (attempt + 1)));
      continue;
    }
    const data = await response.json().catch(() => ({}));
    return { status: response.status, data };
  }
}

let id;
let managementToken;
try {
  const health = await request("/health/db");
  assert.equal(health.status, 200, JSON.stringify(health.data));
  console.log("PASS: database health check");

  const created = await request("/api/vaults", {
    method: "POST", body: { name: `AWS smoke ${randomUUID()}`, description: "Synthetic test" },
  });
  assert.equal(created.status, 201, JSON.stringify(created.data));
  id = created.data.vault.id;
  managementToken = created.data.managementToken;
  const accessCode = created.data.accessCode;
  assert.ok(id && managementToken && accessCode);
  console.log("PASS: create garden transaction");

  const denied = await request(`/api/vaults/${id}`, { key: "0".repeat(64) });
  assert.equal(denied.status, 403);
  console.log("PASS: invalid management token rejected");

  const letter = await request(`/api/vaults/${id}/letters`, {
    method: "POST", key: managementToken,
    body: { title: "Synthetic AWS test", content: "Temporary test content" },
  });
  assert.equal(letter.status, 201, JSON.stringify(letter.data));
  console.log("PASS: create letter transaction");

  const unlocked = await request("/api/vaults/unlock", {
    method: "POST", body: { code: accessCode },
  });
  assert.equal(unlocked.status, 200, JSON.stringify(unlocked.data));
  assert.equal(unlocked.data.vault.letters.length, 1);
  console.log("PASS: unlock recipient code and read letter");
} finally {
  if (id && managementToken) {
    const removed = await request(`/api/vaults/${id}`, {
      method: "DELETE", key: managementToken,
    });
    console.log(removed.status === 200 ? "PASS: remove test garden" :
      `WARNING: manual cleanup may be needed for garden ${id} (HTTP ${removed.status})`);
  }
}
