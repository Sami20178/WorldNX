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

const handler = createMcpHandler(() => {
  const server = new McpServer(
    { name: "worldnx", version: packageInfo.version },
    {
      instructions:
        "This public service exposes only general WorldNX project and API status. It does not list, link, download, or install firmware, homebrew packages, payloads, or device tools. It performs no device operations and does not access private user data."
    }
  );

  server.registerTool(
    "get_api_health",
    {
      title: "WorldNX API health",
      description: "Returns public process and readiness metadata only.",
      inputSchema: z.object({}),
      annotations: readOnlyAnnotations
    },
    async () => {
      let ready = false;
      try {
        readCatalog();
        ready = true;
      } catch {
        // Keep health available without disclosing internal file or validation details.
      }
      return toolResult({
        status: "ok",
        ready,
        service: "WorldNX",
        version: packageInfo.version
      });
    }
  );

  server.registerTool(
    "get_project_info",
    {
      title: "WorldNX project information",
      description: "Returns general project purpose and the limits of this public API.",
      inputSchema: z.object({}),
      annotations: readOnlyAnnotations
    },
    async () => toolResult({
      name: "WorldNX",
      purpose: "Project and API foundation",
      status: "development",
      capabilities: ["public service health", "general project metadata"],
      limitations: [
        "No private account data",
        "No device operations",
        "No firmware, homebrew, or payload discovery",
        "No downloads or installation guidance",
        "No compatibility or safety guarantee"
      ]
    })
  );

  return server;
}, { maxRequestBodySize: 64 * 1024, responseMode: "json" });

const nodeHandler = toNodeHandler(handler, { maxRequestBodySize: 64 * 1024 });

export function handleMcpRequest(req, res) {
  return nodeHandler(req, res);
}
