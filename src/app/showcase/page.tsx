"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { decodeShowcaseTeams } from "@/lib/showcase-share";

interface TeamMember {
  name: string;
  cg: string;
}

interface TeamData {
  name: string;
  members: TeamMember[];
  color: string;
}

const CG_COLORS = [
  'bg-[#38BDF8]', // Blue
  'bg-[#FACC15]', // Yellow
  'bg-[#F59E0B]', // Orange
  'bg-[#4ADE80]', // Green
  'bg-[#F472B6]', // Pink
  'bg-[#C084FC]', // Purple
  'bg-[#2DD4BF]', // Teal
  'bg-[#F87171]', // Red
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

const getTeamEmoji = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("yellow")) return "🟡";
  if (lower.includes("blue")) return "🔵";
  if (lower.includes("orange")) return "🟠";
  if (lower.includes("red")) return "🔴";
  if (lower.includes("purple")) return "🟣";
  if (lower.includes("green")) return "🟢";
  if (lower.includes("pink")) return "🌸";
  if (lower.includes("teal")) return "💎";
  return "🎮";
};

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

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Control Board: Search Bar & Presentation mode toggle */}
      <div className="brutal-box p-5 bg-white text-black shadow-[8px_8px_0px_#000] border-4 border-black flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl relative">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="🔍 Highlight name slot on projector... (e.g. John)"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full px-5 py-3 border-4 border-black font-black uppercase focus:bg-[#FFFDF5] outline-none text-black bg-white placeholder-zinc-400 text-sm shadow-[inner_0_2px_4px_rgba(0,0,0,0.05)]"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {cleanQuery && (
            <button
              onClick={() => setFilterQuery("")}
              className="flex-1 md:flex-none brutal-box bg-[#EF4444] text-white font-black px-4 py-3 border-2 border-black text-xs uppercase hover:bg-red-600 shadow-[2px_2px_0px_#000] cursor-pointer"
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
              broadcastMode ? "bg-[#4ADE80] text-black hover:bg-green-400" : "bg-[#C084FC] text-black hover:bg-purple-400"
            }`}
          >
            {broadcastMode ? "📺 GRID VIEW" : "📽️ AUDITORIUM CAROUSEL"}
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
        <div className="brutal-box p-8 bg-[#FACC15] text-black border-4 border-black shadow-[8px_8px_0px_#000] text-center max-w-md mx-auto rounded-3xl relative">
          <div className="fold-corner-orange"></div>
          <p className="brutal-font text-xl uppercase mb-3">⚠️ NO TEAM ROSTER LOADED</p>
          <p className="text-xs font-bold uppercase leading-relaxed max-w-xs mx-auto text-zinc-800 font-mono">
            Please shuffler players in the admin mixer console first, and scan or generate showcase presentation deck!
          </p>
        </div>
      )}

      {/* RENDER MODE A: Auditorium Broadcast Carousel (Giant Center Cards) */}
      {broadcastMode && teams.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Active Carousel Card Frame */}
          <div className="brutal-box overflow-hidden shadow-[12px_12px_0px_#000] border-8 border-black rounded-3xl flex flex-col bg-white text-black min-h-[520px] transition-all duration-300 relative">
            <div className="scanline-line"></div>
            
            {/* Carousel Active Bar */}
            <div className="w-full h-3 bg-zinc-200 border-b-4 border-black overflow-hidden relative">
              <div className="h-full bg-black animate-[scan-laser_5s_linear_infinite]"></div>
            </div>

            {/* Team header banner */}
            <div className={`p-6 border-b-4 border-black text-center font-black uppercase ${teams[activeBroadcastIdx].color || "bg-yellow-400"}`}>
              <h2 className="brutal-font text-3xl sm:text-5xl tracking-wide flex items-center justify-center gap-3">
                <span>{getTeamEmoji(teams[activeBroadcastIdx].name)}</span>
                {teams[activeBroadcastIdx].name}
              </h2>
              <span className="bg-black text-[#FFFDF5] text-xs font-mono font-black px-3.5 py-1 border-2 border-black uppercase mt-3 inline-block shadow-[2px_2px_0px_#000]">
                {teams[activeBroadcastIdx].members.length} MEMBERS ALLOCATED
              </span>
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
            •• AUDITORIUM ROTATOR ENGAGED •• ROTATES AUTOMATICALLY EVERY 5 SECONDS ••
          </div>
        </div>
      )}

      {/* RENDER MODE B: Standard Grid View */}
      {!broadcastMode && teams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams.map((team, idx) => (
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
                <span className="bg-black text-[#FFFDF5] text-[10px] px-2 py-0.5 border border-black uppercase font-bold mt-1 inline-block shadow-[1px_1px_0px_#000]">
                  {team.members.length} players
                </span>
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
    <div ref={containerRef} className="min-h-screen bg-[#18181B] bg-grid-pattern-dark text-white selection:bg-[#FACC15] selection:text-black pb-24">
      {/* Header banner */}
      <header className="gsap-reveal bg-[#18181B] border-b-4 border-black py-8 px-6 text-center shadow-[0_6px_0px_#000] relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            href="/"
            className="brutal-box bg-[#FFFDF5] text-black font-black uppercase text-sm px-4 py-2 border-2 border-black hover:bg-[#FACC15] transition-all shadow-[2px_2px_0px_#000] self-start sm:self-auto active:translate-y-0.5"
          >
            ← ESC HOME
          </Link>
          <h1 className="brutal-font text-3xl sm:text-4xl text-[#FACC15] uppercase tracking-wider select-none">
            📺 AUDITORIUM SHOWBOARD
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
