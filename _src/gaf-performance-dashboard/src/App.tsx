import { useState } from "react";
import { useData } from "./lib/data";
import type { PerfData, Window } from "./lib/data";
import { DateRangeProvider, useDateRange } from "./state/DateRangeContext";
import { Sidebar } from "./components/Sidebar";
import type { TabId } from "./components/Sidebar";
import { Overview } from "./tabs/Overview";

// ---- Placeholder tab panels (replaced by subsequent tasks) ----

function TabMeta()            { return <div className="p-6 text-gray-400">Meta Ads</div>; }
function TabGoogle()          { return <div className="p-6 text-gray-400">Google Ads</div>; }
function TabWebsite()         { return <div className="p-6 text-gray-400">Website Traffic</div>; }
function TabAxon()            { return <div className="p-6 text-gray-400">Axon</div>; }
function TabEmail()           { return <div className="p-6 text-gray-400">Email</div>; }

function makePanels(data: PerfData): Record<TabId, () => JSX.Element> {
  return {
    overview: () => <Overview data={data} />,
    meta:     TabMeta,
    google:   TabGoogle,
    website:  TabWebsite,
    axon:     TabAxon,
    email:    TabEmail,
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
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <Sidebar active={activeTab} onSelect={setActiveTab} />

      <div className="flex-1 flex flex-col">
        {/* Top header bar */}
        <header className="border-b border-gray-700 px-6 py-3 flex items-center gap-4 bg-gray-900">
          <h1 className="text-sm font-semibold tracking-tight text-gray-200 mr-auto">
            GAF Performance Dashboard
          </h1>

          {/* Window picker */}
          <label className="flex items-center gap-2 text-xs text-gray-400">
            <span>Window</span>
            <select
              value={selectedWindow}
              onChange={(e) => setWindow(e.target.value as Window)}
              className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
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
            <span className="text-xs text-gray-500">
              Updated {new Date(generatedAt).toLocaleString("en-AU")}
            </span>
          )}
        </header>

        {/* Active tab panel */}
        <main className="flex-1">
          <Panel />
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center space-y-4">
          <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center space-y-2">
          <p className="text-red-400 font-semibold">Failed to load data</p>
          <p className="text-gray-500 text-sm">
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
