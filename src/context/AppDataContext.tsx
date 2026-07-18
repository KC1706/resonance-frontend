import { createContext, useContext, useMemo, type ReactNode } from "react";
import * as shared from "@/data/shared";
import * as counsellorData from "@/data/counsellor";
import * as studentData from "@/data/student";

export type AppData = typeof shared & typeof counsellorData & typeof studentData;

const AppDataContext = createContext<AppData | null>(null);

/** Seam Thread 11 replaces with real fetching (loading/error states slot in here). */
export function AppDataProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AppData>(
    () => ({ ...shared, ...counsellorData, ...studentData }),
    [],
  );
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppData {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
