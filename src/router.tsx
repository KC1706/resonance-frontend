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
import { StudentHome } from "@/features/student/StudentHome";
import { StudentHelp } from "@/features/student/StudentHelp";
import { StudentData } from "@/features/student/StudentData";
import {
  StudentSessions, StudentCheckin, StudentProgress, StudentResources,
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

          // Student
          { path: "student", element: <StudentHome /> },
          { path: "student/help", element: <StudentHelp /> },
          { path: "student/sessions", element: <StudentSessions /> },
          { path: "student/checkin", element: <StudentCheckin /> },
          { path: "student/progress", element: <StudentProgress /> },
          { path: "student/resources", element: <StudentResources /> },
          { path: "student/data", element: <StudentData /> },

          { path: "*", element: <Navigate to="/counsellor" replace /> },
        ],
      },
    ],
  },
]);
