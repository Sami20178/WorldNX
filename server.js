const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const CATALOG_PATH = path.join(__dirname, "catalog.json");
const APP_ORIGIN = process.env.APP_ORIGIN || "";

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be an integer from 1 to 65535");
}

function readCatalog() {
  const parsed = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.mods)) {
    throw new Error("catalog.json must use schemaVersion 1 and a mods array");
  }
  return parsed;
}

function json(res, status, body) {
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

  if (APP_ORIGIN && req.headers.origin === APP_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", APP_ORIGIN);
    res.setHeader("Vary", "Origin");
  }

  let url;
  try {
    url = new URL(req.url, "http://localhost");
  } catch {
    json(res, 400, { error: "bad_request" });
    return;
  }

  const pathname = url.pathname;
  const isCatalogRoute = pathname === "/api/catalog" || pathname.startsWith("/api/catalog/");

  if (isCatalogRoute && req.method === "OPTIONS") {
    res.writeHead(204, {
      "Allow": "GET, OPTIONS",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store"
    });
    res.end();
    return;
  }

  const routes = new Set(["/healthz", "/api/health", "/api/info", "/api/catalog"]);
  if (!routes.has(pathname) && !pathname.startsWith("/api/catalog/")) {
    json(res, 404, { error: "not_found" });
    return;
  }

  if (req.method !== "GET") {
    res.writeHead(405, {
      "Allow": isCatalogRoute ? "GET, OPTIONS" : "GET",
      "Content-Type": "application/json; charset=utf-8"
    });
    res.end(JSON.stringify({ error: "method_not_allowed" }));
    return;
  }

  if (pathname === "/healthz" || pathname === "/api/health") {
    json(res, 200, {
      status: "ok",
      service: "WorldNX",
      generation: "next-generation-of-OmniNX",
      version: require("./package.json").version
    });
    return;
  }

  if (pathname === "/api/info") {
    json(res, 200, {
      name: "WorldNX",
      purpose: "Next generation of OmniNX",
      status: "foundation",
      note: "This endpoint does not imply NEX or Nintendo service compatibility."
    });
    return;
  }

  let catalog;
  try {
    catalog = readCatalog();
  } catch {
    json(res, 503, { error: "catalog_unavailable" });
    return;
  }

  const id = pathname === "/api/catalog" ? null : decodeURIComponent(pathname.slice("/api/catalog/".length));
  if (id !== null) {
    const mod = catalog.mods.find((entry) => entry.id === id);
    if (!mod) {
      json(res, 404, { error: "catalog_entry_not_found" });
      return;
    }
    json(res, 200, { schemaVersion: catalog.schemaVersion, generatedAt: catalog.generatedAt, mod });
    return;
  }

  const query = (url.searchParams.get("q") || "").trim().toLocaleLowerCase("en");
  const platform = (url.searchParams.get("platform") || "").trim().toLocaleLowerCase("en");
  const status = (url.searchParams.get("status") || "").trim();
  const parsedLimit = Number.parseInt(url.searchParams.get("limit") || "100", 10);
  const limit = Number.isInteger(parsedLimit) ? Math.max(1, Math.min(parsedLimit, 100)) : 100;

  const mods = catalog.mods.filter((mod) => {
    const searchable = [mod.id, mod.name, mod.description, mod.platform, mod.compatibility, mod.license]
      .join(" ").toLocaleLowerCase("en");
    return (!query || searchable.includes(query)) &&
      (!platform || mod.platform.toLocaleLowerCase("en").includes(platform)) &&
      (!status || mod.status === status);
  }).slice(0, limit);

  json(res, 200, {
    schemaVersion: catalog.schemaVersion,
    generatedAt: catalog.generatedAt,
    total: mods.length,
    mods
  });
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`WorldNX server listening on ${HOST}:${PORT}`);
  });
}

module.exports = server;
