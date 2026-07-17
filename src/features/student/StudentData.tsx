import { Blueprint, Tag } from "@/components/Blueprint";
import { state } from "@/lib/state";
import { dataItems, whoSees, consentLog } from "@/data/mock";

export function StudentData() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "var(--space-8)" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 34 }}>My data &amp; consent</h1>
      <p className="text-muted" style={{ margin: "0 0 var(--space-6)", fontSize: 14 }}>Declining is as easy as accepting. Every change takes effect right away.</p>

      <Blueprint style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <h4 style={{ margin: "0 0 var(--space-3)" }}>What's collected</h4>
        {dataItems.map((d) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{d.name}</div>
              <div className="text-muted" style={{ fontSize: 11.5 }}>{d.note}</div>
            </div>
            <Tag style={{ background: d.pillBg, color: d.pillFg }}>{d.pill}</Tag>
          </div>
        ))}
      </Blueprint>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 var(--space-3)" }}>Who can see what</h4>
          {whoSees.map((w) => (
            <div key={w.who} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{w.who}</div>
                <div className="text-muted" style={{ fontSize: 11.5 }}>{w.what}</div>
              </div>
              <Tag style={{ background: w.bg, color: w.fg }}>{w.badge}</Tag>
            </div>
          ))}
        </Blueprint>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 var(--space-3)" }}>Recording default</h4>
          <div className="seg" style={{ display: "flex", flexDirection: "column", border: "none", gap: 6 }}>
            <label className="radio"><input type="radio" name="rec" defaultChecked /><span className="dot" />Full session</label>
            <label className="radio"><input type="radio" name="rec" /><span className="dot" />Notes only</label>
            <label className="radio"><input type="radio" name="rec" /><span className="dot" />Off</label>
          </div>
          <p className="text-muted" style={{ fontSize: 11, margin: "12px 0 0" }}>You can override this before any session.</p>
        </Blueprint>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 var(--space-3)" }}>Your controls</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn btn-secondary btn-block" style={{ margin: 0 }}>Export my data</button>
            <button className="btn btn-secondary btn-block" style={{ margin: 0 }}>Revoke consent</button>
            <button className="btn btn-ghost btn-block" style={{ margin: 0, color: state.esc.fg }}>Delete everything</button>
          </div>
        </Blueprint>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 var(--space-3)" }}>Consent history</h4>
          {consentLog.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)", fontSize: 12.5 }}>
              <span className="text-muted" style={{ width: 70, flex: "none" }}>{l.when}</span>
              <span>{l.what}</span>
            </div>
          ))}
        </Blueprint>
      </div>
    </div>
  );
}
