/**
 * gaf-dash-ai — Gemini proxy for the GAF Performance Dashboard AI chat.
 *
 * The Gemini API key lives ONLY in this Worker's secret (GEMINI_API_KEY) —
 * never in the public dashboard bundle. The dashboard POSTs the conversation
 * plus a distilled JSON context of the currently viewed window; this Worker
 * forwards to Gemini and returns the answer.
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

const SYSTEM_PROMPT = `You are the analyst behind the GAF (Gym and Fitness) Performance Marketing Dashboard.
You are given a JSON snapshot of the dashboard's data for the window the user is currently viewing, then a conversation.

Rules:
- Answer from the provided data. If asked something the data can't answer, say what's missing rather than guessing.
- Blended MER = total Shopify revenue / total ad spend. Shopify revenue is the source of truth; GA4 "online revenue" is the online-attributed subset.
- Many GAF sales close offline by phone, so treat channel-level ROAS and on-site conversions as directional signals, not verdicts. Never condemn a campaign on ROAS alone.
- Gross profit vs budget comes from the finance sheet; "run rate" projects month-to-date GP across the calendar month.
- GA4 metrics cover Australian traffic only.
- Be concise and concrete: numbers, comparisons, and what you'd look at next. Plain sentences, no headers, no em dashes. Use $ and % formatting.
- Currency is AUD.`;

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

    if (!allowed) {
      return new Response("Forbidden", { status: 403 });
    }
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

    const context = typeof body.context === "string" ? body.context.slice(0, 120_000) : "";
    const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
    if (!messages.length) {
      return new Response(JSON.stringify({ error: "No messages" }), {
        status: 400,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    const contents = [
      {
        role: "user",
        parts: [{ text: `DASHBOARD DATA (JSON):\n${context}` }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I have the dashboard data. What would you like to know?" }],
      },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.text || "").slice(0, 4000) }],
      })),
    ];

    const geminiResp = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.3, maxOutputTokens: 1200 },
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
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ??
      "No answer produced.";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  },
};
