import { useLocation, useNavigate } from "react-router-dom";
import { Blueprint, Kicker, Tag } from "@/components/Blueprint";
import { state, tierStyle, tierChipLabel, tierProseLabel } from "@/lib/state";
import { formatRelative, formatWeekdayDate, formatClock } from "@/lib/dates";
import { deriveProfileVisuals, deriveRadar, sessionDateLabel } from "@/lib/profileVisuals";
import { useAppData } from "@/context/AppDataContext";
import { useSession } from "@/context/SessionContext";
import {
  getCaseloadForCounsellor, getLatestSessionForStudent, listSessionsForStudent, LUCY_STUDENT_ID,
  type CaseloadRow, type SessionRecord,
} from "@/data/db";
import { PROFILE, CLIENT } from "./liveSession";

const toneCol = (tone: "esc" | "watch") => (tone === "esc" ? state.esc.fg : state.watch.fg);
const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
/** The shared demo domains carry "A · ", "B · " codes — plain and readable beats a lettered index here. */
const plainDomain = (name: string) => name.replace(/^[A-Z]\s*·\s*/, "");

export function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const appData = useAppData();
  const { result } = useSession();
  const studentId = (location.state as { studentId?: string } | null)?.studentId;

  // Opened from the Caseload → show that student's longitudinal profile.
  if (studentId) {
    const row = appData.identity.recordId
      ? getCaseloadForCounsellor(appData.identity.recordId).find((r) => r.student.id === studentId)
      : undefined;
    if (row) {
      // Lucy is the one student with a real, session-derived profile (from the Live
      // Cockpit's scripted intake) — show that instead of the shared demo template.
      if (row.student.id === LUCY_STUDENT_ID) {
        const latest = getLatestSessionForStudent(LUCY_STUDENT_ID);
        if (latest) return <SessionProfile result={{ themes: latest.themes }} />;
        return (
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)" }}>
            <h2 style={{ margin: 0 }}>{row.name}</h2>
            <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 14 }}>{row.student.code} · {row.student.dept}</p>
            <Blueprint style={{ padding: "var(--space-8)", textAlign: "center", marginTop: "var(--space-6)" }}>
              <p className="text-muted" style={{ margin: "0 0 14px", fontSize: 13.5 }}>No sessions recorded yet — her intake hasn't run.</p>
              <button className="btn btn-primary" onClick={() => navigate("/counsellor/cockpit")}>Go to Live Cockpit</button>
            </Blueprint>
          </div>
        );
      }
      return <CaseloadStudentProfile row={row} sessions={listSessionsForStudent(row.student.id)} />;
    }
  }

  // Opened from a completed live session (Review → Add to profile) → session baseline.
  if (result) return <SessionProfile result={{ themes: result.themes }} />;

  // No context → nothing to show yet.
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)" }}>
      <h2 style={{ margin: 0 }}>Student profile</h2>
      <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 14 }}>Open a student from your Caseload to see their profile.</p>
      <Blueprint style={{ padding: "var(--space-8)", textAlign: "center", marginTop: "var(--space-6)" }}>
        <p className="text-muted" style={{ margin: "0 0 14px", fontSize: 13.5 }}>No student selected.</p>
        <button className="btn btn-primary" onClick={() => navigate("/counsellor/caseload")}>Go to Caseload</button>
      </Blueprint>
    </div>
  );
}

/** The header every profile shares: photo-square, name/tags, and the index reading, top right. */
function ProfileHeader({
  initials, name, meta, tierLabel, tierColors, index, indexNote, trendBadge,
}: {
  initials: string; name: string; meta: string; tierLabel: string;
  tierColors: { background: string; color: string }; index: number; indexNote: string;
  trendBadge?: { label: string; color: string };
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-4)", marginBottom: "var(--space-5)" }}>
      <div style={{ width: 58, height: 58, border: "1px solid var(--color-divider)", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontSize: 22, flex: "none" }}>{initials}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>{name}</h2>
          <Tag style={tierColors}>{tierLabel}</Tag>
        </div>
        <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 13.5 }}>{meta}</p>
      </div>
      <Blueprint style={{ padding: "12px 16px", textAlign: "right" }}>
        <div className="text-muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em" }}>Wellness Index</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, justifyContent: "flex-end" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 40, lineHeight: 1 }}>{index}</span>
          {trendBadge && <span style={{ color: trendBadge.color, fontFamily: "var(--font-heading)", fontSize: 16 }}>{trendBadge.label}</span>}
        </div>
        <div className="text-muted" style={{ fontSize: 10.5 }}>{indexNote}</div>
      </Blueprint>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   A caseload student's longitudinal profile. Header, story, and every chart
   below are computed from this student's own caseNote + session history
   (see lib/profileVisuals.ts) — each student gets their own shape, not a
   template shared identically across all 8.
   ──────────────────────────────────────────────────────────────────────────── */
function CaseloadStudentProfile({ row, sessions }: { row: CaseloadRow; sessions: SessionRecord[] }) {
  const { trend, radar, domains, balance, themes: profileThemes } = deriveProfileVisuals(row, sessions);
  const up = row.trendDelta > 0;
  const trendCol = up ? "var(--color-accent)" : row.trendDelta < 0 ? state.esc.fg : "var(--color-neutral-600)";
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)" }}>
      <ProfileHeader
        initials={initialsOf(row.name)}
        name={row.name}
        meta={`${row.student.code} · ${row.student.dept} · ${row.lastSeenIso ? `last seen ${formatRelative(new Date(row.lastSeenIso))}` : "not yet seen"}`}
        tierLabel={tierChipLabel(row.tier)}
        tierColors={tierStyle(row.tier)}
        index={row.wellnessIndex}
        indexNote={row.reason}
        trendBadge={row.trendDelta !== 0 ? { label: `${up ? "▲" : "▼"} ${Math.abs(row.trendDelta)}`, color: trendCol } : undefined}
      />

      {/* Story so far — read this first, everything below is the evidence for it */}
      <Blueprint style={{ padding: "var(--space-4)", marginBottom: "var(--space-5)", background: "color-mix(in srgb, var(--color-accent) 6%, transparent)" }}>
        <Kicker style={{ margin: "0 0 6px" }}>Story so far · 20-second read</Kicker>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6 }}>
          {row.name} is <strong>{tierProseLabel(row.tier)}</strong> right now — {row.reason.toLowerCase()}. This is the counsellor's
          memory across every session with {row.name.split(" ")[0]}, so you walk in already briefed.
        </p>
      </Blueprint>

      {/* How they're doing over time */}
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "var(--space-5)", marginBottom: "var(--space-5)" }}>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 var(--space-3)" }}>Index over time</h4>
          <svg viewBox="0 0 300 130" style={{ width: "100%", height: 150 }}>
            <line x1="20" y1="10" x2="20" y2="110" stroke="var(--color-divider)" />
            <line x1="20" y1="110" x2="295" y2="110" stroke="var(--color-divider)" />
            <polyline points={trend.poly} fill="none" stroke="var(--color-accent)" strokeWidth="2" />
            {trend.points.map((p) => (
              <g key={p.label}>
                {p.event && <line x1={p.x} y1="14" x2={p.x} y2="110" stroke="#c0392b" strokeDasharray="2 2" opacity="0.5" />}
                <circle cx={p.x} cy={p.y} r="3.5" fill={p.fill} />
                <text x={p.x} y={p.ty} fontSize="9" fill="currentColor" textAnchor="middle" fontFamily="var(--font-heading)">{p.score}</text>
                <text x={p.x} y="124" fontSize="8" fill="currentColor" opacity="0.55" textAnchor="middle">{p.label}</text>
              </g>
            ))}
          </svg>
          <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>Dashed lines mark a dip worth remembering — an exam, a hard week.</div>
        </Blueprint>

        <Blueprint style={{ padding: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 var(--space-2)" }}>Overall pattern</h4>
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
        </Blueprint>
      </div>

      {/* Where things stand, area by area */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)", marginBottom: "var(--space-5)" }}>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 var(--space-3)" }}>Where things stand</h4>
          {domains.map((d) => (
            <div key={d.name} style={{ marginBottom: 10, opacity: d.op }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
                <span>{plainDomain(d.name)}</span>
                <span style={{ fontFamily: "var(--font-heading)" }}>{d.scoreLabel}</span>
              </div>
              <div style={{ height: 7, background: "color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
                <div style={{ height: "100%", width: `${d.score}%`, background: d.col }} />
              </div>
            </div>
          ))}
        </Blueprint>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Blueprint style={{ padding: "var(--space-4)" }}>
            <h4 style={{ margin: "0 0 var(--space-3)" }}>What's weighing on them vs. what's helping</h4>
            {balance.map((b) => (
              <div key={b.s} style={{ display: "grid", gridTemplateColumns: "34px 1fr 1fr", gap: 6, alignItems: "center", marginBottom: 8, fontSize: 11 }}>
                <span className="text-muted">{b.s}</span>
                <div style={{ display: "flex", justifyContent: "flex-end", height: 12, background: "color-mix(in srgb, var(--color-text) 6%, transparent)" }}>
                  <div style={{ width: `${b.d}%`, height: "100%", background: state.esc.fg }} />
                </div>
                <div style={{ height: 12, background: "color-mix(in srgb, var(--color-text) 6%, transparent)" }}>
                  <div style={{ width: `${b.p}%`, height: "100%", background: "var(--color-accent)" }} />
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5 }} className="text-muted">
              <span style={{ color: state.esc.fg }}>◀ weighing on them</span><span style={{ color: "var(--color-accent)" }}>helping ▶</span>
            </div>
          </Blueprint>
          <Blueprint style={{ padding: "var(--space-4)" }}>
            <h4 style={{ margin: "0 0 var(--space-3)" }}>What keeps coming up</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {profileThemes.map((t) => <Tag key={t.name} style={{ background: t.bg, color: t.fg }}>{t.name} · {t.count}</Tag>)}
            </div>
          </Blueprint>
        </div>
      </div>

      {/* Session history */}
      <Blueprint style={{ padding: "var(--space-4)" }}>
        <h4 style={{ margin: "0 0 var(--space-3)" }}>Every session so far</h4>
        <table className="table">
          <thead><tr><th>Session</th><th>Date</th><th>Index</th><th>What happened</th></tr></thead>
          <tbody>
            {[...sessions].sort((a, b) => a.atIso.localeCompare(b.atIso)).map((s, i, ordered) => {
              const prev = ordered[i - 1];
              const delta = prev ? s.index - prev.index : null;
              const flagged = s.readings.some((r) => r.tone === "esc");
              return (
                <tr key={s.id} style={{ cursor: "pointer" }}>
                  <td style={{ fontFamily: "var(--font-heading)" }}>S{i + 1}</td>
                  <td>{sessionDateLabel(s)}</td>
                  <td>
                    <span style={{ fontFamily: "var(--font-heading)" }}>{s.index}</span>
                    {delta !== null && delta !== 0 && (
                      <span style={{ fontSize: 11, marginLeft: 5, color: delta > 0 ? "var(--color-accent)" : state.esc.fg }}>
                        {delta > 0 ? "▲" : "▼"}{Math.abs(delta)}
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: 12.5 }}>{s.keyMomentText} {flagged && <Tag style={{ background: state.esc.bg, color: state.esc.fg, padding: "1px 6px" }}>flagged</Tag>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Blueprint>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Lucy's real, session-derived profile — the one student whose data actually
   comes from a recorded, analyzed conversation instead of the demo template.
   ──────────────────────────────────────────────────────────────────────────── */
function SessionProfile({ result }: { result: { themes: string[] } }) {
  const radar = deriveRadar(LUCY_STUDENT_ID, PROFILE.index);
  const history = listSessionsForStudent(LUCY_STUDENT_ID);
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)" }}>
      <ProfileHeader
        initials={CLIENT.initials}
        name={CLIENT.name}
        meta={`${CLIENT.code} · ${CLIENT.line} · ${history.length} session${history.length === 1 ? "" : "s"} recorded`}
        tierLabel="New · building baseline"
        tierColors={{ background: state.watch.bg, color: state.watch.fg }}
        index={PROFILE.index}
        indexNote="from her intake session — no trend yet"
      />

      {/* Story so far — read this first */}
      <Blueprint style={{ padding: "var(--space-4)", marginBottom: "var(--space-5)", background: "color-mix(in srgb, var(--color-accent) 6%, transparent)" }}>
        <Kicker style={{ margin: "0 0 6px" }}>Story so far · 20-second read</Kicker>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6 }}>{PROFILE.story}</p>
      </Blueprint>

      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "var(--space-5)", marginBottom: "var(--space-5)" }}>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 var(--space-3)" }}>Index over time</h4>
          <svg viewBox="0 0 300 130" style={{ width: "100%", height: 150 }}>
            <line x1="20" y1="10" x2="20" y2="110" stroke="var(--color-divider)" />
            <line x1="20" y1="110" x2="295" y2="110" stroke="var(--color-divider)" />
            <circle cx="40" cy={110 - PROFILE.index} r="4" fill="var(--color-accent)" />
            <text x="40" y={110 - PROFILE.index - 8} fontSize="10" fill="currentColor" textAnchor="middle" fontFamily="var(--font-heading)">{PROFILE.index}</text>
            <text x="40" y="124" fontSize="8" fill="currentColor" opacity="0.55" textAnchor="middle">Intake</text>
          </svg>
          <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>One session so far — the trend builds from here.</div>
        </Blueprint>

        <Blueprint style={{ padding: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 var(--space-2)" }}>Overall pattern</h4>
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
        </Blueprint>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)", marginBottom: "var(--space-5)" }}>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 var(--space-3)" }}>Where things stand</h4>
          {PROFILE.domains.map((d) => (
            <div key={d.name} style={{ marginBottom: 10, opacity: d.op }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
                <span>{plainDomain(d.name)}</span>
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
            <h4 style={{ margin: "0 0 var(--space-3)" }}>What's weighing on her vs. what's helping</h4>
            <div style={{ display: "grid", gridTemplateColumns: "34px 1fr 1fr", gap: 6, alignItems: "center", marginBottom: 8, fontSize: 11 }}>
              <span className="text-muted">Now</span>
              <div style={{ display: "flex", justifyContent: "flex-end", height: 12, background: "color-mix(in srgb, var(--color-text) 6%, transparent)" }}>
                <div style={{ width: `${PROFILE.distress}%`, height: "100%", background: state.esc.fg }} />
              </div>
              <div style={{ height: 12, background: "color-mix(in srgb, var(--color-text) 6%, transparent)" }}>
                <div style={{ width: `${PROFILE.protective}%`, height: "100%", background: "var(--color-accent)" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5 }} className="text-muted">
              <span style={{ color: state.esc.fg }}>◀ weighing on her</span><span style={{ color: "var(--color-accent)" }}>helping ▶</span>
            </div>
          </Blueprint>
          <Blueprint style={{ padding: "var(--space-4)" }}>
            <h4 style={{ margin: "0 0 var(--space-3)" }}>What came up this session</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {result.themes.map((t) => (
                <Tag key={t} style={t === "Hopelessness" ? { background: state.esc.bg, color: state.esc.fg } : { background: "var(--color-accent-100)", color: "var(--color-accent-800)" }}>{t}</Tag>
              ))}
            </div>
          </Blueprint>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: "var(--space-5)", marginBottom: "var(--space-5)" }}>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <Kicker style={{ margin: "0 0 8px" }}>Suggested focus, next time</Kicker>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, lineHeight: 1.7 }}>
            {PROFILE.focus.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </Blueprint>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 var(--space-2)" }}>Every session so far</h4>
          <p className="text-muted" style={{ margin: "0 0 10px", fontSize: 11 }}>Saved automatically each time a live session ends.</p>
          {history.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 13 }}>Nothing recorded yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map((s: SessionRecord, i) => (
                <div key={s.id} style={{ padding: "8px 0", borderTop: i > 0 ? "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)" : undefined }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span style={{ fontWeight: 500 }}>{s.sessionLabel}</span>
                    <span className="text-muted">{formatWeekdayDate(new Date(s.atIso))} · {formatClock(new Date(s.atIso))}</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: 11.5, fontStyle: "italic", marginTop: 2 }}>"{s.keyMomentText}" · {s.keyMomentTs}</div>
                </div>
              ))}
            </div>
          )}
        </Blueprint>
      </div>
    </div>
  );
}
