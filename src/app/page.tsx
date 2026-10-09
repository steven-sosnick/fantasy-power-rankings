import Link from "next/link";
import SeasonInsights from "@/app/components/SeasonInsights";
import Dashboard from "@/app/components/Dashboard";
import { getPowerRankings, getSeasons, getPowerHistory } from "@/lib/api";

type Props = { searchParams: Promise<{ year?: string | string[] }> };
export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  let years: number[];
  try { years = await getSeasons(); } catch { return <main className="empty-panel error-panel"><h1>Taking a timeout.</h1><p>We couldn’t reach the league data. Give it a moment, then try again.</p><Link href="/">Try again</Link></main>; }
  const requestedYear = typeof params.year === "string" ? Number(params.year) : NaN;
  const year = years.includes(requestedYear) ? requestedYear : years[0];
  const [data, history] = year === undefined ? [null, null] : await Promise.all([
    getPowerRankings(year).catch(() => null), getPowerHistory(year).catch(() => null),
  ]);
  return <>
    <header className="site-header"><Link href="/" className="brand"><span className="brand-mark" aria-hidden="true">↗</span>POWER RANKINGS</Link><span className="header-note">Fantasy football · League intelligence</span></header>
    <main className="dashboard-shell">
      <div className="page-title"><div><span className="eyebrow">The league, in perspective</span><h1>Every week.<br /><em>A new pecking order.</em></h1><p>Your season’s story, beyond the win column.</p></div>{years.length > 0 && <nav className="season-tabs" aria-label="Season years">{years.map(y => <Link key={y} href={y === years[0] ? "/" : `/?year=${y}`} scroll={false} aria-current={y === year ? "page" : undefined}>{y}</Link>)}</nav>}</div>
      {year === undefined ? <div className="empty-panel">No seasons available yet.</div> : !data && !history ? <div className="empty-panel panel error-panel"><h2>The scoreboard is taking a timeout.</h2><p>We couldn’t load this season. Please try again shortly.</p><Link href={`/?year=${year}`}>Try again</Link></div> : <Dashboard key={year} rankings={data?.power_rankings ?? []} weeks={history?.weeks ?? []} historyUnavailable={history === null} />}
      {history?.insights && <SeasonInsights key={`insights-${year}`} insights={history.insights} />}
      <footer className="site-footer"><span>POWER RANKINGS / {year ?? "FANTASY FOOTBALL"}</span><span>Built for the league. Settled on the field.</span></footer>
    </main>
  </>;
}
