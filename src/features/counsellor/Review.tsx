import { useNavigate } from "react-router-dom";
import { Blueprint, Kicker } from "@/components/Blueprint";
import { state } from "@/lib/state";
import { useSession } from "@/context/SessionContext";

const toneCol = (tone: "esc" | "watch") => (tone === "esc" ? state.esc.fg : state.watch.fg);

export function Review() {
  const navigate = useNavigate();
  const { result } = useSession();

  // Generated from the session: nothing to review until a live session completes.
  if (!result) {
    return (
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)" }}>
        <h2 style={{ margin: 0 }}>Post-session review</h2>
        <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 14 }}>A review appears here once you finish a live session.</p>
        <Blueprint style={{ padding: "var(--space-8)", textAlign: "center", marginTop: "var(--space-6)" }}>
          <p className="text-muted" style={{ margin: "0 0 14px", fontSize: 13.5 }}>No session to review yet.</p>
          <button className="btn btn-primary" onClick={() => navigate("/counsellor/cockpit")}>Go to Live Cockpit</button>
        </Blueprint>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)" }}>
      <div style={{ marginBottom: "var(--space-4)" }}>
        <Kicker>{result.sessionLabel} · {result.studentName} · {result.studentCode} · {result.durationLabel} · just ended</Kicker>
        <h2 style={{ margin: 0 }}>Post-session review</h2>
        <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 14 }}>Turn a finished session into a signed note and a baseline profile in under two minutes.</p>
      </div>

      <Blueprint style={{ padding: "12px var(--space-4)", marginBottom: "var(--space-6)", display: "flex", alignItems: "center", gap: 12, border: `1.5px solid ${state.watch.bd}`, background: state.watch.bg }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={state.watch.fg} strokeWidth="1.5"><path d="M12 3 2 20h20z" /><path d="M12 10v5M12 17.5v.01" /></svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: state.watch.fg, fontSize: 14 }}>Safety follow-up flagged</div>
          <div className="text-muted" style={{ fontSize: 12 }}>{result.keyMomentText} ({result.keyMomentTs}). A safety check-in has been queued to your action items.</div>
        </div>
        <button className="btn btn-secondary">View protocol</button>
      </Blueprint>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--space-6)" }}>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
            <h4 style={{ margin: 0 }}>Auto note · SOAP <span className="text-muted" style={{ fontSize: 11, fontFamily: "var(--font-body)" }}>— draft, you sign</span></h4>
            <div className="seg">
              <label className="seg-opt"><input type="radio" name="tpl" defaultChecked />SOAP</label>
              <label className="seg-opt"><input type="radio" name="tpl" />Narrative</label>
            </div>
          </div>
          <textarea className="input" defaultValue={result.note} style={{ minHeight: 260, fontSize: 13, lineHeight: 1.6 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary">Sign &amp; file</button>
            <button className="btn btn-secondary" onClick={() => navigate("/counsellor/profile")}>Add to profile</button>
            <button className="btn btn-secondary">Generate referral</button>
          </div>
        </Blueprint>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Blueprint style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h4 style={{ margin: "0 0 4px" }}>Wellness Index</h4>
              <span className="text-muted" style={{ fontSize: 11 }}>baseline · confidence 68%</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 32 }}>{result.baselineIndex}</span>
              <span className="text-muted" style={{ fontSize: 12 }}>first reading — no prior session to compare</span>
            </div>
          </Blueprint>
          <Blueprint style={{ padding: "var(--space-4)" }}>
            <h4 style={{ margin: "0 0 var(--space-3)" }}>Baseline facet readings · from this session</h4>
            {result.readings.map((d) => (
              <div key={d.name} style={{ padding: "8px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <span style={{ fontFamily: "var(--font-heading)", color: toneCol(d.tone), fontSize: 15 }}>{d.arrow}</span>
                  <span style={{ flex: 1 }}>{d.name}</span>
                  <span style={{ fontFamily: "var(--font-heading)", color: toneCol(d.tone), fontSize: 12 }}>{d.level}</span>
                </div>
                <div className="text-muted" style={{ fontSize: 11.5, fontStyle: "italic", marginLeft: 23 }}>"{d.quote}" · {d.ts}</div>
              </div>
            ))}
          </Blueprint>
          <Blueprint style={{ padding: "var(--space-4)" }}>
            <Kicker style={{ margin: "0 0 8px" }}>Self-coaching · private</Kicker>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 12.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Talk ratio (you)</span><span style={{ fontFamily: "var(--font-heading)" }}>46% — well balanced</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Open-question rate</span><span style={{ fontFamily: "var(--font-heading)" }}>71%</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Empathy reflections</span><span style={{ fontFamily: "var(--font-heading)" }}>12</span></div>
            </div>
          </Blueprint>
        </div>
      </div>
    </div>
  );
}
