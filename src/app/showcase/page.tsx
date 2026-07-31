"use client";

import type { CSSProperties } from "react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
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
  "bg-[#5CC8E8]",
  "bg-[#F4B942]",
  "bg-[#F2A85B]",
  "bg-[#B7DF77]",
  "bg-[#E6D27A]",
  "bg-[#79C8B5]",
  "bg-[#D8A56F]",
  "bg-[#E8614D]",
];

const TEAM_ACCENTS = ["#F4B942", "#5CC8E8", "#F2A85B", "#E8614D", "#B7DF77", "#79C8B5"];

const getGroupColor = (name: string) => {
  if (!name) return "bg-[#FFFDF5]";
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }
  return CG_COLORS[Math.abs(hash) % CG_COLORS.length];
};

const getTeamAccent = (color: string, index: number) => {
  const match = color?.match(/#[0-9a-fA-F]{6}/)?.[0];
  return match ?? TEAM_ACCENTS[index % TEAM_ACCENTS.length];
};

function TeamMark({ name, compact = false }: { name: string; compact?: boolean }) {
  const profile = getSafariTeamProfile(name);

  return (
    <span className={`safari-animal-mark${compact ? " is-compact" : ""}`} aria-hidden="true">
      <i />
      <b>{profile.animal.slice(0, 1)}</b>
      <i />
    </span>
  );
}

function ShowcaseContent() {
  const searchParams = useSearchParams();
  const rawData = searchParams.get("t");
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [activeBroadcastIdx, setActiveBroadcastIdx] = useState(0);
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
    if (!broadcastMode || teams.length === 0) return;

    const interval = setInterval(() => {
      setActiveBroadcastIdx((previous) => {
        const next = (previous + 1) % teams.length;
        playChirp(440 + next * 40, 0.08, "triangle");
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [broadcastMode, teams.length, playChirp]);

  useEffect(() => {
    const query = filterQuery.trim().toLowerCase();
    if (!query || teams.length === 0) return;
    if (teams.some((team) => team.members.some((member) => member.name.toLowerCase().includes(query)))) {
      playChirp(880, 0.12, "sine");
    }
  }, [filterQuery, teams, playChirp]);

  useGSAP(() => {
    if (teams.length > 0 && !broadcastMode) {
      gsap.fromTo(
        ".showcase-team-card",
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power2.out" },
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
  const activeTeam = teams[activeBroadcastIdx];
  const matchCount = cleanQuery
    ? teams.reduce((count, team) => count + team.members.filter((member) => member.name.toLowerCase().includes(cleanQuery)).length, 0)
    : 0;

  const getTeamRank = (teamName: string) => rankedTeams.findIndex((team) => team.name === teamName) + 1;

  return (
    <div ref={containerRef} className="safari-crown-content">
      <section className="safari-lookout-rail" aria-label="Ranger tools">
        <label className="safari-explorer-search">
          <span>Ranger lookout</span>
          <input
            type="search"
            placeholder="Find an explorer by name"
            value={filterQuery}
            onChange={(event) => setFilterQuery(event.target.value)}
          />
          <i aria-hidden="true" />
        </label>

        <div className="safari-lookout-actions">
          {cleanQuery && (
            <button type="button" className="safari-tool-button is-coral" onClick={() => setFilterQuery("")}>
              {matchCount > 0 ? `${matchCount} found · clear` : "No match · clear"}
            </button>
          )}
          <button
            type="button"
            className={`safari-tool-button${broadcastMode ? " is-active" : ""}`}
            onClick={() => {
              setBroadcastMode((current) => !current);
              playChirp(broadcastMode ? 300 : 600, 0.15, "triangle");
            }}
          >
            {broadcastMode ? "Return to standings" : "Start safari parade"}
          </button>
          <button
            type="button"
            className="safari-sound-button"
            aria-pressed={soundOn}
            onClick={() => setSoundOn((current) => !current)}
          >
            <span className={soundOn ? "is-on" : ""} aria-hidden="true" />
            Sound {soundOn ? "on" : "off"}
          </button>
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

      {!broadcastMode && teams.length > 0 && leaderTeam && (
        <>
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
                <p className="safari-eyebrow">Live at Pride Rock</p>
                <h2 id="pride-stage-title">The Safari Crown</h2>
                <p>
                  {topScore > 0
                    ? leadMargin > 0
                      ? `${getSafariTeamLabel(leaderTeam.name)} leads the migration by ${leadMargin} points.`
                      : `The herds are level at ${topScore} points.`
                    : "The herds are assembled. The first points will set the trail."}
                </p>
              </div>
              <div className="safari-crown-goal">
                <span>Journey to the crown</span>
                <strong>{SCORE_TARGET}</strong>
                <small>points to win</small>
              </div>
            </div>

            <div className="safari-pride-landscape">
              <article
                className="safari-summit-team"
                style={{ "--team-accent": getTeamAccent(leaderTeam.color, 0) } as CSSProperties}
              >
                <div className="safari-leader-crown" aria-hidden="true"><i /><i /><i /></div>
                <TeamMark name={leaderTeam.name} />
                <div className="safari-summit-name">
                  <span>Current trail leader</span>
                  <h3>{getSafariTeamLabel(leaderTeam.name)}</h3>
                  <small>{leaderTeam.members.length} explorers</small>
                </div>
                <div className="safari-summit-score">
                  <strong>{topScore}</strong>
                  <span>points</span>
                </div>
                <div className="safari-summit-progress" aria-label={`${Math.min(100, Math.round((topScore / SCORE_TARGET) * 100))}% to the crown`}>
                  <i style={{ width: `${Math.min(100, (topScore / SCORE_TARGET) * 100)}%` }} />
                </div>
              </article>

              <div className="safari-rock-terraces" aria-label="Chasing teams">
                {challengerTeams.map((team, index) => {
                  const score = team.score ?? 0;
                  const gap = Math.max(0, topScore - score);
                  const progress = Math.min(100, (score / SCORE_TARGET) * 100);

                  return (
                    <article
                      key={team.name}
                      className="safari-rock-terrace"
                      style={{ "--team-accent": getTeamAccent(team.color, index + 1) } as CSSProperties}
                    >
                      <span className="safari-terrace-rank">{index + 2}</span>
                      <TeamMark name={team.name} compact />
                      <div className="safari-terrace-name">
                        <small>{gap === 0 ? "Neck and neck" : `${gap} points behind`}</small>
                        <h3>{getSafariTeamLabel(team.name)}</h3>
                      </div>
                      <div className="safari-terrace-trail"><i style={{ width: `${progress}%` }} /></div>
                      <strong className="safari-terrace-score">{score}<small> pts</small></strong>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="safari-scoring-path" aria-label="Scoring guide">
              <span><b>+100</b> Round win</span>
              <span><b>+60</b> Runner-up</span>
              <span><b>+25</b> Team spirit</span>
              <span><b>−10</b> Penalty</span>
            </div>
          </section>

          <section className="safari-herd-rollcall" aria-labelledby="herd-rollcall-title">
            <div className="safari-rollcall-heading">
              <div>
                <p className="safari-eyebrow">Herd roll call</p>
                <h2 id="herd-rollcall-title">Every explorer on the trail</h2>
              </div>
              <p>Search above to light up an explorer&apos;s camp flag.</p>
            </div>

            <div className="safari-herd-camps">
              {rankedTeams.map((team, index) => (
                <article
                  key={team.name}
                  className="showcase-team-card safari-herd-camp"
                  style={{ "--team-accent": getTeamAccent(team.color, index) } as CSSProperties}
                >
                  <div className="safari-camp-pennant" aria-hidden="true" />
                  <header>
                    <TeamMark name={team.name} compact />
                    <div>
                      <span>Rank {index + 1} · {team.score ?? 0} points</span>
                      <h3>{getSafariTeamLabel(team.name)}</h3>
                    </div>
                  </header>
                  <ul>
                    {team.members.map((member, memberIndex) => {
                      const highlighted = cleanQuery !== "" && member.name.toLowerCase().includes(cleanQuery);
                      return (
                        <li key={`${member.name}-${memberIndex}`} className={highlighted ? "is-found" : ""}>
                          <span>{member.name}</span>
                          <small className={getGroupColor(member.cg)}>{member.cg}</small>
                        </li>
                      );
                    })}
                  </ul>
                  {team.members.length === 0 && <p className="safari-no-explorers">This camp is waiting for explorers.</p>}
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {broadcastMode && activeTeam && (
        <section
          className="safari-parade-stage"
          aria-labelledby="safari-parade-title"
          style={{ "--team-accent": getTeamAccent(activeTeam.color, activeBroadcastIdx) } as CSSProperties}
        >
          <div className="safari-parade-sun" aria-hidden="true" />
          <div className="safari-parade-canopy" aria-hidden="true"><i /><i /><i /><i /></div>
          <div className="safari-parade-copy">
            <p className="safari-eyebrow">Now crossing the savanna</p>
            <TeamMark name={activeTeam.name} />
            <h2 id="safari-parade-title">{getSafariTeamLabel(activeTeam.name)}</h2>
            <p>Rank {getTeamRank(activeTeam.name)} · {activeTeam.score ?? 0} points · {activeTeam.members.length} explorers</p>
          </div>

          <ul className="safari-parade-roster">
            {activeTeam.members.map((member, index) => {
              const highlighted = cleanQuery !== "" && member.name.toLowerCase().includes(cleanQuery);
              return (
                <li key={`${member.name}-${index}`} className={highlighted ? "is-found" : ""}>
                  <span>{member.name}</span>
                  <small className={getGroupColor(member.cg)}>{member.cg}</small>
                </li>
              );
            })}
            {activeTeam.members.length === 0 && <li className="is-empty">This herd is waiting for explorers.</li>}
          </ul>

          <footer className="safari-parade-controls">
            <button
              type="button"
              onClick={() => {
                setActiveBroadcastIdx((previous) => (previous - 1 + teams.length) % teams.length);
                playChirp(350, 0.08, "triangle");
              }}
            >
              Previous herd
            </button>
            <span><b>{activeBroadcastIdx + 1}</b> of {teams.length} · changes every 5 seconds</span>
            <button
              type="button"
              onClick={() => {
                setActiveBroadcastIdx((previous) => (previous + 1) % teams.length);
                playChirp(450, 0.08, "triangle");
              }}
            >
              Next herd
            </button>
          </footer>
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
        <Link href="/" className="safari-crown-back">Back to basecamp</Link>
        <div className="safari-crown-brand">
          <span className="safari-crown-brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <div>
            <strong>Pride Rock Ceremony</strong>
            <small>Live safari points</small>
          </div>
        </div>
        <span className="safari-crown-live"><i aria-hidden="true" /> Ceremony live</span>
      </header>

      <main className="safari-crown-shell gsap-reveal">
        <Suspense fallback={
          <div className="safari-crown-loading">
            <span aria-hidden="true" />
            <p>Opening the ranger ledger...</p>
          </div>
        }>
          <ShowcaseContent />
        </Suspense>
      </main>

      <footer className="safari-crown-footer">
        <span>Animal Kingdom · Pride Rock</span>
        <span>Cheer loudly. Score clearly. Celebrate every herd.</span>
      </footer>
    </div>
  );
}
