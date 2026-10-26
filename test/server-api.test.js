const test = require("node:test");
const assert = require("node:assert/strict");

process.env.APP_ORIGIN = "https://worldnx.example";
const server = require("../server");

test("WorldNX HTTP API", async (t) => {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  });

  await t.test("GET /api/mods returns catalog JSON", async () => {
    const response = await fetch(`${baseUrl}/api/mods`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /application\/json/);
    const body = await response.json();
    assert.equal(body.schemaVersion, 1);
    assert.ok(Array.isArray(body.mods));
    assert.ok(body.mods.every((mod) => ["metadata-only", "disabled", "verified-download"].includes(mod.status)));
  });

  await t.test("health endpoints remain available", async () => {
    for (const route of ["/healthz", "/api/health"]) {
      const response = await fetch(`${baseUrl}${route}`);
      assert.equal(response.status, 200, route);
      assert.equal((await response.json()).status, "ok", route);
    }
  });

  await t.test("unknown routes return JSON 404", async () => {
    const response = await fetch(`${baseUrl}/not-a-route`);
    assert.equal(response.status, 404);
    assert.equal((await response.json()).error, "not_found");
  });

  await t.test("catalog rejects non-GET methods", async () => {
    const response = await fetch(`${baseUrl}/api/mods`, { method: "POST" });
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), "GET, OPTIONS");
    assert.equal((await response.json()).error, "method_not_allowed");
  });

  await t.test("CORS allows only the configured exact origin", async () => {
    const allowed = await fetch(`${baseUrl}/api/mods`, { headers: { Origin: "https://worldnx.example" } });
    assert.equal(allowed.headers.get("access-control-allow-origin"), "https://worldnx.example");
    const denied = await fetch(`${baseUrl}/api/mods`, { headers: { Origin: "https://other.example" } });
    assert.equal(denied.headers.get("access-control-allow-origin"), null);
  });
});
