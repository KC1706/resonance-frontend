import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Blueprint, Kicker } from "@/components/Blueprint";
import { formatClock, formatWeekdayDate } from "@/lib/dates";
import { useAppData } from "@/context/AppDataContext";
import { useDialog } from "@/context/DialogContext";
import {
  getWeekSlots, getStudentName, acceptAppointment, declineAppointment,
  cancelConfirmedAppointment, addAvailabilitySlot, removeAvailabilitySlot,
  type CalendarSlot,
} from "@/data/db";

/**
 * The counsellor's own week: add or remove open slots, see who's requested
 * or confirmed on each at a glance (orange = waiting on you, green =
 * confirmed), and act on requests right here. A slot with a confirmed
 * session can't be removed — cancel the session first.
 */
export function Calendar() {
  const { identity } = useAppData();
  const [, forceRerender] = useState(0);
  const [openSlot, setOpenSlot] = useState<string | null>(null);
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [newTime, setNewTime] = useState("09:00");
  const navigate = useNavigate();
  const dialog = useDialog();

  if (!identity.recordId) return null;
  const counsellorId = identity.recordId;
  const days = getWeekSlots(counsellorId);

  function refresh() {
    forceRerender((n) => n + 1);
  }

  function goToProfile() {
    navigate("/counsellor/profile");
  }

  function goToMessages(studentId: string) {
    navigate("/counsellor/messages", { state: { studentId } });
  }

  async function handleAccept(id: string) {
    const ok = await dialog.confirm(
      "This confirms the session for this student. Other pending requests on this slot are left as they are — decline them separately if this slot is now full.",
      { title: "Accept this request?", confirmLabel: "Accept" },
    );
    if (!ok) return;
    acceptAppointment(id);
    refresh();
  }

  async function handleDecline(id: string) {
    const reason = await dialog.prompt("This is sent to the student as the reason their request wasn't accepted.", {
      title: "Decline this request", placeholder: "Reason for declining…", confirmLabel: "Decline",
    });
    if (!reason) return;
    declineAppointment(id, reason);
    refresh();
  }

  async function handleCancelConfirmed(id: string) {
    const reason = await dialog.prompt("This is sent to the student as the reason the session was cancelled.", {
      title: "Cancel this confirmed session", placeholder: "Reason for cancelling…", confirmLabel: "Cancel session", destructive: true,
    });
    if (!reason) return;
    cancelConfirmedAppointment(id, reason, "counsellor");
    refresh();
  }

  async function handleRemoveSlot(id: string) {
    const result = removeAvailabilitySlot(id);
    if ("error" in result) await dialog.alert(result.error, { title: "Can't remove this slot" });
    refresh();
  }

  function handleAddSlot(dayKey: string) {
    const [hh, mm] = newTime.split(":").map(Number);
    const day = new Date(dayKey);
    day.setHours(hh, mm, 0, 0);
    addAvailabilitySlot(counsellorId, day.toISOString());
    setAddingFor(null);
    refresh();
  }

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)" }}>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h2 style={{ margin: 0 }}>Your week</h2>
        <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 14, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <LegendDot color="var(--state-watch-fg)" /> waiting on you
          <LegendDot color="var(--color-accent)" style={{ marginLeft: 10 }} /> confirmed
          <span style={{ marginLeft: 10 }}>— add or remove open slots any time.</span>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "var(--space-3)" }}>
        {Object.entries(days).map(([dayKey, slots]) => (
          <Blueprint key={dayKey} style={{ padding: "var(--space-3)" }}>
            <Kicker>{formatWeekdayDate(new Date(dayKey)).slice(0, 3)} {new Date(dayKey).getDate()}</Kicker>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {slots.length === 0 && <span className="text-muted" style={{ fontSize: 11.5 }}>No slots yet</span>}
              {slots.map((slot) => (
                <SlotCell
                  key={slot.startIso}
                  slot={slot}
                  isOpen={openSlot === slot.startIso}
                  onToggle={() => setOpenSlot(openSlot === slot.startIso ? null : slot.startIso)}
                  onRemove={() => handleRemoveSlot(slot.availabilityId)}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  onCancelConfirmed={handleCancelConfirmed}
                  onViewProfile={goToProfile}
                  onMessage={goToMessages}
                />
              ))}
            </div>

            {addingFor === dayKey ? (
              <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                <input
                  type="time" className="input" style={{ fontSize: 11.5, padding: "3px 4px" }}
                  value={newTime} onChange={(e) => setNewTime(e.target.value)}
                />
                <button className="btn btn-primary" style={{ fontSize: 11, padding: "3px 6px" }} onClick={() => handleAddSlot(dayKey)}>Add</button>
              </div>
            ) : (
              <button
                className="btn btn-secondary" style={{ fontSize: 11, padding: "4px 0", width: "100%", marginTop: 8 }}
                onClick={() => setAddingFor(dayKey)}
              >
                + Add slot
              </button>
            )}
          </Blueprint>
        ))}
      </div>
    </div>
  );
}

function LegendDot({ color, style }: { color: string; style?: CSSProperties }) {
  return <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", ...style }} />;
}

function SlotCell({
  slot, isOpen, onToggle, onRemove, onAccept, onDecline, onCancelConfirmed, onViewProfile, onMessage,
}: {
  slot: CalendarSlot;
  isOpen: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onCancelConfirmed: (id: string) => void;
  onViewProfile: () => void;
  onMessage: (studentId: string) => void;
}) {
  const isFree = slot.pending.length === 0 && slot.confirmed.length === 0;

  return (
    <div style={{ border: "1px solid var(--color-divider)" }}>
      <div
        onClick={isFree ? undefined : onToggle}
        style={{ padding: "6px 7px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: isFree ? "default" : "pointer" }}
      >
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 13 }}>{formatClock(new Date(slot.startIso))}</span>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {slot.confirmed.length > 0 && (
            <span style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", borderRadius: 10, fontSize: 10.5, padding: "1px 6px", fontWeight: 600 }}>
              {slot.confirmed.length}
            </span>
          )}
          {slot.pending.length > 0 && (
            <span style={{ background: "var(--state-watch-bg)", color: "var(--state-watch-fg)", borderRadius: 10, fontSize: 10.5, padding: "1px 6px", fontWeight: 600 }}>
              {slot.pending.length}
            </span>
          )}
          {isFree && (
            <button
              type="button" onClick={onRemove} title="Remove this open slot"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-neutral-500)", fontSize: 13, padding: 0 }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {isOpen && !isFree && (
        <div style={{ borderTop: "1px solid var(--color-divider)", padding: "6px 7px", display: "flex", flexDirection: "column", gap: 8 }}>
          {slot.confirmed.map((a) => (
            <div key={a.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button type="button" className="text-muted" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11.5, fontWeight: 600, padding: 0, textDecoration: "underline" }} onClick={onViewProfile}>
                  {getStudentName(a.studentId)}
                </button>
                <button type="button" onClick={() => onMessage(a.studentId)} title="Message student" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "grid" }}>
                  <MessageCircle size={13} strokeWidth={1.5} />
                </button>
              </div>
              <button className="btn btn-secondary" style={{ fontSize: 10.5, padding: "3px 0" }} onClick={() => onCancelConfirmed(a.id)}>Cancel session</button>
            </div>
          ))}
          {slot.pending.map((a) => (
            <div key={a.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button type="button" className="text-muted" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11.5, fontWeight: 600, padding: 0, textDecoration: "underline" }} onClick={onViewProfile}>
                  {getStudentName(a.studentId)}
                </button>
                <button type="button" onClick={() => onMessage(a.studentId)} title="Message student" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "grid" }}>
                  <MessageCircle size={13} strokeWidth={1.5} />
                </button>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="btn btn-primary" style={{ flex: 1, fontSize: 10.5, padding: "3px 0" }} onClick={() => onAccept(a.id)}>Accept</button>
                <button className="btn btn-secondary" style={{ flex: 1, fontSize: 10.5, padding: "3px 0" }} onClick={() => onDecline(a.id)}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
