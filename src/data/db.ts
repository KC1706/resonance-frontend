/**
 * The persisted "database" for this build phase: real accounts, appointments,
 * messages, and opportunities, kept in localStorage instead of a server (see
 * docs/V2_Platform_Plan.md §2-3, §6-8). Screens never touch localStorage
 * directly — only through this module and AuthContext/AppDataContext.
 */
import { readJSON, writeJSON } from "@/lib/storage";
import { daysAgo } from "@/lib/dates";

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
  skills: string[];
  domains: string[];
}

export type AppointmentStatus = "requested" | "accepted" | "declined" | "cancelled";

export interface AppointmentRecord {
  id: string;
  studentId: string;
  counsellorId: string;
  startIso: string;
  endIso: string;
  status: AppointmentStatus;
}

export interface MessageRecord {
  id: string;
  studentId: string;
  counsellorId: string;
  sender: Role;
  text: string;
  atIso: string;
}

export type OpportunityType = "internship" | "job" | "hackathon";

export interface OpportunityRecord {
  id: string;
  title: string;
  org: string;
  type: OpportunityType;
  tags: string[];
  deadlineIso: string;
  link: string;
}

interface Db {
  users: UserRecord[];
  counsellors: CounsellorRecord[];
  students: StudentRecord[];
  appointments: AppointmentRecord[];
  messages: MessageRecord[];
  opportunities: OpportunityRecord[];
}

const DB_KEY = "db:v2";

/** The counsellor's standing weekly hours — same slots every day, kept simple on purpose. */
export const DAILY_SLOT_TIMES: Array<[number, number]> = [[10, 0], [11, 30], [14, 0], [15, 30]];
const SLOT_MINUTES = 30;

function seed(): Db {
  const now = new Date();
  const users: UserRecord[] = [
    { id: "u-priya", role: "counsellor", email: "counsellor1@resonance.demo", password: "demo1234", name: "Priya Das" },
    { id: "u-aarav", role: "student", email: "student1@resonance.demo", password: "demo1234", name: "Aarav M." },
    { id: "u-rhea", role: "student", email: "student2@resonance.demo", password: "demo1234", name: "Rhea K." },
  ];
  const counsellors: CounsellorRecord[] = [
    { id: "c-priya", userId: "u-priya", initials: "PD", title: "Wellness Cell · IIT KGP" },
  ];
  const students: StudentRecord[] = [
    {
      id: "s-aarav", userId: "u-aarav", code: "A-238", dept: "Mechanical · Y2", assignedCounsellorId: "c-priya",
      skills: ["Python", "CAD", "Mechanical Design"], domains: ["Mechanical Engineering", "Robotics"],
    },
    {
      id: "s-rhea", userId: "u-rhea", code: "R-104", dept: "Civil · Y1", assignedCounsellorId: "c-priya",
      skills: ["AutoCAD", "Structural Analysis"], domains: ["Civil Engineering", "Construction"],
    },
  ];

  // A couple of seeded messages so "Messages" doesn't look broken on first login.
  const messages: MessageRecord[] = [
    { id: "m-1", studentId: "s-aarav", counsellorId: "c-priya", sender: "student", text: "Hi, just wanted to say thanks for last week.", atIso: daysAgo(3, now).toISOString() },
    { id: "m-2", studentId: "s-aarav", counsellorId: "c-priya", sender: "counsellor", text: "Of course, Aarav — see you Thursday.", atIso: daysAgo(3, now).toISOString() },
  ];

  const opportunities: OpportunityRecord[] = [
    { id: "o-1", title: "Mechanical Design Intern", org: "Tata AutoComp", type: "internship", tags: ["Mechanical Design", "CAD"], deadlineIso: daysAgo(-21, now).toISOString(), link: "#" },
    { id: "o-2", title: "Robotics Hackathon 2026", org: "IIT KGP Robotics Club", type: "hackathon", tags: ["Robotics", "Python"], deadlineIso: daysAgo(-10, now).toISOString(), link: "#" },
    { id: "o-3", title: "Structural Analyst — Grad Trainee", org: "L&T Construction", type: "job", tags: ["Civil Engineering", "Structural Analysis"], deadlineIso: daysAgo(-30, now).toISOString(), link: "#" },
    { id: "o-4", title: "Site Engineering Intern", org: "Shapoorji Pallonji", type: "internship", tags: ["Construction", "AutoCAD"], deadlineIso: daysAgo(-14, now).toISOString(), link: "#" },
    { id: "o-5", title: "Software Intern — Data Tools", org: "Sprinklr", type: "internship", tags: ["Python"], deadlineIso: daysAgo(-18, now).toISOString(), link: "#" },
    { id: "o-6", title: "Smart India Hackathon", org: "Govt. of India", type: "hackathon", tags: ["Mechanical Design", "Robotics", "Python"], deadlineIso: daysAgo(-25, now).toISOString(), link: "#" },
  ];

  return { users, counsellors, students, appointments: [], messages, opportunities };
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

// ── Accounts ─────────────────────────────────────────────────────────────────

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

export function getStudentById(studentId: string): StudentRecord | undefined {
  return load().students.find((s) => s.id === studentId);
}

export function getStudentName(studentId: string): string {
  const db = load();
  const student = db.students.find((s) => s.id === studentId);
  const user = student && db.users.find((u) => u.id === student.userId);
  return user?.name ?? "Student";
}

export function listStudentsForCounsellor(counsellorId: string): StudentRecord[] {
  return load().students.filter((s) => s.assignedCounsellorId === counsellorId);
}

export function updateStudentSkills(studentId: string, skills: string[], domains: string[]): void {
  const db = load();
  const student = db.students.find((s) => s.id === studentId);
  if (student) { student.skills = skills; student.domains = domains; save(db); }
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
    skills: [],
    domains: [],
  };
  db.users.push(user);
  db.students.push(student);
  save(db);
  return user;
}

// ── Calendar & appointments ─────────────────────────────────────────────────

/** Every slot time in the next 7 days for one counsellor, each tagged with its current status. */
export interface CalendarSlot {
  startIso: string;
  status: "free" | AppointmentStatus;
  appointmentId?: string;
  studentId?: string;
}

export function getWeekSlots(counsellorId: string, from: Date = new Date()): Record<string, CalendarSlot[]> {
  const db = load();
  const days: Record<string, CalendarSlot[]> = {};
  for (let d = 0; d < 7; d++) {
    const day = daysAgo(-d, from);
    const dayKey = day.toDateString();
    days[dayKey] = DAILY_SLOT_TIMES.map(([hh, mm]) => {
      const slot = new Date(day);
      slot.setHours(hh, mm, 0, 0);
      const startIso = slot.toISOString();
      const match = db.appointments.find(
        (a) => a.counsellorId === counsellorId && a.startIso === startIso && a.status !== "declined" && a.status !== "cancelled",
      );
      return match
        ? { startIso, status: match.status, appointmentId: match.id, studentId: match.studentId }
        : { startIso, status: "free" as const };
    }).filter((slot) => new Date(slot.startIso).getTime() > from.getTime() || slot.status !== "free");
  }
  return days;
}

export function listAppointmentsForCounsellor(counsellorId: string): AppointmentRecord[] {
  return load().appointments.filter((a) => a.counsellorId === counsellorId);
}

export function listAppointmentsForStudent(studentId: string): AppointmentRecord[] {
  return load().appointments.filter((a) => a.studentId === studentId);
}

export function requestAppointment(studentId: string, counsellorId: string, startIso: string): AppointmentRecord {
  const db = load();
  const start = new Date(startIso);
  const end = new Date(start.getTime() + SLOT_MINUTES * 60000);
  const record: AppointmentRecord = {
    id: `appt-${crypto.randomUUID()}`, studentId, counsellorId, startIso, endIso: end.toISOString(), status: "requested",
  };
  db.appointments.push(record);
  save(db);
  return record;
}

export function respondToAppointment(id: string, decision: "accepted" | "declined"): void {
  const db = load();
  const appt = db.appointments.find((a) => a.id === id);
  if (appt) { appt.status = decision; save(db); }
}

export function cancelAppointment(id: string): void {
  const db = load();
  const appt = db.appointments.find((a) => a.id === id);
  if (appt) { appt.status = "cancelled"; save(db); }
}

// ── Messages ─────────────────────────────────────────────────────────────────

export function getThread(studentId: string, counsellorId: string): MessageRecord[] {
  return load().messages
    .filter((m) => m.studentId === studentId && m.counsellorId === counsellorId)
    .sort((a, b) => a.atIso.localeCompare(b.atIso));
}

export function sendMessage(studentId: string, counsellorId: string, sender: Role, text: string): MessageRecord {
  const db = load();
  const record: MessageRecord = { id: `msg-${crypto.randomUUID()}`, studentId, counsellorId, sender, text, atIso: new Date().toISOString() };
  db.messages.push(record);
  save(db);
  return record;
}

/** One row per student this counsellor has ever messaged with, most recent first. */
export function listThreadsForCounsellor(counsellorId: string): Array<{ student: StudentRecord; last: MessageRecord | null }> {
  const db = load();
  return listStudentsForCounsellor(counsellorId).map((student) => {
    const thread = db.messages.filter((m) => m.studentId === student.id && m.counsellorId === counsellorId);
    thread.sort((a, b) => a.atIso.localeCompare(b.atIso));
    return { student, last: thread.length ? thread[thread.length - 1] : null };
  }).sort((a, b) => (b.last?.atIso ?? "").localeCompare(a.last?.atIso ?? ""));
}

// ── Opportunities ────────────────────────────────────────────────────────────

export function listOpportunities(): OpportunityRecord[] {
  return load().opportunities;
}

/** Plain overlap count between a student's tags and an opportunity's tags — explainable, not a black box. */
export function matchingTags(student: StudentRecord, opportunity: OpportunityRecord): string[] {
  const studentTags = new Set([...student.skills, ...student.domains].map((t) => t.toLowerCase()));
  return opportunity.tags.filter((t) => studentTags.has(t.toLowerCase()));
}
