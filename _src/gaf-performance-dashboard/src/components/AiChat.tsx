// src/components/AiChat.tsx
// "Ask AI" — floating chat over the dashboard data. The Gemini key lives in
// the gaf-dash-ai Cloudflare Worker (server-side); this client only sends the
// conversation plus a distilled JSON context for the selected window.
import { useMemo, useRef, useState, useEffect } from "react";
import { useDateRange } from "../state/DateRangeContext";
import type { PerfData } from "../lib/data";

const WORKER_URL = "https://gaf-dash-ai.josh-03c.workers.dev";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const STARTERS = [
  "Summarise performance this window in three sentences.",
  "Are we on track against the GP budget?",
  "Which channel deserves more budget right now?",
  "What should I be worried about in this data?",
];

/** Distil the feed into a compact JSON context for the selected window. */
function buildContext(data: PerfData, window: string): string {
  const w = window as keyof PerfData["overview"];
  const top = <T,>(rows: T[] | undefined, n: number) => (rows ?? []).slice(0, n);

  const ctx = {
    window,
    generatedAt: data.generated_at,
    overview: data.overview?.[w],
    anomalies: data.anomalies?.[w],
    narrative: data.narrative?.[w],
    meta: {
      kpis: data.meta?.[w]?.kpis,
      deltas: data.meta?.[w]?.deltas,
      topCampaigns: top(data.meta?.[w]?.campaigns, 12),
      topAdsets: top(data.meta?.[w]?.adsets, 8),
    },
    google: {
      kpis: data.google?.[w]?.kpis,
      deltas: data.google?.[w]?.deltas,
      topCampaigns: top(data.google?.[w]?.campaigns, 12),
      topKeywords: top(data.google?.[w]?.keywords, 10),
    },
    ga4_australia_only: {
      kpis: data.ga4?.[w]?.kpis,
      deltas: data.ga4?.[w]?.deltas,
      channels: data.ga4?.[w]?.channels,
    },
    axon: { kpis: data.axon?.[w]?.kpis, deltas: data.axon?.[w]?.deltas },
    email: { kpis: data.hubspot?.[w]?.kpis, recentSends: top(data.hubspot?.[w]?.sends, 8) },
    shopify: {
      kpis: data.shopify?.[w]?.kpis,
      topProducts: top(data.shopify?.[w]?.products, 15),
    },
  };
  return JSON.stringify(ctx);
}

function Sparkle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.9 5.7L19.6 9.6l-5.7 1.9L12 17.2l-1.9-5.7L4.4 9.6l5.7-1.9L12 2Zm7 12l.9 2.7 2.7.9-2.7.9-.9 2.7-.9-2.7-2.7-.9 2.7-.9.9-2.7Z" />
    </svg>
  );
}

export function AiChat({ data }: { data: PerfData }) {
  const { window: selectedWindow } = useDateRange();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const context = useMemo(() => buildContext(data, selectedWindow), [data, selectedWindow]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", text: question }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, messages: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setMessages([...next, { role: "assistant", text: String(json.text ?? "No answer.") }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
          style={{ background: "var(--gaf-primary)", fontFamily: "var(--font-display)" }}
          aria-label="Ask AI about this data"
        >
          <Sparkle /> Ask AI
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-0 right-0 sm:bottom-5 sm:right-5 z-50 w-full sm:w-[420px] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "var(--gaf-card-bg)",
            border: "1px solid var(--gaf-card-border)",
            maxHeight: "min(640px, 85vh)",
          }}
          role="dialog"
          aria-label="AI data assistant"
        >
          {/* Header */}
          <div
            className="flex items-center gap-2 px-4 py-3 text-white shrink-0"
            style={{ background: "var(--gaf-primary)" }}
          >
            <Sparkle />
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                Ask AI
              </p>
              <p className="text-[10px] opacity-80">
                Answers from the {selectedWindow === "yesterday" ? "Yesterday" : `Last ${selectedWindow.replace("d", " days")}`} snapshot
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto w-7 h-7 rounded-full flex items-center justify-center text-lg leading-none"
              style={{ background: "rgba(255,255,255,0.2)" }}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: 220 }}>
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs" style={{ color: "var(--gaf-text-muted)" }}>
                  Ask anything about the numbers on this dashboard — performance, budget, channels, products.
                </p>
                {STARTERS.map(q => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="block w-full text-left text-xs px-3 py-2 rounded-lg transition-colors"
                    style={{
                      background: "var(--gaf-primary-light)",
                      color: "var(--gaf-text-primary)",
                      border: "1px solid var(--gaf-card-border)",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className="max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed"
                  style={
                    m.role === "user"
                      ? { background: "var(--gaf-primary)", color: "#fff", borderBottomRightRadius: 6 }
                      : { background: "#f3f4f6", color: "var(--gaf-text-primary)", borderBottomLeftRadius: 6 }
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl text-sm" style={{ background: "#f3f4f6", color: "var(--gaf-text-muted)" }}>
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>·</span>
                    <span className="animate-bounce" style={{ animationDelay: "120ms" }}>·</span>
                    <span className="animate-bounce" style={{ animationDelay: "240ms" }}>·</span>
                  </span>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs" style={{ color: "var(--gaf-delta-neg)" }}>
                Couldn't reach the AI service ({error}). Try again.
              </p>
            )}
          </div>

          {/* Input */}
          <form
            className="flex items-center gap-2 px-3 py-3 border-t shrink-0"
            style={{ borderColor: "var(--gaf-row-border)", background: "var(--gaf-card-bg)" }}
            onSubmit={e => { e.preventDefault(); send(input); }}
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about this data…"
              className="flex-1 text-sm px-3 py-2 rounded-lg focus:outline-none"
              style={{
                border: "1px solid var(--gaf-input-border)",
                background: "var(--gaf-page-bg)",
                color: "var(--gaf-text-primary)",
              }}
              aria-label="Question for the AI assistant"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--gaf-primary)" }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
