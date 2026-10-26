const http = require("node:http");
const modCatalog = require("./mods.json");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const APP_ORIGIN = process.env.APP_ORIGIN || "";

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be an integer from 1 to 65535");
}

const routes = new Set(["/healthz", "/api/health", "/api/info", "/api/mods"]);

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "no-store");

  let pathname;
  try {
    pathname = new URL(req.url, "http://localhost").pathname;
  } catch {
    sendJson(res, 400, { error: "bad_request" });
    return;
  }

  if (APP_ORIGIN && req.headers.origin === APP_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", APP_ORIGIN);
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS" && pathname === "/api/mods") {
    res.writeHead(204, {
      "Allow": "GET, OPTIONS",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Accept, Content-Type",
      "Content-Length": "0"
    });
    res.end();
    return;
  }

  if (!routes.has(pathname)) {
    sendJson(res, 404, { error: "not_found" });
    return;
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", pathname === "/api/mods" ? "GET, OPTIONS" : "GET");
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  if (pathname === "/healthz" || pathname === "/api/health") {
    sendJson(res, 200, {
      status: "ok",
      service: "WorldNX",
      generation: "next-generation-of-OmniNX",
      version: require("./package.json").version
    });
    return;
  }

  if (pathname === "/api/mods") {
    sendJson(res, 200, modCatalog);
    return;
  }

  sendJson(res, 200, {
    name: "WorldNX",
    purpose: "Next generation of OmniNX",
    status: "foundation",
    note: "This endpoint does not imply NEX or Nintendo service compatibility."
  });
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`WorldNX server listening on ${HOST}:${PORT}`);
  });
}

module.exports = server;
