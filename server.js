const http = require("node:http");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number.parseInt(process.env.PORT || "3000", 10);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be an integer from 1 to 65535");
}

const server = http.createServer((req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET" && (req.url === "/healthz" || req.url === "/api/health")) {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      status: "ok",
      service: "WorldNX",
      generation: "next-generation-of-OmniNX",
      version: require("./package.json").version
    }));
    return;
  }

  if (req.method === "GET" && req.url === "/api/info") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      name: "WorldNX",
      purpose: "Next generation of OmniNX",
      status: "foundation",
      note: "This endpoint does not imply NEX or Nintendo service compatibility."
    }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ error: "not_found" }));
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`WorldNX server listening on ${HOST}:${PORT}`);
  });
}

module.exports = server;
