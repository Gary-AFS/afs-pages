/**
 * gaf-dash-ai — Gemini proxy for the GAF Performance Dashboard AI chat.
 *
 * The Gemini API key lives ONLY in this Worker's secret (GEMINI_API_KEY) —
 * never in the public dashboard bundle.
 *
 * v2: function-calling. The model can request ANY section of the dashboard
 * feed via the get_dashboard_data tool; the BROWSER executes the fetch
 * against its in-memory feed and posts the result back, so the model can
 * chase cross-platform insights without us shipping 3MB of JSON per message.
 *
 * Guards: origin allowlist, payload caps, POST-only.
 */

const ALLOWED_ORIGINS = [
  "https://gary-afs.github.io",
  "http://localhost:4173",
  "http://localhost:5173",
];

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `You are Gary, the AFS Group's AI assistant and the analyst behind the GAF (Gym and Fitness) Performance Marketing Dashboard. Polite, precise, lightly formal.

You start with a compact SUMMARY of every channel's KPIs across all four windows (yesterday / 7d / 30d / 90d). For anything deeper — campaign tables, ad sets, creatives, keywords, search terms, products, top pages, SEO queries, AI-engine sources, breakdowns, email sends, experiments — call get_dashboard_data to pull the exact section you need. Chase the data before answering: cross-reference channels (e.g. products selling well on Shopify vs what Meta/Google are pushing; SEO queries vs paid keywords; GP budget vs spend) rather than answering from the summary alone. Multiple tool calls are fine and encouraged.

Domain rules:
- Blended MER is a PERCENTAGE: (total ad spend + a 6% agency fee charged on Meta and Google media spend ONLY — no fee on Axon/Pinterest/other channels) ÷ total Shopify revenue. LOWER is more efficient (team target ~12%). The overview kpis expose agencyFees and adSpendInclFees. Shopify revenue is the source of truth; GA4 "online revenue" is the online-attributed subset.
- Many GAF sales close offline by phone, so treat channel-level ROAS and on-site conversions as directional signals, not verdicts. Never condemn a campaign on ROAS alone.
- Gross profit vs budget comes from the finance sheet; "run rate" projects month-to-date GP across the calendar month.
- GA4 metrics cover Australian traffic only. Currency is AUD.
- Be concise and concrete: numbers, comparisons, and what you'd look at next. Plain sentences, no headers, no em dashes. Use $ and % formatting. Cite which section a number came from when it isn't obvious.`;

const TOOLS = [
  {
    functionDeclarations: [
      {
        name: "get_dashboard_data",
        description:
          "Fetch a section of the dashboard feed. Sections: overview, meta, google, ga4, axon, hubspot, shopify, seo, pinterest, budget, products, anomalies, narrative (all window-keyed); experiments, organic (snapshot, no window). Use keys to pick sub-parts (e.g. ['campaigns'] or ['kpis','deltas']; meta offers campaigns/adsets/creative/video/breakdowns/daily; google offers campaigns/adGroups/keywords/searchTerms/ads/daily; ga4 offers channels/topPages/geo/daily/aiTraffic; seo offers topQueries/topPages/daily). Arrays are truncated to `limit` rows (default 40, max 120).",
        parameters: {
          type: "OBJECT",
          properties: {
            section: {
              type: "STRING",
              description: "Feed section name",
            },
            window: {
              type: "STRING",
              description: "yesterday | 7d | 30d | 90d (default: the window the user is viewing; ignored for experiments/organic)",
            },
            keys: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "Optional sub-keys to return (omit for the whole section)",
            },
            limit: {
              type: "NUMBER",
              description: "Max rows per array (default 40, max 120)",
            },
          },
          required: ["section"],
        },
      },
    ],
  },
];

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = ALLOWED_ORIGINS.includes(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: allowed ? 204 : 403,
        headers: allowed ? corsHeaders(origin) : {},
      });
    }
    if (!allowed) return new Response("Forbidden", { status: 403 });
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders(origin) });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    // context: compact all-window KPI summary; contents: full Gemini turn
    // history maintained by the client (incl. functionCall/functionResponse).
    const context = typeof body.context === "string" ? body.context.slice(0, 200_000) : "";
    const contents = Array.isArray(body.contents) ? body.contents.slice(-60) : [];
    if (!contents.length) {
      return new Response(JSON.stringify({ error: "No contents" }), {
        status: 400,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    // Hard cap on total payload the client can relay (tool results included)
    const totalSize = JSON.stringify(contents).length;
    if (totalSize > 900_000) {
      return new Response(JSON.stringify({ error: "Conversation too large — start a new chat" }), {
        status: 413,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    const fullContents = [
      {
        role: "user",
        parts: [{ text: `DASHBOARD SUMMARY (all windows, JSON):\n${context}` }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I have the cross-window summary and will call get_dashboard_data for any detail I need." }],
      },
      ...contents,
    ];

    const geminiResp = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: fullContents,
        tools: TOOLS,
        // 2.5-family models spend "thinking" tokens from the same budget as the
        // visible answer — cap thinking and leave ample room for the reply.
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          thinkingConfig: { thinkingBudget: 2048 },
        },
      }),
    });

    if (!geminiResp.ok) {
      const detail = await geminiResp.text();
      return new Response(
        JSON.stringify({ error: `Gemini ${geminiResp.status}`, detail: detail.slice(0, 300) }),
        { status: 502, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }
      );
    }

    const data = await geminiResp.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];

    const functionCalls = parts.filter((p) => p.functionCall).map((p) => p.functionCall);
    const text = parts.filter((p) => p.text).map((p) => p.text).join("");

    return new Response(JSON.stringify({ text: text || null, functionCalls }), {
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  },
};
