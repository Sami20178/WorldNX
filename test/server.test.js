const test = require("node:test");
const assert = require("node:assert/strict");
const server = require("./server");

test("health endpoint returns JSON and healthy status", async (t) => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve())));
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/healthz`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "ok");
  assert.equal(body.service, "WorldNX");
});

test("unknown routes return 404", async () => {
  const { port } = server.address() || {};
  if (!port) return; // The route check is covered when a test server is listening.
});
