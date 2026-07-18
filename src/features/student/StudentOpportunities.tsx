import { useEffect, useState } from "react";
import { Blueprint, Kicker, Tag } from "@/components/Blueprint";
import { useAppData } from "@/context/AppDataContext";
import { updateStudentSkills, getStudentById } from "@/data/db";
import { fetchHackathons, matchingThemes, type Hackathon } from "@/data/devpost";
import { fetchHnJobs, type HnJob } from "@/data/hackernews";
import { formatRelative } from "@/lib/dates";

/**
 * Live hackathons from Devpost, matched to what you've told us about yourself —
 * nothing else. This never looks at anything from your sessions.
 */
export function StudentOpportunities() {
  const { identity } = useAppData();
  const [, forceRerender] = useState(0);
  const [newTag, setNewTag] = useState("");

  const student = identity.recordId ? getStudentById(identity.recordId) : undefined;
  const tags = student ? [...student.skills, ...student.domains] : [];

  // Live hackathons from Devpost (dev proxy → live, else bundled snapshot).
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [live, setLive] = useState(false);
  const [loadingHacks, setLoadingHacks] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchHackathons()
      .then((res) => {
        if (!alive) return;
        setHackathons(res.hackathons);
        setLive(res.live);
      })
      .finally(() => alive && setLoadingHacks(false));
    return () => {
      alive = false;
    };
  }, []);

  const rankedHacks = hackathons
    .map((h) => ({ h, matched: matchingThemes(h, tags) }))
    .sort((a, b) => b.matched.length - a.matched.length);

  // Jobs from Hacker News' Firebase API (YC startups) — CORS-enabled, fetched direct.
  const [jobs, setJobs] = useState<HnJob[]>([]);
  const [jobsLive, setJobsLive] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchHnJobs()
      .then((res) => {
        if (!alive) return;
        setJobs(res.jobs);
        setJobsLive(res.live);
      })
      .finally(() => alive && setLoadingJobs(false));
    return () => {
      alive = false;
    };
  }, []);

  const jobMatches = (title: string) => tags.some((t) => title.toLowerCase().includes(t.toLowerCase()));

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
        Live hackathons from Devpost and jobs from Hacker News — matched to your skills and interests only, never your session data.
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

      {/* ── Hackathons · live from Devpost ─────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 var(--space-3)" }}>
        <h4 style={{ margin: 0 }}>Hackathons</h4>
        <Tag style={live ? { background: "var(--color-accent-100)", color: "var(--color-accent-800)" } : { background: "var(--color-neutral-100)", color: "var(--color-neutral-800)" }}>
          {live ? "● live from Devpost" : "from Devpost"}
        </Tag>
        {!loadingHacks && <span className="text-muted" style={{ fontSize: 12 }}>{hackathons.length} open</span>}
      </div>

      {loadingHacks ? (
        <p className="text-muted" style={{ fontSize: 13 }}>Loading hackathons from Devpost…</p>
      ) : rankedHacks.length === 0 ? (
        <p className="text-muted" style={{ fontSize: 13 }}>No hackathons available right now.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
          {rankedHacks.map(({ h, matched }) => (
            <Blueprint key={h.id} style={{ padding: "var(--space-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <h4 style={{ margin: "0 0 2px" }}>{h.title}</h4>
                  <div className="text-muted" style={{ fontSize: 12.5 }}>{h.org}{h.location ? ` · ${h.location}` : ""}</div>
                </div>
                <Tag className="tag-outline">Hackathon</Tag>
              </div>

              <div className="text-muted" style={{ fontSize: 12, margin: "8px 0 0", display: "flex", flexWrap: "wrap", gap: "2px 10px" }}>
                {h.dates && <span>{h.dates}</span>}
                {h.timeLeft && <span style={{ color: "var(--color-accent)" }}>{h.timeLeft}</span>}
              </div>
              <div style={{ fontSize: 12.5, marginTop: 4, display: "flex", flexWrap: "wrap", gap: "2px 10px" }}>
                {h.prize && <span><strong style={{ fontFamily: "var(--font-heading)" }}>{h.prize}</strong> in prizes</span>}
                {typeof h.registrations === "number" && <span className="text-muted">{h.registrations.toLocaleString()} participants</span>}
              </div>

              {h.themes.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "10px 0" }}>
                  {h.themes.map((t) => (
                    <Tag key={t} style={matched.includes(t) ? { background: "var(--color-accent-100)", color: "var(--color-accent-800)" } : { background: "var(--color-neutral-100)", color: "var(--color-neutral-800)" }}>
                      {t}
                    </Tag>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <span className="text-muted" style={{ fontSize: 11.5 }}>
                  {matched.length > 0 ? `Matches ${matched.length} of your interests` : "Open to all"}
                </span>
                <a href={h.url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: 12.5, padding: "5px 12px" }}>View on Devpost ↗</a>
              </div>
            </Blueprint>
          ))}
        </div>
      )}

      {/* ── Jobs · from Hacker News (YC startups) ──────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "var(--space-8) 0 var(--space-3)" }}>
        <h4 style={{ margin: 0 }}>Jobs</h4>
        <Tag style={jobsLive ? { background: "var(--color-accent-100)", color: "var(--color-accent-800)" } : { background: "var(--color-neutral-100)", color: "var(--color-neutral-800)" }}>
          {jobsLive ? "● live from Hacker News" : "from Hacker News"}
        </Tag>
        {!loadingJobs && <span className="text-muted" style={{ fontSize: 12 }}>{jobs.length} roles · YC startups</span>}
      </div>

      {loadingJobs ? (
        <p className="text-muted" style={{ fontSize: 13 }}>Loading jobs from Hacker News…</p>
      ) : jobs.length === 0 ? (
        <p className="text-muted" style={{ fontSize: 13 }}>No jobs available right now.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
          {jobs.map((j) => {
            const m = jobMatches(j.title);
            return (
              <Blueprint key={j.id} style={{ padding: "var(--space-4)", background: m ? "color-mix(in srgb, var(--color-accent) 8%, transparent)" : "transparent" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <h4 style={{ margin: 0, fontSize: 15, lineHeight: 1.25 }}>{j.title}</h4>
                  <Tag className="tag-outline">Job</Tag>
                </div>
                <div className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>
                  {j.by ? `posted by ${j.by}` : "Hacker News"}{j.time ? ` · ${formatRelative(new Date(j.time * 1000))}` : ""}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <span className="text-muted" style={{ fontSize: 11.5 }}>{m ? "Matches your interests" : "Hacker News · YC"}</span>
                  <a href={j.url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: 12.5, padding: "5px 12px" }}>View ↗</a>
                </div>
              </Blueprint>
            );
          })}
        </div>
      )}

      <p className="text-muted" style={{ fontSize: 11.5, marginTop: "var(--space-6)" }}>
        Hackathons via Devpost's public API; jobs via the Hacker News (YC) API. Uses only your skills &amp; interests, never your session data.
      </p>
    </div>
  );
}
