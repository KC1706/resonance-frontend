import { Blueprint, Kicker } from "@/components/Blueprint";
import { state } from "@/lib/state";
import { reviewDeltas } from "@/data/mock";

const NOTE = `S: Reports ongoing sleep disruption and rumination about endsem results; feels isolated from peers ("only one struggling"). Discloses guilt toward parents and passive hopelessness ("no point"); denies intent or plan on direct enquiry.
O: Flat affect, low energy; engaged and honest once trust established. Talk-ratio 58% counsellor. Sleep homework not completed.
A: Worsening low mood with academic-anxiety driver; emergent hopelessness — risk present, not imminent. Protective: sustained attendance, purpose intact, responsive to warmth.
P: Safety follow-up within 48h; sleep support; reframe peer-comparison next session. Not a diagnostic screen — see resources routed.`;

export function Review() {
  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)" }}>
      <div style={{ marginBottom: "var(--space-4)" }}>
        <Kicker>Session 4 · Aarav M. · A-238 · 42 min · just ended</Kicker>
        <h2 style={{ margin: 0 }}>Post-session review</h2>
        <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 14 }}>Turn a finished session into a signed note and an updated profile in under two minutes.</p>
      </div>

      <Blueprint style={{ padding: "12px var(--space-4)", marginBottom: "var(--space-6)", display: "flex", alignItems: "center", gap: 12, border: "1.5px solid #c0392b", background: state.esc.bg }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={state.esc.fg} strokeWidth="1.5"><path d="M12 3 2 20h20z" /><path d="M12 10v5M12 17.5v.01" /></svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: state.esc.fg, fontSize: 14 }}>Mandatory follow-up flagged</div>
          <div className="text-muted" style={{ fontSize: 12 }}>Hopelessness cue at 27:14. A check-in within 48h has been queued to your action items.</div>
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
          <textarea className="input" defaultValue={NOTE} style={{ minHeight: 230, fontSize: 13, lineHeight: 1.6 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary">Sign &amp; file</button>
            <button className="btn btn-secondary">Add to profile</button>
            <button className="btn btn-secondary">Generate referral</button>
          </div>
        </Blueprint>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Blueprint style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h4 style={{ margin: "0 0 4px" }}>Wellness Index</h4>
              <span className="text-muted" style={{ fontSize: 11 }}>confidence 72%</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="text-muted" style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>47</span>
              <span style={{ fontFamily: "var(--font-heading)" }}>→</span>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 32 }}>41</span>
              <span style={{ color: state.esc.fg, fontFamily: "var(--font-heading)" }}>▼6</span>
            </div>
          </Blueprint>
          <Blueprint style={{ padding: "var(--space-4)" }}>
            <h4 style={{ margin: "0 0 var(--space-3)" }}>Facet deltas · why they moved</h4>
            {reviewDeltas.map((d) => (
              <div key={d.name} style={{ padding: "8px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <span style={{ fontFamily: "var(--font-heading)", color: d.col, fontSize: 15 }}>{d.arrow}</span>
                  <span style={{ flex: 1 }}>{d.name}</span>
                  <span style={{ fontFamily: "var(--font-heading)", color: d.col }}>{d.val}</span>
                </div>
                <div className="text-muted" style={{ fontSize: 11.5, fontStyle: "italic", marginLeft: 23 }}>"{d.quote}" · {d.ts}</div>
              </div>
            ))}
          </Blueprint>
          <Blueprint style={{ padding: "var(--space-4)" }}>
            <Kicker style={{ margin: "0 0 8px" }}>Self-coaching · private</Kicker>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 12.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Talk ratio (you)</span><span style={{ fontFamily: "var(--font-heading)", color: state.watch.fg }}>58% — a touch high</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Open-question rate</span><span style={{ fontFamily: "var(--font-heading)" }}>64%</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Empathy reflections</span><span style={{ fontFamily: "var(--font-heading)" }}>7</span></div>
            </div>
          </Blueprint>
        </div>
      </div>
    </div>
  );
}
