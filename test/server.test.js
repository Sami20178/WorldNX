const test = require("node:test");
const assert = require("node:assert/strict");
const server = require("../server");

test("health, info, and unknown routes behave as documented", async (t) => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve())));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  const health = await fetch(`${base}/healthz`);
  assert.equal(health.status, 200);
  assert.match(health.headers.get("content-type"), /application\/json/);
  const healthBody = await health.json();
  assert.equal(healthBody.status, "ok");
  assert.equal(healthBody.service, "WorldNX");

  const info = await fetch(`${base}/api/info`);
  assert.equal(info.status, 200);
  assert.equal((await info.json()).name, "WorldNX");

  const missing = await fetch(`${base}/missing`);
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).error, "not_found");
});
