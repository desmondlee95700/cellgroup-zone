"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { GlobalFullscreenToggle } from "@/components/GlobalFullscreenToggle";
import { StorylineNarrator } from "@/components/games/StorylineNarrator";
import { Game1NameChallenge } from "@/components/games/Game1NameChallenge";
import { Game2RiverCrossing } from "@/components/games/Game2RiverCrossing";

type SelectedGameKey = "game1" | "game2";

export default function GamesHubPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const storylineRef = useRef<HTMLDivElement>(null);
  const dossierRef = useRef<HTMLElement>(null);
  const [activeGame, setActiveGame] = useState<SelectedGameKey>("game1");
  const [isDockMinimized, setIsDockMinimized] = useState(true);

  useGSAP(
    () => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.fromTo(
        ".field-reveal",
        { y: reducedMotion ? 0 : 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: reducedMotion ? 0 : 0.52,
          stagger: reducedMotion ? 0 : 0.08,
          ease: "power2.out",
          clearProps: "all",
        }
      );
    },
    { scope: containerRef }
  );

  const scrollToStoryline = () => {
    storylineRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToDossier = (gameKey: SelectedGameKey) => {
    setActiveGame(gameKey);
    dossierRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      ref={containerRef}
      className={`relative min-h-screen overflow-x-hidden text-[#FFF3C4] selection:bg-[#F4B942] selection:text-[#243028] transition-colors duration-700 ${
        activeGame === "game1" ? "safari-canopy-game1" : "safari-canopy-game2"
      }`}
    >
      {/* Background Safari Sun & Dynamic Lighting Glow */}
      <div
        className={`safari-basecamp-sun pointer-events-none transition-all duration-700 ${
          activeGame === "game1" ? "safari-sun-game1" : "safari-sun-game2"
        }`}
        aria-hidden="true"
      />
      <div className="safari-basecamp-hills safari-basecamp-hills-back" aria-hidden="true" />
      <div className="safari-basecamp-hills safari-basecamp-hills-front" aria-hidden="true" />

      {/* Drifting Jungle Leaves Particle Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden="true">
        <span className="safari-leaf-particle">🍃</span>
        <span className="safari-leaf-particle">🌿</span>
        <span className="safari-leaf-particle">🍂</span>
        <span className="safari-leaf-particle">🍃</span>
        <span className="safari-leaf-particle">🌿</span>
      </div>

      {/* Top Safari Expedition Navigation Bar */}
      <header className="safari-mixer-nav-wrap relative z-50 pt-4 px-4 md:px-8">
        <div className="safari-mixer-nav">
          <Link href="/home" className="safari-mixer-back">
            Back to basecamp
          </Link>
          <div className="safari-mixer-brand text-center">
            <h1 className="brutal-font text-sm md:text-base text-[#243028] leading-tight uppercase">
              <span><small>Animal Kingdom</small> Expedition Games</span>
            </h1>
          </div>
          <div className="safari-mixer-nav-actions">
            <GlobalFullscreenToggle />
            <span className="safari-camp-status">
              <i aria-hidden="true" />
              EXPEDITION ACTIVE
            </span>
          </div>
        </div>
      </header>

      {/* Main Expedition Content */}
      <main className="relative z-10 mx-auto max-w-7xl space-y-10 px-4 py-8 md:px-8 pb-28">
        {/* Scenic Animal Kingdom Ranger Plaque Hero with Tactile Stamp */}
        <section className="field-reveal relative overflow-hidden rounded-3xl border-5 border-[#243028] bg-[#FFF3C4] p-6 text-[#243028] shadow-[12px_12px_0px_#243028] md:p-10">
          {/* Hero Stamp Overlay */}
          <div className="absolute right-4 top-4 pointer-events-none hidden sm:block">
            <div className="-rotate-3 rounded-xl border-4 border-dashed border-[#243028] bg-[#F4B942] px-3.5 py-1.5 text-xs font-black uppercase text-[#243028] shadow-[3px_3px_0px_#243028]">
              ★ VICTOR ZONE GATHERING 2026
            </div>
          </div>

          <div className="max-w-3xl">
            <h1 className="brutal-font text-4xl text-[#243028] md:text-6xl">
              Jungle Expedition Games
            </h1>
            <p className="mt-2 text-base font-bold text-[#243028]">
              Official rules, match setups, and live telegraph dispatches for the Victor Zone Gathering on 5 September 2026.
            </p>
          </div>
        </section>

        {/* Storyline Typewriter Narrator Stage */}
        <div ref={storylineRef} className="field-reveal">
          <StorylineNarrator
            activeActId={activeGame === "game1" ? "act-1" : "act-2"}
          />
        </div>

        {/* Game Dossier Selector Tabs */}
        <section ref={dossierRef} className="field-reveal space-y-6" aria-label="Game Dossiers">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="brutal-font text-3xl text-[#FFF3C4]">
              Select Game Dossier
            </h2>

            <div className="flex flex-wrap gap-3" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeGame === "game1"}
                onClick={() => setActiveGame("game1")}
                className={`rounded-2xl border-4 border-[#243028] px-6 py-3.5 text-sm font-black uppercase transition-all ${
                  activeGame === "game1"
                    ? "bg-[#F4B942] text-[#243028] shadow-[6px_6px_0px_#243028] translate-x-[-2px] translate-y-[-2px]"
                    : "bg-[#FFF3C4] text-[#243028] hover:bg-amber-100 shadow-[3px_3px_0px_#243028]"
                }`}
              >
                🦁 Game 1: Get Name Right
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeGame === "game2"}
                onClick={() => setActiveGame("game2")}
                className={`rounded-2xl border-4 border-[#243028] px-6 py-3.5 text-sm font-black uppercase transition-all ${
                  activeGame === "game2"
                    ? "bg-[#5CC8E8] text-[#243028] shadow-[6px_6px_0px_#243028] translate-x-[-2px] translate-y-[-2px]"
                    : "bg-[#FFF3C4] text-[#243028] hover:bg-sky-100 shadow-[3px_3px_0px_#243028]"
                }`}
              >
                🎈 Game 2: Balloon River Crossing
              </button>
            </div>
          </div>

          {/* Active Game Dossier Render */}
          <div role="tabpanel">
            {activeGame === "game1" ? <Game1NameChallenge /> : <Game2RiverCrossing />}
          </div>
        </section>
      </main>

      {/* Floating Tactical Expedition Action Dock with Initial Hidden (Minimized) PIP State */}
      {isDockMinimized ? (
        <aside className="fixed bottom-4 right-4 z-50">
          <button
            type="button"
            onClick={() => setIsDockMinimized(false)}
            className="flex items-center gap-2 rounded-2xl border-4 border-[#243028] bg-[#F4B942] px-4 py-2.5 text-xs font-black uppercase text-[#243028] shadow-[5px_5px_0px_#243028] hover:bg-yellow-400 active:translate-x-[2px] active:translate-y-[2px] transition-all"
            title="Expand Expedition Action Dock"
          >
            <span>🧭 Expedition Dock</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-lg border-2 border-[#243028] bg-[#FFF3C4] text-[10px] font-black">
              ▲
            </span>
          </button>
        </aside>
      ) : (
        <aside
          className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-wrap items-center justify-center sm:justify-end gap-2 rounded-2xl border-4 border-[#243028] bg-[#FFF3C4] p-2.5 shadow-[6px_6px_0px_#243028] transition-all"
          aria-label="Expedition Tactical Dock"
        >
          <button
            type="button"
            onClick={scrollToStoryline}
            className="rounded-xl border-2 border-[#243028] bg-[#B7DF77] px-3 py-1.5 text-xs font-black uppercase text-[#243028] shadow-[2px_2px_0px_#243028] hover:bg-lime-400 active:translate-x-[1px] active:translate-y-[1px]"
          >
            📜 Storyline
          </button>

          <button
            type="button"
            onClick={() => scrollToDossier("game1")}
            className={`rounded-xl border-2 border-[#243028] px-3 py-1.5 text-xs font-black uppercase text-[#243028] shadow-[2px_2px_0px_#243028] transition-all ${
              activeGame === "game1" ? "bg-[#F4B942]" : "bg-white hover:bg-amber-50"
            }`}
          >
            🦁 Game 1
          </button>

          <button
            type="button"
            onClick={() => scrollToDossier("game2")}
            className={`rounded-xl border-2 border-[#243028] px-3 py-1.5 text-xs font-black uppercase text-[#243028] shadow-[2px_2px_0px_#243028] transition-all ${
              activeGame === "game2" ? "bg-[#5CC8E8]" : "bg-white hover:bg-sky-50"
            }`}
          >
            🎈 Game 2
          </button>

          <Link
            href="/showcase/standings"
            className="rounded-xl border-2 border-[#243028] bg-[#F4B942] px-3 py-1.5 text-xs font-black uppercase text-[#243028] shadow-[2px_2px_0px_#243028] hover:bg-yellow-400 active:translate-x-[1px] active:translate-y-[1px]"
          >
            🏆 Standings
          </Link>

          {/* Admin Only Link to Herd Mixer */}
          <Link
            href="/mixer"
            className="flex items-center gap-1.5 rounded-xl border-2 border-[#243028] bg-[#E8614D] px-3 py-1.5 text-xs font-black uppercase text-[#FFF3C4] shadow-[2px_2px_0px_#243028] hover:bg-rose-600 active:translate-x-[1px] active:translate-y-[1px]"
            title="Staff & MC Admin Lodge Access"
          >
            <span>🔑 Ranger Lodge</span>
            <span className="rounded border border-[#243028] bg-black/40 px-1.5 py-0.2 text-[9px] font-black text-[#FFF3C4]">
              ADMIN ONLY 🔒
            </span>
          </Link>

          {/* Minimize PIP Button */}
          <button
            type="button"
            onClick={() => setIsDockMinimized(true)}
            className="flex h-7 w-7 items-center justify-center rounded-xl border-2 border-[#243028] bg-zinc-200 text-xs font-black text-[#243028] shadow-[2px_2px_0px_#243028] hover:bg-zinc-300 active:translate-x-[1px] active:translate-y-[1px] ml-1"
            title="Minimize Action Dock (PIP Mode)"
            aria-label="Minimize Action Dock"
          >
            ▼
          </button>
        </aside>
      )}

      {/* Safari Expedition Footer */}
      <footer className="relative z-10 mt-16 border-t-4 border-[#243028] bg-[#143525] py-8 text-[#FFF3C4]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 text-xs font-bold md:px-8">
          <div>
            <strong className="brutal-font text-[#F4B942]">ANIMAL KINGDOM EXPEDITION 2026</strong>
            <span className="ml-2 text-emerald-200">· Victor Zone Gathering · 5 September 2026</span>
          </div>
          <div className="flex gap-4">
            <Link href="/home" className="hover:text-[#F4B942] underline">
              Basecamp Map
            </Link>
            <Link href="/mixer" className="hover:text-[#F4B942] underline">
              Herd Mixer (Admin)
            </Link>
            <Link href="/showcase" className="hover:text-[#F4B942] underline">
              Team Finder
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
