import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, CartesianGrid, ComposedChart, Line } from "recharts";
import { Sun, Moon } from "lucide-react";
import { META, MONTHLY, STATES, CATEGORIES, TOP_PRODUCTS, FUNC, EMO, BARRIERS, LOC, STAGE, TIMELINE, OUTCOME, SEGMENT, COMPETITORS, JOIN, ARCHETYPES, CROSSTAB } from "./data";

// ═══════════════════════════════════════════════════════════
// REVEL CUSTOMER INTELLIGENCE & JTBD DEEP DIVE — v2
// Styled to the Revel 2025 visual identity: Montserrat 400/700,
// uppercase display, Revel Green as the single accent, grey
// non-target data, white-dominant with black dark mode.
// ═══════════════════════════════════════════════════════════

const C = {
  green: "var(--revel-green)",
  greenBody: "var(--color-green-body)",
  greenSoft: "var(--color-green-soft)",
  forest: "var(--revel-forest)",
  sage: "var(--revel-sage)",
  info: "var(--revel-info)",
  warning: "var(--revel-warning)",
  danger: "var(--revel-danger)",
  success: "var(--revel-success)",
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
const PIE_COLORS = ["#25B34B", "#485D4D", "#ABB99C", "#8EE0A5", "#177E33", "#9E9E9E"];
const ARCH_COLORS: Record<number, string> = { 0: "#25B34B", 1: "#9E9E9E", 2: "#ABB99C", 3: "#2F6BAF", 4: "#D99100", 5: "#485D4D" };

const LOGO_WHITE = "https://cdn.shopify.com/s/files/1/0802/6279/1481/files/REVEL_Logo-White-02.png?v=1691241102";
const LOGO_BLACK = "https://cdn.shopify.com/s/files/1/0802/6279/1481/files/REVEL_Logo-Black-01.png?v=1691024664";

const fmtM = (v: number) => `$${(v / 1000000).toFixed(1)}M`;
const fmtK = (v: number) => v >= 1000000 ? fmtM(v) : `$${(v / 1000).toFixed(0)}K`;
const fmt = (v: number) => v.toLocaleString();

const CATMAP: Record<string, string> = { INF: "Infrared", TRD: "Traditional", BAR: "Barrel", HYB: "Hybrid", ICE: "Ice Bath", CHL: "Chiller", HTC: "Heater", ACC: "Accessories", "n/a": "Other" };
const prettyCats = (k: string) => k.split("+").map(c => CATMAP[c] || c).join(" + ");

const UPPER: React.CSSProperties = { textTransform: "uppercase", letterSpacing: "0.02em" };
const EYEBROW: React.CSSProperties = { fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" };

// ── UI atoms ────────────────────────────────────────────
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
    {subtitle && <p style={{ color: C.muted, fontSize: 14, maxWidth: 760, lineHeight: 1.55 }}>{subtitle}</p>}
  </div>
);

const Chip = ({ children, tone }: { children: React.ReactNode; tone?: "green" | "danger" | "plain" }) => {
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
  { id: "macro", label: "Market Drivers" },
  { id: "archetypes", label: "Archetypes v2" },
  { id: "v1v2", label: "v1 vs v2" },
  { id: "revenue", label: "Revenue" },
  { id: "strategy", label: "Actions" },
  { id: "method", label: "Method" },
];

const V1_ORDER = ["Sanctuary Seeker", "Home Renovator", "Performance Biohacker", "Commercial Operator", "Cautious Researcher", "Unclassified"];
const V2_ORDER = ["The Ready Buyer", "The Health-Seeker", "The Contrast Recovery Builder", "The Owner & Add-On Caller", "The Patient Planner", "The Window Shopper"];

const VERDICTS = [
  { v1: "Sanctuary Seeker", verdict: "VALIDATED (at its core)", color: "#2E8B4A", note: "49% of Sanctuary Seekers land in the Health-Seeker cluster — the health-first home buyer is real and is still the biggest group. But 23% of them were actually decision-stage Ready Buyers, a far more valuable group v1 lumped in with everyone else." },
  { v1: "Performance Biohacker", verdict: "PARTIALLY REAL", color: "#D99100", note: "The contrast-therapy job exists (29% land in Contrast Recovery Builder), but the 'biohacker' framing over-personified it. Another 26% were simply Ready Buyers who happened to want ice baths." },
  { v1: "Commercial Operator", verdict: "MERGED", color: "#D99100", note: "55% of commercial callers cluster with the Contrast Recovery Builder. Commercial is a context (who pays), not a distinct job-to-be-done — they want the same recovery outcome, with commercial-grade specs." },
  { v1: "Cautious Researcher", verdict: "SPLIT IN TWO", color: "#C23B22", note: "v1 conflated two opposite groups: Window Shoppers (31%, ~6% conversion, browsing with no timeline) and Patient Planners (30%, 20% conversion at the highest spend of any archetype). One deserves a nurture track; the other barely deserves a follow-up." },
  { v1: "Home Renovator", verdict: "DISSOLVED", color: "#C23B22", note: "Renovators scatter across every v2 cluster (34% Health-Seeker, 30% Patient Planner, 15% Ready Buyer). Renovation is a trigger event, not an archetype — it tells you when they buy, not who they are or what they need." },
  { v1: "— (not in v1)", verdict: "MISSED: READY BUYER", color: "#2F6BAF", note: "The single most valuable group — 20% of callers, 48% conversion, buying within days — wasn't an archetype in v1 at all. It was invisible because v1 clustered on segment × location instead of readiness." },
  { v1: "— (not in v1)", verdict: "MISSED: OWNER & ADD-ON", color: "#2F6BAF", note: "14% of inbound calls are existing customers — support, delivery chasing, and add-on purchases. v1 treated the phone queue as 100% pre-sale. It isn't, and these calls convert to add-on revenue at 42%." },
];

export default function App() {
  const [activeArchetype, setActiveArchetype] = useState(0);
  const [activeSection, setActiveSection] = useState("exec");
  const [isDark, setIsDark] = useState(false);
  const arch = ARCHETYPES.find((a: any) => a.id === activeArchetype)!;

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const radarData = Object.entries(arch.radar).map(([axis, val]) => ({ axis, val }));
  const boughtData = Object.entries(arch.bought).map(([k, v]) => ({ name: prettyCats(k), count: v }));

  return (
    <div className={isDark ? "dark" : ""} style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "var(--font-sans)", transition: "background-color 0.2s, color 0.2s" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: C.navBg, backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.border}`, padding: "0 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: 6, overflowX: "auto", padding: "12px 0" }}>
          <img src={isDark ? LOGO_WHITE : LOGO_BLACK} alt="Revel" style={{ height: 22, marginRight: 10 }} />
          <div style={{ ...EYEBROW, color: C.muted, marginRight: 16, whiteSpace: "nowrap", fontSize: 10 }}>Customer Intelligence v2</div>
          {NAV_ITEMS.map(n => (
            <button key={n.id} onClick={() => scrollTo(n.id)}
              style={{ background: activeSection === n.id ? GREEN : "transparent", color: activeSection === n.id ? "#fff" : C.muted, border: "none", padding: "9px 16px", borderRadius: 999, cursor: "pointer", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", transition: "background-color 120ms" }}>
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
          <p style={{ color: C.muted, fontSize: 15, maxWidth: 780, lineHeight: 1.55 }}>
            Rerun of the April 2026 analysis with 76% more call data and a real caller-level join to NetSuite:
            {" "}{fmt(META.calls)} analysed pre-sale calls matched by phone number to sales orders, plus a blind re-derivation
            of the customer archetypes to test how well v1 held up.
          </p>
          <div style={{ display: "flex", gap: 4, marginTop: 18, flexWrap: "wrap" }}>
            <Chip tone="green">{fmt(META.calls)} Calls · {META.dateRange}</Chip>
            <Chip>{fmtM(META.revenueIncGst)} Revenue (12mo)</Chip>
            <Chip>{fmt(META.orders)} Orders</Chip>
            <Chip>{fmtM(JOIN.callerRevenue)} traced to callers</Chip>
            <Chip>Blind re-clustering</Chip>
          </div>
        </div>

        {/* ═══ A: EXEC SUMMARY ═══ */}
        <SectionHeader id="exec" eyebrow="Section A" title="Executive Summary" subtitle="Call intelligence and transactional data, now joined at the individual caller level." />
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
          <StatCard label="Repeat Customers" value={`${META.repeatPct}%`} sub={`${fmt(META.repeatCustomers)} customers · ${META.repeatRevPct}% of revenue`} />
        </div>

        <Card style={{ marginBottom: 32 }}>
          <ChartTitle>The Strategic Headlines</ChartTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              { n: "01", t: "Callers Are Worth $4M+, and They Buy Fast", b: <>At least <strong style={{ color: C.text }}>{JOIN.convPct}% of phone callers become customers</strong> (a floor — phone-keyed orders often lack a stored number), worth {fmtM(JOIN.callerRevenue)}. Of those who buy after calling, 65% order within a week of the first call.</> },
              { n: "02", t: "Readiness Beats Demographics", b: <>Blind re-clustering says the phone base organises by <strong style={{ color: C.text }}>buying stage and urgency</strong>, not segment or location. The Ready Buyer (20% of callers) converts at 48% — v1 never saw this group.</> },
              { n: "03", t: "One Call in Seven Is an Existing Customer", b: <>14% of callers are post-purchase — support, delivery chasing, add-ons. They still convert at 42% on add-on orders. The phone line is a <strong style={{ color: C.text }}>service + cross-sell channel</strong>, not just pre-sale.</> },
              { n: "04", t: "Margin Is Better Than v1 Reported", b: <>v1's 36.1% margin divided GP by GST-inclusive revenue. On the correct ex-GST basis Revel runs at <strong style={{ color: C.text }}>{META.marginPct}%</strong> — essentially on the FY27 44% target already.</> },
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
        <SectionHeader id="join" eyebrow="Section B" title="The Call → Revenue Join" subtitle="What v1 couldn't do: each caller's phone number matched against NetSuite customer records, then their actual orders. Every number below is observed, not modelled." />
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
              <BarChart data={JOIN.timing} margin={{ left: 10, right: 30, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="bucket" tick={{ fill: C.muted, fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={50} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis tick={{ fill: C.faint, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(37,179,75,0.06)" }} />
                <Bar dataKey="count" name="Purchasing callers" radius={[4, 4, 0, 0]}>
                  {JOIN.timing.map((t: any, i: number) => <Cell key={i} fill={t.bucket === "Same week as call" ? GREEN : GREY_BAR} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p style={{ color: C.muted, fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
              The median purchasing caller orders <strong style={{ color: C.text }}>the same day they call</strong>. 64 callers (15%) already owned Revel equipment more than a week before calling — the phone line's service tail.
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
              <BarChart data={FUNC.filter((f: any) => f.name !== "Other")} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" tick={{ fill: C.faint, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(37,179,75,0.06)" }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Callers">
                  {FUNC.filter((f: any) => f.name !== "Other").map((_: any, i: number) => <Cell key={i} fill={i === 0 ? GREEN : GREY_BAR} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <ChartTitle>Emotional Job Themes</ChartTitle>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={EMO.filter((e: any) => e.name !== "Other")} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ pct }: any) => `${pct}%`} labelLine={false}>
                  {EMO.filter((e: any) => e.name !== "Other").map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          <Card>
            <ChartTitle>Primary Conversion Barriers</ChartTitle>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={BARRIERS.filter((b: any) => b.count > 20)} margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={45} axisLine={{ stroke: C.border }} tickLine={false} />
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
              66% of callers with a timeline want to buy <strong style={{ color: C.text }}>this month or sooner</strong> — consistent with the join data showing same-week purchases dominate.
            </p>
          </Card>
        </div>

        {/* ═══ D: ARCHETYPES v2 ═══ */}
        <SectionHeader id="archetypes" eyebrow="Section D" title="Archetype Explorer — v2" subtitle="Six clusters found by k-means on 12 need/intent fields across 1,262 callers — with purchase behaviour deliberately held out of the clustering, then measured per cluster afterwards. Conversion and spend below are real NetSuite outcomes." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 24 }}>
          {ARCHETYPES.map((a: any) => {
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
                  {arch.id === 0 && "Decision-stage with a quote in hand — buying within days, price and delivery are the last hurdles"}
                  {arch.id === 1 && "Early research, no timeline — today's browser, occasionally next quarter's buyer"}
                  {arch.id === 2 && "Already a Revel customer — support, delivery chasing, and add-on purchases"}
                  {arch.id === 3 && "Hot + cold as a project: ice baths, chillers and sauna combos, incl. most commercial buyers"}
                  {arch.id === 4 && "Will buy, on their own schedule — patient, considered, and the biggest baskets when they land"}
                  {arch.id === 5 && "The core buyer: health transformation at home, wants it this month"}
                </p>
              </div>
              <div style={{ display: "flex", gap: 28, textAlign: "right", flexWrap: "wrap" }}>
                {[[`${arch.pct_of_callers}%`, `of callers (${arch.n})`], [`${arch.conversion_pct}%`, "bought (observed)"], [fmtK(arch.avg_spend), "avg spend"], [fmtK(arch.total_revenue), "traced revenue"]].map(([v, l], i) => (
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28, marginBottom: 8 }}>
              <div>
                <div style={{ ...EYEBROW, color: C.greenBody, marginBottom: 12 }}>Who & Why</div>
                {[["Functional jobs", arch.functional], ["Emotional jobs", arch.emotional], ["Segments", arch.segments]].map(([label, items]: any, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: C.faint, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4 }}>{label}</div>
                    {items.filter((x: any) => !["unspecified", "Uncategorized"].includes(x.name)).slice(0, 3).map((x: any, j: number) => (
                      <Chip key={j} tone={j === 0 ? "green" : "plain"}>{x.name} {x.pct}%</Chip>
                    ))}
                  </div>
                ))}
                <div style={{ fontSize: 10, color: C.faint, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4 }}>Top barriers</div>
                {arch.barriers.filter((x: any) => x.name !== "unspecified").slice(0, 3).map((x: any, j: number) => (
                  <Chip key={j} tone="danger">{x.name} {x.pct}%</Chip>
                ))}
              </div>
              <div>
                <div style={{ ...EYEBROW, color: C.greenBody, marginBottom: 12 }}>Sensitivity Radar (Data-Derived)</div>
                <ResponsiveContainer width="100%" height={210}>
                  <RadarChart data={radarData} outerRadius={75}>
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
                <p style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
                  {arch.median_days_to_order !== null && arch.median_days_to_order <= 0 && "Median buyer orders on or before the day of the logged call."}
                  {arch.median_days_to_order !== null && arch.median_days_to_order > 0 && `Median buyer orders ${arch.median_days_to_order} days after first call.`}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <Card style={{ marginBottom: 32 }}>
          <ChartTitle>Archetype Economics at a Glance</ChartTitle>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={ARCHETYPES.map((a: any) => ({ name: a.name.replace("The ", ""), callers: a.n, conv: a.conversion_pct, rev: a.total_revenue }))} margin={{ left: 10, right: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 10 }} interval={0} angle={-10} textAnchor="end" height={45} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis yAxisId="l" tick={{ fill: C.faint, fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} axisLine={false} tickLine={false} />
              <YAxis yAxisId="r" orientation="right" tick={{ fill: C.faint, fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} domain={[0, 60]} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(37,179,75,0.06)" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="l" dataKey="rev" name="Traced revenue" radius={[4, 4, 0, 0]}>
                {ARCHETYPES.map((a: any) => <Cell key={a.id} fill={ARCH_COLORS[a.id]} />)}
              </Bar>
              <Line yAxisId="r" dataKey="conv" name="Conversion %" stroke={isDark ? "#FFFFFF" : "#000000"} strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* ═══ E: V1 vs V2 ═══ */}
        <SectionHeader id="v1v2" eyebrow="Section E" title="Did We Get It Right the First Time?" subtitle="Each caller was also assigned to their v1 archetype using v1's own rules (segment × location × theme × barrier). The matrix shows where each v1 archetype's callers actually landed under blind re-clustering." />
        <Card style={{ marginBottom: 24, overflowX: "auto" }}>
          <ChartTitle>v1 Archetype → v2 Cluster Flow (Callers)</ChartTitle>
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

        {/* ═══ F: REVENUE & PRODUCT ═══ */}
        <SectionHeader id="revenue" eyebrow="Section F" title="Revenue & Product" subtitle={`Trailing 12 months to 8 Jul 2026: ${fmtM(META.revenueIncGst)} inc GST across ${fmt(META.orders)} orders (closed/cancelled orders excluded).`} />
        <Card style={{ marginBottom: 24 }}>
          <ChartTitle>Monthly Revenue & Gross Profit</ChartTitle>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={MONTHLY} margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="mth" tick={{ fill: C.muted, fontSize: 10 }} axisLine={{ stroke: C.border }} tickLine={false} />
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
                    <td style={{ padding: "8px 4px", textAlign: "right", fontWeight: 700, color: i === 0 ? C.greenBody : C.text }}>${fmt(p.net_rev | 0)}</td>
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

        {/* ═══ G: ACTIONS ═══ */}
        <SectionHeader id="strategy" eyebrow="Section G" title="Strategic Actions" subtitle="What changes now that we can see conversion and revenue per archetype." />
        <div style={{ display: "grid", gap: 24 }}>
          {[
            {
              title: "Sales", items: [
                { t: "1. Treat Ready Buyers as a same-day SLA", b: "20% of callers are decision-stage and convert at 48%, typically ordering within days. Every hour of quote delay is measurable revenue risk. Flag decision-stage callers in the CRM and mandate same-day quote turnaround.", d: "248 callers · 48% conv" },
                { t: "2. Give Owners their own lane", b: "14% of calls are existing customers (support, delivery, add-ons) sitting in the same queue as new buyers. Route them separately: faster service, and a scripted add-on conversation — they still spend at 42% conversion (rocks, backrests, chillers, second units).", d: "179 callers · $742K traced" },
                { t: "3. Sell contrast as a project, commercial included", b: "Contrast Recovery Builders (16%) buy chiller+ice+sauna combos; most commercial buyers are this archetype with a business card. One consultative motion with bundle pricing and commercial warranty options covers both.", d: "198 callers · top combo CHL+ICE" },
                { t: "4. Nurture Patient Planners, drop Window Shoppers", b: "Planners buy at 20% with the biggest baskets — but on their timeline (median ~4-90 days). Seasonal/finance-led remarketing fits. Window Shoppers convert at 6%: capture the email, send the guide, and spend sales time elsewhere.", d: "$9.9K avg vs 6% conv" },
              ]
            },
            {
              title: "Marketing", items: [
                { t: "1. Health outcomes remain the master message", b: "Health/Detox + Sleep + Recovery = 48% of stated functional jobs, and the Health-Seeker archetype alone is 30% of callers and $1.1M traced revenue. Lead with transformation, not spectrums and panels.", d: "674 callers health-led" },
                { t: "2. Attack the confidence barrier, not just the electrical one", b: "Confidence ('which one is right for me?') is now the #2 barrier (16%), ahead of electrical (16%) and space (12%). Comparison guides, quiz-style selectors and the AI designer pattern directly serve it.", d: "228 confidence-blocked callers" },
                { t: "3. Keep the electrical pre-qualification push", b: "Electrical friction hits the Health-Seeker hardest (29% of their barriers) and hasn't moved since v1. PDP specs, a 'Revel Ready' electrician referral, and pre-purchase checklists remain high-ROI.", d: "220 callers blocked" },
                { t: "4. Protect the two peaks", b: "Black Friday and EOFY each do ~$2.3M — 30% of the year in two months. Campaign planning, stock depth and sales staffing should be built around defending these windows.", d: "Nov + Jun = 30% of revenue" },
              ]
            },
            {
              title: "Product & Digital", items: [
                { t: "1. Bundle builder for the recovery station", b: "The most common multi-line purchase is chiller + ice bath, and sauna+ice combos follow. A 'build your recovery station' configurator with bundle pricing converts the Contrast Builder without a phone call.", d: "CHL+ICE = #1 combo" },
                { t: "2. Selector tools to close the confidence gap", b: "Traditional vs infrared indecision shows up in 62 callers' product interest and in the confidence barrier. A guided chooser (space, power, goals → recommendation) removes the #2 conversion blocker.", d: "confidence = #2 barrier" },
                { t: "3. Phone-number hygiene at order entry", b: "One in three callers can't be traced to their order because manually-keyed sales often skip the phone field. Make it mandatory in NetSuite order entry — it's the difference between guessing and knowing marketing ROI on a $4M+ channel.", d: "match rate 31.8% (floor)" },
                { t: "4. Watch hybrids", b: "Hybrid saunas carry the best item margin (48%) on $703K revenue and growing interest. A hero hybrid PDP and comparison content could lift the highest-margin line.", d: "48% margin" },
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

        {/* ═══ H: METHODOLOGY ═══ */}
        <div id="method" style={{ marginTop: 64, padding: 28, background: "var(--revel-forest)", borderRadius: 16, color: "#fff" }}>
          <h3 style={{ ...UPPER, fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#fff" }}>Methodology & Data Notes</h3>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.8 }}>
            <p><strong style={{ color: "#fff" }}>Call data:</strong> 2,043 AI-analysed pre-sale calls (Should_Analyze tab), 18 Nov 2025 – 8 Jul 2026, deduplicated to 1,392 unique callers by phone. v1 used 1,161 calls to 5 Apr 2026.</p>
            <p><strong style={{ color: "#fff" }}>Sales data:</strong> NetSuite sales orders, Revel departments, trailing 12 months to 8 Jul 2026. Closed/cancelled orders excluded (957 orders, $3.7M). Topline revenue is GST-inclusive order totals; category revenue and margins are ex-GST item lines; GP is NetSuite estimated gross profit. v1's 36.1% margin was GP ÷ inc-GST revenue; the ex-GST equivalent is {META.marginPct}%.</p>
            <p><strong style={{ color: "#fff" }}>Caller→order join:</strong> phone numbers normalised to last 9 digits and matched against customer phone/mobile fields. 443/1,392 matched. This undercounts: some purchasers' customer records hold no phone (verified on recorded calls), so caller conversion and traced revenue are floors.</p>
            <p><strong style={{ color: "#fff" }}>Archetypes v2:</strong> k-means (k=6, one-hot, missingness down-weighted) on 12 need/intent fields over 1,262 callers with sufficient data; 130 sparse callers excluded. Purchase outcomes were held out of clustering and measured afterwards. k selected by silhouette + interpretability; cluster separation is modest (silhouette ≈ 0.10), normal for categorical survey-style data — treat archetypes as strong tendencies, not hard walls.</p>
            <p><strong style={{ color: "#fff" }}>v1 comparison:</strong> v1 archetypes were approximated from their published definitions (segment × location × theme × barrier rules) and applied to the same callers, then cross-tabulated against v2 clusters.</p>
            <p><strong style={{ color: "#fff" }}>Privacy:</strong> aggregate data only; no names or contact details are included in this dashboard. Quotes are verbatim but anonymised.</p>
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
