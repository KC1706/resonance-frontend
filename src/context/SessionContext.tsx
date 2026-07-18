import { createContext, useContext, useState, type ReactNode } from "react";
import { readJSON, writeJSON, removeKey } from "@/lib/storage";
import type { SessionResult } from "@/features/counsellor/liveSession";

/**
 * Holds the most recently completed live session. The cockpit writes it on
 * completion; Post-Session Review and the Student Profile read it so they
 * visibly "generate from the session" (empty/baseline before, filled after).
 * Persisted so a refresh mid-demo doesn't lose the story.
 */
export interface CompletedSession extends SessionResult {
  completedAtIso: string;
}

interface SessionContextValue {
  result: CompletedSession | null;
  complete: (r: SessionResult) => void;
  clear: () => void;
}

const KEY = "session:lastResult";
const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<CompletedSession | null>(() =>
    readJSON<CompletedSession | null>(KEY, null),
  );

  const complete = (r: SessionResult) => {
    const record: CompletedSession = { ...r, completedAtIso: new Date().toISOString() };
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
