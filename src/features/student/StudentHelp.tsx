import { Blueprint } from "@/components/Blueprint";

export function StudentHelp() {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "var(--space-8)" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 34 }}>Get help now</h1>
      <p className="text-muted" style={{ margin: "0 0 var(--space-6)", fontSize: 14 }}>Fast, calm access to a person. You don't have to explain everything first.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <Blueprint style={{ padding: "var(--space-4)", background: "color-mix(in srgb, var(--color-accent) 7%, transparent)" }}>
          <h4 style={{ margin: "0 0 var(--space-3)" }}>Talk to someone now</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn btn-primary btn-block" style={{ margin: 0 }}>Call a counsellor</button>
            <button className="btn btn-secondary btn-block" style={{ margin: 0 }}>Chat with the cell</button>
            <button className="btn btn-secondary btn-block" style={{ margin: 0 }}>National crisis line · 24/7</button>
          </div>
        </Blueprint>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 var(--space-3)" }}>Book for later</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn btn-secondary btn-block" style={{ margin: 0 }}>Book a session</button>
            <button className="btn btn-secondary btn-block" style={{ margin: 0 }}>Message my counsellor</button>
          </div>
        </Blueprint>
      </div>

      <Blueprint style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <h4 style={{ margin: "0 0 var(--space-3)" }}>Steady yourself in a moment</h4>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-secondary" style={{ flex: 1 }}>Box breathing · 2 min</button>
          <button className="btn btn-secondary" style={{ flex: 1 }}>5-4-3-2-1 grounding</button>
        </div>
      </Blueprint>

      <Blueprint style={{ padding: "12px var(--space-4)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 13.5 }}>Trusted contact</div>
          <div className="text-muted" style={{ fontSize: 12 }}>Choose one person we can help you reach.</div>
        </div>
        <button className="btn btn-secondary">Set contact</button>
      </Blueprint>
    </div>
  );
}
