import { LogOut } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { PERSONAS, personaFromPath } from "@/config/nav";
import { useAppData } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";

/**
 * Persona-adaptive shell nav, ported from the prototype sidebar: brand mark,
 * the workspace label, a per-persona nav list, the facet-engine trust badge,
 * and the account row (now the real logged-in identity, with logout).
 */
export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = personaFromPath(location.pathname);
  const persona = PERSONAS[active];
  const { identity } = useAppData();
  const { logout } = useAuth();

  return (
    <aside
      style={{
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--color-divider)",
        padding: "var(--space-4) var(--space-3)",
        gap: "var(--space-4)",
        background: "color-mix(in srgb, var(--color-text) 2%, transparent)",
        height: "100vh",
      }}
    >
      {/* Brand */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5">
            <path d="M2 12h3l2-7 4 18 3-11 2 4h6" />
          </svg>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 20, letterSpacing: ".02em" }}>
            RESONANCE
          </span>
        </div>
        <div
          className="text-muted"
          style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", marginTop: 2, paddingLeft: 28 }}
        >
          Conversation Intelligence
        </div>
      </div>

      {/* Workspace label — persona now comes from the logged-in account, not a switcher */}
      <div className="blueprint" style={{ padding: "8px 10px" }}>
        <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
        <label
          className="text-muted"
          style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", display: "block", marginBottom: 2 }}
        >
          Workspace
        </label>
        <div style={{ fontSize: 13 }}>{persona.label}</div>
      </div>

      {/* Per-persona nav */}
      {persona.nav.length > 0 && (
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {persona.nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === persona.home}
              className="navbtn"
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "8px 10px",
                fontSize: 14,
                fontFamily: "var(--font-body)",
                textDecoration: "none",
                border: "none",
                cursor: "pointer",
                background: isActive ? "var(--color-accent-100)" : "transparent",
                color: isActive ? "var(--color-accent-800)" : "var(--color-text)",
              })}
            >
              <item.icon size={17} strokeWidth={1.5} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.live && (
                <span
                  style={{ width: 7, height: 7, borderRadius: "50%", background: "#c0392b", animation: "rec 1.4s infinite" }}
                />
              )}
            </NavLink>
          ))}
        </nav>
      )}

      {/* Bottom: facet-engine badge + account */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div className="blueprint" style={{ padding: "9px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
          <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5">
              <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span style={{ fontWeight: 500 }}>Facet engine live</span>
          </div>
          <div className="text-muted" style={{ fontSize: 10.5, lineHeight: 1.4 }}>
            662 facets → 5 dimensions. Every read carries a confidence weight.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingTop: 2,
            borderTop: "1px solid var(--color-divider)",
          }}
        >
          <div
            style={{
              width: 30, height: 30, border: "1px solid var(--color-divider)",
              display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontSize: 13,
            }}
          >
            {identity.initials}
          </div>
          <div style={{ lineHeight: 1.2, flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {active === "counsellor" ? `Dr. ${identity.name}` : identity.name}
            </div>
            <div className="text-muted" style={{ fontSize: 10.5 }}>{identity.title}</div>
          </div>
          <button
            type="button"
            onClick={() => { logout(); navigate("/login"); }}
            title="Sign out"
            className="text-muted"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "grid", placeItems: "center" }}
          >
            <LogOut size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
