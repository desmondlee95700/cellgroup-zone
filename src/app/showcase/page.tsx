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

function RosterViewerContent() {
  const searchParams = useSearchParams();
  const rawData = searchParams.get("t");
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [soundOn, setSoundOn] = useState(true);
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

  const playChirp = useCallback((frequency: number, duration: number, type: OscillatorType = "sine") => {
    if (!soundOn) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      gain.gain.setValueAtTime(0.08, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration);
    } catch (error) {
      console.warn(error);
    }
  }, [soundOn]);

  useEffect(() => {
    const query = filterQuery.trim().toLowerCase();
    if (!query || teams.length === 0) return;
    if (teams.some((team) => team.members.some((member) => member.name.toLowerCase().includes(query)))) {
      playChirp(880, 0.12, "sine");
    }
  }, [filterQuery, teams, playChirp]);

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
    <div ref={containerRef} className="safari-crown-content max-w-4xl mx-auto px-4 py-6">
      {/* Top Controls & Navigation Bar */}
      <section className="bg-[#FFFDF5] border-4 border-black rounded-2xl p-4 shadow-[6px_6px_0px_#000] mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto">
          <label className="relative block w-full">
            <span className="text-[10px] font-black uppercase font-mono text-zinc-600 block mb-1">
              🔍 Type your name to find your crew:
            </span>
            <input
              type="search"
              placeholder="e.g. Desmond, Sarah..."
              value={filterQuery}
              onChange={(event) => setFilterQuery(event.target.value)}
              className="w-full md:w-80 px-4 py-2.5 border-3 border-black rounded-xl font-bold text-base bg-white shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-4 focus:ring-[#FACC15]"
            />
          </label>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {cleanQuery && (
            <button
              type="button"
              className="text-xs font-black uppercase font-mono bg-[#FF8B8B] text-black px-3 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]"
              onClick={() => setFilterQuery("")}
            >
              {matchCount > 0 ? `${matchCount} found · clear` : "No match · clear"}
            </button>
          )}
          <button
            type="button"
            className="text-xs font-black uppercase font-mono bg-white text-black px-3 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]"
            aria-pressed={soundOn}
            onClick={() => setSoundOn((current) => !current)}
          >
            Sound {soundOn ? "🔊" : "🔇"}
          </button>
          <Link
            href={`/showcase/standings${rawData ? `?t=${rawData}` : ""}`}
            className="text-xs font-black uppercase font-mono bg-[#FACC15] text-black px-4 py-2.5 border-3 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-center"
          >
            🏆 Hall Results
          </Link>
        </div>
      </section>

      {teams.length === 0 && (
        <section className="safari-empty-lookout p-8 border-4 border-black rounded-2xl bg-[#FFFDF5] text-center shadow-[6px_6px_0px_#000]">
          <div className="safari-empty-copy">
            <p className="safari-eyebrow">The clearing is quiet</p>
            <h2 id="empty-lookout-title" className="brutal-font text-2xl uppercase my-2">No animal crews have arrived yet.</h2>
            <p className="text-xs font-bold text-zinc-600 uppercase max-w-md mx-auto mb-4">Form the crews in Herd Maker, then scan this QR code to view team assignments.</p>
            <Link href="/mixer" className="inline-block bg-[#FACC15] text-black px-6 py-2.5 border-3 border-black rounded-xl font-black uppercase shadow-[3px_3px_0px_#000]">
              Form animal crews
            </Link>
          </div>
        </section>
      )}

      {teams.length > 0 && (
        <section aria-labelledby="herd-rollcall-title">
          <div className="flex justify-between items-end border-b-4 border-black pb-3 mb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600 font-mono block">
                Official Roster
              </span>
              <h2 id="herd-rollcall-title" className="brutal-font text-2xl md:text-3xl text-black uppercase leading-none">
                Animal Crew Rosters
              </h2>
            </div>
            <span className="text-xs font-black font-mono bg-[#B7DF77] text-black px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000] uppercase rounded-md">
              👥 {totalExplorers} Explorers · {teams.length} Herds
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
            {teams.map((team, index) => (
              <article
                key={team.name}
                className="showcase-team-card border-4 border-black rounded-2xl bg-white shadow-[6px_6px_0px_#000] overflow-hidden flex flex-col justify-between"
                style={{ backgroundColor: getTeamAccent(team.color, index) }}
              >
                <div>
                  <header className="flex items-center gap-3 p-4 border-b-3 border-black bg-white/60">
                    <TeamMark name={team.name} compact />
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-black uppercase tracking-wider font-mono text-zinc-700 block">
                        👥 {team.members.length} Explorers
                      </span>
                      <h3 className="brutal-font text-lg text-black uppercase leading-tight truncate">
                        {getSafariTeamLabel(team.name)}
                      </h3>
                    </div>
                    {typeof team.score === "number" && (
                      <span className="brutal-font text-xl text-black bg-[#FACC15] px-3 py-1 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000]">
                        {team.score} <small className="text-[9px] font-mono font-bold">PTS</small>
                      </span>
                    )}
                  </header>

                  <ul className="p-4 space-y-2 max-h-72 overflow-y-auto">
                    {team.members.map((member, memberIndex) => {
                      const highlighted = cleanQuery !== "" && member.name.toLowerCase().includes(cleanQuery);
                      return (
                        <li
                          key={`${member.name}-${memberIndex}`}
                          className={`flex items-center justify-between p-2.5 border-2 border-black rounded-xl font-bold text-sm transition-all ${
                            highlighted
                              ? "bg-[#FACC15] text-black scale-[1.02] ring-4 ring-[#FFFDF5] shadow-[3px_3px_0px_#000]"
                              : "bg-white/80 text-black shadow-[1.5px_1.5px_0px_#000]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-black text-zinc-500">
                              #{String(memberIndex + 1).padStart(2, "0")}
                            </span>
                            <span className="brutal-font uppercase text-base">{member.name}</span>
                          </div>
                          {member.cg && (
                            <span className="text-[9px] font-mono font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 border border-black/40 rounded">
                              {member.cg}
                            </span>
                          )}
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
    <div ref={containerRef} className="safari-crown-page min-h-screen selection:bg-[#F4B942] selection:text-[#243028]">
      <header className="safari-crown-nav gsap-reveal">
        <Link href="/home" className="safari-crown-back">Back to basecamp</Link>
        <div className="safari-crown-brand">
          <span className="safari-crown-brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <div>
            <strong>📱 Explorer Team Viewer</strong>
            <small>Find your animal crew and teammates</small>
          </div>
        </div>
        <span className="safari-crown-live"><i aria-hidden="true" /> Mobile view</span>
      </header>

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

      <footer className="safari-crown-footer">
        <span>Animal Kingdom · Explorer Roster</span>
        <span>Find your crew. Support your teammates.</span>
      </footer>
    </div>
  );
}
