import { useState } from "react";
import { useData } from "./lib/data";
import type { PerfData, Window } from "./lib/data";
import { DateRangeProvider, useDateRange } from "./state/DateRangeContext";
import { Sidebar } from "./components/Sidebar";
import type { TabId } from "./components/Sidebar";
import { Overview } from "./tabs/Overview";
import { MetaAds } from "./tabs/MetaAds";
import { GoogleAds } from "./tabs/GoogleAds";
import { WebsiteTraffic } from "./tabs/WebsiteTraffic";
import { Axon } from "./tabs/Axon";
import { Email } from "./tabs/Email";

function makePanels(data: PerfData): Record<TabId, () => JSX.Element> {
  return {
    overview: () => <Overview data={data} />,
    meta:     () => <MetaAds data={data} />,
    google:   () => <GoogleAds data={data} />,
    website:  () => <WebsiteTraffic data={data} />,
    axon:     () => <Axon data={data} />,
    email:    () => <Email data={data} />,
  };
}

const WINDOW_LABELS: Record<Window, string> = {
  yesterday: "Yesterday",
  "7d":      "Last 7 days",
  "30d":     "Last 30 days",
  "90d":     "Last 90 days",
};

// ---- Inner shell (needs access to useDateRange context) ----

function DashboardShell({ generatedAt, data }: { generatedAt: string | null; data: PerfData }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { window: selectedWindow, setWindow } = useDateRange();

  const TAB_PANELS = makePanels(data);
  const Panel = TAB_PANELS[activeTab];

  return (
    <div className="flex min-h-screen" style={{ background: "var(--gaf-page-bg)", color: "var(--gaf-text-primary)" }}>
      <Sidebar active={activeTab} onSelect={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header bar -- white/blur, sticky */}
        <header
          className="sticky top-0 z-40 border-b px-6 py-3 flex items-center gap-4 h-14 sm:h-16"
          style={{
            background: "var(--gaf-header-bg)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            boxShadow: "var(--gaf-header-shadow)",
            borderColor: "var(--gaf-row-border)",
          }}
        >
          {/* Brand mark */}
          <div className="flex items-center gap-2.5 mr-auto">
            <div
              className="w-7 h-7 rounded flex items-center justify-center font-bold text-white text-xs select-none font-display"
              style={{ background: "var(--gaf-primary)" }}
            >
              G
            </div>
            <h1
              className="text-sm font-bold tracking-tight font-display hidden sm:block"
              style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}
            >
              GAF Performance Dashboard
            </h1>
          </div>

          {/* Window picker */}
          <label className="flex items-center gap-2 text-xs" style={{ color: "var(--gaf-text-secondary)" }}>
            <span>Window</span>
            <select
              value={selectedWindow}
              onChange={(e) => setWindow(e.target.value as Window)}
              className="text-xs rounded-md px-2 py-1.5 focus:outline-none"
              style={{
                background: "var(--gaf-card-bg)",
                border: "1px solid var(--gaf-input-border)",
                color: "var(--gaf-text-primary)",
              }}
            >
              {(["yesterday", "7d", "30d", "90d"] as Window[]).map((w) => (
                <option key={w} value={w}>
                  {WINDOW_LABELS[w]}
                </option>
              ))}
            </select>
          </label>

          {/* Last updated stamp */}
          {generatedAt && (
            <span className="text-xs hidden sm:block" style={{ color: "var(--gaf-text-muted)" }}>
              Updated {new Date(generatedAt).toLocaleString("en-AU")}
            </span>
          )}
        </header>

        {/* Active tab panel */}
        <main className="flex-1 px-3 sm:px-6 py-4 sm:py-6 max-w-[1600px] w-full mx-auto">
          <div className="fade-in">
            <Panel />
          </div>
        </main>
      </div>
    </div>
  );
}

// ---- Root App with data fetch + loading/error states ----

function AppInner() {
  const { data, loading, error } = useData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gaf-page-bg)" }}>
        <div className="text-center space-y-4">
          <div
            className="inline-block w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--gaf-primary)", borderTopColor: "transparent" }}
          />
          <p className="text-sm" style={{ color: "var(--gaf-text-muted)" }}>Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gaf-page-bg)" }}>
        <div className="text-center space-y-2">
          <p className="font-semibold" style={{ color: "#ef4444" }}>Failed to load data</p>
          <p className="text-sm" style={{ color: "var(--gaf-text-muted)" }}>
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      </div>
    );
  }

  return <DashboardShell generatedAt={data?.generated_at ?? null} data={data!} />;
}

export default function App() {
  return (
    <DateRangeProvider>
      <AppInner />
    </DateRangeProvider>
  );
}
