import type { ReactNode } from "react";

// ---- Inline SVG brand marks (official logo geometry, no icon library) ----

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

// Meta infinity mark (Simple Icons geometry), Meta blue.
function IconMeta() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="#0081FB"
        d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
      />
    </svg>
  );
}

// Google Ads mark: two crossed rounded bars + circle (official geometry,
// same composition as the reference dashboard's favicon).
function IconGoogleAds() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="15" rx="3" fill="#4285F4" transform="rotate(-30 12 3)" />
      <rect x="9" y="3" width="6" height="15" rx="3" fill="#FBBC04" transform="rotate(30 12 3)" />
      <circle cx="5.2" cy="16.4" r="3" fill="#34A853" />
    </svg>
  );
}

// Google Analytics mark: tall amber bar, mid orange bar, orange dot.
function IconGA4() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="16.4" y="2.5" width="5.1" height="19" rx="2.55" fill="#F9AB00" />
      <rect x="9.45" y="9.5" width="5.1" height="12" rx="2.55" fill="#E37400" />
      <circle cx="5.05" cy="18.95" r="2.55" fill="#E37400" />
    </svg>
  );
}

// Axon (AppLovin's ad engine) — angular "A" monogram in AppLovin blue.
function IconAxon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" rx="5" fill="#1C73E8" />
      <path d="M12 5.5 18.5 18h-3.4l-1.2-2.5H10L8.9 18H5.5L12 5.5Zm0 6.1-1 2.2h2l-1-2.2Z" fill="#fff" />
    </svg>
  );
}

// HubSpot sprocket: hub ring + two spokes + satellite node, HubSpot orange.
function IconHubSpot() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* satellite node + connecting stroke (bottom-left) */}
      <line x1="5.5" y1="20" x2="10.5" y2="16.2" stroke="#FF7A59" strokeWidth="2" strokeLinecap="round" />
      <circle cx="4.8" cy="20.5" r="2.1" fill="#FF7A59" />
      {/* spokes: top + left */}
      <line x1="15" y1="2.5" x2="15" y2="8" stroke="#FF7A59" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="4" y1="5" x2="10.5" y2="10" stroke="#FF7A59" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="15" cy="2.8" r="1.9" fill="#FF7A59" />
      <circle cx="3.8" cy="4.6" r="1.9" fill="#FF7A59" />
      {/* hub ring */}
      <circle cx="15" cy="13.5" r="5.6" fill="#FF7A59" />
      <circle cx="15" cy="13.5" r="2.3" fill="#ffffff" />
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

export const NAV_ITEMS: NavItem[] = [
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
    <aside
      className="hidden md:flex flex-col w-56 shrink-0 min-h-screen"
      style={{
        background: "#ffffff",
        borderRight: "1px solid var(--gaf-row-border)",
      }}
    >
      {/* Brand mark — official GAF icon logo */}
      <div
        className="flex items-center gap-2.5 px-4 py-5"
        style={{ borderBottom: "1px solid var(--gaf-row-border)" }}
      >
        <img
          src="https://cdn.shopify.com/s/files/1/1950/1891/files/GAF-Icon.png?v=1738497572"
          alt="Gym and Fitness"
          className="w-7 h-7 shrink-0"
        />
        <span
          className="text-sm font-bold tracking-tight"
          style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}
        >
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
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors text-left"
              style={{
                fontFamily: "var(--font-body)",
                background: isActive ? "var(--gaf-primary)" : "transparent",
                color: isActive ? "#ffffff" : "var(--gaf-text-secondary)",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "var(--gaf-primary-light)";
                  (e.currentTarget as HTMLElement).style.color = "var(--gaf-text-primary)";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--gaf-text-secondary)";
                }
              }}
              aria-current={isActive ? "page" : undefined}
            >
              <span style={{ color: isActive ? "#ffffff" : "inherit" }}>
                <Icon />
              </span>
              {label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-4 py-3"
        style={{ borderTop: "1px solid var(--gaf-row-border)" }}
      >
        <p
          className="text-xs"
          style={{ color: "var(--gaf-text-muted)", fontFamily: "var(--font-body)" }}
        >
          AFS Group
        </p>
      </div>
    </aside>
  );
}
