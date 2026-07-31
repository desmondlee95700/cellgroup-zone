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

const DIAGNOSTIC_LOG_TEMPLATES = [
  "BASECAMP GATES SWINGING OPEN...",
  "CHECKING THE SAVANNA TRAIL...",
  "CALLING THE ANIMAL CREWS...",
  "HANGING THE PRIDE ROCK BANNER...",
  "PACKING THE PLAYER EXPEDITION LIST...",
  "TEAM TRAIL SHUFFLER: READY",
  "SAFARI BASECAMP OPEN! READY FOR EXPLORERS."
];

export default function EntryLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bootOverlayRef = useRef<HTMLDivElement>(null);
  
  // Boot stages: "idle" -> "loading" -> "ready" -> "done"
  const [bootStage, setBootStage] = useState<"idle" | "loading" | "ready" | "done">("idle");
  const [bootProgress, setBootProgress] = useState(0);
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  
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
      className="safari-world min-h-screen text-[#243028] selection:bg-[#F4B942] selection:text-[#243028] py-12 px-6 flex flex-col items-center justify-center overflow-x-hidden relative"
    >
      {/* Toast Alert popup */}
      {toastMessage && (
        <div className="fixed top-8 z-50 brutal-box bg-[#F4B942] text-[#243028] font-black uppercase px-6 py-3 border-4 border-[#243028] text-sm shadow-[6px_6px_0px_#243028] animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Retro 8-Bit Boot Screen Cabinet */}
      {bootStage !== "done" && (
        <div
          ref={bootOverlayRef}
          className="safari-world fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
        >
          {/* Main Bezel Container */}
          <div className="safari-expedition-pass max-w-xl w-full text-center space-y-6 border-8 border-[#243028] rounded-3xl p-6 md:p-8 shadow-[12px_12px_0px_#243028] relative">
            <div className="screw top-3 left-3"></div>
            <div className="screw top-3 right-3"></div>
            <div className="screw bottom-3 left-3"></div>
            <div className="screw bottom-3 right-3"></div>
            
            <div className="space-y-2">
              <span className="bg-[#F4B942] text-[#243028] font-black px-3 py-1 border-2 border-[#243028] text-xs uppercase tracking-widest inline-block transform -rotate-1 shadow-[2px_2px_0px_#243028]">
                GATES OPEN
              </span>
              <h1 className="safari-title-text brutal-font text-5xl sm:text-6xl text-[#243028] uppercase tracking-wider select-none">
                ANIMAL KINGDOM
              </h1>
              <p className="text-[#4b573b] font-mono text-xs uppercase tracking-widest">
                SAFARI BASECAMP • 50+ EXPLORERS
              </p>
            </div>

            {/* Diagnostic Boot Code Terminal Box */}
            <div className="brutal-box p-5 bg-[#1D4A35] text-[#FFF3C4] text-left space-y-3 shadow-[8px_8px_0px_#243028] border-4 border-[#243028] font-mono text-xs min-h-[160px] relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-[#6ca160] pb-2">
                <span className="text-[#B7DF77] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#B7DF77] animate-pulse"></span>
                  GATE_STATUS: {bootStage.toUpperCase()}
                </span>
                <span className="text-[#b7df77]/70 font-black">TRAIL: READY</span>
              </div>
              
              <div className="space-y-1 text-zinc-300">
                {bootStage === "idle" && (
                  <p className="text-[#5CC8E8] animate-pulse">&gt; TAP &quot;OPEN BASECAMP&quot; TO START THE EXPEDITION...</p>
                )}
                {visibleLogs.map((log, index) => (
                  <p key={index} className={index === visibleLogs.length - 1 ? "text-[#B7DF77] font-bold" : "text-[#e7e0b7]"}>
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
                  className="safari-paw-button w-full brutal-font text-2xl bg-[#5CC8E8] text-[#243028] hover:bg-[#8eddf0] border-4 border-[#243028] p-4 uppercase transition-all duration-100 shadow-[6px_6px_0px_#243028] cursor-pointer"
                >
                  🐾 OPEN BASECAMP
                </button>
              )}

              {bootStage === "loading" && (
                <div className="space-y-3">
                  <div className="w-full h-8 bg-zinc-800 border-4 border-black p-0.5 relative shadow-[4px_4px_0px_#000]">
                    <div
                      className="h-full bg-[#F4B942] transition-all duration-100 ease-out"
                      style={{ width: `${bootProgress}%` }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-black select-none">
                      OPENING GATES: {bootProgress}%
                    </span>
                  </div>
                  <span className="text-[#4b573b] text-[10px] font-mono block animate-pulse">FOLLOWING FRESH PAW PRINTS...</span>
                </div>
              )}

              {bootStage === "ready" && (
                <button
                  onClick={handlePressStart}
                  className="safari-paw-button w-full brutal-font text-3xl bg-[#E8614D] text-white hover:bg-[#c84738] border-4 border-[#243028] p-5 uppercase transition-all duration-100 shadow-[6px_6px_0px_#243028] cursor-pointer animate-pulse"
                >
                  🦁 BEGIN SAFARI
                </button>
              )}
            </div>

            <div className="text-[#4b573b] font-mono text-[9px] uppercase tracking-wider pt-2 select-none">
              Trail map checked · 50+ explorers ready
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
        <div className="max-w-6xl w-full space-y-8 z-10">
          
          {/* Physical Console Header Cabinet Panel */}
          <header className="terminal-header brutal-box p-6 sm:p-8 rounded-3xl shadow-[12px_12px_0px_#243028] border-4 border-[#243028] relative">
            <div className="screw top-3 left-3"></div>
            <div className="screw top-3 right-3"></div>
            <div className="screw bottom-3 left-3"></div>
            <div className="screw bottom-3 right-3"></div>

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
                    className="bg-[#5CC8E8] text-[#243028] font-black text-[10px] px-3 py-1.5 border-2 border-[#243028] hover:bg-[#8eddf0] uppercase shadow-[2px_2px_0px_#243028] cursor-pointer"
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
                    className="bg-[#E8614D] text-white font-black text-[10px] px-3 py-1.5 border-2 border-[#243028] hover:bg-[#c84738] uppercase shadow-[2px_2px_0px_#243028] cursor-pointer"
                  >
                    REBOOT
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Scrolling LED Marquee Ticker */}
          <div className="w-full bg-[#143525] text-[#FFF3C4] border-4 border-[#243028] overflow-hidden select-none relative shadow-[6px_6px_0px_#243028] flex items-stretch">
            <div className="relative z-10 shrink-0 flex items-center gap-3 bg-[#F4B942] text-[#243028] px-4 py-3 border-r-4 border-[#243028] font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider">
              <span className="w-2.5 h-2.5 bg-[#B7DF77] rounded-full"></span>
              {roster.length > 0 ? `${roster.length} explorers checked in` : "Basecamp open"}
            </div>
            <div className="min-w-0 overflow-hidden py-3">
              <div className="animate-marquee whitespace-nowrap flex gap-10 text-xs font-mono tracking-widest uppercase items-center font-bold">
              {roster.length > 0 ? (
                Array(6)
                  .fill(roster)
                  .flat()
                  .map((name, i) => (
                    <span key={i} className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 bg-[#4ADE80] rounded-full led-glow-green"></span>
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
                      <span className="w-2.5 h-2.5 bg-[#EF4444] rounded-full led-glow-red animate-pulse"></span>
                      {text}
                    </span>
                  ))
              )}
              </div>
            </div>
          </div>

          {/* Core Panel Grid: Center Bezel Board & Sidebar Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Main Dashboard Center Screen (8 Cols) */}
            <main className="lg:col-span-8 space-y-8 terminal-screen-wrapper">
              
              {/* Central Cabinet screen container */}
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
