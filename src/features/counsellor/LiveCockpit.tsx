import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Blueprint, Kicker, Tag } from "@/components/Blueprint";
import { state } from "@/lib/state";
import { useSessionPlayback } from "@/hooks/useSessionPlayback";
import { useSession } from "@/context/SessionContext";
import { deriveState, SESSION_RESULT, SESSION_END, CLIENT } from "./liveSession";

const SAMPLE_SRC = "/lucy-session.mp3";

const safetyChip: Record<string, { fg: string; bg: string; bd: string; label: string }> = {
  stable: { fg: state.ok.fg, bg: state.ok.bg, bd: state.ok.bd, label: "Stable" },
  watch: { fg: state.watch.fg, bg: state.watch.bg, bd: state.watch.bd, label: "Watch" },
  escalate: { fg: state.esc.fg, bg: state.esc.bg, bd: state.esc.bd, label: "Escalate" },
};

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function LiveCockpit() {
  const navigate = useNavigate();
  const { complete, clear } = useSession();
  const { audioRef, status, time, load, start, pause, reset, seek } = useSessionPlayback();
  const [minimal, setMinimal] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const live = deriveState(time);
  const chip = safetyChip[live.safety];
  const sev = live.safety === "escalate"
    ? { fg: state.esc.fg, stroke: "#c0392b", bg: state.esc.bg, title: "Crisis protocol — respond now",
        lead: "Hopelessness & passive-ideation language detected. Stay calm and present. This is not a clinical screen — route to real support." }
    : { fg: state.watch.fg, stroke: state.watch.fg, bg: state.watch.bg, title: "Safety check — passive hopelessness",
        lead: "Passive hopelessness and worthlessness detected (“what's the point… I don't deserve to be here”). Stay calm and present; check safety directly and supportively. Not a clinical screen — route to support if risk rises." };

  // Once the scripted session finishes, persist its result so Review + Profile
  // generate from it.
  useEffect(() => {
    if (status === "done") complete(SESSION_RESULT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function onPickFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    load(URL.createObjectURL(file));
  }
  function useSample() {
    setFileName("sample-session.mp3");
    load(SAMPLE_SRC);
  }
  function endAndReview() {
    complete(SESSION_RESULT);
    navigate("/counsellor/review");
  }
  function newSession() {
    clear();
    reset();
    setFileName("");
    if (audioRef.current) audioRef.current.removeAttribute("src");
    window.location.reload(); // clean slate for a fresh demo run
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Hidden audio element — the master clock */}
      <audio ref={audioRef} preload="auto" />

      {/* ── Upload gate ──────────────────────────────────────────────── */}
      {status === "empty" ? (
        <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "var(--space-8)" }}>
          <div style={{ maxWidth: 560, width: "100%" }}>
            <Kicker>Live Session Cockpit</Kicker>
            <h2 style={{ margin: "4px 0 6px" }}>Start a session from a recording</h2>
            <p className="text-muted" style={{ margin: "0 0 var(--space-6)", fontSize: 14 }}>
              Load a recorded conversation and press play — the cockpit runs its analysis in sync with
              the audio, exactly as it would live.
            </p>
            <Blueprint style={{ padding: "var(--space-8)", textAlign: "center", borderStyle: "dashed" }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" style={{ margin: "0 auto" }}>
                <path d="M12 15V4m0 0L8 8m4-4 4 4M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
              </svg>
              <h4 style={{ margin: "12px 0 4px" }}>Upload a session recording</h4>
              <p className="text-muted" style={{ margin: "0 0 14px", fontSize: 12.5 }}>Any audio file · it stays on your device</p>
              <input ref={fileInputRef} type="file" accept="audio/*" onChange={onPickFile} style={{ display: "none" }} />
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>Choose audio file</button>
                <button className="btn btn-secondary" onClick={useSample}>Use sample recording</button>
              </div>
            </Blueprint>
          </div>
        </div>
      ) : (
        <>
          {/* ── Session bar ──────────────────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-3) var(--space-6)", borderBottom: "1px solid var(--color-divider)", flex: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ position: "relative", width: 9, height: 9 }}>
                <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: status === "playing" ? "#c0392b" : "var(--color-neutral-500)", animation: status === "playing" ? "rec 1.4s infinite" : "none" }} />
              </span>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 14 }}>
                {status === "playing" ? "LIVE" : status === "done" ? "ENDED" : status === "paused" ? "PAUSED" : "READY"}
              </span>
            </div>
            <div style={{ width: 1, height: 20, background: "var(--color-divider)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, border: "1px solid var(--color-divider)", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontSize: 12 }}>{CLIENT.initials}</div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{CLIENT.name} · {CLIENT.code}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>{CLIENT.sessionLabel}</div>
              </div>
            </div>
            <Tag className="tag-accent" style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" /></svg>Consent active
            </Tag>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 15, marginLeft: "auto" }}>{fmt(time)}</span>
            <div style={{ width: 1, height: 20, background: "var(--color-divider)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", border: `1px solid ${chip.bd}`, background: chip.bg }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: chip.fg }} />
              <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: chip.fg, fontWeight: 500 }}>Safety · {chip.label}</span>
            </div>
            <div className="seg" style={{ marginLeft: 4 }}>
              <label className="seg-opt"><input type="radio" name="mode" checked={!minimal} onChange={() => setMinimal(false)} />Full</label>
              <label className="seg-opt"><input type="radio" name="mode" checked={minimal} onChange={() => setMinimal(true)} />Minimal</label>
            </div>
            <button className="btn btn-secondary" onClick={endAndReview}>End &amp; review →</button>
          </div>

          {/* seek bar — drag to jump anywhere in the session */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px var(--space-6)", borderBottom: "1px solid var(--color-divider)", flex: "none" }}>
            <span className="text-muted" style={{ fontSize: 11, fontFamily: "var(--font-heading)", width: 40 }}>{fmt(time)}</span>
            <input
              type="range" min={0} max={SESSION_END} step={1} value={Math.min(time, SESSION_END)}
              onChange={(e) => seek(Number(e.target.value))}
              style={{ flex: 1, accentColor: "var(--color-accent)", cursor: "pointer" }}
            />
            <span className="text-muted" style={{ fontSize: 11, fontFamily: "var(--font-heading)", width: 40, textAlign: "right" }}>{fmt(SESSION_END)}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: minimal ? "minmax(0,1.4fr) minmax(0,1fr)" : "minmax(0,1.05fr) minmax(0,1fr) 300px", flex: 1, minHeight: 0 }}>
            {/* Transcript */}
            <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--color-divider)", minHeight: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px var(--space-4)", borderBottom: "1px solid var(--color-divider)", flex: "none" }}>
                <Kicker>Live transcript · diarized</Kicker>
                <span className="text-muted" style={{ fontSize: 11 }}>low-confidence spans flagged</span>
              </div>
              <div className="scroll" style={{ flex: 1, padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
                {live.transcript.length === 0 && (
                  <div className="text-muted" style={{ margin: "auto", textAlign: "center", fontSize: 13 }}>
                    {status === "ready" ? "Press Start session to begin." : "Listening…"}
                  </div>
                )}
                {live.transcript.map((u, i) => {
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
                {status === "playing" && live.transcript.length > 0 && (
                  <div className="text-muted" style={{ fontSize: 11, alignSelf: "flex-start" }}>· · ·</div>
                )}
              </div>
              {/* Playback controls */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "11px var(--space-4)", borderTop: "1px solid var(--color-divider)", flex: "none" }}>
                {(status === "ready" || status === "paused") && (
                  <button className="btn btn-primary" onClick={start}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z" /></svg>
                    {status === "paused" ? "Resume" : "Start session"}
                  </button>
                )}
                {status === "playing" && (
                  <button className="btn btn-secondary" onClick={pause}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4h4v16H7zM13 4h4v16h-4z" /></svg>Pause
                  </button>
                )}
                {status === "done" && (
                  <button className="btn btn-primary" onClick={endAndReview}>End &amp; review →</button>
                )}
                <button className="btn btn-secondary" onClick={reset}>Reset</button>
                {fileName && <span className="text-muted" style={{ fontSize: 11, marginLeft: 4 }}>♪ {fileName}</span>}
                <button className="btn btn-ghost" style={{ marginLeft: "auto", fontSize: 11 }} onClick={newSession}>↺ New upload</button>
              </div>
            </div>

            {/* Guidance / insight (hero) */}
            <div className="scroll" style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-4)", minHeight: 0, background: "color-mix(in srgb, var(--color-text) 2%, transparent)" }}>
              {live.crisis && (
                <Blueprint style={{ padding: "var(--space-4)", border: `1.5px solid ${sev.stroke}`, background: sev.bg }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={sev.fg} strokeWidth="1.5"><path d="M12 3 2 20h20z" /><path d="M12 10v5M12 17.5v.01" /></svg>
                    <h4 style={{ margin: 0, color: sev.fg }}>{sev.title}</h4>
                  </div>
                  <p style={{ margin: "0 0 10px", fontSize: 13.5, lineHeight: 1.55 }}>{sev.lead}</p>
                  <ol style={{ margin: "0 0 12px", paddingLeft: 18, fontSize: 13, lineHeight: 1.7 }}>
                    <li>Acknowledge &amp; validate what was shared.</li>
                    <li>Ask directly &amp; supportively about safety.</li>
                    <li>Co-create a support step before the topic closes.</li>
                  </ol>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="btn btn-primary" style={{ background: sev.fg, borderColor: sev.fg }}>Escalation contacts</button>
                    <button className="btn btn-secondary">Crisis resources</button>
                    <button className="btn btn-secondary">Flag mandatory follow-up</button>
                  </div>
                </Blueprint>
              )}

              <Blueprint style={{ padding: "var(--space-4)" }}>
                <Kicker style={{ margin: "0 0 6px" }}>What the student is thinking</Kicker>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, opacity: live.thinking ? 1 : 0.4 }}>{live.thinking || "Listening for the first signals…"}</p>
              </Blueprint>

              <Blueprint elev="sm" style={{ padding: "var(--space-4)", borderLeft: "3px solid var(--color-accent)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5"><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /><path d="M9 21h6M10 17v4M14 17v4" /></svg>
                  <Kicker>Suggested next move</Kicker>
                </div>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.45, fontWeight: 500, opacity: live.move ? 1 : 0.4 }}>{live.move || "—"}</p>
                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }}>👍 Helpful</button>
                  <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }}>Not now</button>
                </div>
              </Blueprint>

              {live.avoid && (
                <Blueprint style={{ padding: "var(--space-4)", borderLeft: `3px solid ${state.watch.fg}` }}>
                  <Kicker style={{ margin: "0 0 6px", color: state.watch.fg }}>Avoid</Kicker>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.45 }}>{live.avoid}</p>
                </Blueprint>
              )}

              <Blueprint style={{ padding: "var(--space-4)" }}>
                <Kicker style={{ margin: "0 0 10px" }}>Facet signals · live</Kicker>
                {live.facets.length === 0 && <p className="text-muted" style={{ margin: 0, fontSize: 12.5 }}>No signals yet — building coverage.</p>}
                {live.facets.map((f) => (
                  <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: 15, width: 16, color: f.col }}>{f.arrow}</span>
                    <span style={{ fontSize: 13, width: 150 }}>{f.name}</span>
                    <div style={{ flex: 1, height: 6, background: "color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
                      <div style={{ height: "100%", width: `${f.int}%`, background: f.col, transition: "width .4s ease" }} />
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
                    {live.affect.length > 1 && (
                      <polyline points={live.affect.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="var(--color-accent)" strokeWidth="2" />
                    )}
                    {live.crisis && live.affect.length > 0 && (
                      <circle cx={live.affect[live.affect.length - 1].x} cy={live.affect[live.affect.length - 1].y} r="4" fill="#c0392b" />
                    )}
                  </svg>
                  <div className="text-muted" style={{ fontSize: 10.5, display: "flex", justifyContent: "space-between" }}><span>calm</span><span>distress</span></div>
                </Blueprint>

                <Blueprint style={{ padding: "var(--space-4)" }}>
                  <Kicker style={{ margin: "0 0 10px" }}>Talk ratio &amp; pacing</Kicker>
                  <div style={{ display: "flex", height: 22, border: "1px solid var(--color-divider)", fontSize: 11, fontFamily: "var(--font-heading)" }}>
                    <div style={{ width: `${live.talkYou}%`, background: "var(--color-accent)", color: "var(--color-bg)", display: "grid", placeItems: "center", transition: "width .4s ease", overflow: "hidden" }}>You {live.talkYou}%</div>
                    <div style={{ flex: 1, display: "grid", placeItems: "center" }}>Student {live.talkStu}%</div>
                  </div>
                  <div className="text-muted" style={{ fontSize: 11.5, marginTop: 8 }}>
                    {live.talkYou <= 40 ? "Good balance — you're leaving him room." : "You're holding the floor — make space."}
                  </div>
                </Blueprint>

                <Blueprint style={{ padding: "var(--space-4)" }}>
                  <Kicker style={{ margin: "0 0 10px" }}>Themes surfacing</Kicker>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {live.themes.length === 0 && <span className="text-muted" style={{ fontSize: 12 }}>—</span>}
                    {live.themes.map((t) => <Tag key={t} className="tag-accent">{t}</Tag>)}
                  </div>
                </Blueprint>

                <Blueprint style={{ padding: "var(--space-4)" }}>
                  <Kicker style={{ margin: "0 0 6px" }}>Coverage this session</Kicker>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: 28 }}>{live.coverage}%</span>
                    <span className="text-muted" style={{ fontSize: 11.5 }}>facets with data</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>BODY &amp; SOUL still thin — index held honest.</div>
                </Blueprint>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
