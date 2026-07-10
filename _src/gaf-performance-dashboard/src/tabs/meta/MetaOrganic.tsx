// src/tabs/meta/MetaOrganic.tsx
import { useState } from "react";
import { KpiCard } from "../../components/KpiCard";
import { fmtInt } from "../../lib/format";
import type { OrganicData, OrganicPost } from "../../lib/data";

interface Props {
  organic?: OrganicData;
}

function PostThumb({ url, alt }: { url?: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <div
        className="w-full flex items-center justify-center text-xs"
        style={{ aspectRatio: "4 / 5", background: "var(--gaf-primary-light)", color: "var(--gaf-text-muted)" }}
      >
        No preview
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="w-full object-cover"
      style={{ aspectRatio: "4 / 5" }}
    />
  );
}

function fmtPostDate(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

export function MetaOrganic({ organic }: Props) {
  const ig = organic?.ig;
  const fb = organic?.fbPage;

  if (!organic || (!ig && !fb)) {
    return (
      <div className="fade-in dash-card p-8 text-center text-sm" style={{ color: "var(--gaf-text-muted)" }}>
        No organic social data available.
      </div>
    );
  }

  const posts = (ig?.posts ?? []) as OrganicPost[];

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h3
          className="text-lg font-bold"
          style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}
        >
          Organic Social
        </h3>
        <span className="text-xs" style={{ color: "var(--gaf-text-muted)" }}>
          30-day snapshot
        </span>
      </div>

      {/* Instagram KPI cards */}
      {ig && (
        <section aria-label="Instagram organic metrics">
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--gaf-text-muted)" }}>
            Instagram
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            <KpiCard label="Reach" value={fmtInt(ig.reach ?? 0)} />
            <KpiCard label="Views" value={fmtInt(ig.views ?? 0)} />
            <KpiCard label="Accounts Engaged" value={fmtInt(ig.accountsEngaged ?? 0)} />
            <KpiCard label="Total Interactions" value={fmtInt(ig.totalInteractions ?? 0)} />
            <KpiCard label="Followers" value={fmtInt(ig.followerCount ?? 0)} />
          </div>
        </section>
      )}

      {/* Top posts grid */}
      {posts.length > 0 && (
        <section aria-label="Top Instagram posts">
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--gaf-text-muted)" }}>
            Recent Posts
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {posts.map((p, i) => {
              const isVideo = p.mediaType === "VIDEO";
              const isCarousel = p.mediaType === "CAROUSEL_ALBUM";
              const typeBadge = isVideo ? "Video" : isCarousel ? "Album" : null;
              const card = (
                <div className="dash-card overflow-hidden flex flex-col h-full">
                  <div className="relative">
                    <PostThumb url={p.thumbnail} alt={p.caption ?? "Instagram post"} />
                    {typeBadge && (
                      <span
                        className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
                        style={{ background: "rgba(0,0,0,0.55)" }}
                      >
                        {typeBadge}
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col gap-2 flex-1 min-w-0">
                    <p className="text-[11px] leading-snug line-clamp-3" style={{ color: "var(--gaf-text-secondary)" }}>
                      {p.caption ?? ""}
                    </p>
                    <div className="mt-auto flex items-center gap-3 text-[11px] tabular-nums" style={{ color: "var(--gaf-text-muted)" }}>
                      <span>&#10084; {fmtInt(p.likes ?? 0)}</span>
                      <span>&#128172; {fmtInt(p.comments ?? 0)}</span>
                      {p.timestamp && <span className="ml-auto">{fmtPostDate(p.timestamp)}</span>}
                    </div>
                  </div>
                </div>
              );
              return p.permalink ? (
                <a key={p.id ?? i} href={p.permalink} target="_blank" rel="noopener noreferrer" className="block h-full">
                  {card}
                </a>
              ) : (
                <div key={p.id ?? i} className="h-full">{card}</div>
              );
            })}
          </div>
        </section>
      )}

      {/* Facebook Page stats */}
      {fb && (
        <section aria-label="Facebook Page metrics">
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--gaf-text-muted)" }}>
            Facebook Page
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            <KpiCard label="Page Followers" value={fmtInt(fb.fanCount ?? 0)} />
            <KpiCard label="Talking About" value={fmtInt(fb.talkingAbout ?? 0)} subLabel="7-day" />
          </div>
          <p className="text-[11px] mt-3" style={{ color: "var(--gaf-text-muted)" }}>
            Facebook Page Insights are largely deprecated in the Graph API. Follower and talking-about counts are read directly from the Page node.
          </p>
        </section>
      )}
    </div>
  );
}
