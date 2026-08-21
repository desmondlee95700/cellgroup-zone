"use client";

import React, { useState, useEffect } from "react";

export function GlobalFullscreenToggle({ className = "" }: { className?: string }) {
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
