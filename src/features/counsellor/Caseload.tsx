import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Blueprint, Tag } from "@/components/Blueprint";
import { state, tierStyle, tierChipLabel } from "@/lib/state";
import { formatRelative, formatUpcoming } from "@/lib/dates";
import { useAppData } from "@/context/AppDataContext";
import { getCaseloadForCounsellor, listSessionsForStudent } from "@/data/db";

export function Caseload() {
  const navigate = useNavigate();
  const { identity } = useAppData();
  const [search, setSearch] = useState("");

  const rows = identity.recordId ? getCaseloadForCounsellor(identity.recordId) : [];
  const filtered = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    return !q || r.name.toLowerCase().includes(q) || r.student.code.toLowerCase().includes(q) || r.student.dept.toLowerCase().includes(q);
  });
  const counts = { high: 0, medium: 0, low: 0 };
  for (const r of rows) counts[r.tier]++;
  const downtrendingNotBooked = rows.filter((r) => r.trendDelta < 0 && !r.nextIso).length;

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--space-4)" }}>
        <div>
          <h2 style={{ margin: 0 }}>Caseload</h2>
          <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 14 }}>{rows.length} students · sorted by risk. The reason is always shown — no black-box tiering.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input" style={{ width: 200 }} placeholder="Search students…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "var(--space-4)" }}>
        <Tag style={{ background: state.esc.bg, color: state.esc.fg }}>High · {counts.high}</Tag>
        <Tag style={{ background: state.watch.bg, color: state.watch.fg }}>Medium · {counts.medium}</Tag>
        <Tag className="tag-accent">Low · {counts.low}</Tag>
        <Tag className="tag-outline">Downtrending, not booked · {downtrendingNotBooked}</Tag>
      </div>

      <Blueprint style={{ padding: "var(--space-4)" }}>
        <table className="table">
          <thead><tr><th>Student</th><th>Tier</th><th>Index</th><th>Trend</th><th>Reason</th><th>Last seen</th><th>Next</th></tr></thead>
          <tbody>
            {filtered.map((r) => {
              const trendColor = r.trendDelta > 0 ? "var(--color-accent)" : r.trendDelta < 0 ? state.esc.fg : "var(--color-neutral-600)";
              const trendLabel = r.trendDelta === 0 ? "—" : `${r.trendDelta > 0 ? "▲" : "▼"}${Math.abs(r.trendDelta)}`;
              const hasRealSessions = listSessionsForStudent(r.student.id).length > 0;
              return (
                <tr
                  key={r.student.id}
                  onClick={() => navigate("/counsellor/profile", { state: { studentId: r.student.id } })}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 500 }}>{r.name}</span>
                      {hasRealSessions && (
                        <span title="Has a recorded, analyzed session" style={{ fontSize: 10.5, color: "var(--color-accent)" }}>●</span>
                      )}
                    </div>
                    <div className="text-muted" style={{ fontSize: 11 }}>{r.student.code} · {r.student.dept}</div>
                  </td>
                  <td><Tag style={tierStyle(r.tier)}>{tierChipLabel(r.tier)}</Tag></td>
                  <td style={{ fontFamily: "var(--font-heading)", fontSize: 15 }}>{r.wellnessIndex}</td>
                  <td style={{ color: trendColor, fontFamily: "var(--font-heading)" }}>{trendLabel}</td>
                  <td style={{ fontSize: 12.5 }} className="text-muted">{r.reason}</td>
                  <td style={{ fontSize: 12.5 }}>{r.lastSeenIso ? formatRelative(new Date(r.lastSeenIso)) : "—"}</td>
                  <td style={{ fontSize: 12.5 }}>{r.nextIso ? formatUpcoming(new Date(r.nextIso)) : "—"}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-muted" style={{ fontSize: 13, padding: "16px 0" }}>No match.</td></tr>
            )}
          </tbody>
        </table>
      </Blueprint>
    </div>
  );
}
