import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, CartesianGrid, ComposedChart, Line, LabelList } from "recharts";
import { Sun, Moon } from "lucide-react";
import { META, MONTHLY, STATES, CATEGORIES, TOP_PRODUCTS, FUNC, EMO, BARRIERS, STAGE, TIMELINE, COMPETITORS, JOIN, ARCHETYPES, CROSSTAB, PATTERNS } from "./data";

// ═══════════════════════════════════════════════════════════
// REVEL CUSTOMER INTELLIGENCE & JTBD DEEP DIVE — v2.1
// WHO × WHERE model: archetypes are identity-only (journey-stage
// fields excluded from clustering); readiness is measured as an
// overlay. Validated against the full order base, not just callers.
// ═══════════════════════════════════════════════════════════

const C = {
  green: "var(--revel-green)",
  greenBody: "var(--color-green-body)",
  greenSoft: "var(--color-green-soft)",
  forest: "var(--revel-forest)",
  bg: "var(--color-bg)",
  card: "var(--color-card)",
  text: "var(--color-text)",
  muted: "var(--color-muted)",
  faint: "var(--color-faint)",
  border: "var(--color-border)",
  chip: "var(--color-chip-bg)",
  navBg: "var(--color-nav-bg)",
  tooltipBg: "var(--color-tooltip-bg)",
  shadow: "var(--shadow-card)",
};
const GREEN = "#25B34B";
const GREY_BAR = "#C4C4C4";
// WHO archetype colours: 0 Contrast Athlete, 1 Quiet Shopper, 2 Infrared Health-Seeker, 3 Traditional Purist, 4 Commercial
const ARCH_COLORS: Record<number, string> = { 0: "#2F6BAF", 1: "#9E9E9E", 2: "#25B34B", 3: "#485D4D", 4: "#D99100" };

const LOGO_WHITE = "https://cdn.shopify.com/s/files/1/0802/6279/1481/files/REVEL_Logo-White-02.png?v=1691241102";
const LOGO_BLACK = "https://cdn.shopify.com/s/files/1/0802/6279/1481/files/REVEL_Logo-Black-01.png?v=1691024664";

const fmtM = (v: number) => `$${(v / 1000000).toFixed(1)}M`;
const fmtK = (v: number) => v >= 1000000 ? fmtM(v) : v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${Math.round(v)}`;
const fmt = (v: number) => v.toLocaleString();
const PRETTY: Record<string, string> = {
  residential_home_sauna: "Residential Home", residential_apartment: "Apartment",
  other_commercial: "Other Commercial", commercial_gym_spa: "Gym / Spa",
  commercial_recovery_center: "Recovery Centre", commercial_airbnb: "Airbnb / Short-Stay",
  institutional_medical: "Institutional / Medical", sauna_plus_ice: "Sauna + Ice",
  sauna_undecided: "Sauna (undecided)", ice_only: "Ice Bath / Chiller",
};
const pretty = (s: string) => PRETTY[s] || s.replace(/_/g, " ");

const CATMAP: Record<string, string> = { INF: "Infrared", TRD: "Traditional", BAR: "Barrel", HYB: "Hybrid", ICE: "Ice Bath", CHL: "Chiller", HTC: "Heater", ACC: "Accessories", "n/a": "Other" };
const prettyCats = (k: string) => k.split("+").map(c => CATMAP[c] || c).join(" + ");

const UPPER: React.CSSProperties = { textTransform: "uppercase", letterSpacing: "0.02em" };
const EYEBROW: React.CSSProperties = { fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" };

const StatCard = ({ label, value, sub, hero }: { label: string; value: string; sub?: string; hero?: boolean }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
    style={{ background: C.card, borderRadius: 10, padding: "22px 24px", border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
    <div style={{ ...EYEBROW, color: C.muted, marginBottom: 8 }}>{label}</div>
    <div style={{ color: hero ? C.green : C.text, fontSize: 30, fontWeight: 700, letterSpacing: "-0.01em" }}>{value}</div>
    {sub && <div style={{ color: C.muted, fontSize: 13, marginTop: 6, lineHeight: 1.4 }}>{sub}</div>}
  </motion.div>
);

const SectionHeader = ({ eyebrow, title, subtitle, id }: { eyebrow: string; title: string; subtitle?: string; id: string }) => (
  <div id={id} style={{ marginBottom: 28, paddingTop: 56 }}>
    <div style={{ ...EYEBROW, color: C.greenBody, marginBottom: 8 }}>{eyebrow}</div>
    <h2 style={{ ...UPPER, color: C.text, fontSize: 26, fontWeight: 700, marginBottom: 12 }}>{title}</h2>
    <div style={{ width: 64, borderTop: `2px solid ${GREEN}`, marginBottom: 12 }} />
    {subtitle && <p style={{ color: C.muted, fontSize: 14, maxWidth: 780, lineHeight: 1.55 }}>{subtitle}</p>}
  </div>
);

const Chip = ({ children, tone }: { children: React.ReactNode; tone?: "green" | "danger" | "plain"; key?: any }) => {
  const styles = tone === "green"
    ? { background: C.greenSoft, color: C.greenBody }
    : tone === "danger"
      ? { background: "rgba(194,59,34,0.10)", color: "#C23B22" }
      : { background: C.chip, color: C.text };
  return (
    <span style={{ display: "inline-block", ...styles, padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 6, marginBottom: 6 }}>{children}</span>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.tooltipBg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 14px", fontSize: 13, boxShadow: "0 6px 14px rgba(0,0,0,.08)" }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: C.text }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: C.muted }}>{p.name}: <span style={{ color: C.text, fontWeight: 700 }}>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span></div>
      ))}
    </div>
  );
};

const Card = ({ children, style }: any) => (
  <div style={{ background: C.card, borderRadius: 10, padding: 24, border: `1px solid ${C.border}`, boxShadow: C.shadow, ...style }}>{children}</div>
);

const ChartTitle = ({ children }: any) => (
  <h3 style={{ ...UPPER, fontSize: 14, fontWeight: 700, marginBottom: 16, color: C.text }}>{children}</h3>
);

const NAV_ITEMS = [
  { id: "exec", label: "Summary" },
  { id: "join", label: "Call → Revenue" },
  { id: "macro", label: "Drivers" },
  { id: "who", label: "Archetypes" },
  { id: "validate", label: "Validation" },
  { id: "v1v2", label: "v1 vs v2" },
  { id: "revenue", label: "Revenue" },
  { id: "strategy", label: "Actions" },
  { id: "method", label: "Method" },
];

const V1_ORDER = ["Sanctuary Seeker", "Home Renovator", "Performance Biohacker", "Commercial Operator", "Cautious Researcher", "Unclassified"];
const V2_ORDER = ["The Infrared Health-Seeker", "The Traditional Purist", "The Contrast Athlete", "The Commercial Recovery Operator", "The Quiet Shopper"];

const VERDICTS = [
  { v1: "Sanctuary Seeker", verdict: "SPLIT BY PRODUCT PHILOSOPHY", color: "#D99100", note: "The health-first home buyer is real — but it's two archetypes, not one. 40% are Infrared Health-Seekers (tech-lean, indoor-friendly, electrical friction) and 37% are Traditional Purists (ritual, outdoor, 99% traditional product intent). They want different messages, different pages, different proof." },
  { v1: "Performance Biohacker", verdict: "VALIDATED", color: "#2E8B4A", note: "57% land together as the Contrast Athlete — home recovery enthusiasts running sauna + ice as a protocol. Drop the 'biohacker' persona framing; these are everyday athletes and tradies, and they carry the second-highest basket ($10.7K)." },
  { v1: "Commercial Operator", verdict: "VALIDATED", color: "#2E8B4A", note: "77% cohesion into the Commercial Recovery Operator — gyms, studios, developers fitting out recovery spaces. v1 had this right. (Our own first rerun briefly merged it away; with journey-stage noise removed, it separates cleanly.)" },
  { v1: "Cautious Researcher", verdict: "MOSTLY AN ARTIFACT", color: "#C23B22", note: "52% are simply Quiet Shoppers — callers who revealed little on the phone. 'Caution' was largely missing data plus no timeline, not a customer identity. The real insight is a needs-discovery gap on calls, which is a coaching opportunity, not a persona." },
  { v1: "Home Renovator", verdict: "DISSOLVED", color: "#C23B22", note: "Renovators scatter across all five identity archetypes. Renovation is a trigger and a timing signal — build it into campaign timing and PDP content, but don't market to 'renovators' as a who." },
  { v1: "— (new in v2)", verdict: "FOUND: THE QUIET SHOPPER", color: "#2F6BAF", note: "23% of callers disclose almost nothing — yet they still convert at 26% and buy full-price saunas. Every point of needs-discovery improvement on these calls is measurable revenue. This is a sales-coaching archetype, not a marketing one." },
];

export default function App() {
  const [activeArchetype, setActiveArchetype] = useState(2);
  const [activeSection, setActiveSection] = useState("exec");
  const [isDark, setIsDark] = useState(false);
  const arch = ARCHETYPES.find((a: any) => a.id === activeArchetype)!;

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const radarData = Object.entries(arch.radar).map(([axis, val]) => ({ axis, val }));
  const boughtData = Object.entries(arch.bought).map(([k, v]) => ({ name: prettyCats(k), count: v }));
  const ARCH_SORTED = [2, 3, 1, 0, 4].map(i => ARCHETYPES.find((a: any) => a.id === i));

  return (
    <div className={isDark ? "dark" : ""} style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "var(--font-sans)", transition: "background-color 0.2s, color 0.2s" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: C.navBg, backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.border}`, padding: "0 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: 4, overflowX: "auto", padding: "12px 0" }}>
          <img src={isDark ? LOGO_WHITE : LOGO_BLACK} alt="Revel" style={{ height: 22, marginRight: 10 }} />
          <div style={{ ...EYEBROW, color: C.muted, marginRight: 12, whiteSpace: "nowrap", fontSize: 10 }}>Customer Intelligence v2</div>
          {NAV_ITEMS.map(n => (
            <button key={n.id} onClick={() => scrollTo(n.id)}
              style={{ background: activeSection === n.id ? GREEN : "transparent", color: activeSection === n.id ? "#fff" : C.muted, border: "none", padding: "9px 13px", borderRadius: 999, cursor: "pointer", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", transition: "background-color 120ms" }}>
              {n.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => setIsDark(!isDark)} title="Toggle Light/Dark"
            style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", padding: 8, display: "flex", borderRadius: "50%" }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* ═══ TITLE ═══ */}
        <div style={{ paddingTop: 64, paddingBottom: 32, borderBottom: `2px solid ${GREEN}`, marginBottom: 24 }}>
          <div style={{ ...EYEBROW, color: C.greenBody, marginBottom: 12 }}>Revel Saunas · Customer Intelligence</div>
          <h1 style={{ ...UPPER, fontSize: 38, fontWeight: 700, marginBottom: 14, lineHeight: 1.15, maxWidth: 900 }}>
            Customer Intelligence & JTBD Deep Dive — v2
          </h1>
          <p style={{ color: C.muted, fontSize: 15, maxWidth: 800, lineHeight: 1.55 }}>
            {fmt(META.calls)} analysed pre-sale calls matched by phone number to NetSuite orders. Archetypes are derived from
            {" "}<strong style={{ color: C.text }}>identity and need only</strong> — journey-stage signals are deliberately excluded and
            measured as a separate readiness overlay, because phone callers self-select toward the end of the funnel.
          </p>
          <div style={{ display: "flex", gap: 4, marginTop: 18, flexWrap: "wrap" }}>
            <Chip tone="green">{fmt(META.calls)} Calls · {META.dateRange}</Chip>
            <Chip>{fmtM(META.revenueIncGst)} Revenue (12mo)</Chip>
            <Chip>{fmt(META.orders)} Orders</Chip>
            <Chip>{fmtM(JOIN.callerRevenue)} traced to callers</Chip>
            <Chip>WHO × WHERE model</Chip>
          </div>
        </div>

        {/* ═══ A: EXEC SUMMARY ═══ */}
        <SectionHeader id="exec" eyebrow="Section A" title="Executive Summary" subtitle="Call intelligence and transactional data, joined at the individual caller level." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 16 }}>
          <StatCard hero label="Pre-Sale Calls Analysed" value={fmt(META.calls)} sub={`${fmt(META.uniqueCallers)} unique callers · ${META.dateRange}`} />
          <StatCard label="Revenue (Trailing 12mo)" value={fmtM(META.revenueIncGst)} sub={`${fmt(META.orders)} orders · ${fmt(META.customers)} customers · inc GST`} />
          <StatCard label="Gross Margin" value={`${META.marginPct}%`} sub={`${fmtM(META.gp)} GP on ${fmtM(META.netRevenue)} ex-GST revenue`} />
          <StatCard label="Caller Conversion (Floor)" value={`${JOIN.convPct}%`} sub={`${JOIN.purchasers} of ${fmt(JOIN.uniqueCallers)} callers found in NetSuite orders`} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
          <StatCard hero label="Revenue Traced to Callers" value={fmtM(JOIN.callerRevenue)} sub={`${fmtK(JOIN.callerGP)} GP · median ${fmtK(JOIN.medianSpend)} per purchasing caller`} />
          <StatCard label="Dominant Functional Job" value="Health / Detox" sub={`${FUNC[0].count} callers (${FUNC[0].pct}%)`} />
          <StatCard label="Dominant Barrier" value="Financial" sub={`${BARRIERS[0].count} callers (${BARRIERS[0].pct}%) · confidence + electrical close behind`} />
          <StatCard label="True Repeat Customers" value={`${META.repeatPct}%`} sub={`${fmt(META.repeatCustomers)} of ${fmt(META.paidCustomers)} paid customers · ${META.repeatRevPct}% of revenue · $0 warranty orders excluded`} />
        </div>

        <Card style={{ marginBottom: 32 }}>
          <ChartTitle>The Strategic Headlines</ChartTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              { n: "01", t: "Callers Are Worth $4M+, and They Buy Fast", b: <>At least <strong style={{ color: C.text }}>{JOIN.convPct}% of phone callers become customers</strong> (a floor — phone-keyed orders often lack a stored number), worth {fmtM(JOIN.callerRevenue)}. Of those who buy after calling, 65% order within a week of the first call.</> },
              { n: "02", t: "Who You Are ≠ Where You Are", b: <>Five stable identity archetypes describe WHO customers are. Readiness (WHERE they are in the journey) is a separate overlay that <strong style={{ color: C.text }}>roughly doubles conversion inside every archetype</strong> — 46-55% at decision stage vs ~20-25% earlier.</> },
              { n: "03", t: "The Health Buyer Splits in Two", b: <>The core home wellness buyer divides on <strong style={{ color: C.text }}>product philosophy</strong>: Infrared Health-Seekers vs Traditional Purists — near-equal halves of both the call base and the actual customer base (619 vs 693 buyers). One range, two languages.</> },
              { n: "04", t: "Contrast Buyers Are the Value Segment", b: <>Sauna + ice customers average <strong style={{ color: C.text }}>$12.9K (2.2× a single-modality buyer)</strong> and 39% place another paid order within the year — 4× the single-modality repeat rate, even after stripping out $0 warranty orders that inflate naive repeat metrics.</> },
            ].map((h, i) => (
              <div key={i}>
                <div style={{ ...EYEBROW, color: C.greenBody, marginBottom: 6 }}>{h.n}</div>
                <div style={{ ...UPPER, fontWeight: 700, fontSize: 14, marginBottom: 8, lineHeight: 1.3 }}>{h.t}</div>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>{h.b}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* ═══ B: CALL → REVENUE JOIN ═══ */}
        <SectionHeader id="join" eyebrow="Section B" title="The Call → Revenue Join" subtitle="Each caller's phone number matched against NetSuite customer records, then their actual orders. Every number below is observed, not modelled." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          <StatCard label="Unique Callers" value={fmt(JOIN.uniqueCallers)} sub={`from ${fmt(JOIN.calls)} analysed calls`} />
          <StatCard label="Matched to a Customer" value={fmt(JOIN.matched)} sub={`${JOIN.matchPct}% by normalised phone`} />
          <StatCard hero label="Purchased" value={fmt(JOIN.purchasers)} sub={`${JOIN.convPct}% of all callers — a floor, not a ceiling`} />
          <StatCard label="Avg Spend per Buyer" value={fmtK(JOIN.avgSpend)} sub={`median ${fmtK(JOIN.medianSpend)}`} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, marginBottom: 32 }}>
          <Card>
            <ChartTitle>When Do Callers Buy? (First Call → First Order)</ChartTitle>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={JOIN.timing} margin={{ left: 10, right: 30, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="bucket" tick={{ fill: C.muted, fontSize: 10 }} interval={0} angle={-14} textAnchor="end" height={62} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis tick={{ fill: C.faint, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(37,179,75,0.06)" }} />
                <Bar dataKey="count" name="Purchasing callers" radius={[4, 4, 0, 0]}>
                  {JOIN.timing.map((t: any, i: number) => <Cell key={i} fill={t.bucket === "Same week as call" ? GREEN : GREY_BAR} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p style={{ color: C.muted, fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
              The median purchasing caller orders <strong style={{ color: C.text }}>the same day they call</strong> — which is exactly why callers can't define our archetypes on their own: the phone attracts people who are already close to buying.
            </p>
          </Card>
          <Card>
            <ChartTitle>Why 31.8% Is a Floor</ChartTitle>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
              <p style={{ marginBottom: 10 }}>The match requires the caller's number to be stored on their NetSuite customer record. Web orders sync phones reliably; <strong style={{ color: C.text }}>manually-keyed phone sales often don't</strong> — we verified purchasers on recorded calls whose customer records hold no phone at all.</p>
              <p style={{ marginBottom: 10 }}>~3% of Revel order customers have no phone on record, and others transact under a partner's number or a different line.</p>
              <p>So treat {JOIN.convPct}% as the <strong style={{ color: C.text }}>observable minimum</strong>. True caller conversion is meaningfully higher — and either way, callers represent at least {Math.round(JOIN.callerRevenue / META.revenueIncGst * 100)}% of all Revel revenue.</p>
            </div>
          </Card>
        </div>

        {/* ═══ C: MARKET DRIVERS ═══ */}
        <SectionHeader id="macro" eyebrow="Section C" title="Macro Market Drivers" subtitle={`Jobs-to-be-done and friction across ${fmt(META.uniqueCallers)} unique callers (counting each person once, not each call).`} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <Card>
            <ChartTitle>Functional Job Themes</ChartTitle>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={FUNC.filter((f: any) => f.name !== "Other")} layout="vertical" margin={{ left: 10, right: 52 }}>
                <XAxis type="number" tick={{ fill: C.faint, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(37,179,75,0.06)" }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Callers">
                  {FUNC.filter((f: any) => f.name !== "Other").map((_: any, i: number) => <Cell key={i} fill={i === 0 ? GREEN : GREY_BAR} />)}
                  <LabelList dataKey="pct" position="right" formatter={(v: any) => `${v}%`} style={{ fill: "var(--color-muted)", fontSize: 11, fontWeight: 700 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>Share of the {fmt(META.uniqueCallers)} unique callers naming each theme.</p>
          </Card>
          <Card>
            <ChartTitle>Emotional Job Themes</ChartTitle>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={EMO.filter((e: any) => e.name !== "Other")} layout="vertical" margin={{ left: 10, right: 52 }}>
                <XAxis type="number" tick={{ fill: C.faint, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(37,179,75,0.06)" }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Callers">
                  {EMO.filter((e: any) => e.name !== "Other").map((_: any, i: number) => <Cell key={i} fill={i === 0 ? GREEN : GREY_BAR} />)}
                  <LabelList dataKey="pct" position="right" formatter={(v: any) => `${v}%`} style={{ fill: "var(--color-muted)", fontSize: 11, fontWeight: 700 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>Self-Care/Sanctuary dominates — the emotional job is a personal retreat, not status.</p>
          </Card>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          <Card>
            <ChartTitle>Primary Conversion Barriers</ChartTitle>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={BARRIERS.filter((b: any) => b.count > 20)} margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 10 }} interval={0} angle={-14} textAnchor="end" height={58} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis tick={{ fill: C.faint, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(37,179,75,0.06)" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Callers">
                  {BARRIERS.filter((b: any) => b.count > 20).map((_: any, i: number) => <Cell key={i} fill={i === 0 ? GREEN : GREY_BAR} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p style={{ color: C.muted, fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
              v1's top-3 (financial, electrical, space) still show, but with more data <strong style={{ color: C.text }}>confidence</strong> ("is this the right one for me?") emerges as the #2 barrier — a sales-enablement problem, not a product one.
            </p>
          </Card>
          <Card>
            <ChartTitle>Buying Stage & Timeline</ChartTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ ...EYEBROW, color: C.faint, marginBottom: 8, fontSize: 10 }}>Stage</div>
                {STAGE.map((s: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                    <span>{s.name}</span><span style={{ color: C.greenBody, fontWeight: 700 }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ ...EYEBROW, color: C.faint, marginBottom: 8, fontSize: 10 }}>Timeline</div>
                {TIMELINE.map((s: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                    <span>{s.name}</span><span style={{ color: C.text, fontWeight: 700 }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ color: C.muted, fontSize: 12, marginTop: 16, lineHeight: 1.5 }}>
              66% of callers with a timeline want to buy <strong style={{ color: C.text }}>this month or sooner</strong>. This is the self-selection of the phone channel — the customer base is broader than the people who ring at the end of their journey.
            </p>
          </Card>
        </div>

        {/* ═══ D: WHO — IDENTITY ARCHETYPES ═══ */}
        <SectionHeader id="who" eyebrow="Section D · Who" title="Customer Archetypes (Identity Only)" subtitle="Five clusters found by k-means on nine identity and need fields — segment, jobs, barriers, location, product philosophy, experience, price posture. Journey-stage fields were excluded from clustering, and post-purchase service callers were set aside. Conversion and spend are real NetSuite outcomes, shown as results, not inputs." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
          {ARCH_SORTED.map((a: any) => {
            const active = activeArchetype === a.id;
            return (
              <button key={a.id} onClick={() => setActiveArchetype(a.id)}
                style={{ background: active ? C.greenSoft : C.card, border: `2px solid ${active ? GREEN : C.border}`, borderRadius: 10, padding: 14, cursor: "pointer", textAlign: "left", transition: "border-color 120ms" }}>
                <div style={{ ...UPPER, fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>{a.name.replace("The ", "")}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{a.pct_of_callers}% · conv {a.conversion_pct}%</div>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={arch.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            style={{ background: C.card, borderRadius: 16, padding: 32, marginBottom: 32, border: `1px solid ${C.border}`, boxShadow: C.shadow, borderTop: `4px solid ${ARCH_COLORS[arch.id]}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div style={{ maxWidth: 560 }}>
                <h3 style={{ ...UPPER, fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{arch.name}</h3>
                <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.5 }}>
                  {arch.id === 0 && "Home recovery enthusiast running hot + cold as a protocol — sauna, ice bath and chiller as one system"}
                  {arch.id === 1 && "Reveals little on the phone but buys full-price saunas — the needs-discovery opportunity"}
                  {arch.id === 2 && "Health transformation through infrared — tech-lean, indoor-friendly, blocked by electrical questions"}
                  {arch.id === 3 && "The authentic hot-rock ritual, outdoors — 99% traditional product intent, space and heater questions"}
                  {arch.id === 4 && "Gyms, studios, developers and workplaces buying recovery as a service or amenity"}
                </p>
              </div>
              <div style={{ display: "flex", gap: 28, textAlign: "right", flexWrap: "wrap" }}>
                {[[`${arch.pct_of_callers}%`, `of prospects (${arch.n})`], [`${arch.conversion_pct}%`, "bought (observed)"], [fmtK(arch.avg_spend), "avg spend"], [fmtK(arch.total_revenue), "traced revenue"]].map(([v, l], i) => (
                  <div key={i}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: i === 0 ? C.greenBody : C.text }}>{v}</div>
                    <div style={{ ...EYEBROW, color: C.faint, fontSize: 10 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderLeft: `3px solid ${GREEN}`, background: C.greenSoft, borderRadius: "0 10px 10px 0", padding: "16px 20px", marginBottom: 24 }}>
              <p style={{ fontFamily: "var(--font-editorial)", fontStyle: "italic", fontWeight: 600, fontSize: 20, lineHeight: 1.45 }}>"{arch.quote}"</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28, marginBottom: 20 }}>
              <div>
                <div style={{ ...EYEBROW, color: C.greenBody, marginBottom: 12 }}>Who & Why</div>
                {[["Functional jobs", arch.functional], ["Emotional jobs", arch.emotional], ["Segments", arch.segments]].map(([label, items]: any, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: C.faint, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4 }}>{label}</div>
                    {items.filter((x: any) => !["unspecified", "Uncategorized"].includes(x.name)).slice(0, 3).map((x: any, j: number) => (
                      <Chip key={j} tone={j === 0 ? "green" : "plain"}>{pretty(x.name)} {x.pct}%</Chip>
                    ))}
                  </div>
                ))}
                <div style={{ fontSize: 10, color: C.faint, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4 }}>Top barriers</div>
                {arch.barriers.filter((x: any) => x.name !== "unspecified").slice(0, 3).map((x: any, j: number) => (
                  <Chip key={j} tone="danger">{pretty(x.name)} {x.pct}%</Chip>
                ))}
              </div>
              <div>
                <div style={{ ...EYEBROW, color: C.greenBody, marginBottom: 12 }}>Identity Radar (Data-Derived)</div>
                <ResponsiveContainer width="100%" height={210}>
                  <RadarChart data={radarData} outerRadius={68} margin={{ left: 24, right: 24 }}>
                    <PolarGrid stroke={C.border} />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: C.muted, fontSize: 10 }} />
                    <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                    <Radar dataKey="val" stroke={ARCH_COLORS[arch.id]} fill={ARCH_COLORS[arch.id]} fillOpacity={0.28} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div style={{ ...EYEBROW, color: C.greenBody, marginBottom: 12 }}>What They Actually Bought</div>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={boughtData} layout="vertical" margin={{ left: 10, right: 24 }}>
                    <XAxis type="number" tick={{ fill: C.faint, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ fill: C.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(37,179,75,0.06)" }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Buyers">
                      {boughtData.map((_: any, i: number) => <Cell key={i} fill={i === 0 ? GREEN : GREY_BAR} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* JTBD one layer deeper (GAF deep-dive style) */}
            {arch.jobs.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ ...EYEBROW, color: C.greenBody, marginBottom: 12 }}>The Jobs, One Layer Deeper — In Their Words</div>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))`, gap: 16 }}>
                  {arch.jobs.slice(0, 4).map((j: any, i: number) => (
                    <div key={i} style={{ background: "var(--color-bg-subtle)", border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
                      <div style={{ fontSize: 10, color: C.faint, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 4 }}>{j.type} job · {j.pct_of_arch}% of this archetype</div>
                      <div style={{ ...UPPER, fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{j.theme}</div>
                      {j.subthemes.map((s: any, k: number) => (
                        <div key={k} style={{ marginBottom: 7 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                            <span>{s.label}</span>
                            <span style={{ fontWeight: 700, color: k === 0 ? C.greenBody : C.muted }}>{s.pct}%</span>
                          </div>
                          <div style={{ height: 4, background: C.chip, borderRadius: 2 }}>
                            <div style={{ height: 4, width: `${Math.min(s.pct, 100)}%`, background: k === 0 ? GREEN : GREY_BAR, borderRadius: 2 }} />
                          </div>
                        </div>
                      ))}
                      <div style={{ fontSize: 10, color: C.faint, marginTop: 8 }}>% of the {j.theme} cohort within this archetype</div>
                    </div>
                  ))}
                </div>
                {arch.id === 1 && <p style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>The Quiet Shopper's jobs are largely uncategorised — they don't articulate needs on calls, which is precisely their defining trait (and the coaching opportunity).</p>}
              </div>
            )}

            {/* motivations, triggers, location */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 20 }}>
              {[["Motivations", arch.motivations], ["Trigger Events", arch.triggers], ["Equipment Location", (arch.locations || []).filter((x: any) => x.name !== "unspecified").map((x: any) => ({ label: pretty(x.name), pct: x.pct }))]].map(([label, items]: any, i) => (
                <div key={i} style={{ background: "var(--color-bg-subtle)", border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
                  <div style={{ ...EYEBROW, color: C.greenBody, fontSize: 10, marginBottom: 10 }}>{label}</div>
                  {(items as any[]).slice(0, 5).map((x: any, k: number) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                      <span>{x.label}</span>
                      <span style={{ fontWeight: 700, color: k === 0 ? C.greenBody : C.muted }}>{x.pct}%</span>
                    </div>
                  ))}
                  {(items as any[]).length === 0 && <p style={{ fontSize: 12, color: C.faint }}>Not articulated on calls.</p>}
                </div>
              ))}
            </div>

            {/* readiness overlay strip */}
            <div style={{ background: "var(--color-bg-subtle)", border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
              <div style={{ ...EYEBROW, color: C.faint, fontSize: 10, marginBottom: 10 }}>Readiness Overlay (WHERE this archetype sits when they call — not part of the clustering)</div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 13 }}>
                <span>Decision <strong style={{ color: C.greenBody }}>{arch.stage_mix.decision.pct_of_arch}%</strong>{arch.stage_mix.decision.conv !== null && <span style={{ color: C.muted }}> (conv {arch.stage_mix.decision.conv}%)</span>}</span>
                <span>Consideration <strong>{arch.stage_mix.consideration.pct_of_arch}%</strong>{arch.stage_mix.consideration.conv !== null && <span style={{ color: C.muted }}> (conv {arch.stage_mix.consideration.conv}%)</span>}</span>
                <span>Awareness <strong>{arch.stage_mix.awareness.pct_of_arch}%</strong></span>
                <span style={{ color: C.muted }}>Want it this month or sooner: <strong style={{ color: C.text }}>{arch.timeline_now_pct}%</strong></span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ═══ E: VALIDATION ═══ */}
        <SectionHeader id="validate" eyebrow="Section E" title="Validation Against the Full Customer Base" subtitle={`The call base is a biased sample. As a check, every one of the ${fmt(META.customers)} customers in the 12-month window was grouped by what they actually bought — no call data involved.`} />
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, marginBottom: 32 }}>
          <Card>
            <ChartTitle>Purchase Patterns — All Customers, 12mo (Paid Orders Only)</ChartTitle>
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${GREEN}` }}>
                  <th style={{ ...EYEBROW, textAlign: "left", padding: "8px 4px", color: C.muted, fontSize: 10 }}>Pattern</th>
                  <th style={{ ...EYEBROW, textAlign: "right", padding: "8px 4px", color: C.muted, fontSize: 10 }}>Customers</th>
                  <th style={{ ...EYEBROW, textAlign: "right", padding: "8px 4px", color: C.muted, fontSize: 10 }}>Revenue</th>
                  <th style={{ ...EYEBROW, textAlign: "right", padding: "8px 4px", color: C.muted, fontSize: 10 }}>Avg</th>
                  <th style={{ ...EYEBROW, textAlign: "right", padding: "8px 4px", color: C.muted, fontSize: 10 }}>Repeat</th>
                </tr>
              </thead>
              <tbody>
                {PATTERNS.map((p: any, i: number) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: p.pattern.startsWith("Contrast") ? C.greenSoft : "transparent" }}>
                    <td style={{ padding: "8px 4px", fontWeight: 700 }}>{p.pattern}</td>
                    <td style={{ padding: "8px 4px", textAlign: "right" }}>{fmt(p.custs)}</td>
                    <td style={{ padding: "8px 4px", textAlign: "right", fontWeight: 700 }}>{fmtK(p.rev)}</td>
                    <td style={{ padding: "8px 4px", textAlign: "right", color: C.muted }}>{fmtK(p.avg)}</td>
                    <td style={{ padding: "8px 4px", textAlign: "right", color: p.repeatPct >= 35 ? C.greenBody : C.muted, fontWeight: p.repeatPct >= 35 ? 700 : 400 }}>{p.repeatPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card>
            <ChartTitle>What the Cross-Check Says</ChartTitle>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
              <p style={{ marginBottom: 10 }}><strong style={{ color: C.text }}>The philosophy split is real.</strong> Traditional-only (693) and infrared-only (619) buyers are near-equal halves of the equipment base — matching the Purist / Health-Seeker divide found independently in the calls.</p>
              <p style={{ marginBottom: 10 }}><strong style={{ color: C.text }}>Contrast is the value segment.</strong> 213 customers bought sauna + ice: $12.9K average and a 39% paid-repeat rate — 4× the single-modality buyer. The behavioural signature of the Contrast Athlete (and the commercial fit-out).</p>
              <p style={{ marginBottom: 10 }}><strong style={{ color: C.text }}>The owner tail is big in count, tiny in dollars.</strong> 1,063 customers bought only add-ons — heaters, stones, accessories. They're a service population, not an acquisition target.</p>
              <p style={{ marginBottom: 10 }}><strong style={{ color: C.text }}>Warranty orders inflate naive repeat metrics.</strong> 851 of 4,454 sales orders (19%) are $0 — warranty replacements and parts raised as sales orders (e.g. SO 17868495: $0 total, −$4.5K GP). Counting them, "repeat rate" reads 24%; on paid orders it's {META.repeatPct}%. All figures on this page exclude them.</p>
              <p>Where the two lenses agree — and they do on every major group — we can trust the archetypes beyond the phone channel.</p>
            </div>
          </Card>
        </div>

        {/* ═══ F: V1 vs V2 ═══ */}
        <SectionHeader id="v1v2" eyebrow="Section F" title="Did We Get It Right the First Time?" subtitle="Each caller was assigned to their v1 archetype using v1's own rules, then cross-tabulated against the new identity clusters. The verdict is kinder to v1 than our first rerun was — once journey-stage noise is removed." />
        <Card style={{ marginBottom: 24, overflowX: "auto" }}>
          <ChartTitle>v1 Archetype → v2 Identity Cluster (Callers)</ChartTitle>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${GREEN}` }}>
                <th style={{ ...EYEBROW, textAlign: "left", padding: "10px 6px", color: C.muted, fontSize: 10 }}>v1 (Apr 2026) ↓</th>
                {V2_ORDER.map(c => <th key={c} style={{ ...EYEBROW, textAlign: "right", padding: "10px 6px", color: C.muted, fontSize: 10 }}>{c.replace("The ", "")}</th>)}
                <th style={{ ...EYEBROW, textAlign: "right", padding: "10px 6px", color: C.muted, fontSize: 10 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {V1_ORDER.map(r => {
                const row = V2_ORDER.map(c => (CROSSTAB as any)[c]?.[r] ?? 0);
                const tot = row.reduce((a: number, b: number) => a + b, 0);
                const mx = Math.max(...row);
                return (
                  <tr key={r} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "9px 6px", fontWeight: 700 }}>{r}</td>
                    {row.map((v: number, i: number) => (
                      <td key={i} style={{ padding: "9px 6px", textAlign: "right", fontWeight: v === mx && v > 0 ? 700 : 400, color: v === mx && v > 0 ? C.greenBody : v > 0 ? C.text : C.faint, background: v === mx && v > 0 ? C.greenSoft : "transparent" }}>
                        {v > 0 ? `${v} (${Math.round(v / tot * 100)}%)` : "—"}
                      </td>
                    ))}
                    <td style={{ padding: "9px 6px", textAlign: "right", color: C.muted }}>{tot}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 32 }}>
          {VERDICTS.map((v, i) => (
            <Card key={i} style={{ borderLeft: `4px solid ${v.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
                <span style={{ ...UPPER, fontWeight: 700, fontSize: 13 }}>{v.v1}</span>
                <span style={{ ...EYEBROW, fontSize: 10, color: v.color, whiteSpace: "nowrap" }}>{v.verdict}</span>
              </div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{v.note}</p>
            </Card>
          ))}
        </div>

        {/* ═══ G: REVENUE & PRODUCT ═══ */}
        <SectionHeader id="revenue" eyebrow="Section G" title="Revenue & Product" subtitle={`Trailing 12 months to 8 Jul 2026: ${fmtM(META.revenueIncGst)} inc GST across ${fmt(META.orders)} orders (closed/cancelled orders excluded).`} />
        <Card style={{ marginBottom: 24 }}>
          <ChartTitle>Monthly Revenue & Gross Profit</ChartTitle>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={MONTHLY} margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="mth" tick={{ fill: C.muted, fontSize: 10 }} axisLine={{ stroke: C.border }} tickLine={false}
                tickFormatter={(m: string) => { const [y, mo] = m.split("-"); return ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(mo)] + " " + y.slice(2); }} />
              <YAxis tick={{ fill: C.faint, fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(37,179,75,0.06)" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="rev" name="Revenue (inc GST)" radius={[4, 4, 0, 0]}>
                {MONTHLY.map((m: any, i: number) => <Cell key={i} fill={m.mth === "2025-11" || m.mth === "2026-06" ? GREEN : GREY_BAR} />)}
              </Bar>
              <Line dataKey="gp" name="Gross profit" stroke="#485D4D" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
          <p style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>
            Two engines drive the year: <strong style={{ color: C.text }}>Black Friday (Nov)</strong> and <strong style={{ color: C.text }}>EOFY (Jun)</strong>, each at ~$2.3M — 2.5× a normal month.
          </p>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <Card>
            <ChartTitle>Revenue by Category (ex GST)</ChartTitle>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={CATEGORIES.filter((c: any) => c.rev > 100000)} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" tick={{ fill: C.faint, fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="cat" width={130} tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(37,179,75,0.06)" }} />
                <Bar dataKey="rev" radius={[0, 4, 4, 0]} name="Net revenue">
                  {CATEGORIES.filter((c: any) => c.rev > 100000).map((_: any, i: number) => <Cell key={i} fill={i === 0 ? GREEN : GREY_BAR} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <ChartTitle>Item Margin by Category</ChartTitle>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={CATEGORIES.filter((c: any) => c.rev > 100000)} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" tick={{ fill: C.faint, fontSize: 11 }} domain={[0, 60]} tickFormatter={(v: number) => `${v}%`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="cat" width={130} tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(37,179,75,0.06)" }} />
                <Bar dataKey="margin" fill="#485D4D" radius={[0, 4, 4, 0]} name="Item margin %" />
              </BarChart>
            </ResponsiveContainer>
            <p style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>
              Saunas cluster at 44-48% item margin. Ice baths at ~25% remain the volume/entry play; hybrids are the margin sweet spot at 48%.
            </p>
          </Card>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, marginBottom: 32 }}>
          <Card>
            <ChartTitle>Top 10 Products by Revenue</ChartTitle>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${GREEN}` }}>
                  <th style={{ ...EYEBROW, textAlign: "left", padding: "8px 4px", color: C.muted, fontSize: 10 }}>Product</th>
                  <th style={{ ...EYEBROW, textAlign: "right", padding: "8px 4px", color: C.muted, fontSize: 10 }}>Units</th>
                  <th style={{ ...EYEBROW, textAlign: "right", padding: "8px 4px", color: C.muted, fontSize: 10 }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {TOP_PRODUCTS.slice(0, 10).map((p: any, i: number) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "8px 4px" }}>{p.name}</td>
                    <td style={{ padding: "8px 4px", textAlign: "right", color: C.muted }}>{p.units}</td>
                    <td style={{ padding: "8px 4px", textAlign: "right", fontWeight: 700, color: C.text }}>${fmt(p.net_rev | 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <div style={{ display: "grid", gap: 24 }}>
            <Card>
              <ChartTitle>Revenue by State</ChartTitle>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={STATES} margin={{ left: 10, right: 20 }}>
                  <XAxis dataKey="st" tick={{ fill: C.muted, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} />
                  <YAxis tick={{ fill: C.faint, fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000000).toFixed(0)}M`} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(37,179,75,0.06)" }} />
                  <Bar dataKey="rev" radius={[4, 4, 0, 0]} name="Revenue">
                    {STATES.map((_: any, i: number) => <Cell key={i} fill={i === 0 ? GREEN : GREY_BAR} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p style={{ color: C.muted, fontSize: 11, marginTop: 6 }}>East coast = 66% of shipped revenue. A further $2.3M has no shipping state recorded.</p>
            </Card>
            <Card>
              <ChartTitle>Competitors Named on Calls</ChartTitle>
              {COMPETITORS.slice(0, 6).map((c: any, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                  <span>{c.name}</span><span style={{ color: C.text, fontWeight: 700 }}>{c.mentions}</span>
                </div>
              ))}
              <p style={{ color: C.muted, fontSize: 11, marginTop: 6 }}>Alpine still leads share-of-voice, consistent with v1.</p>
            </Card>
          </div>
        </div>

        {/* ═══ H: ACTIONS ═══ */}
        <SectionHeader id="strategy" eyebrow="Section H" title="Strategic Actions" subtitle="WHO decides the message. WHERE decides the speed. The validation decides what to build." />
        <div style={{ display: "grid", gap: 24 }}>
          {[
            {
              title: "Sales", items: [
                { t: "1. Ask two questions on every call: who + where", b: "Identify the archetype (message) and the stage (urgency) in the first minutes. Decision-stage callers convert at 46-55% across every archetype — flag them in the CRM and mandate same-day quote turnaround.", d: "conv ~2× at decision stage" },
                { t: "2. Coach the Quiet Shopper gap", b: "23% of callers reveal almost nothing, yet convert at 26% anyway. Structured needs-discovery (goals, space, power, budget posture) on these calls is the cheapest conversion lift available — it also fixes the #2 barrier, confidence.", d: "263 callers · discovery gap" },
                { t: "3. Speak the caller's sauna language", b: "Purists want ritual, heat authenticity and outdoor durability; Health-Seekers want health proof, ease and electrical clarity. Same range, two scripts — and the barrier profile differs (space/heater vs electrical).", d: "two scripts, one range" },
                { t: "4. Keep the owner lane + commercial motion", b: "14% of calls are existing owners (route to service + scripted add-on). Commercial Recovery Operators are validated as a distinct archetype — spec sheets, commercial warranty, fit-out timing.", d: "42% add-on conv · 77% cohesion" },
              ]
            },
            {
              title: "Marketing", items: [
                { t: "1. Split creative by product philosophy", b: "The customer base is a near 50/50 split of traditional and infrared buyers (693 vs 619). Run distinct creative tracks: ritual/authenticity for Purists, health-tech/proof for Health-Seekers — one generic 'sauna' message under-serves both.", d: "693 vs 619 buyers" },
                { t: "2. Sell the second modality", b: "Contrast customers are worth 2.2× a single-modality buyer and 39% place another paid order within the year (vs 9-11% for single-modality). Market the upgrade path to every sauna owner (add the ice bath) and every ice-bath owner (add the sauna).", d: "$12.9K avg · 39% paid repeat" },
                { t: "3. Health outcomes remain the master message", b: "Health/Detox + Sleep + Recovery = 48% of stated jobs across archetypes. Lead with transformation; use the archetype split to choose the vehicle (ritual vs technology).", d: "674 callers health-led" },
                { t: "4. Protect the two peaks", b: "Black Friday and EOFY each do ~$2.3M — 30% of the year in two months. Campaign planning, stock depth and sales staffing should be built around defending these windows.", d: "Nov + Jun = 30% of revenue" },
              ]
            },
            {
              title: "Product & Digital", items: [
                { t: "1. Traditional vs infrared chooser", b: "The philosophy split plus the confidence barrier justify a guided selector (goals, space, power → recommendation). It serves the Quiet Shopper especially — the people who don't articulate needs on the phone.", d: "confidence = #2 barrier" },
                { t: "2. Recovery-station bundle builder", b: "Contrast is the highest-value purchase pattern ($2.75M from 214 customers). A sauna + ice + chiller configurator with bundle pricing converts the Contrast Athlete and the commercial fit-out without a phone call.", d: "$2.75M pattern" },
                { t: "3. Owner self-serve for add-ons", b: "1,063 customers bought only heaters/stones/accessories this year — mostly by phone. An owners' accessories flow (and replenishment email) serves them cheaper and keeps sales lines free for buyers.", d: "1,063 add-on-only customers" },
                { t: "4. Phone-number hygiene at order entry", b: "One in three callers can't be traced to their order because manually-keyed sales often skip the phone field. Make it mandatory in NetSuite — it's the difference between guessing and knowing ROI on a $4M+ channel.", d: "match rate 31.8% (floor)" },
              ]
            },
          ].map((sec, i) => (
            <Card key={i} style={{ padding: 28 }}>
              <div style={{ ...EYEBROW, color: C.greenBody, marginBottom: 6 }}>{`0${i + 1}`}</div>
              <h3 style={{ ...UPPER, fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{sec.title}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                {sec.items.map((item, j) => (
                  <div key={j} style={{ background: "var(--color-bg-subtle)", border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 }}>
                    <div style={{ ...UPPER, fontWeight: 700, fontSize: 13, marginBottom: 8, lineHeight: 1.35 }}>{item.t}</div>
                    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 10 }}>{item.b}</p>
                    <Chip tone="green">{item.d}</Chip>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* ═══ I: METHODOLOGY — REPRODUCTION MANUAL ═══ */}
        <div id="method" style={{ marginTop: 64, padding: 28, background: "var(--revel-forest)", borderRadius: 16, color: "#fff" }}>
          <h3 style={{ ...UPPER, fontSize: 14, fontWeight: 700, marginBottom: 6, color: "#fff" }}>Methodology — How to Reproduce This Analysis</h3>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>Written as an instruction manual so a future analyst (human or AI) can rerun this end-to-end. Both source systems are read-only throughout.</p>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.8 }}>
            <p><strong style={{ color: "#fff" }}>1 · Call data.</strong> Source: the "Revel_Transcript_Insights" Google Sheet, tab <em>Should_Analyze</em> (AI-classified Aircall transcripts; ~100 columns including customer_phone, JTBD themes and raw strings, motivations, triggers, barriers, buying stage, verbatim quotes). This run: 2,043 calls, 18 Nov 2025 – 8 Jul 2026. Access it with an authorised Google account (the anonymous CSV export is blocked; the sheet ID and API auth path live in Gary's memory: reference_revel_customer_intelligence_v2). Deduplicate to unique callers on normalised phone (strip non-digits, keep last 9) — here 1,392 from 2,043 calls.</p>
            <p><strong style={{ color: "#fff" }}>2 · Sales data.</strong> NetSuite SuiteQL over sales orders. Revel is identified by <em>department</em> — REVEL (38), Revel Online AU (39), Revel Wholesale AU (46) on the mainline — there is no Revel subsidiary or class. Exclude status H (Closed = cancelled; 957 orders / $3.7M this window). Status G = billed, B = pending fulfilment. Window: trailing 12 months. Shipping state joins via transactionshippingaddress.nkey = transaction.shippingaddress; GP = header estgrossprofit.</p>
            <p><strong style={{ color: "#fff" }}>3 · The warranty trap.</strong> Warranty replacements and missing parts are raised as <em>$0 sales orders in the same Revel departments</em> (often with PART-* SKUs and negative GP — e.g. SO 17868495, $0 / −$4.5K GP). They are 19% of all orders (851 of 4,454) and silently double any naive repeat-purchase metric (774 "repeat" customers vs 396 real). <em>Always filter foreigntotal &gt; 0 for customer-behaviour metrics.</em></p>
            <p><strong style={{ color: "#fff" }}>4 · Product categories.</strong> Item class is unreliable; map SKU prefixes instead: R-FS/R-FI/R-BFS = infrared, R-TR/R-BT = traditional/barrel, R-CS = hybrid, R-ICE = ice bath, R-CHILL = chiller, R-H-/R-XEN/R-STONE = heaters & controls, PART- = parts. Revenue basis: topline = GST-inclusive order totals; category/margin = ex-GST item lines (v1's 36.1% margin divided GP by inc-GST revenue; ex-GST it is {META.marginPct}%).</p>
            <p><strong style={{ color: "#fff" }}>5 · Caller→order join.</strong> Normalise both sides to last-9-digits and match against customer phone AND mobilephone. Do <em>not</em> regex-scan the whole customer table (it times out) — scope the inner query to Revel-order customers first, then apply the IN-list. Result here: 443/1,392 matched, 435 purchasers, $4.0M traced. Treat as a floor: ~3% of customers have no phone on record and manually-keyed phone sales often skip the field.</p>
            <p><strong style={{ color: "#fff" }}>6 · Archetypes (WHO).</strong> k-means (k=5, one-hot, "unspecified"/"Uncategorized" columns down-weighted ×0.15) on nine <em>identity</em> fields only: segment, functional theme, emotional theme, barrier, location, price sensitivity, product family, experience, decision role. Journey-stage fields (buying stage, timeline, urgency) are deliberately excluded — phone callers self-select toward the end of the funnel (66% want to buy within the month; median purchase same-day), so stage signals would just rediscover the funnel, as our first rerun proved. Exclude post-purchase callers (126) and sparse profiles (139); cluster the remaining 1,127. Purchase outcomes and readiness are measured per cluster afterwards, never clustered on. Separation is modest (silhouette ≈ 0.09) — treat archetypes as strong tendencies.</p>
            <p><strong style={{ color: "#fff" }}>7 · Layer-2 sub-themes.</strong> The deep-dive percentages come from keyword-bucketing the raw free-text classifications (job_functional, job_emotional, motivation_primary/secondary, trigger_event_primary/secondary) within each theme cohort, per archetype. Buckets are regex keyword groups (e.g. Control/Optimization → install|setup|fit|electrical for "getting install right"); a caller can match multiple sub-themes.</p>
            <p><strong style={{ color: "#fff" }}>8 · Validation.</strong> Group ALL 12-month customers (paid orders only) by purchase composition via per-customer MAX(CASE) flags on the SKU prefixes, aggregated entirely in SuiteQL — no call data. Compare against the call-derived archetypes; agreement on the major groups is what licenses using call-based archetypes beyond the phone channel.</p>
            <p><strong style={{ color: "#fff" }}>9 · Known limitations.</strong> Call base ≠ customer base (web-only buyers never call); quiet callers depress theme coverage; keyword buckets are heuristic; the v1 comparison approximates v1's rules from its published definitions. Privacy: aggregates and anonymised quotes only — no names or contact details on this page.</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.25)" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Generated 9 Jul 2026 by Gary · sources read-only · LIVE LONGER, LIVE BETTER.</span>
            <img src={LOGO_WHITE} alt="Revel" style={{ height: 28 }} />
          </div>
        </div>

      </div>
    </div>
  );
}
