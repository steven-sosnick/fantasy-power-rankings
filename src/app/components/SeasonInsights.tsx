"use client";

import { useState } from "react";

export type TeamInsight = {
  team_id: number; team_name: string; weeks_played: number;
  average_points: number; best_score: number; worst_score: number;
  score_stddev: number | null; luck_weeks: number; actual_wins: number;
  expected_wins: number | null; luck: number | null;
};
export type Insights = {
  teams: TeamInsight[];
  weekly_highs: { week: number; points: number; teams: { team_id: number; team_name: string }[] }[];
};
const fmt = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);

export default function SeasonInsights({ insights }: { insights: Insights }) {
  const [sort, setSort] = useState("average");
  const teams = [...insights.teams].sort((a, b) => sort === "consistency"
    ? (a.score_stddev ?? Infinity) - (b.score_stddev ?? Infinity) || b.average_points - a.average_points
    : b.average_points - a.average_points);
  const luck = [...insights.teams].filter(t => t.luck !== null).sort((a, b) => (b.luck ?? 0) - (a.luck ?? 0));
  const extent = Math.max(1, ...luck.map(t => Math.abs(t.luck ?? 0)));
  const highs = [...insights.weekly_highs].sort((a, b) => b.week - a.week);
  if (!teams.length) return null;
  return <section className="dashboard-section" aria-labelledby="insights-title">
    <div className="section-heading"><div><span className="eyebrow">Beyond the standings</span><h2 id="insights-title">A little more to argue about.</h2><p>The scoring patterns and matchup breaks behind your record.</p></div></div>
    <div className="analytics-grid">
      <article className="panel analytics-card"><div className="analytics-heading"><div><span className="eyebrow">The weekly ceiling</span><h3>High-score honors</h3></div><span className="subtle-tag">{highs.length} weeks</span></div><p className="analytics-description">The top fantasy score each week. Tied leaders share the spotlight.</p>
        {highs.length ? <ol className="high-score-list">{highs.map((w, i) => <li key={w.week}><span className="week-medal">W{w.week}</span><div><strong>{w.teams.map(t => t.team_name).join(" / ")}</strong><small>{i === 0 ? "Latest imported week" : w.teams.length > 1 ? "Shared weekly high" : "Weekly scoring leader"}</small></div><b>{fmt(w.points)}<small>pts</small></b></li>)}</ol> : <p className="empty-panel">Weekly honors appear when every team’s score is available.</p>}
      </article>
      <article className="panel analytics-card"><div className="analytics-heading"><div><span className="eyebrow">The schedule factor</span><h3>Matchup luck</h3></div><span className="subtle-tag">Wins above expected</span></div><p className="analytics-description">Positive: more wins than scoring suggests. Negative: fewer wins.</p>
        {luck.length ? <><div className="luck-axis"><span>Fewer wins</span><span>0</span><span>More wins</span></div><ol className="luck-list">{luck.map(t => <li key={t.team_id}><div className="luck-label"><strong>{t.team_name}</strong><b className={(t.luck ?? 0) > 0 ? "positive" : (t.luck ?? 0) < 0 ? "negative" : ""}>{(t.luck ?? 0) > 0 ? "+" : ""}{fmt(t.luck ?? 0)}</b></div><div className="luck-track" role="img" aria-label={`${t.team_name}: ${fmt(t.luck ?? 0)} wins above expected`}><span style={{ left: `${(t.luck ?? 0) < 0 ? 50 - Math.abs(t.luck ?? 0) / extent * 50 : 50}%`, width: `${Math.abs(t.luck ?? 0) / extent * 50}%`, background: (t.luck ?? 0) < 0 ? "#b87754" : "#37765a" }} /></div><small>{t.actual_wins} actual wins · {fmt(t.expected_wins ?? 0)} expected · {t.luck_weeks} weeks compared</small></li>)}</ol></> : <p className="empty-panel">Luck comparisons need a week with every team’s score.</p>}
      </article>
    </div>
    <div className="section-heading consistency-heading"><div><h3>Steady scorers & big swings</h3><p>Compare each team’s average, range, and week-to-week scoring variation.</p></div><label className="analytics-sort">Sort by <select value={sort} onChange={e => setSort(e.target.value)}><option value="average">Highest average</option><option value="consistency">Most consistent</option></select></label></div>
    <div className="table-scroll panel"><table className="consistency-table"><caption className="sr-only">Scoring consistency by team</caption><thead><tr><th>Team</th><th>Weeks</th><th>Average</th><th>Best week</th><th>Lowest week</th><th>Standard deviation ↓</th></tr></thead><tbody>{teams.map(t => <tr key={t.team_id}><th scope="row">{t.team_name}</th><td>{t.weeks_played}</td><td><strong>{fmt(t.average_points)}</strong></td><td>{fmt(t.best_score)}</td><td>{fmt(t.worst_score)}</td><td>{t.score_stddev === null ? "—" : fmt(t.score_stddev)}<small>{t.score_stddev === null ? "Needs 2 weeks" : "Lower = steadier scores"}</small></td></tr>)}</tbody></table></div>
    <details className="methodology"><summary>What do these extra stats mean?</summary><p><strong>Consistency:</strong> population standard deviation measures how far weekly scores vary around a team’s average. Lower is steadier, not necessarily better. At least two recorded weeks are needed. Compare the number of weeks alongside the result.</p><p><strong>Expected wins:</strong> for each fully recorded week, count the opponents a team outscored and divide by the number of possible opponents. Add those probabilities across weeks. Matchup luck is actual wins minus that total; it describes schedule outcomes, not a prediction. Tied scores count as no win, consistent with this league’s win-only stats.</p><p>Weekly honors and luck comparisons exclude weeks with missing teams. All metrics reflect imported results and do not verify whether games have finished.</p></details>
  </section>;
}
