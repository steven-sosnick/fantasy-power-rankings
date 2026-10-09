"use client";

import { useState } from "react";

export type Ranking = {
  team_id: number; team_name: string; rank: number; total: number;
  wins: number; points_for: number; h2h_wins: number;
  category_wins: number; category_points_for: number; category_h2h: number;
};
export type Week = { week: number; rankings: Ranking[] };
const fmt = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
const colors = ["#17634c", "#bd753d", "#5b6cbd", "#a4597d", "#378698", "#7e8237", "#805a42", "#697d8c", "#9b514b", "#716581"];
const initials = (name: string) => name.split(/\s+/).slice(0, 2).map(s => s[0]).join("").toUpperCase();

export default function Dashboard({ rankings, weeks, historyUnavailable }: { rankings: Ranking[]; weeks: Week[]; historyUnavailable: boolean }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("total");
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const latest = weeks.at(-1);
  const previous = weeks.at(-2);
  const current = latest?.rankings ?? rankings;
  const ordered = [...current].sort((a, b) => b.total - a.total || a.team_id - b.team_id);
  // Equal power totals share a rank, including when history is unavailable.
  ordered.forEach((r, i) => { ordered[i] = { ...r, rank: i && ordered[i - 1].total === r.total ? ordered[i - 1].rank : i + 1 }; });
  const leader = ordered[0];
  const movement = (r: Ranking) => {
    const before = previous?.rankings.find(p => p.team_id === r.team_id);
    return before ? before.rank - r.rank : null;
  };
  const mover = [...ordered].filter(r => (movement(r) ?? 0) > 0).sort((a, b) => (movement(b) ?? 0) - (movement(a) ?? 0))[0];
  const scorer = [...ordered].sort((a, b) => b.points_for - a.points_for)[0];
  const displayed = ordered.filter(r => r.team_name.toLowerCase().includes(search.toLowerCase())).sort((a, b) => {
    const key = sort as "total" | "wins" | "points_for" | "h2h_wins";
    return b[key] - a[key] || a.rank - b.rank;
  });
  const chosen = ordered.find(r => r.team_id === selectedTeam) ?? leader;
  const maxPower = Math.max(1, ordered.length * 3);
  const delta = (r: Ranking) => {
    const value = movement(r);
    return <span className={`movement ${value && value > 0 ? "up" : value && value < 0 ? "down" : ""}`} aria-label={value === null ? "No previous week" : `${Math.abs(value)} places ${value > 0 ? "up" : value < 0 ? "down" : "unchanged"}`}>{value === null ? "—" : value === 0 ? "→ 0" : `${value > 0 ? "↑" : "↓"} ${Math.abs(value)}`}</span>;
  };
  if (!leader) return <div className="empty-panel"><h2>The season starts here.</h2><p>Rankings will appear after the first week is imported.</p></div>;
  return <>
    <div className="season-meta"><span className="status-dot" />{latest ? `Through week ${latest.week}` : "Season snapshot"}<span>·</span>{ordered.length} teams<span>·</span>3 equal categories</div>
    <section className="insights" aria-label="League highlights">
      <article className="insight lead-card"><span className="eyebrow">01 / Setting the pace</span><div className="hero-number">{fmt(leader.total)}<small>/ {maxPower}</small></div><h2>{leader.team_name}</h2><p>{ordered.filter(r => r.total === leader.total).length > 1 ? "Tied for the league lead" : "Your current power leader"}</p></article>
      <article className="insight"><span className="eyebrow">02 / Biggest climber</span><div className="hero-number">{mover ? `↑ ${movement(mover)}` : "—"}<small>{mover ? "places" : ""}</small></div><h2>{mover?.team_name ?? (previous ? "Holding steady" : "Watch this space")}</h2><p>{previous ? `Rank movement since week ${previous.week}` : "Movement appears after two imported weeks"}</p></article>
      <article className="insight"><span className="eyebrow">03 / Points machine</span><div className="hero-number">{fmt(scorer.points_for)}<small>pts</small></div><h2>{scorer.team_name}</h2><p>Most fantasy points scored this season</p></article>
    </section>

    <section className="dashboard-section" aria-labelledby="standings-title">
      <div className="section-heading"><div><span className="eyebrow">The big picture</span><h2 id="standings-title">Power standings<span className="count">{ordered.length}</span></h2><p>Three categories. Equal weight. One league to win.</p></div><div className="toolbar"><label><span className="sr-only">Find a team</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a team…" type="search" /></label><label><span className="sr-only">Sort standings</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="total">Power total</option><option value="points_for">Points scored</option><option value="wins">Matchup wins</option><option value="h2h_wins">All-play wins</option></select></label></div></div>
      <div className="table-scroll panel"><table className="standings"><caption className="sr-only">Season power standings and category statistics</caption><thead><tr><th>Rank</th><th>Team</th><th>Move</th><th>Wins</th><th>Points for</th><th>All-play wins</th><th>Power mix</th><th>Total</th></tr></thead><tbody>{displayed.map(r => <tr key={r.team_id} className={r.rank === 1 ? "first-place" : ""}><td className="rank">{String(r.rank).padStart(2, "0")}</td><th scope="row"><button className="team-button" onClick={() => setSelectedTeam(r.team_id)} aria-label={`Show power trend for ${r.team_name}`}><span className="avatar" style={{ background: colors[ordered.findIndex(t => t.team_id === r.team_id) % colors.length] }}>{initials(r.team_name)}</span><span>{r.team_name}</span></button></th><td>{delta(r)}</td><td>{r.wins}<small>{fmt(r.category_wins)} PR</small></td><td>{fmt(r.points_for)}<small>{fmt(r.category_points_for)} PR</small></td><td>{r.h2h_wins}<small>{fmt(r.category_h2h)} PR</small></td><td><div className="power-mix" role="img" aria-label={`Power points: wins ${r.category_wins}, scoring ${r.category_points_for}, all-play ${r.category_h2h}`}><i style={{ width: `${r.category_wins / maxPower * 100}%` }} /><i style={{ width: `${r.category_points_for / maxPower * 100}%` }} /><i style={{ width: `${r.category_h2h / maxPower * 100}%` }} /></div></td><td className="total">{fmt(r.total)}<small>{leader.total === r.total ? "Leader" : `${fmt(leader.total - r.total)} behind`}</small></td></tr>)}</tbody></table>{!displayed.length && <p className="empty-panel">No teams match “{search}”.</p>}</div>
      <div className="table-note"><span className="legend"><i />Wins <i />Scoring <i />All-play</span><span>PR = category power points · Click a team to explore its trend</span></div>
    </section>

    <section className="trend-section panel" aria-labelledby="trend-title"><div className="trend-copy"><span className="eyebrow">Follow the season</span><h2 id="trend-title">The power curve.</h2><p>See how the season has unfolded, one week at a time.</p><label className="team-select">Explore a team<select value={chosen.team_id} onChange={e => setSelectedTeam(Number(e.target.value))}>{ordered.map(r => <option key={r.team_id} value={r.team_id}>{r.team_name}</option>)}</select></label><strong className="trend-total">{fmt(chosen.total)}<small> power points</small></strong></div><div className="chart-area">{weeks.length > 1 ? <><svg viewBox="0 0 640 220" role="img" aria-label={`${chosen.team_name} cumulative power total by week`}><title>{chosen.team_name}: {weeks.map(w => `week ${w.week}: ${w.rankings.find(r => r.team_id === chosen.team_id)?.total ?? "unavailable"}`).join(", ")}</title>{[0, maxPower / 2, maxPower].map(v => <g key={v}><line x1="36" x2="620" y1={180 - v / maxPower * 150} y2={180 - v / maxPower * 150} stroke="#dce3da" strokeDasharray="4 5" /><text x="4" y={184 - v / maxPower * 150}>{fmt(v)}</text></g>)}<polyline fill="none" stroke="#17634c" strokeWidth="3" strokeLinejoin="round" points={weeks.flatMap((w, i) => { const r = w.rankings.find(r => r.team_id === chosen.team_id); return r ? [`${40 + i / (weeks.length - 1) * 570},${180 - r.total / maxPower * 150}`] : []; }).join(" ")} />{weeks.map((w, i) => { const r = w.rankings.find(r => r.team_id === chosen.team_id); return <g key={w.week}>{r && <circle cx={40 + i / (weeks.length - 1) * 570} cy={180 - r.total / maxPower * 150} r="5" fill="#17634c" stroke="#fff" strokeWidth="2"><title>Week {w.week}: {fmt(r.total)}, rank {r.rank}</title></circle>}{(weeks.length <= 10 || i % 2 === 0 || i === weeks.length - 1) && <text textAnchor="middle" x={40 + i / (weeks.length - 1) * 570} y="211">W{w.week}</text>}</g>; })}</svg><p className="chart-note">Cumulative power total through each imported week</p></> : <p className="empty-panel">{historyUnavailable ? "Weekly history is temporarily unavailable." : "The trend appears after two weeks are imported."}</p>}</div></section>

    <section className="dashboard-section" aria-labelledby="weekly-title"><div className="section-heading"><div><span className="eyebrow">The week-by-week story</span><h2 id="weekly-title">Power total by week</h2><p>Season power total through each week, with league rank underneath.</p></div><span className="subtle-tag">{weeks.length} imported weeks</span></div>{weeks.length ? <div className="table-scroll panel"><table className="weekly"><caption className="sr-only">Cumulative weekly power totals, ordered by current standings</caption><thead><tr><th>Team</th>{weeks.map(w => <th key={w.week}>WK {w.week}</th>)}</tr></thead><tbody>{ordered.map(r => <tr key={r.team_id}><th scope="row">{r.team_name}</th>{weeks.map(w => { const entry = w.rankings.find(t => t.team_id === r.team_id); return <td key={w.week}><span className={`week-score ${entry?.rank === 1 ? "best" : ""}`}>{entry ? fmt(entry.total) : "—"}<small>{entry ? `#${entry.rank}` : "No data"}</small></span></td>; })}</tr>)}</tbody></table></div> : <div className="empty-panel panel">{historyUnavailable ? "Weekly history could not be loaded. Try again shortly." : "No weekly results have been imported yet."}</div>}</section>
    <details className="methodology"><summary>How are power rankings calculated?</summary><p>Teams earn category points for matchup wins, total fantasy points, and all-play wins (the number of other teams outscored each week). In a {ordered.length}-team league, each category awards {ordered.length} points for first down to 1 for last. Category ties split the points for their occupied places. Add the three categories for a maximum of {maxPower}. Equal power totals share a rank.</p><p>Each weekly column recalculates the season using all imported results through that week. Rank movement compares the latest two imported weeks.</p></details>
  </>;
}
