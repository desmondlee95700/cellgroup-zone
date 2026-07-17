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
  
  // Interactive graphic states
  const [blanketDropped, setBlanketDropped] = useState(false);
  const [poppedBalloons, setPoppedBalloons] = useState<boolean[]>([false, false, false, false, false, false]);

  const floatingShapes = [
    { char: "🎮", color: "bg-[#FACC15]", x: "6%", y: "22%", rot: -15 },
    { char: "🎲", color: "bg-[#38BDF8]", x: "88%", y: "28%", rot: 12 },
    { char: "⭐", color: "bg-[#F59E0B]", x: "5%", y: "72%", rot: 8 },
    { char: "🎈", color: "bg-[#F472B6]", x: "86%", y: "62%", rot: -10 },
  ];

  const blanketSteps = [
    "Split the group into two large halves facing each other.",
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

  // Synthesize chiptune sound effects using Web Audio API
  const playSynthSound = (freq: number, duration: number, type: OscillatorType = "sine") => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn(e);
    }
  };

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
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5
      } else {
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
    playSynthSound(440, 0.12, "triangle");
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

  const handleBalloonClick = (idx: number) => {
    if (poppedBalloons[idx]) return;
    const newPopped = [...poppedBalloons];
    newPopped[idx] = true;
    setPoppedBalloons(newPopped);
    // Pop chiptune noise sound
    playSynthSound(1200, 0.08, "sawtooth");
  };

  const handleResetBalloons = () => {
    setPoppedBalloons([false, false, false, false, false, false]);
    playSynthSound(600, 0.15, "sine");
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

      {/* Console Header Panel */}
      <header className="gsap-reveal max-w-5xl mx-auto mt-8 px-4 sm:px-6 relative z-20">
        <div className="terminal-header brutal-box bg-[#18181B] text-white p-6 sm:p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_#000] relative">
          <div className="screw top-3 left-3"></div>
          <div className="screw top-3 right-3"></div>
          <div className="screw bottom-3 left-3"></div>
          <div className="screw bottom-3 right-3"></div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link
              href="/"
              className="brutal-box bg-[#FFFDF5] text-black font-black uppercase text-xs px-4 py-2.5 border-2 border-black hover:bg-[#FACC15] transition-all shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] cursor-pointer"
            >
              ← ESC BACK
            </Link>

            <h1 className="brutal-font text-3xl sm:text-5xl text-[#FACC15] drop-shadow-[3px_3px_0px_#000] uppercase tracking-wider inline-flex items-center gap-3">
              <GameIcon className="w-10 h-8 text-[#FACC15]" />
              GAME RULES
            </h1>

            {/* LED Status Panel */}
            <div className="flex items-center gap-2.5 bg-black p-2.5 border border-zinc-800 rounded-lg">
              <div className="flex flex-col items-center gap-0.5">
                <span className="w-2 h-2 rounded-full led-green led-glow-green"></span>
                <span className="text-[6px] text-zinc-500 font-bold uppercase">SYS</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="w-2 h-2 rounded-full led-yellow led-glow-yellow animate-pulse"></span>
                <span className="text-[6px] text-zinc-500 font-bold uppercase">VIDEO</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid: Interactive rule board */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        
        <section className="space-y-8 gsap-reveal">
          
          {/* Tab Navigation buttons */}
          <div className="flex gap-3 relative z-10 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => handleTabChange("blanket")}
              className={`brutal-font text-sm sm:text-base px-6 py-4 uppercase border-4 border-black border-b-0 rounded-t-2xl transition-all duration-200 shadow-[4px_0_0_#000] cursor-pointer whitespace-nowrap ${
                activeTab === "blanket"
                  ? "bg-[#FACC15] text-black h-15 -translate-y-1.5"
                  : "bg-zinc-800 text-zinc-400 border-black hover:bg-zinc-700 hover:text-white h-13 mt-2"
              }`}
            >
              Blanket Name Game
            </button>
            <button
              onClick={() => handleTabChange("balloon")}
              className={`brutal-font text-sm sm:text-base px-6 py-4 uppercase border-4 border-black border-b-0 rounded-t-2xl transition-all duration-200 shadow-[4px_0_0_#000] cursor-pointer whitespace-nowrap ${
                activeTab === "balloon"
                  ? "bg-[#38BDF8] text-black h-15 -translate-y-1.5"
                  : "bg-zinc-800 text-zinc-400 border-black hover:bg-zinc-700 hover:text-white h-13 mt-2"
              }`}
            >
              Balloon Scatter
            </button>
          </div>

          {/* Interactive Steps Manual Console Board */}
          <article className="group relative z-20">
            <div className="bg-[#18181B] border-4 border-black border-b-0 py-5 px-6 flex items-center justify-between shadow-[8px_0px_0px_#000] rounded-t-2xl">
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
              className={`brutal-box p-6 sm:p-8 border-4 border-black shadow-[8px_8px_0px_#000] rounded-b-3xl relative min-h-[300px] flex flex-col justify-between transition-colors duration-300 ${
                activeTab === "blanket" ? "bg-[#FACC15]" : "bg-[#38BDF8]"
              }`}
            >
              {/* Corner accent decal */}
              <div className={activeTab === "blanket" ? "fold-corner-orange" : "fold-corner-blue"}></div>

              {/* Instructions Objective Header */}
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
                  <p className="text-lg sm:text-xl font-black text-black leading-snug">
                    {activeSteps[activeStep]}
                  </p>
                </div>
              </div>

              {/* Step Block progress bar indicators */}
              <div className="my-6">
                <div className="w-full h-4 bg-black/10 border-2 border-black rounded-full overflow-hidden p-0.5">
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
                  ◀ PREV
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
                  NEXT ▶
                </button>
              </div>
            </div>
          </article>

          {/* Interactive Game Illustration Device Card */}
          <div className="brutal-box bg-white text-black p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_#000] relative">
            <h3 className="brutal-font text-lg uppercase mb-4 text-black border-b-2 border-black pb-2">
              🛠️ TACTILE SCHEMATIC SIMULATOR
            </h3>

            {activeTab === "blanket" ? (
              // Blanket game schematic drop simulator
              <div className="space-y-4">
                <p className="text-xs font-bold text-zinc-600 uppercase">
                  Click the console button below to drop the blanket partition and simulate matching reflex speed:
                </p>
                <div className="h-44 border-4 border-black rounded-2xl bg-[#FFFDF5] relative overflow-hidden flex items-center justify-around p-4 shadow-[inner_0_4px_8px_rgba(0,0,0,0.1)]">
                  {/* Player Left */}
                  <div className="text-center flex flex-col items-center gap-1 z-0">
                    <span className="text-4xl">🤠</span>
                    <span className="font-mono text-[9px] bg-black text-[#FFFDF5] px-1.5 py-0.5 uppercase border border-black font-bold">ALEX</span>
                  </div>

                  {/* Partition Blanket */}
                  <div
                    className="absolute inset-y-0 w-8 bg-black border-x-2 border-[#FACC15] flex flex-col items-center justify-center text-white z-10 transition-all duration-500 ease-in-out"
                    style={{
                      transform: blanketDropped ? "translateY(90%)" : "translateY(0%)",
                      opacity: blanketDropped ? 0.3 : 1
                    }}
                  >
                    <span className="text-[10px] font-mono rotate-90 tracking-widest font-black uppercase text-center w-max">
                      BLANKET
                    </span>
                  </div>

                  {/* Player Right */}
                  <div className="text-center flex flex-col items-center gap-1 z-0">
                    <span className="text-4xl">👾</span>
                    <span className="font-mono text-[9px] bg-black text-[#FFFDF5] px-1.5 py-0.5 uppercase border border-black font-bold">SARAH</span>
                  </div>

                  {/* Win text indicator overlay */}
                  {blanketDropped && (
                    <div className="absolute inset-0 bg-[#4ADE80]/80 z-20 flex flex-col items-center justify-center animate-in fade-in zoom-in-75 duration-200">
                      <span className="brutal-font text-2xl uppercase tracking-wider text-black brutal-text-glow-yellow">
                        &quot;ALEX!&quot; 📢
                      </span>
                      <span className="text-[10px] font-mono font-black uppercase text-black/80 mt-1">
                        🤠 ALEX REACTED FIRST! WINNER (+100 PTS)
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setBlanketDropped(!blanketDropped);
                      playSynthSound(blanketDropped ? 400 : 700, 0.15, "square");
                    }}
                    className={`brutal-font text-xs px-5 py-3 border-2 border-black uppercase shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] cursor-pointer ${
                      blanketDropped ? "bg-[#EF4444] text-white" : "bg-[#4ADE80] text-black"
                    }`}
                  >
                    {blanketDropped ? "RE-ARM BLANKET 🛡️" : "DROP BLANKET NOW! 🔴"}
                  </button>
                </div>
              </div>
            ) : (
              // Balloon scatter game pop simulator
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-zinc-600 uppercase">
                    Interactive Grid: Click the balloons to scatter/pop and find teammate names:
                  </p>
                  <button
                    onClick={handleResetBalloons}
                    className="text-[9px] font-mono font-black uppercase bg-zinc-200 border border-black px-2 py-0.5 hover:bg-zinc-300"
                  >
                    Reset Grid 🔄
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 border-4 border-black rounded-2xl bg-zinc-50 shadow-[inner_0_4px_8px_rgba(0,0,0,0.05)] min-h-[176px]">
                  {[
                    { color: "bg-red-500", name: "JASON" },
                    { color: "bg-blue-500", name: "VICTOR" },
                    { color: "bg-yellow-400", name: "LEMUEL" },
                    { color: "bg-pink-400", name: "ESTHER" },
                    { color: "bg-green-400", name: "SHARON" },
                    { color: "bg-orange-400", name: "MICHAEL" },
                  ].map((balloon, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleBalloonClick(idx)}
                      disabled={poppedBalloons[idx]}
                      className="flex flex-col items-center justify-center p-2 relative outline-none select-none cursor-pointer group"
                    >
                      {!poppedBalloons[idx] ? (
                        <div className="flex flex-col items-center transition-transform group-hover:translate-y-[-6px] duration-200">
                          {/* Balloon body */}
                          <div className={`w-12 h-14 rounded-full border-2 border-black ${balloon.color} relative flex items-center justify-center shadow-[2px_2px_0px_#000]`}>
                            <span className="text-[7px] font-mono font-black text-black select-none tracking-tighter truncate w-10 text-center">
                              {balloon.name}
                            </span>
                            {/* Balloon glare */}
                            <div className="absolute top-1 left-2.5 w-2 h-4 bg-white/40 rounded-full"></div>
                          </div>
                          {/* Balloon knot */}
                          <div className="w-2 h-1 bg-black"></div>
                          {/* Balloon string */}
                          <div className="w-0.5 h-6 bg-zinc-400 border-dashed border-black/30 border"></div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-20 animate-in zoom-in-50 duration-150">
                          <span className="text-xl">💥</span>
                          <span className="text-[10px] font-black uppercase text-[#EF4444] font-mono mt-0.5">
                            POP!
                          </span>
                          <span className="text-[8px] font-mono text-zinc-500 uppercase">
                            ({balloon.name})
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

      </main>

      <section className="gsap-reveal max-w-5xl mx-auto px-4 sm:px-6 pb-24 relative z-10" aria-labelledby="video-briefing-title">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
          <div>
            <p className="font-mono text-[10px] sm:text-xs font-black uppercase tracking-[0.22em] text-[#FACC15] mb-2">
              Stage briefing / 34 seconds
            </p>
            <h2 id="video-briefing-title" className="brutal-font text-3xl sm:text-5xl uppercase text-white leading-none">
              Watch before<br className="sm:hidden" /> the whistle
            </h2>
          </div>
          <div className="self-start sm:self-auto bg-[#FACC15] text-black border-4 border-black shadow-[5px_5px_0px_#000] px-4 py-3 font-mono text-xs font-black uppercase tracking-wider -rotate-1">
            ▶ GAME REEL LOADED
          </div>
        </div>

        <div className="border-4 border-black bg-[#38BDF8] p-3 sm:p-5 shadow-[12px_12px_0px_#000] relative">
          <div className="absolute -top-4 right-5 bg-[#EF4444] text-white border-4 border-black px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-wider shadow-[3px_3px_0px_#000]">
            ● Now playing
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1.65fr)_minmax(270px,0.75fr)] gap-5 items-stretch">
            <div className="bg-black border-4 border-black shadow-[6px_6px_0px_#000]">
              <div className="flex items-center justify-between gap-3 bg-[#18181B] px-3 py-2 border-b-2 border-zinc-700 font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-zinc-300">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse"></span> Cellgroup games zone</span>
                <span className="text-[#FACC15]">16:9 / HD</span>
              </div>
              <div className="crt-overlay relative aspect-video bg-black">
                <video
                  className="w-full h-full object-contain block relative z-0"
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label="Cellgroup Games Zone introduction video"
                >
                  <source src="/assets/videos/games-demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            <aside className="bg-[#FFFDF5] text-black border-4 border-black p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-12 h-12 bg-[#FACC15] border-l-4 border-b-4 border-black clip-path-[polygon(100%_0,0_0,100%_100%)]"></div>
              <div>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 mb-3">Host cue</p>
                <h3 className="brutal-font text-2xl sm:text-3xl leading-[0.95] uppercase">Show this while teams get ready.</h3>
                <p className="mt-4 font-bold text-sm leading-relaxed text-zinc-700">
                  The reel shows the action, then the rules land one move at a time—clear enough for the back of the room.
                </p>
              </div>

              <ol className="mt-6 border-t-4 border-black pt-4 space-y-3">
                <li className="flex gap-3 items-start">
                  <span className="game-token !w-9 !h-9 !text-base !mr-0 bg-[#FACC15]">1</span>
                  <span><strong className="block font-black uppercase text-sm">Blanket Name</strong><span className="font-mono text-[10px] uppercase text-zinc-600">Spot · drop · shout</span></span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="game-token !w-9 !h-9 !text-base !mr-0 bg-[#38BDF8]">2</span>
                  <span><strong className="block font-black uppercase text-sm">Balloon Scatter</strong><span className="font-mono text-[10px] uppercase text-zinc-600">Name · find · sit</span></span>
                </li>
              </ol>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
