"use client";

import React from "react";
import { Team } from "./types";
import { getSafariTeamLabel } from "@/lib/safari-theme";

interface LeaderboardSectionProps {
  rankedTeams: Team[];
  topScore: number;
  leadMargin: number;
  leaderTeam: Team | undefined;
  spotlightTeam: Team | undefined;
  setSpotlightTeamId: (id: number) => void;
  scoreFlashTeamId: number | null;
  showRangerControls: boolean;
  updateTeamScore: (teamId: number, delta: number) => void;
  TeamMark: React.ComponentType<{ name: string; compact?: boolean }>;
  ScoreAwardControls: React.ComponentType<{ team: Team; onAward: (teamId: number, delta: number) => void; compact?: boolean }>;
  openDuelArena?: () => void;
}

const FALLBACK_ACCENT_HEXES = [
  "#FEF08A",
  "#BAE6FD",
  "#FED7AA",
  "#FECDD3",
  "#E9D5FF",
  "#BBF7D0",
  "#FBCFE8",
  "#99F6E4",
];

export function LeaderboardSection({
  rankedTeams,
  topScore,
  leadMargin,
  leaderTeam,
  spotlightTeam,
  setSpotlightTeamId,
  scoreFlashTeamId,
  showRangerControls,
  updateTeamScore,
  TeamMark,
  ScoreAwardControls,
  openDuelArena,
}: LeaderboardSectionProps) {
  const getTeamAccent = (colorClass: string, fallbackIdx: number) => {
    if (!colorClass) return FALLBACK_ACCENT_HEXES[fallbackIdx % FALLBACK_ACCENT_HEXES.length];
    if (colorClass.includes("#")) {
      const match = colorClass.match(/#(?:[a-fA-F0-9]{6}|[a-fA-F0-9]{3})/);
      if (match) return match[0];
    }
    return FALLBACK_ACCENT_HEXES[fallbackIdx % FALLBACK_ACCENT_HEXES.length];
  };

  // Only teams with >0 points qualify for the top Hero Podium cards (up to 3)
  const podiumScoringTeams = rankedTeams.filter((t) => (t.score ?? 0) > 0).slice(0, 3);
  // All remaining teams (or 0-point teams) move under Chasing Herds
  const chasingHerdsTeams = rankedTeams.filter((t) => !podiumScoringTeams.some((pt) => pt.id === t.id));

  return (
    <section className="safari-podium-board" aria-labelledby="live-podium-title">
      <div className="flex justify-between items-end border-b-4 border-black pb-3 mb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600 font-mono block">
            Live Savanna Standings
          </span>
          <h3 id="live-podium-title" className="brutal-font text-xl md:text-2xl text-black uppercase leading-none">
            Today&apos;s Trail Leaderboard
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono font-black bg-[#FACC15] text-black px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000] uppercase">
            {topScore === 0 ? "Awaiting First Score" : (leadMargin === 0 ? `Tied for 1st (${topScore} PTS)` : `${getSafariTeamLabel(leaderTeam?.name ?? "")} Leads`)}
          </span>
        </div>
      </div>

      {/* Hero Podium Area */}
      {podiumScoringTeams.length > 0 ? (
        <div className={`grid grid-cols-1 ${podiumScoringTeams.length === 1 ? "md:grid-cols-1 max-w-md mx-auto" : podiumScoringTeams.length === 2 ? "md:grid-cols-2 max-w-2xl mx-auto" : "md:grid-cols-3"} gap-4 items-stretch mb-6`} aria-live="polite">
          {podiumScoringTeams.map((team, idx) => {
            const score = team.score ?? 0;
            const higherScoringTeams = rankedTeams.filter((t) => (t.score ?? 0) > score).length;
            const tiedTeamsCount = rankedTeams.filter((t) => (t.score ?? 0) === score && score > 0).length;
            const isTied = tiedTeamsCount > 1;
            const earnedRank = higherScoringTeams + 1;
            const isSpotlight = spotlightTeam?.id === team.id;

            let rankBadgeColor = "bg-[#FACC15] text-black";
            let rankTitle = "1ST PLACE 👑";

            if (earnedRank === 1) {
              rankTitle = isTied ? "TIED 1ST 👑" : "1ST PLACE 👑";
              rankBadgeColor = "bg-[#FACC15] text-black";
            } else if (earnedRank === 2) {
              rankTitle = isTied ? "TIED 2ND 🥈" : "2ND PLACE 🥈";
              rankBadgeColor = "bg-[#E2E8F0] text-black";
            } else if (earnedRank === 3) {
              rankTitle = isTied ? "TIED 3RD 🥉" : "3RD PLACE 🥉";
              rankBadgeColor = "bg-[#F59E0B] text-white";
            } else {
              rankTitle = isTied ? `#${earnedRank} TIED 🏃` : `#${earnedRank} RANKED 🏃`;
              rankBadgeColor = "bg-[#5CC8E8] text-black";
            }

            let status = "Awaiting points";
            if (isTied) {
              status = `Tied for #${earnedRank}`;
            } else if (earnedRank === 1) {
              status = leadMargin === 0 ? "Tied for 1st" : `${leadMargin} pts clear`;
            } else if (idx > 0) {
              const teamAhead = podiumScoringTeams[idx - 1];
              const diff = (teamAhead.score ?? 0) - score;
              status = diff === 0 ? "Tied for rank" : `${diff} pts to #${earnedRank - 1}`;
            }

            return (
              <div
                key={team.id}
                className={`border-4 border-black rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 shadow-[5px_5px_0px_#000] relative overflow-hidden ${
                  isSpotlight ? "ring-4 ring-[#FFFDF5] outline-4 outline-black scale-[1.02]" : "hover:shadow-[7px_7px_0px_#000]"
                }`}
                style={{ backgroundColor: getTeamAccent(team.color, idx) }}
              >
                {/* Top Header: Rank Banner & Status */}
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-[10px] font-black font-mono uppercase px-2.5 py-0.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] rounded-md ${rankBadgeColor}`}>
                    {rankTitle}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-wider font-mono text-zinc-700 bg-white/70 px-2 py-0.5 border border-black/40 rounded">
                    {status}
                  </span>
                </div>

                {/* Card Body: Interactive Click Target */}
                <button
                  type="button"
                  onClick={() => setSpotlightTeamId(team.id)}
                  className="flex flex-col items-center text-center w-full cursor-pointer bg-transparent border-0 p-0 my-1 group"
                >
                  {/* Animal Avatar Icon */}
                  <div className="relative mb-2">
                    <TeamMark name={team.name} />
                  </div>

                  {/* Team Name */}
                  <h4 className="brutal-font text-base md:text-lg text-black uppercase leading-tight tracking-wide my-1 text-center w-full px-1">
                    {getSafariTeamLabel(team.name)}
                  </h4>

                  {/* Explorer Count */}
                  <span className="text-[9px] font-bold uppercase font-mono text-zinc-700 bg-white/80 px-2.5 py-0.5 border border-black shadow-[1px_1px_0px_#000] rounded-full my-1">
                    👥 {team.members.length} Explorer{team.members.length === 1 ? "" : "s"}
                  </span>
                </button>

                {/* Bottom Score Box */}
                <div className="mt-3">
                  <div className={`bg-[#1D4A35] text-[#FACC15] p-2.5 border-3 border-black shadow-[2px_2px_0px_#000] rounded-xl text-center flex items-center justify-between px-4 ${scoreFlashTeamId === team.id ? "score-pop" : ""}`}>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#FFFDF5] font-mono">
                      TOTAL SCORE
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="brutal-font text-2xl md:text-3xl leading-none text-[#FACC15]">{score}</span>
                      <span className="text-[9px] font-black text-[#FFFDF5] font-mono uppercase">PTS</span>
                    </div>
                  </div>

                  {/* Ranger Controls */}
                  {showRangerControls && (
                    <div className="mt-2 pt-2 border-t-2 border-black/20">
                      <ScoreAwardControls team={team} onAward={updateTeamScore} compact />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 border-4 border-black rounded-2xl bg-[#FFF3C4] text-center shadow-[5px_5px_0px_#000] mb-6">
          <span className="text-3xl mb-2 block" aria-hidden="true">🏆</span>
          <h4 className="brutal-font text-lg text-black uppercase mb-1">
            Savanna Podium Ready
          </h4>
          <p className="text-xs font-bold text-zinc-700 uppercase max-w-md mx-auto">
            Award points during challenges or 1v1 duels to see animal herds claim 1st, 2nd, and 3rd place!
          </p>
        </div>
      )}

      {/* Chasing Herds Section for 0-point & Non-Podium Teams */}
      {chasingHerdsTeams.length > 0 && (
        <div className="mt-6 pt-4 border-t-4 border-black">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">🏃</span>
              <h4 className="brutal-font text-xs uppercase tracking-wider text-black">
                {podiumScoringTeams.length === 0
                  ? `Herds on the Trail (${chasingHerdsTeams.length} Teams)`
                  : `Chasing Herds (${chasingHerdsTeams.length} Runners)`}
              </h4>
            </div>
            <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase">
              Tap any herd to spotlight on stage
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {chasingHerdsTeams.map((team, idx) => {
              const score = team.score ?? 0;
              const isSpotlight = spotlightTeam?.id === team.id;
              const higherScoringTeams = rankedTeams.filter((t) => (t.score ?? 0) > score).length;
              const earnedRank = score > 0 ? higherScoringTeams + 1 : null;
              const rankDisplay = earnedRank ? `#${earnedRank}` : "🐾";
              const status = topScore === 0 ? "Awaiting points" : `${topScore - score} pts to #1`;

              return (
                <div
                  key={team.id}
                  className={`p-3 border-3 border-black rounded-xl bg-white shadow-[3px_3px_0px_#000] flex flex-col justify-between transition-all hover:shadow-[5px_5px_0px_#000] hover:scale-[1.01] ${
                    isSpotlight ? "ring-4 ring-[#FFFDF5] outline-2 outline-black" : ""
                  }`}
                  style={{ backgroundColor: getTeamAccent(team.color, idx + podiumScoringTeams.length) }}
                >
                  <button
                    type="button"
                    onClick={() => setSpotlightTeamId(team.id)}
                    className="flex items-center justify-between gap-3 text-left w-full cursor-pointer border-0 bg-transparent p-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="w-7 h-7 rounded-full border-2 border-black bg-[#FFFDF5] flex items-center justify-center font-black font-mono text-[10px] shadow-[1px_1px_0px_#000] shrink-0 text-black">
                        {rankDisplay}
                      </span>
                      <TeamMark name={team.name} compact />
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] font-black uppercase text-zinc-700 block leading-tight tracking-wide font-mono">
                          {status}
                        </span>
                        <strong className="brutal-font text-xs sm:text-sm text-black uppercase block leading-tight mt-0.5">
                          {getSafariTeamLabel(team.name)}
                        </strong>
                        <em className="text-[8px] font-bold text-zinc-600 uppercase block font-mono not-italic mt-0.5">
                          {team.members.length} Explorers
                        </em>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-0.5 bg-[#1D4A35] text-[#FACC15] px-2.5 py-1 border-2 border-black rounded-lg shadow-[1px_1px_0px_#000] shrink-0">
                      <span className="brutal-font text-sm leading-none">{score}</span>
                      <span className="text-[7px] font-mono font-black text-[#FFFDF5]">PTS</span>
                    </div>
                  </button>

                  {showRangerControls && (
                    <div className="mt-2 pt-2 border-t border-black/20">
                      <ScoreAwardControls team={team} onAward={updateTeamScore} compact />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
