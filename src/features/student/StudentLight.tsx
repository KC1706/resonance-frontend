import { Blueprint, Kicker, Tag } from "@/components/Blueprint";
import { studentStrengths, studentRes } from "@/data/mock";

export function StudentSessions() {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "var(--space-8)" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 34 }}>My sessions</h1>
      <p className="text-muted" style={{ margin: "0 0 var(--space-6)", fontSize: 14 }}>Book, join, and set what's captured — your choice, every time.</p>
      <Blueprint style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <Kicker>Upcoming</Kicker>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <div>
            <h4 style={{ margin: 0 }}>Thursday · 10:30 · Dr. Priya Das</h4>
            <div className="text-muted" style={{ fontSize: 12 }}>Recording: your choice at start</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary">Join</button>
            <button className="btn btn-secondary">Reschedule</button>
          </div>
        </div>
      </Blueprint>
      <Blueprint style={{ padding: "var(--space-4)" }}>
        <Kicker>Past</Kicker>
        {[["25 Mar · Session 4", "notes only"], ["11 Mar · Session 3", "full session"]].map(([a, b]) => (
          <div key={a} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)", fontSize: 13 }}>
            <span>{a}</span><span className="text-muted">{b}</span>
          </div>
        ))}
      </Blueprint>
    </div>
  );
}

export function StudentCheckin() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "var(--space-8)" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 34 }}>Check-in &amp; journal</h1>
      <p className="text-muted" style={{ margin: "0 0 var(--space-6)", fontSize: 14 }}>Optional and pressure-free — no streaks, no targets.</p>
      <Blueprint style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <h4 style={{ margin: "0 0 12px" }}>How's today feeling?</h4>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["Good", "Okay", "Mixed", "Heavy"].map((m) => <button key={m} className="btn btn-secondary" style={{ flex: 1 }}>{m}</button>)}
        </div>
      </Blueprint>
      <Blueprint style={{ padding: "var(--space-4)" }}>
        <h4 style={{ margin: "0 0 8px" }}>A few words, if you like</h4>
        <textarea className="input" style={{ minHeight: 120 }} placeholder="This stays private unless you choose to share it with your counsellor." />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <span className="text-muted" style={{ fontSize: 11.5 }}>Private by default · revocable</span>
          <button className="btn btn-primary">Save</button>
        </div>
      </Blueprint>
    </div>
  );
}

export function StudentProgress() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "var(--space-8)" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 34 }}>My progress</h1>
      <p className="text-muted" style={{ margin: "0 0 var(--space-6)", fontSize: 14 }}>This is about effort and self-awareness — not scores.</p>
      <Blueprint style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <h4 style={{ margin: "0 0 var(--space-3)" }}>You've been showing up</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {studentStrengths.map((g) => <Tag key={g} className="tag-accent">{g}</Tag>)}
        </div>
      </Blueprint>
      <Blueprint style={{ padding: "var(--space-4)" }}>
        <h4 style={{ margin: "0 0 var(--space-3)" }}>Gentle milestones</h4>
        <div style={{ fontSize: 13, lineHeight: 1.8 }}>
          A steadier sleep routine · set with Dr. Das<br />Naming what's hard out loud · you did this in your last session
        </div>
        <p className="text-muted" style={{ fontSize: 11, margin: "12px 0 0" }}>You'll never see a score or risk rating here — that's by design.</p>
      </Blueprint>
    </div>
  );
}

export function StudentResources() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "var(--space-8)" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 34 }}>Resources</h1>
      <p className="text-muted" style={{ margin: "0 0 var(--space-6)", fontSize: 14 }}>Short, usable tools — and a person, whenever you need one.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-4)" }}>
        {studentRes.map((r) => (
          <Blueprint key={r.t} style={{ padding: "var(--space-4)" }}>
            <h4 style={{ margin: "0 0 4px" }}>{r.t}</h4>
            <p className="text-muted" style={{ margin: 0, fontSize: 12.5 }}>{r.d}</p>
          </Blueprint>
        ))}
      </div>
      <Blueprint style={{ padding: "12px var(--space-4)", marginTop: "var(--space-4)", display: "flex", alignItems: "center", gap: 10, background: "color-mix(in srgb, var(--color-accent) 7%, transparent)" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 13.5 }}>Peer support circles</div>
          <div className="text-muted" style={{ fontSize: 12 }}>Small student groups — a validated first line of campus support.</div>
        </div>
        <button className="btn btn-secondary">Learn more</button>
      </Blueprint>
    </div>
  );
}
