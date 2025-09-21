"use client";

import { useState } from "react";

type Ranking = {
  id: number;
  team_id: number;
  team_name: string;
  wins: number;
  points_for: number;
  h2h_wins: number;
  category_wins: number;
  category_points_for: number;
  category_h2h: number;
  total: number;
  rank: number;
};

type Props = {
  rankings: Ranking[];
};

export default function PowerRankingTable({ rankings }: Props) {
  const [sortBy, setSortBy] = useState<keyof Ranking>("total"); // default Total
  const [sortAsc, setSortAsc] = useState(false); // descending by default

  const sortedData = [...rankings].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof Ranking) => {
    if (sortBy === key) setSortAsc(!sortAsc);
    else {
      setSortBy(key);
      setSortAsc(false); // descending by default when changing column
    }
  };

  const renderArrow = (key: keyof Ranking) => {
    if (sortBy !== key) return null;
    return sortAsc ? " ▲" : " ▼";
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg shadow-md">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("rank")}
            >
              Rank{renderArrow("rank")}
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("team_name")}
            >
              Team{renderArrow("team_name")}
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("wins")}
            >
              Wins{renderArrow("wins")}
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("category_wins")}
            >
              Category Wins{renderArrow("category_wins")}
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("points_for")}
            >
              Points For{renderArrow("points_for")}
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("category_points_for")}
            >
              Category Points{renderArrow("category_points_for")}
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("h2h_wins")}
            >
              H2H Wins{renderArrow("h2h_wins")}
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("category_h2h")}
            >
              Category H2H{renderArrow("category_h2h")}
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("total")}
            >
              Total{renderArrow("total")}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr
              key={row.id}
              className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="px-4 py-2 text-center font-bold">{row.rank}</td>
              <td className="px-4 py-2 text-center">{row.team_name}</td>
              <td className="px-4 py-2 text-center">{row.wins}</td>
              <td className="px-4 py-2 text-center">{row.category_wins}</td>
              <td className="px-4 py-2 text-center">{row.points_for}</td>
              <td className="px-4 py-2 text-center">{row.category_points_for}</td>
              <td className="px-4 py-2 text-center">{row.h2h_wins}</td>
              <td className="px-4 py-2 text-center">{row.category_h2h}</td>
              <td className="px-4 py-2 text-center">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
