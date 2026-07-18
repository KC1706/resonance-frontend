import { useState } from "react";
import { Blueprint, Kicker, Tag } from "@/components/Blueprint";
import { state } from "@/lib/state";
import { useAppData } from "@/context/AppDataContext";
import { useDialog } from "@/context/DialogContext";
import {
  getWeekSlots, requestAppointment, withdrawRequest, cancelConfirmedAppointment, listAppointmentsForStudent,
  requestReschedule, withdrawRescheduleRequest,
  addJournalEntry, listJournalEntries,
} from "@/data/db";
import { formatClock, formatWeekdayDate } from "@/lib/dates";

const apptTag = (status: string) => {
  if (status === "accepted") return { background: "var(--color-accent-100)", color: "var(--color-accent-800)" };
  if (status === "requested") return { background: state.watch.bg, color: state.watch.fg };
  return { background: "var(--color-neutral-100)", color: "var(--color-neutral-800)" };
};

export function StudentSessions() {
  const { identity } = useAppData();
  const [, forceRerender] = useState(0);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const dialog = useDialog();

  if (!identity.assignedCounsellorId || !identity.recordId) {
    return (
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "var(--space-8)" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 34 }}>My sessions</h1>
        <Blueprint style={{ padding: "var(--space-4)", marginTop: "var(--space-4)" }}>
          <p style={{ margin: 0, fontSize: 13.5 }}>You'll be matched with a counsellor soon — booking opens up once you are.</p>
        </Blueprint>
      </div>
    );
  }

  const myAppointments = listAppointmentsForStudent(identity.recordId).filter((a) => a.status !== "cancelled" && a.status !== "declined");
  const upcoming = myAppointments.filter((a) => new Date(a.startIso).getTime() > Date.now()).sort((a, b) => a.startIso.localeCompare(b.startIso));
  const past = myAppointments.filter((a) => new Date(a.startIso).getTime() <= Date.now());
  const days = getWeekSlots(identity.assignedCounsellorId);
  const alreadyRequestedTimes = new Set(myAppointments.map((a) => a.startIso));
  const reschedulingAppt = reschedulingId ? upcoming.find((a) => a.id === reschedulingId) : undefined;

  async function book(startIso: string) {
    const ok = await dialog.confirm(
      `${formatWeekdayDate(new Date(startIso))} at ${formatClock(new Date(startIso))}`,
      { title: "Request this time?", confirmLabel: "Request" },
    );
    if (!ok) return;
    requestAppointment(identity.recordId!, identity.assignedCounsellorId!, startIso);
    forceRerender((n) => n + 1);
  }

  async function submitReschedule(startIso: string) {
    if (!reschedulingId) return;
    const ok = await dialog.confirm(
      `Ask to move this session to ${formatWeekdayDate(new Date(startIso))} at ${formatClock(new Date(startIso))}?`,
      { title: "Request reschedule?", confirmLabel: "Request" },
    );
    if (!ok) return;
    requestReschedule(reschedulingId, startIso);
    setReschedulingId(null);
    forceRerender((n) => n + 1);
  }

  async function cancel(id: string, status: string) {
    if (status === "accepted") {
      const reason = await dialog.prompt("This is sent to your counsellor as the reason.", {
        title: "Cancel this confirmed session", placeholder: "Reason for cancelling…", confirmLabel: "Cancel session", destructive: true,
      });
      if (!reason) return;
      cancelConfirmedAppointment(id, reason, "student");
    } else {
      const ok = await dialog.confirm("You can request another time any time.", { title: "Withdraw this request?", confirmLabel: "Withdraw" });
      if (!ok) return;
      withdrawRequest(id);
    }
    forceRerender((n) => n + 1);
  }

  async function cancelReschedule(id: string) {
    const ok = await dialog.confirm("Your original time stays as it is.", { title: "Withdraw reschedule request?", confirmLabel: "Withdraw" });
    if (!ok) return;
    withdrawRescheduleRequest(id);
    forceRerender((n) => n + 1);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "var(--space-8)" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 34 }}>My sessions</h1>
      <p className="text-muted" style={{ margin: "0 0 var(--space-6)", fontSize: 14 }}>Book, join, or reschedule with your counsellor.</p>

      <Blueprint style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <Kicker>Upcoming</Kicker>
        {upcoming.length === 0 && <p className="text-muted" style={{ fontSize: 13, margin: "8px 0 0" }}>Nothing booked yet — pick a time below.</p>}
        {upcoming.map((a) => (
          <div key={a.id} style={{ padding: "8px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0, fontSize: 14 }}>{formatWeekdayDate(new Date(a.startIso))} · {formatClock(new Date(a.startIso))} · Dr. Priya Das</h4>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Tag style={apptTag(a.status)}>{a.status === "accepted" ? "Confirmed" : "Waiting on counsellor"}</Tag>
                {a.status === "accepted" && !a.pendingRescheduleIso && (
                  <button className="btn btn-secondary" onClick={() => setReschedulingId(reschedulingId === a.id ? null : a.id)}>
                    {reschedulingId === a.id ? "Cancel reschedule" : "Reschedule"}
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => cancel(a.id, a.status)}>Cancel</button>
              </div>
            </div>
            {a.pendingRescheduleIso && (
              <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }}>
                <span className="text-muted">
                  Asked to move to {formatWeekdayDate(new Date(a.pendingRescheduleIso))} · {formatClock(new Date(a.pendingRescheduleIso))} — waiting on your counsellor
                </span>
                <button className="btn btn-secondary" style={{ fontSize: 11.5, padding: "3px 8px" }} onClick={() => cancelReschedule(a.id)}>Withdraw</button>
              </div>
            )}
          </div>
        ))}
      </Blueprint>

      <Blueprint style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Kicker>
            {reschedulingAppt
              ? `Pick a new time for ${formatWeekdayDate(new Date(reschedulingAppt.startIso))} · ${formatClock(new Date(reschedulingAppt.startIso))}`
              : "Book a time"}
          </Kicker>
          {reschedulingAppt && (
            <button className="btn btn-secondary" style={{ fontSize: 11.5, padding: "3px 8px" }} onClick={() => setReschedulingId(null)}>Cancel</button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginTop: 8 }}>
          {Object.entries(days).map(([dayKey, slots]) => (
            <div key={dayKey}>
              <div className="text-muted" style={{ fontSize: 11, marginBottom: 4 }}>{formatWeekdayDate(new Date(dayKey)).split(" · ")[0].slice(0, 3)} {new Date(dayKey).getDate()}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {slots.length === 0 && <span className="text-muted" style={{ fontSize: 10.5 }}>—</span>}
                {slots.map((slot) => {
                  // A slot can hold more than one confirmed student (e.g. a group session) — only
                  // a duplicate request from this same student is actually blocked here.
                  const already = !reschedulingAppt && alreadyRequestedTimes.has(slot.startIso);
                  const busy = slot.pending.length + slot.confirmed.length > 0;
                  return (
                    <button
                      key={slot.startIso}
                      className="btn btn-secondary"
                      disabled={already}
                      onClick={() => (reschedulingAppt ? submitReschedule(slot.startIso) : book(slot.startIso))}
                      title={already ? "You've already requested this time" : busy ? `${slot.pending.length + slot.confirmed.length} other student(s) also have this time` : undefined}
                      style={{ fontSize: 11.5, padding: "4px 2px", opacity: already ? 0.4 : 1 }}
                    >
                      {formatClock(new Date(slot.startIso))}{!already && busy ? " •" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Blueprint>

      <Blueprint style={{ padding: "var(--space-4)" }}>
        <Kicker>Past</Kicker>
        {past.length === 0 && <p className="text-muted" style={{ fontSize: 13, margin: "8px 0 0" }}>No past sessions yet.</p>}
        {past.map((a) => (
          <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)", fontSize: 13 }}>
            <span>{formatWeekdayDate(new Date(a.startIso))} · {formatClock(new Date(a.startIso))}</span>
            <span className="text-muted">{a.status}</span>
          </div>
        ))}
      </Blueprint>
    </div>
  );
}

export function StudentCheckin() {
  const { identity } = useAppData();
  const [draft, setDraft] = useState("");
  const [, forceRerender] = useState(0);

  const entries = identity.recordId ? listJournalEntries(identity.recordId) : [];

  function save() {
    if (!identity.recordId || !draft.trim()) return;
    addJournalEntry(identity.recordId, draft.trim());
    setDraft("");
    forceRerender((n) => n + 1);
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "var(--space-8)" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 34 }}>Check-in &amp; journal</h1>
      <p className="text-muted" style={{ margin: "0 0 var(--space-6)", fontSize: 14 }}>Optional and pressure-free — no streaks, no targets.</p>
      <Blueprint style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <h4 style={{ margin: "0 0 8px" }}>A few words, if you like</h4>
        <textarea
          className="input" style={{ minHeight: 120 }}
          placeholder="This stays private unless you choose to share it with your counsellor."
          value={draft} onChange={(e) => setDraft(e.target.value)}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <span className="text-muted" style={{ fontSize: 11.5 }}>Private by default</span>
          <button className="btn btn-primary" onClick={save} disabled={!draft.trim()}>Save</button>
        </div>
      </Blueprint>

      <Blueprint style={{ padding: "var(--space-4)" }}>
        <Kicker>Past entries</Kicker>
        {entries.length === 0 && <p className="text-muted" style={{ fontSize: 13, margin: "8px 0 0" }}>Nothing written yet.</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          {entries.map((e) => (
            <div key={e.id} style={{ padding: "10px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
              <div className="text-muted" style={{ fontSize: 11, marginBottom: 4 }}>
                {formatWeekdayDate(new Date(e.atIso))} · {formatClock(new Date(e.atIso))}
              </div>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{e.text}</p>
            </div>
          ))}
        </div>
      </Blueprint>
    </div>
  );
}

/** Merges the old separate "Resources" screen in — one continuous, warm story instead of two stops. */
export function StudentProgress() {
  const { studentStrengths, studentRes } = useAppData();
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "var(--space-8)" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 34 }}>My progress</h1>
      <p className="text-muted" style={{ margin: "0 0 var(--space-6)", fontSize: 14 }}>This is about effort and self-awareness — not scores.</p>
      <Blueprint style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <h4 style={{ margin: "0 0 var(--space-3)" }}>You've been showing up</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {studentStrengths.map((g) => <Tag key={g} className="tag-accent">{g}</Tag>)}
        </div>
      </Blueprint>
      <Blueprint style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <h4 style={{ margin: "0 0 var(--space-3)" }}>Gentle milestones</h4>
        <div style={{ fontSize: 13, lineHeight: 1.8 }}>
          A steadier sleep routine · set with Dr. Das<br />Naming what's hard out loud · you did this in your last session
        </div>
        <p className="text-muted" style={{ fontSize: 11, margin: "12px 0 0" }}>You'll never see a score or risk rating here — that's by design.</p>
      </Blueprint>

      <h3 style={{ margin: "var(--space-2) 0 var(--space-3)" }}>Things that might help</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-4)" }}>
        {studentRes.map((r) => (
          <Blueprint key={r.t} style={{ padding: "var(--space-4)" }}>
            <h4 style={{ margin: "0 0 4px" }}>{r.t}</h4>
            <p className="text-muted" style={{ margin: 0, fontSize: 12.5 }}>{r.d}</p>
          </Blueprint>
        ))}
      </div>
      {/* <Blueprint style={{ padding: "12px var(--space-4)", marginTop: "var(--space-4)", display: "flex", alignItems: "center", gap: 10, background: "color-mix(in srgb, var(--color-accent) 7%, transparent)" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 13.5 }}>Peer support circles</div>
          <div className="text-muted" style={{ fontSize: 12 }}>Small student groups — a validated first line of campus support.</div>
        </div>
        <button className="btn btn-secondary">Learn more</button>
      </Blueprint> */}
    </div>
  );
}
