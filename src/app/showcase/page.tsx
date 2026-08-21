"use client";

import type { CSSProperties } from "react";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { decodeShowcaseTeams } from "@/lib/showcase-share";
import { getSafariTeamLabel, getSafariTeamProfile } from "@/lib/safari-theme";
import { CartoonAnimalIcon } from "@/components/CartoonAnimalIcon";

interface TeamMember {
  name: string;
  cg?: string;
}

interface TeamData {
  name: string;
  members: TeamMember[];
  color: string;
  score?: number;
}

const TEAM_ACCENTS = ["#F4B942", "#5CC8E8", "#F2A85B", "#E8614D", "#B7DF77", "#79C8B5"];

const getTeamAccent = (color: string, index: number) => {
  const match = color?.match(/#[0-9a-fA-F]{6}/)?.[0];
  return match ?? TEAM_ACCENTS[index % TEAM_ACCENTS.length];
};

function TeamMark({ name, compact = false }: { name: string; compact?: boolean }) {
  const profile = getSafariTeamProfile(name);

  return (
    <span className={`safari-animal-mark${compact ? " is-compact" : ""}`} aria-hidden="true" title={profile.animal}>
      <CartoonAnimalIcon animal={profile.animal} />
    </span>
  );
}

function RosterViewerContent() {
  const searchParams = useSearchParams();
  const rawData = searchParams.get("t");
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (rawData) {
        try {
          const parsed = decodeShowcaseTeams(rawData);
          setTeams(parsed);
          localStorage.setItem("player_last_teams", JSON.stringify(parsed));
        } catch (error) {
          console.error("Failed to decode team data", error);
        }
        return;
      }

      const savedTeams = localStorage.getItem("player_last_teams") ?? localStorage.getItem("cg_mixer_teams");
      if (!savedTeams) return;

      try {
        const parsed = JSON.parse(savedTeams);
        if (Array.isArray(parsed)) setTeams(parsed);
      } catch (error) {
        console.error("Failed to parse cached team data", error);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [rawData]);

  useGSAP(() => {
    if (teams.length > 0) {
      gsap.fromTo(
        ".showcase-team-card",
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power2.out" },
      );
    }
  }, [teams]);

  const cleanQuery = filterQuery.trim().toLowerCase();
  const totalExplorers = teams.reduce((acc, t) => acc + t.members.length, 0);
  const matchCount = cleanQuery
    ? teams.reduce((count, team) => count + team.members.filter((member) => member.name.toLowerCase().includes(cleanQuery)).length, 0)
    : 0;

  return (
    <div ref={containerRef} className="safari-crown-content max-w-5xl mx-auto px-2 md:px-4">
      {/* Revamped Neo-Brutalist Search Bar */}
      <section className="bg-[#FFFDF5] border-4 border-black rounded-2xl p-4 md:p-5 shadow-[8px_8px_0px_#000] mb-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-xl">🔍</span>
            </div>
            <input
              type="search"
              placeholder="Type your name to find your crew..."
              value={filterQuery}
              onChange={(event) => setFilterQuery(event.target.value)}
              className="w-full pl-12 pr-4 py-3 border-3 border-black rounded-xl font-bold text-base md:text-lg bg-white shadow-[3px_3px_0px_#000] focus:outline-none focus:ring-4 focus:ring-[#FACC15] placeholder:text-zinc-400 transition-all"
            />
          </div>

          {cleanQuery && (
            <div className="flex items-center gap-2 justify-end">
              <span
                className={`text-xs font-black uppercase font-mono px-3.5 py-2.5 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] ${
                  matchCount > 0
                    ? "bg-[#B7DF77] text-black"
                    : "bg-[#FF8B8B] text-black"
                }`}
              >
                {matchCount > 0 ? `✨ ${matchCount} ${matchCount === 1 ? 'Explorer' : 'Explorers'} Found` : "No match found"}
              </span>
              <button
                type="button"
                className="text-xs font-black uppercase font-mono bg-white text-black hover:bg-zinc-100 px-4 py-2.5 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                onClick={() => setFilterQuery("")}
              >
                ✕ Clear
              </button>
            </div>
          )}
        </div>
      </section>

      {teams.length === 0 && (
        <section className="safari-empty-lookout p-8 border-4 border-black rounded-2xl bg-[#FFFDF5] text-center shadow-[8px_8px_0px_#000]">
          <div className="safari-empty-copy">
            <p className="safari-eyebrow">The clearing is quiet</p>
            <h2 id="empty-lookout-title" className="brutal-font text-2xl md:text-3xl uppercase my-2">No animal crews have arrived yet.</h2>
            <p className="text-xs md:text-sm font-bold text-zinc-600 uppercase max-w-md mx-auto mb-6">Form the crews in Herd Maker, then scan the QR code to view team assignments.</p>
            <Link href="/mixer" className="inline-block bg-[#FACC15] text-black px-6 py-3 border-3 border-black rounded-xl font-black uppercase shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              Form animal crews
            </Link>
          </div>
        </section>
      )}

      {teams.length > 0 && (
        <section aria-labelledby="herd-rollcall-title">
          <div className="bg-[#FFFDF5] border-4 border-black rounded-2xl p-5 shadow-[8px_8px_0px_#000] mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#FACC15] border-3 border-black flex items-center justify-center text-2xl shadow-[3px_3px_0px_#000] shrink-0">
                🐾
              </div>
              <div>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-amber-900 font-mono block mb-0.5">
                  Official Gathering Rollcall
                </span>
                <h2 id="herd-rollcall-title" className="brutal-font text-2xl md:text-3xl text-black uppercase leading-none">
                  Animal Crew Rosters
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-black font-mono bg-[#B7DF77] text-black px-4 py-2 border-3 border-black shadow-[3px_3px_0px_#000] uppercase rounded-xl">
                👥 {totalExplorers} Explorers · {teams.length} Herds
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
            {teams.map((team, index) => (
              <article
                key={team.name}
                className="showcase-team-card border-4 border-black rounded-2xl bg-white shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col justify-between hover:translate-y-[-2px] transition-transform"
                style={{ backgroundColor: getTeamAccent(team.color, index) }}
              >
                <div>
                  <header className="flex items-center gap-3 p-4 border-b-3 border-black bg-white/75 backdrop-blur-xs">
                    <TeamMark name={team.name} compact />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider font-mono text-zinc-700 block">
                        👥 {team.members.length} {team.members.length === 1 ? 'Explorer' : 'Explorers'}
                      </span>
                      <h3 className="brutal-font text-xl md:text-2xl text-black uppercase leading-tight truncate">
                        {getSafariTeamLabel(team.name)}
                      </h3>
                    </div>
                  </header>

                  <ul className="p-4 space-y-2.5 max-h-80 overflow-y-auto">
                    {team.members.map((member, memberIndex) => {
                      const highlighted = cleanQuery !== "" && member.name.toLowerCase().includes(cleanQuery);
                      return (
                        <li
                          key={`${member.name}-${memberIndex}`}
                          className={`flex items-center justify-between p-3 border-2 border-black rounded-xl font-bold transition-all ${
                            highlighted
                              ? "bg-[#FACC15] text-black scale-[1.03] ring-4 ring-[#FFFDF5] shadow-[4px_4px_0px_#000]"
                              : "bg-white/90 text-black shadow-[2px_2px_0px_#000]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-black bg-black text-white px-2 py-0.5 rounded-md">
                              #{String(memberIndex + 1).padStart(2, "0")}
                            </span>
                            <span className="brutal-font uppercase text-base md:text-lg tracking-wide">{member.name}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {team.members.length === 0 && (
                  <p className="p-4 text-center text-xs font-bold uppercase font-mono text-zinc-600">
                    This crew is waiting for explorers.
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function ShowcasePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".gsap-reveal",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.62, stagger: 0.09, ease: "power2.out" },
      );
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="safari-crown-page min-h-screen selection:bg-[#F4B942] selection:text-[#243028] py-6">
      <main className="safari-crown-shell gsap-reveal">
        <Suspense fallback={
          <div className="safari-crown-loading">
            <span aria-hidden="true" />
            <p>Loading team rosters...</p>
          </div>
        }>
          <RosterViewerContent />
        </Suspense>
      </main>

      <footer className="safari-crown-footer max-w-5xl mx-auto px-4 mt-8">
        <span>Animal Kingdom · Explorer Roster</span>
        <span>Find your crew. Support your teammates.</span>
      </footer>
    </div>
  );
}
