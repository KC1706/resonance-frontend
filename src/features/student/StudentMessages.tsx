import { useState } from "react";
import { Blueprint } from "@/components/Blueprint";
import { ChatThread } from "@/components/ChatThread";
import { useAppData } from "@/context/AppDataContext";
import { getThread, sendMessage } from "@/data/db";

/**
 * Chat with your counsellor, any time — booked session or not. This is a
 * regular text chat: it is not analyzed the way an audio session is.
 */
export function StudentMessages() {
  const { identity } = useAppData();
  const [, forceRerender] = useState(0);

  if (!identity.assignedCounsellorId || !identity.recordId) {
    return (
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "var(--space-8)" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 34 }}>Messages</h1>
        <Blueprint style={{ padding: "var(--space-4)", marginTop: "var(--space-4)" }}>
          <p style={{ margin: 0, fontSize: 13.5 }}>
            You'll be matched with a counsellor soon — messaging opens up once you are.
          </p>
        </Blueprint>
      </div>
    );
  }

  const messages = getThread(identity.recordId, identity.assignedCounsellorId);

  function handleSend(text: string) {
    sendMessage(identity.recordId!, identity.assignedCounsellorId!, "student", text);
    forceRerender((n) => n + 1);
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "var(--space-8)", height: "calc(100vh - 2 * var(--space-8))", display: "flex", flexDirection: "column" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 34 }}>Messages</h1>
      <p className="text-muted" style={{ margin: "0 0 var(--space-4)", fontSize: 14 }}>Any time, booked session or not.</p>
      <Blueprint style={{ padding: "var(--space-4)", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <ChatThread messages={messages} currentRole="student" onSend={handleSend} placeholder="Message your counsellor…" />
      </Blueprint>
    </div>
  );
}
