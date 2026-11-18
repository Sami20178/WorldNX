import { createRequire } from "node:module";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import * as z from "zod/v4";

const require = createRequire(import.meta.url);
const { readCatalog } = require("./server.js");
const packageInfo = require("./package.json");

const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
};

function toolResult(value) {
  return {
    content: [{
      type: "text",
      text: JSON.stringify(value, null, 2)
    }]
  };
}

function safeCatalogEntry(entry) {
  return {
    id: entry.id,
    name: entry.name,
    version: entry.version,
    description: entry.description,
    platform: entry.platform,
    compatibility: entry.compatibility,
    license: entry.license,
    status: entry.status
  };
}

const handler = createMcpHandler(() => {
  const server = new McpServer(
    { name: "worldnx", version: packageInfo.version },
    {
      instructions:
        "This is a public, read-only WorldNX metadata service. It never downloads software, changes a device, installs firmware, or accesses private user data. Catalog compatibility is not independently verified unless the returned metadata explicitly says otherwise."
    }
  );

  server.registerTool(
    "get_api_health",
    {
      title: "WorldNX API health",
      description: "Returns public process and catalog readiness metadata.",
      inputSchema: z.object({}),
      annotations: readOnlyAnnotations
    },
    async () => {
      let catalog = null;
      let ready = false;
      try {
        catalog = readCatalog();
        ready = true;
      } catch {
        // Health remains available when the catalog is not ready.
      }
      return toolResult({
        status: "ok",
        ready,
        service: "WorldNX",
        version: packageInfo.version,
        catalog: catalog ? {
          schemaVersion: catalog.schemaVersion,
          generatedAt: catalog.generatedAt,
          entries: catalog.mods.length
        } : null
      });
    }
  );

  server.registerTool(
    "get_project_info",
    {
      title: "WorldNX project information",
      description: "Returns public project purpose, repository links, and capability limits.",
      inputSchema: z.object({}),
      annotations: readOnlyAnnotations
    },
    async () => toolResult({
      name: "WorldNX",
      purpose: "Next generation of OmniNX",
      status: "foundation",
      serverRepository: "https://github.com/Sami20178/WorldNX",
      sourceRepository: "https://github.com/Sami20178/WorldNX-Source-Code",
      capabilities: ["public health metadata", "public project metadata", "read-only catalog metadata"],
      limitations: [
        "No private account data",
        "No device operations",
        "No firmware or payload downloads",
        "No installation or compatibility guarantee"
      ]
    })
  );

  server.registerTool(
    "list_catalog_entries",
    {
      title: "List WorldNX catalog metadata",
      description: "Searches public catalog metadata only; download URLs and installation data are never returned.",
      inputSchema: z.object({
        q: z.string().max(100).optional(),
        platform: z.string().max(80).optional(),
        status: z.string().max(80).optional(),
        limit: z.number().int().min(1).max(50).optional()
      }),
      annotations: readOnlyAnnotations
    },
    async ({ q, platform, status, limit }) => {
      const catalog = readCatalog();
      const query = (q || "").trim().toLowerCase();
      const platformFilter = (platform || "").trim().toLowerCase();
      const statusFilter = (status || "").trim().toLowerCase();
      const matches = catalog.mods.filter((entry) => {
        const searchable = [
          entry.id, entry.name, entry.description,
          entry.platform, entry.compatibility, entry.license, entry.status
        ].join(" ").toLowerCase();
        return (!query || searchable.includes(query)) &&
          (!platformFilter || entry.platform.toLowerCase().includes(platformFilter)) &&
          (!statusFilter || entry.status.toLowerCase() === statusFilter);
      });
      const pageSize = limit ?? 20;
      return toolResult({
        schemaVersion: catalog.schemaVersion,
        generatedAt: catalog.generatedAt,
        total: matches.length,
        returned: Math.min(matches.length, pageSize),
        mods: matches.slice(0, pageSize).map(safeCatalogEntry)
      });
    }
  );

  server.registerTool(
    "get_catalog_entry",
    {
      title: "Get WorldNX catalog metadata",
      description: "Returns one public metadata entry without download URLs or installation instructions.",
      inputSchema: z.object({
        id: z.string().min(1).max(128)
      }),
      annotations: readOnlyAnnotations
    },
    async ({ id }) => {
      const catalog = readCatalog();
      const entry = catalog.mods.find((item) => item.id === id);
      if (!entry) {
        return {
          isError: true,
          content: [{ type: "text", text: "Catalog entry not found." }]
        };
      }
      return toolResult({
        schemaVersion: catalog.schemaVersion,
        generatedAt: catalog.generatedAt,
        mod: safeCatalogEntry(entry)
      });
    }
  );

  return server;
});

const nodeHandler = toNodeHandler(handler);

export function handleMcpRequest(req, res, parsedBody) {
  return nodeHandler(req, res, parsedBody);
}
