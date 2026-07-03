"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import GameIcon from "@/components/GameIcon";

export default function GamesPage() {
  const container = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"blanket" | "balloon">("blanket");
  const [activeStep, setActiveStep] = useState(0);

  const floatingShapes = [
    { char: "🎮", color: "bg-[#FACC15]", x: "6%", y: "22%", rot: -15 },
    { char: "🎲", color: "bg-[#38BDF8]", x: "88%", y: "28%", rot: 12 },
    { char: "⭐", color: "bg-[#F59E0B]", x: "5%", y: "72%", rot: 8 },
    { char: "🎈", color: "bg-[#F472B6]", x: "86%", y: "62%", rot: -10 },
  ];

  const blanketSteps = [
    "Split the group into two large halves.",
    "Hold up a large black blanket between the groups to block their view.",
    "Each group silently selects 1 or 2 players to sit facing the blanket.",
    "On THREE, drop the blanket! The selected players race to shout the opponent's name. First to say it wins!"
  ];

  const balloonSteps = [
    "Give every player a balloon and a marker.",
    "Players write their names clearly on their balloons.",
    "Players toss their balloons into the center. Scatter them wildly.",
    "On GO, players rush in, find their teammates' balloons, gather them, and sit in a circle. First fully seated team wins!"
  ];

  const activeSteps = activeTab === "blanket" ? blanketSteps : balloonSteps;

  useGSAP(
    () => {
      // Intro animations
      gsap.fromTo(
        ".gsap-reveal",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.2)",
          clearProps: "all",
        }
      );

      // Background floating stickers animation
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
    },
    { scope: container }
  );

  // Synthesize chiptune step sounds using Web Audio API
  const playStepSound = (isNext: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      if (isNext) {
        // High rising chirp
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5
      } else {
        // Falling retro chirp
        osc.frequency.setValueAtTime(880.00, now); // A5
        osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.12); // D5
      }

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleTabChange = (tab: "blanket" | "balloon") => {
    setActiveTab(tab);
    setActiveStep(0);
    // play a tab switch click tone
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleNext = () => {
    if (activeStep < activeSteps.length - 1) {
      setActiveStep((prev) => prev + 1);
      playStepSound(true);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
      playStepSound(false);
    }
  };

  return (
    <div
      ref={container}
      className="min-h-screen bg-[#18181B] bg-grid-pattern-dark text-white pb-24 relative overflow-x-hidden"
    >
      {/* Floating background shapes */}
      {floatingShapes.map((shape, idx) => (
        <div
          key={idx}
          className={`hidden md:flex floating-element fixed items-center justify-center w-14 h-14 border-4 border-black ${shape.color} rounded-xl shadow-[4px_4px_0px_#000] text-3xl z-0`}
          style={{
            left: shape.x,
            top: shape.y,
            transform: `rotate(${shape.rot}deg)`,
          }}
        >
          {shape.char}
        </div>
      ))}

      {/* Physical Console Header Cabinet */}
      <header className="gsap-reveal max-w-4xl mx-auto mt-8 px-4 sm:px-0 relative z-20">
        <div className="terminal-header brutal-box bg-[#18181B] text-white p-6 sm:p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_#000] relative">
          <div className="screw top-3 left-3"></div>
          <div className="screw top-3 right-3"></div>
          <div className="screw bottom-3 left-3"></div>
          <div className="screw bottom-3 right-3"></div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link
              href="/"
              className="brutal-box bg-[#FFFDF5] text-black font-black uppercase text-xs px-3.5 py-2 border-2 border-black hover:bg-[#FACC15] transition-all shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] cursor-pointer"
            >
              ← ESC BACK
            </Link>

            <h1 className="brutal-font text-3xl sm:text-5xl text-[#FACC15] drop-shadow-[3px_3px_0px_#000] uppercase tracking-wider inline-flex items-center gap-3">
              <GameIcon className="w-10 h-8 text-[#FACC15]" />
              GAME CENTER
            </h1>

            {/* LED Status Panel */}
            <div className="flex items-center gap-2.5 bg-black p-2.5 border border-zinc-800 rounded-lg">
              <div className="flex flex-col items-center gap-0.5">
                <span className="w-2 h-2 rounded-full led-green"></span>
                <span className="text-[6px] text-zinc-500 font-bold uppercase">SYS</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="w-2 h-2 rounded-full led-yellow"></span>
                <span className="text-[6px] text-zinc-500 font-bold uppercase">VIDEO</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        
        {/* Video Demo Section */}
        <section className="gsap-reveal mb-16">
          <h2 className="brutal-font text-3xl mb-6 uppercase flex items-center gap-3 text-white">
            <span className="w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse border-2 border-black block"></span>
            LIVE DEMO FEED
          </h2>

          {/* CRT Cabinet Jumbotron Player */}
          <div className="brutal-box bg-[#18181B] p-4 md:p-6 rounded-2xl shadow-[12px_12px_0px_#000] border-4 border-black relative">
            <div className="screw top-3 left-3"></div>
            <div className="screw top-3 right-3"></div>
            <div className="screw bottom-3 left-3"></div>
            <div className="screw bottom-3 right-3"></div>

            <div className="border-4 border-black rounded-lg overflow-hidden bg-black relative crt-overlay">
              <video
                className="w-full h-auto opacity-85 hover:opacity-100 transition-opacity duration-300 block relative z-0"
                controls
                autoPlay
                loop
                muted
              >
                <source src="/assets/videos/games-demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </section>

        {/* Icebreaker Rules Sections */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="gsap-reveal flex gap-2 mt-8 mb-[-4px] relative z-10 overflow-x-auto sm:overflow-x-visible pb-1 sm:pb-0">
            <button
              onClick={() => handleTabChange("blanket")}
              className={`brutal-font text-base sm:text-lg px-5 py-3 uppercase border-4 border-black border-b-0 rounded-t-xl transition-all duration-200 shadow-[4px_0_0_#000] cursor-pointer whitespace-nowrap ${
                activeTab === "blanket"
                  ? "bg-[#FACC15] text-black h-14 -translate-y-1.5"
                  : "bg-zinc-800 text-zinc-400 border-black hover:bg-zinc-700 hover:text-white h-12 mt-2"
              }`}
            >
              Blanket Name Game
            </button>
            <button
              onClick={() => handleTabChange("balloon")}
              className={`brutal-font text-base sm:text-lg px-5 py-3 uppercase border-4 border-black border-b-0 rounded-t-xl transition-all duration-200 shadow-[4px_0_0_#000] cursor-pointer whitespace-nowrap ${
                activeTab === "balloon"
                  ? "bg-[#38BDF8] text-black h-14 -translate-y-1.5"
                  : "bg-zinc-800 text-zinc-400 border-black hover:bg-zinc-700 hover:text-white h-12 mt-2"
              }`}
            >
              Balloon Scatter
            </button>
          </div>

          {/* Interactive Steps Manual Console */}
          <article className="gsap-reveal group relative z-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-[#18181B] border-4 border-black border-b-0 py-5 px-6 flex items-center justify-between shadow-[8px_0px_0px_#000] rounded-t-xl">
              <div>
                <h2 className="brutal-font text-xl sm:text-2xl uppercase tracking-wider text-white">
                  {activeTab === "blanket" ? "Blanket Name Game" : "Balloon Team Scatter"}
                </h2>
                <p className="text-zinc-400 font-bold tracking-widest text-[9px] sm:text-xs uppercase mt-0.5">
                  {activeTab === "blanket"
                    ? "Icebreaker · Fast Reflexes · Quick Memory"
                    : "Teamwork · Chaos · Coordination"}
                </p>
              </div>
              <span className="font-mono text-xs font-black bg-black border border-zinc-700 text-zinc-400 px-2 py-1 rounded">
                STAGE {activeTab === "blanket" ? "01" : "02"}
              </span>
            </div>

            <div
              className={`brutal-box p-6 sm:p-10 border-4 border-black shadow-[8px_8px_0px_#000] rounded-b-xl relative min-h-[300px] flex flex-col justify-between transition-colors duration-300 ${
                activeTab === "blanket" ? "bg-[#FACC15]" : "bg-[#38BDF8]"
              }`}
            >
              {/* Corner accent decal */}
              <div className={activeTab === "blanket" ? "fold-corner-orange" : "fold-corner-blue"}></div>

              {/* Instructions Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest bg-black text-[#FFFDF5] px-2.5 py-1 border-2 border-black select-none">
                  🎮 OBJECTIVE LOG
                </span>
                <span className="font-mono text-xs font-black text-black">
                  STEP {activeStep + 1} / {activeSteps.length}
                </span>
              </div>

              {/* Step Display Area */}
              <div className="flex-grow flex items-start gap-4 sm:gap-6 py-4">
                <div className="brutal-box bg-[#FFFDF5] text-black border-4 border-black shadow-[4px_4px_0px_#000] text-2xl font-black w-14 h-14 flex items-center justify-center shrink-0 transform -rotate-3 select-none">
                  0{activeStep + 1}
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-[9px] text-black/70 font-black uppercase tracking-widest block">
                    ACTIVE MISSION
                  </span>
                  <p className="text-lg sm:text-2xl font-black text-black leading-snug">
                    {activeSteps[activeStep]}
                  </p>
                </div>
              </div>

              {/* Step Block progress indicators */}
              <div className="my-6">
                <div className="w-full h-3 bg-black/10 border-2 border-black rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-black rounded-full transition-all duration-300"
                    style={{ width: `${((activeStep + 1) / activeSteps.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Console Footpad Controllers */}
              <div className="flex justify-between items-center gap-4 border-t-2 border-black pt-4 mt-2">
                <button
                  disabled={activeStep === 0}
                  onClick={handlePrev}
                  className="brutal-box bg-white text-black font-black text-xs px-4 py-2.5 border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] uppercase cursor-pointer"
                >
                  ◀ PREV STEP
                </button>

                <div className="hidden sm:flex gap-1.5">
                  {activeSteps.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-3 h-3 border-2 border-black rounded-full transition-all duration-200 ${
                        idx === activeStep ? "bg-black scale-110" : "bg-white"
                      }`}
                    ></span>
                  ))}
                </div>

                <button
                  disabled={activeStep === activeSteps.length - 1}
                  onClick={handleNext}
                  className="brutal-box bg-[#18181B] text-[#FFFDF5] font-black text-xs px-4 py-2.5 border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] uppercase cursor-pointer"
                >
                  NEXT STEP ▶
                </button>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
