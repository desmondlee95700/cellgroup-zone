"use client";

import React, { useState, useEffect } from "react";

interface GlobalFullscreenToggleProps {
  className?: string;
  compact?: boolean;
}

export function GlobalFullscreenToggle({ className = "", compact = false }: GlobalFullscreenToggleProps) {
  const [isFullscreen, setIsFullscreen] = useState(() => (typeof document !== "undefined" ? !!document.fullscreenElement : false));

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen toggle error:", err);
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleFullscreen}
        className={`w-10 h-10 rounded-xl bg-[#38BDF8] text-black font-black border-3 border-black shadow-[3px_3px_0px_#000] hover:bg-sky-300 active:translate-y-0.5 flex items-center justify-center text-lg cursor-pointer transition-all ${className}`}
        title={isFullscreen ? "Exit Fullscreen" : "Full Screen"}
        aria-label="Toggle Fullscreen"
      >
        📺
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      className={`safari-nav-btn safari-fullscreen-btn ${className}`}
      title={isFullscreen ? "Exit Fullscreen Mode" : "Enter Fullscreen Mode across the webapp"}
    >
      <span>📺</span>
      <span>{isFullscreen ? "Exit Fullscreen" : "Full Screen"}</span>
    </button>
  );
}
