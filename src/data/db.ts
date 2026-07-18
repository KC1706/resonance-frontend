/**
 * The persisted "database" for this build phase: real accounts, appointments,
 * messages, and opportunities, kept in localStorage instead of a server (see
 * docs/V2_Platform_Plan.md §2-3, §6-8). Screens never touch localStorage
 * directly — only through this module and AuthContext/AppDataContext.
 */
import { readJSON, writeJSON } from "@/lib/storage";
import { daysAgo, isSameDay } from "@/lib/dates";
import type { Tier } from "@/lib/state";

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

/** The counsellor-facing risk read — authored demo content standing in for the facet engine's real output. */
export interface CaseNote {
  tier: Tier;
  wellnessIndex: number;
  trendDelta: number; // signed, e.g. -17 or +4
  reason: string;
}

export interface StudentRecord {
  id: string;
  userId: string;
  code: string; // e.g. "A-238"
  dept: string;
  assignedCounsellorId: string | null;
  skills: string[];
  domains: string[];
  caseNote: CaseNote;
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
  /** A student-requested new time for this (currently accepted) session, awaiting the counsellor's decision. */
  pendingRescheduleIso?: string;
}

export interface JournalEntry {
  id: string;
  studentId: string;
  text: string;
  atIso: string;
}

export type CheckinMood = "Good" | "Okay" | "Mixed" | "Heavy";

export interface CheckinEntry {
  id: string;
  studentId: string;
  mood: CheckinMood;
  atIso: string;
}

/** A completed live-session write-up — what the Cockpit produces, Review shows, and Profile accumulates. */
export interface SessionRecord {
  id: string;
  studentId: string;
  counsellorId: string;
  atIso: string;
  sessionLabel: string;
  durationLabel: string;
  firstSession: boolean;
  index: number;
  keyMomentTs: string;
  keyMomentText: string;
  themes: string[];
  readings: Array<{ arrow: string; name: string; level: string; tone: "esc" | "watch"; quote: string; ts: string }>;
  note: string;
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
  journalEntries: JournalEntry[];
  checkins: CheckinEntry[];
  sessions: SessionRecord[];
}

const DB_KEY = "db:v7";

/** The Live Cockpit's scripted client (see features/counsellor/liveSession.ts) — a real student like any other. */
export const LUCY_STUDENT_ID = "s-lucy";

/** Starting hours so the calendar isn't empty on first login — the counsellor edits from here. */
const DEFAULT_DAILY_SLOT_TIMES: Array<[number, number]> = [[10, 0], [11, 30], [14, 0], [15, 30]];
const SLOT_MINUTES = 30;

function seed(): Db {
  const now = new Date();
  const users: UserRecord[] = [
    { id: "u-priya", role: "counsellor", email: "counsellor1@campusos.demo", password: "demo1234", name: "Priya Das" },
    { id: "u-aarav", role: "student", email: "student1@campusos.demo", password: "demo1234", name: "Aarav M." },
    { id: "u-rhea", role: "student", email: "student2@campusos.demo", password: "demo1234", name: "Rhea K." },
    { id: "u-jia", role: "student", email: "student3@campusos.demo", password: "demo1234", name: "Jia P." },
    { id: "u-dev", role: "student", email: "student4@campusos.demo", password: "demo1234", name: "Dev A." },
    { id: "u-kabir", role: "student", email: "student5@campusos.demo", password: "demo1234", name: "Kabir N." },
    { id: "u-sana", role: "student", email: "student6@campusos.demo", password: "demo1234", name: "Sana R." },
    { id: "u-meera", role: "student", email: "student7@campusos.demo", password: "demo1234", name: "Meera S." },
    { id: "u-ishaan", role: "student", email: "student8@campusos.demo", password: "demo1234", name: "Ishaan T." },
    { id: "u-lucy", role: "student", email: "student9@campusos.demo", password: "demo1234", name: "Lucy H." },
  ];
  const counsellors: CounsellorRecord[] = [
    { id: "c-priya", userId: "u-priya", initials: "PD", title: "Wellness Cell · IIT KGP" },
  ];
  const students: StudentRecord[] = [
    {
      id: "s-aarav", userId: "u-aarav", code: "A-238", dept: "Mechanical · Y2", assignedCounsellorId: "c-priya",
      skills: ["Python", "CAD", "Mechanical Design"], domains: ["Mechanical Engineering", "Robotics"],
      caseNote: { tier: "high", wellnessIndex: 41, trendDelta: -17, reason: "Hopelessness flagged · index ↓ 3 sessions" },
    },
    {
      id: "s-jia", userId: "u-jia", code: "J-190", dept: "CSE · Y3", assignedCounsellorId: "c-priya",
      skills: ["Python", "Data Structures"], domains: ["Computer Science"],
      caseNote: { tier: "high", wellnessIndex: 44, trendDelta: -9, reason: "Panic episodes before vivas" },
    },
    {
      id: "s-dev", userId: "u-dev", code: "D-260", dept: "Physics · Y1", assignedCounsellorId: "c-priya",
      skills: ["Data Analysis"], domains: ["Physics"],
      caseNote: { tier: "high", wellnessIndex: 46, trendDelta: -6, reason: "Homesickness · isolation rising" },
    },
    {
      id: "s-kabir", userId: "u-kabir", code: "K-311", dept: "EE · Y2", assignedCounsellorId: "c-priya",
      skills: ["Circuit Design"], domains: ["Electrical Engineering"],
      caseNote: { tier: "medium", wellnessIndex: 55, trendDelta: -14, reason: "Down-trending, not booked" },
    },
    {
      id: "s-sana", userId: "u-sana", code: "S-077", dept: "Chem · Y2", assignedCounsellorId: "c-priya",
      skills: ["Lab Research"], domains: ["Chemistry"],
      caseNote: { tier: "medium", wellnessIndex: 57, trendDelta: -9, reason: "Missed last 2 sessions" },
    },
    {
      id: "s-rhea", userId: "u-rhea", code: "R-104", dept: "Civil · Y1", assignedCounsellorId: "c-priya",
      skills: ["AutoCAD", "Structural Analysis"], domains: ["Civil Engineering", "Construction"],
      caseNote: { tier: "low", wellnessIndex: 71, trendDelta: 4, reason: "Settling in · improving" },
    },
    {
      id: "s-meera", userId: "u-meera", code: "M-052", dept: "Aero · Y4", assignedCounsellorId: "c-priya",
      skills: ["Aerodynamics"], domains: ["Aerospace"],
      caseNote: { tier: "low", wellnessIndex: 76, trendDelta: 2, reason: "Steady · post-grad planning" },
    },
    {
      id: "s-ishaan", userId: "u-ishaan", code: "I-076", dept: "Maths · Y3", assignedCounsellorId: "c-priya",
      skills: ["Statistics"], domains: ["Mathematics"],
      caseNote: { tier: "low", wellnessIndex: 69, trendDelta: 1, reason: "Maintenance sessions" },
    },
    {
      // The Live Cockpit's scripted client — cold-start until her intake session (lucy-session.mp3) completes,
      // at which point applySessionToStudent() below fills this in for real.
      id: LUCY_STUDENT_ID, userId: "u-lucy", code: "L-207", dept: "English · Y2", assignedCounsellorId: "c-priya",
      skills: [], domains: ["English Literature"],
      caseNote: { tier: "low", wellnessIndex: 0, trendDelta: 0, reason: "Baseline pending — intake session not yet run" },
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

  // Real appointments so "today's schedule," "last seen," and "next" are all computed, not authored strings.
  function appointmentAt(studentId: string, dayOffset: number, hh: number, mm: number, status: AppointmentStatus): AppointmentRecord {
    const start = new Date(now);
    start.setDate(start.getDate() + dayOffset);
    start.setHours(hh, mm, 0, 0);
    const end = new Date(start.getTime() + SLOT_MINUTES * 60000);
    return { id: `appt-${crypto.randomUUID()}`, studentId, counsellorId: "c-priya", startIso: start.toISOString(), endIso: end.toISOString(), status };
  }
  const acceptedAt = (studentId: string, dayOffset: number, hh: number, mm: number) => appointmentAt(studentId, dayOffset, hh, mm, "accepted");
  const requestedAt = (studentId: string, dayOffset: number, hh: number, mm: number) => appointmentAt(studentId, dayOffset, hh, mm, "requested");

  // Times deliberately match DEFAULT_DAILY_SLOT_TIMES so these show up in the Calendar's slot grid too.
  const appointments: AppointmentRecord[] = [
    // Today
    acceptedAt("s-aarav", 0, 10, 0),
    acceptedAt("s-rhea", 0, 11, 30),
    acceptedAt("s-ishaan", 0, 14, 0),
    acceptedAt("s-meera", 0, 15, 30),
    // Past, so "last seen" is real
    acceptedAt("s-jia", -2, 10, 0),
    acceptedAt("s-dev", -5, 14, 0),
    acceptedAt("s-kabir", -21, 10, 0),   // 3 weeks ago, nothing booked since
    acceptedAt("s-sana", -21, 11, 30),   // 3 weeks ago, missed since
    acceptedAt("s-ishaan", -6, 15, 30),  // an older session too, for history depth
    // Rest of the week, so the calendar isn't only busy today
    acceptedAt("s-jia", 4, 11, 30),
    acceptedAt("s-rhea", 2, 11, 30),
    acceptedAt("s-meera", 3, 10, 0),
    acceptedAt("s-ishaan", 5, 14, 0),
    // Pending requests waiting on the counsellor — including two on the same slot,
    // since a slot can take more than one confirmed student (see Calendar.tsx).
    requestedAt("s-dev", 1, 10, 0),
    requestedAt("s-kabir", 1, 10, 0),
    requestedAt("s-sana", 2, 14, 0),
    // Lucy's intake — the Live Cockpit's scripted session, playable today.
    // (Shares a slot time with Meera's — a slot can hold more than one confirmed student.)
    acceptedAt(LUCY_STUDENT_ID, 0, 15, 30),
  ];

  const opportunities: OpportunityRecord[] = [
    { id: "o-1", title: "Mechanical Design Intern", org: "Tata AutoComp", type: "internship", tags: ["Mechanical Design", "CAD"], deadlineIso: daysAgo(-21, now).toISOString(), link: "#" },
    { id: "o-2", title: "Robotics Hackathon 2026", org: "IIT KGP Robotics Club", type: "hackathon", tags: ["Robotics", "Python"], deadlineIso: daysAgo(-10, now).toISOString(), link: "#" },
    { id: "o-3", title: "Structural Analyst — Grad Trainee", org: "L&T Construction", type: "job", tags: ["Civil Engineering", "Structural Analysis"], deadlineIso: daysAgo(-30, now).toISOString(), link: "#" },
    { id: "o-4", title: "Site Engineering Intern", org: "Shapoorji Pallonji", type: "internship", tags: ["Construction", "AutoCAD"], deadlineIso: daysAgo(-14, now).toISOString(), link: "#" },
    { id: "o-5", title: "Software Intern — Data Tools", org: "Sprinklr", type: "internship", tags: ["Python"], deadlineIso: daysAgo(-18, now).toISOString(), link: "#" },
    { id: "o-6", title: "Smart India Hackathon", org: "Govt. of India", type: "hackathon", tags: ["Mechanical Design", "Robotics", "Python"], deadlineIso: daysAgo(-25, now).toISOString(), link: "#" },
  ];

  return { users, counsellors, students, availability, appointments, messages, opportunities, journalEntries: [], checkins: [], sessions: [] };
}

/** Fields added to the schema after some browsers already had this key cached — never crash on a stale shape. */
function backfill(db: Db): Db {
  db.availability ??= [];
  db.appointments ??= [];
  db.messages ??= [];
  db.opportunities ??= [];
  db.journalEntries ??= [];
  db.checkins ??= [];
  db.sessions ??= [];
  return db;
}

function load(): Db {
  return backfill(readJSON<Db>(DB_KEY, seed()));
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
    caseNote: { tier: "low", wellnessIndex: 0, trendDelta: 0, reason: "Baseline pending — no sessions yet" },
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
  /** Confirmed sessions elsewhere whose student is asking to move here instead. */
  rescheduleRequests: AppointmentRecord[];
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
      rescheduleRequests: db.appointments.filter((a) => a.counsellorId === counsellorId && a.pendingRescheduleIso === slot.startIso),
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
  const hasIncomingReschedule = db.appointments.some((a) => a.counsellorId === slot.counsellorId && a.pendingRescheduleIso === slot.startIso);
  if (hasIncomingReschedule) return { error: "A student has asked to move a session here — approve or decline that first." };

  // Any pending requests on it are orphaned by the removal — decline them so nothing is left dangling.
  const orphaned = db.appointments.filter((a) => a.counsellorId === slot.counsellorId && a.startIso === slot.startIso && a.status === "requested");
  for (const appt of orphaned) {
    appt.status = "declined";
    appt.reason = "Counsellor removed this time slot";
    postAutoMessage(db, appt, "counsellor", `Cancelled slot for: ${appt.reason}`);
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

/** One row per assigned student — the Caseload screen and Home's rollup both read this, so they can't drift apart. */
export interface CaseloadRow {
  student: StudentRecord;
  name: string;
  tier: Tier;
  wellnessIndex: number;
  trendDelta: number;
  reason: string;
  /** Most recent past accepted session, if any — real, not an authored "3w ago" string. */
  lastSeenIso: string | null;
  /** Soonest future accepted session, if any. */
  nextIso: string | null;
}

export function getCaseloadForCounsellor(counsellorId: string, from: Date = new Date()): CaseloadRow[] {
  const db = load();
  return listStudentsForCounsellor(counsellorId).map((student) => {
    const accepted = db.appointments.filter((a) => a.studentId === student.id && a.counsellorId === counsellorId && a.status === "accepted");
    const past = accepted.filter((a) => new Date(a.startIso).getTime() <= from.getTime()).sort((a, b) => b.startIso.localeCompare(a.startIso));
    const future = accepted.filter((a) => new Date(a.startIso).getTime() > from.getTime()).sort((a, b) => a.startIso.localeCompare(b.startIso));
    return {
      student,
      name: getStudentName(student.id),
      tier: student.caseNote.tier,
      wellnessIndex: student.caseNote.wellnessIndex,
      trendDelta: student.caseNote.trendDelta,
      reason: student.caseNote.reason,
      lastSeenIso: past[0]?.startIso ?? null,
      nextIso: future[0]?.startIso ?? null,
    };
  });
}

/** Today's confirmed sessions for this counsellor, in order — what Home's schedule actually shows. */
export function getTodaysAppointments(counsellorId: string, from: Date = new Date()): Array<AppointmentRecord & { studentName: string; tier: Tier }> {
  const db = load();
  return db.appointments
    .filter((a) => a.counsellorId === counsellorId && a.status === "accepted" && isSameDay(new Date(a.startIso), from))
    .sort((a, b) => a.startIso.localeCompare(b.startIso))
    .map((a) => {
      const student = db.students.find((s) => s.id === a.studentId);
      return { ...a, studentName: getStudentName(a.studentId), tier: student?.caseNote.tier ?? "low" };
    });
}

/** Trending down with nothing booked — the quiet decliners, computed from the same caseload rows Caseload shows. */
export function getNeedsAttention(counsellorId: string, from: Date = new Date()): CaseloadRow[] {
  return getCaseloadForCounsellor(counsellorId, from).filter((r) => r.trendDelta < 0 && !r.nextIso);
}

// ── Sessions (Live Cockpit → Review → Profile write-through) ────────────────

function tierFromIndex(index: number): Tier {
  if (index < 50) return "high";
  if (index < 65) return "medium";
  return "low";
}

export function listSessionsForStudent(studentId: string): SessionRecord[] {
  return load().sessions
    .filter((s) => s.studentId === studentId)
    .sort((a, b) => b.atIso.localeCompare(a.atIso));
}

export function getLatestSessionForStudent(studentId: string): SessionRecord | null {
  const sessions = listSessionsForStudent(studentId);
  return sessions[0] ?? null;
}

/**
 * The moment a live session ends, this is what makes it real: a durable
 * SessionRecord in that student's history, and their caseNote (index/tier/
 * trend/reason) updated to match — instead of the result only living in
 * whatever component happened to trigger it.
 */
export function applySessionToStudent(
  studentId: string,
  counsellorId: string,
  input: Omit<SessionRecord, "id" | "studentId" | "counsellorId" | "atIso">,
): SessionRecord {
  const db = load();
  const record: SessionRecord = {
    id: `sess-${crypto.randomUUID()}`, studentId, counsellorId, atIso: new Date().toISOString(), ...input,
  };
  db.sessions.push(record);

  const student = db.students.find((s) => s.id === studentId);
  if (student) {
    const previousIndex = student.caseNote.wellnessIndex;
    const worst = input.readings.find((r) => r.tone === "esc") ?? input.readings[0];
    student.caseNote = {
      tier: tierFromIndex(input.index),
      wellnessIndex: input.index,
      trendDelta: input.firstSession ? 0 : input.index - previousIndex,
      reason: worst ? `${worst.name} flagged${input.firstSession ? " at intake" : ""}` : "Session recorded",
    };
  }
  save(db);
  return record;
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

/** A slot can hold more than one confirmed student (e.g. a group session) — accepting one doesn't touch the others. */
export function acceptAppointment(id: string): void {
  const db = load();
  const appt = db.appointments.find((a) => a.id === id);
  if (!appt) return;
  appt.status = "accepted";
  save(db);
}

export function declineAppointment(id: string, reason: string): void {
  const db = load();
  const appt = db.appointments.find((a) => a.id === id);
  if (!appt) return;
  appt.status = "declined";
  appt.reason = reason;
  postAutoMessage(db, appt, "counsellor", `Declined for: ${reason}`);
  save(db);
}

/** Cancelling a CONFIRMED session — either side can do this, both need to give a reason. */
export function cancelConfirmedAppointment(id: string, reason: string, by: Role): void {
  const db = load();
  const appt = db.appointments.find((a) => a.id === id);
  if (!appt) return;
  appt.status = "cancelled";
  appt.reason = reason;
  postAutoMessage(db, appt, by, `Cancelled slot for: ${reason}`);
  save(db);
}

/** Student asks to move a CONFIRMED session to a new time — the old time stands until the counsellor decides. */
export function requestReschedule(appointmentId: string, newStartIso: string): void {
  const db = load();
  const appt = db.appointments.find((a) => a.id === appointmentId);
  if (!appt || appt.status !== "accepted") return;
  appt.pendingRescheduleIso = newStartIso;
  save(db);
}

export function withdrawRescheduleRequest(appointmentId: string): void {
  const db = load();
  const appt = db.appointments.find((a) => a.id === appointmentId);
  if (appt) { appt.pendingRescheduleIso = undefined; save(db); }
}

/** Approving moves the session in place — the old time is gone, replaced by the new one, not a second entry. */
export function approveReschedule(appointmentId: string): void {
  const db = load();
  const appt = db.appointments.find((a) => a.id === appointmentId);
  if (!appt || !appt.pendingRescheduleIso) return;
  const start = new Date(appt.pendingRescheduleIso);
  const end = new Date(start.getTime() + SLOT_MINUTES * 60000);
  appt.startIso = start.toISOString();
  appt.endIso = end.toISOString();
  appt.pendingRescheduleIso = undefined;
  save(db);
}

export function declineReschedule(appointmentId: string, reason: string): void {
  const db = load();
  const appt = db.appointments.find((a) => a.id === appointmentId);
  if (!appt) return;
  appt.pendingRescheduleIso = undefined;
  postAutoMessage(db, appt, "counsellor", `Reschedule request declined: ${reason}`);
  save(db);
}

function postAutoMessage(db: Db, appt: AppointmentRecord, sender: Role, text: string): void {
  db.messages.push({
    id: `msg-${crypto.randomUUID()}`,
    studentId: appt.studentId,
    counsellorId: appt.counsellorId,
    sender,
    text: `${text} — auto-generated`,
    atIso: new Date().toISOString(),
  });
}

// ── Journal & check-ins ──────────────────────────────────────────────────────

export function addJournalEntry(studentId: string, text: string): JournalEntry {
  const db = load();
  const entry: JournalEntry = { id: `jrn-${crypto.randomUUID()}`, studentId, text, atIso: new Date().toISOString() };
  db.journalEntries.push(entry);
  save(db);
  return entry;
}

/** Most recent first, so a student sees what they wrote most recently at the top. */
export function listJournalEntries(studentId: string): JournalEntry[] {
  return load().journalEntries
    .filter((e) => e.studentId === studentId)
    .sort((a, b) => b.atIso.localeCompare(a.atIso));
}

export function addCheckin(studentId: string, mood: CheckinMood): CheckinEntry {
  const db = load();
  const entry: CheckinEntry = { id: `chk-${crypto.randomUUID()}`, studentId, mood, atIso: new Date().toISOString() };
  db.checkins.push(entry);
  save(db);
  return entry;
}

export function getCheckinForToday(studentId: string, from: Date = new Date()): CheckinEntry | null {
  const todays = load().checkins.filter((c) => c.studentId === studentId && isSameDay(new Date(c.atIso), from));
  return todays.length ? todays[todays.length - 1] : null;
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
