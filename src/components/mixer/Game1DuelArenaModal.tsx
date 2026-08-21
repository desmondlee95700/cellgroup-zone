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
  "#FEF08A",
  "#BAE6FD",
  "#FED7AA",
  "#FECDD3",
  "#E9D5FF",
  "#BBF7D0",
  "#FBCFE8",
  "#99F6E4",
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

  const swapCorners = () => {
    setDuelTeamAId(teamB.id);
    setDuelTeamBId(teamA.id);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#FFFDF5] border-4 border-black rounded-3xl p-4 sm:p-6 shadow-[10px_10px_0px_#000] w-full max-w-5xl my-auto relative">
        
        {/* Product-Designer Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b-4 border-black pb-4 mb-4 gap-3">
          
          {/* Left: Modal Title & Icon */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#FACC15] border-3 border-black rounded-xl flex items-center justify-center text-xl shadow-[2px_2px_0px_#000]">
              ⚔️
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 font-mono block">
                1v1 Head-to-Head Duel
              </span>
              <h2 className="brutal-font text-xl sm:text-2xl text-black uppercase leading-none">
                Savanna Duel
              </h2>
            </div>
          </div>

          {/* Center: Matchmaker Team Selectors (Red vs Blue) */}
          <div className="flex items-center justify-center gap-2 flex-1 max-w-xl mx-auto">
            {/* Red Corner Selector */}
            <div className="relative flex-1 min-w-[140px]">
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
                className="w-full bg-[#FFE4E6] text-red-950 font-black text-xs sm:text-sm px-3 py-2 border-3 border-black rounded-xl shadow-[3px_3px_0px_#000] outline-none cursor-pointer hover:bg-red-100 transition-all font-mono uppercase truncate"
              >
                {finalTeams.map(team => (
                  <option key={team.id} value={team.id} className="bg-white text-black">
                    🔴 {getSafariTeamLabel(team.name)}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Action Button */}
            <button
              type="button"
              onClick={swapCorners}
              title="Swap Red & Blue Corners"
              className="brutal-box bg-[#FACC15] text-black font-black text-xs p-2 border-3 border-black rounded-xl hover:bg-[#eab308] active:translate-y-0.5 shadow-[2.5px_2.5px_0px_#000] cursor-pointer shrink-0 transition-transform active:scale-95 flex items-center justify-center"
            >
              🔀
            </button>

            {/* Blue Corner Selector */}
            <div className="relative flex-1 min-w-[140px]">
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
                className="w-full bg-[#E0F2FE] text-sky-950 font-black text-xs sm:text-sm px-3 py-2 border-3 border-black rounded-xl shadow-[3px_3px_0px_#000] outline-none cursor-pointer hover:bg-sky-100 transition-all font-mono uppercase truncate"
              >
                {finalTeams.map(team => (
                  <option key={team.id} value={team.id} className="bg-white text-black">
                    🔵 {getSafariTeamLabel(team.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Exit Button */}
          <button
            type="button"
            onClick={onClose}
            className="brutal-box bg-red-500 text-white font-black text-xs px-3.5 py-2 border-3 border-black rounded-xl hover:bg-red-600 shadow-[3px_3px_0px_#000] cursor-pointer shrink-0"
          >
            ✕ Close
          </button>
        </div>

        {/* 1v1 Arena Split Cards */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          
          {/* Epic Animated Center VS Clash Badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-center justify-center pointer-events-none">
            <div className="relative flex items-center justify-center">
              {/* Outer Pulsing Aura Ring */}
              <span className="absolute w-20 h-20 rounded-full bg-[#FACC15] animate-ping opacity-60"></span>
              
              {/* Secondary Glow */}
              <span className="absolute w-16 h-16 rounded-full bg-red-500 animate-pulse opacity-40 blur-sm"></span>

              {/* Center VS Shield */}
              <div className="w-16 h-16 rounded-full bg-[#FACC15] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_#000] relative z-10 animate-bounce">
                <span className="brutal-font text-2xl text-black uppercase italic tracking-tighter drop-shadow-[1px_1px_0px_#fff]">
                  VS
                </span>
              </div>

              {/* Flashing Lightning Bolts */}
              <span className="absolute -left-5 text-xl animate-pulse">⚡</span>
              <span className="absolute -right-5 text-xl animate-pulse">⚡</span>
            </div>
          </div>

          {/* Team A (Left) */}
          <div
            className="border-4 border-black rounded-2xl p-4 flex flex-col justify-between shadow-[6px_6px_0px_#000] relative overflow-hidden"
            style={{ backgroundColor: getTeamAccent(teamA.color, 0) }}
          >
            {/* Team Title */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TeamMark name={teamA.name} />
                <h3 className="brutal-font text-xl sm:text-2xl text-black uppercase leading-tight">
                  {getSafariTeamLabel(teamA.name)}
                </h3>
              </div>

              {/* Roster Player Names */}
              <div className="flex flex-wrap gap-1.5 my-3">
                {teamA.members.length === 0 ? (
                  <span className="text-xs text-zinc-400 font-mono italic">No players</span>
                ) : (
                  teamA.members.map((m) => (
                    <span
                      key={m.id}
                      className="bg-white/90 text-black font-black text-xs px-2.5 py-1 border-2 border-black rounded-lg shadow-[1.5px_1.5px_0px_#000]"
                    >
                      {m.name}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Score & Controls */}
            <div className="mt-2">
              <div className={`bg-[#1D4A35] text-[#FACC15] p-3 border-3 border-black shadow-[3px_3px_0px_#000] rounded-xl flex items-center justify-between px-4 ${scoreFlashTeamId === teamA.id ? "score-pop" : ""}`}>
                <span className="text-[10px] font-black uppercase text-[#FFFDF5] font-mono">SCORE</span>
                <span className="brutal-font text-3xl sm:text-4xl text-[#FACC15] leading-none">{scoreA} <span className="text-xs font-mono text-[#FFFDF5]">PTS</span></span>
              </div>

              {(showRangerControls || isAuthenticated) && (
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => updateTeamScore(teamA.id, 1)}
                    className="bg-[#4ADE80] text-black font-black text-xs py-1.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] hover:bg-[#34d399] active:translate-y-0.5 cursor-pointer rounded-lg"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTeamScore(teamA.id, 2)}
                    className="bg-[#38BDF8] text-black font-black text-xs py-1.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] hover:bg-[#0284c7] hover:text-white active:translate-y-0.5 cursor-pointer rounded-lg"
                  >
                    +2
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTeamScore(teamA.id, 3)}
                    className="bg-[#FACC15] text-black font-black text-xs py-1.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] hover:bg-[#eab308] active:translate-y-0.5 cursor-pointer rounded-lg"
                  >
                    +3
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTeamScore(teamA.id, -1)}
                    className="bg-red-200 text-red-950 font-black text-xs py-1.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] hover:bg-red-300 active:translate-y-0.5 cursor-pointer rounded-lg"
                  >
                    -1
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Team B (Right) */}
          <div
            className="border-4 border-black rounded-2xl p-4 flex flex-col justify-between shadow-[6px_6px_0px_#000] relative overflow-hidden"
            style={{ backgroundColor: getTeamAccent(teamB.color, 1) }}
          >
            {/* Team Title */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TeamMark name={teamB.name} />
                <h3 className="brutal-font text-xl sm:text-2xl text-black uppercase leading-tight">
                  {getSafariTeamLabel(teamB.name)}
                </h3>
              </div>

              {/* Roster Player Names */}
              <div className="flex flex-wrap gap-1.5 my-3">
                {teamB.members.length === 0 ? (
                  <span className="text-xs text-zinc-400 font-mono italic">No players</span>
                ) : (
                  teamB.members.map((m) => (
                    <span
                      key={m.id}
                      className="bg-white/90 text-black font-black text-xs px-2.5 py-1 border-2 border-black rounded-lg shadow-[1.5px_1.5px_0px_#000]"
                    >
                      {m.name}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Score & Controls */}
            <div className="mt-2">
              <div className={`bg-[#1D4A35] text-[#FACC15] p-3 border-3 border-black shadow-[3px_3px_0px_#000] rounded-xl flex items-center justify-between px-4 ${scoreFlashTeamId === teamB.id ? "score-pop" : ""}`}>
                <span className="text-[10px] font-black uppercase text-[#FFFDF5] font-mono">SCORE</span>
                <span className="brutal-font text-3xl sm:text-4xl text-[#FACC15] leading-none">{scoreB} <span className="text-xs font-mono text-[#FFFDF5]">PTS</span></span>
              </div>

              {(showRangerControls || isAuthenticated) && (
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => updateTeamScore(teamB.id, 1)}
                    className="bg-[#4ADE80] text-black font-black text-xs py-1.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] hover:bg-[#34d399] active:translate-y-0.5 cursor-pointer rounded-lg"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTeamScore(teamB.id, 2)}
                    className="bg-[#38BDF8] text-black font-black text-xs py-1.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] hover:bg-[#0284c7] hover:text-white active:translate-y-0.5 cursor-pointer rounded-lg"
                  >
                    +2
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTeamScore(teamB.id, 3)}
                    className="bg-[#FACC15] text-black font-black text-xs py-1.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] hover:bg-[#eab308] active:translate-y-0.5 cursor-pointer rounded-lg"
                  >
                    +3
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTeamScore(teamB.id, -1)}
                    className="bg-red-200 text-red-950 font-black text-xs py-1.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] hover:bg-red-300 active:translate-y-0.5 cursor-pointer rounded-lg"
                  >
                    -1
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
