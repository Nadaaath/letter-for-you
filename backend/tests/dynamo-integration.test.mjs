import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";

test("DynamoDB API lifecycle", async t => {
  if (!process.env.DYNAMODB_ENDPOINT) {
    t.skip("Set DYNAMODB_ENDPOINT for DynamoDB Local integration testing");
    return;
  }
  process.env.AWS_REGION ||= "us-east-1";
  process.env.RECIPIENT_CODE_HMAC_KEY ||= randomBytes(32).toString("hex");
  const { default: app } = await import("../src/app.js");
  const server = await new Promise(resolve => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = "http://127.0.0.1:" + server.address().port + "/api/vaults";
  const call = async (path, { method = "GET", body, key, requestId } = {}) => {
    const response = await fetch(base + path, {
      method,
      headers: {
        ...(body ? { "content-type": "application/json" } : {}),
        ...(key ? { "x-garden-key": key } : {}),
        ...(requestId ? { "x-request-id": requestId } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: response.status, data: await response.json() };
  };
  const result = await call("", { method: "POST", body: {
    name: "Test garden " + randomUUID(), description: "Synthetic test",
  } });
  assert.equal(result.status, 201);
  const id = result.data.vault.id;
  const key = result.data.managementToken;
  const code = result.data.accessCode;
  assert.ok(key && code);
  assert.equal((await call("/" + id, { key: "0".repeat(64) })).status, 403);

  const requestId = randomUUID();
  const body = { content: "Synthetic letter", title: "Hello" };
  const write = await call("/" + id + "/letters", {
    method: "POST", key, requestId, body,
  });
  assert.equal(write.status, 201);
  assert.equal(write.data.letter.id, requestId);
  const retry = await call("/" + id + "/letters", {
    method: "POST", key, requestId, body,
  });
  assert.equal(retry.status, 201);
  assert.equal(retry.data.letter.id, requestId);
  assert.equal((await call("/" + id + "/letters", { key })).data.letters.length, 1);
  assert.equal((await call("/" + id + "/letters", {
    method: "POST", key: "0".repeat(64), body: { content: "Forbidden" },
  })).status, 403);
  const unlocked = await call("/unlock", { method: "POST", body: { code } });
  assert.equal(unlocked.status, 200);
  assert.equal(unlocked.data.vault.letters.length, 1);
  assert.ok(!("ownerTokenHash" in unlocked.data.vault));

  const updated = await call("/" + id, {
    method: "PUT", key, body: { name: "Updated garden" },
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.vault.name, "Updated garden");
  assert.equal((await call("/" + id + "/letters/" + requestId, {
    method: "DELETE", key,
  })).status, 200);
  const toClean = await call("/" + id + "/letters", {
    method: "POST", key, body: { content: "Should be removed with garden" },
  });
  assert.equal(toClean.status, 201);
  assert.equal((await call("/" + id, { method: "DELETE", key })).status, 200);
  const { listGardenLetters } = await import("../src/repositories/garden.repository.js");
  assert.equal((await listGardenLetters(id)).length, 0);
  assert.equal((await call("/unlock", { method: "POST", body: { code } })).status, 404);
});
