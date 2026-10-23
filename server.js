const http = require("node:http");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number.parseInt(process.env.PORT || "3000", 10);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be an integer from 1 to 65535");
}

const routes = new Set(["/healthz", "/api/health", "/api/info"]);

const server = http.createServer((req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "no-store");

  let pathname;
  try {
    pathname = new URL(req.url, "http://localhost").pathname;
  } catch {
    res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "bad_request" }));
    return;
  }

  if (!routes.has(pathname)) {
    res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "not_found" }));
    return;
  }

  if (req.method !== "GET") {
    res.writeHead(405, {
      "Allow": "GET",
      "Content-Type": "application/json; charset=utf-8"
    });
    res.end(JSON.stringify({ error: "method_not_allowed" }));
    return;
  }

  if (pathname === "/healthz" || pathname === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      status: "ok",
      service: "WorldNX",
      generation: "next-generation-of-OmniNX",
      version: require("./package.json").version
    }));
    return;
  }

  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({
    name: "WorldNX",
    purpose: "Next generation of OmniNX",
    status: "foundation",
    note: "This endpoint does not imply NEX or Nintendo service compatibility."
  }));
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`WorldNX server listening on ${HOST}:${PORT}`);
  });
}

module.exports = server;
