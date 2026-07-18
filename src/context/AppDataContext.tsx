import { createContext, useContext, useMemo, type ReactNode } from "react";
import * as shared from "@/data/shared";
import * as counsellorData from "@/data/counsellor";
import * as studentData from "@/data/student";
import { useAuth } from "@/context/AuthContext";
import { getCounsellorProfile, getStudentProfile } from "@/data/db";

export interface Identity {
  name: string;
  firstName: string;
  initials: string;
  title: string; // institutional role line (counsellor) or dept/code line (student)
  /** The CounsellorRecord/StudentRecord id (not the user id) — what db.ts functions expect. */
  recordId: string | null;
  /** Student only: their assigned counsellor's record id, or null if not yet matched. */
  assignedCounsellorId: string | null;
}

export type AppData = typeof shared & typeof counsellorData & typeof studentData & {
  /** The logged-in counsellor's real identity — replaces the old hardcoded "Priya Das". */
  identity: Identity;
};

const AppDataContext = createContext<AppData | null>(null);

function initialsOf(name: string): string {
  return name.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

/** Seam later threads replace with real fetching (loading/error states slot in here). */
export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const identity = useMemo<Identity>(() => {
    if (user?.role === "counsellor") {
      const profile = getCounsellorProfile(user.id);
      return {
        name: user.name, firstName: user.name.split(" ")[0], initials: initialsOf(user.name),
        title: profile?.title ?? "Counsellor", recordId: profile?.id ?? null, assignedCounsellorId: null,
      };
    }
    if (user?.role === "student") {
      const profile = getStudentProfile(user.id);
      return {
        name: user.name,
        firstName: user.name.split(" ")[0],
        initials: initialsOf(user.name),
        title: profile ? `${profile.code} · ${profile.dept}` : "Unassigned",
        recordId: profile?.id ?? null,
        assignedCounsellorId: profile?.assignedCounsellorId ?? null,
      };
    }
    return { name: "", firstName: "", initials: "", title: "", recordId: null, assignedCounsellorId: null };
  }, [user]);

  const value = useMemo<AppData>(
    () => ({ ...shared, ...counsellorData, ...studentData, identity }),
    [identity],
  );
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppData {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
