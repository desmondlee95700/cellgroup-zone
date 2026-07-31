"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";

type MissionKey = "blanket" | "balloon";

const MISSIONS = {
  blanket: {
    eyebrow: "CANOPY CHALLENGE",
    name: "Canopy Call",
    motto: "Look. Remember. Roar.",
    description: "A lightning-fast name game where two prides meet when the canopy drops.",
    steps: [
      { title: "Form two prides", body: "Split everyone into two large groups and seat them facing one another." },
      { title: "Raise the canopy", body: "Two rangers hold a large dark blanket between the groups so nobody can see through." },
      { title: "Choose the scouts", body: "Each pride silently sends one or two explorers to sit right behind the blanket." },
      { title: "Call the name", body: "Drop the blanket on three. The first scout to shout the opponent’s name wins the encounter." },
    ],
  },
  balloon: {
    eyebrow: "MIGRATION CHALLENGE",
    name: "Herd Round-Up",
    motto: "Mark. Scatter. Gather.",
    description: "A joyful migration race where every explorer must reunite their animal crew.",
    steps: [
      { title: "Mark the trail", body: "Give every explorer a balloon and marker, then write one clear name on each balloon." },
      { title: "Release the migration", body: "Toss every balloon into the middle and scatter them across the activity field." },
      { title: "Sound the ranger call", body: "On go, everyone races in to find the balloons carrying their teammates’ names." },
      { title: "Reunite the herd", body: "Bring the full set back and sit together. The first complete animal crew wins." },
    ],
  },
} as const;

const BALLOONS = [
  { color: "#E8614D", name: "JASON" },
  { color: "#5CC8E8", name: "VICTOR" },
  { color: "#F4B942", name: "LEMUEL" },
  { color: "#E78AAA", name: "ESTHER" },
  { color: "#86A94E", name: "SHARON" },
  { color: "#E99445", name: "MICHAEL" },
];

function MissionBadge({ mission, className = "" }: { mission: MissionKey; className?: string }) {
  if (mission === "blanket") {
    return (
      <svg className={className} viewBox="0 0 84 84" aria-hidden="true">
        <circle cx="42" cy="42" r="36" fill="#F4B942" stroke="currentColor" strokeWidth="5" />
        <path d="M19 59V26l23 10 23-10v33L42 49Z" fill="#1D4A35" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <path d="M42 36v13" stroke="#FFF3C4" strokeWidth="4" strokeLinecap="round" />
        <circle cx="29" cy="31" r="4" fill="#FFF3C4" />
        <circle cx="55" cy="31" r="4" fill="#FFF3C4" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 84 84" aria-hidden="true">
      <circle cx="42" cy="42" r="36" fill="#5CC8E8" stroke="currentColor" strokeWidth="5" />
      <path d="M27 48c-10-8-8-24 4-29 12 2 16 17 8 27l-6 5Zm30 0c10-8 8-24-4-29-12 2-16 17-8 27l6 5Z" fill="#E8614D" stroke="currentColor" strokeWidth="4" />
      <path d="M33 51c3 8 1 12-3 16m21-16c-3 8-1 12 3 16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="42" cy="59" r="7" fill="#F4B942" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
}

export default function GamesPage() {
  const container = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<MissionKey>("blanket");
  const [activeStep, setActiveStep] = useState(0);
  const [blanketDropped, setBlanketDropped] = useState(false);
  const [poppedBalloons, setPoppedBalloons] = useState<boolean[]>([false, false, false, false, false, false]);

  const mission = MISSIONS[activeTab];

  useGSAP(
    () => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.fromTo(
        ".field-reveal",
        { y: reducedMotion ? 0 : 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: reducedMotion ? 0 : 0.62,
          stagger: reducedMotion ? 0 : 0.1,
          ease: "power2.out",
          clearProps: "all",
        }
      );
    },
    { scope: container }
  );

  const playTrailTone = (freq: number, duration: number, type: OscillatorType = "sine") => {
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
    } catch (error) {
      console.warn(error);
    }
  };

  const handleTabChange = (nextMission: MissionKey) => {
    setActiveTab(nextMission);
    setActiveStep(0);
    setBlanketDropped(false);
    playTrailTone(nextMission === "blanket" ? 392 : 523.25, 0.16, "triangle");
  };

  const moveStep = (direction: -1 | 1) => {
    const nextStep = Math.max(0, Math.min(mission.steps.length - 1, activeStep + direction));
    if (nextStep === activeStep) return;
    setActiveStep(nextStep);
    playTrailTone(direction > 0 ? 659.25 : 440, 0.12, "sine");
  };

  const handleBalloonClick = (index: number) => {
    if (poppedBalloons[index]) return;
    setPoppedBalloons((current) => current.map((value, idx) => (idx === index ? true : value)));
    playTrailTone(720, 0.1, "triangle");
  };

  return (
    <div ref={container} className="safari-field-page">
      <div className="safari-field-sun" aria-hidden="true" />
      <div className="safari-field-horizon" aria-hidden="true">
        <svg viewBox="0 0 1440 390" preserveAspectRatio="none" role="presentation">
          <path d="M0 239c174-96 315-4 461-59s278 54 444-29 342 34 535-26v265H0Z" fill="#86A94E" stroke="#243028" strokeWidth="7" />
          <path d="M0 292c187-61 338 19 529-46s308 58 517-12 294 29 394 7v149H0Z" fill="#315B39" stroke="#243028" strokeWidth="7" />
          <path d="M119 286h28l-8-137h-14Z" fill="#243028" />
          <path d="M64 163c12-52 78-67 106-29 45-33 100 4 78 46-16 32-59 18-79 16-27 23-99 8-105-33Z" fill="#243028" />
          <path d="M1180 280h24l-7-116h-12Z" fill="#243028" />
          <path d="M1135 174c11-42 62-55 85-24 38-28 83 3 65 38-14 26-48 15-65 13-23 19-80 6-85-27Z" fill="#243028" />
        </svg>
      </div>

      <nav className="safari-field-nav field-reveal" aria-label="Mission navigation">
        <Link href="/" className="safari-field-back"><span aria-hidden="true">←</span> Basecamp</Link>
        <div className="safari-field-brand">
          <span className="safari-field-brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <div><strong className="brutal-font">Wild Field Guide</strong><span>Animal Kingdom expeditions</span></div>
        </div>
        <span className="safari-field-open"><i aria-hidden="true" />Field open</span>
      </nav>

      <header className="safari-field-hero field-reveal">
        <div className="safari-field-hero-panel">
          <p className="safari-eyebrow">TODAY&apos;S WILD CHALLENGES</p>
          <h1 className="safari-field-title brutal-font"><span>Lead the room</span><span>into the wild.</span></h1>
          <p className="safari-field-intro">Pick an expedition, brief every explorer, then test the action before the real game begins.</p>
        </div>
        <div className="safari-field-binoculars" aria-hidden="true">
          <span /><span /><i /><b />
        </div>
      </header>

      <main className="safari-field-shell">
        <section className="safari-mission-picker field-reveal" aria-label="Choose a field mission">
          <div role="tablist" aria-label="Available field missions">
            {(Object.keys(MISSIONS) as MissionKey[]).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeTab === key}
                aria-controls="active-mission-journal"
                onClick={() => handleTabChange(key)}
                className={activeTab === key ? "is-active" : ""}
              >
                <MissionBadge mission={key} className="safari-mission-badge" />
                <span><small>{MISSIONS[key].eyebrow}</small><strong className="brutal-font">{MISSIONS[key].name}</strong><em>{MISSIONS[key].motto}</em></span>
                <b aria-hidden="true">{activeTab === key ? "Selected" : "Choose"}</b>
              </button>
            ))}
          </div>
        </section>

        <section id="active-mission-journal" className={`safari-field-journal field-reveal mission-${activeTab}`} role="tabpanel">
          <header className="safari-journal-heading">
            <div>
              <p className="safari-eyebrow">RANGER DISPATCH</p>
              <h2 className="brutal-font">{mission.name}</h2>
              <p>{mission.description}</p>
            </div>
            <MissionBadge mission={activeTab} className="safari-journal-seal" />
          </header>

          <div className="safari-journal-spread">
            <article className="safari-journal-rules" aria-labelledby="field-plan-title">
              <div className="safari-journal-label"><span>FIELD PLAN</span><strong>{activeStep + 1} of {mission.steps.length}</strong></div>
              <h3 id="field-plan-title" className="brutal-font">Follow the ranger&apos;s trail</h3>
              <ol className="safari-step-trail">
                {mission.steps.map((step, index) => (
                  <li key={step.title} className={index === activeStep ? "is-current" : index < activeStep ? "is-complete" : ""}>
                    <button type="button" onClick={() => setActiveStep(index)} aria-current={index === activeStep ? "step" : undefined}>
                      <span className="safari-step-marker">{String(index + 1).padStart(2, "0")}</span>
                      <span><strong>{step.title}</strong><em>{step.body}</em></span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="safari-step-controls">
                <button type="button" onClick={() => moveStep(-1)} disabled={activeStep === 0}>Previous track</button>
                <span>{Math.round(((activeStep + 1) / mission.steps.length) * 100)}% briefed</span>
                <button type="button" onClick={() => moveStep(1)} disabled={activeStep === mission.steps.length - 1}>Next track</button>
              </div>
            </article>

            <section className="safari-field-exercise" aria-labelledby="field-exercise-title">
              <div className="safari-exercise-heading">
                <p className="safari-eyebrow">TRY IT AT BASECAMP</p>
                <h3 id="field-exercise-title" className="brutal-font">{activeTab === "blanket" ? "Canopy reveal" : "Migration finder"}</h3>
                <p>{activeTab === "blanket" ? "Drop the canopy and see who calls the name first." : "Find each name marker before the herd moves on."}</p>
              </div>

              {activeTab === "blanket" ? (
                <div className="safari-canopy-exercise">
                  <div className="safari-scout safari-scout-left"><span>A</span><strong>Alex</strong><small>Lion pride</small></div>
                  <div
                    className={`safari-canopy-curtain ${blanketDropped ? "is-dropped" : ""}`}
                    aria-hidden="true"
                  ><i /><i /><i /></div>
                  <div className="safari-scout safari-scout-right"><span>S</span><strong>Sarah</strong><small>Elephant herd</small></div>
                  {blanketDropped && <div className="safari-call-result"><strong className="brutal-font">“Alex!”</strong><span>Alex called first · 100 points</span></div>}
                  <button
                    type="button"
                    onClick={() => {
                      setBlanketDropped((current) => !current);
                      playTrailTone(blanketDropped ? 392 : 659.25, 0.16, "triangle");
                    }}
                    className="safari-exercise-action brutal-font"
                  >
                    {blanketDropped ? "Raise the canopy" : "Drop the canopy"}
                  </button>
                </div>
              ) : (
                <div className="safari-migration-exercise">
                  <div className="safari-balloon-toolbar">
                    <span>{poppedBalloons.filter(Boolean).length} of {BALLOONS.length} names found</span>
                    <button type="button" onClick={() => setPoppedBalloons(BALLOONS.map(() => false))}>Reset field</button>
                  </div>
                  <div className="safari-balloon-field">
                    {BALLOONS.map((balloon, index) => (
                      <button
                        key={balloon.name}
                        type="button"
                        onClick={() => handleBalloonClick(index)}
                        disabled={poppedBalloons[index]}
                        aria-label={poppedBalloons[index] ? `${balloon.name} found` : `Find ${balloon.name}`}
                      >
                        {!poppedBalloons[index] ? (
                          <span className="safari-balloon" style={{ backgroundColor: balloon.color }}><b>{balloon.name}</b><i /></span>
                        ) : (
                          <span className="safari-balloon-found"><i aria-hidden="true" /><b>Found</b><small>{balloon.name}</small></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </section>

        <section className="safari-screening-tent field-reveal" aria-labelledby="screening-title">
          <div className="safari-screening-copy">
            <p className="safari-eyebrow">CAMPFIRE SCREENING · 34 SECONDS</p>
            <h2 id="screening-title" className="brutal-font">Show the expedition reel.</h2>
            <p>Play this while teams gather. It previews both challenges before the ranger gives the final field instructions.</p>
            <div className="safari-screening-cues">
              <span><MissionBadge mission="blanket" /><strong>Canopy Call</strong><small>Spot · drop · name</small></span>
              <span><MissionBadge mission="balloon" /><strong>Herd Round-Up</strong><small>Mark · find · gather</small></span>
            </div>
          </div>
          <div className="safari-screening-reel">
            <div className="safari-reel-rope safari-reel-rope-left" aria-hidden="true" />
            <div className="safari-reel-rope safari-reel-rope-right" aria-hidden="true" />
            <video controls autoPlay loop muted playsInline aria-label="Animal Kingdom field games introduction video">
              <source src="/assets/videos/games-demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </section>
      </main>

      <footer className="safari-field-footer"><span>Animal Kingdom field guide</span><Link href="/">Return to expedition map</Link></footer>
    </div>
  );
}
