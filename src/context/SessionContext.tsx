import { createContext, useContext, useState, type ReactNode } from "react";
import { readJSON, writeJSON, removeKey } from "@/lib/storage";
import { applySessionToStudent } from "@/data/db";
import type { SessionResult } from "@/features/counsellor/liveSession";

/**
 * Holds the most recently completed live session so Review/Profile can react
 * to it immediately in this tab. The durable copy lives in db.ts now
 * (applySessionToStudent writes a real SessionRecord + updates the student's
 * caseNote) — this context is just the fast, in-memory mirror of that,
 * persisted so a refresh mid-demo doesn't lose the "just ended" state.
 */
export interface CompletedSession extends SessionResult {
  studentId: string;
  completedAtIso: string;
}

interface SessionContextValue {
  result: CompletedSession | null;
  complete: (studentId: string, counsellorId: string, r: SessionResult) => void;
  clear: () => void;
}

const KEY = "session:lastResult";
const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<CompletedSession | null>(() =>
    readJSON<CompletedSession | null>(KEY, null),
  );

  const complete = (studentId: string, counsellorId: string, r: SessionResult) => {
    applySessionToStudent(studentId, counsellorId, {
      sessionLabel: r.sessionLabel,
      durationLabel: r.durationLabel,
      firstSession: r.firstSession,
      index: r.baselineIndex,
      keyMomentTs: r.keyMomentTs,
      keyMomentText: r.keyMomentText,
      themes: r.themes,
      readings: r.readings,
      note: r.note,
    });
    const record: CompletedSession = { ...r, studentId, completedAtIso: new Date().toISOString() };
    writeJSON(KEY, record);
    setResult(record);
  };

  const clear = () => {
    removeKey(KEY);
    setResult(null);
  };

  return (
    <SessionContext.Provider value={{ result, complete, clear }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
