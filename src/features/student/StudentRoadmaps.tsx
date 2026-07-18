import { useState, type CSSProperties } from "react";
import { Kicker, Tag } from "@/components/Blueprint";
import { useAppData } from "@/context/AppDataContext";
import { getStudentById } from "@/data/db";
import { ROLE_BASED, SKILL_BASED, roadmapSlug, roadmapUrl } from "@/data/roadmaps";

/** One outbound roadmap card — a blueprint-framed link to roadmap.sh/<slug>. */
function RoadmapCard({ label, highlight }: { label: string; highlight?: boolean }) {
  return (
    <a
      className="blueprint"
      href={roadmapUrl(label)}
      target="_blank"
      rel="noreferrer"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        padding: "10px 12px",
        textDecoration: "none",
        color: "inherit",
        background: highlight ? "color-mix(in srgb, var(--color-accent) 8%, transparent)" : "transparent",
      }}
    >
      <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
      <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontWeight: 500, fontSize: 13.5 }}>{label}</span>
        <span style={{ color: "var(--color-accent)", fontSize: 13 }}>↗</span>
      </span>
      <span className="text-muted" style={{ fontSize: 10.5, fontFamily: "var(--font-heading)", letterSpacing: ".02em" }}>
        roadmap.sh/{roadmapSlug(label)}
      </span>
    </a>
  );
}

const GRID: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
  gap: 10,
};

export function StudentRoadmaps() {
  const { identity } = useAppData();
  const [q, setQ] = useState("");

  const student = identity.recordId ? getStudentById(identity.recordId) : undefined;
  const tags = student ? [...student.skills, ...student.domains] : [];

  const matchesInterest = (label: string) =>
    tags.some((t) => {
      const a = label.toLowerCase();
      const b = t.toLowerCase();
      return a.includes(b) || b.includes(a);
    });

  const query = q.trim().toLowerCase();
  const filter = (list: string[]) =>
    query ? list.filter((l) => l.toLowerCase().includes(query) || roadmapSlug(l).includes(query)) : list;

  const suggested = [...ROLE_BASED, ...SKILL_BASED].filter(matchesInterest);
  const roles = filter(ROLE_BASED);
  const skills = filter(SKILL_BASED);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "var(--space-8)" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 34 }}>Roadmaps</h1>
      <p className="text-muted" style={{ margin: "0 0 var(--space-6)", fontSize: 14 }}>
        Guided learning paths from <span style={{ fontFamily: "var(--font-heading)" }}>roadmap.sh</span> — pick a path and
        build toward the internships and jobs you want. Links open on roadmap.sh.
      </p>

      <input
        className="input"
        style={{ width: "100%", maxWidth: 360, marginBottom: "var(--space-6)" }}
        placeholder="Search roadmaps — e.g. frontend, python, devops…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {!query && suggested.length > 0 && (
        <div style={{ marginBottom: "var(--space-6)" }}>
          <Kicker style={{ marginBottom: 8 }}>Suggested for you · from your skills &amp; interests</Kicker>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {suggested.map((label) => (
              <a key={label} href={roadmapUrl(label)} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <Tag className="tag-accent" style={{ cursor: "pointer" }}>{label} ↗</Tag>
              </a>
            ))}
          </div>
        </div>
      )}

      <section style={{ marginBottom: "var(--space-8)" }}>
        <h4 style={{ margin: "0 0 var(--space-3)" }}>Role-based Roadmaps <span className="text-muted" style={{ fontSize: 12, fontFamily: "var(--font-body)" }}>· {roles.length}</span></h4>
        {roles.length === 0 ? (
          <p className="text-muted" style={{ fontSize: 13 }}>No match.</p>
        ) : (
          <div style={GRID}>
            {roles.map((label) => <RoadmapCard key={label} label={label} highlight={matchesInterest(label)} />)}
          </div>
        )}
      </section>

      <section>
        <h4 style={{ margin: "0 0 var(--space-3)" }}>Skill-based Roadmaps <span className="text-muted" style={{ fontSize: 12, fontFamily: "var(--font-body)" }}>· {skills.length}</span></h4>
        {skills.length === 0 ? (
          <p className="text-muted" style={{ fontSize: 13 }}>No match.</p>
        ) : (
          <div style={GRID}>
            {skills.map((label) => <RoadmapCard key={label} label={label} highlight={matchesInterest(label)} />)}
          </div>
        )}
      </section>

      <p className="text-muted" style={{ fontSize: 11.5, marginTop: "var(--space-8)" }}>
        Roadmaps, guides and content are a community effort by roadmap.sh.
      </p>
    </div>
  );
}
