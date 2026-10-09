import Link from "next/link";
import PowerRankingTable from "@/app/components/PowerRankingsTable";
import { getPowerRankings, getSeasons } from "@/lib/api";

type Props = {
  searchParams: Promise<{ year?: string | string[] }>;
};

export default async function HomePage({ searchParams }: Props) {
  const [years, params] = await Promise.all([getSeasons(), searchParams]);
  const requestedYear = typeof params.year === "string" ? Number(params.year) : NaN;
  const selectedYear = years.includes(requestedYear) ? requestedYear : years[0];
  const data = selectedYear === undefined ? null : await getPowerRankings(selectedYear);

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Fantasy Power Rankings</h1>
      {years.length > 0 && (
        <nav aria-label="Season years" className="mb-6 flex gap-2 overflow-x-auto border-b border-gray-200">
          {years.map((year) => (
            <Link
              key={year}
              href={year === years[0] ? "/" : `/?year=${year}`}
              scroll={false}
              aria-current={year === selectedYear ? "page" : undefined}
              className={`shrink-0 border-b-2 px-5 py-3 font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${
                year === selectedYear
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {year}
            </Link>
          ))}
        </nav>
      )}
      {data?.power_rankings.length > 0 ? (
        <PowerRankingTable key={selectedYear} rankings={data.power_rankings} />
      ) : (
        <p className="py-8 text-gray-500">
          {selectedYear === undefined
            ? "No seasons available yet."
            : `No rankings available for ${selectedYear} yet.`}
        </p>
      )}
    </main>
  );
}
