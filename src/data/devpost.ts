/**
 * Hackathons from Devpost's public API (the endpoint ViRb3/devpost-api wraps:
 * https://devpost.com/api/hackathons). In `npm run dev` we read it live through
 * the Vite proxy (`/devpost`, avoids browser CORS); anywhere without the proxy
 * (static build/preview, offline) we fall back to the bundled snapshot at
 * public/devpost-hackathons.json. Displayed in the student Opportunities page.
 */

export interface Hackathon {
  id: number;
  title: string;
  url: string;
  org?: string | null;
  location?: string | null;
  openState?: string | null;
  prize?: string | null;
  registrations?: number | null;
  dates?: string | null;
  timeLeft?: string | null;
  themes: string[];
  thumbnail?: string | null;
  inviteOnly?: boolean;
}

const SNAPSHOT_URL = "/hackathons-snapshot.json";
const LIVE_URL = "/devpost/api/hackathons?page=1"; // Vite dev proxy → devpost.com/api/hackathons

const stripHtml = (s: string | null | undefined) =>
  s ? s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim() : null;

const fixThumb = (u: string | null | undefined) =>
  u ? (u.startsWith("//") ? `https:${u}` : u) : null;

/** Normalize a raw Devpost API record into our shape. */
function fromLive(h: Record<string, unknown>): Hackathon {
  const loc = h.displayed_location as { location?: string } | undefined;
  return {
    id: Number(h.id),
    title: String(h.title ?? ""),
    url: String(h.url ?? "#"),
    org: (h.organization_name as string) ?? null,
    location: loc?.location ?? null,
    openState: (h.open_state as string) ?? null,
    prize: stripHtml(h.prize_amount as string),
    registrations: (h.registrations_count as number) ?? null,
    dates: (h.submission_period_dates as string) ?? null,
    timeLeft: (h.time_left_to_submission as string) ?? null,
    themes: Array.isArray(h.themes) ? (h.themes as Array<{ name: string }>).map((t) => t.name) : [],
    thumbnail: fixThumb(h.thumbnail_url as string),
    inviteOnly: Boolean(h.invite_only),
  };
}

export interface HackathonsResult {
  hackathons: Hackathon[];
  live: boolean;
}

export async function fetchHackathons(): Promise<HackathonsResult> {
  // 1) Live via the dev proxy.
  try {
    const r = await fetch(LIVE_URL, { headers: { Accept: "application/json" } });
    if (r.ok) {
      const data = await r.json();
      const list = Array.isArray(data?.hackathons) ? data.hackathons : [];
      if (list.length) return { hackathons: list.map(fromLive), live: true };
    }
  } catch {
    /* fall through to snapshot */
  }
  // 2) Bundled snapshot (always present, same origin).
  const r = await fetch(SNAPSHOT_URL);
  const data = await r.json();
  return { hackathons: (data.hackathons ?? []) as Hackathon[], live: false };
}

/** Overlap between a hackathon's themes and the student's skills/interests. */
export function matchingThemes(hack: Hackathon, tags: string[]): string[] {
  const norm = (s: string) => s.toLowerCase();
  return hack.themes.filter((theme) =>
    tags.some((t) => {
      const a = norm(theme);
      const b = norm(t);
      return a.includes(b) || b.includes(a);
    }),
  );
}
