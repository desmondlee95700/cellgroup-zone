"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface TeamMember {
  name: string;
  cg: string;
}

interface TeamData {
  name: string;
  members: TeamMember[];
  color: string;
}

// Inner Showcase component
function ShowcaseContent() {
  const searchParams = useSearchParams();
  const rawData = searchParams.get("t");
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Decode teams from URL parameter or load fallback from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (rawData) {
        try {
          const decodedString = decodeURIComponent(escape(atob(rawData)));
          const parsed = JSON.parse(decodedString);
          if (Array.isArray(parsed)) {
            setTeams(parsed);
            localStorage.setItem("player_last_teams", decodedString);
          }
        } catch (e) {
          console.error("Failed to decode team data", e);
        }
      } else {
        // Fallback: check player's local storage or admin local storage
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

  // GSAP animated reveal of team cards
  useGSAP(() => {
    if (teams.length > 0) {
      gsap.fromTo(
        ".showcase-team-card",
        { scale: 0.8, y: 50, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "back.out(1.2)" }
      );
    }
  }, [teams]);

  const cleanQuery = filterQuery.trim().toLowerCase();

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Search/Highlight bar */}
      <div className="brutal-box p-4 bg-white shadow-[6px_6px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full">
          <input
            type="text"
            placeholder="🔍 Highlight player name... (e.g. XXXX)"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full px-4 py-2.5 border-4 border-black font-bold focus:bg-[#FFFDF5] outline-none text-black bg-white placeholder-zinc-400 text-sm"
          />
        </div>
        {cleanQuery && (
          <button
            onClick={() => setFilterQuery("")}
            className="w-full md:w-auto brutal-box bg-black text-white font-black px-4 py-2 border-2 border-black text-xs uppercase hover:bg-zinc-800"
          >
            Clear Highlight
          </button>
        )}
      </div>

      {/* Roster Code Input Fallback if no search t param in URL and no cached teams */}
      {!rawData && teams.length === 0 && (
        <div className="brutal-box p-8 bg-[#FACC15] text-black shadow-[8px_8px_0px_#000] text-center max-w-md mx-auto">
          <p className="font-black text-lg uppercase mb-2">⚠️ NO TEAM ROSTER LOADED</p>
          <p className="text-xs font-bold uppercase leading-relaxed max-w-xs mx-auto text-zinc-800">
            Please scan the shuffler QR code displayed on the screen to view the team distributions!
          </p>
        </div>
      )}

      {/* Grid columns of teams */}
      {teams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams.map((team, idx) => (
            <div
              key={idx}
              className="showcase-team-card brutal-box overflow-hidden shadow-[8px_8px_0px_#000] flex flex-col bg-white"
            >
              {/* Header card with team color */}
              <div className={`p-4 border-b-4 border-black text-center font-black uppercase text-lg ${team.color || "bg-yellow-400 text-black"}`}>
                <h3 className="brutal-font tracking-wide truncate">{team.name}</h3>
                <span className="bg-black text-[#FFFDF5] text-[10px] px-2 py-0.5 border border-black uppercase font-bold mt-1 inline-block">
                  {team.members.length} players
                </span>
              </div>

              {/* Members lists */}
              <ul className="p-3 divide-y-2 divide-gray-100 flex-1">
                {team.members.map((m, mIdx) => {
                  const isHighlighted = cleanQuery !== "" && m.name.toLowerCase().includes(cleanQuery);
                  return (
                    <li
                      key={mIdx}
                      className={`py-2 px-2 flex justify-between items-center transition-all duration-300 ${
                        isHighlighted
                          ? "bg-[#FACC15] text-black border-2 border-black scale-105 font-black shadow-[2px_2px_0px_#000]"
                          : "font-bold text-sm text-zinc-800"
                      }`}
                    >
                      <span className="truncate">{m.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 border uppercase font-black shrink-0 ${
                        isHighlighted
                          ? "bg-black text-white border-black"
                          : "bg-gray-100 text-zinc-500 border-gray-300"
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
    <div ref={containerRef} className="min-h-screen bg-[#FFFDF5] selection:bg-black selection:text-[#FACC15] pb-24">
      {/* Header banner */}
      <header className="gsap-reveal bg-[#18181B] border-b-4 border-black py-8 px-6 text-center shadow-[0_6px_0px_#000] relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            href="/"
            className="brutal-box bg-[#FFFDF5] text-black font-black uppercase text-sm px-4 py-2 border-2 border-black hover:bg-[#FACC15] transition-all shadow-[2px_2px_0px_#000] self-start sm:self-auto"
          >
            ← Home
          </Link>
          <h1 className="brutal-font text-3xl sm:text-4xl text-[#FACC15] uppercase tracking-wider">
            📺 TEAM DISTRIBUTION
          </h1>
          <div className="w-16 hidden sm:block"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 gsap-reveal">
        <Suspense fallback={
          <div className="brutal-box p-8 bg-white text-center font-bold">
            <p className="animate-pulse text-lg uppercase font-black">Loading showcase data...</p>
          </div>
        }>
          <ShowcaseContent />
        </Suspense>
      </main>
    </div>
  );
}
