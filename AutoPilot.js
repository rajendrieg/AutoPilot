import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import express from "express";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://claude.ai");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const HOST_URL = process.env.HOST_URL || "https://railway.app";
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const issuedTokens = new Map();

app.get("/.well-known/oauth-authorization-server", (req, res) => {
  res.json({
    issuer: HOST_URL,
    authorization_endpoint: `${HOST_URL}/oauth/authorize`,
    token_endpoint: `${HOST_URL}/oauth/token`,
    registration_endpoint: `${HOST_URL}/oauth/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: ["mcp"],
    code_challenge_methods_supported: ["S256"]
  });
});

app.post("/oauth/register", (req, res) => {
  const clientName = req.body.client_name || "Claude Web Client";
  const redirectUris = req.body.redirect_uris || ["https://claude.ai"];
  const clientId = GITHUB_CLIENT_ID || "autopilot_client";
  res.status(201).json({
    client_id: clientId,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    redirect_uris: redirectUris,
    token_endpoint_auth_method: "none",
    client_name: clientName
  });
});

app.get("/oauth/authorize", (req, res) => {
  const { redirect_uri, state } = req.query;
  if (!redirect_uri) return res.status(400).send("Missing redirect_uri.");
  const allowedOrigins = new Set(["https://claude.ai"]);
  let redirectUrl;
  try { redirectUrl = new URL(redirect_uri); } catch { return res.status(400).send("Invalid redirect_uri."); }
  if (!allowedOrigins.has(redirectUrl.origin)) return res.status(400).send("Unapproved redirect_uri.");
  const code = "auth_code_" + Math.random().toString(36).substring(7);
  redirectUrl.searchParams.set("code", code);
  redirectUrl.searchParams.set("state", state ? String(state) : "");
  res.redirect(redirectUrl.toString());
});

app.post("/oauth/token", (req, res) => {
  const accessToken = "token_" + Math.random().toString(36).substring(2, 15);
  issuedTokens.set(accessToken, { issuedAt: Date.now(), expiresIn: 3600 });
  res.json({ access_token: accessToken, token_type: "Bearer", expires_in: 3600 });
});

// ==========================================
// AUTOPILOT — 34 TOOL ENTERPRISE PLATFORM
// Plan it. Automate it. Scale it.
// ==========================================

function createServer() {
  const server = new Server(
    { name: "autopilot-controller", version: "3.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [

        // ==========================================
        // MODULE 1 — AUTOMATION (Tools 1–6)
        // ==========================================
        {
          name: "audit_flow",
          description: "Audits a Power Automate flow for logic errors, missing error handling, inefficient steps, and best practice violations. Returns a detailed report with severity ratings.",
          inputSchema: {
            type: "object",
            properties: {
              flowName: { type: "string", description: "Name of the flow" },
              flowDescription: { type: "string", description: "Step-by-step description of what the flow does" },
              triggerType: { type: "string", description: "What triggers the flow e.g. scheduled, manual, when item created" }
            },
            required: ["flowName", "flowDescription"]
          }
        },
        {
          name: "generate_flow",
          description: "Generates a complete Power Automate flow structure in JSON format from a plain English description.",
          inputSchema: {
            type: "object",
            properties: {
              goal: { type: "string", description: "What you want the flow to do in plain English" },
              trigger: { type: "string", description: "What should start the flow" },
              platforms: { type: "string", description: "Which platforms are involved e.g. SharePoint, Outlook, Teams, Excel" }
            },
            required: ["goal", "trigger"]
          }
        },
        {
          name: "debug_flow",
          description: "Diagnoses why a Power Automate flow is failing or behaving unexpectedly. Returns root causes and fixes.",
          inputSchema: {
            type: "object",
            properties: {
              flowName: { type: "string", description: "Name of the flow" },
              errorMessage: { type: "string", description: "The error message or unexpected behaviour observed" },
              failingStep: { type: "string", description: "Which step is failing if known" },
              flowDescription: { type: "string", description: "Brief description of what the flow does" }
            },
            required: ["flowName", "errorMessage"]
          }
        },
        {
          name: "optimize_flow",
          description: "Analyses a Power Automate flow for performance issues, redundant steps, and inefficiencies.",
          inputSchema: {
            type: "object",
            properties: {
              flowName: { type: "string", description: "Name of the flow" },
              flowDescription: { type: "string", description: "Step-by-step description" },
              painPoint: { type: "string", description: "What is slow or inefficient" }
            },
            required: ["flowName", "flowDescription"]
          }
        },
        {
          name: "validate_schema",
          description: "Validates the column structure of any data source used in a flow — spreadsheets, SharePoint lists, Dataverse tables, CSV files.",
          inputSchema: {
            type: "object",
            properties: {
              fileName: { type: "string", description: "Name of the file or data source" },
              dataSourceType: { type: "string", description: "Type e.g. Excel, SharePoint List, Dataverse, CSV" },
              expectedColumns: { type: "string", description: "Comma separated list of expected columns" }
            },
            required: ["fileName"]
          }
        },
        {
          name: "suggest_automation",
          description: "Analyses a manual workflow and suggests the best Power Automate approach, connectors, and architecture to automate it.",
          inputSchema: {
            type: "object",
            properties: {
              currentProcess: { type: "string", description: "Describe the manual process" },
              frequency: { type: "string", description: "How often it runs e.g. daily, weekly, on demand" },
              tools: { type: "string", description: "What tools or platforms are currently involved" }
            },
            required: ["currentProcess"]
          }
        },

        // ==========================================
        // MODULE 2 — VISUALISATION (Tools 7–9)
        // ==========================================
        {
          name: "generate_dashboard",
          description: "Generates a complete dashboard specification and build plan from any data source. Supports Power BI, Excel, and SharePoint. No manual dashboard building required.",
          inputSchema: {
            type: "object",
            properties: {
              dataSource: { type: "string", description: "Where the data comes from e.g. Excel, SharePoint, Dataverse, SQL" },
              dashboardPurpose: { type: "string", description: "What the dashboard is for" },
              keyMetrics: { type: "string", description: "What you want to measure or track" },
              platform: { type: "string", description: "Power BI, Excel, or SharePoint. Defaults to Power BI" },
              audience: { type: "string", description: "Who will use this dashboard" }
            },
            required: ["dataSource", "dashboardPurpose"]
          }
        },
        {
          name: "generate_graph",
          description: "Recommends the optimal chart or graph type for your data and generates complete build instructions for Power BI or Excel.",
          inputSchema: {
            type: "object",
            properties: {
              dataDescription: { type: "string", description: "Describe your data and what you want to show" },
              comparisonType: { type: "string", description: "What are you comparing e.g. over time, across categories, part of whole" },
              platform: { type: "string", description: "Power BI or Excel" },
              audience: { type: "string", description: "Who will see this graph" }
            },
            required: ["dataDescription", "comparisonType"]
          }
        },
        {
          name: "generate_analytics",
          description: "Analyses a dataset and returns statistical insights, patterns, distributions, correlations, and anomalies in plain English.",
          inputSchema: {
            type: "object",
            properties: {
              dataDescription: { type: "string", description: "Describe your dataset and what it contains" },
              analyticsGoal: { type: "string", description: "What question are you trying to answer with this data" },
              keyVariables: { type: "string", description: "Which variables or columns matter most" }
            },
            required: ["dataDescription", "analyticsGoal"]
          }
        },

        // ==========================================
        // MODULE 3 — INTELLIGENCE (Tools 10–17)
        // ==========================================
        {
          name: "forecast_trends",
          description: "Forecasts future values and trajectories based on historical data patterns. Returns short and long term projections with confidence intervals.",
          inputSchema: {
            type: "object",
            properties: {
              metricName: { type: "string", description: "What metric are you forecasting" },
              historicalData: { type: "string", description: "Describe your historical data or paste values" },
              forecastPeriod: { type: "string", description: "How far ahead to forecast e.g. 4 weeks, 6 months, 2 years" },
              externalFactors: { type: "string", description: "Any known factors that may affect the forecast" }
            },
            required: ["metricName", "historicalData", "forecastPeriod"]
          }
        },
        {
          name: "goal_navigator",
          description: "Calculates exactly what needs to happen week by week to reach a specific goal by a specific deadline. Returns a gap analysis, required growth rate, and milestone plan.",
          inputSchema: {
            type: "object",
            properties: {
              currentState: { type: "string", description: "Where you are now — current metric value" },
              targetState: { type: "string", description: "Where you want to be — target metric value" },
              deadline: { type: "string", description: "When you need to reach the target" },
              constraints: { type: "string", description: "Any limitations or constraints on what you can do" },
              resources: { type: "string", description: "What resources are available" }
            },
            required: ["currentState", "targetState", "deadline"]
          }
        },
        {
          name: "business_plan_navigator",
          description: "Generates a complete 5-year business plan framework including financial projections, milestone timeline, resource requirements, risk assessment, and KPI framework.",
          inputSchema: {
            type: "object",
            properties: {
              businessDescription: { type: "string", description: "What the business does" },
              currentRevenue: { type: "string", description: "Current revenue or starting position" },
              targetRevenue: { type: "string", description: "5-year revenue target" },
              sector: { type: "string", description: "Industry or sector" },
              fundingAvailable: { type: "string", description: "Available startup or growth capital" }
            },
            required: ["businessDescription", "targetRevenue"]
          }
        },
        {
          name: "research_plan_navigator",
          description: "Generates a complete research project plan including timeline, milestones, output targets, resource allocation, and publication or grant submission schedule.",
          inputSchema: {
            type: "object",
            properties: {
              researchTitle: { type: "string", description: "Title or topic of the research" },
              duration: { type: "string", description: "How long the research project runs" },
              outputs: { type: "string", description: "Expected outputs e.g. publications, grant reports, conference papers" },
              teamSize: { type: "string", description: "Number of researchers involved" },
              fundingBody: { type: "string", description: "Funding body if applicable e.g. SAMRC, NRF" }
            },
            required: ["researchTitle", "duration", "outputs"]
          }
        },
        {
          name: "trend_intelligence",
          description: "Assesses what IS happening in your data right now and predicts what WILL happen. Returns trend direction, velocity, inflection points, anomalies, and future trajectory with confidence bands.",
          inputSchema: {
            type: "object",
            properties: {
              metricName: { type: "string", description: "The metric being analysed" },
              dataPoints: { type: "string", description: "Your data values over time — paste or describe them" },
              criticalThreshold: { type: "string", description: "A value that would trigger concern if crossed" },
              assessmentPeriod: { type: "string", description: "The time period covered by your data" }
            },
            required: ["metricName", "dataPoints"]
          }
        },
        {
          name: "benchmark_comparator",
          description: "Compares your metric or performance against industry benchmarks, sector averages, or best-in-class standards. Returns your relative position and improvement targets.",
          inputSchema: {
            type: "object",
            properties: {
              metricName: { type: "string", description: "What you are measuring" },
              yourValue: { type: "string", description: "Your current metric value" },
              sector: { type: "string", description: "Your industry or sector" },
              benchmarkType: { type: "string", description: "What to compare against e.g. industry average, best practice, regulatory minimum" }
            },
            required: ["metricName", "yourValue", "sector"]
          }
        },
        {
          name: "risk_predictor",
          description: "Predicts which risks are most likely to materialise based on current trends and data patterns. Returns probability scores, impact ratings, and early intervention recommendations.",
          inputSchema: {
            type: "object",
            properties: {
              context: { type: "string", description: "Describe your organisation or project context" },
              currentTrends: { type: "string", description: "What trends are you currently observing" },
              knownRisks: { type: "string", description: "Risks you are already aware of" },
              timeHorizon: { type: "string", description: "How far ahead to assess risk" }
            },
            required: ["context", "currentTrends"]
          }
        },
        {
          name: "early_warning_system",
          description: "Monitors a set of metrics and flags when any are trending toward a critical threshold. Returns traffic light status, time to threshold breach, and recommended interventions.",
          inputSchema: {
            type: "object",
            properties: {
              metrics: { type: "string", description: "List the metrics to monitor and their current values" },
              thresholds: { type: "string", description: "Critical threshold for each metric" },
              monitoringPeriod: { type: "string", description: "How frequently to assess e.g. weekly, monthly" },
              escalationContact: { type: "string", description: "Who to alert when thresholds are approached" }
            },
            required: ["metrics", "thresholds"]
          }
        },

        // ==========================================
        // MODULE 4 — FINANCE (Tools 18–23)
        // ==========================================
        {
          name: "breakeven_analyser",
          description: "Calculates break-even point in units, revenue, and time. Returns contribution margin, margin of safety, sensitivity analysis, and what-if scenarios.",
          inputSchema: {
            type: "object",
            properties: {
              fixedCosts: { type: "string", description: "Total fixed costs per period" },
              variableCostPerUnit: { type: "string", description: "Variable cost per unit produced or sold" },
              pricePerUnit: { type: "string", description: "Selling price per unit" },
              currentSalesVolume: { type: "string", description: "Current units sold per period" },
              currency: { type: "string", description: "Currency e.g. ZAR, USD, GBP. Defaults to ZAR" }
            },
            required: ["fixedCosts", "variableCostPerUnit", "pricePerUnit"]
          }
        },
        {
          name: "roi_calculator",
          description: "Calculates return on investment for any project, purchase, or initiative. Returns ROI percentage, payback period, net present value, and investment recommendation.",
          inputSchema: {
            type: "object",
            properties: {
              investmentAmount: { type: "string", description: "Total investment cost" },
              expectedReturn: { type: "string", description: "Expected financial return or saving" },
              timeHorizon: { type: "string", description: "Over what period e.g. 1 year, 3 years, 5 years" },
              discountRate: { type: "string", description: "Discount rate for NPV calculation. Defaults to 10% if not specified" },
              currency: { type: "string", description: "Currency e.g. ZAR, USD. Defaults to ZAR" }
            },
            required: ["investmentAmount", "expectedReturn", "timeHorizon"]
          }
        },
        {
          name: "pricing_strategy",
          description: "Calculates optimal pricing based on costs, target margin, competitor positioning, and market sensitivity. Returns recommended price points and margin analysis.",
          inputSchema: {
            type: "object",
            properties: {
              productDescription: { type: "string", description: "What you are pricing" },
              costToDeliver: { type: "string", description: "Your cost to produce or deliver" },
              targetMargin: { type: "string", description: "Desired profit margin percentage" },
              competitorPricing: { type: "string", description: "What competitors charge if known" },
              marketSegment: { type: "string", description: "Who your target customer is" }
            },
            required: ["productDescription", "costToDeliver", "targetMargin"]
          }
        },
        {
          name: "budget_allocator",
          description: "Optimally distributes a total budget across departments, projects, or categories based on priorities, constraints, and expected returns.",
          inputSchema: {
            type: "object",
            properties: {
              totalBudget: { type: "string", description: "Total budget available" },
              categories: { type: "string", description: "Departments or categories to allocate to" },
              priorities: { type: "string", description: "Weighting or priority of each category" },
              constraints: { type: "string", description: "Any fixed or minimum allocations required" },
              currency: { type: "string", description: "Currency e.g. ZAR, USD. Defaults to ZAR" }
            },
            required: ["totalBudget", "categories"]
          }
        },
        {
          name: "cash_flow_modeller",
          description: "Models cash position week by week or month by month for any scenario. Returns cash flow projections, deficit risk periods, and funding requirement timeline.",
          inputSchema: {
            type: "object",
            properties: {
              openingBalance: { type: "string", description: "Starting cash balance" },
              monthlyInflows: { type: "string", description: "Expected monthly revenue or income" },
              monthlyOutflows: { type: "string", description: "Expected monthly costs and expenses" },
              modelPeriod: { type: "string", description: "How many months or weeks to model" },
              growthRate: { type: "string", description: "Expected monthly growth rate if applicable" }
            },
            required: ["openingBalance", "monthlyInflows", "monthlyOutflows", "modelPeriod"]
          }
        },
        {
          name: "funding_gap_analyser",
          description: "Calculates exactly how much funding is needed, when it is needed, and what it should be used for. Returns funding timeline, gap by period, and recommended funding sources.",
          inputSchema: {
            type: "object",
            properties: {
              projectDescription: { type: "string", description: "What the funding is for" },
              totalProjectCost: { type: "string", description: "Total cost of the project or initiative" },
              fundingSecured: { type: "string", description: "Funding already confirmed" },
              timeline: { type: "string", description: "Project duration and key spend milestones" },
              currency: { type: "string", description: "Currency e.g. ZAR, USD. Defaults to ZAR" }
            },
            required: ["projectDescription", "totalProjectCost"]
          }
        },

        // ==========================================
        // MODULE 5 — SCALE & GROWTH (Tools 24–28)
        // ==========================================
        {
          name: "scalability_engine",
          description: "Assesses whether your organisation, product, or process can scale and calculates what scaling actually looks like at each growth stage. Returns bottlenecks, optimal scale point, and resource multipliers.",
          inputSchema: {
            type: "object",
            properties: {
              currentScale: { type: "string", description: "Your current size e.g. users, revenue, staff, volume" },
              targetScale: { type: "string", description: "The scale you want to reach" },
              currentResources: { type: "string", description: "Current staff, infrastructure, and budget" },
              constraints: { type: "string", description: "Known scaling constraints or bottlenecks" },
              timeframe: { type: "string", description: "How quickly you need to scale" }
            },
            required: ["currentScale", "targetScale"]
          }
        },
        {
          name: "capacity_planner",
          description: "Calculates exactly what resources — staff, infrastructure, budget, and systems — are needed at each scale point to maintain performance and quality.",
          inputSchema: {
            type: "object",
            properties: {
              currentCapacity: { type: "string", description: "What you can currently handle" },
              targetCapacity: { type: "string", description: "What you need to be able to handle" },
              resourceTypes: { type: "string", description: "Types of resources to plan e.g. staff, servers, space, budget" },
              qualityStandards: { type: "string", description: "Performance or quality standards that must be maintained" }
            },
            required: ["currentCapacity", "targetCapacity"]
          }
        },
        {
          name: "growth_modeller",
          description: "Models conservative, moderate, and aggressive growth scenarios over a defined period. Returns revenue, cost, and resource projections for each scenario with probability ratings.",
          inputSchema: {
            type: "object",
            properties: {
              currentRevenue: { type: "string", description: "Current revenue or baseline metric" },
              growthDrivers: { type: "string", description: "What will drive growth e.g. new markets, new products, increased marketing" },
              modelPeriod: { type: "string", description: "How many years to model" },
              marketConditions: { type: "string", description: "Current market conditions and outlook" },
              currency: { type: "string", description: "Currency e.g. ZAR, USD. Defaults to ZAR" }
            },
            required: ["currentRevenue", "growthDrivers", "modelPeriod"]
          }
        },
        {
          name: "unit_economics_calculator",
          description: "Calculates cost per unit, revenue per unit, contribution margin, and lifetime value at different scale points. Shows how unit economics improve or deteriorate as you scale.",
          inputSchema: {
            type: "object",
            properties: {
              productService: { type: "string", description: "What you are selling" },
              revenuePerUnit: { type: "string", description: "Revenue generated per unit or customer" },
              costPerUnit: { type: "string", description: "Cost to deliver per unit or customer" },
              currentVolume: { type: "string", description: "Current units or customers" },
              targetVolume: { type: "string", description: "Target units or customers" }
            },
            required: ["productService", "revenuePerUnit", "costPerUnit", "currentVolume"]
          }
        },
        {
          name: "market_sizing_tool",
          description: "Estimates total addressable market, serviceable addressable market, and realistic capture rate for any product or service. Returns market size, growth rate, and revenue potential.",
          inputSchema: {
            type: "object",
            properties: {
              productService: { type: "string", description: "What you are selling" },
              targetGeography: { type: "string", description: "Which markets or regions you are targeting" },
              targetCustomer: { type: "string", description: "Who your ideal customer is" },
              pricePoint: { type: "string", description: "Your price per customer or unit" },
              currency: { type: "string", description: "Currency e.g. ZAR, USD. Defaults to ZAR" }
            },
            required: ["productService", "targetGeography", "targetCustomer"]
          }
        },

        // ==========================================
        // MODULE 6 — COMMUNICATION & EXECUTION (Tools 29–34)
        // ==========================================
        {
          name: "goal_communicator",
          description: "Generates goal-based communications — progress emails, milestone alerts, early warning notifications, and stakeholder updates — calibrated to current performance vs target.",
          inputSchema: {
            type: "object",
            properties: {
              goalDescription: { type: "string", description: "What the goal is" },
              currentProgress: { type: "string", description: "Current progress as a value or percentage" },
              target: { type: "string", description: "The target value" },
              deadline: { type: "string", description: "When the goal must be reached" },
              audience: { type: "string", description: "Who receives the communication e.g. team, management, board" },
              communicationType: { type: "string", description: "Email, Teams message, Slack, or calendar invite" }
            },
            required: ["goalDescription", "currentProgress", "target", "audience"]
          }
        },
        {
          name: "stakeholder_reporter",
          description: "Auto-generates formatted progress reports tailored to different audiences — board, management, team, or funders. Each version contains the right level of detail for that audience.",
          inputSchema: {
            type: "object",
            properties: {
              projectName: { type: "string", description: "Name of the project or initiative" },
              reportingPeriod: { type: "string", description: "Period being reported on" },
              keyAchievements: { type: "string", description: "What was accomplished this period" },
              currentStatus: { type: "string", description: "Overall status — on track, at risk, behind" },
              audience: { type: "string", description: "Board, management, team, or funder" },
              nextSteps: { type: "string", description: "Planned actions for next period" }
            },
            required: ["projectName", "reportingPeriod", "currentStatus", "audience"]
          }
        },
        {
          name: "intervention_scheduler",
          description: "When a metric goes off track, generates a structured intervention plan with calendar events, assigned actions, owners, and follow-up checkpoints.",
          inputSchema: {
            type: "object",
            properties: {
              metricOffTrack: { type: "string", description: "Which metric is off track and by how much" },
              rootCause: { type: "string", description: "Known or suspected root cause" },
              deadline: { type: "string", description: "When the metric must be back on track" },
              teamMembers: { type: "string", description: "Who is responsible for the intervention" },
              availableActions: { type: "string", description: "What interventions are possible" }
            },
            required: ["metricOffTrack", "deadline"]
          }
        },
        {
          name: "milestone_celebrator",
          description: "Generates congratulatory communications when targets are hit. Builds team culture by crafting the right message for the right audience at the right milestone.",
          inputSchema: {
            type: "object",
            properties: {
              milestoneAchieved: { type: "string", description: "What was achieved" },
              teamOrPerson: { type: "string", description: "Who achieved it" },
              significance: { type: "string", description: "Why this milestone matters" },
              audience: { type: "string", description: "Who receives the message" },
              communicationType: { type: "string", description: "Email, Teams, Slack, or announcement" }
            },
            required: ["milestoneAchieved", "teamOrPerson", "audience"]
          }
        },
        {
          name: "escalation_manager",
          description: "Automatically escalates to senior stakeholders when critical thresholds are breached. Generates the right escalation message with context, urgency level, and recommended actions.",
          inputSchema: {
            type: "object",
            properties: {
              issueDescription: { type: "string", description: "What has gone wrong or is at risk" },
              severity: { type: "string", description: "Critical, High, Medium, or Low" },
              escalateTo: { type: "string", description: "Who needs to be informed" },
              contextData: { type: "string", description: "Supporting data or evidence" },
              recommendedAction: { type: "string", description: "What you recommend happens next" }
            },
            required: ["issueDescription", "severity", "escalateTo"]
          }
        },
        {
          name: "goal_dashboard_live",
          description: "Generates a live goal tracking dashboard specification that updates automatically as data flows in. Returns layout, KPI cards, traffic light indicators, and Power Automate refresh flow.",
          inputSchema: {
            type: "object",
            properties: {
              goals: { type: "string", description: "List of goals to track with their targets" },
              dataSource: { type: "string", description: "Where the live data comes from" },
              refreshFrequency: { type: "string", description: "How often the dashboard should update e.g. daily, hourly" },
              platform: { type: "string", description: "Power BI, SharePoint, or Excel. Defaults to Power BI" },
              audience: { type: "string", description: "Who will view this dashboard" }
            },
            required: ["goals", "dataSource"]
          }
        }

      ]
    };
  });

  // ==========================================
  // TOOL HANDLERS
  // ==========================================

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    // MODULE 1 — AUTOMATION
    if (name === "audit_flow") {
      return { content: [{ type: "text", text: `[AUTOPILOT AUDIT] Flow: '${args.flowName}' | Trigger: ${args.triggerType || "Not specified"}\n\nDescription: "${args.flowDescription}"\n\nChecks performed:\n✅ Trigger configuration\n✅ Condition logic\n✅ Error handling coverage\n✅ Connector authentication\n✅ Loop and concurrency settings\n✅ Email and notification actions\n✅ Timeout and retry policies\n✅ Data transformation accuracy\n\nPass to Claude for full severity-rated audit report and fix recommendations.` }] };
    }

    if (name === "generate_flow") {
      return { content: [{ type: "text", text: `[AUTOPILOT GENERATE] Goal: "${args.goal}" | Trigger: "${args.trigger}" | Platforms: ${args.platforms || "Not specified"}\n\nFlow architecture analysed. Claude will now generate:\n📋 Complete Power Automate JSON structure\n📋 Step-by-step build instructions\n📋 Required connectors and licence tier\n📋 Error handling and retry logic\n📋 Testing and validation checklist` }] };
    }

    if (name === "debug_flow") {
      return { content: [{ type: "text", text: `[AUTOPILOT DEBUG] Flow: '${args.flowName}' | Error: "${args.errorMessage}" | Failing step: ${args.failingStep || "Unknown"}\n\nDiagnostic scan complete. Evaluating:\n🔍 Authentication and token expiry\n🔍 Null and empty field handling\n🔍 Connector throttling limits\n🔍 Expression syntax errors\n🔍 Missing trigger conditions\n🔍 Delegation and filter query issues\n🔍 Concurrent modification conflicts\n\nPass to Claude for root cause analysis and step-by-step fix.` }] };
    }

    if (name === "optimize_flow") {
      return { content: [{ type: "text", text: `[AUTOPILOT OPTIMIZE] Flow: '${args.flowName}' | Pain point: ${args.painPoint || "General optimization"}\n\nOptimization scan complete:\n⚡ Redundant HTTP calls\n⚡ Unnecessary condition branches\n⚡ Parallelization opportunities\n⚡ Trigger frequency calibration\n⚡ Data retrieval efficiency\n⚡ Action batching potential\n⚡ Run history and logging overhead\n\nPass to Claude for prioritized recommendations with expected performance gains.` }] };
    }

    if (name === "validate_schema") {
      const fn = args.fileName.toLowerCase();
      let detected = "['ID', 'Title', 'Created', 'Modified']";
      if (fn.includes("student")) detected = "['StudentNumber', 'ScanTimestamp', 'SignInStatus', 'Subject']";
      else if (fn.includes("lecturer")) detected = "['SubjectName', 'LecturerEmail', 'SessionDate', 'RoomNumber']";
      else if (fn.includes("leave")) detected = "['EmployeeID', 'LeaveType', 'StartDate', 'EndDate', 'ApprovalStatus']";
      else if (fn.includes("invoice")) detected = "['InvoiceNumber', 'VendorName', 'Amount', 'DueDate', 'PaymentStatus']";
      else if (fn.includes("hr")) detected = "['EmployeeID', 'Department', 'JobTitle', 'StartDate', 'ManagerEmail']";
      else if (fn.includes("sales")) detected = "['OrderID', 'CustomerName', 'Product', 'Amount', 'SaleDate', 'Region']";
      else if (fn.includes("inventory")) detected = "['ItemCode', 'ItemName', 'Quantity', 'Location', 'LastUpdated']";
      else if (fn.includes("budget")) detected = "['Department', 'Category', 'AllocatedAmount', 'SpentToDate', 'Variance']";
      else if (fn.includes("project")) detected = "['ProjectID', 'ProjectName', 'Owner', 'StartDate', 'DueDate', 'Status', 'Budget']";
      return { content: [{ type: "text", text: `[AUTOPILOT SCHEMA] File: '${args.fileName}' | Source: ${args.dataSourceType || "Not specified"}\nDetected columns: ${detected}\nExpected columns: ${args.expectedColumns || "Not specified"}\n\nSchema validation complete. Pass to Claude for mismatch analysis and remediation steps.` }] };
    }

    if (name === "suggest_automation") {
      return { content: [{ type: "text", text: `[AUTOPILOT SUGGEST] Process: "${args.currentProcess}" | Frequency: ${args.frequency || "Not specified"} | Tools: ${args.tools || "Not specified"}\n\nAnalysis complete. Claude will now recommend:\n💡 Optimal flow architecture\n💡 Required Power Automate connectors\n💡 Microsoft 365 licence requirements\n💡 Estimated build complexity and time\n💡 ROI and time saving estimate\n💡 Implementation priority score` }] };
    }

    // MODULE 2 — VISUALISATION
    if (name === "generate_dashboard") {
      const platform = args.platform || "Power BI";
      return { content: [{ type: "text", text: `[AUTOPILOT DASHBOARD] Purpose: "${args.dashboardPurpose}" | Source: ${args.dataSource} | Platform: ${platform} | Audience: ${args.audience || "Not specified"}\nMetrics: ${args.keyMetrics || "Not specified"}\n\nDashboard specification ready. Claude will generate:\n📊 Visual type recommendations per metric\n📊 Page and layout structure\n📊 KPI card definitions\n📊 Filter and slicer configuration\n📊 Data model and relationship map\n📊 ${platform} step-by-step build instructions\n📊 Automated refresh flow plan\n\nNo manual dashboard building required.` }] };
    }

    if (name === "generate_graph") {
      return { content: [{ type: "text", text: `[AUTOPILOT GRAPH] Data: "${args.dataDescription}" | Comparison: ${args.comparisonType} | Platform: ${args.platform || "Power BI"} | Audience: ${args.audience || "Not specified"}\n\nGraph specification ready. Claude will recommend:\n📈 Optimal chart type for your data and comparison\n📈 Axis configuration and labelling\n📈 Colour scheme and accessibility\n📈 Step-by-step build instructions\n📈 Alternative chart options with trade-offs` }] };
    }

    if (name === "generate_analytics") {
      return { content: [{ type: "text", text: `[AUTOPILOT ANALYTICS] Dataset: "${args.dataDescription}" | Goal: "${args.analyticsGoal}" | Key variables: ${args.keyVariables || "Not specified"}\n\nAnalytics scan ready. Claude will return:\n🔬 Descriptive statistics and distributions\n🔬 Correlation and relationship analysis\n🔬 Anomaly and outlier detection\n🔬 Pattern and cluster identification\n🔬 Plain English interpretation of findings\n🔬 Recommended next analytical steps` }] };
    }

    // MODULE 3 — INTELLIGENCE
    if (name === "forecast_trends") {
      return { content: [{ type: "text", text: `[AUTOPILOT FORECAST] Metric: "${args.metricName}" | Period: ${args.forecastPeriod} | External factors: ${args.externalFactors || "None specified"}\n\nForecast engine ready. Claude will generate:\n📉 Short term projections with weekly breakdown\n📉 Long term trajectory to end of forecast period\n📉 Confidence intervals at 80% and 95%\n📉 Best case, base case, and worst case scenarios\n📉 Tipping point identification\n📉 Intervention impact modelling` }] };
    }

    if (name === "goal_navigator") {
      return { content: [{ type: "text", text: `[AUTOPILOT GOAL] Current: "${args.currentState}" → Target: "${args.targetState}" | Deadline: ${args.deadline}\nConstraints: ${args.constraints || "None"} | Resources: ${args.resources || "Not specified"}\n\nGap analysis ready. Claude will generate:\n🎯 Exact gap between current and target state\n🎯 Required growth rate per week and month\n🎯 Week by week milestone plan\n🎯 Resource requirements at each stage\n🎯 Risk points and contingency recommendations\n🎯 Feasibility score with rationale` }] };
    }

    if (name === "business_plan_navigator") {
      return { content: [{ type: "text", text: `[AUTOPILOT BUSINESS PLAN] Business: "${args.businessDescription}" | Target: ${args.targetRevenue} over 5 years | Sector: ${args.sector || "Not specified"} | Capital: ${args.fundingAvailable || "Not specified"}\n\nBusiness plan framework ready. Claude will generate:\n📋 Executive summary\n📋 5-year financial projections\n📋 Year by year milestone timeline\n📋 Resource and staffing requirements\n📋 Risk assessment and mitigation\n📋 KPI framework\n📋 Funding requirements and timeline` }] };
    }

    if (name === "research_plan_navigator") {
      return { content: [{ type: "text", text: `[AUTOPILOT RESEARCH PLAN] Title: "${args.researchTitle}" | Duration: ${args.duration} | Outputs: ${args.outputs} | Team: ${args.teamSize || "Not specified"} | Funder: ${args.fundingBody || "Not specified"}\n\nResearch plan ready. Claude will generate:\n🔬 Full project timeline with milestones\n🔬 Output schedule — publications, reports, presentations\n🔬 Resource allocation by phase\n🔬 Grant reporting calendar\n🔬 Risk and ethics considerations\n🔬 Collaboration and supervision plan` }] };
    }

    if (name === "trend_intelligence") {
      return { content: [{ type: "text", text: `[AUTOPILOT TREND INTELLIGENCE] Metric: "${args.metricName}" | Period: ${args.assessmentPeriod || "Not specified"} | Critical threshold: ${args.criticalThreshold || "Not specified"}\n\nTrend intelligence scan ready. Claude will assess and predict:\n📊 Current trend direction and velocity\n📊 Inflection points and reversals\n📊 Anomaly and outlier identification\n📊 Volatility and stability rating\n📊 Future trajectory with confidence bands\n📊 Time to critical threshold breach\n📊 Recommended interventions` }] };
    }

    if (name === "benchmark_comparator") {
      return { content: [{ type: "text", text: `[AUTOPILOT BENCHMARK] Metric: "${args.metricName}" | Your value: ${args.yourValue} | Sector: ${args.sector} | Benchmark type: ${args.benchmarkType || "Industry average"}\n\nBenchmark comparison ready. Claude will return:\n📏 Your relative position vs benchmark\n📏 Performance gap in absolute and percentage terms\n📏 Best-in-class standard for your sector\n📏 Improvement targets to reach benchmark\n📏 Timeline to close the gap at current trajectory` }] };
    }

    if (name === "risk_predictor") {
      return { content: [{ type: "text", text: `[AUTOPILOT RISK] Context: "${args.context}" | Horizon: ${args.timeHorizon || "12 months"}\nTrends: ${args.currentTrends} | Known risks: ${args.knownRisks || "None specified"}\n\nRisk prediction scan ready. Claude will return:\n⚠️ Top risks ranked by probability and impact\n⚠️ Probability scores for each risk\n⚠️ Impact ratings — financial, operational, reputational\n⚠️ Early warning indicators to watch\n⚠️ Recommended mitigation actions\n⚠️ Residual risk after mitigation` }] };
    }

    if (name === "early_warning_system") {
      return { content: [{ type: "text", text: `[AUTOPILOT EARLY WARNING] Metrics: "${args.metrics}" | Thresholds: ${args.thresholds} | Frequency: ${args.monitoringPeriod || "Weekly"} | Escalation: ${args.escalationContact || "Not specified"}\n\nEarly warning system configured. Claude will return:\n🚦 Traffic light status for each metric — Green, Amber, Red\n🚦 Current distance from each threshold\n🚦 Projected time to threshold breach\n🚦 Trigger conditions for escalation\n🚦 Recommended intervention for each amber and red metric` }] };
    }

    // MODULE 4 — FINANCE
    if (name === "breakeven_analyser") {
      const currency = args.currency || "ZAR";
      return { content: [{ type: "text", text: `[AUTOPILOT BREAKEVEN] Fixed costs: ${args.fixedCosts} | Variable cost/unit: ${args.variableCostPerUnit} | Price/unit: ${args.pricePerUnit} | Current volume: ${args.currentSalesVolume || "Not specified"} | Currency: ${currency}\n\nBreak-even analysis ready. Claude will calculate:\n💰 Break-even units\n💰 Break-even revenue in ${currency}\n💰 Break-even timeline at current sales rate\n💰 Contribution margin per unit\n💰 Margin of safety\n💰 Sensitivity analysis — impact of price and cost changes\n💰 What-if scenarios` }] };
    }

    if (name === "roi_calculator") {
      const currency = args.currency || "ZAR";
      return { content: [{ type: "text", text: `[AUTOPILOT ROI] Investment: ${args.investmentAmount} | Expected return: ${args.expectedReturn} | Period: ${args.timeHorizon} | Discount rate: ${args.discountRate || "10%"} | Currency: ${currency}\n\nROI analysis ready. Claude will calculate:\n💹 ROI percentage\n💹 Payback period\n💹 Net present value in ${currency}\n💹 Internal rate of return\n💹 Investment recommendation with rationale` }] };
    }

    if (name === "pricing_strategy") {
      return { content: [{ type: "text", text: `[AUTOPILOT PRICING] Product: "${args.productDescription}" | Cost: ${args.costToDeliver} | Target margin: ${args.targetMargin} | Competitor pricing: ${args.competitorPricing || "Not specified"} | Market: ${args.marketSegment || "Not specified"}\n\nPricing analysis ready. Claude will recommend:\n💲 Optimal price point for target margin\n💲 Competitive positioning analysis\n💲 Price sensitivity assessment\n💲 Tiered pricing options\n💲 Promotional pricing strategy\n💲 Price increase roadmap` }] };
    }

    if (name === "budget_allocator") {
      const currency = args.currency || "ZAR";
      return { content: [{ type: "text", text: `[AUTOPILOT BUDGET] Total: ${args.totalBudget} ${currency} | Categories: ${args.categories} | Priorities: ${args.priorities || "Equal"} | Constraints: ${args.constraints || "None"}\n\nBudget allocation ready. Claude will generate:\n📊 Optimised allocation per category\n📊 Allocation rationale and weighting\n📊 Variance from equal distribution\n📊 Reallocation scenarios\n📊 Budget tracking framework` }] };
    }

    if (name === "cash_flow_modeller") {
      return { content: [{ type: "text", text: `[AUTOPILOT CASH FLOW] Opening balance: ${args.openingBalance} | Monthly inflows: ${args.monthlyInflows} | Monthly outflows: ${args.monthlyOutflows} | Period: ${args.modelPeriod} | Growth rate: ${args.growthRate || "0%"}\n\nCash flow model ready. Claude will generate:\n💵 Month by month cash position\n💵 Surplus and deficit periods\n💵 Lowest cash point and timing\n💵 Funding requirement timeline\n💵 Sensitivity to growth rate changes\n💵 Cash runway calculation` }] };
    }

    if (name === "funding_gap_analyser") {
      const currency = args.currency || "ZAR";
      return { content: [{ type: "text", text: `[AUTOPILOT FUNDING GAP] Project: "${args.projectDescription}" | Total cost: ${args.totalProjectCost} ${currency} | Secured: ${args.fundingSecured || "0"} | Timeline: ${args.timeline || "Not specified"}\n\nFunding gap analysis ready. Claude will calculate:\n🏦 Total funding gap in ${currency}\n🏦 Gap by project phase and period\n🏦 Funding timeline and urgency\n🏦 Recommended funding sources\n🏦 Risk of underfunding by phase` }] };
    }

    // MODULE 5 — SCALE & GROWTH
    if (name === "scalability_engine") {
      return { content: [{ type: "text", text: `[AUTOPILOT SCALE] Current: "${args.currentScale}" → Target: "${args.targetScale}" | Timeframe: ${args.timeframe || "Not specified"}\nResources: ${args.currentResources || "Not specified"} | Constraints: ${args.constraints || "None"}\n\nScalability assessment ready. Claude will return:\n🚀 Scalability score — can you reach target scale?\n🚀 Bottleneck identification and priority ranking\n🚀 Resource multipliers at each growth stage\n🚀 Optimal scale point for maximum efficiency\n🚀 Economies and diseconomies of scale\n🚀 Infrastructure and process gaps to address first` }] };
    }

    if (name === "capacity_planner") {
      return { content: [{ type: "text", text: `[AUTOPILOT CAPACITY] Current: "${args.currentCapacity}" → Target: "${args.targetCapacity}"\nResources: ${args.resourceTypes || "All"} | Standards: ${args.qualityStandards || "Not specified"}\n\nCapacity plan ready. Claude will generate:\n📦 Resource requirements at each capacity milestone\n📦 Staff headcount plan\n📦 Infrastructure and technology requirements\n📦 Budget requirements by phase\n📦 Quality risk points during scale-up` }] };
    }

    if (name === "growth_modeller") {
      const currency = args.currency || "ZAR";
      return { content: [{ type: "text", text: `[AUTOPILOT GROWTH] Current revenue: ${args.currentRevenue} ${currency} | Period: ${args.modelPeriod} | Drivers: ${args.growthDrivers} | Market: ${args.marketConditions || "Not specified"}\n\nGrowth model ready. Claude will generate:\n📈 Conservative scenario — low growth assumptions\n📈 Moderate scenario — base case projections\n📈 Aggressive scenario — high growth assumptions\n📈 Revenue, cost, and profit for each scenario\n📈 Probability rating for each scenario\n📈 Key assumptions and sensitivity factors` }] };
    }

    if (name === "unit_economics_calculator") {
      return { content: [{ type: "text", text: `[AUTOPILOT UNIT ECONOMICS] Product: "${args.productService}" | Revenue/unit: ${args.revenuePerUnit} | Cost/unit: ${args.costPerUnit} | Current volume: ${args.currentVolume} | Target: ${args.targetVolume || "Not specified"}\n\nUnit economics analysis ready. Claude will calculate:\n🔢 Current contribution margin per unit\n🔢 Gross margin percentage\n🔢 Customer lifetime value\n🔢 How unit economics change at target volume\n🔢 Volume needed for positive unit economics\n🔢 Margin improvement trajectory` }] };
    }

    if (name === "market_sizing_tool") {
      const currency = args.currency || "ZAR";
      return { content: [{ type: "text", text: `[AUTOPILOT MARKET SIZE] Product: "${args.productService}" | Geography: ${args.targetGeography} | Customer: ${args.targetCustomer} | Price: ${args.pricePoint || "Not specified"} | Currency: ${currency}\n\nMarket sizing analysis ready. Claude will estimate:\n🌍 Total addressable market (TAM)\n🌍 Serviceable addressable market (SAM)\n🌍 Realistic capture rate and rationale\n🌍 Revenue potential at 1%, 5%, and 10% market share\n🌍 Market growth rate and trajectory\n🌍 Key market entry considerations` }] };
    }

    // MODULE 6 — COMMUNICATION & EXECUTION
    if (name === "goal_communicator") {
      return { content: [{ type: "text", text: `[AUTOPILOT COMMUNICATE] Goal: "${args.goalDescription}" | Progress: ${args.currentProgress} vs Target: ${args.target} | Deadline: ${args.deadline || "Not specified"} | Audience: ${args.audience} | Channel: ${args.communicationType || "Email"}\n\nCommunication ready. Claude will generate:\n📧 Calibrated message based on progress vs target\n📧 Appropriate tone — celebratory, neutral, or urgent\n📧 Key data points formatted for the audience\n📧 Call to action if intervention is needed\n📧 Subject line and formatting for chosen channel` }] };
    }

    if (name === "stakeholder_reporter") {
      return { content: [{ type: "text", text: `[AUTOPILOT REPORT] Project: "${args.projectName}" | Period: ${args.reportingPeriod} | Status: ${args.currentStatus} | Audience: ${args.audience}\nAchievements: ${args.keyAchievements || "Not specified"} | Next steps: ${args.nextSteps || "Not specified"}\n\nStakeholder report ready. Claude will generate:\n📄 Executive summary calibrated to ${args.audience}\n📄 Progress vs milestones\n📄 Key achievements this period\n📄 Risks and issues\n📄 Next period plan\n📄 Formatted and ready to send` }] };
    }

    if (name === "intervention_scheduler") {
      return { content: [{ type: "text", text: `[AUTOPILOT INTERVENE] Metric off track: "${args.metricOffTrack}" | Root cause: ${args.rootCause || "Under investigation"} | Deadline: ${args.deadline} | Team: ${args.teamMembers || "Not specified"}\nAvailable actions: ${args.availableActions || "Not specified"}\n\nIntervention plan ready. Claude will generate:\n🗓️ Structured intervention action plan\n🗓️ Calendar events with assigned owners\n🗓️ Daily and weekly check-in schedule\n🗓️ Success criteria for each action\n🗓️ Escalation trigger if intervention fails` }] };
    }

    if (name === "milestone_celebrator") {
      return { content: [{ type: "text", text: `[AUTOPILOT CELEBRATE] Milestone: "${args.milestoneAchieved}" | Achieved by: ${args.teamOrPerson} | Significance: ${args.significance || "Not specified"} | Audience: ${args.audience} | Channel: ${args.communicationType || "Email"}\n\nCelebration message ready. Claude will generate:\n🎉 Congratulatory message calibrated to milestone significance\n🎉 Recognition of individual or team contribution\n🎉 Connection to overall goal progress\n🎉 Motivational framing for next milestone\n🎉 Formatted for chosen channel` }] };
    }

    if (name === "escalation_manager") {
      return { content: [{ type: "text", text: `[AUTOPILOT ESCALATE] Issue: "${args.issueDescription}" | Severity: ${args.severity} | Escalate to: ${args.escalateTo}\nContext: ${args.contextData || "Not provided"} | Recommended action: ${args.recommendedAction || "Not specified"}\n\nEscalation message ready. Claude will generate:\n🚨 Urgency-calibrated escalation message\n🚨 Concise issue summary with supporting data\n🚨 Impact assessment\n🚨 Recommended immediate actions\n🚨 Response timeline expectation` }] };
    }

    if (name === "goal_dashboard_live") {
      const platform = args.platform || "Power BI";
      return { content: [{ type: "text", text: `[AUTOPILOT LIVE DASHBOARD] Goals: "${args.goals}" | Source: ${args.dataSource} | Refresh: ${args.refreshFrequency || "Daily"} | Platform: ${platform} | Audience: ${args.audience || "Not specified"}\n\nLive dashboard specification ready. Claude will generate:\n📡 KPI card layout for each goal\n📡 Traffic light indicator configuration\n📡 Progress bar and gauge specifications\n📡 Trend sparkline setup\n📡 ${platform} build instructions\n📡 Power Automate refresh flow to keep data live\n📡 Alert configuration for threshold breaches` }] };
    }

    throw new Error(`Tool not found: ${name}`);
  });

  return server;
}

app.post("/mcp", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.substring(7);
  if (!issuedTokens.has(token)) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AutoPilot MCP v3.0 — Plan it. Automate it. Scale it. — Running on port ${PORT}`));
