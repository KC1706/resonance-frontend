/**
 * Jobs from Hacker News' official Firebase API (YC startup / sponsor job posts):
 * https://hacker-news.firebaseio.com/v0/jobstories.json → array of ids, then
 * /item/{id}.json for each. The Firebase API is CORS-enabled (Access-Control-
 * Allow-Origin: *), so the browser reads it directly — no proxy needed. Falls
 * back to a bundled snapshot (public/hn-jobs-snapshot.json) if the live fetch
 * fails (offline / static build). Shown in the student Opportunities page.
 */

export interface HnJob {
  id: number;
  title: string;
  url: string;
  by?: string | null;
  time?: number | null; // unix seconds
}

const LIST_URL = "https://hacker-news.firebaseio.com/v0/jobstories.json";
const ITEM_URL = (id: number) => `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
const SNAPSHOT_URL = "/hn-jobs-snapshot.json";

const hnItemLink = (id: number) => `https://news.ycombinator.com/item?id=${id}`;

export interface HnJobsResult {
  jobs: HnJob[];
  live: boolean;
}

export async function fetchHnJobs(limit = 24): Promise<HnJobsResult> {
  try {
    const ids: number[] = await (await fetch(LIST_URL)).json();
    const picked = ids.slice(0, limit);
    const items = await Promise.all(
      picked.map(async (id) => {
        try {
          return await (await fetch(ITEM_URL(id))).json();
        } catch {
          return null;
        }
      }),
    );
    const jobs: HnJob[] = items
      .filter((it): it is Record<string, unknown> => !!it && typeof it === "object")
      .map((it) => ({
        id: Number(it.id),
        title: String(it.title ?? ""),
        url: (it.url as string) || hnItemLink(Number(it.id)),
        by: (it.by as string) ?? null,
        time: (it.time as number) ?? null,
      }))
      .filter((j) => j.title);
    if (jobs.length) return { jobs, live: true };
  } catch {
    /* fall through to snapshot */
  }
  const data = await (await fetch(SNAPSHOT_URL)).json();
  return { jobs: (data.jobs ?? []) as HnJob[], live: false };
}
