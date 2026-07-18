import { useState, type FormEvent } from "react";
import type { MessageRecord, Role } from "@/data/db";
import { formatClock } from "@/lib/dates";

/**
 * The one chat UI both personas reuse (counsellor Messages, student Messages).
 * Plain text only — never analyzed, never fed into the facet engine.
 */
export function ChatThread({
  messages, currentRole, onSend, placeholder = "Write a message…",
}: {
  messages: MessageRecord[];
  currentRole: Role;
  onSend: (text: string) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, padding: "4px 2px" }}>
        {messages.length === 0 && (
          <p className="text-muted" style={{ fontSize: 12.5, textAlign: "center", marginTop: 24 }}>
            No messages yet — say hello.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender === currentRole;
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  maxWidth: "72%",
                  padding: "8px 11px",
                  fontSize: 13.5,
                  lineHeight: 1.4,
                  background: mine ? "var(--color-accent)" : "color-mix(in srgb, var(--color-text) 6%, transparent)",
                  color: mine ? "#fff" : "var(--color-text)",
                  border: mine ? "none" : "1px solid var(--color-divider)",
                }}
              >
                {m.text}
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 3, textAlign: "right" }}>
                  {formatClock(new Date(m.atIso))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: "1px solid var(--color-divider)" }}>
        <input
          className="input" style={{ flex: 1 }} placeholder={placeholder}
          value={draft} onChange={(e) => setDraft(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Send</button>
      </form>
    </div>
  );
}
