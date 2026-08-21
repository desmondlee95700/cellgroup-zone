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

function TeamMark({ name, compact = false }: { name: string; compact?: boolean }) {
  const profile = getSafariTeamProfile(name);

  return (
    <span className={`safari-animal-mark${compact ? " is-compact" : ""}`} aria-hidden="true" title={profile.animal}>
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

  // Only teams with >0 points qualify for top Hero Podium (up to 3)
  const podiumScoringTeams = rankedTeams.filter((t) => (t.score ?? 0) > 0).slice(0, 3);
  const chasingTerraceTeams = rankedTeams.filter((t) => !podiumScoringTeams.some((pt) => pt.name === t.name));
  const leaderTeam = podiumScoringTeams[0] ?? rankedTeams[0];

  const getEarnedRank = (score: number) => {
    if (score <= 0) return null;
    return rankedTeams.filter((t) => (t.score ?? 0) > score).length + 1;
  };

  const isTeamTied = (score: number) => {
    if (score <= 0) return false;
    return rankedTeams.filter((t) => (t.score ?? 0) === score).length > 1;
  };

  return (
    <div ref={containerRef} className="safari-crown-content">
      <section className="safari-lookout-rail" aria-label="Viewer tools">
        <div className="flex items-center gap-3">
          <Link
            href={`/showcase${rawData ? `?t=${rawData}` : ""}`}
            className="text-xs font-black uppercase font-mono bg-[#FFFDF5] text-black px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-[#FACC15] transition-colors rounded-lg"
          >
            👥 Open Mobile Team Finder
          </Link>
        </div>

        <div className="safari-lookout-actions">
          <GlobalFullscreenToggle />
        </div>
      </section>

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
            <i className="safari-stage-sun" />
            <i className="safari-stage-cloud cloud-one" />
            <i className="safari-stage-cloud cloud-two" />
            <i className="safari-stage-bird bird-one" />
            <i className="safari-stage-bird bird-two" />
          </div>

          <div className="safari-stage-heading">
            <div>
              <p className="safari-eyebrow">Live Projector View</p>
              <h2 id="pride-stage-title">The Safari Crown</h2>
              <p>
                {topScore > 0
                  ? isTeamTied(topScore)
                    ? `The top herds are tied for 1st place at ${topScore} points!`
                    : `${getSafariTeamLabel(leaderTeam.name)} leads the migration by ${leadMargin} points.`
                  : "The herds are assembled on the trail. Award points to see teams claim 1st, 2nd & 3rd place on Pride Rock!"}
              </p>
            </div>
            <div className="safari-crown-goal">
              <span>Points recorded</span>
              <strong>{totalLivePoints}</strong>
              <small>open-ended count</small>
            </div>
          </div>

          <div className="safari-pride-landscape">
            {podiumScoringTeams.length > 0 ? (
              <>
                <article
                  className="safari-summit-team"
                  style={{ "--team-accent": getTeamAccent(leaderTeam.color, 0) } as CSSProperties}
                >
                  <div className="safari-leader-crown" aria-hidden="true"><i /><i /><i /></div>
                  <TeamMark name={leaderTeam.name} />
                  <div className="safari-summit-name">
                    <span>{isTeamTied(topScore) ? "Tied for 1st place 👑" : "Current trail leader 👑"}</span>
                    <h3>{getSafariTeamLabel(leaderTeam.name)}</h3>
                    <small>{leaderTeam.members.length} explorers</small>
                  </div>
                  <div className="safari-summit-score">
                    <strong>{topScore}</strong>
                    <span>points</span>
                  </div>
                  <div className="safari-summit-progress" aria-label={`${getSafariTeamLabel(leaderTeam.name)} is the current live leader`}>
                    <i style={{ width: "100%" }} />
                  </div>
                </article>

                <div className="safari-rock-terraces" aria-label="Chasing teams">
                  {podiumScoringTeams.slice(1).map((team, index) => {
                    const score = team.score ?? 0;
                    const earnedRank = getEarnedRank(score);
                    const tied = isTeamTied(score);
                    const gap = Math.max(0, topScore - score);
                    const progress = Math.max(6, (score / liveReferenceScore) * 100);
                    const rankLabel = earnedRank === 1 ? (tied ? "TIED 1ST 👑" : "1ST 👑") : earnedRank === 2 ? (tied ? "TIED 2ND 🥈" : "2ND 🥈") : (tied ? "TIED 3RD 🥉" : "3RD 🥉");

                    return (
                      <article
                        key={team.name}
                        className="safari-rock-terrace"
                        style={{ "--team-accent": getTeamAccent(team.color, index + 1) } as CSSProperties}
                      >
                        <span className="safari-terrace-rank">{rankLabel}</span>
                        <TeamMark name={team.name} compact />
                        <div className="safari-terrace-name">
                          <small>{gap === 0 ? "Tied for 1st place" : `${gap} points behind`}</small>
                          <h3>{getSafariTeamLabel(team.name)}</h3>
                        </div>
                        <div className="safari-terrace-trail"><i style={{ width: `${progress}%` }} /></div>
                        <strong className="safari-terrace-score">{score}<small> pts</small></strong>
                      </article>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="p-8 border-4 border-black rounded-2xl bg-[#FFF3C4] text-center shadow-[6px_6px_0px_#000] w-full my-4">
                <span className="text-4xl mb-2 block" aria-hidden="true">👑</span>
                <h3 className="brutal-font text-xl text-black uppercase mb-1">
                  Pride Rock Crown Awaiting
                </h3>
                <p className="text-sm font-bold text-zinc-700 uppercase max-w-md mx-auto">
                  Award points during games or 1v1 duels to see animal herds climb onto Pride Rock!
                </p>
              </div>
            )}
          </div>

          {/* Chasing Terraces for 0-point & Non-Podium Teams */}
          {chasingTerraceTeams.length > 0 && (
            <div className="mt-6 pt-4 border-t-4 border-black/20">
              <p className="text-xs font-black uppercase tracking-wider text-black font-mono mb-3">
                {podiumScoringTeams.length === 0
                  ? `Herds on the Trail (${chasingTerraceTeams.length} Teams)`
                  : `Chasing Terraces (${chasingTerraceTeams.length} Teams)`}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {chasingTerraceTeams.map((team, index) => {
                  const score = team.score ?? 0;
                  const earnedRank = getEarnedRank(score);
                  const tied = isTeamTied(score);
                  const gap = topScore > 0 ? Math.max(0, topScore - score) : 0;
                  const rankDisplay = earnedRank ? (tied ? `#${earnedRank}=` : `#${earnedRank}`) : "🐾";

                  return (
                    <div
                      key={team.name}
                      className="p-3 border-3 border-black rounded-xl bg-white shadow-[3px_3px_0px_#000] flex items-center justify-between gap-3"
                      style={{ backgroundColor: getTeamAccent(team.color, index + podiumScoringTeams.length) }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-8 h-8 rounded-full border-2 border-black bg-[#FFFDF5] flex items-center justify-center font-black font-mono text-xs shadow-[1px_1px_0px_#000] shrink-0 text-black">
                          {rankDisplay}
                        </span>
                        <TeamMark name={team.name} compact />
                        <div className="min-w-0 flex-1">
                          <span className="text-[8px] font-black uppercase text-zinc-700 block leading-tight font-mono">
                            {topScore === 0 ? "Awaiting points" : `${gap} pts behind`}
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

          <div className="safari-scoring-path" aria-label="Scoring guide">
            <span><b>+100</b> Round win</span>
            <span><b>+60</b> Runner-up</span>
            <span><b>+25</b> Team spirit</span>
            <span><b>−10</b> Penalty</span>
          </div>
        </section>
      )}
    </div>
  );
}

export default function ShowcaseStandingsPage() {
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
          <span className="safari-crown-brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <div>
            <strong>Pride Rock Projector Standings</strong>
            <small>Live hall standings screen</small>
          </div>
        </div>
        <span className="safari-crown-live"><i aria-hidden="true" /> Projector view</span>
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
