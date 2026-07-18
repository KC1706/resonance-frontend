import { useNavigate } from "react-router-dom";
import { Blueprint, Tag } from "@/components/Blueprint";
import { state, tierStyle } from "@/lib/state";
import { useAppData } from "@/context/AppDataContext";

export function Caseload() {
  const navigate = useNavigate();
  const { caseload } = useAppData();
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--space-4)" }}>
        <div>
          <h2 style={{ margin: 0 }}>Caseload</h2>
          <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 14 }}>42 students · sorted by risk. The reason is always shown — no black-box tiering.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input" style={{ width: 200 }} placeholder="Search students…" />
          <button className="btn btn-secondary">Filters</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "var(--space-4)" }}>
        <Tag style={{ background: state.esc.bg, color: state.esc.fg }}>High · 3</Tag>
        <Tag style={{ background: state.watch.bg, color: state.watch.fg }}>Medium · 9</Tag>
        <Tag className="tag-accent">Low · 30</Tag>
        <Tag className="tag-outline">Downtrending, not booked · 2</Tag>
      </div>

      <Blueprint style={{ padding: "var(--space-4)" }}>
        <table className="table">
          <thead><tr><th>Student</th><th>Tier</th><th>Index</th><th>Trend</th><th>Reason</th><th>Last seen</th><th>Next</th></tr></thead>
          <tbody>
            {caseload.map((c) => (
              <tr key={c.id} onClick={() => navigate("/counsellor/profile")} style={{ cursor: "pointer" }}>
                <td>
                  <div style={{ fontWeight: 500 }}>{c.name}</div>
                  <div className="text-muted" style={{ fontSize: 11 }}>{c.id} · {c.dept}</div>
                </td>
                <td><Tag style={tierStyle(c.T)}>{c.tier}</Tag></td>
                <td style={{ fontFamily: "var(--font-heading)", fontSize: 15 }}>{c.idx}</td>
                <td style={{ color: c.tcol, fontFamily: "var(--font-heading)" }}>{c.trend}</td>
                <td style={{ fontSize: 12.5 }} className="text-muted">{c.reason}</td>
                <td style={{ fontSize: 12.5 }}>{c.seen}</td>
                <td style={{ fontSize: 12.5 }}>{c.next}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Blueprint>
    </div>
  );
}
