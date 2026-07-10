import type { ReactNode } from "react";

// ---- Inline SVG brand marks (lightweight, no icon library) ----

function IconOverview() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9" />
      <rect x="10" y="1" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
      <rect x="1" y="10" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
      <rect x="10" y="10" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function IconMeta() {
  // Meta "infinity" / wordmark approximation
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M2 9c0-1.5 1-2.5 2-2.5s2 1 3 2.5c1-1.5 2-2.5 3-2.5s2 1 2 2.5-1 2.5-2 2.5-2-1-3-2.5C6 10.5 5 11.5 4 11.5S2 10.5 2 9Z"
        fill="#1877F2"
      />
      <path
        d="M10 9c0-1.5 1-2.5 2-2.5s2 1 2 2.5-1 2.5-2 2.5-2-1-2-2.5Z"
        fill="#1877F2"
        opacity="0.7"
      />
    </svg>
  );
}

function IconGoogleAds() {
  // Google Ads three-bar chart mark
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1" y="10" width="4" height="7" rx="1" fill="#4285F4" />
      <rect x="7" y="6" width="4" height="11" rx="1" fill="#FBBC04" />
      <rect x="13" y="1" width="4" height="16" rx="1" fill="#34A853" />
    </svg>
  );
}

function IconGA4() {
  // GA4 analytics flame / bar approximation
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="8" fill="#E37400" opacity="0.15" />
      <path d="M6 13V8l3-4 3 4v5H6Z" fill="#E37400" />
      <rect x="7.5" y="10" width="3" height="3" rx="0.5" fill="white" />
    </svg>
  );
}

function IconAxon() {
  // AppLovin / Axon "A" wordmark approximation
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2L15.5 15H2.5L9 2Z" fill="#0066FF" />
      <path d="M6.5 11H11.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconHubSpot() {
  // HubSpot sprocket approximation
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="3" fill="#FF7A59" />
      <circle cx="9" cy="3" r="1.5" fill="#FF7A59" />
      <circle cx="9" cy="15" r="1.5" fill="#FF7A59" />
      <circle cx="3" cy="9" r="1.5" fill="#FF7A59" />
      <circle cx="15" cy="9" r="1.5" fill="#FF7A59" />
    </svg>
  );
}

// ---- Nav item config ----

export type TabId = "overview" | "meta" | "google" | "website" | "axon" | "email";

interface NavItem {
  id: TabId;
  label: string;
  Icon: () => ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview",  label: "Overview",        Icon: IconOverview },
  { id: "meta",      label: "Meta Ads",         Icon: IconMeta },
  { id: "google",    label: "Google Ads",       Icon: IconGoogleAds },
  { id: "website",   label: "Website Traffic",  Icon: IconGA4 },
  { id: "axon",      label: "Axon",             Icon: IconAxon },
  { id: "email",     label: "Email",            Icon: IconHubSpot },
];

// ---- Sidebar component ----

interface SidebarProps {
  active: TabId;
  onSelect: (tabId: TabId) => void;
}

export function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <aside className="flex flex-col w-56 shrink-0 min-h-screen bg-gray-950 border-r border-gray-800">
      {/* Brand mark */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-800">
        <div className="w-7 h-7 rounded bg-orange-500 flex items-center justify-center font-bold text-black text-xs select-none">
          G
        </div>
        <span className="text-sm font-semibold text-gray-100 tracking-tight">
          GAF Performance
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={[
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                isActive
                  ? "bg-orange-500 text-black"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-100",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={isActive ? "text-black" : "text-gray-500"}>
                <Icon />
              </span>
              {label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-800">
        <p className="text-xs text-gray-600">GAF Group</p>
      </div>
    </aside>
  );
}
