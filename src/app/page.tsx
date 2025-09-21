import PowerRankingTable from "@/app/components/PowerRankingsTable";
import { getPowerRankings } from "@/lib/api";

export default async function HomePage() {
  // This fetch runs on the server
  const data = await getPowerRankings();
  const rankings = data.power_rankings;

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Fantasy Power Rankings</h1>
      <PowerRankingTable rankings={rankings} />
    </main>
  );
}
