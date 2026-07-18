/**
 * The persisted "database" for this build phase: real accounts and profiles,
 * kept in localStorage instead of a server (see docs/V2_Platform_Plan.md §2-3).
 * Session/appointment/message/opportunity entities join this same file as
 * later threads add them — screens should never reach into localStorage
 * directly, only through this module and AuthContext/AppDataContext.
 */
import { readJSON, writeJSON } from "@/lib/storage";

export type Role = "counsellor" | "student";

export interface UserRecord {
  id: string;
  role: Role;
  email: string;
  password: string; // demo-only plaintext — never do this against a real backend
  name: string;
}

export interface CounsellorRecord {
  id: string;
  userId: string;
  initials: string;
  title: string; // e.g. "Wellness Cell · IIT KGP"
}

export interface StudentRecord {
  id: string;
  userId: string;
  code: string; // e.g. "A-238", matches the existing caseload/session mocks
  dept: string;
  assignedCounsellorId: string | null;
}

interface Db {
  users: UserRecord[];
  counsellors: CounsellorRecord[];
  students: StudentRecord[];
}

const DB_KEY = "db:v1";

function seed(): Db {
  const users: UserRecord[] = [
    { id: "u-priya", role: "counsellor", email: "counsellor1@resonance.demo", password: "demo1234", name: "Priya Das" },
    { id: "u-aarav", role: "student", email: "student1@resonance.demo", password: "demo1234", name: "Aarav M." },
    { id: "u-rhea", role: "student", email: "student2@resonance.demo", password: "demo1234", name: "Rhea K." },
  ];
  const counsellors: CounsellorRecord[] = [
    { id: "c-priya", userId: "u-priya", initials: "PD", title: "Wellness Cell · IIT KGP" },
  ];
  const students: StudentRecord[] = [
    { id: "s-aarav", userId: "u-aarav", code: "A-238", dept: "Mechanical · Y2", assignedCounsellorId: "c-priya" },
    { id: "s-rhea", userId: "u-rhea", code: "R-104", dept: "Civil · Y1", assignedCounsellorId: "c-priya" },
  ];
  return { users, counsellors, students };
}

function load(): Db {
  return readJSON<Db>(DB_KEY, seed());
}

function save(db: Db): void {
  writeJSON(DB_KEY, db);
}

/** Ensures the seed data exists on first run; safe to call repeatedly. */
export function ensureSeeded(): void {
  const existing = readJSON<Db | null>(DB_KEY, null);
  if (!existing) save(seed());
}

export function findUserByEmail(email: string): UserRecord | undefined {
  return load().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function findUserById(id: string): UserRecord | undefined {
  return load().users.find((u) => u.id === id);
}

export function verifyCredentials(email: string, password: string): UserRecord | null {
  const user = findUserByEmail(email);
  return user && user.password === password ? user : null;
}

export function listDemoAccounts(): UserRecord[] {
  return load().users;
}

export function getCounsellorProfile(userId: string): CounsellorRecord | undefined {
  return load().counsellors.find((c) => c.userId === userId);
}

export function getStudentProfile(userId: string): StudentRecord | undefined {
  return load().students.find((s) => s.userId === userId);
}

/** Self-serve demo signup for a new student account, unassigned until matched to a counsellor. */
export function createStudentAccount(name: string, email: string, password: string): UserRecord | { error: string } {
  const db = load();
  if (db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return { error: "An account with that email already exists." };
  }
  const id = `u-${crypto.randomUUID()}`;
  const user: UserRecord = { id, role: "student", email: email.trim(), password, name: name.trim() };
  const student: StudentRecord = {
    id: `s-${crypto.randomUUID()}`,
    userId: id,
    code: "—",
    dept: "Unassigned",
    assignedCounsellorId: null,
  };
  db.users.push(user);
  db.students.push(student);
  save(db);
  return user;
}
