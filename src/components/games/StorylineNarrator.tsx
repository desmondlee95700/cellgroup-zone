"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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

export interface AudioSyncPoint {
  /** Timestamp in seconds when this phrase starts being spoken */
  start: number;
  /** Timestamp in seconds when this phrase finishes being spoken */
  end: number;
  /** Character position in narrativeText where this phrase begins */
  charStart: number;
  /** Character position in narrativeText to reveal up to when this phrase completes */
  charEnd: number;
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
  /** Path to pre-recorded narration audio (in /public) */
  audioSrc?: string;
  /** Phrase-level sync points mapping audio timestamps to text positions */
  audioSync?: AudioSyncPoint[];
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
      "The Lion King asked everyone to introduce themselves and to remember each other's names.",
    audioSrc: "/audio/act1-narration.mp3",
    audioSync: [
      { start: 0, end: 4.67, charStart: 0, charEnd: 69 },
      { start: 5.79, end: 10.20, charStart: 71, charEnd: 157 },
      { start: 11.39, end: 15.24, charStart: 159, charEnd: 227 },
      { start: 16.09, end: 20.53, charStart: 229, charEnd: 317 },
    ],
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
      "The feast was ready, and the Lion King's banquet was about to begin! 🦁🎂\n\n" +
      "The four herds were proudly crossing the river, carrying special gifts and balloons for the King. 🎈\n\n" +
      "Suddenly, disaster struck! A strong wind blew from the mountains, sending all the balloons into the rushing river and destroying the only bridge. 🌪️🌊\n\n" +
      "Now, the four herds are stuck on the other side.\n\n" +
      "They must work together, make new balloons, and cross the river safely to reach the banquet before it begins!",
    audioSrc: "/audio/act2-narration.mp3",
    audioSync: [
      { start: 0, end: 3.27, charStart: 0, charEnd: 73 },
      { start: 4.15, end: 9.17, charStart: 75, charEnd: 175 },
      { start: 10.06, end: 17.28, charStart: 177, charEnd: 328 },
      { start: 18.13, end: 20.52, charStart: 330, charEnd: 378 },
      { start: 21.16, end: 26.96, charStart: 380, charEnd: 489 },
    ],
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
  const [revealedWordCount, setRevealedWordCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [prevActiveActId, setPrevActiveActId] = useState(activeActId);

  // How far the voice has reached in the *original* text
  const voiceTargetRef = useRef(0);
  const voiceStartedRef = useRef(false);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Tick counter to force re-renders while polling for voice target
  const [pollTick, setPollTick] = useState(0);
  // HTML5 Audio ref for pre-recorded narration
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Speech synthesis refs (fallback when no audioSrc)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Synchronize activeActId prop directly during render (PR #23 pattern)
  if (activeActId !== prevActiveActId) {
    setPrevActiveActId(activeActId);
    if (activeActId) {
      const idx = STORY_ACTS.findIndex((a) => a.id === activeActId);
      if (idx !== -1 && idx !== currentActIndex) {
        setCurrentActIndex(idx);
        setRevealedWordCount(0);
        setIsPlaying(false);
      }
    }
  }

  const activeAct = STORY_ACTS[currentActIndex] || STORY_ACTS[0];
  const { theme } = activeAct;
  const hasPrerecorded = !!activeAct.audioSrc && !!activeAct.audioSync;

  // Pre-split narrative into words, preserving whitespace structure
  const words = useMemo(() => {
    const result: { word: string; trailing: string }[] = [];
    const regex = /(\S+)(\s*)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(activeAct.narrativeText)) !== null) {
      result.push({ word: match[1], trailing: match[2] });
    }
    return result;
  }, [activeAct.narrativeText]);

  const totalWords = words.length;
  const isFinished = revealedWordCount >= totalWords;
  const progressPercent = Math.round((revealedWordCount / totalWords) * 100);

  // Stop playing when all words are revealed (render-time, avoids effect setState)
  if (isFinished && isPlaying) {
    setIsPlaying(false);
  }

  // Cumulative char count at start of each word
  const wordCharStarts = useMemo(() => {
    let pos = 0;
    return words.map(({ word, trailing }) => {
      const start = pos;
      pos += word.length + trailing.length;
      return start;
    });
  }, [words]);

  // Convert a char position to how many words should be revealed
  const charPosToWordCount = useCallback((charPos: number) => {
    let count = 0;
    for (const start of wordCharStarts) {
      if (charPos >= start) count++;
      else break;
    }
    return count;
  }, [wordCharStarts]);

  // Load available voices (only needed for speech synthesis fallback)
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
      const otherVoices = voices.filter((v) => !v.lang.startsWith("en"));
      setAvailableVoices([...englishVoices, ...otherVoices]);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // ── Pre-recorded audio: start playback (called from click handlers) ──
  const startPrerecordedAudio = useCallback(() => {
    if (!activeAct.audioSrc) return;

    if (!audioRef.current || audioRef.current.src !== activeAct.audioSrc) {
      audioRef.current = new Audio(activeAct.audioSrc);
    }
    const audio = audioRef.current;
    audio.currentTime = 0;
    voiceTargetRef.current = 0;

    const syncPoints = activeAct.audioSync || [];

    const syncAudio = () => {
      const t = audio.currentTime;
      let target = 0;

      for (const sp of syncPoints) {
        if (t < sp.start) {
          break;
        } else if (t >= sp.start && t <= sp.end) {
          const speechDuration = sp.end - sp.start;
          const elapsed = t - sp.start;
          const progress = Math.min(elapsed / speechDuration, 1);
          const phraseChars = sp.charEnd - sp.charStart;
          target = Math.floor(sp.charStart + phraseChars * progress);
          break;
        } else {
          target = sp.charEnd;
        }
      }

      if (target > voiceTargetRef.current) {
        voiceTargetRef.current = target;
        setPollTick((tick) => tick + 1);
      }
    };

    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    syncIntervalRef.current = setInterval(() => {
      if (!audio.paused && !audio.ended) syncAudio();
    }, 50);

    audio.onended = () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      voiceTargetRef.current = activeAct.narrativeText.length;
      setPollTick((tick) => tick + 1);
    };

    voiceStartedRef.current = true;
    audio.play().catch(() => {});
  }, [activeAct]);

  // ── Speech synthesis fallback: start narration (called from click handlers) ──
  const startSynthesisVoice = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const original = activeAct.narrativeText;
    const cleanText = original
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ");

    const wordEndPositions: number[] = [];
    const wordRegex = /\S+/g;
    let match: RegExpExecArray | null;
    while ((match = wordRegex.exec(original)) !== null) {
      let endPos = match.index + match[0].length;
      while (endPos < original.length && /[\s\u{1F000}-\u{1FFFF}]/u.test(original[endPos])) {
        endPos++;
      }
      wordEndPositions.push(endPos);
    }
    voiceTargetRef.current = 0;

    const cleanWords: { start: number; end: number }[] = [];
    const cleanWordRegex = /\S+/g;
    let cm: RegExpExecArray | null;
    while ((cm = cleanWordRegex.exec(cleanText)) !== null) {
      cleanWords.push({ start: cm.index, end: cm.index + cm[0].length });
    }

    const utt = new SpeechSynthesisUtterance(cleanText);
    utt.rate = 0.9;
    utt.pitch = 1.0;
    utt.volume = 1.0;
    if (availableVoices.length > 0) {
      utt.voice = availableVoices[selectedVoiceIndex] || availableVoices[0];
    }

    utt.onboundary = (event) => {
      if (event.name === "word" || event.name === "sentence") {
        const ci = event.charIndex;
        let wordIdx = cleanWords.findIndex((w) => ci >= w.start && ci < w.end);
        if (wordIdx === -1) {
          wordIdx = cleanWords.findIndex((w) => w.start >= ci);
          if (wordIdx === -1) wordIdx = cleanWords.length - 1;
        }
        const endPos = wordEndPositions[Math.min(wordIdx, wordEndPositions.length - 1)];
        if (endPos !== undefined && endPos > voiceTargetRef.current) {
          voiceTargetRef.current = endPos;
          setPollTick((t) => t + 1);
        }
      }
    };

    utt.onend = () => {
      voiceTargetRef.current = original.length;
      setPollTick((t) => t + 1);
    };

    utteranceRef.current = utt;
    voiceStartedRef.current = true;
    window.speechSynthesis.speak(utt);
  }, [activeAct.narrativeText, availableVoices, selectedVoiceIndex]);

  // ── Unified start voice (picks pre-recorded or synthesis) ──
  const startVoiceover = useCallback(() => {
    if (hasPrerecorded) {
      startPrerecordedAudio();
    } else {
      startSynthesisVoice();
    }
  }, [hasPrerecorded, startPrerecordedAudio, startSynthesisVoice]);

  // ── Stop all audio ──
  const stopAllAudio = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    voiceStartedRef.current = false;
  }, []);

  // ── Pause/resume voice ──
  const pauseVoice = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
    if (audioRef.current && hasPrerecorded) {
      audioRef.current.pause();
    } else if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  }, [hasPrerecorded]);

  const resumeVoice = useCallback(() => {
    if (audioRef.current && hasPrerecorded) {
      audioRef.current.play().catch(() => {});
    } else if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  }, [hasPrerecorded]);

  // Cancel audio on unmount or act change
  useEffect(() => {
    return () => { stopAllAudio(); };
  }, [currentActIndex, stopAllAudio]);

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

  // Word-by-word reveal loop — voice-synced or fixed-rate
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPlaying) return;

    if (voiceEnabled && voiceStartedRef.current) {
      // Voice-synced: reveal words up to where the voice has reached
      const targetWordCount = charPosToWordCount(voiceTargetRef.current);
      if (revealedWordCount < targetWordCount) {
        timerRef.current = setTimeout(() => {
          setRevealedWordCount((prev) => prev + 1);
          playTypewriterSound();
        }, 40); // fast catch-up, one word per 40ms
      } else {
        // Polling — wait for voice to advance
        timerRef.current = setTimeout(() => {
          setPollTick((t) => t + 1);
        }, 30);
      }
    } else {
      // Fixed-rate: one word every ~120ms
      timerRef.current = setTimeout(() => {
        setRevealedWordCount((prev) => {
          const next = prev + 1;
          if (next >= totalWords) setIsPlaying(false);
          return next;
        });
        playTypewriterSound();
      }, 120);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [revealedWordCount, isPlaying, activeAct, playTypewriterSound, voiceEnabled, pollTick, isFinished, totalWords, charPosToWordCount]);

  const handleTogglePlay = () => {
    if (!isPlaying && isFinished) {
      setRevealedWordCount(0);
      stopAllAudio();
      voiceTargetRef.current = 0;
      setIsPlaying(true);
      if (voiceEnabled) startVoiceover();
      return;
    }
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);
    if (nextPlaying && voiceEnabled && revealedWordCount === 0 && !voiceStartedRef.current) {
      startVoiceover();
    }
    if (voiceEnabled && voiceStartedRef.current) {
      if (nextPlaying) resumeVoice();
      else pauseVoice();
    }
  };

  const handleReplay = () => {
    stopAllAudio();
    voiceTargetRef.current = 0;
    setRevealedWordCount(0);
    setIsPlaying(true);
    if (voiceEnabled) startVoiceover();
  };

  const handleSkip = () => {
    setRevealedWordCount(totalWords);
    setIsPlaying(false);
    stopAllAudio();
  };

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
            PROGRESS: {progressPercent}% ({revealedWordCount}/{totalWords} words)
          </span>
        </div>

        {/* Main Word-by-Word Text Content */}
        <div className="min-h-[120px] text-lg font-bold leading-relaxed text-[#FFF3C4] whitespace-pre-line md:text-xl">
          {words.map((w, i) => (
            <React.Fragment key={i}>
              <span
                className={`transition-opacity duration-300 ease-in ${
                  i < revealedWordCount ? "opacity-100" : "opacity-0"
                }`}
              >
                {w.word}
              </span>
              <span className={i < revealedWordCount ? "opacity-100" : "opacity-0"}>
                {w.trailing}
              </span>
            </React.Fragment>
          ))}
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
            {isPlaying
              ? "⏸️ Pause Narrator"
              : isFinished
                ? "🔄 Replay Story"
                : revealedWordCount === 0
                  ? "▶️ Start Story"
                  : "▶️ Resume Story"}
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

        <div className="flex flex-wrap items-center gap-2">
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

          {/* Voiceover Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !voiceEnabled;
              setVoiceEnabled(next);
              if (!next) {
                stopAllAudio();
              }
            }}
            className={`flex items-center gap-1.5 rounded-xl border-3 border-[#243028] px-3.5 py-2.5 text-xs font-black uppercase shadow-[3px_3px_0px_#243028] ${
              voiceEnabled
                ? "bg-[#5CC8E8] text-[#243028]"
                : "bg-zinc-200 text-zinc-700"
            }`}
          >
            {voiceEnabled ? "🎙️ Voice On" : "🎙️ Voice Off"}
          </button>

          {/* Voice Selector (only for speech synthesis fallback, not pre-recorded) */}
          {voiceEnabled && !hasPrerecorded && availableVoices.length > 1 && (
            <select
              value={selectedVoiceIndex}
              onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
              className="rounded-xl border-3 border-[#243028] bg-[#FFF3C4] px-2 py-2 text-[10px] font-bold text-[#243028] shadow-[3px_3px_0px_#243028] max-w-[140px]"
            >
              {availableVoices.map((voice, i) => (
                <option key={`${voice.name}-${i}`} value={i}>
                  {voice.name.length > 20
                    ? voice.name.slice(0, 20) + "…"
                    : voice.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </section>
  );
}
