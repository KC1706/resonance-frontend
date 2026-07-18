import { useNavigate } from "react-router-dom";
import { Blueprint, Kicker, Tag } from "@/components/Blueprint";
import { state } from "@/lib/state";
import { useAppData } from "@/context/AppDataContext";
import { useSession } from "@/context/SessionContext";
import { PROFILE, CLIENT } from "./liveSession";

const toneCol = (tone: "esc" | "watch") => (tone === "esc" ? state.esc.fg : state.watch.fg);

export function Profile() {
  const navigate = useNavigate();
  const { radar } = useAppData(); // radar shape is illustrative
  const { result } = useSession();

  // The profile is built from the student's sessions — empty until intake runs.
  if (!result) {
    return (
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)" }}>
        <h2 style={{ margin: 0 }}>Student profile</h2>
        <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 14 }}>A longitudinal profile is built from a student's sessions.</p>
        <Blueprint style={{ padding: "var(--space-8)", textAlign: "center", marginTop: "var(--space-6)" }}>
          <p className="text-muted" style={{ margin: "0 0 14px", fontSize: 13.5 }}>No profile yet — run the intake session to build a baseline.</p>
          <button className="btn btn-primary" onClick={() => navigate("/counsellor/cockpit")}>Go to Live Cockpit</button>
        </Blueprint>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        <div style={{ width: 58, height: 58, border: "1px solid var(--color-divider)", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontSize: 22, flex: "none" }}>{CLIENT.initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <h2 style={{ margin: 0 }}>{CLIENT.name}</h2>
            <span className="text-muted" style={{ fontSize: 13 }}>{CLIENT.code} · 1 session · intake today · <span style={{ color: "var(--color-accent)" }}>Consent active</span></span>
            <Tag style={{ background: state.watch.bg, color: state.watch.fg }}>new · baseline</Tag>
          </div>
          <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 13.5 }}>{CLIENT.line}. Longitudinal profile — the counsellor's memory across every session.</p>
        </div>
        <Blueprint style={{ padding: "12px 16px", textAlign: "right" }}>
          <div className="text-muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em" }}>Wellness Index</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, justifyContent: "flex-end" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 40, lineHeight: 1 }}>{PROFILE.index}</span>
          </div>
          <div className="text-muted" style={{ fontSize: 10.5 }}>baseline · confidence 68%</div>
        </Blueprint>
      </div>

      {/* Trend + radar */}
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
            <h4 style={{ margin: 0 }}>Wellness Index trend</h4>
            <span className="text-muted" style={{ fontSize: 11.5 }}>baseline</span>
          </div>
          <svg viewBox="0 0 300 130" style={{ width: "100%", height: 150 }}>
            <line x1="20" y1="10" x2="20" y2="110" stroke="var(--color-divider)" />
            <line x1="20" y1="110" x2="295" y2="110" stroke="var(--color-divider)" />
            <circle cx="40" cy={110 - PROFILE.index} r="4" fill="var(--color-accent)" />
            <text x="40" y={110 - PROFILE.index - 8} fontSize="10" fill="currentColor" textAnchor="middle" fontFamily="var(--font-heading)">{PROFILE.index}</text>
            <text x="40" y="124" fontSize="8" fill="currentColor" opacity="0.55" textAnchor="middle">S1 · intake</text>
          </svg>
          <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>One session so far — the trend builds from this baseline.</div>
        </Blueprint>

        <Blueprint style={{ padding: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 var(--space-2)" }}>Trait radar · 5 dimensions</h4>
          <svg viewBox="0 0 240 224" style={{ width: "100%", height: 190 }}>
            <polygon points={radar.ring100} fill="none" stroke="var(--color-divider)" />
            <polygon points={radar.ring66} fill="none" stroke="var(--color-divider)" opacity="0.6" />
            <polygon points={radar.ring33} fill="none" stroke="var(--color-divider)" opacity="0.4" />
            {radar.axes.map((a) => (
              <g key={a.label}>
                <line x1="120" y1="110" x2={a.x2} y2={a.y2} stroke="var(--color-divider)" opacity="0.5" />
                <text x={a.lx} y={a.ly} fontSize="10" fill="currentColor" textAnchor="middle" fontFamily="var(--font-heading)">{a.label}</text>
              </g>
            ))}
            <polygon points={radar.poly} fill="color-mix(in srgb, var(--color-accent) 22%, transparent)" stroke="var(--color-accent)" strokeWidth="2" />
            {radar.axes.map((a) => <circle key={a.label} cx={a.px} cy={a.py} r="3" fill="var(--color-accent)" />)}
          </svg>
          <div className="text-muted" style={{ fontSize: 10.5, textAlign: "center" }}>tap a spoke to drill dimension → domain → facet</div>
        </Blueprint>
      </div>

      {/* Domains + balance/themes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 var(--space-3)" }}>Domain breakdown · A–I</h4>
          {PROFILE.domains.map((d) => (
            <div key={d.name} style={{ marginBottom: 10, opacity: d.op }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
                <span>{d.name} <span className="text-muted" style={{ fontSize: 10 }}>{d.dirLabel}</span></span>
                <span style={{ fontFamily: "var(--font-heading)" }}>{d.scoreLabel}</span>
              </div>
              <div style={{ height: 7, background: "color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
                <div style={{ height: "100%", width: `${d.score}%`, background: toneCol(d.tone) }} />
              </div>
            </div>
          ))}
        </Blueprint>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Blueprint style={{ padding: "var(--space-4)" }}>
            <h4 style={{ margin: "0 0 var(--space-3)" }}>Distress load vs protective capacity</h4>
            <div style={{ display: "grid", gridTemplateColumns: "34px 1fr 1fr", gap: 6, alignItems: "center", marginBottom: 8, fontSize: 11 }}>
              <span className="text-muted">S1</span>
              <div style={{ display: "flex", justifyContent: "flex-end", height: 12, background: "color-mix(in srgb, var(--color-text) 6%, transparent)" }}>
                <div style={{ width: `${PROFILE.distress}%`, height: "100%", background: state.esc.fg }} />
              </div>
              <div style={{ height: 12, background: "color-mix(in srgb, var(--color-text) 6%, transparent)" }}>
                <div style={{ width: `${PROFILE.protective}%`, height: "100%", background: "var(--color-accent)" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5 }} className="text-muted">
              <span style={{ color: state.esc.fg }}>◀ distress load</span><span style={{ color: "var(--color-accent)" }}>protective capacity ▶</span>
            </div>
          </Blueprint>
          <Blueprint style={{ padding: "var(--space-4)" }}>
            <h4 style={{ margin: "0 0 var(--space-3)" }}>Themes this session</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {result.themes.map((t) => (
                <Tag key={t} style={t === "Hopelessness" ? { background: state.esc.bg, color: state.esc.fg } : { background: "var(--color-accent-100)", color: "var(--color-accent-800)" }}>{t}</Tag>
              ))}
            </div>
          </Blueprint>
        </div>
      </div>

      {/* Story + focus + history */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: "var(--space-6)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Blueprint style={{ padding: "var(--space-4)", background: "color-mix(in srgb, var(--color-accent) 5%, transparent)" }}>
            <Kicker style={{ margin: "0 0 6px" }}>Story so far · 20-second read</Kicker>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>{PROFILE.story}</p>
          </Blueprint>
          <Blueprint style={{ padding: "var(--space-4)" }}>
            <Kicker style={{ margin: "0 0 8px" }}>Suggested next-session focus</Kicker>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, lineHeight: 1.7 }}>
              {PROFILE.focus.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </Blueprint>
        </div>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
            <h4 style={{ margin: 0 }}>Session history</h4>
          </div>
          <table className="table">
            <thead><tr><th>Session</th><th>Date</th><th>Index</th><th>Key moment</th></tr></thead>
            <tbody>
              <tr style={{ cursor: "pointer" }}>
                <td style={{ fontFamily: "var(--font-heading)" }}>S1</td>
                <td>today</td>
                <td><span style={{ fontFamily: "var(--font-heading)" }}>{PROFILE.index}</span> <span style={{ fontSize: 11 }} className="text-muted">baseline</span></td>
                <td style={{ fontSize: 12.5 }}>Intake · depression presentation {" "}
                  <Tag style={{ background: state.watch.bg, color: state.watch.fg, padding: "1px 6px" }}>safety flag</Tag>
                </td>
              </tr>
            </tbody>
          </table>
        </Blueprint>
      </div>
    </div>
  );
}
