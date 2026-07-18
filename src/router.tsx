import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { RequireAuth } from "@/app/RequireAuth";
import { Login } from "@/features/auth/Login";
import { HomeToday } from "@/features/counsellor/HomeToday";
import { LiveCockpit } from "@/features/counsellor/LiveCockpit";
import { Review } from "@/features/counsellor/Review";
import { Profile } from "@/features/counsellor/Profile";
import { Upload } from "@/features/counsellor/Upload";
import { Caseload } from "@/features/counsellor/Caseload";
import { Calendar } from "@/features/counsellor/Calendar";
import { Messages } from "@/features/counsellor/Messages";
import { StudentHome } from "@/features/student/StudentHome";
import { StudentMessages } from "@/features/student/StudentMessages";
import { StudentOpportunities } from "@/features/student/StudentOpportunities";
import {
  StudentSessions, StudentCheckin, StudentProgress,
} from "@/features/student/StudentLight";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/counsellor" replace /> },

          // Counsellor
          { path: "counsellor", element: <HomeToday /> },
          { path: "counsellor/cockpit", element: <LiveCockpit /> },
          { path: "counsellor/review", element: <Review /> },
          { path: "counsellor/profile", element: <Profile /> },
          { path: "counsellor/upload", element: <Upload /> },
          { path: "counsellor/caseload", element: <Caseload /> },
          { path: "counsellor/calendar", element: <Calendar /> },
          { path: "counsellor/messages", element: <Messages /> },

          // Student
          { path: "student", element: <StudentHome /> },
          { path: "student/sessions", element: <StudentSessions /> },
          { path: "student/messages", element: <StudentMessages /> },
          { path: "student/checkin", element: <StudentCheckin /> },
          { path: "student/progress", element: <StudentProgress /> },
          { path: "student/opportunities", element: <StudentOpportunities /> },
          // Retired screens folded into Home / My progress — keep old links from 404ing.
          { path: "student/help", element: <Navigate to="/student" replace /> },
          { path: "student/resources", element: <Navigate to="/student/progress" replace /> },
          { path: "student/data", element: <Navigate to="/student" replace /> },

          { path: "*", element: <Navigate to="/counsellor" replace /> },
        ],
      },
    ],
  },
]);
