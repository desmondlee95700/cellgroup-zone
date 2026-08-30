"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { CartoonAnimalIcon } from "../CartoonAnimalIcon";

export interface StoryActTheme {
  avatarBg: string;
  screenBg: string;
  tabActiveBg: string;
  ribbonColor: string;
  cursorColor: string;
  progressGradient: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
}

export interface StoryAct {
  id: string;
  actTitle: string;
  subtitle: string;
  gameTag: string;
  narrativeText: string;
  animal: string;
  emoji: string;
  theme: StoryActTheme;
}

export const STORY_ACTS: StoryAct[] = [
  {
    id: "act-1",
    actTitle: "Act I: Get the Name Right",
    subtitle: "Game 1 Storyline",
    gameTag: "Get the Name Right 🦁",
    animal: "lion",
    emoji: "🦁",
    narrativeText:
      "Once upon a time, the Lion King was preparing for a banquet party! 🦁\n\n" +
      "He invited four different herds from across the jungle to come and celebrate with him.\n\n" +
      "When all four herds arrived, the Lion King warmly welcomed everyone.\n\n" +
      "The Lion King asked everyone to introduce themselves and remember each other's names.",
    theme: {
      avatarBg: "bg-[#F4B942]",
      screenBg: "bg-[#143525]",
      tabActiveBg: "bg-[#F4B942] text-[#243028]",
      ribbonColor: "text-[#F4B942]",
      cursorColor: "bg-[#F4B942]",
      progressGradient: "from-[#F4B942] to-[#F2A85B]",
      badgeBg: "bg-[#1D4A35]",
      badgeText: "text-[#FFF3C4]",
      accentColor: "#F4B942",
    },
  },
  {
    id: "act-2",
    actTitle: "Act II: Balloon River Crossing",
    subtitle: "Game 2 Storyline",
    gameTag: "Balloon River Crossing 🎈",
    animal: "elephant",
    emoji: "🎈",
    narrativeText:
      "The feast was ready, and the Lion King’s banquet was about to begin! 🦁🎂\n\n" +
      "The four herds were proudly crossing the river, carrying special gifts and balloons for the King. 🎈\n\n" +
      "Suddenly, disaster struck! A strong wind blew from the mountains, sending all the balloons into the rushing river and destroying the only bridge. 🌪️🌊\n\n" +
      "Now, the four herds are stuck on the other side.\n\n" +
      "They must work together, make new balloons, and cross the river safely to reach the banquet before it begins!",
    theme: {
      avatarBg: "bg-[#5CC8E8]",
      screenBg: "bg-[#0F2F3B]",
      tabActiveBg: "bg-[#5CC8E8] text-[#243028]",
      ribbonColor: "text-[#5CC8E8]",
      cursorColor: "bg-[#5CC8E8]",
      progressGradient: "from-[#5CC8E8] to-[#E8614D]",
      badgeBg: "bg-[#0B2530]",
      badgeText: "text-[#5CC8E8]",
      accentColor: "#5CC8E8",
    },
  },
];

interface StorylineNarratorProps {
  onSelectGame?: (gameKey: "game1" | "game2") => void;
  activeActId?: string;
  onActChange?: (actId: string) => void;
}

export function StorylineNarrator({ activeActId }: StorylineNarratorProps) {
  const [currentActIndex, setCurrentActIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [prevActiveActId, setPrevActiveActId] = useState(activeActId);

  // Synchronize activeActId prop directly during render
  if (activeActId !== prevActiveActId) {
    setPrevActiveActId(activeActId);
    if (activeActId) {
      const idx = STORY_ACTS.findIndex((a) => a.id === activeActId);
      if (idx !== -1 && idx !== currentActIndex) {
        setCurrentActIndex(idx);
        setDisplayedText("");
        setIsPlaying(true);
      }
    }
  }

  const activeAct = STORY_ACTS[currentActIndex] || STORY_ACTS[0];
  const { theme } = activeAct;

  // Web Audio Synth for Typewriter Click Sound
  const playTypewriterSound = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(580 + Math.random() * 220, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio playback fails gracefully if un-interacted
    }
  }, [isMuted]);

  // Typewriter Loop
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPlaying) return;

    const fullText = activeAct.narrativeText;
    if (displayedText.length >= fullText.length) {
      return;
    }

    const delay = 20;
    timerRef.current = setTimeout(() => {
      const nextChar = fullText[displayedText.length];
      setDisplayedText((prev) => {
        const nextText = prev + nextChar;
        if (nextText.length >= fullText.length) {
          setIsPlaying(false);
        }
        return nextText;
      });

      if (nextChar && nextChar.trim().length > 0 && displayedText.length % 2 === 0) {
        playTypewriterSound();
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [displayedText, isPlaying, activeAct.narrativeText, playTypewriterSound]);

  const handleTogglePlay = () => {
    if (!isPlaying && displayedText.length >= activeAct.narrativeText.length) {
      setDisplayedText("");
    }
    setIsPlaying((prev) => !prev);
  };

  const handleReplay = () => {
    setDisplayedText("");
    setIsPlaying(true);
  };

  const handleSkip = () => {
    setDisplayedText(activeAct.narrativeText);
    setIsPlaying(false);
  };

  const isFinished = displayedText.length >= activeAct.narrativeText.length;
  const progressPercent = Math.round((displayedText.length / activeAct.narrativeText.length) * 100);

  return (
    <section
      className="relative w-full overflow-hidden rounded-3xl border-5 border-[#243028] bg-gradient-to-b from-[#FFFDF5] to-[#FFF3C4] p-6 shadow-[12px_12px_0px_#243028] md:p-8 transition-colors duration-300"
      aria-label="Storyline Typewriter Narrator"
    >
      {/* Decorative Corner Brackets */}
      <div className="absolute top-3 left-3 h-4 w-4 border-t-4 border-l-4 border-[#243028]" />
      <div className="absolute top-3 right-3 h-4 w-4 border-t-4 border-r-4 border-[#243028]" />
      <div className="absolute bottom-3 left-3 h-4 w-4 border-b-4 border-l-4 border-[#243028]" />
      <div className="absolute bottom-3 right-3 h-4 w-4 border-b-4 border-r-4 border-[#243028]" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-[#243028] pb-5">
        <div className="flex items-center gap-4">
          {/* Animated Avatar with Dynamic Game Background */}
          <div
            className={`relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border-4 border-[#243028] ${theme.avatarBg} p-2 shadow-[4px_4px_0px_#243028] transition-colors duration-300`}
          >
            <CartoonAnimalIcon animal={activeAct.animal} />
            <span
              className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#243028] ${
                isPlaying ? "bg-[#5CC8E8] animate-ping" : "bg-[#B7DF77]"
              }`}
              title={isPlaying ? "Narrating..." : "Ready"}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-md border-2 border-[#243028] ${theme.badgeBg} ${theme.badgeText} px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase transition-colors duration-300`}
              >
                📜 FOREST GUARDIAN NARRATOR
              </span>

              {/* Animated Waveform Visualizer */}
              <div className="flex items-end gap-0.5 h-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all ${isPlaying ? "animate-pulse" : ""}`}
                    style={{
                      backgroundColor: theme.accentColor,
                      height: isPlaying ? `${[12, 6, 14, 8, 10][i]}px` : "4px",
                      animationDelay: `${i * 150}ms`,
                    }}
                  />
                ))}
              </div>
            </div>

            <h2 className="brutal-font mt-1 text-2xl text-[#243028] md:text-3xl">
              {activeAct.actTitle}
            </h2>
          </div>
        </div>
      </div>

      {/* Typewriter Display Screen with Dynamic Game Theme */}
      <div
        className={`relative my-6 rounded-2xl border-4 border-[#243028] ${theme.screenBg} p-6 text-[#FFF3C4] shadow-[8px_8px_0px_#243028] transition-colors duration-500`}
      >
        {/* Top Screen Status Ribbon */}
        <div className="mb-4 flex flex-wrap items-center justify-between border-b border-white/20 pb-2.5 text-xs font-black tracking-wider uppercase">
          <span className={`flex items-center gap-2 ${theme.ribbonColor}`}>
            <span className="h-2.5 w-2.5 rounded-full bg-[#B7DF77] animate-pulse" />
            STORY TRANSMISSION · {activeAct.gameTag}
          </span>
          <span className="text-[#5CC8E8]">
            PROGRESS: {progressPercent}% ({displayedText.length}/{activeAct.narrativeText.length})
          </span>
        </div>

        {/* Main Typewriter Text Content */}
        <div className="min-h-[120px] text-lg font-bold leading-relaxed text-[#FFF3C4] whitespace-pre-line md:text-xl">
          {displayedText}
          {!isFinished && (
            <span
              className={`ml-1 inline-block h-6 w-3.5 ${theme.cursorColor} align-middle shadow-[0_0_8px_currentColor] animate-pulse`}
            />
          )}
        </div>

        {/* Bottom Progress Bar inside screen */}
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full border-2 border-[#243028] bg-black/40">
          <div
            className={`h-full bg-gradient-to-r ${theme.progressGradient} transition-all duration-150`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`flex items-center gap-2 rounded-xl border-3 border-[#243028] ${theme.avatarBg} px-4 py-2.5 text-xs font-black uppercase text-[#243028] shadow-[3px_3px_0px_#243028] hover:opacity-90 active:translate-x-[2px] active:translate-y-[2px] transition-all`}
          >
            {isPlaying ? "⏸️ Pause Narrator" : isFinished ? "🔄 Replay Story" : "▶️ Resume Story"}
          </button>

          {/* Replay */}
          <button
            type="button"
            onClick={handleReplay}
            className="rounded-xl border-3 border-[#243028] bg-[#FFF3C4] px-3.5 py-2.5 text-xs font-black uppercase text-[#243028] shadow-[3px_3px_0px_#243028] hover:bg-zinc-100 active:translate-x-[2px] active:translate-y-[2px]"
          >
            ↺ Restart
          </button>

          {/* Skip Typewriter */}
          {!isFinished && (
            <button
              type="button"
              onClick={handleSkip}
              className="rounded-xl border-3 border-[#243028] bg-[#E8614D] px-3.5 py-2.5 text-xs font-black uppercase text-[#FFF3C4] shadow-[3px_3px_0px_#243028] hover:bg-rose-600 active:translate-x-[2px] active:translate-y-[2px]"
            >
              ⏩ Skip Typing
            </button>
          )}
        </div>

        {/* Audio Mute/Unmute */}
        <button
          type="button"
          onClick={() => setIsMuted((prev) => !prev)}
          className={`flex items-center gap-1.5 rounded-xl border-3 border-[#243028] px-3.5 py-2.5 text-xs font-black uppercase shadow-[3px_3px_0px_#243028] ${
            isMuted ? "bg-zinc-200 text-zinc-700" : "bg-[#B7DF77] text-[#243028]"
          }`}
        >
          {isMuted ? "🔇 Audio Off" : "🔊 Audio On"}
        </button>
      </div>
    </section>
  );
}
