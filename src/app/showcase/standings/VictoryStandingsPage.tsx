"use client";

import type { CSSProperties } from "react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { decodeShowcaseTeams } from "@/lib/showcase-share";
import { getSafariTeamLabel, getSafariTeamProfile } from "@/lib/safari-theme";
import { CartoonAnimalIcon } from "@/components/CartoonAnimalIcon";
import { GlobalFullscreenToggle } from "@/components/GlobalFullscreenToggle";

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

const TEAM_ACCENTS = ["#F4B942", "#5CC8E8", "#F2A85B", "#E8614D", "#B7DF77", "#79C8B5"];

const getTeamAccent = (color: string, index: number) => {
  const match = color?.match(/#[0-9a-fA-F]{6}/)?.[0];
  return match ?? TEAM_ACCENTS[index % TEAM_ACCENTS.length];
};

function TeamMark({
  name,
  compact = false,
  jumping = false,
  champion = false,
}: {
  name: string;
  compact?: boolean;
  jumping?: boolean;
  champion?: boolean;
}) {
  const profile = getSafariTeamProfile(name);

  return (
    <span
      className={`safari-animal-mark${compact ? " is-compact" : ""}${
        champion ? " animate-champion-jump" : jumping ? " animate-animal-jump" : ""
      }`}
      aria-hidden="true"
      title={profile.animal}
    >
      <CartoonAnimalIcon animal={profile.animal} />
    </span>
  );
}

function StandingsContent() {
  const searchParams = useSearchParams();
  const rawData = searchParams.get("t");
  const [teams, setTeams] = useState<TeamData[]>([]);
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

  const rankedTeams = [...teams].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const topScore = rankedTeams[0]?.score ?? 0;
  const runnerUpScore = rankedTeams[1]?.score ?? 0;
  const leadMargin = Math.max(0, topScore - runnerUpScore);
  const liveReferenceScore = Math.max(topScore, 1);
  const totalLivePoints = rankedTeams.reduce((total, team) => total + (team.score ?? 0), 0);

  // Unique scores for teams with >0 points, sorted descending
  const uniqueScoredScores = Array.from(
    new Set(rankedTeams.filter((t) => (t.score ?? 0) > 0).map((t) => t.score ?? 0))
  ).sort((a, b) => b - a);

  // Group teams for Rank 1 (1st place score), Rank 2 (2nd place score), Rank 3 (3rd place score)
  const rank1Teams = uniqueScoredScores[0] !== undefined ? rankedTeams.filter((t) => (t.score ?? 0) === uniqueScoredScores[0]) : [];
  const rank2Teams = uniqueScoredScores[1] !== undefined ? rankedTeams.filter((t) => (t.score ?? 0) === uniqueScoredScores[1]) : [];
  const rank3Teams = uniqueScoredScores[2] !== undefined ? rankedTeams.filter((t) => (t.score ?? 0) === uniqueScoredScores[2]) : [];

  // All other teams (Rank 4+ or 0 pts)
  const podiumTeamNames = [...rank1Teams, ...rank2Teams, ...rank3Teams].map((t) => t.name);
  const chasingTeams = rankedTeams.filter((t) => !podiumTeamNames.includes(t.name));
  const leaderTeam = rank1Teams[0] ?? rankedTeams[0];

  return (
    <div ref={containerRef} className="safari-crown-content">


      {teams.length === 0 && (
        <section className="safari-empty-lookout" aria-labelledby="empty-lookout-title">
          <div className="safari-empty-sun" aria-hidden="true" />
          <div className="safari-empty-tree" aria-hidden="true"><i /><i /><i /></div>
          <div className="safari-empty-copy">
            <p className="safari-eyebrow">The clearing is quiet</p>
            <h2 id="empty-lookout-title">No animal crews have arrived yet.</h2>
            <p>Form the crews in Herd Maker, then return here to begin the live points ceremony.</p>
            <Link href="/mixer">Form animal crews</Link>
          </div>
        </section>
      )}

      {teams.length > 0 && (
        <section className="safari-pride-stage" aria-labelledby="pride-stage-title">
          
          <div className="safari-stage-sky" aria-hidden="true">
            <i className="safari-stage-cloud cloud-one" />
            <i className="safari-stage-cloud cloud-two" />
            <i className="safari-stage-cloud cloud-three" />
            <i className="safari-stage-sun-glow" />
            <i className="safari-stage-bird bird-one" />
            <i className="safari-stage-bird bird-two" />
          </div>

          <div className="safari-stage-heading">
            <div>
              <p className="safari-eyebrow">Live Projector View</p>
              <h2 id="pride-stage-title">Animal Crown</h2>
              <p>
                {topScore > 0
                  ? rank1Teams.length > 1
                    ? `The top herds are tied for 1st place at ${topScore} points!`
                    : `${getSafariTeamLabel(leaderTeam.name)} leads the migration by ${leadMargin} points.`
                  : "The herds are assembled on the trail. Award points during games to see teams claim 1st, 2nd & 3rd place on Pride Rock!"}
              </p>
            </div>
          </div>

          <div className="safari-pride-landscape">
            {/* ===== 3D OLYMPIC PODIUM: 2nd Place (Left), 1st Place (Center/Tallest), 3rd Place (Right) ===== */}
            <div className="safari-podium-wrapper w-full max-w-5xl mx-auto py-4 px-2">
              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 bg-[#FACC15] text-black border-2 border-black rounded-full font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#000] mb-2">
                  🏆 Victory Podium 🏆
                </span>
                <h3 className="brutal-font text-2xl md:text-4xl text-black uppercase tracking-tight">
                  {topScore > 0 ? "The Leaderboard Podium" : "Expedition Podium"}
                </h3>
              </div>

              {/* Podium Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 items-end">
                
                {/* 2ND PLACE / LEFT COLUMN */}
                <div className="flex flex-col items-center justify-end">
                  {rank2Teams.length > 0 ? (
                    <div className="w-full flex flex-col gap-2 mb-2 z-10">
                      <div className="mx-auto px-2.5 py-0.5 border-2 border-black rounded-full bg-[#E2E8F0] text-black font-black font-mono text-[9px] md:text-xs uppercase shadow-[1.5px_1.5px_0px_#000] whitespace-nowrap">
                        🥈 {rank2Teams.length > 1 ? `TIED 2ND PLACE (${rank2Teams.length})` : "2ND PLACE"}
                      </div>
                      {rank2Teams.map((team, idx) => (
                        <div
                          key={team.name}
                          className="w-full border-4 border-black rounded-2xl p-2.5 md:p-3 shadow-[5px_5px_0px_#000] relative transition-transform hover:-translate-y-1"
                          style={{ backgroundColor: getTeamAccent(team.color, idx + 1) }}
                        >
                          <div className="flex flex-col items-center text-center">
                            <TeamMark name={team.name} compact jumping />
                            <h4 className="brutal-font text-xs md:text-base text-black uppercase mt-1 truncate w-full">
                              {getSafariTeamLabel(team.name)}
                            </h4>
                            <span className="text-[9px] md:text-[10px] font-bold text-zinc-800 uppercase font-mono">
                              {team.members.length} Explorers
                            </span>
                            <div className="mt-1 bg-[#FFFDF5] text-black border-2 border-black px-2 py-0.5 rounded-xl font-black text-xs md:text-lg shadow-[2px_2px_0px_#000]">
                              {team.score ?? 0} <small className="text-[9px] font-mono">PTS</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full border-3 border-dashed border-black/40 rounded-2xl p-3 mb-2 text-center text-black/50 bg-white/40">
                      <span className="text-xl">🥈</span>
                      <p className="text-[10px] font-bold uppercase font-mono mt-1">Awaiting 2nd</p>
                    </div>
                  )}

                  {/* Left Step Block (Step 2 Runner-Up) */}
                  <div className="w-full h-32 sm:h-40 md:h-48 border-4 border-black rounded-t-2xl bg-gradient-to-b from-[#38BDF8] to-[#0284C7] shadow-[6px_6px_0px_#000] flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] opacity-15" />
                    <span className="text-xl sm:text-2xl mb-0.5">🥈</span>
                    <span className="brutal-font text-4xl sm:text-6xl md:text-7xl text-white drop-shadow-[3px_3px_0px_#000] z-10">
                      2
                    </span>
                    <span className="text-[9px] md:text-xs font-black font-mono uppercase px-2 py-0.5 rounded-md mt-1 z-10 bg-black/40 text-white">
                      {rank2Teams.length > 1 ? "Tied 2nd" : "Runner-Up"}
                    </span>
                  </div>
                </div>

                {/* 1ST PLACE / CENTER COLUMN (TALLEST - GOLD) */}
                <div className="flex flex-col items-center justify-end z-10">
                  {rank1Teams.length > 0 ? (
                    <div className="w-full flex flex-col gap-2 mb-3 z-10">
                      <div className="mx-auto px-3 py-1 border-3 border-black rounded-full bg-[#FACC15] text-black font-black font-mono text-[10px] md:text-xs uppercase shadow-[3px_3px_0px_#000] whitespace-nowrap flex items-center justify-center gap-1">
                        👑 {rank1Teams.length > 1 ? `TIED 1ST CHAMPIONS (${rank1Teams.length})` : "1ST PLACE CHAMPION"} 👑
                      </div>
                      {rank1Teams.map((team, idx) => (
                        <div
                          key={team.name}
                          className="w-full border-4 border-black rounded-3xl p-3 md:p-4 shadow-[6px_6px_0px_#000] relative transition-transform hover:-translate-y-1"
                          style={{ backgroundColor: getTeamAccent(team.color, idx) }}
                        >
                          <div className="flex flex-col items-center text-center">
                            <TeamMark name={team.name} compact={rank1Teams.length > 1} champion />
                            <h3 className="brutal-font text-xs md:text-lg text-black uppercase mt-1 truncate w-full">
                              {getSafariTeamLabel(team.name)}
                            </h3>
                            <span className="text-[9px] md:text-xs font-bold text-zinc-800 uppercase font-mono">
                              {team.members.length} Explorers
                            </span>

                            <div className="mt-1.5 bg-[#FACC15] text-black border-2 border-black px-3 py-1 rounded-xl font-black text-sm md:text-2xl shadow-[2px_2px_0px_#000]">
                              {team.score ?? 0} <small className="text-[9px] font-mono">PTS</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full border-3 border-dashed border-black/40 rounded-3xl p-5 mb-3 text-center text-black/50 bg-white/40">
                      <span className="text-3xl">👑</span>
                      <p className="text-xs font-bold uppercase font-mono mt-1">Awaiting Champion</p>
                    </div>
                  )}

                  {/* Center Step Block (Step 1 Tallest Champion) */}
                  <div className="w-full h-44 sm:h-56 md:h-64 border-4 border-black rounded-t-3xl bg-gradient-to-b from-[#FACC15] to-[#F59E0B] shadow-[8px_8px_0px_#000] flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:14px_14px] opacity-20" />
                    <span className="text-2xl md:text-3xl mb-1">🥇</span>
                    <span className="brutal-font text-6xl sm:text-7xl md:text-8xl text-black drop-shadow-[3px_3px_0px_#FFFDF5] z-10">
                      1
                    </span>
                    <span className="text-xs md:text-sm font-black font-mono uppercase px-3 py-0.5 rounded-md mt-1 border-2 border-black z-10 bg-white/90 text-black shadow-[1.5px_1.5px_0px_#000]">
                      {rank1Teams.length > 1 ? "Tied 1st" : "Champion"}
                    </span>
                  </div>
                </div>

                {/* 3RD PLACE / RIGHT COLUMN */}
                <div className="flex flex-col items-center justify-end">
                  {rank3Teams.length > 0 ? (
                    <div className="w-full flex flex-col gap-2 mb-2 z-10">
                      <div className="mx-auto px-2.5 py-0.5 border-2 border-black rounded-full bg-[#F59E0B] text-black font-black font-mono text-[9px] md:text-xs uppercase shadow-[1.5px_1.5px_0px_#000] whitespace-nowrap">
                        🥉 {rank3Teams.length > 1 ? `TIED 3RD PLACE (${rank3Teams.length})` : "3RD PLACE"}
                      </div>
                      {rank3Teams.map((team, idx) => (
                        <div
                          key={team.name}
                          className="w-full border-4 border-black rounded-2xl p-2.5 md:p-3 shadow-[5px_5px_0px_#000] relative transition-transform hover:-translate-y-1"
                          style={{ backgroundColor: getTeamAccent(team.color, idx + 2) }}
                        >
                          <div className="flex flex-col items-center text-center">
                            <TeamMark name={team.name} compact jumping />
                            <h4 className="brutal-font text-xs md:text-base text-black uppercase mt-1 truncate w-full">
                              {getSafariTeamLabel(team.name)}
                            </h4>
                            <span className="text-[9px] md:text-[10px] font-bold text-zinc-800 uppercase font-mono">
                              {team.members.length} Explorers
                            </span>
                            <div className="mt-1 bg-[#FFFDF5] text-black border-2 border-black px-2 py-0.5 rounded-xl font-black text-xs md:text-lg shadow-[2px_2px_0px_#000]">
                              {team.score ?? 0} <small className="text-[9px] font-mono">PTS</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full border-3 border-dashed border-black/40 rounded-2xl p-3 mb-2 text-center text-black/50 bg-white/40">
                      <span className="text-xl">🥉</span>
                      <p className="text-[10px] font-bold uppercase font-mono mt-1">Awaiting 3rd</p>
                    </div>
                  )}

                  {/* Right Step Block (Step 3 Bronze) */}
                  <div className="w-full h-24 sm:h-32 md:h-36 border-4 border-black rounded-t-2xl bg-gradient-to-b from-[#F59E0B] to-[#D97706] shadow-[6px_6px_0px_#000] flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] opacity-15" />
                    <span className="text-lg sm:text-xl mb-0.5">🥉</span>
                    <span className="brutal-font text-4xl sm:text-5xl md:text-6xl text-white drop-shadow-[3px_3px_0px_#000] z-10">
                      3
                    </span>
                    <span className="text-[9px] md:text-xs font-black font-mono uppercase px-2 py-0.5 rounded-md mt-1 z-10 bg-black/40 text-white">
                      {rank3Teams.length > 1 ? "Tied 3rd" : "Bronze"}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Chasing Herds Grid (Unscored 0-point & 4th+ place teams) */}
            {chasingTeams.length > 0 && (
              <div className="mt-8 pt-6 border-t-4 border-black/20 max-w-5xl mx-auto">
                <p className="text-xs font-black uppercase tracking-wider text-black font-mono mb-3 text-center md:text-left">
                  {uniqueScoredScores.length === 0
                    ? `Herds on the Trail (${chasingTeams.length} Teams)`
                    : `Chasing Herds (${chasingTeams.length} Teams)`}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {chasingTeams.map((team, index) => {
                    const score = team.score ?? 0;
                    const higherCount = rankedTeams.filter((t) => (t.score ?? 0) > score).length;
                    const earnedRank = score > 0 ? higherCount + 1 : null;
                    const sameCount = rankedTeams.filter((t) => (t.score ?? 0) === score).length;
                    const tied = score > 0 && sameCount > 1;
                    const gap = topScore > 0 ? Math.max(0, topScore - score) : 0;
                    const rankDisplay = score > 0 ? (earnedRank ? (tied ? `#${earnedRank}=` : `#${earnedRank}`) : "🐾") : "🐾";

                    return (
                      <div
                        key={team.name}
                        className="p-3 border-3 border-black rounded-xl bg-white shadow-[3px_3px_0px_#000] flex items-center justify-between gap-3"
                        style={{ backgroundColor: getTeamAccent(team.color, index + 3) }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-8 h-8 rounded-full border-2 border-black bg-[#FFFDF5] flex items-center justify-center font-black font-mono text-xs shadow-[1px_1px_0px_#000] shrink-0 text-black">
                            {rankDisplay}
                          </span>
                          <TeamMark name={team.name} compact jumping={score > 0} />
                          <div className="min-w-0 flex-1">
                            <span className="text-[8px] font-black uppercase text-zinc-700 block leading-tight font-mono">
                              {score === 0 ? "Awaiting points" : `${gap} pts behind`}
                            </span>
                            <strong className="brutal-font text-xs text-black uppercase block leading-tight mt-0.5 truncate">
                              {getSafariTeamLabel(team.name)}
                            </strong>
                            <em className="text-[8px] font-bold text-zinc-600 uppercase block font-mono not-italic mt-0.5">
                              {team.members.length} Explorers
                            </em>
                          </div>
                        </div>
                        <span className="brutal-font text-lg text-black bg-white/80 px-2.5 py-1 border-2 border-black rounded-lg shadow-[1px_1px_0px_#000] shrink-0">
                          {score} <small className="text-[8px] font-mono font-bold">PTS</small>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Bottom Savanna Grass Tufts Ground Border */}
            <div className="w-full flex justify-around items-end h-6 overflow-hidden pointer-events-none opacity-85 mt-6 pt-2 z-0" aria-hidden="true">
              {Array.from({ length: 16 }).map((_, i) => (
                <svg key={i} viewBox="0 0 30 20" className="w-6 h-4 sm:w-8 sm:h-5 fill-[#1B5231] stroke-[#18181B] stroke-[2.5]">
                  <path d="M 5 20 Q 2 8 0 2 Q 8 10 12 20 Q 15 6 18 0 Q 20 8 24 20 Q 27 5 30 1 Q 28 10 26 20 Z" />
                </svg>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function VictoryStandingsPage() {
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
    <div ref={containerRef} className="safari-crown-page min-h-screen selection:bg-[#F4B942] selection:text-[#243028]">
      <header className="safari-crown-nav gsap-reveal">
        <Link href="/home" className="safari-crown-back">Back to basecamp</Link>
        <div className="safari-crown-brand">
          <div>
            <strong>Pride Rock Projector Standings</strong>
            <small>Live hall standings screen</small>
          </div>
        </div>
        <div className="safari-crown-nav-actions">
          <GlobalFullscreenToggle />
          <span className="safari-crown-live"><i aria-hidden="true" /> Projector view</span>
        </div>
      </header>

      <main className="safari-crown-shell gsap-reveal">
        <Suspense fallback={
          <div className="safari-crown-loading">
            <span aria-hidden="true" />
            <p>Opening the ranger ledger...</p>
          </div>
        }>
          <StandingsContent />
        </Suspense>
      </main>

      <footer className="safari-crown-footer">
        <span>Animal Kingdom · Pride Rock Standings</span>
        <span>Cheer loudly. Score clearly. Celebrate every herd.</span>
      </footer>
    </div>
  );
}
