import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ensureSeeded, findUserById, verifyCredentials, createStudentAccount, type Role, type UserRecord,
} from "@/data/db";
import { readJSON, writeJSON, removeKey } from "@/lib/storage";

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  signupStudent: (name: string, email: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
}

const SESSION_KEY = "session:userId";

function toAuthUser(u: UserRecord): AuthUser {
  return { id: u.id, role: u.role, email: u.email, name: u.name };
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Dummy-account auth over localStorage (docs/V2_Platform_Plan.md §2) — a real gate, not a real IdP. */
export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => ensureSeeded(), []);

  const [user, setUser] = useState<AuthUser | null>(() => {
    ensureSeeded();
    const id = readJSON<string | null>(SESSION_KEY, null);
    const record = id ? findUserById(id) : undefined;
    return record ? toAuthUser(record) : null;
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login(email, password) {
        const record = verifyCredentials(email, password);
        if (!record) return { ok: false, error: "Incorrect email or password." };
        writeJSON(SESSION_KEY, record.id);
        setUser(toAuthUser(record));
        return { ok: true };
      },
      signupStudent(name, email, password) {
        if (!name.trim() || !email.trim() || password.length < 4) {
          return { ok: false, error: "Enter a name, email, and a password of at least 4 characters." };
        }
        const result = createStudentAccount(name, email, password);
        if ("error" in result) return { ok: false, error: result.error };
        writeJSON(SESSION_KEY, result.id);
        setUser(toAuthUser(result));
        return { ok: true };
      },
      logout() {
        removeKey(SESSION_KEY);
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
