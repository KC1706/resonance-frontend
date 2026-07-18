import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PERSONAS, personaFromPath } from "@/config/nav";

/**
 * No session → bounce to /login. Logged in but on the wrong persona's
 * routes (e.g. a student hitting /counsellor/*) → bounce to their own home,
 * matching the role-scoped routing rule in Login_Onboarding_Feature_Design.md §A4.
 */
export function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  const routePersona = personaFromPath(location.pathname);
  if (routePersona !== user.role) return <Navigate to={PERSONAS[user.role].home} replace />;

  return <Outlet />;
}
