import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, CartesianGrid, ComposedChart, Line } from "recharts";
import { Sun, Moon } from "lucide-react";
import { META, MONTHLY, STATES, CATEGORIES, TOP_PRODUCTS, FUNC, EMO, BARRIERS, LOC, STAGE, TIMELINE, OUTCOME, SEGMENT, COMPETITORS, JOIN, ARCHETYPES, CROSSTAB } from "./data";

// ═══════════════════════════════════════════════════════════
// REVEL CUSTOMER INTELLIGENCE & JTBD DEEP DIVE — v2 (RERUN)
// Data: 2,043 analysed pre-sale calls × NetSuite sales orders
// joined caller-by-caller on normalised phone number.
// v1 (Apr 2026) was a hard-coded snapshot; every figure here is
// derived from source data. Blind archetype re-derivation included.
// ═══════════════════════════════════════════════════════════

const COLORS = {
  accent: "#c27d3e", accentAlt: "#2d5a4a", gold: "#d4a056", teal: "#3a8a7a",
  purple: "#7c5cbf", ice: "#5ba4cf", green: "#16c79a", red: "#ec6b7a",
  bg: "var(--color-bg)", card: "var(--color-card)", text: "var(--color-text)",
  muted: "var(--color-muted)", border: "var(--color-border)",
  navBg: "var(--color-nav-bg)", tooltipBg: "var(--color-tooltip-bg)",
};
const CHART_COLORS = ["#c27d3e", "#5ba4cf", "#3a8a7a", "#7c5cbf", "#d4a056", "#ec6b7a", "#4ecdc4", "#f5a623", "#8b5cf6", "#06b6d4"];
const ARCH_COLORS: Record<number, string> = { 0: "#16c79a", 1: "#94a3b8", 2: "#5ba4cf", 3: "#7c5cbf", 4: "#d4a056", 5: "#c27d3e" };

const fmtM = (v: number) => `$${(v / 1000000).toFixed(1)}M`;
const fmtK = (v: number) => v >= 1000000 ? fmtM(v) : `$${(v / 1000).toFixed(0)}K`;
const fmt = (v: number) => v.toLocaleString();

const CATMAP: Record<string, string> = { INF: "Infrared", TRD: "Traditional", BAR: "Barrel", HYB: "Hybrid", ICE: "Ice Bath", CHL: "Chiller", HTC: "Heater", ACC: "Accessories", "n/a": "Other" };
const prettyCats = (k: string) => k.split("+").map(c => CATMAP[c] || c).join(" + ");

// ── UI atoms ────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
    style={{ background: COLORS.card, borderRadius: 12, padding: "20px 24px", borderLeft: `4px solid ${accent || COLORS.accent}` }}>
    <div style={{ color: COLORS.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>{label}</div>
    <div style={{ color: COLORS.text, fontSize: 28, fontWeight: 700 }}>{value}</div>
    {sub && <div style={{ color: COLORS.muted, fontSize: 13, marginTop: 4 }}>{sub}</div>}
  </motion.div>
);

const SectionHeader = ({ title, subtitle, id }: { title: string; subtitle?: string; id: string }) => (
  <div id={id} style={{ marginBottom: 24, paddingTop: 48 }}>
    <h2 style={{ color: COLORS.text, fontSize: 22, fontWeight: 700, marginBottom: 6, borderBottom: `2px solid ${COLORS.accent}`, paddingBottom: 8, display: "inline-block" }}>{title}</h2>
    {subtitle && <p style={{ color: COLORS.muted, fontSize: 14, marginTop: 8, maxWidth: 760 }}>{subtitle}</p>}
  </div>
);

const Tag = ({ children, color }: { children: React.ReactNode; color?: string }) => (
  <span style={{ display: "inline-block", background: color || COLORS.accentAlt, color: "#fff", padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, marginRight: 6, marginBottom: 4 }}>{children}</span>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: COLORS.tooltipBg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: COLORS.text }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || COLORS.muted }}>{p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}</div>
      ))}
    </div>
  );
};

const Card = ({ children, style }: any) => (
  <div style={{ background: COLORS.card, borderRadius: 12, padding: 24, ...style }}>{children}</div>
);

const NAV_ITEMS = [
  { id: "exec", label: "Executive Summary" },
  { id: "join", label: "Call → Revenue" },
  { id: "macro", label: "Market Drivers" },
  { id: "archetypes", label: "Archetypes v2" },
  { id: "v1v2", label: "v1 vs v2" },
  { id: "revenue", label: "Revenue & Product" },
  { id: "strategy", label: "Actions" },
  { id: "method", label: "Methodology" },
];

const V1_ORDER = ["Sanctuary Seeker", "Home Renovator", "Performance Biohacker", "Commercial Operator", "Cautious Researcher", "Unclassified"];
const V2_ORDER = ["The Ready Buyer", "The Health-Seeker", "The Contrast Recovery Builder", "The Owner & Add-On Caller", "The Patient Planner", "The Window Shopper"];

const VERDICTS = [
  { v1: "Sanctuary Seeker", verdict: "VALIDATED (at its core)", color: "#16c79a", note: "49% of Sanctuary Seekers land in the Health-Seeker cluster — the health-first home buyer is real and is still the biggest group. But 23% of them were actually decision-stage Ready Buyers, a far more valuable group v1 lumped in with everyone else." },
  { v1: "Performance Biohacker", verdict: "PARTIALLY REAL", color: "#d4a056", note: "The contrast-therapy job exists (29% land in Contrast Recovery Builder), but the 'biohacker' framing over-personified it. Another 26% were simply Ready Buyers who happened to want ice baths." },
  { v1: "Commercial Operator", verdict: "MERGED", color: "#d4a056", note: "55% of commercial callers cluster with the Contrast Recovery Builder. Commercial is a context (who pays), not a distinct job-to-be-done — they want the same recovery outcome, with commercial-grade specs." },
  { v1: "Cautious Researcher", verdict: "SPLIT IN TWO", color: "#ec6b7a", note: "v1 conflated two opposite groups: Window Shoppers (31%, ~6% conversion, browsing with no timeline) and Patient Planners (30%, 20% conversion at the highest spend of any archetype). One deserves a nurture track; the other barely deserves a follow-up." },
  { v1: "Home Renovator", verdict: "DISSOLVED", color: "#ec6b7a", note: "Renovators scatter across every v2 cluster (34% Health-Seeker, 30% Patient Planner, 15% Ready Buyer). Renovation is a trigger event, not an archetype — it tells you when they buy, not who they are or what they need." },
  { v1: "— (not in v1)", verdict: "MISSED: Ready Buyer", color: "#5ba4cf", note: "The single most valuable group — 20% of callers, 48% conversion, buying within days — wasn't an archetype in v1 at all. It was invisible because v1 clustered on segment × location instead of readiness." },
  { v1: "— (not in v1)", verdict: "MISSED: Owner & Add-On Caller", color: "#5ba4cf", note: "14% of inbound calls are existing customers — support, delivery chasing, and add-on purchases. v1 treated the phone queue as 100% pre-sale. It isn't, and these calls convert to add-on revenue at 42%." },
];

export default function App() {
  const [activeArchetype, setActiveArchetype] = useState(0);
  const [activeSection, setActiveSection] = useState("exec");
  const [isDark, setIsDark] = useState(true);
  const arch = ARCHETYPES.find((a: any) => a.id === activeArchetype)!;

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const radarData = Object.entries(arch.radar).map(([axis, val]) => ({ axis, val }));
  const boughtData = Object.entries(arch.bought).map(([k, v]) => ({ name: prettyCats(k), count: v }));

  return (
    <div className={isDark ? "dark" : ""} style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "var(--font-sans)", transition: "background-color 0.3s, color 0.3s" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: COLORS.navBg, backdropFilter: "blur(12px)", borderBottom: `1px solid ${COLORS.border}`, padding: "0 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 4, overflowX: "auto" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: COLORS.accent, marginRight: 16, whiteSpace: "nowrap", padding: "12px 0", fontFamily: "var(--font-display)" }}>REVEL JTBD v2</div>
          {NAV_ITEMS.map(n => (
            <button key={n.id} onClick={() => scrollTo(n.id)}
              style={{ background: activeSection === n.id ? COLORS.accent : "transparent", color: activeSection === n.id ? "#fff" : COLORS.muted, border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
              {n.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => setIsDark(!isDark)} title="Toggle Light/Dark"
            style={{ background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer", padding: 8, display: "flex", borderRadius: "50%" }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* ═══ TITLE ═══ */}
        <div style={{ paddingTop: 48, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}`, marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, fontFamily: "var(--font-display)" }}>Revel Customer Intelligence & JTBD Deep Dive — v2</h1>
          <p style={{ color: COLORS.muted, fontSize: 15, maxWidth: 780 }}>
            Rerun of the April 2026 analysis with 76% more call data and a real caller-level join to NetSuite:
            {" "}{fmt(META.calls)} analysed pre-sale calls matched by phone number to sales orders, plus a blind re-derivation
            of the customer archetypes to test how well v1 held up.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <Tag color={COLORS.accent}>{fmt(META.calls)} Calls ({META.dateRange})</Tag>
            <Tag color={COLORS.ice}>{fmtM(META.revenueIncGst)} Revenue (trailing 12mo)</Tag>
            <Tag color={COLORS.accentAlt}>{fmt(META.orders)} Orders</Tag>
            <Tag color={COLORS.green}>{fmtM(JOIN.callerRevenue)} traced to callers</Tag>
            <Tag color="#7c5cbf">Blind k-means re-clustering</Tag>
          </div>
        </div>

        {/* ═══ A: EXEC SUMMARY ═══ */}
        <SectionHeader id="exec" title="A. Executive Summary" subtitle="Call intelligence and transactional data, now joined at the individual caller level." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
          <StatCard label="Pre-Sale Calls Analysed" value={fmt(META.calls)} sub={`${fmt(META.uniqueCallers)} unique callers · ${META.dateRange}`} accent={COLORS.accent} />
          <StatCard label="Revenue (trailing 12mo)" value={fmtM(META.revenueIncGst)} sub={`${fmt(META.orders)} orders · ${fmt(META.customers)} customers · inc GST`} accent={COLORS.gold} />
          <StatCard label="Gross Margin" value={`${META.marginPct}%`} sub={`${fmtM(META.gp)} GP on ${fmtM(META.netRevenue)} ex-GST revenue`} accent={COLORS.teal} />
          <StatCard label="Caller Conversion (floor)" value={`${JOIN.convPct}%`} sub={`${JOIN.purchasers} of ${fmt(JOIN.uniqueCallers)} callers found in NetSuite orders`} accent={COLORS.green} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          <StatCard label="Revenue Traced to Callers" value={fmtM(JOIN.callerRevenue)} sub={`${fmtK(JOIN.callerGP)} GP · median ${fmtK(JOIN.medianSpend)} per purchasing caller`} accent={COLORS.ice} />
          <StatCard label="Dominant Functional Job" value="Health / Detox" sub={`${FUNC[0].count} callers (${FUNC[0].pct}%)`} accent={COLORS.accent} />
          <StatCard label="Dominant Barrier" value="Financial" sub={`${BARRIERS[0].count} callers (${BARRIERS[0].pct}%) · confidence + electrical close behind`} accent="#c27d3e" />
          <StatCard label="Repeat Customers" value={`${META.repeatPct}%`} sub={`${fmt(META.repeatCustomers)} customers · ${META.repeatRevPct}% of revenue`} accent={COLORS.purple} />
        </div>

        <Card style={{ marginBottom: 32, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>The Strategic Headlines</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            <div>
              <div style={{ color: COLORS.green, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>1. Callers Are Worth $4M+, and They Buy Fast</div>
              <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.6 }}>
                At least <strong style={{ color: COLORS.text }}>{JOIN.convPct}% of phone callers become customers</strong> (a floor — phone-keyed orders often lack a stored number), worth {fmtM(JOIN.callerRevenue)}. Of those who buy after calling, 65% order within a week of the first call.
              </p>
            </div>
            <div>
              <div style={{ color: COLORS.accent, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>2. Readiness Beats Demographics</div>
              <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.6 }}>
                Blind re-clustering says the phone base organises by <strong style={{ color: COLORS.text }}>buying stage and urgency</strong>, not segment or location. The Ready Buyer (20% of callers) converts at 48% — v1 never saw this group.
              </p>
            </div>
            <div>
              <div style={{ color: COLORS.ice, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>3. One Call in Seven Is an Existing Customer</div>
              <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.6 }}>
                14% of callers are post-purchase — support, delivery chasing, add-ons. They still convert at 42% on add-on orders. The phone line is a <strong style={{ color: COLORS.text }}>service + cross-sell channel</strong>, not just pre-sale.
              </p>
            </div>
            <div>
              <div style={{ color: COLORS.purple, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>4. Margin Is Better Than v1 Reported</div>
              <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.6 }}>
                v1's 36.1% margin divided GP by GST-inclusive revenue. On the correct ex-GST basis Revel runs at <strong style={{ color: COLORS.text }}>{META.marginPct}%</strong> — essentially on the FY27 44% target already.
              </p>
            </div>
          </div>
        </Card>

        {/* ═══ B: CALL → REVENUE JOIN ═══ */}
        <SectionHeader id="join" title="B. The Call → Revenue Join" subtitle="What v1 couldn't do: each caller's phone number matched against NetSuite customer records, then their actual orders. Every number below is observed, not modelled." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          <StatCard label="Unique Callers" value={fmt(JOIN.uniqueCallers)} sub={`from ${fmt(JOIN.calls)} analysed calls`} accent={COLORS.accent} />
          <StatCard label="Matched to a Customer" value={fmt(JOIN.matched)} sub={`${JOIN.matchPct}% by normalised phone`} accent={COLORS.ice} />
          <StatCard label="Purchased" value={fmt(JOIN.purchasers)} sub={`${JOIN.convPct}% of all callers — a floor, not a ceiling`} accent={COLORS.green} />
          <StatCard label="Avg Spend per Buyer" value={fmtK(JOIN.avgSpend)} sub={`median ${fmtK(JOIN.medianSpend)}`} accent={COLORS.gold} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, marginBottom: 32 }}>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: COLORS.green }}>When Do Callers Buy? (first call → first order)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={JOIN.timing} margin={{ left: 10, right: 30, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="bucket" tick={{ fill: COLORS.text, fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={50} />
                <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Purchasing callers" radius={[4, 4, 0, 0]}>
                  {JOIN.timing.map((_: any, i: number) => <Cell key={i} fill={i === 0 ? "#94a3b8" : CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p style={{ color: COLORS.muted, fontSize: 12, marginTop: 8 }}>
              The median purchasing caller orders <strong style={{ color: COLORS.text }}>the same day they call</strong>. 64 callers (15%) already owned Revel equipment more than a week before calling — the phone line's service tail.
            </p>
          </Card>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: COLORS.ice }}>Why 31.8% Is a Floor</h3>
            <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.7 }}>
              <p style={{ marginBottom: 10 }}>The match requires the caller's number to be stored on their NetSuite customer record. Web orders sync phones reliably; <strong style={{ color: COLORS.text }}>manually-keyed phone sales often don't</strong> — we verified purchasers on recorded calls whose customer records hold no phone at all.</p>
              <p style={{ marginBottom: 10 }}>~3% of Revel order customers have no phone on record, and others transact under a partner's number or a different line.</p>
              <p>So treat {JOIN.convPct}% as the <strong style={{ color: COLORS.text }}>observable minimum</strong>. True caller conversion is meaningfully higher — and either way, callers represent at least {Math.round(JOIN.callerRevenue / META.revenueIncGst * 100)}% of all Revel revenue.</p>
            </div>
          </Card>
        </div>

        {/* ═══ C: MARKET DRIVERS ═══ */}
        <SectionHeader id="macro" title="C. Macro Market Drivers" subtitle={`Jobs-to-be-done and friction across ${fmt(META.uniqueCallers)} unique callers (counting each person once, not each call).`} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: COLORS.accent }}>Functional Job Themes</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={FUNC.filter((f: any) => f.name !== "Other")} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" tick={{ fill: COLORS.muted, fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fill: COLORS.text, fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill={COLORS.accent} radius={[0, 4, 4, 0]} name="Callers" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: COLORS.gold }}>Emotional Job Themes</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={EMO.filter((e: any) => e.name !== "Other")} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ pct }: any) => `${pct}%`} labelLine={false}>
                  {EMO.filter((e: any) => e.name !== "Other").map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: COLORS.accent }}>Primary Conversion Barriers</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={BARRIERS.filter((b: any) => b.count > 20)} margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="name" tick={{ fill: COLORS.text, fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={45} />
                <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Callers">
                  {BARRIERS.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p style={{ color: COLORS.muted, fontSize: 12, marginTop: 8 }}>
              v1's top-3 (financial, electrical, space) still show, but with more data <strong style={{ color: COLORS.text }}>confidence</strong> ("is this the right one for me?") emerges as the #2 barrier — a sales-enablement problem, not a product one.
            </p>
          </Card>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: COLORS.teal }}>Buying Stage & Timeline</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Stage</div>
                {STAGE.map((s: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13 }}>
                    <span>{s.name}</span><span style={{ color: COLORS.teal, fontWeight: 600 }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Timeline</div>
                {TIMELINE.map((s: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13 }}>
                    <span>{s.name}</span><span style={{ color: COLORS.gold, fontWeight: 600 }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ color: COLORS.muted, fontSize: 12, marginTop: 14 }}>
              66% of callers with a timeline want to buy <strong style={{ color: COLORS.text }}>this month or sooner</strong> — consistent with the join data showing same-week purchases dominate.
            </p>
          </Card>
        </div>

        {/* ═══ D: ARCHETYPES v2 ═══ */}
        <SectionHeader id="archetypes" title="D. Archetype Explorer — v2 (Blind Re-Derivation)" subtitle="Six clusters found by k-means on 12 need/intent fields across 1,262 callers — with purchase behaviour deliberately held out of the clustering, then measured per cluster afterwards. Conversion and spend below are real NetSuite outcomes." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
          {ARCHETYPES.map((a: any) => (
            <button key={a.id} onClick={() => setActiveArchetype(a.id)}
              style={{ background: activeArchetype === a.id ? ARCH_COLORS[a.id] : COLORS.card, border: `2px solid ${activeArchetype === a.id ? ARCH_COLORS[a.id] : COLORS.border}`, borderRadius: 12, padding: 14, cursor: "pointer", textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: activeArchetype === a.id ? "#fff" : COLORS.text, marginBottom: 4 }}>{a.name.replace("The ", "")}</div>
              <div style={{ fontSize: 11, color: activeArchetype === a.id ? "rgba(255,255,255,0.85)" : COLORS.muted }}>{a.pct_of_callers}% · conv {a.conversion_pct}%</div>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={arch.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25 }}
            style={{ background: COLORS.card, borderRadius: 16, padding: 32, marginBottom: 32, border: `1px solid ${COLORS.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{arch.name}</h3>
                <p style={{ color: COLORS.muted, fontSize: 14, fontStyle: "italic" }}>
                  {arch.id === 0 && "Decision-stage with a quote in hand — buying within days, price and delivery are the last hurdles"}
                  {arch.id === 1 && "Early research, no timeline — today's browser, occasionally next quarter's buyer"}
                  {arch.id === 2 && "Already a Revel customer — support, delivery chasing, and add-on purchases"}
                  {arch.id === 3 && "Hot + cold as a project: ice baths, chillers and sauna combos, incl. most commercial buyers"}
                  {arch.id === 4 && "Will buy, on their own schedule — patient, considered, and the biggest baskets when they land"}
                  {arch.id === 5 && "The core buyer: health transformation at home, wants it this month"}
                </p>
              </div>
              <div style={{ display: "flex", gap: 24, textAlign: "right" }}>
                <div><div style={{ fontSize: 28, fontWeight: 800, color: ARCH_COLORS[arch.id] }}>{arch.pct_of_callers}%</div><div style={{ color: COLORS.muted, fontSize: 11 }}>of callers ({arch.n})</div></div>
                <div><div style={{ fontSize: 28, fontWeight: 800, color: COLORS.green }}>{arch.conversion_pct}%</div><div style={{ color: COLORS.muted, fontSize: 11 }}>bought (observed)</div></div>
                <div><div style={{ fontSize: 28, fontWeight: 800, color: COLORS.gold }}>{fmtK(arch.avg_spend)}</div><div style={{ color: COLORS.muted, fontSize: 11 }}>avg spend</div></div>
                <div><div style={{ fontSize: 28, fontWeight: 800, color: COLORS.ice }}>{fmtK(arch.total_revenue)}</div><div style={{ color: COLORS.muted, fontSize: 11 }}>traced revenue</div></div>
              </div>
            </div>

            <div style={{ background: "rgba(124,92,191,0.1)", borderRadius: 10, padding: 14, borderLeft: `3px solid ${COLORS.purple}`, marginBottom: 20 }}>
              <p style={{ fontSize: 14, fontStyle: "italic", lineHeight: 1.6 }}>"{arch.quote}"</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 8 }}>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: COLORS.accent }}>WHO & WHY</h4>
                {[["Functional jobs", arch.functional], ["Emotional jobs", arch.emotional], ["Segments", arch.segments]].map(([label, items]: any, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                    {items.filter((x: any) => !["unspecified", "Uncategorized"].includes(x.name)).slice(0, 3).map((x: any, j: number) => (
                      <Tag key={j} color={j === 0 ? COLORS.accent : COLORS.accentAlt}>{x.name} {x.pct}%</Tag>
                    ))}
                  </div>
                ))}
                <div style={{ fontSize: 10, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Top barriers</div>
                {arch.barriers.filter((x: any) => x.name !== "unspecified").slice(0, 3).map((x: any, j: number) => (
                  <Tag key={j} color={COLORS.red}>{x.name} {x.pct}%</Tag>
                ))}
              </div>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: COLORS.gold }}>SENSITIVITY RADAR (data-derived)</h4>
                <ResponsiveContainer width="100%" height={210}>
                  <RadarChart data={radarData} outerRadius={75}>
                    <PolarGrid stroke={COLORS.border} />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: COLORS.muted, fontSize: 10 }} />
                    <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                    <Radar dataKey="val" stroke={ARCH_COLORS[arch.id]} fill={ARCH_COLORS[arch.id]} fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: COLORS.teal }}>WHAT THEY ACTUALLY BOUGHT</h4>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={boughtData} layout="vertical" margin={{ left: 10, right: 24 }}>
                    <XAxis type="number" tick={{ fill: COLORS.muted, fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ fill: COLORS.text, fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill={COLORS.teal} radius={[0, 4, 4, 0]} name="Buyers" />
                  </BarChart>
                </ResponsiveContainer>
                <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 6 }}>
                  {arch.median_days_to_order !== null && arch.median_days_to_order <= 0 && "Median buyer orders on or before the day of the logged call."}
                  {arch.median_days_to_order !== null && arch.median_days_to_order > 0 && `Median buyer orders ${arch.median_days_to_order} days after first call.`}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* archetype comparison strip */}
        <Card style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Archetype Economics at a Glance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={ARCHETYPES.map((a: any) => ({ name: a.name.replace("The ", ""), callers: a.n, conv: a.conversion_pct, rev: a.total_revenue }))} margin={{ left: 10, right: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="name" tick={{ fill: COLORS.text, fontSize: 10 }} interval={0} angle={-10} textAnchor="end" height={45} />
              <YAxis yAxisId="l" tick={{ fill: COLORS.muted, fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
              <YAxis yAxisId="r" orientation="right" tick={{ fill: COLORS.green, fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} domain={[0, 60]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="l" dataKey="rev" name="Traced revenue" radius={[4, 4, 0, 0]}>
                {ARCHETYPES.map((a: any) => <Cell key={a.id} fill={ARCH_COLORS[a.id]} />)}
              </Bar>
              <Line yAxisId="r" dataKey="conv" name="Conversion %" stroke={COLORS.green} strokeWidth={2.5} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* ═══ E: V1 vs V2 ═══ */}
        <SectionHeader id="v1v2" title="E. Did We Get It Right the First Time?" subtitle="Each caller was also assigned to their v1 archetype using v1's own rules (segment × location × theme × barrier). The matrix shows where each v1 archetype's callers actually landed under blind re-clustering." />
        <Card style={{ marginBottom: 24, overflowX: "auto" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: COLORS.purple }}>v1 Archetype → v2 Cluster Flow (callers)</h3>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                <th style={{ textAlign: "left", padding: "8px 6px", color: COLORS.muted }}>v1 (Apr 2026) ↓</th>
                {V2_ORDER.map(c => <th key={c} style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted }}>{c.replace("The ", "")}</th>)}
                <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {V1_ORDER.map(r => {
                const row = V2_ORDER.map(c => (CROSSTAB as any)[c]?.[r] ?? 0);
                const tot = row.reduce((a: number, b: number) => a + b, 0);
                const mx = Math.max(...row);
                return (
                  <tr key={r} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: "8px 6px", fontWeight: 600 }}>{r}</td>
                    {row.map((v: number, i: number) => (
                      <td key={i} style={{ padding: "8px 6px", textAlign: "right", fontWeight: v === mx && v > 0 ? 800 : 400, color: v === mx && v > 0 ? COLORS.accent : v > 0 ? COLORS.text : COLORS.muted, background: v === mx && v > 0 ? "rgba(194,125,62,0.12)" : "transparent" }}>
                        {v > 0 ? `${v} (${Math.round(v / tot * 100)}%)` : "—"}
                      </td>
                    ))}
                    <td style={{ padding: "8px 6px", textAlign: "right", color: COLORS.muted }}>{tot}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 32 }}>
          {VERDICTS.map((v, i) => (
            <Card key={i} style={{ borderLeft: `4px solid ${v.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{v.v1}</span>
                <span style={{ fontWeight: 800, fontSize: 11, color: v.color, whiteSpace: "nowrap" }}>{v.verdict}</span>
              </div>
              <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>{v.note}</p>
            </Card>
          ))}
        </div>

        {/* ═══ F: REVENUE & PRODUCT ═══ */}
        <SectionHeader id="revenue" title="F. Revenue & Product" subtitle={`Trailing 12 months to 8 Jul 2026: ${fmtM(META.revenueIncGst)} inc GST across ${fmt(META.orders)} orders (closed/cancelled orders excluded).`} />
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: COLORS.gold }}>Monthly Revenue & Gross Profit</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={MONTHLY} margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="mth" tick={{ fill: COLORS.text, fontSize: 10 }} />
              <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="rev" name="Revenue (inc GST)" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
              <Line dataKey="gp" name="Gross profit" stroke={COLORS.teal} strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
          <p style={{ color: COLORS.muted, fontSize: 12, marginTop: 8 }}>
            Two engines drive the year: <strong style={{ color: COLORS.text }}>Black Friday (Nov)</strong> and <strong style={{ color: COLORS.text }}>EOFY (Jun)</strong>, each at ~$2.3M — 2.5× a normal month.
          </p>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: COLORS.accent }}>Revenue by Category (ex GST)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={CATEGORIES.filter((c: any) => c.rev > 100000)} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" tick={{ fill: COLORS.muted, fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} />
                <YAxis type="category" dataKey="cat" width={130} tick={{ fill: COLORS.text, fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rev" fill={COLORS.accent} radius={[0, 4, 4, 0]} name="Net revenue" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: COLORS.teal }}>Item Margin by Category</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={CATEGORIES.filter((c: any) => c.rev > 100000)} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" tick={{ fill: COLORS.muted, fontSize: 11 }} domain={[0, 60]} tickFormatter={(v: number) => `${v}%`} />
                <YAxis type="category" dataKey="cat" width={130} tick={{ fill: COLORS.text, fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="margin" fill={COLORS.teal} radius={[0, 4, 4, 0]} name="Item margin %" />
              </BarChart>
            </ResponsiveContainer>
            <p style={{ color: COLORS.muted, fontSize: 12, marginTop: 8 }}>
              Saunas cluster at 44-48% item margin. Ice baths at ~25% remain the volume/entry play; hybrids are the margin sweet spot at 48%.
            </p>
          </Card>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, marginBottom: 32 }}>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: COLORS.gold }}>Top 10 Products by Revenue</h3>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                  <th style={{ textAlign: "left", padding: "7px 4px", color: COLORS.muted, fontSize: 11 }}>Product</th>
                  <th style={{ textAlign: "right", padding: "7px 4px", color: COLORS.muted, fontSize: 11 }}>Units</th>
                  <th style={{ textAlign: "right", padding: "7px 4px", color: COLORS.muted, fontSize: 11 }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {TOP_PRODUCTS.slice(0, 10).map((p: any, i: number) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: "7px 4px" }}>{p.name}</td>
                    <td style={{ padding: "7px 4px", textAlign: "right", color: COLORS.teal }}>{p.units}</td>
                    <td style={{ padding: "7px 4px", textAlign: "right", color: COLORS.gold, fontWeight: 600 }}>${fmt(p.net_rev | 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <div style={{ display: "grid", gap: 24 }}>
            <Card>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: COLORS.ice }}>Revenue by State</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={STATES} margin={{ left: 10, right: 20 }}>
                  <XAxis dataKey="st" tick={{ fill: COLORS.text, fontSize: 11 }} />
                  <YAxis tick={{ fill: COLORS.muted, fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="rev" fill={COLORS.ice} radius={[4, 4, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
              <p style={{ color: COLORS.muted, fontSize: 11, marginTop: 6 }}>East coast = 66% of shipped revenue. A further $2.3M has no shipping state recorded.</p>
            </Card>
            <Card>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: COLORS.gold }}>Competitors Named on Calls</h3>
              {COMPETITORS.slice(0, 6).map((c: any, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12 }}>
                  <span>{c.name}</span><span style={{ color: COLORS.gold, fontWeight: 700 }}>{c.mentions}</span>
                </div>
              ))}
              <p style={{ color: COLORS.muted, fontSize: 11, marginTop: 6 }}>Alpine still leads share-of-voice, consistent with v1.</p>
            </Card>
          </div>
        </div>

        {/* ═══ G: ACTIONS ═══ */}
        <SectionHeader id="strategy" title="G. Strategic Actions" subtitle="What changes now that we can see conversion and revenue per archetype." />
        <div style={{ display: "grid", gap: 24 }}>
          {[
            {
              title: "Sales", color: COLORS.green, items: [
                { t: "1. Treat Ready Buyers as a same-day SLA", b: "20% of callers are decision-stage and convert at 48%, typically ordering within days. Every hour of quote delay is measurable revenue risk. Flag decision-stage callers in the CRM and mandate same-day quote turnaround.", d: "248 callers · 48% conv" },
                { t: "2. Give Owners their own lane", b: "14% of calls are existing customers (support, delivery, add-ons) sitting in the same queue as new buyers. Route them separately: faster service, and a scripted add-on conversation — they still spend at 42% conversion (rocks, backrests, chillers, second units).", d: "179 callers · $742K traced" },
                { t: "3. Sell contrast as a project, commercial included", b: "Contrast Recovery Builders (16%) buy chiller+ice+sauna combos; most commercial buyers are this archetype with a business card. One consultative motion with bundle pricing and commercial warranty options covers both.", d: "198 callers · top combo CHL+ICE" },
                { t: "4. Nurture Patient Planners, drop Window Shoppers", b: "Planners buy at 20% with the biggest baskets — but on their timeline (median ~4-90 days). Seasonal/finance-led remarketing fits. Window Shoppers convert at 6%: capture the email, send the guide, and spend sales time elsewhere.", d: "$9.9K avg vs 6% conv" },
              ]
            },
            {
              title: "Marketing", color: COLORS.accent, items: [
                { t: "1. Health outcomes remain the master message", b: "Health/Detox + Sleep + Recovery = 48% of stated functional jobs, and the Health-Seeker archetype alone is 30% of callers and $1.1M traced revenue. Lead with transformation, not spectrums and panels.", d: "674 callers health-led" },
                { t: "2. Attack the confidence barrier, not just the electrical one", b: "Confidence ('which one is right for me?') is now the #2 barrier (16%), ahead of electrical (16%) and space (12%). Comparison guides, quiz-style selectors and the AI designer pattern directly serve it.", d: "228 confidence-blocked callers" },
                { t: "3. Keep the electrical pre-qualification push", b: "Electrical friction hits the Health-Seeker hardest (29% of their barriers) and hasn't moved since v1. PDP specs, a 'Revel Ready' electrician referral, and pre-purchase checklists remain high-ROI.", d: "220 callers blocked" },
                { t: "4. Protect the two peaks", b: "Black Friday and EOFY each do ~$2.3M — 30% of the year in two months. Campaign planning, stock depth and sales staffing should be built around defending these windows.", d: "Nov + Jun = 30% of revenue" },
              ]
            },
            {
              title: "Product & Digital", color: COLORS.teal, items: [
                { t: "1. Bundle builder for the recovery station", b: "The most common multi-line purchase is chiller + ice bath, and sauna+ice combos follow. A 'build your recovery station' configurator with bundle pricing converts the Contrast Builder without a phone call.", d: "CHL+ICE = #1 combo" },
                { t: "2. Selector tools to close the confidence gap", b: "Traditional vs infrared indecision shows up in 62 callers' product interest and in the confidence barrier. A guided chooser (space, power, goals → recommendation) removes the #2 conversion blocker.", d: "confidence = #2 barrier" },
                { t: "3. Phone-number hygiene at order entry", b: "One in three callers can't be traced to their order because manually-keyed sales often skip the phone field. Make it mandatory in NetSuite order entry — it's the difference between guessing and knowing marketing ROI on a $4M+ channel.", d: "match rate 31.8% (floor)" },
                { t: "4. Watch hybrids", b: "Hybrid saunas carry the best item margin (48%) on $703K revenue and growing interest. A hero hybrid PDP and comparison content could lift the highest-margin line.", d: "48% margin" },
              ]
            },
          ].map((sec, i) => (
            <Card key={i} style={{ borderLeft: `4px solid ${sec.color}`, padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: sec.color }}>{sec.title}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                {sec.items.map((item, j) => (
                  <div key={j} style={{ background: "rgba(128,128,128,0.06)", borderRadius: 10, padding: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{item.t}</div>
                    <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6, marginBottom: 8 }}>{item.b}</p>
                    <Tag color={sec.color}>{item.d}</Tag>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* ═══ H: METHODOLOGY ═══ */}
        <div id="method" style={{ marginTop: 64, padding: 24, background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Methodology & Data Notes</h3>
          <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.8 }}>
            <p><strong>Call data:</strong> 2,043 AI-analysed pre-sale calls (Should_Analyze tab), 18 Nov 2025 – 8 Jul 2026, deduplicated to 1,392 unique callers by phone. v1 used 1,161 calls to 5 Apr 2026.</p>
            <p><strong>Sales data:</strong> NetSuite sales orders, Revel departments, trailing 12 months to 8 Jul 2026. Closed/cancelled orders excluded (957 orders, $3.7M). Topline revenue is GST-inclusive order totals; category revenue and margins are ex-GST item lines; GP is NetSuite estimated gross profit. v1's 36.1% margin was GP ÷ inc-GST revenue; the ex-GST equivalent is {META.marginPct}%.</p>
            <p><strong>Caller→order join:</strong> phone numbers normalised to last 9 digits and matched against customer phone/mobile fields. 443/1,392 matched. This undercounts: some purchasers' customer records hold no phone (verified on recorded calls), so caller conversion and traced revenue are floors.</p>
            <p><strong>Archetypes v2:</strong> k-means (k=6, one-hot, missingness down-weighted) on 12 need/intent fields over 1,262 callers with sufficient data; 130 sparse callers excluded. Purchase outcomes were held out of clustering and measured afterwards. k selected by silhouette + interpretability; cluster separation is modest (silhouette ≈ 0.10), normal for categorical survey-style data — treat archetypes as strong tendencies, not hard walls.</p>
            <p><strong>v1 comparison:</strong> v1 archetypes were approximated from their published definitions (segment × location × theme × barrier rules) and applied to the same callers, then cross-tabulated against v2 clusters.</p>
            <p><strong>Privacy:</strong> aggregate data only; no names or contact details are included in this dashboard. Quotes are verbatim but anonymised.</p>
            <p style={{ marginTop: 8 }}>Generated 9 Jul 2026 by Gary · sources: Revel_Transcript_Insights sheet + NetSuite (both read-only).</p>
          </div>
        </div>

      </div>
    </div>
  );
}
