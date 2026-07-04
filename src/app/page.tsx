"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import GameIcon from "@/components/GameIcon";

const DECORATIVE_SHAPES = [
  { char: "⚡", color: "bg-[#FACC15]", x: "8%", y: "15%", rot: -15 },
  { char: "🎲", color: "bg-[#F59E0B]", x: "88%", y: "20%", rot: 12 },
  { char: "🃏", color: "bg-[#38BDF8]", x: "6%", y: "60%", rot: 10 },
  { char: "🎈", color: "bg-[#F472B6]", x: "90%", y: "65%", rot: -8 },
  { char: "⭐", color: "bg-[#4ADE80]", x: "80%", y: "88%", rot: 45 },
  { char: "👾", color: "bg-[#C084FC]", x: "15%", y: "88%", rot: -20 },
];

const DIAGNOSTIC_LOG_TEMPLATES = [
  "LOBBY CONSOLE v2.0.5 INITIALIZING...",
  "VERIFYING GRAPHICS OVERLAYS...",
  "SYNCHRONIZING AUDIO BUFFER SYNTH...",
  "CONNECTING STAGE BROADSHEET LED...",
  "MOUNTING GAME SYSTEM ROSTER FILE...",
  "CELL GROUP SHUFFLER GREEDY MODULE: ACTIVE",
  "SYSTEM BOOT SUCCESSFUL! READY FOR PLAYERS."
];

export default function EntryLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bootOverlayRef = useRef<HTMLDivElement>(null);
  const coinRef = useRef<HTMLButtonElement>(null);
  
  // Boot stages: "idle" -> "loading" -> "ready" -> "done"
  const [bootStage, setBootStage] = useState<"idle" | "loading" | "ready" | "done">("idle");
  const [bootProgress, setBootProgress] = useState(0);
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  
  const [credits, setCredits] = useState(9);
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

  // Retro 8-bit Sound Synthesizers using Web Audio API
  const playSynthNote = (freq: number, duration: number, type: OscillatorType = "square") => {
    if (!soundOn) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context blocked or not supported", e);
    }
  };

  const playBootSound = () => {
    if (!soundOn) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const playNote = (freq: number, start: number, duration: number, type: OscillatorType = "square") => {
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
      playNote(523.25, now, 0.12, "square"); // C5
      playNote(659.25, now + 0.10, 0.12, "square"); // E5
      playNote(783.99, now + 0.20, 0.12, "square"); // G5
      playNote(1046.50, now + 0.30, 0.40, "square"); // C6
      playNote(261.63, now, 0.40, "triangle"); // Bass C3
    } catch (e) {
      console.warn("Audio blocked", e);
    }
  };

  const playCoinSound = () => {
    if (!soundOn) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;
      playTone(987.77, now, 0.08); // B5
      playTone(1318.51, now + 0.08, 0.25); // E6
    } catch (e) {
      console.warn(e);
    }
  };

  // Trigger loading sequence
  const startSystemLoading = () => {
    if (bootStage !== "idle") return;
    setBootStage("loading");
    playSynthNote(440, 0.15, "sawtooth");

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 4;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setBootStage("ready");
        playSynthNote(880, 0.3, "sine");
      }
      setBootProgress(currentProgress);
      
      // Dynamically push logs based on progress thresholds
      const logIdx = Math.floor((currentProgress / 100) * DIAGNOSTIC_LOG_TEMPLATES.length);
      const uniqueLogs = DIAGNOSTIC_LOG_TEMPLATES.slice(0, Math.min(logIdx + 1, DIAGNOSTIC_LOG_TEMPLATES.length));
      setVisibleLogs(uniqueLogs);
      
      // Sound tick
      if (currentProgress % 15 === 0) {
        playSynthNote(600 + currentProgress * 2, 0.04, "triangle");
      }
    }, 120);
  };

  // Handle coin insertion click animation
  const handleAddCredit = () => {
    if (!coinRef.current) return;
    
    // Animate coin rolling down into slot
    gsap.timeline()
      .to(coinRef.current, {
        y: 40,
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.in"
      })
      .add(() => {
        setCredits((prev) => prev + 1);
        playCoinSound();
        showToast("🪙 COIN ACCEPTED! +1 CREDIT");
      })
      .to(coinRef.current, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.2,
        delay: 0.5,
        ease: "back.out(1.5)"
      });
  };

  // Entrance reveal animation for main dashboard
  const revealDashboard = () => {
    const tl = gsap.timeline();
    tl.fromTo(
      ".terminal-header",
      { scale: 0.9, y: -45, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.2)" }
    );
    tl.fromTo(
      ".terminal-screen-wrapper",
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

  // Final PRESS START sequence (Shakes/flashes and moves to dashboard)
  const handlePressStart = () => {
    if (!bootOverlayRef.current) return;

    playBootSound();

    const shakeTl = gsap.timeline({
      onComplete: () => {
        setBootStage("done");
        setTimeout(revealDashboard, 50);
      },
    });

    // Retro screen glitch shake effect
    shakeTl.to(bootOverlayRef.current, {
      x: "random(-20, 20)",
      y: "random(-20, 20)",
      duration: 0.05,
      repeat: 12,
      yoyo: true,
    });

    // Glitched flash background colors
    shakeTl.to(bootOverlayRef.current, {
      backgroundColor: "#F59E0B",
      duration: 0.1,
    }, "<");
    shakeTl.to(bootOverlayRef.current, {
      backgroundColor: "#38BDF8",
      duration: 0.1,
    });
    shakeTl.to(bootOverlayRef.current, {
      backgroundColor: "#4ADE80",
      duration: 0.1,
    });
    shakeTl.to(bootOverlayRef.current, {
      opacity: 0,
      scale: 1.15,
      duration: 0.25,
      ease: "power2.inOut",
    });
  };

  // Floating background shape animations
  useGSAP(
    () => {
      if (bootStage === "done") {
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
    { dependencies: [bootStage], scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#18181B] bg-grid-pattern-dark text-white selection:bg-[#FACC15] selection:text-black py-12 px-6 flex flex-col items-center justify-center overflow-x-hidden relative"
    >
      {/* Toast Alert popup */}
      {toastMessage && (
        <div className="fixed top-8 z-50 brutal-box bg-[#FACC15] text-black font-black uppercase px-6 py-3 border-4 border-black text-sm shadow-[6px_6px_0px_#000] animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Retro 8-Bit Boot Screen Cabinet */}
      {bootStage !== "done" && (
        <div
          ref={bootOverlayRef}
          className="fixed inset-0 bg-[#18181B] z-50 flex flex-col items-center justify-center crt-overlay p-6"
        >
          {/* Main Bezel Container */}
          <div className="max-w-xl w-full text-center space-y-6 bg-[#27272A] border-8 border-black rounded-3xl p-6 md:p-8 shadow-[12px_12px_0px_#000] relative">
            <div className="screw top-3 left-3"></div>
            <div className="screw top-3 right-3"></div>
            <div className="screw bottom-3 left-3"></div>
            <div className="screw bottom-3 right-3"></div>
            
            <div className="space-y-2">
              <span className="bg-[#F59E0B] text-black font-black px-3 py-1 border-2 border-black text-xs uppercase tracking-widest inline-block transform -rotate-1 shadow-[2px_2px_0px_#000]">
                INSERT COIN
              </span>
              <h1 className="brutal-font text-5xl sm:text-6xl text-[#FACC15] brutal-text-glow-yellow uppercase tracking-wider select-none">
                ZONE GATHERING
              </h1>
              <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest">
                SYSTEM LOBBY CONSOLE v2.0.5
              </p>
            </div>

            {/* Diagnostic Boot Code Terminal Box */}
            <div className="brutal-box p-5 bg-black text-white text-left space-y-3 shadow-[8px_8px_0px_#000] border-4 border-black font-mono text-xs min-h-[160px] relative overflow-hidden">
              <div className="scanline-line"></div>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-green-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  LOBBY_STATE: {bootStage.toUpperCase()}
                </span>
                <span className="text-zinc-500 font-black">CREDITS: {credits}</span>
              </div>
              
              <div className="space-y-1 text-zinc-300">
                {bootStage === "idle" && (
                  <p className="text-[#38BDF8] animate-pulse">&gt; CLICK &quot;INITIALIZE SYSTEM&quot; BELOW TO DEPLOY CAB...</p>
                )}
                {visibleLogs.map((log, index) => (
                  <p key={index} className={index === visibleLogs.length - 1 ? "text-green-400 font-bold" : "text-zinc-400"}>
                    &gt; {log}
                  </p>
                ))}
              </div>
            </div>

            {/* Loading / Ready Button Control panel */}
            <div className="pt-2">
              {bootStage === "idle" && (
                <button
                  onClick={startSystemLoading}
                  className="w-full brutal-font text-2xl bg-[#38BDF8] text-black hover:bg-sky-400 border-4 border-black p-4 uppercase transition-all duration-100 shadow-[6px_6px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  ⚡ INITIALIZE SYSTEM
                </button>
              )}

              {bootStage === "loading" && (
                <div className="space-y-3">
                  <div className="w-full h-8 bg-zinc-800 border-4 border-black p-0.5 relative shadow-[4px_4px_0px_#000]">
                    <div
                      className="h-full bg-[#FACC15] transition-all duration-100 ease-out"
                      style={{ width: `${bootProgress}%` }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-black select-none">
                      BOOTING CONSOLE: {bootProgress}%
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[10px] font-mono block animate-pulse">READING DRIVERS AND LOOSE MEMORIES...</span>
                </div>
              )}

              {bootStage === "ready" && (
                <button
                  onClick={handlePressStart}
                  className="w-full brutal-font text-3xl bg-[#EF4444] text-white hover:bg-red-600 border-4 border-black p-5 uppercase transition-all duration-100 shadow-[6px_6px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[2px_2px_0px_#000] cursor-pointer animate-pulse"
                >
                  🔴 PRESS START
                </button>
              )}
            </div>

            <div className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider pt-2 select-none">
              Double Bezel Cabinet Hardware · 50+ Player Sync Ready
            </div>
          </div>
        </div>
      )}

      {/* Floating game sticker badges in background */}
      {bootStage === "done" &&
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

      {/* Main Console Cabinet Layout */}
      {bootStage === "done" && (
        <div className="max-w-5xl w-full space-y-8 z-10">
          
          {/* Physical Console Header Cabinet Panel */}
          <header className="terminal-header brutal-box bg-[#18181B] text-white p-6 sm:p-8 rounded-3xl shadow-[12px_12px_0px_#000] border-4 border-black relative">
            <div className="screw top-3 left-3"></div>
            <div className="screw top-3 right-3"></div>
            <div className="screw bottom-3 left-3"></div>
            <div className="screw bottom-3 right-3"></div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#FACC15] border-4 border-black text-black rounded-xl transform -rotate-3 shadow-[4px_4px_0px_#000] hover:rotate-3 transition-transform duration-200">
                  <GameIcon className="w-12 h-8" />
                </div>
                <div className="text-left">
                  <h1 className="brutal-font text-3xl sm:text-5xl text-[#FACC15] drop-shadow-[3px_3px_0px_#000] uppercase tracking-wider">
                    ZONE GATHERING
                  </h1>
                  <p className="text-zinc-500 font-mono text-[10px] sm:text-xs tracking-widest uppercase mt-0.5">
                    {"/// MIXER CONSOLE & CHAOS GAMES SYSTEM ///"}
                  </p>
                </div>
              </div>

              {/* Physical LED indicators and interactive console buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 bg-black p-3 border-2 border-zinc-700 rounded-xl shadow-[inner_0_2px_4px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-2 px-1">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="w-2.5 h-2.5 rounded-full led-red led-glow-red"></span>
                    <span className="text-[8px] text-zinc-500 font-bold uppercase">ERR</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="w-2.5 h-2.5 rounded-full led-yellow led-glow-yellow"></span>
                    <span className="text-[8px] text-zinc-500 font-bold uppercase">LINK</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="w-2.5 h-2.5 rounded-full led-green led-glow-green"></span>
                    <span className="text-[8px] text-zinc-500 font-bold uppercase">SYS</span>
                  </div>
                </div>
                
                <div className="w-px h-6 bg-zinc-800 mx-1 hidden sm:block"></div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSoundOn(!soundOn)}
                    className="bg-[#38BDF8] text-black font-black text-[10px] px-3 py-1.5 border-2 border-black hover:bg-sky-400 uppercase shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] cursor-pointer"
                  >
                    SFX: {soundOn ? "ON" : "OFF"}
                  </button>
                  <button
                    onClick={() => {
                      setBootStage("idle");
                      setBootProgress(0);
                      setVisibleLogs([]);
                      showToast("🔄 LOBBY REBOOTED!");
                    }}
                    className="bg-[#EF4444] text-white font-black text-[10px] px-3 py-1.5 border-2 border-black hover:bg-red-500 uppercase shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] cursor-pointer"
                  >
                    REBOOT
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Scrolling LED Marquee Ticker */}
          <div className="w-full bg-black text-[#FFFDF5] border-4 border-black p-3 overflow-hidden select-none relative shadow-[6px_6px_0px_#000]">
            <div className="scanline-line"></div>
            <div className="animate-marquee whitespace-nowrap flex gap-10 text-xs font-mono tracking-widest uppercase items-center font-bold">
              {roster.length > 0 ? (
                Array(6)
                  .fill(roster)
                  .flat()
                  .map((name, i) => (
                    <span key={i} className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 bg-[#4ADE80] rounded-full led-glow-green"></span>
                      {name} IN QUEUE
                    </span>
                  ))
              ) : (
                Array(4)
                  .fill([
                    "SYSTEM ONLINE // CONNECTED",
                    "LOBBY TELEMETRY STATE: WAITING FOR PLAYER REGISTRATION...",
                    "SCAN THE PRESENTATION DECK QR CODE TO SIGN UP FOR THE MATCHUPS!",
                    "STAGE SHUFFLER SHIELD PREPARED FOR GreedyDealer SELECTIONS..."
                  ])
                  .flat()
                  .map((text, i) => (
                    <span key={i} className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 bg-[#EF4444] rounded-full led-glow-red animate-pulse"></span>
                      {text}
                    </span>
                  ))
              )}
            </div>
          </div>

          {/* Core Panel Grid: Center Bezel Board & Sidebar Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Main Dashboard Center Screen (8 Cols) */}
            <main className="lg:col-span-8 space-y-8 terminal-screen-wrapper">
              
              {/* Central Cabinet screen container */}
              <div className="brutal-box bg-white text-black p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_#000] relative">
                <div className="fold-corner-orange"></div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b-4 border-black pb-4">
                    <span className="bg-black text-[#FFFDF5] text-xs font-black px-2.5 py-1 border-2 border-black uppercase tracking-wider">
                      DECKS & MAPS SELECTOR
                    </span>
                    <span className="text-xs font-mono font-black uppercase text-zinc-500">
                      CABINET SYSTEM ACT
                    </span>
                  </div>

                  {/* Main features cards row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    {/* Action 1: Games rules */}
                    <div className="action-card brutal-box p-6 bg-[#FACC15] text-black rounded-2xl border-4 border-black shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:shadow-[10px_10px_0px_#000] transition-all duration-200 flex flex-col justify-between min-h-[220px]">
                      <div className="space-y-3">
                        <span className="bg-black text-[#FFFDF5] text-[9px] font-black px-2 py-0.5 border border-black uppercase tracking-wider inline-block">
                          STAGE 01 // OBJECTIVES
                        </span>
                        <h2 className="brutal-font text-2xl uppercase tracking-tight">
                          GAME CENTER 🕹️
                        </h2>
                        <p className="font-bold text-xs leading-relaxed text-zinc-900">
                          Review dynamic rules for Blanket Game & Balloon Scatter, play audio guides, and stream hyperframes motion tutorial feed.
                        </p>
                      </div>
                      <div className="pt-4">
                        <Link
                          href="/games"
                          className="inline-block brutal-font text-xs bg-black text-[#FFFDF5] hover:bg-zinc-800 hover:text-white px-5 py-3 border-2 border-black uppercase transition-all duration-100 shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] cursor-pointer"
                        >
                          OPEN CAB RULES →
                        </Link>
                      </div>
                    </div>

                    {/* Action 2: Showcase Board */}
                    <div className="action-card brutal-box p-6 bg-[#F472B6] text-black rounded-2xl border-4 border-black shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:shadow-[10px_10px_0px_#000] transition-all duration-200 flex flex-col justify-between min-h-[220px]">
                      <div className="space-y-3">
                        <span className="bg-black text-[#FFFDF5] text-[9px] font-black px-2 py-0.5 border border-black uppercase tracking-wider inline-block">
                          STAGE 03 // SHOWCASE
                        </span>
                        <h2 className="brutal-font text-2xl uppercase tracking-tight">
                          SHOW BOARDS 📺
                        </h2>
                        <p className="font-bold text-xs leading-relaxed text-zinc-900">
                          Project live shuffles on the big screen! Spot teammate slots, filter search highlights, and launch presentation cycles.
                        </p>
                      </div>
                      <div className="pt-4">
                        <Link
                          href="/showcase"
                          className="inline-block brutal-font text-xs bg-black text-[#FFFDF5] hover:bg-zinc-800 hover:text-white px-5 py-3 border-2 border-black uppercase transition-all duration-100 shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] cursor-pointer"
                        >
                          LAUNCH OVERLAY →
                        </Link>
                      </div>
                    </div>

                    {/* Action 3: Player Mixer controller */}
                    <div className="action-card brutal-box p-6 bg-[#38BDF8] text-black rounded-2xl border-4 border-black shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:shadow-[10px_10px_0px_#000] transition-all duration-200 flex flex-col justify-between sm:col-span-2 min-h-[200px]">
                      <div className="space-y-3">
                        <span className="bg-black text-[#FFFDF5] text-[9px] font-black px-2 py-0.5 border border-black uppercase tracking-wider inline-block">
                          STAGE 02 // MIX ENGINE
                        </span>
                        <h2 className="brutal-font text-2xl uppercase tracking-tight">
                          TEAM MASTER CONSOLE 🎲
                        </h2>
                        <p className="font-bold text-xs leading-relaxed text-zinc-900">
                          Locked Admin Panel. Shuffles players greedly to prevent cell group collisions, generates presentation links, and triggers live deals.
                        </p>
                      </div>
                      <div className="pt-4">
                        <Link
                          href="/mixer"
                          className="inline-block brutal-font text-xs bg-black text-[#FFFDF5] hover:bg-zinc-800 hover:text-white px-5 py-3 border-2 border-black uppercase transition-all duration-100 shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] cursor-pointer"
                        >
                          ACCESS CONTROL CENTER →
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </main>

            {/* Right: Arcade Console Side Deck - Coin & Registration (4 Cols) */}
            <aside className="lg:col-span-4 space-y-8">
              
              {/* Coin Acceptor Slot Widget */}
              <div className="brutal-box p-6 bg-[#27272A] text-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_#000] text-center relative overflow-hidden">
                <div className="screw top-2.5 left-2.5"></div>
                <div className="screw top-2.5 right-2.5"></div>
                
                <h3 className="brutal-font text-[#FACC15] text-lg uppercase mb-3">COIN ACCEPTOR</h3>
                
                <div className="bg-black border-4 border-black p-4 rounded-2xl flex flex-col items-center gap-4 relative">
                  <div className="scanline-line"></div>
                  
                  {/* Digital Credit Counter */}
                  <div className="flex justify-between items-center w-full px-2 border-b border-zinc-800 pb-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase font-black">SYSTEM DECK</span>
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 border rounded uppercase ${
                      credits < 3 ? "bg-red-950 text-red-400 border-red-500 animate-pulse" : "bg-zinc-900 text-green-400 border-zinc-700"
                    }`}>
                      CREDITS: {credits}
                    </span>
                  </div>

                  {/* Physical Slot Visual */}
                  <div className="w-12 h-24 bg-zinc-900 border-4 border-black rounded-lg relative flex flex-col items-center justify-center shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]">
                    {/* Metal slot rim */}
                    <div className="w-1.5 h-16 bg-black rounded-full shadow-[0_0_2px_#ff0000_inset]"></div>
                    <div className="absolute top-2 text-[6px] font-mono text-red-500 animate-pulse font-black">25¢</div>
                  </div>

                  {/* Tactical Clickable Coin */}
                  <button
                    ref={coinRef}
                    onClick={handleAddCredit}
                    className="w-14 h-14 rounded-full border-4 border-black bg-[#F59E0B] hover:bg-[#FACC15] text-black font-black text-xl flex items-center justify-center shadow-[3px_3px_0px_#000] cursor-pointer hover:scale-105 active:scale-95 transition-transform select-none"
                    title="Click to insert token"
                  >
                    🪙
                  </button>

                  <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                    CLICK TO INSERT TOKEN & LOAD CREDIT
                  </p>
                </div>
              </div>

              {/* Lobby Live Roster Player Ticket List */}
              <div className="brutal-box p-6 bg-white text-black rounded-3xl border-4 border-black shadow-[8px_8px_0px_#000] relative">
                <div className="fold-corner-blue"></div>
                <div className="space-y-4">
                  <div className="border-b-2 border-black pb-2 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-black text-[#FFFDF5] px-2 py-0.5 border border-black">
                      QUEUE MONITOR
                    </span>
                    <span className="text-xs font-mono font-bold">{roster.length} PLAYERS</span>
                  </div>

                  {roster.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-zinc-300 rounded-lg">
                      <p className="font-bold text-xs uppercase text-zinc-400">Lobby Empty</p>
                      <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSfIjmZMfPsbdXJ-5eYNVzQ2525PFaeVspfeEht2QxuvoCS-_w/viewform?usp=dialog"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#38BDF8] hover:underline font-black uppercase block mt-1"
                      >
                        Scan / Sign Up ➔
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
                          + {roster.length - 8} MORE PLAYERS IN CONSOLE
                        </p>
                      )}
                    </div>
                  )}

                  {/* QR signup link */}
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfIjmZMfPsbdXJ-5eYNVzQ2525PFaeVspfeEht2QxuvoCS-_w/viewform?usp=dialog"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center brutal-font text-xs bg-[#38BDF8] hover:bg-sky-400 text-black py-3 border-2 border-black uppercase shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000]"
                  >
                    📱 SIGN UP PLAYER ➔
                  </a>
                </div>
              </div>
            </aside>

          </div>

          {/* Footer Deck Chassis */}
          <footer className="text-center py-6 font-mono text-[9px] text-zinc-600 uppercase tracking-widest border-t-2 border-zinc-800">
            © 2026 Zone Gathering Cabinet · Neo-Brutalist Layout Studio
          </footer>

        </div>
      )}
    </div>
  );
}
