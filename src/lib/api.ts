const API_URL = "https://fantasy-power-rankings-backend.onrender.com";

export async function getSeasons(): Promise<number[]> {
  const res = await fetch(`${API_URL}/seasons`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch seasons");
  const data: { years: number[] } = await res.json();
  return [...new Set(data.years)].sort((a, b) => b - a);
}

export async function getPowerRankings(year?: number) {
  const query = year === undefined ? "" : `?year=${year}`;
  const res = await fetch(`${API_URL}/power-rankings${query}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch power rankings");
  return res.json();
}
