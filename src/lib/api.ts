import type { Insights } from "@/app/components/SeasonInsights";
import type { Ranking, Week } from "@/app/components/Dashboard";

const API_URL = "https://fantasy-power-rankings-backend.onrender.com";

export async function getSeasons(): Promise<number[]> {
  const res = await fetch(`${API_URL}/seasons`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch seasons");
  const data: { years: number[] } = await res.json();
  return [...new Set(data.years)].sort((a, b) => b - a);
}

export async function getPowerRankings(year?: number): Promise<{ power_rankings: Ranking[] }> {
  const query = year === undefined ? "" : `?year=${year}`;
  const res = await fetch(`${API_URL}/power-rankings${query}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch power rankings");
  return res.json();
}

export async function getPowerHistory(year: number): Promise<{ weeks: Week[]; insights?: Insights }> {
  const res = await fetch(`${API_URL}/power-rankings/history?year=${year}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch weekly power history");
  return res.json();
}
