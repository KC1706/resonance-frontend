import { useState } from "react";
import { Blueprint, Kicker, Tag } from "@/components/Blueprint";
import { useAppData } from "@/context/AppDataContext";
import { listOpportunities, matchingTags, updateStudentSkills, getStudentById } from "@/data/db";

const TYPE_LABEL: Record<string, string> = { internship: "Internship", job: "Job", hackathon: "Hackathon" };

/**
 * Internships, jobs, and hackathons matched to what you've told us about
 * yourself — nothing else. This never looks at anything from your sessions.
 */
export function StudentOpportunities() {
  const { identity } = useAppData();
  const [, forceRerender] = useState(0);
  const [newTag, setNewTag] = useState("");

  const student = identity.recordId ? getStudentById(identity.recordId) : undefined;
  const opportunities = listOpportunities();
  const tags = student ? [...student.skills, ...student.domains] : [];

  const ranked = opportunities
    .map((o) => ({ o, matched: student ? matchingTags(student, o) : [] }))
    .sort((a, b) => b.matched.length - a.matched.length);

  function addTag() {
    if (!student || !newTag.trim()) return;
    updateStudentSkills(student.id, [...student.skills, newTag.trim()], student.domains);
    setNewTag("");
    forceRerender((n) => n + 1);
  }

  function removeTag(tag: string) {
    if (!student) return;
    updateStudentSkills(
      student.id,
      student.skills.filter((s) => s !== tag),
      student.domains.filter((d) => d !== tag),
    );
    forceRerender((n) => n + 1);
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "var(--space-8)" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 34 }}>Opportunities</h1>
      <p className="text-muted" style={{ margin: "0 0 var(--space-6)", fontSize: 14 }}>
        Internships, jobs, and hackathons — matched to your skills and interests only, never your session data.
      </p>

      <Blueprint style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <Kicker>Your skills &amp; interests</Kicker>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, margin: "10px 0" }}>
          {tags.map((t) => (
            <Tag key={t} className="tag-accent" style={{ cursor: "pointer" }}>
              {t} <span onClick={() => removeTag(t)} style={{ marginLeft: 5, opacity: 0.6 }}>×</span>
            </Tag>
          ))}
          {tags.length === 0 && <span className="text-muted" style={{ fontSize: 12.5 }}>Add a few so we can find good matches.</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="input" style={{ flex: 1 }} placeholder="e.g. Python, Robotics, Structural Analysis"
            value={newTag} onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag()}
          />
          <button className="btn btn-secondary" onClick={addTag}>Add</button>
        </div>
      </Blueprint>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
        {ranked.map(({ o, matched }) => (
          <Blueprint key={o.id} style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h4 style={{ margin: "0 0 2px" }}>{o.title}</h4>
                <div className="text-muted" style={{ fontSize: 12.5 }}>{o.org}</div>
              </div>
              <Tag className="tag-outline">{TYPE_LABEL[o.type]}</Tag>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "10px 0" }}>
              {o.tags.map((t) => (
                <Tag key={t} style={matched.includes(t) ? { background: "var(--color-accent-100)", color: "var(--color-accent-800)" } : { background: "var(--color-neutral-100)", color: "var(--color-neutral-800)" }}>
                  {t}
                </Tag>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="text-muted" style={{ fontSize: 11.5 }}>
                {matched.length > 0 ? `Matches ${matched.length} of your tags` : "No overlap yet"}
              </span>
              <a href={o.link} className="btn btn-secondary" style={{ fontSize: 12.5, padding: "5px 12px" }}>View</a>
            </div>
          </Blueprint>
        ))}
      </div>
    </div>
  );
}
