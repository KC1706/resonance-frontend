import { useNavigate } from "react-router-dom";
import { Blueprint, StatCard, Kicker, Tag } from "@/components/Blueprint";
import { state } from "@/lib/state";
import { homeStats, schedule, needsAttention, actions } from "@/data/mock";

const tierTag = (tier: string) => {
  if (tier === "WATCH") return { background: state.watch.bg, color: state.watch.fg };
  if (tier === "NEW") return { background: "var(--color-neutral-100)", color: "var(--color-neutral-800)" };
  return { background: "var(--color-accent-100)", color: "var(--color-accent-800)" };
};

export function HomeToday() {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
        <div>
          <Kicker>Wednesday · 18 March</Kicker>
          <h2 style={{ margin: 0 }}>Good morning, Priya.</h2>
          <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 14 }}>
            You have 5 sessions today. One student needs attention before you start.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/counsellor/cockpit")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 4l14 8-14 8z" /></svg>
          Start next session
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        {homeStats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} color={s.color} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--space-6)" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Prep card */}
          <Blueprint elev="sm" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
              <Kicker>Next session · 10:30 · in 25 min</Kicker>
              <Tag style={{ background: state.watch.bg, color: state.watch.fg, border: `1px solid ${state.watch.bd}` }}>WATCH</Tag>
            </div>
            <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start" }}>
              <div style={{ width: 52, height: 52, border: "1px solid var(--color-divider)", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontSize: 19, flex: "none" }}>
                AM
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <h4 style={{ margin: 0 }}>Aarav M.</h4>
                  <span className="text-muted" style={{ fontSize: 12 }}>A-238 · Session 4 · since Feb 12</span>
                </div>
                <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-accent)", margin: "10px 0 4px" }}>
                  Story so far
                </div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5 }}>
                  Sleep and academic anxiety since intake; withdrew after endsem results. Wellness Index down 17 pts across
                  3 sessions. Family expectations recur. <strong>Last session surfaced early hopelessness cues</strong> —
                  handle gently, lead with connection.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "12px 0" }}>
                  <Tag className="tag-accent">Sleep</Tag>
                  <Tag className="tag-accent">Academic anxiety</Tag>
                  <Tag className="tag-accent">Family expectations</Tag>
                  <Tag style={{ background: state.esc.bg, color: state.esc.fg }}>Hopelessness ↑</Tag>
                </div>
                <div className="text-muted" style={{ fontSize: 12, marginBottom: 12 }}>
                  <strong style={{ color: "var(--color-text)" }}>Pending homework:</strong> sleep-log for one week (not returned).
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary" onClick={() => navigate("/counsellor/cockpit")}>Start session</button>
                  <button className="btn btn-secondary" onClick={() => navigate("/counsellor/profile")}>Review full profile</button>
                </div>
              </div>
            </div>
          </Blueprint>

          {/* Today's schedule */}
          <Blueprint style={{ padding: "var(--space-4)" }}>
            <h4 style={{ margin: "0 0 var(--space-3)" }}>Today's schedule</h4>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {schedule.map((v) => (
                <div key={v.note} style={{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 12, alignItems: "center", padding: "9px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 15 }}>{v.time}</span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{v.name}</div>
                    <div className="text-muted" style={{ fontSize: 11.5 }}>{v.note}</div>
                  </div>
                  <Tag style={tierTag(v.tier)}>{v.tier}</Tag>
                </div>
              ))}
            </div>
          </Blueprint>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Blueprint style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: "var(--space-3)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={state.esc.fg} strokeWidth="1.5"><path d="M12 3 2 20h20z" /><path d="M12 10v5M12 17.5v.01" /></svg>
              <h4 style={{ margin: 0 }}>Needs attention</h4>
            </div>
            <p className="text-muted" style={{ margin: "0 0 12px", fontSize: 12 }}>
              Trending down but not booked — the quiet decliners the system catches for you.
            </p>
            {needsAttention.map((n) => (
              <div key={n.name} onClick={() => navigate("/counsellor/profile")} style={{ cursor: "pointer", padding: "10px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{n.name}</div>
                  <div className="text-muted" style={{ fontSize: 11.5 }}>{n.reason}</div>
                </div>
                <span style={{ fontFamily: "var(--font-heading)", color: state.esc.fg, fontSize: 14 }}>{n.delta}</span>
              </div>
            ))}
          </Blueprint>

          <Blueprint style={{ padding: "var(--space-4)" }}>
            <h4 style={{ margin: "0 0 var(--space-3)" }}>Action items</h4>
            {actions.map((a) => (
              <label key={a.label} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "8px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)", cursor: "pointer", fontSize: 13 }}>
                <span style={{ width: 15, height: 15, border: "1.5px solid var(--color-divider)", flex: "none", marginTop: 1 }} />
                <span style={{ flex: 1 }}>
                  {a.label}
                  <span className="text-muted" style={{ display: "block", fontSize: 11 }}>Due {a.due}</span>
                </span>
              </label>
            ))}
          </Blueprint>
        </div>
      </div>
    </div>
  );
}
