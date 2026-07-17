import { Blueprint, StatCard, Kicker, Tag } from "@/components/Blueprint";
import { commStats, calls, commThemes } from "@/data/mock";

export function Commercial() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)" }}>
      <div style={{ marginBottom: "var(--space-4)" }}>
        <Kicker>Commercial Edition · same facet engine, customer psychographics</Kicker>
        <h2 style={{ margin: 0 }}>Conversation warehouse</h2>
        <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 14 }}>
          Every support, sales &amp; product call — searchable, with a psychological read on top of talk analytics.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "var(--space-6)" }}>
        <input className="input" style={{ flex: 1 }} placeholder={`Ask your calls — "why are enterprise trials churning?"`} />
        <button className="btn btn-primary">Ask</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        {commStats.map((s) => <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} color={s.color} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--space-6)" }}>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 var(--space-3)" }}>Recent calls</h4>
          <table className="table">
            <thead><tr><th>Customer</th><th>Type</th><th>Sentiment</th><th>Psychographic read</th><th>Risk</th></tr></thead>
            <tbody>
              {calls.map((c) => (
                <tr key={c.cust}>
                  <td style={{ fontWeight: 500 }}>{c.cust}</td>
                  <td style={{ fontSize: 12 }}>{c.type}</td>
                  <td style={{ color: c.scol, fontFamily: "var(--font-heading)" }}>{c.sent}</td>
                  <td style={{ fontSize: 12 }}>{c.psych}</td>
                  <td><Tag style={{ background: c.rbg, color: c.rfg }}>{c.risk}</Tag></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Blueprint>
        <Blueprint style={{ padding: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 var(--space-3)" }}>Emerging themes</h4>
          {commThemes.map((t) => (
            <div key={t.name} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
                <span>{t.name}</span>
                <span className="text-muted">{t.count} mentions {t.trend}</span>
              </div>
              <div style={{ height: 7, background: "color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
                <div style={{ height: "100%", width: `${t.pct}%`, background: t.col }} />
              </div>
            </div>
          ))}
        </Blueprint>
      </div>
    </div>
  );
}
