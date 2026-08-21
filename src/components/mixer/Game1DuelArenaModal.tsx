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
  const diff = Math.abs(scoreA - scoreB);

  const isTied = scoreA === scoreB;
  const teamALeads = scoreA > scoreB;

  const swapCorners = () => {
    setDuelTeamAId(teamB.id);
    setDuelTeamBId(teamA.id);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-[#FFFDF5] border-4 border-black rounded-3xl p-3 sm:p-5 md:p-6 shadow-[12px_12px_0px_#000] w-full max-w-6xl my-auto relative overflow-hidden">
        
        {/* Top Competition Arena Header */}
        <div className="flex flex-wrap justify-between items-center border-b-4 border-black pb-3 mb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FACC15] border-3 border-black rounded-xl flex items-center justify-center text-xl shadow-[2px_2px_0px_#000] animate-bounce">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#FFFDF5] font-mono bg-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_#FACC15]">
                  GAME 1 ARENA
                </span>
                <span className="text-[9px] font-black uppercase font-mono text-zinc-600">
                  Head-to-Head Showdown
                </span>
              </div>
              <h2 className="brutal-font text-xl sm:text-2xl md:text-3xl text-black uppercase leading-none mt-1">
                SAVANNA DUEL CHAMPIONSHIP
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Swap Corners Button */}
            <button
              type="button"
              onClick={swapCorners}
              className="brutal-box bg-[#38BDF8] text-black font-black text-xs px-3 py-1.5 border-2 border-black hover:bg-sky-300 shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1"
            >
              <span>🔀</span> Swap Corners
            </button>

            {/* Admin Status Pill */}
            <span className={`text-[9px] font-mono font-black uppercase px-2.5 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] rounded-lg ${
              showRangerControls || isAuthenticated ? "bg-[#4ADE80] text-black" : "bg-amber-200 text-amber-950"
            }`}>
              {showRangerControls || isAuthenticated ? "🔓 Ranger Scoring Active" : "👁️ View Only"}
            </span>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="brutal-box bg-red-500 text-white font-black text-xs px-3 py-1.5 border-2 border-black hover:bg-red-600 shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Matchmaking Team Selectors */}
        <div className="bg-zinc-900 text-white border-3 border-black p-3 rounded-2xl mb-4 flex flex-wrap items-center justify-between gap-3 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-white animate-ping"></span>
            <label className="text-[10px] font-black uppercase text-[#FACC15] font-mono shrink-0">Red Corner:</label>
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
              className="flex-1 bg-white text-black font-black text-xs sm:text-sm px-3 py-1.5 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] outline-none cursor-pointer"
            >
              {finalTeams.map(team => (
                <option key={team.id} value={team.id}>
                  {getSafariTeamLabel(team.name)} ({team.members.length} members)
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex items-center gap-1 font-mono font-black text-xs text-[#FACC15] px-2 py-1 bg-black border border-zinc-700 rounded-lg">
            <span>⚡ MATCHMAKER ⚡</span>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <span className="w-3 h-3 rounded-full bg-blue-500 border border-white animate-ping"></span>
            <label className="text-[10px] font-black uppercase text-[#38BDF8] font-mono shrink-0">Blue Corner:</label>
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
              className="flex-1 bg-white text-black font-black text-xs sm:text-sm px-3 py-1.5 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] outline-none cursor-pointer"
            >
              {finalTeams.map(team => (
                <option key={team.id} value={team.id}>
                  {getSafariTeamLabel(team.name)} ({team.members.length} members)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Match Lead Banner */}
        <div className="bg-[#18181B] text-[#FFFDF5] py-2 px-4 border-3 border-black shadow-[3px_3px_0px_#000] rounded-xl flex items-center justify-between mb-4">
          <span className="text-[10px] font-mono font-black uppercase tracking-wider text-red-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse"></span> RED CORNER
          </span>
          
          <div className="text-center">
            <span className="brutal-font text-xs sm:text-sm md:text-base uppercase tracking-wide text-[#FACC15] block">
              {isTied
                ? "⚔️ TIED MATCH — NEITHER HERD HAS ADVANTAGE!"
                : teamALeads
                  ? `🔥 ${getSafariTeamLabel(teamA.name)} IS LEADING BY ${diff} PTS!`
                  : `⚡ ${getSafariTeamLabel(teamB.name)} IS LEADING BY ${diff} PTS!`}
            </span>
          </div>

          <span className="text-[10px] font-mono font-black uppercase tracking-wider text-sky-400 flex items-center gap-1">
            BLUE CORNER <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-pulse"></span>
          </span>
        </div>

        {/* Competition Arena Stage with Center VS Badge */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch">
          
          {/* Animated Center "VS" Clash Badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-center pointer-events-none">
            <div className="relative flex items-center justify-center">
              {/* Outer Pulsing Glow */}
              <div className="absolute inset-0 rounded-full bg-[#FACC15] blur-md animate-pulse opacity-80"></div>
              {/* VS Circle */}
              <div className="w-16 h-16 rounded-full bg-[#FACC15] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_#000] relative z-10 animate-bounce">
                <span className="brutal-font text-2xl text-black uppercase italic tracking-tighter">
                  VS
                </span>
              </div>
            </div>
            <span className="bg-black text-[#FACC15] font-mono font-black text-[9px] px-2 py-0.5 border-2 border-black uppercase mt-1 shadow-[2px_2px_0px_#000]">
              1v1 CLASH
            </span>
          </div>

          {/* Team A (Red Corner / Left) */}
          <div
            className="border-4 border-black rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-[8px_8px_0px_#000] relative overflow-hidden transition-all"
            style={{ backgroundColor: getTeamAccent(teamA.color, 0) }}
          >
            {/* Top Corner Banner */}
            <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <TeamMark name={teamA.name} />
                  <span className="absolute -bottom-1 -right-1 bg-red-600 text-white font-mono text-[8px] font-black px-1 border border-black rounded uppercase">
                    RED
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-red-800 font-mono block">
                    RED CORNER · TEAM 1
                  </span>
                  <h3 className="brutal-font text-xl sm:text-2xl text-black uppercase leading-tight">
                    {getSafariTeamLabel(teamA.name)}
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-mono font-black bg-white text-black px-2.5 py-1 border-2 border-black shadow-[1.5px_1.5px_0px_#000] rounded-full">
                👥 {teamA.members.length} Players
              </span>
            </div>

            {/* On-Stage Player Roster List */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-black font-mono">
                  📋 On-Stage Player Roster:
                </span>
                <span className="text-[8px] font-mono font-bold text-zinc-600 uppercase">
                  Competing in Game 1
                </span>
              </div>
              <div className="bg-white/90 border-3 border-black rounded-2xl p-3 max-h-[180px] overflow-y-auto space-y-1.5 shadow-[3px_3px_0px_#000]">
                {teamA.members.length === 0 ? (
                  <p className="text-[11px] text-zinc-400 font-mono uppercase text-center py-3">No players in this team</p>
                ) : (
                  teamA.members.map((m, idx) => (
                    <div key={m.id} className="flex items-center justify-between text-xs font-black text-black border-b-2 border-zinc-200 pb-1.5 last:border-0 last:pb-0 hover:bg-zinc-50 p-1 rounded">
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#FACC15] border border-black font-mono text-[9px] font-black flex items-center justify-center shadow-[1px_1px_0px_#000]">
                          {idx + 1}
                        </span>
                        <span className="uppercase text-sm">{m.name}</span>
                      </span>
                      <span className="text-[9px] bg-black text-white px-2 py-0.5 border border-black font-mono font-black uppercase rounded">
                        {m.cg}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Live Score Display & Admin Controls */}
            <div>
              <div className={`bg-[#1D4A35] text-[#FACC15] p-3 sm:p-4 border-4 border-black shadow-[4px_4px_0px_#000] rounded-2xl flex items-center justify-between px-4 sm:px-6 ${scoreFlashTeamId === teamA.id ? "score-pop" : ""}`}>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FFFDF5] font-mono block">
                    TOTAL TEAM SCORE
                  </span>
                  <span className="text-[9px] font-mono text-emerald-300 font-bold uppercase">
                    Game 1 Battle Points
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="brutal-font text-4xl sm:text-5xl leading-none text-[#FACC15]">{scoreA}</span>
                  <span className="text-xs font-black text-[#FFFDF5] font-mono uppercase">PTS</span>
                </div>
              </div>

              {/* Admin Scoring Buttons */}
              <div className="mt-3">
                {showRangerControls || isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black font-mono text-black uppercase shrink-0">Point Award:</span>
                    <div className="flex-1 grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateTeamScore(teamA.id, 1)}
                        className="bg-[#4ADE80] text-black font-black text-xs py-2 border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-[#34d399] active:translate-y-0.5 cursor-pointer rounded-lg"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTeamScore(teamA.id, 2)}
                        className="bg-[#38BDF8] text-black font-black text-xs py-2 border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-[#0284c7] hover:text-white active:translate-y-0.5 cursor-pointer rounded-lg"
                      >
                        +2
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTeamScore(teamA.id, 3)}
                        className="bg-[#FACC15] text-black font-black text-xs py-2 border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-[#eab308] active:translate-y-0.5 cursor-pointer rounded-lg"
                      >
                        +3
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTeamScore(teamA.id, -1)}
                        className="bg-red-200 text-red-950 font-black text-xs py-2 border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-red-300 active:translate-y-0.5 cursor-pointer rounded-lg"
                      >
                        -1
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[9px] font-mono font-bold text-center text-zinc-600 bg-white/80 py-1.5 border-2 border-black rounded-lg uppercase shadow-[1.5px_1.5px_0px_#000]">
                    🔒 Score controls locked to Ranger Admin
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Team B (Blue Corner / Right) */}
          <div
            className="border-4 border-black rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-[8px_8px_0px_#000] relative overflow-hidden transition-all"
            style={{ backgroundColor: getTeamAccent(teamB.color, 1) }}
          >
            {/* Top Corner Banner */}
            <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <TeamMark name={teamB.name} />
                  <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white font-mono text-[8px] font-black px-1 border border-black rounded uppercase">
                    BLUE
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-sky-800 font-mono block">
                    BLUE CORNER · TEAM 2
                  </span>
                  <h3 className="brutal-font text-xl sm:text-2xl text-black uppercase leading-tight">
                    {getSafariTeamLabel(teamB.name)}
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-mono font-black bg-white text-black px-2.5 py-1 border-2 border-black shadow-[1.5px_1.5px_0px_#000] rounded-full">
                👥 {teamB.members.length} Players
              </span>
            </div>

            {/* On-Stage Player Roster List */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-black font-mono">
                  📋 On-Stage Player Roster:
                </span>
                <span className="text-[8px] font-mono font-bold text-zinc-600 uppercase">
                  Competing in Game 1
                </span>
              </div>
              <div className="bg-white/90 border-3 border-black rounded-2xl p-3 max-h-[180px] overflow-y-auto space-y-1.5 shadow-[3px_3px_0px_#000]">
                {teamB.members.length === 0 ? (
                  <p className="text-[11px] text-zinc-400 font-mono uppercase text-center py-3">No players in this team</p>
                ) : (
                  teamB.members.map((m, idx) => (
                    <div key={m.id} className="flex items-center justify-between text-xs font-black text-black border-b-2 border-zinc-200 pb-1.5 last:border-0 last:pb-0 hover:bg-zinc-50 p-1 rounded">
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#38BDF8] border border-black font-mono text-[9px] font-black flex items-center justify-center shadow-[1px_1px_0px_#000]">
                          {idx + 1}
                        </span>
                        <span className="uppercase text-sm">{m.name}</span>
                      </span>
                      <span className="text-[9px] bg-black text-white px-2 py-0.5 border border-black font-mono font-black uppercase rounded">
                        {m.cg}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Live Score Display & Admin Controls */}
            <div>
              <div className={`bg-[#1D4A35] text-[#FACC15] p-3 sm:p-4 border-4 border-black shadow-[4px_4px_0px_#000] rounded-2xl flex items-center justify-between px-4 sm:px-6 ${scoreFlashTeamId === teamB.id ? "score-pop" : ""}`}>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FFFDF5] font-mono block">
                    TOTAL TEAM SCORE
                  </span>
                  <span className="text-[9px] font-mono text-emerald-300 font-bold uppercase">
                    Game 1 Battle Points
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="brutal-font text-4xl sm:text-5xl leading-none text-[#FACC15]">{scoreB}</span>
                  <span className="text-xs font-black text-[#FFFDF5] font-mono uppercase">PTS</span>
                </div>
              </div>

              {/* Admin Scoring Buttons */}
              <div className="mt-3">
                {showRangerControls || isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black font-mono text-black uppercase shrink-0">Point Award:</span>
                    <div className="flex-1 grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateTeamScore(teamB.id, 1)}
                        className="bg-[#4ADE80] text-black font-black text-xs py-2 border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-[#34d399] active:translate-y-0.5 cursor-pointer rounded-lg"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTeamScore(teamB.id, 2)}
                        className="bg-[#38BDF8] text-black font-black text-xs py-2 border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-[#0284c7] hover:text-white active:translate-y-0.5 cursor-pointer rounded-lg"
                      >
                        +2
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTeamScore(teamB.id, 3)}
                        className="bg-[#FACC15] text-black font-black text-xs py-2 border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-[#eab308] active:translate-y-0.5 cursor-pointer rounded-lg"
                      >
                        +3
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTeamScore(teamB.id, -1)}
                        className="bg-red-200 text-red-950 font-black text-xs py-2 border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-red-300 active:translate-y-0.5 cursor-pointer rounded-lg"
                      >
                        -1
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[9px] font-mono font-bold text-center text-zinc-600 bg-white/80 py-1.5 border-2 border-black rounded-lg uppercase shadow-[1.5px_1.5px_0px_#000]">
                    🔒 Score controls locked to Ranger Admin
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
