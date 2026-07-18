import { useNavigate } from "react-router-dom";
import { Blueprint, Kicker, Tag } from "@/components/Blueprint";
import { useAppData } from "@/context/AppDataContext";

export function StudentHome() {
  const navigate = useNavigate();
  const { studentStrengths, studentRes } = useAppData();
  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "var(--space-8)" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 38 }}>Hi Aarav.</h1>
      <p className="text-muted" style={{ margin: "0 0 var(--space-6)", fontSize: 15 }}>Your space. You decide what's shared.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <Blueprint style={{ padding: "var(--space-4)", background: "color-mix(in srgb, var(--color-accent) 7%, transparent)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5"><path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z" /></svg>
            <h4 style={{ margin: 0 }}>Need support right now?</h4>
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 13.5 }}>You can reach a person any time — no forms, no waiting.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => navigate("/student/help")}>Talk to someone</button>
            <button className="btn btn-secondary">Confidential helpline</button>
          </div>
        </Blueprint>

        <Blueprint style={{ padding: "var(--space-4)" }}>
          <Kicker>Next session</Kicker>
          <h4 style={{ margin: "2px 0" }}>Thursday · 10:30 · Dr. Priya Das</h4>
          <p className="text-muted" style={{ margin: "0 0 12px", fontSize: 12.5 }}>You choose what's recorded before we start — full, notes-only, or off.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary">Join</button>
            <button className="btn btn-secondary">Reschedule</button>
          </div>
        </Blueprint>
      </div>

      <Blueprint style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <h4 style={{ margin: "0 0 4px" }}>How's today feeling?</h4>
        <p className="text-muted" style={{ margin: "0 0 12px", fontSize: 12.5 }}>Just for you, unless you choose to share it.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["Good", "Okay", "Mixed", "Heavy"].map((m) => <button key={m} className="btn btn-secondary" style={{ flex: 1 }}>{m}</button>)}
        </div>
      </Blueprint>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 var(--space-3)" }}>What you've been working on</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {studentStrengths.map((g) => <Tag key={g} className="tag-accent">{g}</Tag>)}
          </div>
        </Blueprint>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 var(--space-3)" }}>Things that might help</h4>
          {studentRes.map((r) => (
            <div key={r.t} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.t}</div>
                <div className="text-muted" style={{ fontSize: 11.5 }}>{r.d}</div>
              </div>
              <span style={{ color: "var(--color-accent)" }}>→</span>
            </div>
          ))}
        </Blueprint>
      </div>

      <Blueprint style={{ padding: "12px var(--space-4)", marginTop: "var(--space-4)", display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5"><rect x="4" y="10" width="16" height="10" rx="1" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 13.5 }}>Your data, your control</div>
          <div className="text-muted" style={{ fontSize: 12 }}>See exactly what's shared and with whom — change or revoke anytime.</div>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate("/student/data")}>Open</button>
      </Blueprint>
    </div>
  );
}
