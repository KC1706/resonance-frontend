import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Blueprint } from "@/components/Blueprint";
import { useAuth } from "@/context/AuthContext";
import { listDemoAccounts } from "@/data/db";
import { PERSONAS, type PersonaId } from "@/config/nav";

type Mode = "login" | "signup";

/**
 * Invitation-model login stands in for real SSO (see Login_Onboarding_Feature_Design.md
 * build-phase note): dummy accounts in localStorage, one quick-login tile per
 * seeded demo account so a tester never has to remember a password, plus a
 * lightweight student self-signup. The crisis link stays reachable pre-login.
 */
export function Login() {
  const { login, signupStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = listDemoAccounts();

  function goHomeFor(role: PersonaId) {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from && from.startsWith(`/${role}`) ? from : PERSONAS[role].home, { replace: true });
  }

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    const result = login(email, password);
    if (!result.ok) return setError(result.error);
    setError(null);
    const role = demoAccounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase())?.role ?? "student";
    goHomeFor(role);
  }

  function handleSignup(e: FormEvent) {
    e.preventDefault();
    const result = signupStudent(name, email, password);
    if (!result.ok) return setError(result.error);
    setError(null);
    goHomeFor("student");
  }

  function quickLogin(demoEmail: string) {
    const result = login(demoEmail, "demo1234");
    if (!result.ok) return setError(result.error);
    const role = demoAccounts.find((a) => a.email === demoEmail)?.role ?? "student";
    goHomeFor(role);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--color-bg)",
        padding: "var(--space-6)",
      }}
    >
      <div style={{ width: 400, maxWidth: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: "var(--space-6)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5">
            <path d="M2 12h3l2-7 4 18 3-11 2 4h6" />
          </svg>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 22, letterSpacing: ".02em" }}>
            RESONANCE
          </span>
        </div>

        <Blueprint style={{ padding: "var(--space-5)" }}>
          <h3 style={{ margin: "0 0 4px" }}>{mode === "login" ? "Sign in" : "Create a student account"}</h3>
          <p className="text-muted" style={{ margin: "0 0 var(--space-4)", fontSize: 12.5 }}>
            {mode === "login"
              ? "Access is by institution invitation. Counsellors are provisioned by their wellness cell."
              : "For trying the student side — a real campus rollout provisions students by roster."}
          </p>

          <form onSubmit={mode === "login" ? handleLogin : handleSignup} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mode === "signup" && (
              <input className="input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
            )}
            <input
              className="input" type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} required
            />
            <input
              className="input" type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)} required
            />
            {error && <div style={{ color: "var(--state-esc-fg)", fontSize: 12.5 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" style={{ marginTop: 4 }}>
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            className="btn btn-secondary"
            style={{ width: "100%", marginTop: 10 }}
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
          >
            {mode === "login" ? "New student? Create an account" : "Already have an account? Sign in"}
          </button>
        </Blueprint>

        {mode === "login" && (
          <Blueprint style={{ padding: "var(--space-4)", marginTop: "var(--space-4)" }}>
            <div className="text-muted" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>
              Quick demo login
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {demoAccounts.map((a) => (
                <button key={a.id} type="button" className="btn btn-secondary" style={{ justifyContent: "flex-start" }} onClick={() => quickLogin(a.email)}>
                  {a.name} <span className="text-muted" style={{ marginLeft: 6, fontSize: 11.5 }}>· {a.role}</span>
                </button>
              ))}
            </div>
          </Blueprint>
        )}

        <div style={{ textAlign: "center", marginTop: "var(--space-5)" }}>
          <a href="#" style={{ fontSize: 12.5, color: "var(--state-esc-fg)" }}>
            In crisis? Get support now — no sign-in needed.
          </a>
        </div>
      </div>
    </div>
  );
}
