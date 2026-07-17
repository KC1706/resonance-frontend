import { useState } from "react";
import { Blueprint, StatCard, Kicker, Tag } from "@/components/Blueprint";
import { state } from "@/lib/state";
import {
  cellStats, instStats, outcomeStats, decisions, triage, counsellorLoad, hotspots, dimMix,
} from "@/data/mock";

export function Oversight() {
  const [scope, setScope] = useState<"cell" | "inst">("cell");
  const cell = scope === "cell";

  const stats = cell ? cellStats : instStats;
  const scopeTitle = cell ? "Triage & supervision" : "Population wellness";
  const scopeSub = cell
    ? "Identified individuals — clinical/operational responsibility, fully audited."
    : "Aggregate & anonymised only — no individual is ever identifiable here.";
  const banner = cell
    ? "Cell view · identified. Every access to an individual record is logged."
    : "Institution · aggregate. Anonymity by construction — no segment below 10 students is shown.";
  const chip = cell ? "Cell · identified" : "Institution · aggregate";
  const chipStyle = cell
    ? { background: state.watch.bg, color: state.watch.fg }
    : { background: "var(--color-accent-100)", color: "var(--color-accent-800)" };
  const bannerBg = cell ? state.watch.bg : "color-mix(in srgb, var(--color-accent) 6%, transparent)";

  const decisionsShown = decisions.filter((d) => d.cellOnly === cell);

  return (
    <div style={{ maxWidth: 1220, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)" }}>
      {/* Header + scope toggle */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: "var(--space-4)" }}>
        <div>
          <Kicker>Oversight · one dashboard, role-scoped data</Kicker>
          <h2 style={{ margin: 0 }}>{scopeTitle}</h2>
          <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 14 }}>{scopeSub}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-end" }}>
          <div className="seg">
            <label className="seg-opt"><input type="radio" name="scope" checked={cell} onChange={() => setScope("cell")} />Cell · identified</label>
            <label className="seg-opt"><input type="radio" name="scope" checked={!cell} onChange={() => setScope("inst")} />Institution · aggregate</label>
          </div>
          <Tag style={{ ...chipStyle, display: "inline-flex", gap: 5, alignItems: "center" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z" /></svg>{chip}
          </Tag>
        </div>
      </div>

      <Blueprint style={{ padding: "10px var(--space-4)", marginBottom: "var(--space-6)", display: "flex", alignItems: "center", gap: 10, background: bannerBg }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flex: "none" }}><path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z" /><path d="m9 12 2 2 4-4" /></svg>
        <span style={{ fontSize: 12.5 }}>{banner}</span>
      </Blueprint>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        {stats.map((s) => <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} color={s.color} />)}
      </div>

      {/* Decisions */}
      <Blueprint style={{ padding: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        <h4 style={{ margin: "0 0 var(--space-3)" }}>What needs a decision now</h4>
        {decisionsShown.map((d) => (
          <div key={d.text} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 15, color: d.col, width: 22 }}>{d.rank}</span>
            <span style={{ flex: 1, fontSize: 13.5 }}>{d.text}</span>
            <button className="btn btn-secondary" style={{ padding: "4px 12px" }}>{d.action}</button>
          </div>
        ))}
      </Blueprint>

      {/* Cell tier */}
      {cell && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
            {triage.map((col) => (
              <Blueprint key={col.title} style={{ padding: "var(--space-4)", minHeight: 210 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: "var(--space-3)" }}>
                  <span style={{ width: 9, height: 9, background: col.color }} />
                  <h5 style={{ margin: 0 }}>{col.title}</h5>
                  <span className="text-muted" style={{ marginLeft: "auto", fontFamily: "var(--font-heading)" }}>{col.count}</span>
                </div>
                {col.items.map((it) => (
                  <div key={it.name} style={{ padding: "8px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{it.name}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>{it.reason}</div>
                  </div>
                ))}
              </Blueprint>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
            <Blueprint style={{ padding: "var(--space-4)" }}>
              <h4 style={{ margin: "0 0 var(--space-3)" }}>Counsellor load &amp; burnout signal</h4>
              {counsellorLoad.map((c) => (
                <div key={c.name} style={{ marginBottom: 11 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
                    <span>{c.name}</span>
                    <span className="text-muted">{c.sessions} sessions/wk · {c.high} high-distress</span>
                  </div>
                  <div style={{ height: 7, background: "color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
                    <div style={{ height: "100%", width: `${c.load}%`, background: c.col }} />
                  </div>
                </div>
              ))}
            </Blueprint>
            <Blueprint style={{ padding: "var(--space-4)" }}>
              <Kicker style={{ margin: "0 0 6px" }}>Supervision &amp; quality · opt-in, developmental</Kicker>
              <p className="text-muted" style={{ margin: "0 0 12px", fontSize: 12.5 }}>A mirror the counsellor chooses to look into — never a public ranking.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5 }}>
                {[["Avg talk-ratio (cell)", "54%"], ["Open-question rate", "67%"], ["Empathy reflections / session", "6.2"], ["Sessions available for calibration", "8 consented"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between" }}><span>{k}</span><span style={{ fontFamily: "var(--font-heading)" }}>{v}</span></div>
                ))}
              </div>
            </Blueprint>
          </div>
        </>
      )}

      {/* Institution tier */}
      {!cell && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
            <Blueprint style={{ padding: "var(--space-4)" }}>
              <h4 style={{ margin: "0 0 6px" }}>Wellness Index vs academic calendar</h4>
              <p className="text-muted" style={{ margin: "0 0 8px", fontSize: 12 }}>Anxiety facets spike cohort-wide around exams — deploy support before crisis.</p>
              <svg viewBox="0 0 300 130" style={{ width: "100%", height: 160 }}>
                <line x1="10" y1="110" x2="295" y2="110" stroke="var(--color-divider)" />
                <rect x="150" y="14" width="46" height="96" fill="color-mix(in srgb, #c0392b 10%, transparent)" />
                <text x="173" y="26" fontSize="8" textAnchor="middle" fill={state.esc.fg}>Endsem</text>
                <polyline points="10,46 55,44 100,50 150,66 173,92 196,84 240,64 292,56" fill="none" stroke="var(--color-accent)" strokeWidth="2" />
              </svg>
            </Blueprint>
            <Blueprint style={{ padding: "var(--space-4)" }}>
              <h4 style={{ margin: "0 0 var(--space-3)" }}>Hotspots by segment</h4>
              {hotspots.map((h) => (
                <div key={h.seg} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)", fontSize: 12.5 }}>
                  <span>{h.seg}</span>
                  <span><span style={{ fontFamily: "var(--font-heading)" }}>{h.idx}</span> <span style={{ color: h.col, fontSize: 11 }}>{h.delta}</span></span>
                </div>
              ))}
              <div className="text-muted" style={{ fontSize: 11, marginTop: 8, fontStyle: "italic" }}>1 segment below 20 students hidden — absence isn't safety.</div>
            </Blueprint>
          </div>
          <Blueprint style={{ padding: "var(--space-4)" }}>
            <h4 style={{ margin: "0 0 var(--space-3)" }}>What's driving the trend</h4>
            {dimMix.map((m) => (
              <div key={m.name} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}><span>{m.name}</span></div>
                <div style={{ height: 7, background: "color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
                  <div style={{ height: "100%", width: `${m.pct}%`, background: m.col }} />
                </div>
              </div>
            ))}
          </Blueprint>
        </>
      )}

      {/* Outcomes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "var(--space-4)", marginTop: "var(--space-6)" }}>
        {outcomeStats.map((s) => <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} color={s.color} />)}
      </div>
    </div>
  );
}
