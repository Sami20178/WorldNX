import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { request as httpRequest } from "node:http";

process.env.HOST = "127.0.0.1";
process.env.PORT = "3000";
process.env.APP_ORIGIN = "https://worldnx.example";
process.env.MCP_ALLOWED_HOSTS = "127.0.0.1,localhost";

const require = createRequire(import.meta.url);
const server = require("../server.js");

function rawRequest(port, method, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const request = httpRequest({
      hostname: "127.0.0.1",
      port,
      path: "/mcp",
      method,
      headers: {
        host: "127.0.0.1:" + port,
        ...headers
      }
    }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve({
        status: response.statusCode,
        headers: response.headers,
        text: Buffer.concat(chunks).toString("utf8")
      }));
    });
    request.on("error", reject);
    if (body !== undefined) request.write(body);
    request.end();
  });
}

function rpcBody(id, method, params = {}) {
  return JSON.stringify({ jsonrpc: "2.0", id, method, params });
}

test("WorldNX MCP exposes only read-only public metadata", async (t) => {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  t.after(async () => {
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
  });

  const port = server.address().port;
  const jsonHeaders = {
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
    "mcp-protocol-version": "2026-07-28"
  };

  const initialize = await rawRequest(
    port,
    "POST",
    rpcBody(1, "initialize", {
      protocolVersion: "2026-07-28",
      capabilities: {},
      clientInfo: { name: "worldnx-contract-test", version: "1.0.0" }
    }),
    jsonHeaders
  );
  assert.equal(initialize.status, 200);
  const initialized = JSON.parse(initialize.text);
  assert.equal(initialized.result.serverInfo.name, "worldnx");

  const listed = await rawRequest(
    port,
    "POST",
    rpcBody(2, "tools/list"),
    jsonHeaders
  );
  assert.equal(listed.status, 200);
  const tools = JSON.parse(listed.text).result.tools;
  const names = tools.map((tool) => tool.name);
  for (const name of [
    "get_api_health",
    "get_project_info",
    "list_catalog_entries",
    "get_catalog_entry"
  ]) assert.ok(names.includes(name), "missing MCP tool: " + name);
  assert.ok(tools.every((tool) => tool.annotations?.readOnlyHint === true));

  const health = await rawRequest(
    port,
    "POST",
    rpcBody(3, "tools/call", { name: "get_api_health", arguments: {} }),
    jsonHeaders
  );
  assert.equal(health.status, 200);
  const healthText = JSON.parse(health.text).result.content[0].text;
  assert.equal(JSON.parse(healthText).service, "WorldNX");

  const catalog = await rawRequest(
    port,
    "POST",
    rpcBody(4, "tools/call", {
      name: "list_catalog_entries",
      arguments: { limit: 10 }
    }),
    jsonHeaders
  );
  assert.equal(catalog.status, 200);
  const catalogText = JSON.parse(catalog.text).result.content[0].text;
  const catalogData = JSON.parse(catalogText);
  assert.ok(Array.isArray(catalogData.mods));
  for (const entry of catalogData.mods) {
    assert.equal("downloadUrl" in entry, false);
    assert.equal("releasesUrl" in entry, false);
    assert.equal("sourceUrl" in entry, false);
    assert.equal("sha256" in entry, false);
  }

  const deniedOrigin = await rawRequest(
    port,
    "POST",
    rpcBody(5, "initialize", {
      protocolVersion: "2026-07-28",
      capabilities: {},
      clientInfo: { name: "origin-test", version: "1.0.0" }
    }),
    { ...jsonHeaders, origin: "https://not-allowed.example" }
  );
  assert.equal(deniedOrigin.status, 403);

  const deniedHost = await rawRequest(
    port,
    "POST",
    rpcBody(6, "initialize", {
      protocolVersion: "2026-07-28",
      capabilities: {},
      clientInfo: { name: "host-test", version: "1.0.0" }
    }),
    { ...jsonHeaders, host: "attacker.example" }
  );
  assert.equal(deniedHost.status, 403);

  const previousHosts = process.env.MCP_ALLOWED_HOSTS;
  process.env.MCP_ALLOWED_HOSTS = "";
  const disabled = await rawRequest(
    port,
    "POST",
    rpcBody(7, "initialize", {
      protocolVersion: "2026-07-28",
      capabilities: {},
      clientInfo: { name: "disabled-test", version: "1.0.0" }
    }),
    jsonHeaders
  );
  assert.equal(disabled.status, 503);
  process.env.MCP_ALLOWED_HOSTS = previousHosts;

  const badJson = await rawRequest(port, "POST", "{", jsonHeaders);
  assert.equal(badJson.status, 400);

  const oversized = await rawRequest(
    port,
    "POST",
    "x".repeat(64 * 1024 + 1),
    { ...jsonHeaders, "content-length": String(64 * 1024 + 1) }
  );
  assert.equal(oversized.status, 413);
});
