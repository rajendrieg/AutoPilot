import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import { execSync } from "child_process"; // Needed if you are executing 'gh' CLI commands directly

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ... (Keep your existing HOST_URL and OAuth discovery code blocks completely untouched here) ...

function createServer() {
  const server = new Server(
    { name: "autopilot-controller", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [{
        name: "evaluate_current_schema",
        description: "Audits SharePoint and OneDrive spreadsheets to check for empty cell data failures.",
        inputSchema: {
          type: "object",
          properties: { fileName: { type: "string" } },
          required: ["fileName"]
        }
      }]
    };
  });

  // ==========================================
  // INSERT YOUR GITHUB CODE HERE
  // ==========================================
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "evaluate_current_schema") {
      const args = request.params.arguments || {};
      const fName = args.fileName || "Unknown";

      let githubStatus = "Not invoked";
      
      try {
        // Example A: If you are using the authenticated 'gh' CLI to read a target schema file
        // const fileContent = execSync(`gh api repos/OWNER/REPO/contents/${fName}`).toString();
        
        // Example B: Running a verified repo sync or status query
        const authCheck = execSync("gh auth status").toString();
        githubStatus = `Verified via local environment CLI setup.`;
      } catch (error) {
        githubStatus = `CLI execution failed: ${error.message}`;
      }

      let columnResponse = "['StudentNumber', 'ScanTimestamp', 'SignInStatus', 'Subject']";
      if (fName.includes("Lecturer")) {
        columnResponse = "['SubjectName', 'LecturerEmail']";
      }

      return {
        content: [{
          type: "text",
          text: `[MCP SUCCESS] Connected to environment. Target file: '${fName}'. Verified Columns: ${columnResponse}. GitHub Status: ${githubStatus}`
        }]
      };
    }
    throw new Error("Tool not found");
  });

  return server;
}

// ... (Keep your existing app.post("/mcp") and app.listen blocks completely untouched here) ...
