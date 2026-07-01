import React, { useState, useEffect } from 'react';
import { Target, Flag, Star, Heart, Mountain, Compass, MapPin, Rocket, TrendingUp, Loader2, Shield, AlertTriangle, Lightbulb, Users, Crosshair, Calendar } from 'lucide-react';

const FORCE_USA_DOC_URL = "https://docs.google.com/document/d/e/2PACX-1vQPEzXwMibBUTbQ8CzisOeZmHNUypfxF-vQtJvCdv32pa6PN5gnQYlMZTzYiJFPd0OVg8OJFkr9mgxe/pub";

const PROXIES = [
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

export default function OPSPDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [opspData, setOpspData] = useState<any>(null);

  const fallbackData = {
    coreValues: ["PEOPLE", "NIMBAGILITY", "CONTINUOUS IMPROVEMENT", "COLLABORATION", "EMPATHY", "INCLUSIVITY"],
    purpose: "Improve lives through fitness and wellness",
    bhag: "To be a top 3 global brand leader in integrated strength systems, reaching $100M revenue and hero units in 1,000 retail stores by 2030",
    fy30Revenue: "$100,000,000",
    keyThrusts: [] as { title: string; desc: string }[],
    initiatives: [
      { text: "Build customer intelligence into a competitive advantage: a direct, first-party understanding of who our end customers are and why they buy, used to sharpen product and brand decisions and to support distributors with insight no competitor can give them", owner: "JH", status: "In Progress" },
      { text: "Improve ROI on existing distributors and attract more strong distributors, shifting the distributor mix", owner: "SH", status: "Not Set" },
      { text: "Embed the NPI process and sales toolkit across new product launches", owner: "LP", status: "Not Set" },
      { text: "Lift CX management capacity to support distribution: after-sales, warranty, spare parts and fulfilment", owner: "SH", status: "Not Set" },
      { text: "Accelerate product content and process using AI", owner: "MV", status: "Not Set" },
    ],
    strengths: [
      "Proprietary, vertically integrated product with ~90% in-house manufacturing (Body Longer)",
      "Differentiated core category: integrated all-in-one strength systems",
      "C20 award-winning product with industry recognition",
      "Strong growth in US (~30% YoY) and UK markets",
      "Established global distributor network (Fit Shop EU, Jimco, and partners across SEA, Middle East, Africa, South America)",
      "Force App provides a direct channel to end users",
      "ECDesign integration: 25 SKUs live on the 2D/3D gym design platform for distributors and sales",
    ],
    weaknesses: [
      "Limited visibility of end-customer data; the customer is largely owned by the distributor",
      "Reliance on distributors for market access and sales",
      "NPI process historically ad hoc, only now being formalised",
      "Low retail floor-model footprint (21 of a 100-store target)",
      "Margin pressure (~25% Q4 margin) and freight/shipping cost exposure",
      "App development cost and external dependency (~$8k/mo, Stormotion)",
      "Brand consistency across markets and localised-content burden",
    ],
    opportunities: [
      "Functional trainers are the fastest-growing US segment (9.64% CAGR)",
      "Large home-strength headroom (power rack ownership only 6.39% in AU study)",
      "Rebel Sport AU retail partnership (Australia's largest sporting goods retailer)",
      "UK expansion via Amazon UK and Decathlon UK",
      "Customer intelligence as a competitive advantage and a distributor-support tool",
      "Retail floor-model expansion toward the 1,000-store BHAG",
      "Leverage US-developed content across international distributors",
      "Market Development Fund (MDF) built into new-product pricing to fund marketing",
    ],
    threats: [
      "Middle East instability (Garner distributor postponed)",
      "Competition from Rogue, Rep Fitness and other strength brands",
      "Ultra-cheap offshore platforms and new product-safety obligations (2026 Federal Budget)",
      "Freight and shipping cost volatility impacting margin",
      "Post-COVID normalisation of home-fitness demand",
    ],
    quarterlyActions: [
      "By 31 July, define the key questions about the end customer (who they are, why they bought, jobs-to-be-done, what they buy next) and the decisions they drive, for Force and for distributors (JH)",
      "By 31 July, audit the first-party data and direct-capture channels Force already has (Force App, US DTC, enquiry and sales data, existing GAF/Revel archetype work) (JH)",
      "By 31 August, identify and prioritise the avenues to build customer intelligence (app and product registration, post-purchase surveys, DTC data, distributor collaboration) with a recommended mix (JH)",
      "By 31 August, shape the distributor-support offering and test it in principle with one or two lead distributors, e.g. Jimco and Fit Shop (JH)",
      "By 30 September, prove the approach with at least one working pilot capturing real first-party customer data, reviewed in the monthly BU cadence (JH)",
      "By 30 September, deliver a signed-off customer-intelligence roadmap covering data capture and distributor support (JH)",
    ],
    companyPriorities: [
      { owner: "Josh Hancock (JH)", text: "Define the customer intelligence we need and the decisions it drives; prioritise the capture avenues; ship one working pilot and a signed-off roadmap" },
      { owner: "Simon Heinrich (SH)", text: "Identify the % split of Tier 1/2/3 distributors; agree and align scorecard ranking; build grow / reward / stop plans" },
      { owner: "Laura Paul (LP)", text: "100% of hero products have a completed Ready-for-Sale checklist by end of Q1" },
      { owner: "Simon Heinrich (SH)", text: "Distributor job scorecard (Ashleigh); create the online warranty process by Q1; hire a CX Force A-player to onboard by Q4" },
      { owner: "Mario Vargas (MV)", text: "Access urgent SKUs for content; review SKUs and agency capability; stand up an AI-driven content production process with testing and learnings" },
    ],
    yourPriority: {
      goal: "By 30 September, define the customer intelligence we need and the decisions it drives, prioritise the avenues to capture it, prove the approach with one working pilot, and deliver a signed-off roadmap for the year",
      kpi: "First-party customer records captured globally [target TBC]; number of distributors actively using Force customer intelligence [target TBC]",
    },
    sandbox: {
      geography: "Global: Australia, USA, UK, Europe, plus SEA, Middle East, Africa, South America",
      channel: "Distributors (wholesale) + US DTC + Force App",
      offering: "Integrated all-in-one strength systems and hero units",
    },
    processes: {
      makeBuy: "In-house manufacturing via Body Longer (~90% of production)",
      sell: "Global distributor network + US DTC (forceusa.co) + Force App",
      recordkeeping: "Align (projects), A-line (forecasting), Asana",
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docUrl = `${FORCE_USA_DOC_URL}?_t=${Date.now()}`;

        let htmlContent: string | null = null;
        for (const proxyFn of PROXIES) {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(proxyFn(docUrl), { signal: controller.signal });
            clearTimeout(timeout);
            if (!res.ok) continue;
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('json')) {
              const json = await res.json();
              htmlContent = json.contents;
            } else {
              htmlContent = await res.text();
            }
            if (htmlContent) break;
          } catch { continue; }
        }
        if (!htmlContent) throw new Error('All proxies failed');

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        doc.querySelectorAll('script, style, head').forEach((el: Element) => el.remove());
        const lines = (doc.body.textContent || '').split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);

        const parsed = { ...fallbackData };

        const looksLikeCode = (s: string) =>
          /[{};]|=>|\bfunction\b|prototype|\bvar\b|typeof/.test(s);
        const clean = (s: string | null) => (s && !looksLikeCode(s) ? s : null);

        const findValueAfter = (header: string, offset = 1) => {
          const idx = lines.findIndex((l: string) => l.toUpperCase().includes(header.toUpperCase()));
          if (idx !== -1 && lines[idx + offset]) return lines[idx + offset];
          return null;
        };

        const purpose = clean(findValueAfter("Purpose (Why)"));
        if (purpose) parsed.purpose = purpose;

        const bhag = clean(findValueAfter("BHAG (Big Hairy Audacious Goal)"));
        if (bhag) parsed.bhag = bhag;

        const fy30Rev = clean(findValueAfter("FY30", 1));
        if (fy30Rev && fy30Rev.includes("$")) parsed.fy30Revenue = fy30Rev;

        setOpspData(parsed);
      } catch (e) {
        console.warn("Live parsing failed, using fallback data.", e);
        setOpspData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading || !opspData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="w-10 h-10 text-[#185787] animate-spin" />
        <p className="text-gray-500 font-medium">Fetching Live OPSP Data...</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    if (status === "In Progress") return "bg-blue-100 text-blue-800";
    if (status === "Complete") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-[#f8f8fa] font-sans pb-20 animate-in fade-in duration-500">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl text-[#185787]">
              <Compass size={24} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-gray-900">One Page Strategic Plan</h1>
              <p className="text-xs text-gray-500 font-medium">Force USA - Q1 FY27</p>
            </div>
          </div>
          <a
            href={FORCE_USA_DOC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-sm hidden sm:block"
          >
            View Live Source Document
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

        {/* PURPOSE & BHAG HERO */}
        <div className="bg-gradient-to-br from-[#081C28] to-black rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest mb-4">
                <Heart size={12} className="text-[#185787]" />
                Purpose (Why)
              </div>
              <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight mb-4">
                {opspData.purpose}
              </h2>
            </div>

            <div className="md:border-l border-white/10 md:pl-8 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest w-max mb-4">
                <Mountain size={12} className="text-[#185787]" />
                BHAG (10-30 Yrs)
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
                {opspData.bhag}
              </h2>
            </div>
          </div>
        </div>

        {/* FOUNDATION ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-gray-100 text-gray-700 rounded-lg"><Star size={18} /></div>
              <h3 className="font-bold text-gray-900 text-lg">Core Values</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {opspData.coreValues.map((val: string, idx: number) => (
                <div key={idx} className="bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-2 w-full sm:w-auto flex-1 text-center justify-center min-w-[120px]">
                  {val}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-gray-100 text-gray-700 rounded-lg"><MapPin size={18} /></div>
              <h3 className="font-bold text-gray-900 text-lg">Sandbox / Ideal Client</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                <div className="text-xs font-bold uppercase tracking-wider text-[#185787] mb-1">Channel</div>
                <div className="text-gray-900 font-semibold text-sm">{opspData.sandbox.channel}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Geography</div>
                <div className="text-gray-900 font-semibold text-sm">{opspData.sandbox.geography}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Offering</div>
                <div className="text-gray-900 font-semibold text-sm">{opspData.sandbox.offering}</div>
              </div>
            </div>
          </div>
        </div>

        {/* FY27 INITIATIVES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-300 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 text-[#185787] rounded-lg"><Flag size={18} /></div>
              <h3 className="font-bold text-gray-900 text-lg">Key Initiatives - FY2027</h3>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">FY30 Revenue Target</div>
              <div className="text-lg font-black text-gray-900">{opspData.fy30Revenue}</div>
            </div>
          </div>

          <div className="space-y-3">
            {opspData.initiatives.map((init: any, i: number) => (
              <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50/50 transition-colors border border-transparent hover:border-blue-100">
                <div className="w-6 h-6 rounded-full bg-[#185787] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-700 leading-snug">{init.text}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold text-[#185787] bg-blue-50 px-2 py-0.5 rounded">{init.owner}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getStatusColor(init.status)}`}>{init.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUARTERLY SECTION */}
        <div className="bg-[#081C28] rounded-2xl shadow-md p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#185787] to-gray-500"></div>

          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-white/10 text-white rounded-lg"><Calendar size={20} /></div>
            <div>
              <h3 className="font-bold text-xl">Q1 FY27 Actions</h3>
              <p className="text-xs text-gray-400">Jul - Sep 2026</p>
            </div>
          </div>

          <div className="space-y-3">
            {opspData.quarterlyActions.map((action: string, i: number) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                <div className="text-sm text-gray-200 leading-snug">{action}</div>
              </div>
            ))}
          </div>
        </div>

        {/* COMPANY PRIORITIES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-blue-100 text-[#185787] rounded-lg"><Users size={18} /></div>
            <h3 className="font-bold text-gray-900 text-lg">Company Priorities</h3>
          </div>
          <div className="space-y-3">
            {opspData.companyPriorities.map((p: any, i: number) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-xs font-bold text-[#185787] mb-1">{p.owner}</div>
                <div className="text-sm text-gray-700 leading-snug">{p.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* YOUR PRIORITY */}
        <div className="bg-gradient-to-r from-[#185787] to-[#1a6aaa] rounded-2xl shadow-md p-6 md:p-8 text-white relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-white/10 text-white rounded-lg"><Crosshair size={20} /></div>
            <h3 className="font-bold text-xl">Your Priority (Josh)</h3>
          </div>
          <div className="mb-4">
            <div className="text-[10px] uppercase font-bold text-blue-200 tracking-widest mb-2">Goal</div>
            <p className="text-sm md:text-base text-white/90 leading-relaxed">{opspData.yourPriority.goal}</p>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-blue-200 tracking-widest mb-2">KPI</div>
            <p className="text-sm text-white/80 leading-relaxed">{opspData.yourPriority.kpi}</p>
          </div>
        </div>

        {/* SWOT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-100 text-green-700 rounded-lg"><Shield size={18} /></div>
              <h3 className="font-bold text-gray-900 text-lg">Strengths</h3>
            </div>
            <div className="space-y-2">
              {opspData.strengths.map((s: string, i: number) => (
                <div key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-green-500 shrink-0 mt-0.5">+</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg"><AlertTriangle size={18} /></div>
              <h3 className="font-bold text-gray-900 text-lg">Weaknesses</h3>
            </div>
            <div className="space-y-2">
              {opspData.weaknesses.map((w: string, i: number) => (
                <div key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-yellow-500 shrink-0 mt-0.5">-</span>
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 text-[#185787] rounded-lg"><Lightbulb size={18} /></div>
              <h3 className="font-bold text-gray-900 text-lg">Opportunities</h3>
            </div>
            <div className="space-y-2">
              {opspData.opportunities.map((o: string, i: number) => (
                <div key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-blue-500 shrink-0 mt-0.5">{i + 1}.</span>
                  <span>{o}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-red-100 text-red-700 rounded-lg"><AlertTriangle size={18} /></div>
              <h3 className="font-bold text-gray-900 text-lg">Trends / Threats</h3>
            </div>
            <div className="space-y-2">
              {opspData.threats.map((t: string, i: number) => (
                <div key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-red-500 shrink-0 mt-0.5">!</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PROCESS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-gray-100 text-gray-700 rounded-lg"><Rocket size={18} /></div>
            <h3 className="font-bold text-gray-900 text-lg">Process (Productivity Drivers)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Make / Buy</div>
              <div className="text-sm text-gray-900 font-medium">{opspData.processes.makeBuy}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Sell</div>
              <div className="text-sm text-gray-900 font-medium">{opspData.processes.sell}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Recordkeeping</div>
              <div className="text-sm text-gray-900 font-medium">{opspData.processes.recordkeeping}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
