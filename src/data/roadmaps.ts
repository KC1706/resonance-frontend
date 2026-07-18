/**
 * Developer roadmaps from roadmap.sh, surfaced in the student dashboard as
 * career learning paths (a companion to Opportunities). Each links out to
 * `https://roadmap.sh/<slug>` where the slug is the area name lowercased with
 * spaces → hyphens, plus a small override map for the dotted/symbol names so
 * the links actually resolve.
 */

export const ROLE_BASED: string[] = [
  "Full Stack", "Frontend", "Backend", "DevOps", "DevSecOps", "Data Analyst",
  "AI Engineer", "AI and Data Scientist", "Data Engineer", "Android",
  "Machine Learning", "PostgreSQL", "iOS", "Blockchain", "QA",
  "Software Architect", "Cyber Security", "UX Design", "Technical Writer",
  "Game Developer", "Server Side Game Developer", "MLOps", "Product Manager",
  "Engineering Manager", "Developer Relations", "BI Analyst", "Network Engineer",
  "Forward Deployed Engineer",
];

export const SKILL_BASED: string[] = [
  "Claude Code", "Vibe Coding", "OpenClaw", "LeetCode", "Python",
  "Python for Data Analysis", "Computer Science", "SQL", "React", "Vue",
  "Angular", "JavaScript", "TypeScript", "Node.js", "System Design", "Java",
  "ASP.NET Core", "API Design", "Spring Boot", "Flutter", "C Programming", "C++",
  "Rust", "Go Roadmap", "AI Product Builders", "Design and Architecture",
  "GraphQL", "React Native", "Design System", "Prompt Engineering", "MongoDB",
  "Linux", "Kubernetes", "Docker", "AWS", "Terraform",
  "Data Structures & Algorithms", "Redis", "Git and GitHub", "PHP", "Cloudflare",
  "AI Red Teaming", "AI Agents", "Next.js", "Code Review", "Kotlin", "HTML",
  "CSS", "Swift & Swift UI", "Shell / Bash", "Laravel", "Elasticsearch",
  "WordPress", "Django", "Ruby", "Ruby on Rails", "Scala",
];

/** roadmap.sh slugs that differ from a plain lowercase-hyphenated form. */
const OVERRIDES: Record<string, string> = {
  "AI and Data Scientist": "ai-data-scientist",
  PostgreSQL: "postgresql-dba",
  "Developer Relations": "devrel",
  "Node.js": "nodejs",
  "C Programming": "c",
  "C++": "cpp",
  "Go Roadmap": "golang",
  "Git and GitHub": "git-github",
  "Data Structures & Algorithms": "datastructures-and-algorithms",
  "ASP.NET Core": "aspnet-core",
  "Design and Architecture": "software-design-architecture",
  "Next.js": "nextjs",
  "Swift & Swift UI": "swift",
  "Ruby on Rails": "ruby-on-rails",
};

/** Lowercase, spaces → hyphens (the requested rule), with overrides applied. */
export function roadmapSlug(label: string): string {
  if (OVERRIDES[label]) return OVERRIDES[label];
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function roadmapUrl(label: string): string {
  return `https://roadmap.sh/${roadmapSlug(label)}`;
}
