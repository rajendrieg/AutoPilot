import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

// ============================================================================
// 1. ENVIRONMENT VALIDATION & CORE SYSTEM INITIALIZATION
// ============================================================================
const server = new Server(
  {
    name: "powerplatform-ai-infrastructure-controller",
    version: "2.5.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Multi-Scope Enterprise Token Broker
 * Secures runtime bearer credentials optimized for diverse tenant API permissions.
 */
async function getBearerToken(scopeType: "GRAPH" | "MANAGEMENT" | "POWERBI"): Promise<string> {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Initialization Failed: Missing core authentication variables.");
  }

  const url = `https://microsoftonline.com{tenantId}/oauth2/v2.0/token`;
  
  let scope = "";
  switch (scopeType) {
    case "GRAPH": scope = "https://microsoft.com"; break;
    case "MANAGEMENT": scope = "https://azure.com"; break;
    case "POWERBI": scope = "https://windows.net"; break;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    scope: scope,
  });

  const response = await axios.post(url, params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data.access_token;
}

// ============================================================================
// 2. DISCOVERABLE INTERACTION SCHEMAS (EXPOSING SKILLS TO THE AI)
// ============================================================================
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_environment_resources",
        description: "Searches for tenant SharePoint sites or Excel trackers using friendly, non-technical terms.",
        inputSchema: {
          type: "object",
          properties: {
            searchTerm: { type: "string", description: "Keywords (e.g., 'Risk Tracker', 'Onboarding')." },
          },
          required: ["searchTerm"],
        },
      },
      {
        name: "evaluate_current_schema",
        description: "Audits the structural columns of an active sheet/list to pinpoint empty field failures and generate plain-language improvements.",
        inputSchema: {
          type: "object",
          properties: {
            siteUrl: { type: "string", description: "Absolute path of the target SharePoint site." },
            listName: { type: "string", description: "Name or Guid of the active tracker list." },
          },
          required: ["siteUrl", "listName"],
        },
      },
      {
        name: "diagnose_and_optimize_workflow",
        description: "Analyzes raw code structures or active workflow errors to construct clear optimization options.",
        inputSchema: {
          type: "object",
          properties: {
            flowId: { type: "string", description: "Target identifier of the workflow to analyze." },
            runtimeErrorString: { type: "string", description: "Optional raw error message (e.g., 'Select action inputs must be an array')." }
          },
          required: ["flowId"],
        },
      },
      {
        name: "create_sharepoint_flow",
        description: "Compiles and deploys a clean, enterprise-hardened workflow engine using direct JSON injection.",
        inputSchema: {
          type: "object",
          properties: {
            flowDisplayName: { type: "string", description: "Visible business-friendly title of the workflow." },
            siteUrl: { type: "string" },
            listId: { type: "string" },
          },
          required: ["flowDisplayName", "siteUrl", "listId"],
        },
      },
      {
        name: "sync_flow_telemetry_to_powerbi",
        description: "Streams tracking data into a live Power BI push dataset, completely bypassing manual desktop dashboard configuration.",
        inputSchema: {
          type: "object",
          properties: {
            workspaceId: { type: "string" },
            datasetName: { type: "string" },
            telemetryRows: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  FlowName: { type: "string" },
                  RunId: { type: "string" },
                  Status: { type: "string" },
                  DurationSeconds: { type: "number" },
                  ErrorMessage: { type: "string" },
                  ExecutionTime: { type: "string" }
                },
                required: ["FlowName", "RunId", "Status", "DurationSeconds", "ExecutionTime"]
              }
            }
          },
          required: ["workspaceId", "datasetName", "telemetryRows"],
        }
      }
    ],
  };
});

// ============================================================================
// 3. CORE LOGIC RUNTIME ENGINE (RESOLVING INTENTS)
// ============================================================================
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_environment_resources": {
        const token = await getBearerToken("GRAPH");
        const { searchTerm } = args as { searchTerm: string };
        const url = `https://microsoft.com{encodeURIComponent(searchTerm)}`;
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(res.data.value.map((s: any) => ({ name: s.displayName, url: s.webUrl, id: s.id })))
          }],
        };
      }

      case "evaluate_current_schema": {
        const token = await getBearerToken("GRAPH");
        const { siteUrl, listName } = args as { siteUrl: string; listName: string };
        
        const host = new URL(siteUrl).hostname;
        const path = new URL(siteUrl).pathname;
        const siteIdRes = await axios.get(`https://microsoft.com{host}:${path}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const schemaUrl = `https://microsoft.com{siteIdRes.data.id}/lists/${encodeURIComponent(listName)}/columns`;
        const schemaRes = await axios.get(schemaUrl, { headers: { Authorization: `Bearer ${token}` } });
        
        const insights = schemaRes.data.value.map((c: any) => ({
          field: c.name,
          type: c.text ? "Text" : "Complex/Array",
          isNullable: !c.required
        }));

        return {
          content: [{
            type: "text",
            text: `Audit for '${listName}' complete. Columns: ${JSON.stringify(insights)}. Notice: Non-required fields could trigger silent workflow crashes if users leave them blank.`
          }]
        };
      }

      case "diagnose_and_optimize_workflow": {
        const token = await getBearerToken("MANAGEMENT");
        const envId = process.env.POWER_PLATFORM_ENVIRONMENT_ID;
        const { flowId, runtimeErrorString } = args as { flowId: string; runtimeErrorString?: string };

        const flowUrl = `https://azure.com{envId}/flows/${flowId}?api-version=2016-11-01`;
        const flowRes = await axios.get(flowUrl, { headers: { Authorization: `Bearer ${token}` } });
        const definition = flowRes.data.properties.definition;

        // Diagnostic parser handles common structural array/string block flaws automatically
        let automaticCorrectionSuggestion = "No known structural flaws detected.";
        if (runtimeErrorString && runtimeErrorString.includes("must be an array")) {
          automaticCorrectionSuggestion = "CRITICAL FIX Required: The 'Select' block is trying to pull data straight from a single text block output instead of a structured array bundle. We must inject a 'Filter_Array' step immediately before it to sift rows correctly.";
        }

        return {
          content: [{
            type: "text",
            text: `Workflow Blueprint Analysis Complete. Active Steps: ${JSON.stringify(Object.keys(definition.actions))}. Diagnosis: ${automaticCorrectionSuggestion}`
          }]
        };
      }

      case "create_sharepoint_flow": {
        const token = await getBearerToken("MANAGEMENT");
        const envId = process.env.POWER_PLATFORM_ENVIRONMENT_ID;
        const { flowDisplayName, siteUrl, listId } = args as any;

        // Hardened blueprint automatically injects the Filter Array step to handle empty rows safely
        const wdlPayload = {
          properties: {
            displayName: flowDisplayName,
            definition: {
              "$schema": "https://azure.com",
              "contentVersion": "1.0.0.0",
              "triggers": {
                "When_Item_Is_Added": {
                  "type": "ApiConnection",
                  "inputs": {
                    "host": { "connection": { "name": "@parameters('$connections')['shared_sharepointonline']['connectionId']" } },
                    "method": "get",
                    "path": `/datasets/${encodeURIComponent(siteUrl)}/tables/${encodeURIComponent(listId)}/items`
                  }
                }
              },
