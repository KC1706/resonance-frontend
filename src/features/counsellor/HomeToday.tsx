import { useNavigate } from "react-router-dom";
import { Blueprint, StatCard, Kicker, Tag } from "@/components/Blueprint";
import { state, tierStyle } from "@/lib/state";
import { formatWeekdayDate, formatClock, greetingTimeOfDay } from "@/lib/dates";
import { useAppData } from "@/context/AppDataContext";
import {
  listAppointmentsForCounsellor, getCaseloadForCounsellor, getTodaysAppointments, getNeedsAttention,
} from "@/data/db";

const tierTag = (tier: "high" | "medium" | "low") => tierStyle(tier);

/** The one deeply-authored demo narrative (session transcript, facet deltas, radar) is Aarav's — see docs/V2_Platform_Plan.md §10. */
const HAS_FULL_STORY = new Set(["s-aarav"]);

export function HomeToday() {
  const navigate = useNavigate();
  const { actions, identity } = useAppData();
  const today = new Date();

  if (!identity.recordId) return null;
  const counsellorId = identity.recordId;

  const caseloadRows = getCaseloadForCounsellor(counsellorId, today);
  const todays = getTodaysAppointments(counsellorId, today);
  const needsAttention = getNeedsAttention(counsellorId, today);
  const pendingRequests = listAppointmentsForCounsellor(counsellorId).filter((a) => a.status === "requested").length;

  const counts = { high: 0, medium: 0, low: 0 };
  for (const r of caseloadRows) counts[r.tier]++;

  const upcomingToday = todays.filter((a) => new Date(a.startIso).getTime() > today.getTime());
  const next = upcomingToday[0];
  const nextRow = next ? caseloadRows.find((r) => r.student.id === next.studentId) : undefined;
  const minutesUntil = next ? Math.round((new Date(next.startIso).getTime() - today.getTime()) / 60000) : null;

  const statTiles = [
    { label: "Sessions today", value: String(todays.length), sub: `${todays.filter((a) => a.tier === "high").length} flagged`, color: undefined as string | undefined },
    { label: "Flagged students", value: String(counts.high), sub: "need attention", color: state.watch.fg },
    { label: "Action items", value: String(actions.length), sub: `${actions.filter((a) => a.due === "today").length} due today`, color: undefined },
    { label: "Booking requests", value: String(pendingRequests), sub: "waiting on you", color: pendingRequests > 0 ? "var(--color-accent)" : undefined },
  ];

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
        <div>
          <Kicker>{formatWeekdayDate(today)}</Kicker>
          <h2 style={{ margin: 0 }}>Good {greetingTimeOfDay(today)}, {identity.firstName}.</h2>
          <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 14 }}>
            You have {todays.length} session{todays.length === 1 ? "" : "s"} today.
            {needsAttention.length > 0 && ` ${needsAttention.length} student${needsAttention.length === 1 ? "" : "s"} need${needsAttention.length === 1 ? "s" : ""} attention before you start.`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/counsellor/cockpit")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 4l14 8-14 8z" /></svg>
          Start next session
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        {statTiles.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} color={s.color} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--space-6)" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Prep card */}
          {next && nextRow ? (
            <Blueprint elev="sm" style={{ padding: "var(--space-4)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
                <Kicker>Next session · {formatClock(new Date(next.startIso))}{minutesUntil !== null && minutesUntil >= 0 ? ` · in ${minutesUntil} min` : ""}</Kicker>
                <Tag style={tierTag(nextRow.tier)}>{nextRow.tier.toUpperCase()}</Tag>
              </div>
              <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start" }}>
                <div style={{ width: 52, height: 52, border: "1px solid var(--color-divider)", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontSize: 19, flex: "none" }}>
                  {nextRow.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <h4 style={{ margin: 0 }}>{nextRow.name}</h4>
                    <span className="text-muted" style={{ fontSize: 12 }}>{nextRow.student.code}</span>
                  </div>
                  <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-accent)", margin: "10px 0 4px" }}>
                    Story so far
                  </div>
                  {HAS_FULL_STORY.has(nextRow.student.id) ? (
                    <>
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
                    </>
                  ) : (
                    <p style={{ margin: "0 0 12px", fontSize: 13.5, lineHeight: 1.5 }}>
                      {nextRow.reason}. Index at {nextRow.wellnessIndex}, {nextRow.trendDelta > 0 ? "trending up" : nextRow.trendDelta < 0 ? "trending down" : "steady"}. Open the full profile for session history before you start.
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary" onClick={() => navigate("/counsellor/cockpit")}>Start session</button>
                    <button className="btn btn-secondary" onClick={() => navigate("/counsellor/profile", { state: { studentId: nextRow.student.id } })}>Review full profile</button>
                  </div>
                </div>
              </div>
            </Blueprint>
          ) : (
            <Blueprint style={{ padding: "var(--space-4)" }}>
              <p className="text-muted" style={{ margin: 0, fontSize: 13.5 }}>No more sessions today.</p>
            </Blueprint>
          )}

          {/* Today's schedule */}
          <Blueprint style={{ padding: "var(--space-4)" }}>
            <h4 style={{ margin: "0 0 var(--space-3)" }}>Today's schedule</h4>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {todays.length === 0 && <p className="text-muted" style={{ fontSize: 13, margin: "8px 0 0" }}>Nothing booked today.</p>}
              {todays.map((v) => {
                const row = caseloadRows.find((r) => r.student.id === v.studentId);
                return (
                  <div
                    key={v.id}
                    onClick={() => navigate("/counsellor/profile", { state: { studentId: v.studentId } })}
                    style={{ cursor: "pointer", display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 12, alignItems: "center", padding: "9px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)" }}
                  >
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: 15 }}>{formatClock(new Date(v.startIso))}</span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{v.studentName}</div>
                      <div className="text-muted" style={{ fontSize: 11.5 }}>{row?.student.code}</div>
                    </div>
                    <Tag style={tierTag(v.tier)}>{v.tier.toUpperCase()}</Tag>
                  </div>
                );
              })}
            </div>
          </Blueprint>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Blueprint style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
              <h4 style={{ margin: 0 }}>Your caseload at a glance</h4>
              <button className="btn btn-secondary" style={{ fontSize: 11.5, padding: "4px 10px" }} onClick={() => navigate("/counsellor/caseload")}>See all</button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              <Tag style={tierStyle("high")}>{counts.high} need attention soon</Tag>
              <Tag style={tierStyle("medium")}>{counts.medium} keeping an eye on</Tag>
              <Tag style={tierStyle("low")}>{counts.low} doing okay</Tag>
            </div>
            {pendingRequests > 0 && (
              <div
                onClick={() => navigate("/counsellor/calendar")}
                style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)", fontSize: 13 }}
              >
                <span>{pendingRequests} booking {pendingRequests === 1 ? "request" : "requests"} waiting on you</span>
                <span style={{ color: "var(--color-accent)" }}>Review →</span>
              </div>
            )}
          </Blueprint>

          <Blueprint style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: "var(--space-3)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={state.esc.fg} strokeWidth="1.5"><path d="M12 3 2 20h20z" /><path d="M12 10v5M12 17.5v.01" /></svg>
              <h4 style={{ margin: 0 }}>Needs attention</h4>
            </div>
            <p className="text-muted" style={{ margin: "0 0 12px", fontSize: 12 }}>
              Trending down but not booked — the quiet decliners the system catches for you.
            </p>
            {needsAttention.length === 0 && <p className="text-muted" style={{ fontSize: 12.5 }}>No one's slipping through right now.</p>}
            {needsAttention.map((n) => (
              <div
                key={n.student.id}
                onClick={() => navigate("/counsellor/profile", { state: { studentId: n.student.id } })}
                style={{ cursor: "pointer", padding: "10px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{n.name} · {n.student.code}</div>
                  <div className="text-muted" style={{ fontSize: 11.5 }}>{n.reason}</div>
                </div>
                <span style={{ fontFamily: "var(--font-heading)", color: state.esc.fg, fontSize: 14 }}>▼{Math.abs(n.trendDelta)}</span>
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
