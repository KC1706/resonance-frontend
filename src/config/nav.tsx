import {
  Home, AudioLines, FileText, UserRound, Upload, Users,
  CalendarDays, NotebookPen, Sparkles,
  MessageCircle, Briefcase,
  type LucideIcon,
} from "lucide-react";

export type PersonaId = "counsellor" | "student";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  live?: boolean;
}

export interface Persona {
  id: PersonaId;
  label: string; // shown in the workspace <select>
  home: string;
  nav: NavItem[]; // empty → single-page persona (no left nav, matching the prototype)
}

export const PERSONAS: Record<PersonaId, Persona> = {
  counsellor: {
    id: "counsellor",
    label: "Campus · Counsellor",
    home: "/counsellor",
    nav: [
      { to: "/counsellor", label: "Home / Today", icon: Home },
      { to: "/counsellor/cockpit", label: "Live Cockpit", icon: AudioLines, live: true },
      { to: "/counsellor/review", label: "Post-Session Review", icon: FileText },
      { to: "/counsellor/profile", label: "Student Profile", icon: UserRound },
      { to: "/counsellor/upload", label: "Upload & Analyze", icon: Upload },
      { to: "/counsellor/caseload", label: "Caseload", icon: Users },
      { to: "/counsellor/calendar", label: "Calendar", icon: CalendarDays },
      { to: "/counsellor/messages", label: "Messages", icon: MessageCircle },
    ],
  },
  student: {
    id: "student",
    label: "Campus · Student",
    home: "/student",
    nav: [
      { to: "/student", label: "Home", icon: Home },
      { to: "/student/sessions", label: "My sessions", icon: CalendarDays },
      { to: "/student/messages", label: "Messages", icon: MessageCircle },
      { to: "/student/checkin", label: "Check-in & journal", icon: NotebookPen },
      { to: "/student/progress", label: "My progress", icon: Sparkles },
      { to: "/student/opportunities", label: "Opportunities", icon: Briefcase },
    ],
  },
};

export const PERSONA_ORDER: PersonaId[] = ["counsellor", "student"];

export function personaFromPath(pathname: string): PersonaId {
  const seg = pathname.split("/")[1] as PersonaId;
  return PERSONA_ORDER.includes(seg) ? seg : "counsellor";
}
