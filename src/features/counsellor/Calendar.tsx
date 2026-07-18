import { useState } from "react";
import { Blueprint, Kicker, Tag } from "@/components/Blueprint";
import { state } from "@/lib/state";
import { formatClock, formatWeekdayDate } from "@/lib/dates";
import { useAppData } from "@/context/AppDataContext";
import { getWeekSlots, getStudentName, respondToAppointment } from "@/data/db";

const slotTag = (status: string) => {
  if (status === "accepted") return { background: "var(--color-accent-100)", color: "var(--color-accent-800)" };
  if (status === "requested") return { background: state.watch.bg, color: state.watch.fg };
  return { background: "var(--color-neutral-100)", color: "var(--color-neutral-800)" };
};

/**
 * The counsellor's own week, plain and simple: what's booked, what's still
 * open, and anything waiting for a yes/no. No settings screen — the weekly
 * hours are fixed on purpose so there's nothing to configure before this is useful.
 */
export function Calendar() {
  const { identity } = useAppData();
  const [, forceRerender] = useState(0);

  if (!identity.recordId) return null;
  const days = getWeekSlots(identity.recordId);

  function respond(id: string, decision: "accepted" | "declined") {
    respondToAppointment(id, decision);
    forceRerender((n) => n + 1);
  }

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)" }}>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h2 style={{ margin: 0 }}>Your week</h2>
        <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 14 }}>
          What's booked, what's open, and what's waiting for you to accept.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "var(--space-3)" }}>
        {Object.entries(days).map(([dayKey, slots]) => (
          <Blueprint key={dayKey} style={{ padding: "var(--space-3)" }}>
            <Kicker>{formatWeekdayDate(new Date(dayKey)).split(" · ")[0].slice(0, 3)} {new Date(dayKey).getDate()}</Kicker>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {slots.length === 0 && <span className="text-muted" style={{ fontSize: 11.5 }}>No slots left today</span>}
              {slots.map((slot) => (
                <div key={slot.startIso} style={{ padding: "6px 7px", border: "1px solid var(--color-divider)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: 13 }}>{formatClock(new Date(slot.startIso))}</span>
                    <Tag style={slotTag(slot.status)}>{slot.status === "free" ? "Open" : slot.status}</Tag>
                  </div>
                  {slot.studentId && (
                    <div style={{ fontSize: 11.5, marginTop: 3 }}>{getStudentName(slot.studentId)}</div>
                  )}
                  {slot.status === "requested" && slot.appointmentId && (
                    <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
                      <button className="btn btn-primary" style={{ flex: 1, padding: "4px 0", fontSize: 11.5 }} onClick={() => respond(slot.appointmentId!, "accepted")}>Accept</button>
                      <button className="btn btn-secondary" style={{ flex: 1, padding: "4px 0", fontSize: 11.5 }} onClick={() => respond(slot.appointmentId!, "declined")}>Decline</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Blueprint>
        ))}
      </div>
    </div>
  );
}
