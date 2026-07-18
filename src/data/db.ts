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
  /** Why it was declined/cancelled — required whenever a confirmed slot is cancelled. */
  reason?: string;
}

/** A slot the counsellor has opened up — students can only request against these. */
export interface AvailabilitySlot {
  id: string;
  counsellorId: string;
  startIso: string;
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
  availability: AvailabilitySlot[];
  appointments: AppointmentRecord[];
  messages: MessageRecord[];
  opportunities: OpportunityRecord[];
}

const DB_KEY = "db:v3";

/** Starting hours so the calendar isn't empty on first login — the counsellor edits from here. */
const DEFAULT_DAILY_SLOT_TIMES: Array<[number, number]> = [[10, 0], [11, 30], [14, 0], [15, 30]];
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

  const availability: AvailabilitySlot[] = [];
  for (let d = 0; d < 7; d++) {
    const day = daysAgo(-d, now);
    for (const [hh, mm] of DEFAULT_DAILY_SLOT_TIMES) {
      const slot = new Date(day);
      slot.setHours(hh, mm, 0, 0);
      availability.push({ id: `av-${crypto.randomUUID()}`, counsellorId: "c-priya", startIso: slot.toISOString() });
    }
  }

  const opportunities: OpportunityRecord[] = [
    { id: "o-1", title: "Mechanical Design Intern", org: "Tata AutoComp", type: "internship", tags: ["Mechanical Design", "CAD"], deadlineIso: daysAgo(-21, now).toISOString(), link: "#" },
    { id: "o-2", title: "Robotics Hackathon 2026", org: "IIT KGP Robotics Club", type: "hackathon", tags: ["Robotics", "Python"], deadlineIso: daysAgo(-10, now).toISOString(), link: "#" },
    { id: "o-3", title: "Structural Analyst — Grad Trainee", org: "L&T Construction", type: "job", tags: ["Civil Engineering", "Structural Analysis"], deadlineIso: daysAgo(-30, now).toISOString(), link: "#" },
    { id: "o-4", title: "Site Engineering Intern", org: "Shapoorji Pallonji", type: "internship", tags: ["Construction", "AutoCAD"], deadlineIso: daysAgo(-14, now).toISOString(), link: "#" },
    { id: "o-5", title: "Software Intern — Data Tools", org: "Sprinklr", type: "internship", tags: ["Python"], deadlineIso: daysAgo(-18, now).toISOString(), link: "#" },
    { id: "o-6", title: "Smart India Hackathon", org: "Govt. of India", type: "hackathon", tags: ["Mechanical Design", "Robotics", "Python"], deadlineIso: daysAgo(-25, now).toISOString(), link: "#" },
  ];

  return { users, counsellors, students, availability, appointments: [], messages, opportunities };
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

/** One open slot in the next 7 days, with every request against it (usually 0-2). */
export interface CalendarSlot {
  availabilityId: string;
  startIso: string;
  pending: AppointmentRecord[];
  confirmed: AppointmentRecord[];
}

/** The counsellor's own availability, grouped by day, each slot showing who's requested or confirmed on it. */
export function getWeekSlots(counsellorId: string, from: Date = new Date()): Record<string, CalendarSlot[]> {
  const db = load();
  const days: Record<string, CalendarSlot[]> = {};
  for (let d = 0; d < 7; d++) {
    days[daysAgo(-d, from).toDateString()] = [];
  }

  const relevant = db.availability
    .filter((a) => a.counsellorId === counsellorId)
    .sort((a, b) => a.startIso.localeCompare(b.startIso));

  for (const slot of relevant) {
    const dayKey = new Date(slot.startIso).toDateString();
    if (!(dayKey in days)) continue; // outside the visible 7-day window
    const matches = db.appointments.filter((a) => a.counsellorId === counsellorId && a.startIso === slot.startIso);
    days[dayKey].push({
      availabilityId: slot.id,
      startIso: slot.startIso,
      pending: matches.filter((a) => a.status === "requested"),
      confirmed: matches.filter((a) => a.status === "accepted"),
    });
  }
  return days;
}

export function listAvailability(counsellorId: string): AvailabilitySlot[] {
  return load().availability.filter((a) => a.counsellorId === counsellorId);
}

export function addAvailabilitySlot(counsellorId: string, startIso: string): AvailabilitySlot {
  const db = load();
  const slot: AvailabilitySlot = { id: `av-${crypto.randomUUID()}`, counsellorId, startIso };
  db.availability.push(slot);
  save(db);
  return slot;
}

/** Blocked only if the slot has a confirmed appointment — the one thing a counsellor can't undo from here. */
export function removeAvailabilitySlot(id: string): { ok: true } | { error: string } {
  const db = load();
  const slot = db.availability.find((a) => a.id === id);
  if (!slot) return { error: "Slot not found." };
  const hasConfirmed = db.appointments.some((a) => a.counsellorId === slot.counsellorId && a.startIso === slot.startIso && a.status === "accepted");
  if (hasConfirmed) return { error: "This slot has a confirmed session — cancel that session first." };

  // Any pending requests on it are orphaned by the removal — decline them so nothing is left dangling.
  const orphaned = db.appointments.filter((a) => a.counsellorId === slot.counsellorId && a.startIso === slot.startIso && a.status === "requested");
  for (const appt of orphaned) {
    appt.status = "declined";
    appt.reason = "Counsellor removed this time slot";
    postAutoMessage(db, appt, "counsellor", appt.reason);
  }
  db.availability = db.availability.filter((a) => a.id !== id);
  save(db);
  return { ok: true };
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

/** A student pulling back their own not-yet-confirmed request — no reason needed, nothing was promised yet. */
export function withdrawRequest(id: string): void {
  const db = load();
  const appt = db.appointments.find((a) => a.id === id);
  if (appt && appt.status === "requested") { appt.status = "cancelled"; save(db); }
}

/** Accepting one request auto-declines every other pending request on the same slot — only one student can have it. */
export function acceptAppointment(id: string): void {
  const db = load();
  const appt = db.appointments.find((a) => a.id === id);
  if (!appt) return;
  appt.status = "accepted";
  const siblings = db.appointments.filter(
    (a) => a.id !== id && a.counsellorId === appt.counsellorId && a.startIso === appt.startIso && a.status === "requested",
  );
  for (const sibling of siblings) {
    sibling.status = "declined";
    sibling.reason = "This time was given to another student";
    postAutoMessage(db, sibling, "counsellor", sibling.reason);
  }
  save(db);
}

export function declineAppointment(id: string, reason: string): void {
  const db = load();
  const appt = db.appointments.find((a) => a.id === id);
  if (!appt) return;
  appt.status = "declined";
  appt.reason = reason;
  postAutoMessage(db, appt, "counsellor", reason);
  save(db);
}

/** Cancelling a CONFIRMED session — either side can do this, both need to give a reason. */
export function cancelConfirmedAppointment(id: string, reason: string, by: Role): void {
  const db = load();
  const appt = db.appointments.find((a) => a.id === id);
  if (!appt) return;
  appt.status = "cancelled";
  appt.reason = reason;
  postAutoMessage(db, appt, by, reason);
  save(db);
}

function postAutoMessage(db: Db, appt: AppointmentRecord, sender: Role, reason: string): void {
  db.messages.push({
    id: `msg-${crypto.randomUUID()}`,
    studentId: appt.studentId,
    counsellorId: appt.counsellorId,
    sender,
    text: `Cancelled slot for: ${reason} — auto-generated`,
    atIso: new Date().toISOString(),
  });
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
