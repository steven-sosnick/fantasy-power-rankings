export async function getPowerRankings() {
  const res = await fetch(
    "https://fantasy-power-rankings-backend.onrender.com/power-rankings",
    { cache: "no-store" } // always fetch fresh
  );

  if (!res.ok) {
    console.error("Fetch failed with status:", res.status);
    throw new Error("Failed to fetch power rankings");
  }

  return res.json();
}
