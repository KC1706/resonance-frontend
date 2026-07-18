import { useNavigate } from "react-router-dom";
import { Blueprint } from "@/components/Blueprint";
import { useAppData } from "@/context/AppDataContext";

export function Upload() {
  const navigate = useNavigate();
  const { uploads } = useAppData();
  return (
    <div style={{ maxWidth: 1020, margin: "0 auto", padding: "var(--space-6) var(--space-8) var(--space-8)" }}>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h2 style={{ margin: 0 }}>Upload &amp; analyze</h2>
        <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 14 }}>
          Bring recorded sessions into the same pipeline as live ones. Also the on-ramp for bulk B2B archive ingestion.
        </p>
      </div>

      <Blueprint style={{ padding: "var(--space-8)", textAlign: "center", borderStyle: "dashed", marginBottom: "var(--space-6)" }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" style={{ margin: "0 auto" }}>
          <path d="M12 15V4m0 0L8 8m4-4 4 4M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
        </svg>
        <h4 style={{ margin: "12px 0 4px" }}>Drop audio files or a whole archive here</h4>
        <p className="text-muted" style={{ margin: "0 0 14px", fontSize: 13 }}>Format-agnostic · multi-speaker diarization · Hindi–English code-switch</p>
        <button className="btn btn-primary">Browse files</button>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 18, flexWrap: "wrap" }}>
          <div className="field" style={{ textAlign: "left" }}>
            <label>Language</label>
            <select className="input" style={{ minHeight: 32 }}><option>Auto (code-switch)</option><option>English</option><option>Hindi</option></select>
          </div>
          <div className="field" style={{ textAlign: "left" }}>
            <label>Speaker labels</label>
            <select className="input" style={{ minHeight: 32 }}><option>Counsellor + Student</option><option>Detect (n-way)</option></select>
          </div>
          <div className="field" style={{ textAlign: "left" }}>
            <label>Destination</label>
            <select className="input" style={{ minHeight: 32 }}><option>Merge into profile (consent-gated)</option><option>Analyse standalone</option></select>
          </div>
        </div>
      </Blueprint>

      <Blueprint style={{ padding: "var(--space-4)" }}>
        <h4 style={{ margin: "0 0 var(--space-3)" }}>Processing queue</h4>
        {uploads.map((u) => (
          <div key={u.name} style={{ display: "grid", gridTemplateColumns: "24px 1fr 180px auto", gap: 12, alignItems: "center", padding: "11px 0", borderTop: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5"><path d="M9 18V6l10-2v12" /><circle cx="6" cy="18" r="2.5" /><circle cx="16" cy="16" r="2.5" /></svg>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{u.name}</div>
              <div className="text-muted" style={{ fontSize: 11 }}>{u.meta}</div>
            </div>
            <div>
              <div style={{ height: 6, background: "color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
                <div style={{ height: "100%", width: `${u.pct}%`, background: u.col }} />
              </div>
              <div className="text-muted" style={{ fontSize: 10.5, marginTop: 3 }}>{u.status}</div>
            </div>
            {u.done ? (
              <button className="btn btn-secondary" onClick={() => navigate("/counsellor/review")}>Open review →</button>
            ) : (
              <span />
            )}
          </div>
        ))}
      </Blueprint>
    </div>
  );
}
