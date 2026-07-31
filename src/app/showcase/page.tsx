"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { decodeShowcaseTeams } from "@/lib/showcase-share";
import { getSafariTeamLabel, getSafariTeamProfile } from "@/lib/safari-theme";

interface TeamMember {
  name: string;
  cg: string;
}

interface TeamData {
  name: string;
  members: TeamMember[];
  color: string;
  score?: number;
}

const SCORE_TARGET = 300;

const CG_COLORS = [
  'bg-[#5CC8E8]',
  'bg-[#F4B942]',
  'bg-[#F2A85B]',
  'bg-[#B7DF77]',
  'bg-[#E6D27A]',
  'bg-[#79C8B5]',
  'bg-[#D8A56F]',
  'bg-[#E8614D]',
];

const getGroupColor = (name: string) => {
  if (!name) return 'bg-[#FFFDF5]';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CG_COLORS.length;
  return CG_COLORS[index];
};

const getTeamEmoji = (name: string) => getSafariTeamProfile(name).emoji;

// Inner Showcase component
function ShowcaseContent() {
  const searchParams = useSearchParams();
  const rawData = searchParams.get("t");
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Projection Carousel Broadcast Mode
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [activeBroadcastIdx, setActiveBroadcastIdx] = useState(0);
  const [soundOn, setSoundOn] = useState(true);

  // Decode teams from URL parameter or load fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (rawData) {
        try {
          const parsed = decodeShowcaseTeams(rawData);
          setTeams(parsed);
          localStorage.setItem("player_last_teams", JSON.stringify(parsed));
        } catch (e) {
          console.error("Failed to decode team data", e);
        }
      } else {
        let savedTeamsStr = localStorage.getItem("player_last_teams");
        if (!savedTeamsStr) {
          savedTeamsStr = localStorage.getItem("cg_mixer_teams");
        }
        if (savedTeamsStr) {
          try {
            const parsed = JSON.parse(savedTeamsStr);
            if (Array.isArray(parsed)) {
              setTeams(parsed);
            }
          } catch (e) {
            console.error("Failed to parse cached team data", e);
          }
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [rawData]);

  // Audio Synthesizer
  const playChirp = useCallback((freq: number, duration: number, type: OscillatorType = "sine") => {
    if (!soundOn) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn(e);
    }
  }, [soundOn]);

  // Auto Rotation Loop for Broadcast Mode
  useEffect(() => {
    if (!broadcastMode || teams.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveBroadcastIdx((prev) => {
        const next = (prev + 1) % teams.length;
        // Play chiptune transition sound
        playChirp(440 + next * 40, 0.08, "triangle");
        return next;
      });
    }, 5000); // 5 seconds rotation

    return () => clearInterval(interval);
  }, [broadcastMode, teams.length, playChirp]);

  // Play a sound when search results match
  useEffect(() => {
    const clean = filterQuery.trim().toLowerCase();
    if (!clean || teams.length === 0) return;

    // Check if player exists
    const hasMatch = teams.some(t => 
      t.members.some(m => m.name.toLowerCase().includes(clean))
    );

    if (hasMatch) {
      // High rising chirp on successful search find
      playChirp(880, 0.12, "sine");
    }
  }, [filterQuery, teams, playChirp]);

  // GSAP animated reveal of team cards
  useGSAP(() => {
    if (teams.length > 0 && !broadcastMode) {
      gsap.fromTo(
        ".showcase-team-card",
        { scale: 0.8, y: 50, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "back.out(1.2)" }
      );
    }
  }, [teams, broadcastMode]);

  const cleanQuery = filterQuery.trim().toLowerCase();
  const rankedTeams = [...teams].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const topScore = rankedTeams[0]?.score ?? 0;
  const runnerUpScore = rankedTeams[1]?.score ?? 0;
  const leadMargin = Math.max(0, topScore - runnerUpScore);
  const leaderTeam = rankedTeams[0];
  const challengerTeams = rankedTeams.slice(1);
  const leaderTargetProgress = Math.min(100, (topScore / SCORE_TARGET) * 100);

  const getTeamRank = (teamName: string) => {
    return rankedTeams.findIndex((team) => team.name === teamName) + 1;
  };

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Control Board: Search Bar & Presentation mode toggle */}
      <div className="safari-card brutal-box p-5 text-[#243028] shadow-[8px_8px_0px_#243028] border-4 border-[#243028] flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl relative">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="🔍 Find an explorer on the trail... (e.g. John)"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full px-5 py-3 border-4 border-black font-black uppercase focus:bg-[#FFFDF5] outline-none text-black bg-white placeholder-zinc-400 text-sm shadow-[inner_0_2px_4px_rgba(0,0,0,0.05)]"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {cleanQuery && (
            <button
              onClick={() => setFilterQuery("")}
              className="flex-1 md:flex-none brutal-box bg-[#E8614D] text-white font-black px-4 py-3 border-2 border-[#243028] text-xs uppercase hover:bg-[#c84738] shadow-[2px_2px_0px_#243028] cursor-pointer"
            >
              Clear Highlight
            </button>
          )}
          
          <button
            onClick={() => {
              setBroadcastMode(!broadcastMode);
              playChirp(broadcastMode ? 300 : 600, 0.15, "triangle");
            }}
            className={`flex-1 md:flex-none brutal-box font-black px-5 py-3 border-2 border-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer ${
              broadcastMode ? "bg-[#B7DF77] text-[#243028] hover:bg-[#d1efa1]" : "bg-[#5CC8E8] text-[#243028] hover:bg-[#8eddf0]"
            }`}
          >
            {broadcastMode ? "🗺️ TRAIL GRID" : "📽️ SAFARI CAROUSEL"}
          </button>
          
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="brutal-box bg-white text-black border-2 border-black p-3 text-xs font-black shadow-[2px_2px_0px_#000] hover:bg-zinc-100 cursor-pointer"
            title="Toggle Sound"
          >
            SFX: {soundOn ? "🔊" : "🔇"}
          </button>
        </div>
      </div>

      {/* Roster Code Input Fallback */}
      {!rawData && teams.length === 0 && (
        <div className="safari-card brutal-box p-8 text-[#243028] border-4 border-[#243028] shadow-[8px_8px_0px_#243028] text-center max-w-md mx-auto rounded-3xl relative">
          <div className="fold-corner-orange"></div>
          <p className="brutal-font text-xl uppercase mb-3">⚠️ NO SAFARI CREW LOADED</p>
          <p className="text-xs font-bold uppercase leading-relaxed max-w-xs mx-auto text-zinc-800 font-mono">
            Form animal crews in the ranger shuffler first, then scan or open the Safari Crown board.
          </p>
        </div>
      )}

      {/* Audience-first live standings board */}
      {teams.length > 0 && (
        <section
          aria-labelledby="audience-standings-title"
          className="safari-scoreboard brutal-box overflow-hidden rounded-3xl border-8 border-[#243028] text-[#243028] shadow-[12px_12px_0px_#243028]"
        >
          <div className="safari-scoreboard-header flex flex-col gap-4 border-b-4 border-[#243028] px-5 py-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="mb-2 inline-block border-2 border-black bg-black px-2 py-1 font-mono text-[8px] font-black uppercase tracking-[0.25em] text-[#38BDF8] shadow-[2px_2px_0px_#FFFDF5]">
                Live from the savanna stage
              </span>
              <h2 id="audience-standings-title" className="brutal-font text-3xl uppercase tracking-wide sm:text-5xl">
                Safari crown
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="border-4 border-black bg-black px-4 py-3 font-mono text-[9px] font-black uppercase tracking-wider text-[#FACC15] shadow-[4px_4px_0px_#38BDF8]">
                First to {SCORE_TARGET} paws
              </span>
              <div className="border-4 border-black bg-[#FFFDF5] px-4 py-3 font-mono text-[9px] font-black uppercase tracking-wider shadow-[4px_4px_0px_#000]">
                {topScore > 0
                  ? leadMargin > 0
                    ? `👑 ${getSafariTeamLabel(rankedTeams[0]?.name ?? "")} leads by ${leadMargin}`
                    : `🐾 Trails tied • ${topScore} paws`
                  : "● Trails ready • waiting for safari 01"}
              </div>
            </div>
          </div>

          <div className="safari-board-surface grid grid-cols-1 gap-5 p-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.45fr)] md:p-6">
            {leaderTeam && (
              <article className={`safari-leader-card overflow-hidden border-4 border-[#243028] ${topScore > 0 ? "score-leader-card" : ""}`}>
                <div className={`relative border-b-4 border-black p-5 ${leaderTeam.color || "bg-yellow-400 text-black"}`}>
                  <span className="absolute right-4 top-4 border-2 border-black bg-[#FFFDF5] px-3 py-1 font-mono text-[8px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
                    {topScore >= SCORE_TARGET ? "Safari crown" : topScore > 0 ? "Pride leader" : "Trailhead"}
                  </span>
                  <span className="mb-6 flex h-16 w-16 items-center justify-center border-4 border-black bg-[#FFFDF5] brutal-font text-4xl shadow-[4px_4px_0px_#000]">1</span>
                  <p className="font-mono text-[8px] font-black uppercase tracking-[0.25em]">Pride rock score</p>
                  <h3 className="mt-1 pr-24 brutal-font text-3xl uppercase tracking-wide sm:text-4xl">
                    {getTeamEmoji(leaderTeam.name)} {getSafariTeamLabel(leaderTeam.name)}
                  </h3>
                </div>
                <div className="p-5 text-[#FFFDF5] md:p-7">
                  <div className="safari-score-reel score-reel flex items-end justify-between border-4 px-5 py-5 shadow-[inset_0_0_0_3px_#143525]">
                    <span className="brutal-font text-7xl leading-[0.82] tracking-wider text-[#FACC15] sm:text-8xl xl:text-9xl">
                      {String(topScore).padStart(3, "0")}
                    </span>
                    <span className="mb-2 font-mono text-[10px] font-black uppercase tracking-widest text-[#B7DF77]">PAW PTS</span>
                  </div>
                  <div className="safari-trail-progress mt-5 h-7 overflow-hidden border-4 border-[#243028]">
                    <div className={`h-full border-r-4 border-black ${leaderTeam.color || "bg-yellow-400"}`} style={{ width: `${leaderTargetProgress}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between font-mono text-[9px] font-black uppercase tracking-wider">
                    <span>{Math.round(leaderTargetProgress)}% to crown</span>
                    <span>{leadMargin > 0 ? `+${leadMargin} trail lead` : "Tied at the rock"}</span>
                  </div>
                </div>
              </article>
            )}

            <div className="space-y-4">
              {challengerTeams.map((team, rankIndex) => {
                const score = team.score ?? 0;
                const targetProgress = Math.min(100, (score / SCORE_TARGET) * 100);
                const gapToLeader = Math.max(0, topScore - score);

                return (
                  <article key={team.name} className="overflow-hidden border-4 border-black bg-white shadow-[6px_6px_0px_#000]">
                    <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)_180px]">
                      <div className={`flex items-center gap-3 border-b-4 border-black p-4 md:border-b-0 md:border-r-4 ${team.color || "bg-yellow-400 text-black"}`}>
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-black bg-[#FFFDF5] brutal-font text-2xl shadow-[3px_3px_0px_#000]">{rankIndex + 2}</span>
                        <div className="min-w-0">
                          <p className="font-mono text-[7px] font-black uppercase tracking-[0.2em]">On the trail</p>
                          <h3 className="truncate brutal-font text-base uppercase tracking-wide">{getTeamEmoji(team.name)} {getSafariTeamLabel(team.name)}</h3>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center bg-[#18181B] p-4 text-[#FFFDF5]">
                        <div className="mb-2 flex justify-between font-mono text-[8px] font-black uppercase tracking-wider text-zinc-400">
                          <span>{gapToLeader === 0 ? "Level with pride leader" : `${gapToLeader} paws behind`}</span>
                          <span>{Math.round(targetProgress)}%</span>
                        </div>
                        <div className="h-5 overflow-hidden border-2 border-zinc-600 bg-black">
                          <div className={`h-full border-r-2 border-black ${team.color || "bg-yellow-400"}`} style={{ width: `${targetProgress}%` }} />
                        </div>
                      </div>
                      <div className="safari-score-reel score-reel flex items-end justify-between border-t-4 border-[#243028] px-4 py-4 text-[#FFF3C4] md:border-l-4 md:border-t-0">
                        <span className="brutal-font text-5xl leading-none tracking-wider text-[#FACC15]">{String(score).padStart(3, "0")}</span>
                        <span className="mb-1 font-mono text-[8px] font-black uppercase text-[#B7DF77]">PAW</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="border-t-4 border-black bg-[#38BDF8] px-5 py-3 text-center font-mono text-[8px] font-black uppercase tracking-[0.16em]">
            Crown hunt +100 <span aria-hidden="true">◆</span> Trailblazer +60 <span aria-hidden="true">◆</span> Wild spirit +25 <span aria-hidden="true">◆</span> Mud pit −10
          </div>
        </section>
      )}

      {/* RENDER MODE A: Auditorium Broadcast Carousel (Giant Center Cards) */}
      {broadcastMode && teams.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="safari-card brutal-box overflow-hidden border-8 border-[#243028] rounded-3xl flex flex-col text-[#243028] min-h-[520px] transition-all duration-300 relative">
            <div className="safari-parade-edge h-4 border-b-4 border-[#243028]" />

            {/* Team header banner */}
            <div className={`p-6 border-b-4 border-black text-center font-black uppercase ${teams[activeBroadcastIdx].color || "bg-yellow-400"}`}>
              <h2 className="brutal-font text-3xl sm:text-5xl tracking-wide flex items-center justify-center gap-3">
                <span>{getTeamEmoji(teams[activeBroadcastIdx].name)}</span>
                {getSafariTeamLabel(teams[activeBroadcastIdx].name)}
              </h2>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <span className="bg-black text-[#FFFDF5] text-xs font-mono font-black px-3.5 py-1 border-2 border-black uppercase inline-block shadow-[2px_2px_0px_#000]">
                  {teams[activeBroadcastIdx].members.length} EXPLORERS
                </span>
                <span className="bg-[#FFFDF5] text-black text-xs font-mono font-black px-3.5 py-1 border-2 border-black uppercase inline-block shadow-[2px_2px_0px_#000]">
                  RANK #{getTeamRank(teams[activeBroadcastIdx].name)} • {String(teams[activeBroadcastIdx].score ?? 0).padStart(3, "0")} PAWS
                </span>
              </div>
            </div>

            {/* Large layout member list */}
            <div className="p-8 bg-[#FFFDF5] flex-1">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teams[activeBroadcastIdx].members.map((m, mIdx) => {
                  const isHighlighted = cleanQuery !== "" && m.name.toLowerCase().includes(cleanQuery);
                  return (
                    <li
                      key={mIdx}
                      className={`py-3.5 px-4 flex justify-between items-center rounded-xl border-4 border-black transition-all duration-300 ${
                        isHighlighted
                          ? "bg-[#FACC15] text-black scale-105 font-black shadow-[4px_4px_0px_#000] animate-pulse"
                          : "bg-white text-zinc-950 shadow-[2px_2px_0px_#000] font-black text-base"
                      }`}
                    >
                      <span className="truncate">{m.name}</span>
                      <span className={`text-[10px] px-2.5 py-1 border-2 border-black uppercase font-black shrink-0 ${
                        isHighlighted
                          ? "bg-black text-white"
                          : getGroupColor(m.cg)
                      }`}>
                        {m.cg}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {teams[activeBroadcastIdx].members.length === 0 && (
                <div className="text-center py-16 text-zinc-400 font-bold uppercase">
                  No players allocated to this slot
                </div>
              )}
            </div>
            
            {/* Carousel navigation controls deck */}
            <div className="border-t-4 border-black p-4 bg-zinc-100 flex justify-between items-center">
              <button
                onClick={() => {
                  setActiveBroadcastIdx((prev) => (prev - 1 + teams.length) % teams.length);
                  playChirp(350, 0.08, "triangle");
                }}
                className="brutal-box bg-white text-black font-black text-xs px-4 py-2 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer uppercase"
              >
                ◀ PREV TEAM
              </button>
              
              <span className="font-mono text-xs font-black uppercase text-zinc-500">
                TEAM {activeBroadcastIdx + 1} / {teams.length}
              </span>

              <button
                onClick={() => {
                  setActiveBroadcastIdx((prev) => (prev + 1) % teams.length);
                  playChirp(450, 0.08, "triangle");
                }}
                className="brutal-box bg-white text-black font-black text-xs px-4 py-2 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer uppercase"
              >
                NEXT TEAM ▶
              </button>
            </div>
          </div>
          
          <div className="text-center font-mono text-[10px] text-zinc-500 uppercase tracking-widest animate-pulse">
              •• SAFARI PARADE ACTIVE •• CHANGES CREWS EVERY 5 SECONDS ••
          </div>
        </div>
      )}

      {/* RENDER MODE B: Standard Grid View */}
      {!broadcastMode && teams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rankedTeams.map((team, idx) => (
            <div
              key={idx}
              className="showcase-team-card brutal-box overflow-hidden shadow-[8px_8px_0px_#000] rounded-2xl border-4 border-black flex flex-col bg-white hover:-translate-y-1 hover:shadow-[12px_12px_0px_#000] transition-all duration-200"
            >
              {/* Header card with team color */}
              <div className={`p-4 border-b-4 border-black text-center font-black uppercase text-lg ${team.color || "bg-yellow-400 text-black"}`}>
                <h3 className="brutal-font tracking-wide truncate flex items-center justify-center gap-1.5">
                  <span>{getTeamEmoji(team.name)}</span>
                  {team.name}
                </h3>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="bg-black text-[#FFFDF5] text-[10px] px-2 py-0.5 border border-black uppercase font-bold inline-block shadow-[1px_1px_0px_#000]">
                    #{idx + 1} rank
                  </span>
                  <span className="bg-[#FFFDF5] text-black text-[10px] px-2 py-0.5 border border-black uppercase font-bold inline-block shadow-[1px_1px_0px_#000]">
                    {String(team.score ?? 0).padStart(3, "0")} pts
                  </span>
                </div>
              </div>

              {/* Members lists */}
              <ul className="p-3 bg-[#FFFDF5] divide-y-2 divide-zinc-150 flex-1">
                {team.members.map((m, mIdx) => {
                  const isHighlighted = cleanQuery !== "" && m.name.toLowerCase().includes(cleanQuery);
                  return (
                    <li
                      key={mIdx}
                      className={`py-2 px-2 flex justify-between items-center transition-all duration-300 rounded ${
                        isHighlighted
                          ? "bg-[#FACC15] text-black border-2 border-black scale-105 font-black shadow-[2px_2px_0px_#000]"
                          : "font-bold text-xs text-zinc-800"
                      }`}
                    >
                      <span className="truncate">{m.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 border uppercase font-black shrink-0 ${
                        isHighlighted
                          ? "bg-black text-white border-black"
                          : getGroupColor(m.cg)
                      }`}>
                        {m.cg}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Main page component with Suspense boundary
export default function ShowcasePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".gsap-reveal",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.2)" }
      );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="safari-world min-h-screen text-[#243028] selection:bg-[#F4B942] selection:text-[#243028] pb-24">
      {/* Header banner */}
      <header className="safari-canopy-header gsap-reveal border-b-4 border-[#243028] py-8 px-6 text-center shadow-[0_6px_0px_#243028] relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            href="/"
            className="brutal-box bg-[#FFF3C4] text-[#243028] font-black uppercase text-sm px-4 py-2 border-2 border-[#243028] hover:bg-[#F4B942] transition-all shadow-[2px_2px_0px_#243028] self-start sm:self-auto active:translate-y-0.5"
          >
            ← ESC HOME
          </Link>
          <h1 className="safari-title-text brutal-font text-3xl sm:text-4xl text-[#FFF3C4] uppercase tracking-wider select-none">
            🦁 SAFARI CROWN BOARD
          </h1>
          <div className="w-16 hidden sm:block"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 gsap-reveal">
        <Suspense fallback={
          <div className="brutal-box p-8 bg-white text-black text-center font-bold border-4 border-black rounded-2xl">
            <p className="animate-pulse text-lg uppercase font-black">Decrypting showcase records...</p>
          </div>
        }>
          <ShowcaseContent />
        </Suspense>
      </main>
    </div>
  );
}
