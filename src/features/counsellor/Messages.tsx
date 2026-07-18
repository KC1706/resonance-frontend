import { useMemo, useState } from "react";
import { Blueprint, Kicker } from "@/components/Blueprint";
import { ChatThread } from "@/components/ChatThread";
import { useAppData } from "@/context/AppDataContext";
import { listThreadsForCounsellor, getThread, sendMessage, getStudentName } from "@/data/db";

/**
 * Plain chat with an assigned student — for logistics and support, always
 * available whether or not a session is booked. Not analyzed by the facet
 * engine; only recorded audio sessions are.
 */
export function Messages() {
  const { identity } = useAppData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [, forceRerender] = useState(0);

  const threads = identity.recordId ? listThreadsForCounsellor(identity.recordId) : [];
  const activeStudentId = selectedId ?? threads[0]?.student.id ?? null;
  const activeStudent = threads.find((t) => t.student.id === activeStudentId)?.student;
  const messages = useMemo(
    () => (identity.recordId && activeStudentId ? getThread(activeStudentId, identity.recordId) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeStudentId, identity.recordId, threads.length],
  );

  function handleSend(text: string) {
    if (!identity.recordId || !activeStudentId) return;
    sendMessage(activeStudentId, identity.recordId, "counsellor", text);
    forceRerender((n) => n + 1);
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)", height: "calc(100vh - var(--space-6) - var(--space-8))", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: "var(--space-4)" }}>
        <h2 style={{ margin: 0 }}>Messages</h2>
        <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 14 }}>Chat with your students — not analyzed, just for staying in touch.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "var(--space-4)", flex: 1, minHeight: 0 }}>
        <Blueprint style={{ padding: "var(--space-3)", overflowY: "auto" }}>
          <Kicker>Your students</Kicker>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 8 }}>
            {threads.map(({ student, last }) => (
              <button
                key={student.id}
                onClick={() => setSelectedId(student.id)}
                className="navbtn"
                style={{
                  textAlign: "left", padding: "8px 8px", border: "none", cursor: "pointer",
                  background: student.id === activeStudentId ? "var(--color-accent-100)" : "transparent",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500 }}>{getStudentName(student.id)}</div>
                <div className="text-muted" style={{ fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {last ? last.text : "No messages yet"}
                </div>
              </button>
            ))}
            {threads.length === 0 && <p className="text-muted" style={{ fontSize: 12.5, padding: 8 }}>No students assigned yet.</p>}
          </div>
        </Blueprint>
        <Blueprint style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", minHeight: 0 }}>
          {activeStudent ? (
            <>
              <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--color-divider)" }}>
                <div style={{ fontWeight: 500 }}>{activeStudent.code} · {activeStudent.dept}</div>
              </div>
              <ChatThread messages={messages} currentRole="counsellor" onSend={handleSend} placeholder="Message this student…" />
            </>
          ) : (
            <p className="text-muted" style={{ fontSize: 13 }}>Pick a student from the left to start chatting.</p>
          )}
        </Blueprint>
      </div>
    </div>
  );
}
