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
    const requestHeaders = {
      host: "127.0.0.1:" + port,
      ...headers
    };
    if (body !== undefined &&
        !Object.keys(requestHeaders).some((key) => key.toLowerCase() === "content-length")) {
      requestHeaders["content-length"] = String(Buffer.byteLength(body));
    }
    const request = httpRequest({
      hostname: "127.0.0.1",
      port,
      path: "/mcp",
      method,
      headers: requestHeaders
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

function parseRpcPayload(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("event:") || trimmed.startsWith("data:")) {
    const data = trimmed.split(/\\r?\\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\\n");
    return JSON.parse(data);
  }
  return JSON.parse(trimmed);
}

test("WorldNX MCP exposes only general read-only project metadata", async (t) => {
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
    accept: "application/json, text/event-stream"
  };
  const protocolHeaders = {
    ...jsonHeaders,
    "mcp-protocol-version": "2025-11-25"
  };

  const initialize = await rawRequest(
    port,
    "POST",
    rpcBody(1, "initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "worldnx-contract-test", version: "1.0.0" }
    }),
    jsonHeaders
  );
  assert.equal(initialize.status, 200, initialize.text);
  const initialized = parseRpcPayload(initialize.text);
  assert.equal(initialized.result.serverInfo.name, "worldnx");

  const listed = await rawRequest(
    port,
    "POST",
    rpcBody(2, "tools/list"),
    protocolHeaders
  );
  assert.equal(listed.status, 200, listed.text);
  const tools = parseRpcPayload(listed.text).result.tools;
  const names = tools.map((tool) => tool.name);
  assert.deepEqual(names.sort(), ["get_api_health", "get_project_info"]);
  assert.ok(tools.every((tool) => tool.annotations?.readOnlyHint === true));

  const health = await rawRequest(
    port,
    "POST",
    rpcBody(3, "tools/call", { name: "get_api_health", arguments: {} }),
    protocolHeaders
  );
  assert.equal(health.status, 200, health.text);
  const healthText = parseRpcPayload(health.text).result.content[0].text;
  assert.equal(JSON.parse(healthText).service, "WorldNX");

  const info = await rawRequest(
    port,
    "POST",
    rpcBody(4, "tools/call", { name: "get_project_info", arguments: {} }),
    protocolHeaders
  );
  assert.equal(info.status, 200, info.text);
  const infoText = parseRpcPayload(info.text).result.content[0].text;
  const infoData = JSON.parse(infoText);
  assert.equal(infoData.name, "WorldNX");
  assert.equal("serverRepository" in infoData, false);
  assert.equal("sourceRepository" in infoData, false);

  const deniedOrigin = await rawRequest(
    port,
    "POST",
    rpcBody(5, "initialize", {
      protocolVersion: "2025-11-25",
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
      protocolVersion: "2025-11-25",
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
      protocolVersion: "2025-11-25",
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
