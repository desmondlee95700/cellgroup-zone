"use client";

import React from "react";
import { Team } from "./types";
import { getSafariTeamLabel } from "@/lib/safari-theme";

interface Game1DuelArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  finalTeams: Team[];
  duelTeamAId: number | null;
  duelTeamBId: number | null;
  setDuelTeamAId: (id: number) => void;
  setDuelTeamBId: (id: number) => void;
  showRangerControls: boolean;
  isAuthenticated: boolean;
  scoreFlashTeamId: number | null;
  updateTeamScore: (teamId: number, delta: number) => void;
  TeamMark: React.ComponentType<{ name: string; compact?: boolean }>;
}

const FALLBACK_ACCENT_HEXES = [
  "#FEF08A", // Yellow
  "#BAE6FD", // Sky
  "#FED7AA", // Orange
  "#FECDD3", // Rose
  "#E9D5FF", // Purple
  "#BBF7D0", // Emerald
  "#FBCFE8", // Pink
  "#99F6E4", // Teal
];

export function Game1DuelArenaModal({
  isOpen,
  onClose,
  finalTeams,
  duelTeamAId,
  duelTeamBId,
  setDuelTeamAId,
  setDuelTeamBId,
  showRangerControls,
  isAuthenticated,
  scoreFlashTeamId,
  updateTeamScore,
  TeamMark,
}: Game1DuelArenaModalProps) {
  if (!isOpen) return null;

  const getTeamAccent = (colorClass: string, fallbackIdx: number) => {
    if (!colorClass) return FALLBACK_ACCENT_HEXES[fallbackIdx % FALLBACK_ACCENT_HEXES.length];
    if (colorClass.includes("#")) {
      const match = colorClass.match(/#(?:[a-fA-F0-9]{6}|[a-fA-F0-9]{3})/);
      if (match) return match[0];
    }
    return FALLBACK_ACCENT_HEXES[fallbackIdx % FALLBACK_ACCENT_HEXES.length];
  };

  const teamA = finalTeams.find(t => t.id === duelTeamAId) || finalTeams[0];
  const teamB = finalTeams.find(t => t.id === duelTeamBId) || finalTeams[1] || finalTeams[0];

  if (!teamA || !teamB) return null;

  const scoreA = teamA.score ?? 0;
  const scoreB = teamB.score ?? 0;
  const diff = Math.abs(scoreA - scoreB);
  const leaderText = scoreA === scoreB
    ? "⚔️ TIED IN GAME 1 DUEL"
    : scoreA > scoreB
      ? `🦁 ${getSafariTeamLabel(teamA.name)} leads by ${diff} pts!`
      : `🐊 ${getSafariTeamLabel(teamB.name)} leads by ${diff} pts!`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FFFDF5] border-4 border-black rounded-3xl p-4 sm:p-6 shadow-[10px_10px_0px_#000] w-full max-w-5xl my-auto relative">
        
        {/* Modal Top Header Bar */}
        <div className="flex flex-wrap justify-between items-center border-b-4 border-black pb-4 mb-4 gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">⚔️</span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 font-mono block">
                Game 1 Exclusive Feature · 1v1 Head-to-Head Arena
              </span>
              <h2 className="brutal-font text-xl sm:text-2xl text-black uppercase leading-none">
                Savanna Duel Arena
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Admin Status Pill */}
            <span className={`text-[9px] font-mono font-black uppercase px-2.5 py-1 border-2 border-black shadow-[1.5px_1.5px_0px_#000] rounded-md ${
              showRangerControls || isAuthenticated ? "bg-[#4ADE80] text-black" : "bg-amber-100 text-amber-900"
            }`}>
              {showRangerControls || isAuthenticated ? "🔓 Admin Scoring Active" : "👁️ View Only (Admin Scoring Locked)"}
            </span>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="brutal-box bg-red-500 text-white font-black text-xs px-3 py-1.5 border-2 border-black hover:bg-red-600 shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              ✕ Exit Arena
            </button>
          </div>
        </div>

        {/* Matchmaking Team Selectors */}
        <div className="bg-zinc-100 border-3 border-black p-3 rounded-xl mb-4 flex flex-wrap items-center justify-between gap-3 shadow-[2px_2px_0px_#000]">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <label className="text-[10px] font-black uppercase text-black font-mono shrink-0">Team A (Left):</label>
            <select
              value={duelTeamAId ?? ""}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setDuelTeamAId(val);
                if (val === duelTeamBId) {
                  const other = finalTeams.find(t => t.id !== val);
                  if (other) setDuelTeamBId(other.id);
                }
              }}
              className="flex-1 bg-white text-black font-black text-xs px-3 py-1.5 border-2 border-black rounded-lg shadow-[1px_1px_0px_#000] outline-none cursor-pointer"
            >
              {finalTeams.map(team => (
                <option key={team.id} value={team.id}>
                  {getSafariTeamLabel(team.name)} ({team.members.length} members)
                </option>
              ))}
            </select>
          </div>

          <span className="brutal-font text-base text-zinc-400 font-mono hidden sm:inline">VS</span>

          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <label className="text-[10px] font-black uppercase text-black font-mono shrink-0">Team B (Right):</label>
            <select
              value={duelTeamBId ?? ""}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setDuelTeamBId(val);
                if (val === duelTeamAId) {
                  const other = finalTeams.find(t => t.id !== val);
                  if (other) setDuelTeamBId(other.id);
                }
              }}
              className="flex-1 bg-white text-black font-black text-xs px-3 py-1.5 border-2 border-black rounded-lg shadow-[1px_1px_0px_#000] outline-none cursor-pointer"
            >
              {finalTeams.map(team => (
                <option key={team.id} value={team.id}>
                  {getSafariTeamLabel(team.name)} ({team.members.length} members)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duel Arena Split View */}
        <div className="space-y-4">
          {/* Arena Status Header */}
          <div className="bg-[#18181B] text-[#FACC15] text-center py-2 px-4 border-3 border-black shadow-[3px_3px_0px_#000] rounded-xl flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-400">
              1st Game Live Scoreboard
            </span>
            <span className="brutal-font text-xs sm:text-sm uppercase tracking-wide text-[#FACC15]">
              {leaderText}
            </span>
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-400">
              Face-off Arena
            </span>
          </div>

          {/* Split Screen Matchup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            
            {/* Team A (Left) */}
            <div
              className="border-4 border-black rounded-2xl p-4 flex flex-col justify-between shadow-[6px_6px_0px_#000] relative overflow-hidden"
              style={{ backgroundColor: getTeamAccent(teamA.color, 0) }}
            >
              {/* Team Badge & Avatar */}
              <div className="flex items-center justify-between border-b-2 border-black/20 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <TeamMark name={teamA.name} />
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-700 font-mono block">
                      RED CORNER · TEAM 1
                    </span>
                    <h3 className="brutal-font text-lg sm:text-xl text-black uppercase leading-none">
                      {getSafariTeamLabel(teamA.name)}
                    </h3>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase font-mono text-black bg-white/80 px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000] rounded-full">
                  {teamA.members.length} Explorers
                </span>
              </div>

              {/* Team A Member Roster List */}
              <div className="mb-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-700 font-mono block mb-1.5">
                  On-Stage Player Roster:
                </span>
                <div className="bg-white/80 border-2 border-black rounded-xl p-2.5 max-h-[160px] overflow-y-auto space-y-1.5 shadow-[2px_2px_0px_#000]">
                  {teamA.members.length === 0 ? (
                    <p className="text-[10px] text-zinc-400 font-mono uppercase text-center py-2">No players assigned</p>
                  ) : (
                    teamA.members.map((m, idx) => (
                      <div key={m.id} className="flex items-center justify-between text-xs font-bold text-black border-b border-zinc-200 pb-1 last:border-0 last:pb-0">
                        <span className="flex items-center gap-1.5">
                          <span className="font-mono text-[9px] text-zinc-400 font-black">#{idx + 1}</span>
                          <span className="font-black uppercase">{m.name}</span>
                        </span>
                        <span className="text-[8px] bg-zinc-100 text-black px-1.5 py-0.5 border border-black font-mono font-bold uppercase">
                          {m.cg}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Team A Live Score Box & Admin Controls */}
              <div>
                <div className={`bg-[#1D4A35] text-[#FACC15] p-3 border-3 border-black shadow-[3px_3px_0px_#000] rounded-xl text-center flex items-center justify-between px-4 ${scoreFlashTeamId === teamA.id ? "score-pop" : ""}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FFFDF5] font-mono">
                    TEAM SCORE
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="brutal-font text-3xl sm:text-4xl leading-none text-[#FACC15]">{scoreA}</span>
                    <span className="text-[10px] font-black text-[#FFFDF5] font-mono uppercase">PTS</span>
                  </div>
                </div>

                {/* Admin Point Controls */}
                <div className="mt-3">
                  {showRangerControls || isAuthenticated ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black font-mono text-zinc-700 uppercase shrink-0">Admin Score:</span>
                      <div className="flex-1 grid grid-cols-4 gap-1">
                        <button
                          type="button"
                          onClick={() => updateTeamScore(teamA.id, 1)}
                          className="bg-[#4ADE80] text-black font-black text-xs py-1.5 border-2 border-black shadow-[1px_1px_0px_#000] hover:bg-[#34d399] active:translate-y-0.5 cursor-pointer"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTeamScore(teamA.id, 2)}
                          className="bg-[#38BDF8] text-black font-black text-xs py-1.5 border-2 border-black shadow-[1px_1px_0px_#000] hover:bg-[#0284c7] hover:text-white active:translate-y-0.5 cursor-pointer"
                        >
                          +2
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTeamScore(teamA.id, 3)}
                          className="bg-[#FACC15] text-black font-black text-xs py-1.5 border-2 border-black shadow-[1px_1px_0px_#000] hover:bg-[#eab308] active:translate-y-0.5 cursor-pointer"
                        >
                          +3
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTeamScore(teamA.id, -1)}
                          className="bg-red-200 text-red-900 font-black text-xs py-1.5 border-2 border-black shadow-[1px_1px_0px_#000] hover:bg-red-300 active:translate-y-0.5 cursor-pointer"
                        >
                          -1
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[9px] font-mono font-bold text-center text-zinc-500 bg-white/70 py-1 border border-black/30 rounded uppercase">
                      🔒 Score entry restricted to Admin / Rangers
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Team B (Right) */}
            <div
              className="border-4 border-black rounded-2xl p-4 flex flex-col justify-between shadow-[6px_6px_0px_#000] relative overflow-hidden"
              style={{ backgroundColor: getTeamAccent(teamB.color, 1) }}
            >
              {/* Team Badge & Avatar */}
              <div className="flex items-center justify-between border-b-2 border-black/20 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <TeamMark name={teamB.name} />
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-700 font-mono block">
                      BLUE CORNER · TEAM 2
                    </span>
                    <h3 className="brutal-font text-lg sm:text-xl text-black uppercase leading-none">
                      {getSafariTeamLabel(teamB.name)}
                    </h3>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase font-mono text-black bg-white/80 px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000] rounded-full">
                  {teamB.members.length} Explorers
                </span>
              </div>

              {/* Team B Member Roster List */}
              <div className="mb-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-700 font-mono block mb-1.5">
                  On-Stage Player Roster:
                </span>
                <div className="bg-white/80 border-2 border-black rounded-xl p-2.5 max-h-[160px] overflow-y-auto space-y-1.5 shadow-[2px_2px_0px_#000]">
                  {teamB.members.length === 0 ? (
                    <p className="text-[10px] text-zinc-400 font-mono uppercase text-center py-2">No players assigned</p>
                  ) : (
                    teamB.members.map((m, idx) => (
                      <div key={m.id} className="flex items-center justify-between text-xs font-bold text-black border-b border-zinc-200 pb-1 last:border-0 last:pb-0">
                        <span className="flex items-center gap-1.5">
                          <span className="font-mono text-[9px] text-zinc-400 font-black">#{idx + 1}</span>
                          <span className="font-black uppercase">{m.name}</span>
                        </span>
                        <span className="text-[8px] bg-zinc-100 text-black px-1.5 py-0.5 border border-black font-mono font-bold uppercase">
                          {m.cg}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Team B Live Score Box & Admin Controls */}
              <div>
                <div className={`bg-[#1D4A35] text-[#FACC15] p-3 border-3 border-black shadow-[3px_3px_0px_#000] rounded-xl text-center flex items-center justify-between px-4 ${scoreFlashTeamId === teamB.id ? "score-pop" : ""}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FFFDF5] font-mono">
                    TEAM SCORE
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="brutal-font text-3xl sm:text-4xl leading-none text-[#FACC15]">{scoreB}</span>
                    <span className="text-[10px] font-black text-[#FFFDF5] font-mono uppercase">PTS</span>
                  </div>
                </div>

                {/* Admin Point Controls */}
                <div className="mt-3">
                  {showRangerControls || isAuthenticated ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black font-mono text-zinc-700 uppercase shrink-0">Admin Score:</span>
                      <div className="flex-1 grid grid-cols-4 gap-1">
                        <button
                          type="button"
                          onClick={() => updateTeamScore(teamB.id, 1)}
                          className="bg-[#4ADE80] text-black font-black text-xs py-1.5 border-2 border-black shadow-[1px_1px_0px_#000] hover:bg-[#34d399] active:translate-y-0.5 cursor-pointer"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTeamScore(teamB.id, 2)}
                          className="bg-[#38BDF8] text-black font-black text-xs py-1.5 border-2 border-black shadow-[1px_1px_0px_#000] hover:bg-[#0284c7] hover:text-white active:translate-y-0.5 cursor-pointer"
                        >
                          +2
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTeamScore(teamB.id, 3)}
                          className="bg-[#FACC15] text-black font-black text-xs py-1.5 border-2 border-black shadow-[1px_1px_0px_#000] hover:bg-[#eab308] active:translate-y-0.5 cursor-pointer"
                        >
                          +3
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTeamScore(teamB.id, -1)}
                          className="bg-red-200 text-red-900 font-black text-xs py-1.5 border-2 border-black shadow-[1px_1px_0px_#000] hover:bg-red-300 active:translate-y-0.5 cursor-pointer"
                        >
                          -1
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[9px] font-mono font-bold text-center text-zinc-500 bg-white/70 py-1 border border-black/30 rounded uppercase">
                      🔒 Score entry restricted to Admin / Rangers
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
