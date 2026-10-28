const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const HOST = process.env.HOST || "0.0.0.0";
const rawPort = process.env.PORT ?? "3000";
const PORT = Number(rawPort);
const CATALOG_PATH = path.join(__dirname, "catalog.json");
const APP_ORIGIN = process.env.APP_ORIGIN || "";

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be an integer from 1 to 65535");
}

const REQUIRED_MOD_FIELDS = [
  "id",
  "name",
  "version",
  "description",
  "platform",
  "compatibility",
  "license",
  "status"
];

function validateCatalog(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) ||
      parsed.schemaVersion !== 1 || !Array.isArray(parsed.mods) ||
      typeof parsed.generatedAt !== "string" ||
      !/^\\d{4}-\\d{2}-\\d{2}$/.test(parsed.generatedAt)) {
    throw new Error("catalog.json must use schemaVersion 1, a YYYY-MM-DD generatedAt, and a mods array");
  }

  const generatedDate = new Date(parsed.generatedAt + "T00:00:00.000Z");
  if (Number.isNaN(generatedDate.getTime()) ||
      generatedDate.toISOString().slice(0, 10) !== parsed.generatedAt) {
    throw new Error("catalog.json generatedAt must be a real calendar date");
  }

  const ids = new Set();
  for (const mod of parsed.mods) {
    if (!mod || typeof mod !== "object" || Array.isArray(mod) ||
        REQUIRED_MOD_FIELDS.some((field) =>
          typeof mod[field] !== "string" ||
          !mod[field].trim() ||
          mod[field].length > 4096 ||
          /[\\u0000-\\u001F\\u007F]/.test(mod[field]))) {
      throw new Error("catalog.json contains an invalid mod entry");
    }
    if (!/^[a-z0-9][a-z0-9._-]{0,127}$/.test(mod.id)) {
      throw new Error("catalog.json contains an invalid mod ID");
    }
    if (ids.has(mod.id)) {
      throw new Error("catalog.json contains duplicate mod IDs");
    }
    ids.add(mod.id);

    for (const field of ["sourceUrl", "releasesUrl", "downloadUrl", "sha256"]) {
      const value = mod[field];
      if (value !== undefined && value !== null &&
          (typeof value !== "string" || !value.trim() || value.length > 2048)) {
        throw new Error("catalog.json field " + field + " must be null or a non-empty string of at most 2048 characters");
      }
    }

    for (const field of ["sourceUrl", "releasesUrl", "downloadUrl"]) {
      const value = mod[field];
      if (value === undefined || value === null) continue;
      let parsedUrl;
      try {
        parsedUrl = new URL(value);
      } catch {
        throw new Error("catalog.json field " + field + " must be a valid HTTPS URL");
      }
      if (parsedUrl.protocol !== "https:" || !parsedUrl.hostname ||
          parsedUrl.username || parsedUrl.password) {
        throw new Error("catalog.json field " + field + " must be a credential-free HTTPS URL");
      }
    }

    if (mod.sha256 !== undefined && mod.sha256 !== null &&
        !/^[a-fA-F0-9]{64}$/.test(mod.sha256)) {
      throw new Error("catalog.json field sha256 must contain exactly 64 hexadecimal characters");
    }
    if (mod.downloadUrl !== undefined && mod.downloadUrl !== null &&
        (mod.sha256 === undefined || mod.sha256 === null)) {
      throw new Error("catalog.json downloadUrl requires a SHA-256 checksum");
    }
  }
  return parsed;
}

function readCatalog() {
  const parsed = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
  return validateCatalog(parsed);
}

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
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
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
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
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "no-store"
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

  let id = null;
  if (pathname !== "/api/catalog") {
    try {
      id = decodeURIComponent(pathname.slice("/api/catalog/".length));
    } catch {
      json(res, 400, { error: "bad_request" });
      return;
    }
  }

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
  const rawLimit = url.searchParams.get("limit") || "100";
  const parsedLimit = /^\d+$/.test(rawLimit) ? Number(rawLimit) : Number.NaN;
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

server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.keepAliveTimeout = 5000;

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`WorldNX server listening on ${HOST}:${PORT}`);
  });
}

module.exports = server;
module.exports.validateCatalog = validateCatalog;
