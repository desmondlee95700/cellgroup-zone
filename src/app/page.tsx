"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import GameIcon from "@/components/GameIcon";

const DECORATIVE_SHAPES = [
  { char: "🦁", color: "bg-[#F4B942]", x: "8%", y: "15%", rot: -15 },
  { char: "🦒", color: "bg-[#B7DF77]", x: "88%", y: "20%", rot: 12 },
  { char: "🐘", color: "bg-[#5CC8E8]", x: "6%", y: "60%", rot: 10 },
  { char: "🦩", color: "bg-[#E8614D]", x: "90%", y: "65%", rot: -8 },
  { char: "🌿", color: "bg-[#B7DF77]", x: "80%", y: "88%", rot: 45 },
  { char: "🐾", color: "bg-[#F4B942]", x: "15%", y: "88%", rot: -20 },
];

export default function EntryLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gateOverlayRef = useRef<HTMLDivElement>(null);
  
  const [safariStage, setSafariStage] = useState<"gathering" | "exploring">("gathering");
  
  const [soundOn, setSoundOn] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [roster, setRoster] = useState<string[]>([]);

  // Load roster from localStorage to show live players
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedMembers = localStorage.getItem("cg_mixer_members");
        if (savedMembers) {
          const parsed = JSON.parse(savedMembers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRoster((parsed as { name: string }[]).map((m) => m.name));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const playCanopyOpeningSound = () => {
    if (!soundOn) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const playNote = (freq: number, start: number, duration: number, type: OscillatorType = "sine") => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        gainNode.gain.setValueAtTime(0.15, start);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;
      playNote(392, now, 0.18, "triangle");
      playNote(523.25, now + 0.14, 0.18, "sine");
      playNote(659.25, now + 0.28, 0.46, "sine");
      playNote(196, now, 0.56, "triangle");
    } catch (e) {
      console.warn("Audio blocked", e);
    }
  };

  // Entrance reveal animation for the basecamp map
  const revealBasecamp = () => {
    const tl = gsap.timeline();
    tl.fromTo(
      ".safari-signboard",
      { scale: 0.9, y: -45, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.2)" }
    );
    tl.fromTo(
      ".safari-map-surface",
      { scale: 0.95, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.2"
    );
    tl.fromTo(
      ".action-card",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.12, ease: "back.out(1.4)", clearProps: "all" },
      "-=0.15"
    );
  };

  // A grass-and-canopy wipe opens the reserve and reveals the expedition map.
  const enterSafariReserve = () => {
    if (!gateOverlayRef.current) return;

    playCanopyOpeningSound();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motionDuration = reducedMotion ? 0 : 0.52;

    const reserveTl = gsap.timeline({
      onComplete: () => {
        setSafariStage("exploring");
        setTimeout(revealBasecamp, 50);
      },
    });

    reserveTl
      .to(gateOverlayRef.current.querySelector(".safari-foreground-fronds-left"), {
        xPercent: -68,
        rotation: -4,
        duration: motionDuration,
        ease: "power2.inOut",
      })
      .to(
        gateOverlayRef.current.querySelector(".safari-foreground-fronds-right"),
        {
          xPercent: 68,
          rotation: 4,
          duration: motionDuration,
          ease: "power2.inOut",
        },
        "<"
      )
      .to(gateOverlayRef.current.querySelector(".safari-welcome-sign"), {
      opacity: 0,
      y: -38,
      duration: reducedMotion ? 0 : 0.32,
      ease: "power2.in",
    }, "<+=0.1")
      .to(gateOverlayRef.current, {
        opacity: 0,
        duration: reducedMotion ? 0 : 0.18,
        ease: "power1.out",
      }, "<+=0.08");
  };

  // Floating background shape animations
  useGSAP(
    () => {
      if (safariStage === "exploring") {
        gsap.utils.toArray<HTMLElement>(".floating-element").forEach((el, index) => {
          gsap.to(el, {
            y: "+=35",
            rotation: `${index % 2 === 0 ? "+" : "-"}=12`,
            duration: 2.2 + index * 0.4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        });
      }
    },
    { dependencies: [safariStage], scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="safari-world min-h-screen text-[#243028] selection:bg-[#F4B942] selection:text-[#243028] py-12 px-6 flex flex-col items-center justify-center overflow-x-hidden relative"
    >
      {/* Toast Alert popup */}
      {toastMessage && (
        <div className="fixed top-8 z-50 brutal-box bg-[#F4B942] text-[#243028] font-black uppercase px-6 py-3 border-4 border-[#243028] text-sm shadow-[6px_6px_0px_#243028] animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Illustrated safari reserve arrival */}
      {safariStage !== "exploring" && (
        <div
          ref={gateOverlayRef}
          className="safari-arrival-stage fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-6"
        >
          <div className="safari-reserve-vista" aria-hidden="true">
            <svg viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice" role="presentation">
              <defs>
                <linearGradient id="safari-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#63c8e7" />
                  <stop offset="62%" stopColor="#f4b942" />
                  <stop offset="100%" stopColor="#f9d778" />
                </linearGradient>
                <linearGradient id="safari-hill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6d974c" />
                  <stop offset="100%" stopColor="#315b39" />
                </linearGradient>
              </defs>
              <rect width="1440" height="700" fill="url(#safari-sky)" />
              <circle className="safari-vista-sun" cx="1040" cy="215" r="112" fill="#fff3c4" stroke="#243028" strokeWidth="8" />
              <g className="safari-vista-birds" fill="none" stroke="#243028" strokeWidth="8" strokeLinecap="round">
                <path d="M790 168q17-16 34 0q17-16 34 0" />
                <path d="M880 130q13-12 26 0q13-12 26 0" />
                <path d="M1180 144q12-11 24 0q12-11 24 0" />
              </g>
              <path d="M0 410 C190 320 330 415 490 355 S785 374 930 340 S1210 378 1440 286 V700H0Z" fill="#86a94e" stroke="#243028" strokeWidth="8" />
              <path d="M0 485 C175 415 370 492 535 420 S820 485 1030 407 S1285 462 1440 400 V700H0Z" fill="url(#safari-hill)" stroke="#243028" strokeWidth="8" />
              <g className="safari-vista-acacia" fill="#243028">
                <path d="M236 494h44l-12-205h-24Z" />
                <path d="M181 310c17-75 110-90 143-35c64-47 138 5 107 65c-23 45-80 24-105 21c-39 34-138 11-145-51Z" />
                <path d="M1260 478h29l-7-142h-16Z" />
                <path d="M1197 350c15-55 83-71 113-31c48-32 104 5 82 50c-17 34-61 19-83 17c-29 25-104 8-112-36Z" />
              </g>
              <g className="safari-vista-herd" fill="#243028">
                <path d="M865 499c0-37 37-57 74-41c21-34 80-22 83 25c27 3 38 20 36 42h-22v29h-15v-29h-46v29h-15v-29h-29v29h-15v-29h-22Z" />
                <path d="M1069 523c0-47 40-75 86-67l8-112h18l7 112h33v-45h12v45h17v68h-24v30h-15v-30h-84v30h-15v-30Z" />
                <circle cx="1174" cy="323" r="19" />
                <path d="M1210 345l13-28m-5 29l19-22" fill="none" stroke="#243028" strokeWidth="7" strokeLinecap="round" />
              </g>
              <path d="M0 565c184-74 338-10 512-59c228-64 377 66 616 7c141-35 229-24 312-1v188H0Z" fill="#1d4a35" stroke="#243028" strokeWidth="8" />
            </svg>
          </div>

          <div className="safari-foreground-fronds safari-foreground-fronds-left" aria-hidden="true" />
          <div className="safari-foreground-fronds safari-foreground-fronds-right" aria-hidden="true" />

          <section className="safari-welcome-sign" aria-labelledby="reserve-title">
            <div className="safari-sign-rope safari-sign-rope-left" aria-hidden="true" />
            <div className="safari-sign-rope safari-sign-rope-right" aria-hidden="true" />
            <div className="safari-ranger-plaque">
              <p className="safari-ranger-kicker">CELLGROUP GAMES PRESENTS</p>
              <h1 id="reserve-title" className="safari-reserve-title brutal-font">ANIMAL KINGDOM</h1>
              <div className="safari-sign-divider" aria-hidden="true"><span /> <span /> <span /></div>
              <p className="safari-reserve-subtitle">SAFARI BASECAMP FOR 50+ EXPLORERS</p>
              <button
                onClick={enterSafariReserve}
                className="safari-reserve-button brutal-font"
              >
                ENTER THE RESERVE <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Floating animal markers in the basecamp sky */}
      {safariStage === "exploring" &&
        DECORATIVE_SHAPES.map((shape, idx) => (
          <div
            key={idx}
            className={`hidden md:flex floating-element fixed items-center justify-center w-14 h-14 border-4 border-black ${shape.color} rounded-xl shadow-[4px_4px_0px_#000] text-3xl`}
            style={{
              left: shape.x,
              top: shape.y,
              transform: `rotate(${shape.rot}deg)`,
            }}
          >
            {shape.char}
          </div>
        ))}

      {/* Safari Basecamp map */}
      {safariStage === "exploring" && (
        <div className="max-w-6xl w-full space-y-8 z-10">
          
          <header className="safari-signboard brutal-box p-6 sm:p-8 rounded-3xl shadow-[12px_12px_0px_#243028] border-4 border-[#243028] relative">
            <span className="safari-leaf-marker left-4 top-4" aria-hidden="true">🌿</span>
            <span className="safari-leaf-marker right-4 top-4" aria-hidden="true">🦒</span>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#F4B942] border-4 border-[#243028] text-[#243028] rounded-xl transform -rotate-3 shadow-[4px_4px_0px_#243028] hover:rotate-3 transition-transform duration-200">
                  <GameIcon className="w-12 h-8" />
                </div>
                <div className="text-left">
                  <h1 className="safari-title-text brutal-font text-3xl sm:text-5xl text-[#FFF3C4] uppercase tracking-wider">
                    ANIMAL KINGDOM
                  </h1>
                  <p className="text-[#B7DF77] font-mono text-[10px] sm:text-xs tracking-widest uppercase mt-0.5">
                    {"/// SAFARI BASECAMP & PARTY GAMES ///"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 rounded-full border-2 border-[#FFF3C4] bg-[#245b3f] p-3 shadow-[3px_3px_0px_#143525]">
                <span className="font-mono text-[9px] font-black uppercase tracking-wider text-[#B7DF77]">🌿 Trail ready</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSoundOn(!soundOn)}
                    className="bg-[#5CC8E8] text-[#243028] font-black text-[10px] px-3 py-1.5 border-2 border-[#243028] hover:bg-[#8eddf0] uppercase shadow-[2px_2px_0px_#243028] cursor-pointer"
                  >
                    SFX: {soundOn ? "ON" : "OFF"}
                  </button>
                  <button
                    onClick={() => {
                      setSafariStage("gathering");
                      showToast("Back to the reserve entrance.");
                    }}
                    className="bg-[#E8614D] text-white font-black text-[10px] px-3 py-1.5 border-2 border-[#243028] hover:bg-[#c84738] uppercase shadow-[2px_2px_0px_#243028] cursor-pointer"
                  >
                    Return
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="safari-trail-strip w-full overflow-hidden select-none relative flex items-stretch">
            <div className="relative z-10 shrink-0 flex items-center gap-3 bg-[#F4B942] text-[#243028] px-4 py-3 border-r-4 border-[#243028] font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider">
              <span className="w-2.5 h-2.5 bg-[#B7DF77] rounded-full"></span>
              {roster.length > 0 ? `${roster.length} explorers checked in` : "Basecamp open"}
            </div>
            <div className="min-w-0 overflow-hidden py-3">
              <div className="animate-trail-procession whitespace-nowrap flex gap-10 text-xs font-mono tracking-widest uppercase items-center font-bold">
              {roster.length > 0 ? (
                Array(6)
                  .fill(roster)
                  .flat()
                  .map((name, i) => (
                    <span key={i} className="flex items-center gap-3">
                      <span aria-hidden="true">🐾</span>
                      {name} ON THE TRAIL
                    </span>
                  ))
              ) : (
                Array(4)
                  .fill([
                    "SAFARI TRAIL OPEN // BASECAMP CONNECTED",
                    "WAITING FOR EXPLORERS TO CHECK IN...",
                    "SCAN THE TRAIL PASS TO JOIN THE ANIMAL CREWS!",
                    "TEAM TRACKER IS READY TO FORM FAIR HERDS..."
                  ])
                  .flat()
                  .map((text, i) => (
                    <span key={i} className="flex items-center gap-3">
                      <span aria-hidden="true">🌿</span>
                      {text}
                    </span>
                  ))
              )}
              </div>
            </div>
          </div>

          {/* Basecamp trail map and explorer check-in */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Main Dashboard Center Screen (8 Cols) */}
            <main className="lg:col-span-8 space-y-8 safari-map-surface">
              
              <div className="safari-card brutal-box text-[#243028] p-6 rounded-3xl border-4 border-[#243028] shadow-[8px_8px_0px_#243028] relative">
                <div className="fold-corner-orange"></div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b-4 border-black pb-4">
                    <span className="bg-[#243028] text-[#FFF3C4] text-xs font-black px-2.5 py-1 border-2 border-[#243028] uppercase tracking-wider">
                      SAFARI TRAIL SELECTOR
                    </span>
                    <span className="text-xs font-mono font-black uppercase text-zinc-500">
                      CHOOSE YOUR ADVENTURE
                    </span>
                  </div>

                  {/* Main features cards row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    {/* Action 1: Games rules */}
                    <div className="action-card brutal-box p-7 bg-[#F4B942] text-[#243028] rounded-2xl border-4 border-[#243028] shadow-[6px_6px_0px_#243028] hover:-translate-y-1 hover:shadow-[10px_10px_0px_#243028] transition-all duration-200 flex flex-col justify-between min-h-[250px] sm:col-span-2">
                      <div className="space-y-4 max-w-xl">
                        <span className="bg-black text-[#FFFDF5] text-[9px] font-black px-2 py-0.5 border border-black uppercase tracking-wider inline-block">
                          SAFARI TRAIL 01 // WILD MISSIONS
                        </span>
                        <h2 className="brutal-font text-3xl sm:text-4xl uppercase tracking-tight">
                          SAFARI GAMES 🦁
                        </h2>
                        <p className="font-bold text-sm leading-relaxed text-zinc-900">
                          Brief the expedition, run the two wild challenges, then play the short game reel on the big screen.
                        </p>
                      </div>
                      <div className="pt-4">
                        <Link
                          href="/games"
                          className="inline-block brutal-font text-xs bg-black text-[#FFFDF5] hover:bg-zinc-800 hover:text-white px-5 py-3 border-2 border-black uppercase transition-all duration-100 shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] cursor-pointer"
                        >
                          EXPLORE GAME RULES →
                        </Link>
                      </div>
                    </div>

                    {/* Action 2: Showcase Board */}
                    <div className="action-card brutal-box p-6 bg-[#B7DF77] text-[#243028] rounded-2xl border-4 border-[#243028] shadow-[6px_6px_0px_#243028] hover:-translate-y-1 hover:shadow-[10px_10px_0px_#243028] transition-all duration-200 flex flex-col justify-between min-h-[210px]">
                      <div className="space-y-3">
                        <span className="bg-black text-[#FFFDF5] text-[9px] font-black px-2 py-0.5 border border-black uppercase tracking-wider inline-block">
                          TRAIL 03 // PRIDE ROCK
                        </span>
                        <h2 className="brutal-font text-2xl uppercase tracking-tight">
                          SAFARI CROWN 📺
                        </h2>
                        <p className="font-bold text-xs leading-relaxed text-zinc-900">
                          Put live animal-team standings and player names on the room display.
                        </p>
                      </div>
                      <div className="pt-4">
                        <Link
                          href="/showcase"
                          className="inline-block brutal-font text-xs bg-black text-[#FFFDF5] hover:bg-zinc-800 hover:text-white px-5 py-3 border-2 border-black uppercase transition-all duration-100 shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] cursor-pointer"
                        >
                          OPEN CROWN BOARD →
                        </Link>
                      </div>
                    </div>

                    {/* Action 3: Player Mixer controller */}
                    <div className="action-card brutal-box p-6 bg-[#5CC8E8] text-[#243028] rounded-2xl border-4 border-[#243028] shadow-[6px_6px_0px_#243028] hover:-translate-y-1 hover:shadow-[10px_10px_0px_#243028] transition-all duration-200 flex flex-col justify-between min-h-[210px]">
                      <div className="space-y-3">
                        <span className="bg-black text-[#FFFDF5] text-[9px] font-black px-2 py-0.5 border border-black uppercase tracking-wider inline-block">
                          TRAIL 02 // HERD MAKER
                        </span>
                        <h2 className="brutal-font text-2xl uppercase tracking-tight">
                          HERD MAKER 🐘
                        </h2>
                        <p className="font-bold text-xs leading-relaxed text-zinc-900">
                          Build fair herds, avoid cell-group collisions, and ready the live Safari Crown board.
                        </p>
                      </div>
                      <div className="pt-4">
                        <Link
                          href="/mixer"
                          className="inline-block brutal-font text-xs bg-black text-[#FFFDF5] hover:bg-zinc-800 hover:text-white px-5 py-3 border-2 border-black uppercase transition-all duration-100 shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] cursor-pointer"
                        >
                          FORM ANIMAL CREWS →
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </main>

            {/* Right: Live room status and registration (4 Cols) */}
            <aside className="lg:col-span-4 space-y-8">
              {/* Lobby Live Roster Player Ticket List */}
              <div className="safari-card brutal-box p-6 text-[#243028] rounded-3xl border-4 border-[#243028] shadow-[8px_8px_0px_#243028] relative">
                <div className="fold-corner-blue"></div>
                <div className="space-y-5">
                  <div className="bg-[#1D4A35] text-[#FFF3C4] border-4 border-[#243028] p-4 shadow-[4px_4px_0px_#243028]">
                    <div className="flex items-center justify-between gap-3 font-mono text-[10px] font-black uppercase tracking-wider">
                      <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#B7DF77]"></span> Basecamp status</span>
                      <span className="text-[#F4B942]">Trail 01</span>
                    </div>
                    <p className="brutal-font text-3xl text-[#F4B942] mt-3 leading-none">{roster.length}</p>
                    <p className="font-mono text-[10px] text-[#B7DF77] uppercase mt-1">Explorers checked in</p>
                  </div>

                  <div className="border-b-2 border-black pb-2 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-black text-[#FFFDF5] px-2 py-0.5 border border-black">
                      LIVE EXPEDITION
                    </span>
                    <span className="text-xs font-mono font-bold text-[#2E7D4D]">ON TRAIL</span>
                  </div>

                  {roster.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-zinc-300 rounded-lg">
                      <p className="font-bold text-xs uppercase text-zinc-500">No explorers checked in yet</p>
                      <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSfIjmZMfPsbdXJ-5eYNVzQ2525PFaeVspfeEht2QxuvoCS-_w/viewform?usp=dialog"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#38BDF8] hover:underline font-black uppercase block mt-1"
                      >
                        Find the trail ➔
                      </a>
                    </div>
                  ) : (
                    <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
                      {roster.slice(0, 8).map((player, idx) => (
                        <div
                          key={idx}
                          className="ticket-tear px-5 py-2 border-2 border-black bg-zinc-100 flex items-center justify-between text-xs font-bold shadow-[2px_2px_0px_#000]"
                        >
                          <span className="truncate">{player}</span>
                          <span className="text-[8px] font-mono bg-black text-white px-1.5 py-0.5 uppercase shrink-0">
                            P0{idx + 1}
                          </span>
                        </div>
                      ))}
                      {roster.length > 8 && (
                        <p className="text-center text-[10px] font-mono text-zinc-500 uppercase pt-1">
                          + {roster.length - 8} MORE PLAYERS READY
                        </p>
                      )}
                    </div>
                  )}

                  {/* QR signup link */}
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfIjmZMfPsbdXJ-5eYNVzQ2525PFaeVspfeEht2QxuvoCS-_w/viewform?usp=dialog"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center brutal-font text-xs bg-[#5CC8E8] hover:bg-[#8eddf0] text-[#243028] py-3 border-2 border-[#243028] uppercase shadow-[3px_3px_0px_#243028]"
                  >
                    🐾 CHECK IN AN EXPLORER ➔
                  </a>
                </div>
              </div>
            </aside>

          </div>

          {/* Footer Deck Chassis */}
          <footer className="text-center py-6 font-mono text-[9px] text-[#dce9ba] uppercase tracking-widest border-t-2 border-[#6ca160]">
            © 2026 Animal Kingdom Basecamp · Safari party games
          </footer>

        </div>
      )}
    </div>
  );
}
