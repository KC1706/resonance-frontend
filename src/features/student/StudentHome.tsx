import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Blueprint, Kicker } from "@/components/Blueprint";
import { useAppData } from "@/context/AppDataContext";
import { formatClock, formatWeekdayDate } from "@/lib/dates";
import {
  listAppointmentsForStudent, addCheckin, getCheckinForToday, type CheckinMood,
} from "@/data/db";

const MOODS: CheckinMood[] = ["Good", "Okay", "Mixed", "Heavy"];

/**
 * The one landing screen: warmth, next session, a mood tap, and support
 * that's never more than a click away — folded in here rather than living
 * on its own page, so help is reachable the moment a student lands, not one
 * more tab to find. (Merges the old separate "Get help now" screen.)
 */
export function StudentHome() {
  const navigate = useNavigate();
  const { identity } = useAppData();
  const [supportOpen, setSupportOpen] = useState(false);
  const [, forceRerender] = useState(0);

  const upcoming = identity.recordId
    ? listAppointmentsForStudent(identity.recordId)
        .filter((a) => a.status === "accepted" && new Date(a.startIso).getTime() > Date.now())
        .sort((a, b) => a.startIso.localeCompare(b.startIso))
    : [];
  const next = upcoming[0];
  const todaysCheckin = identity.recordId ? getCheckinForToday(identity.recordId) : null;

  function submitCheckin(mood: CheckinMood) {
    if (!identity.recordId) return;
    addCheckin(identity.recordId, mood);
    forceRerender((n) => n + 1);
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "var(--space-8)" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 38 }}>Hi {identity.firstName}.</h1>
      <p className="text-muted" style={{ margin: "0 0 var(--space-6)", fontSize: 15 }}>Your space. You decide what's shared.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <Blueprint style={{ padding: "var(--space-4)", background: "color-mix(in srgb, var(--color-accent) 7%, transparent)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5"><path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z" /></svg>
            <h4 style={{ margin: 0 }}>Need support right now?</h4>
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 13.5 }}>You can reach a person any time — no forms, no waiting.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => navigate("/student/messages")}>Message my counsellor</button>
            <button className="btn btn-secondary" onClick={() => setSupportOpen((v) => !v)}>
              {supportOpen ? "Fewer options" : "More ways to get help"}
            </button>
          </div>
          {supportOpen && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid color-mix(in srgb, var(--color-text) 10%, transparent)", display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 6 }}>Steady yourself in a moment</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }}>Box breathing · 2 min</button>
                  <button className="btn btn-secondary" style={{ flex: 1 }}>5-4-3-2-1 grounding</button>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>Trusted contact</div>
                  <div className="text-muted" style={{ fontSize: 11.5 }}>Choose one person we can help you reach.</div>
                </div>
                <button className="btn btn-secondary">Set contact</button>
              </div>
            </div>
          )}
        </Blueprint>

        <Blueprint style={{ padding: "var(--space-4)" }}>
          <Kicker>Next session</Kicker>
          {next ? (
            <>
              <h4 style={{ margin: "2px 0" }}>{formatWeekdayDate(new Date(next.startIso))} · {formatClock(new Date(next.startIso))} · Dr. Priya Das</h4>
              <p className="text-muted" style={{ margin: "0 0 12px", fontSize: 12.5 }}>
                {next.pendingRescheduleIso
                  ? `Asked to move to ${formatWeekdayDate(new Date(next.pendingRescheduleIso))} · ${formatClock(new Date(next.pendingRescheduleIso))} — waiting on your counsellor.`
                  : "Looking forward to seeing you."}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" onClick={() => navigate("/student/messages")}>Message counsellor</button>
                <button className="btn btn-secondary" onClick={() => navigate("/student/sessions")}>Reschedule</button>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted" style={{ margin: "2px 0 12px", fontSize: 13 }}>Nothing booked yet.</p>
              <button className="btn btn-secondary" onClick={() => navigate("/student/sessions")}>Book a session</button>
            </>
          )}
        </Blueprint>
      </div>

      <Blueprint style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <h4 style={{ margin: "0 0 4px" }}>How's today feeling?</h4>
        {todaysCheckin ? (
          <p className="text-muted" style={{ margin: 0, fontSize: 13 }}>You've already checked in today — feeling {todaysCheckin.mood.toLowerCase()}. Come back tomorrow.</p>
        ) : (
          <>
            <p className="text-muted" style={{ margin: "0 0 12px", fontSize: 12.5 }}>Just for you, unless you choose to share it.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {MOODS.map((m) => <button key={m} className="btn btn-secondary" style={{ flex: 1 }} onClick={() => submitCheckin(m)}>{m}</button>)}
            </div>
          </>
        )}
      </Blueprint>

      <Blueprint style={{ padding: "var(--space-4)" }}>
        <h4 style={{ margin: "0 0 4px" }}>Your progress</h4>
        <p className="text-muted" style={{ margin: "0 0 12px", fontSize: 12.5 }}>What you've been working on, and what might help — all in one place.</p>
        <button className="btn btn-secondary" onClick={() => navigate("/student/progress")}>Open my progress</button>
      </Blueprint>
    </div>
  );
}
