import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Blueprint, Kicker, Tag } from "@/components/Blueprint";
import { state } from "@/lib/state";
import { transcript, liveFacets, cockpit } from "@/data/mock";

export function LiveCockpit() {
  const navigate = useNavigate();
  const [minimal, setMinimal] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [sec, setSec] = useState(42 * 60 + 14);
  const scrollRef = useRef<HTMLDivElement>(null);
  const crisis = true; // hopelessness surfaced in this scripted moment

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [playing]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, []);

  const clock = `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
  const cockGrid = minimal ? "minmax(0,1.4fr) minmax(0,1fr)" : "minmax(0,1.05fr) minmax(0,1fr) 300px";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Session bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-3) var(--space-6)", borderBottom: "1px solid var(--color-divider)", flex: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ position: "relative", width: 9, height: 9 }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#c0392b", animation: "rec 1.4s infinite" }} />
          </span>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 14 }}>LIVE</span>
        </div>
        <div style={{ width: 1, height: 20, background: "var(--color-divider)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, border: "1px solid var(--color-divider)", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontSize: 12 }}>AM</div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Aarav M. · A-238</div>
            <div className="text-muted" style={{ fontSize: 11 }}>Session 4 · English + Hindi</div>
          </div>
        </div>
        <Tag className="tag-accent" style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" /></svg>Consent active
        </Tag>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 15, marginLeft: "auto" }}>{clock}</span>
        <div style={{ width: 1, height: 20, background: "var(--color-divider)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", border: `1px solid ${state.watch.bd}`, background: state.watch.bg }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: state.watch.fg }} />
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: state.watch.fg, fontWeight: 500 }}>Safety · Watch</span>
        </div>
        <div className="seg" style={{ marginLeft: 4 }}>
          <label className="seg-opt"><input type="radio" name="mode" checked={!minimal} onChange={() => setMinimal(false)} />Full</label>
          <label className="seg-opt"><input type="radio" name="mode" checked={minimal} onChange={() => setMinimal(true)} />Minimal</label>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate("/counsellor/review")}>End &amp; review →</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: cockGrid, flex: 1, minHeight: 0 }}>
        {/* Transcript */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--color-divider)", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px var(--space-4)", borderBottom: "1px solid var(--color-divider)", flex: "none" }}>
            <Kicker>Live transcript · diarized</Kicker>
            <span className="text-muted" style={{ fontSize: 11 }}>low-confidence spans flagged</span>
          </div>
          <div ref={scrollRef} className="scroll" style={{ flex: 1, padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
            {transcript.map((u, i) => {
              const you = u.who === "You";
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: you ? "flex-end" : "flex-start" }}>
                  <span className="text-muted" style={{ fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase" }}>
                    {u.who} · {u.ts}{u.low && "  · low confidence"}
                  </span>
                  <div style={{
                    maxWidth: "82%", padding: "9px 12px", fontSize: 13.5, lineHeight: 1.5,
                    border: `1px solid ${you ? "var(--color-accent)" : "var(--color-divider)"}`,
                    background: you ? "var(--color-accent-100)" : "var(--color-surface)",
                    fontStyle: u.low ? "italic" : undefined, opacity: u.low ? 0.72 : 1,
                    borderStyle: u.low ? "dashed" : "solid",
                  }}>
                    {u.text}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, padding: "11px var(--space-4)", borderTop: "1px solid var(--color-divider)", flex: "none" }}>
            <button className="btn btn-primary" onClick={() => setPlaying((p) => !p)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z" /></svg>
              {playing ? "Playing" : "Play session"}
            </button>
            <button className="btn btn-secondary" onClick={() => setPlaying(false)}>Pause</button>
            <button className="btn btn-secondary" onClick={() => { setPlaying(false); setSec(0); }}>Reset</button>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <Tag className="tag-neutral">Breakthrough</Tag><Tag className="tag-neutral">Resistance</Tag><Tag className="tag-neutral">+ Tag</Tag>
            </div>
          </div>
        </div>

        {/* Guidance / insight (hero) */}
        <div className="scroll" style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-4)", minHeight: 0, background: "color-mix(in srgb, var(--color-text) 2%, transparent)" }}>
          {crisis && (
            <Blueprint style={{ padding: "var(--space-4)", border: "1.5px solid #c0392b", background: state.esc.bg }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={state.esc.fg} strokeWidth="1.5"><path d="M12 3 2 20h20z" /><path d="M12 10v5M12 17.5v.01" /></svg>
                <h4 style={{ margin: 0, color: state.esc.fg }}>Crisis protocol — respond now</h4>
              </div>
              <p style={{ margin: "0 0 10px", fontSize: 13.5, lineHeight: 1.55 }}>
                Hopelessness &amp; passive-ideation language detected. Stay calm and present. This is not a clinical screen — route to real support.
              </p>
              <ol style={{ margin: "0 0 12px", paddingLeft: 18, fontSize: 13, lineHeight: 1.7 }}>
                <li>Acknowledge &amp; validate what was shared.</li>
                <li>Ask directly &amp; supportively about safety.</li>
                <li>Co-create a support step before the topic closes.</li>
              </ol>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn btn-primary" style={{ background: state.esc.fg, borderColor: state.esc.fg }}>Escalation contacts</button>
                <button className="btn btn-secondary">Crisis resources</button>
                <button className="btn btn-secondary">Flag mandatory follow-up</button>
              </div>
            </Blueprint>
          )}

          <Blueprint style={{ padding: "var(--space-4)" }}>
            <Kicker style={{ margin: "0 0 6px" }}>What the student is thinking</Kicker>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{cockpit.thinking}</p>
          </Blueprint>

          <Blueprint elev="sm" style={{ padding: "var(--space-4)", borderLeft: "3px solid var(--color-accent)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5"><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /><path d="M9 21h6M10 17v4M14 17v4" /></svg>
              <Kicker>Suggested next move</Kicker>
            </div>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.45, fontWeight: 500 }}>{cockpit.move}</p>
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }}>👍 Helpful</button>
              <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }}>Not now</button>
            </div>
          </Blueprint>

          <Blueprint style={{ padding: "var(--space-4)", borderLeft: `3px solid ${state.watch.fg}` }}>
            <Kicker style={{ margin: "0 0 6px", color: state.watch.fg }}>Avoid</Kicker>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.45 }}>{cockpit.avoid}</p>
          </Blueprint>

          <Blueprint style={{ padding: "var(--space-4)" }}>
            <Kicker style={{ margin: "0 0 10px" }}>Facet signals · live</Kicker>
            {liveFacets.map((f) => (
              <div key={f.n} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 15, width: 16, color: f.col }}>{f.arrow}</span>
                <span style={{ fontSize: 13, width: 150 }}>{f.n}</span>
                <div style={{ flex: 1, height: 6, background: "color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
                  <div style={{ height: "100%", width: `${f.int}%`, background: f.col }} />
                </div>
              </div>
            ))}
          </Blueprint>
        </div>

        {/* Analytics (hidden in minimal) */}
        {!minimal && (
          <div className="scroll" style={{ padding: "var(--space-4)", borderLeft: "1px solid var(--color-divider)", display: "flex", flexDirection: "column", gap: "var(--space-4)", minHeight: 0 }}>
            <Blueprint style={{ padding: "var(--space-4)" }}>
              <Kicker style={{ margin: "0 0 8px" }}>Affect timeline</Kicker>
              <svg viewBox="0 0 300 66" style={{ width: "100%", height: 66 }}>
                <line x1="0" y1="33" x2="300" y2="33" stroke="var(--color-divider)" strokeDasharray="3 3" />
                <polyline points={cockpit.affectPoly} fill="none" stroke="var(--color-accent)" strokeWidth="2" />
                {crisis && <circle cx={cockpit.affectLowX} cy={cockpit.affectLowY} r="4" fill="#c0392b" />}
              </svg>
              <div className="text-muted" style={{ fontSize: 10.5, display: "flex", justifyContent: "space-between" }}><span>calm</span><span>distress</span></div>
            </Blueprint>

            <Blueprint style={{ padding: "var(--space-4)" }}>
              <Kicker style={{ margin: "0 0 10px" }}>Talk ratio &amp; pacing</Kicker>
              <div style={{ display: "flex", height: 22, border: "1px solid var(--color-divider)", fontSize: 11, fontFamily: "var(--font-heading)" }}>
                <div style={{ width: `${cockpit.talkYou}%`, background: "var(--color-accent)", color: "var(--color-bg)", display: "grid", placeItems: "center" }}>You {cockpit.talkYou}%</div>
                <div style={{ flex: 1, display: "grid", placeItems: "center" }}>Student {cockpit.talkStu}%</div>
              </div>
              <div className="text-muted" style={{ fontSize: 11.5, marginTop: 8 }}>{cockpit.paceNote}</div>
            </Blueprint>

            <Blueprint style={{ padding: "var(--space-4)" }}>
              <Kicker style={{ margin: "0 0 10px" }}>Themes surfacing</Kicker>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {cockpit.themes.map((t) => <Tag key={t} className="tag-accent">{t}</Tag>)}
              </div>
            </Blueprint>

            <Blueprint style={{ padding: "var(--space-4)" }}>
              <Kicker style={{ margin: "0 0 6px" }}>Coverage this session</Kicker>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 28 }}>{cockpit.coverage}%</span>
                <span className="text-muted" style={{ fontSize: 11.5 }}>facets with data</span>
              </div>
              <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>BODY &amp; SOUL still thin — index held honest.</div>
            </Blueprint>
          </div>
        )}
      </div>
    </div>
  );
}
