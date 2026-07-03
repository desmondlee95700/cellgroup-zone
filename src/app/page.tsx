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

export default function EntryLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bootOverlayRef = useRef<HTMLDivElement>(null);
  const [booted, setBooted] = useState(false);
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
      // Rising retro chiptune arpeggio (C5 -> E5 -> G5 -> C6)
      playNote(523.25, now, 0.12, "square");
      playNote(659.25, now + 0.10, 0.12, "square");
      playNote(783.99, now + 0.20, 0.12, "square");
      playNote(1046.50, now + 0.30, 0.40, "square");
      playNote(261.63, now, 0.40, "triangle"); // Lower bass harmony tone
    } catch (e) {
      console.warn("Audio Context blocked or not supported", e);
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

  const handleAddCredit = () => {
    setCredits((prev) => prev + 1);
    playCoinSound();
    showToast("🪙 COIN ACCEPTED! +1 CREDIT");
  };

  // Entrance reveal animation for main dashboard
  const revealDashboard = () => {
    const tl = gsap.timeline();
    tl.fromTo(
      ".terminal-header",
      { scale: 0.9, y: -45, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.2)" }
    );
    tl.fromTo(
      ".terminal-screen",
      { scale: 0.95, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" },
      "-=0.2"
    );
    tl.fromTo(
      ".action-card",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.12, ease: "back.out(1.4)", clearProps: "all" },
      "-=0.15"
    );
  };

  // Handle Press Start click
  const handleBoot = () => {
    if (!bootOverlayRef.current) return;

    playBootSound();

    const shakeTl = gsap.timeline({
      onComplete: () => {
        setBooted(true);
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
      if (booted) {
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
    { dependencies: [booted], scope: containerRef }
  );



  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#FFFDF5] selection:bg-black selection:text-[#FACC15] py-12 px-6 flex flex-col items-center justify-center overflow-x-hidden relative"
    >
      {/* Toast Alert popup */}
      {toastMessage && (
        <div className="fixed top-8 z-50 brutal-box bg-[#FACC15] text-black font-black uppercase px-6 py-3 border-4 border-black text-sm shadow-[6px_6px_0px_#000] animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Retro 8-Bit Boot Screen */}
      {!booted && (
        <div
          ref={bootOverlayRef}
          className="fixed inset-0 bg-[#18181B] z-50 flex flex-col items-center justify-center crt-overlay p-6"
        >
          <div className="max-w-md w-full text-center space-y-8">
            <div className="space-y-2">
              <span className="bg-[#F59E0B] text-black font-black px-3 py-1 border-2 border-black text-xs uppercase tracking-widest inline-block">
                INSERT COIN
              </span>
              <h1 className="brutal-font text-5xl sm:text-7xl text-[#FACC15] brutal-text-glow-yellow uppercase tracking-wider">
                ZONE PLAY
              </h1>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                SYSTEM LOBBY CONSOLE v2.0.4
              </p>
            </div>

            {/* Diagnostic Boot Code Screen */}
            <div className="brutal-box p-6 bg-black text-white text-left space-y-4 shadow-[8px_8px_0px_#000] border-4 border-black font-mono text-xs">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-green-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  READY_TO_CONNECT
                </span>
                <span className="text-zinc-500">CREDITS: {credits}</span>
              </div>
              <div className="space-y-1 text-zinc-300">
                <p>&gt; BOOTING TEAMS CONSOLE...</p>
                <p>&gt; MOUNTING GAME SYSTEM ROSTER...</p>
                <p>&gt; LOBBY PLAYER QUEUE LOADED ({roster.length} DETECTED)</p>
                <p className="text-[#38BDF8]">&gt; READY STATE: OK</p>
              </div>
            </div>

            {/* Press Start action */}
            <button
              onClick={handleBoot}
              className="w-full brutal-font text-3xl bg-[#EF4444] text-white hover:bg-red-600 border-4 border-black p-5 uppercase transition-all duration-100 shadow-[6px_6px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              🔴 PRESS START
            </button>

            <div className="text-zinc-500 font-mono text-[10px]">
              CLICK START TO BOOT CONSOLE CABINET & SHAKE THE DISPLAY
            </div>
          </div>
        </div>
      )}

      {/* Floating game sticker badges in background */}
      {booted &&
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
      {booted && (
        <div className="max-w-4xl w-full space-y-8 z-10">
          
          {/* Physical Console Header Cabinet */}
          <header className="terminal-header brutal-box bg-[#18181B] text-white p-6 sm:p-8 rounded-2xl shadow-[12px_12px_0px_#000] relative">
            <div className="screw top-3 left-3"></div>
            <div className="screw top-3 right-3"></div>
            <div className="screw bottom-3 left-3"></div>
            <div className="screw bottom-3 right-3"></div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#FACC15] border-4 border-black text-black rounded-lg transform -rotate-2 shadow-[4px_4px_0px_#000]">
                  <GameIcon className="w-12 h-8" />
                </div>
                <div className="text-left">
                  <h1 className="brutal-font text-3xl sm:text-5xl text-[#FACC15] drop-shadow-[3px_3px_0px_#000] uppercase tracking-wider">
                    ZONE GATHERING
                  </h1>
                  <p className="text-gray-400 font-mono text-[10px] sm:text-xs tracking-widest uppercase">
                    {"/// TEAM COMPOSITION & GAME CENTER ///"}
                  </p>
                </div>
              </div>

              {/* Physical LED indicators and interactive console buttons */}
              <div className="flex items-center gap-3 bg-black p-3 border-2 border-zinc-700 rounded-lg">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="w-2.5 h-2.5 rounded-full led-red"></span>
                  <span className="text-[8px] text-zinc-500 font-bold uppercase">ERR</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="w-2.5 h-2.5 rounded-full led-yellow"></span>
                  <span className="text-[8px] text-zinc-500 font-bold uppercase">LINK</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="w-2.5 h-2.5 rounded-full led-green"></span>
                  <span className="text-[8px] text-zinc-500 font-bold uppercase">SYS</span>
                </div>
                <div className="w-px h-6 bg-zinc-800 mx-1"></div>
                <button
                  onClick={handleAddCredit}
                  className="bg-[#22C55E] text-black font-black text-[9px] px-2 py-1 border border-black hover:bg-green-400 uppercase shadow-[1px_1px_0px_#000]"
                >
                  COIN ({credits})
                </button>
                <button
                  onClick={() => setSoundOn(!soundOn)}
                  className="bg-[#38BDF8] text-black font-black text-[9px] px-2 py-1 border border-black hover:bg-sky-400 uppercase shadow-[1px_1px_0px_#000]"
                >
                  SFX: {soundOn ? "ON" : "OFF"}
                </button>
                <button
                  onClick={() => {
                    setBooted(false);
                    showToast("🔄 LOBBY REBOOTED!");
                  }}
                  className="bg-[#EF4444] text-white font-black text-[9px] px-2 py-1 border border-black hover:bg-red-500 uppercase shadow-[1px_1px_0px_#000]"
                >
                  REBOOT
                </button>
              </div>
            </div>
          </header>

          {/* Scrolling LED Marquee Ticker */}
          <div className="w-full bg-[#18181B] text-[#FFFDF5] border-4 border-black p-2.5 overflow-hidden select-none relative shadow-[6px_6px_0px_#000]">
            <div className="animate-marquee whitespace-nowrap flex gap-10 text-xs font-mono tracking-widest uppercase items-center">
              {roster.length > 0 ? (
                Array(6)
                  .fill(roster)
                  .flat()
                  .map((name, i) => (
                    <span key={i} className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 bg-[#4ADE80] rounded-full led-green"></span>
                      {name} IN LOBBY
                    </span>
                  ))
              ) : (
                Array(4)
                  .fill([
                    "LOBBY STATUS: WAITING FOR ATTENDEES TO REGISTER...",
                    "SCAN THE QR CODE OR USE THE LINK BELOW TO JOIN THE QUEUE!",
                    "STAGE CONSOLE READY FOR TEAM MIXING!"
                  ])
                  .flat()
                  .map((text, i) => (
                    <span key={i} className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 bg-[#EF4444] rounded-full led-red"></span>
                      {text}
                    </span>
                  ))
              )}
            </div>
          </div>

          {/* Action Panels Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Card 1: Games Zone */}
            <div className="action-card brutal-box brutal-box-hover p-8 bg-[#FACC15] text-black flex flex-col justify-between rounded-2xl shadow-[8px_8px_0px_#000]">
              <div className="fold-corner-orange"></div>
              <div className="space-y-4">
                <span className="bg-black text-[#FFFDF5] text-xs font-black px-2.5 py-1 border-2 border-black uppercase tracking-wider inline-block">
                  INSERT 01 // RULES & DEMO
                </span>
                <h2 className="brutal-font text-3xl uppercase text-black brutal-text-glow-yellow">
                  GAME ZONE 🕹️
                </h2>
                <p className="font-bold text-sm leading-relaxed text-zinc-950">
                  Read rules for Blanket Game & Balloon Scatter, view team formations, and watch the motion-graphics tutorial video before starting.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/games"
                  className="inline-block brutal-font bg-black text-[#FFFDF5] hover:bg-zinc-800 hover:text-white px-6 py-4 border-4 border-black uppercase transition-all duration-100 shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000]"
                >
                  ENTER STAGE 1 →
                </Link>
              </div>
            </div>

            {/* Card 2: Registration form */}
            <div className="action-card brutal-box brutal-box-hover p-8 bg-[#38BDF8] text-black flex flex-col justify-between rounded-2xl shadow-[8px_8px_0px_#000]">
              <div className="fold-corner-blue"></div>
              <div className="space-y-4">
                <span className="bg-black text-[#FFFDF5] text-xs font-black px-2.5 py-1 border-2 border-black uppercase tracking-wider inline-block">
                  INSERT 02 // JOIN THE QUEUE
                </span>
                <h2 className="brutal-font text-3xl uppercase text-black">
                  REGISTER PLAYER 📱
                </h2>
                <p className="font-bold text-sm leading-relaxed text-zinc-950">
                  Scan the lobby entry code or open the form link from your phone. Submit your username and cell group leader to be randomized.
                </p>
              </div>
              <div className="mt-8">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfIjmZMfPsbdXJ-5eYNVzQ2525PFaeVspfeEht2QxuvoCS-_w/viewform?usp=dialog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block brutal-font bg-black text-[#FFFDF5] hover:bg-zinc-800 hover:text-white px-6 py-4 border-4 border-black uppercase transition-all duration-100 shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000]"
                >
                  SIGN UP IN LOBBY ➔
                </a>
              </div>
            </div>

            {/* Card 3: Team Showcase */}
            <div className="action-card brutal-box brutal-box-hover p-8 bg-[#F472B6] text-black flex flex-col justify-between rounded-2xl shadow-[8px_8px_0px_#000] md:col-span-2">
              <div className="fold-corner-blue"></div>
              <div className="space-y-4">
                <span className="bg-black text-[#FFFDF5] text-xs font-black px-2.5 py-1 border-2 border-black uppercase tracking-wider inline-block">
                  INSERT 03 // LIVE RESULTS
                </span>
                <h2 className="brutal-font text-3xl uppercase text-black brutal-text-glow-pink">
                  SHOWCASE TEAMS 📺
                </h2>
                <p className="font-bold text-sm leading-relaxed text-zinc-950">
                  Show the big screen projection to all participants. Find out who is in your team, search name highlights, and resolve matchups.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/showcase"
                  className="inline-block brutal-font bg-black text-[#FFFDF5] hover:bg-zinc-800 hover:text-white px-6 py-4 border-4 border-black uppercase transition-all duration-100 shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000]"
                >
                  VIEW STAGE BOARDS →
                </Link>
              </div>
            </div>

          </section>
        </div>
      )}
    </div>
  );
}
