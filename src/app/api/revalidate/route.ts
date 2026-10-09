import { revalidateTag } from "next/cache";
import { getSeasons, getPowerRankings, getPowerHistory } from "@/lib/api";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST() {
  revalidateTag("league-data");
  try {
    const years = await getSeasons();
    // Warm each year's exact URLs used by the dashboard, not just the page HTML.
    for (const year of years) {
      await Promise.all([getPowerRankings(year), getPowerHistory(year)]);
    }
    return Response.json({ refreshed: true, years });
  } catch {
    return Response.json({ error: "Cache warming failed; retry after checking the backend" }, { status: 502 });
  }
}
