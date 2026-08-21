"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { QRCodeSVG } from "qrcode.react";
import { CartoonAnimalIcon } from "@/components/CartoonAnimalIcon";
import { GlobalFullscreenToggle } from "@/components/GlobalFullscreenToggle";

type TrailMarkKind = "compass" | "games" | "herds" | "crown";

function TrailMark({ kind, className = "" }: { kind: TrailMarkKind; className?: string }) {
  if (kind === "compass") {
    return (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="25" fill="#F4B942" stroke="currentColor" strokeWidth="5" />
        <path d="m39 18-5 13-13 15 9-17 9-11Z" fill="#E8614D" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="32" cy="32" r="4" fill="#FFF3C4" stroke="currentColor" strokeWidth="3" />
      </svg>
    );
  }

  if (kind === "games") {
    return (
      <svg className={className} viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="51" cy="20" r="10" fill="#F4B942" stroke="currentColor" strokeWidth="4" />
        <path d="M7 56 26 24l14 18 8-10 17 24Z" fill="#6D974C" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <path d="m27 25 3 17 10 0" fill="none" stroke="#FFF3C4" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "herds") {
    return (
      <svg className={className} viewBox="0 0 72 72" aria-hidden="true">
        <path d="M8 54c9-13 19-18 28-15 9-11 20-12 29-4v23H8Z" fill="#5CC8E8" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="25" cy="27" r="10" fill="#F4B942" stroke="currentColor" strokeWidth="4" />
        <circle cx="47" cy="22" r="12" fill="#E8614D" stroke="currentColor" strokeWidth="4" />
        <path d="M25 38v15M47 34v19" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="50" cy="20" r="11" fill="#F4B942" stroke="currentColor" strokeWidth="4" />
      <path d="M6 57c15-4 22-16 29-35 5 16 11 25 31 35Z" fill="#A96238" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <path d="m24 29 11-12 11 12-4 13H28Z" fill="#FFF3C4" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
}

export default function SafariExperience({
  initialStage,
}: {
  initialStage: "gathering" | "exploring";
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const gateOverlayRef = useRef<HTMLDivElement>(null);

  const safariStage = initialStage;

  const [soundOn, setSoundOn] = useState(true);
  const [roster, setRoster] = useState<string[]>([]);
  const [showQrModal, setShowQrModal] = useState(false);

  // Close QR modal on Escape key
  useEffect(() => {
    if (!showQrModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowQrModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showQrModal]);

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

  const playCanopyOpeningSound = () => {
    if (!soundOn) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const playNote = (freq: number, start: number, duration: number, type: OscillatorType = "sine") => {
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
      playNote(392, now, 0.18, "triangle");
      playNote(523.25, now + 0.14, 0.18, "sine");
      playNote(659.25, now + 0.28, 0.46, "sine");
      playNote(196, now, 0.56, "triangle");
    } catch (e) {
      console.warn("Audio blocked", e);
    }
  };

  // Entrance reveal animation for the basecamp map.
  useEffect(() => {
    if (safariStage !== "exploring") return;

    const context = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(
        ".safari-basecamp-nav",
        { y: -28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.48, ease: "power2.out" }
      );
      tl.fromTo(
        ".safari-basecamp-hero > *",
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" },
        "-=0.18"
      );
      tl.fromTo(
        ".safari-map-stop, .safari-roll-call",
        { y: 36, opacity: 0, scale: 0.94 },
        { y: 0, opacity: 1, scale: 1, duration: 0.52, stagger: 0.1, ease: "back.out(1.2)", clearProps: "all" },
        "-=0.2"
      );
    }, containerRef);

    return () => context.revert();
  }, [safariStage]);

  // A grass-and-canopy wipe opens the reserve and reveals the expedition map.
  const enterSafariReserve = () => {
    if (!gateOverlayRef.current) return;

    playCanopyOpeningSound();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motionDuration = reducedMotion ? 0 : 0.52;

    const reserveTl = gsap.timeline({
      onComplete: () => {
        router.push("/home");
      },
    });

    reserveTl
      .to(gateOverlayRef.current.querySelector(".safari-foreground-fronds-left"), {
        xPercent: -68,
        rotation: -4,
        duration: motionDuration,
        ease: "power2.inOut",
      })
      .to(
        gateOverlayRef.current.querySelector(".safari-foreground-fronds-right"),
        {
          xPercent: 68,
          rotation: 4,
          duration: motionDuration,
          ease: "power2.inOut",
        },
        "<"
      )
      .to(gateOverlayRef.current.querySelector(".safari-welcome-sign"), {
      opacity: 0,
      y: -38,
      duration: reducedMotion ? 0 : 0.32,
      ease: "power2.in",
    }, "<+=0.1")
      .to(gateOverlayRef.current, {
        opacity: 0,
        duration: reducedMotion ? 0 : 0.18,
        ease: "power1.out",
      }, "<+=0.08");
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen text-[#243028] selection:bg-[#F4B942] selection:text-[#243028] overflow-x-hidden relative"
    >
      {/* Illustrated safari reserve arrival */}
      {safariStage !== "exploring" && (
        <div
          ref={gateOverlayRef}
          className="safari-arrival-stage fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-6"
        >
          <div className="safari-reserve-vista" aria-hidden="true">
            <svg viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice" role="presentation">
              <defs>
                <linearGradient id="safari-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#63c8e7" />
                  <stop offset="62%" stopColor="#f4b942" />
                  <stop offset="100%" stopColor="#f9d778" />
                </linearGradient>
                <linearGradient id="safari-hill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6d974c" />
                  <stop offset="100%" stopColor="#315b39" />
                </linearGradient>
              </defs>
              <rect width="1440" height="700" fill="url(#safari-sky)" />
              <circle className="safari-vista-sun" cx="1040" cy="215" r="112" fill="#fff3c4" stroke="#243028" strokeWidth="8" />
              <g className="safari-vista-birds" fill="none" stroke="#243028" strokeWidth="8" strokeLinecap="round">
                <path d="M790 168q17-16 34 0q17-16 34 0" />
                <path d="M880 130q13-12 26 0q13-12 26 0" />
                <path d="M1180 144q12-11 24 0q12-11 24 0" />
              </g>
              <path d="M0 410 C190 320 330 415 490 355 S785 374 930 340 S1210 378 1440 286 V700H0Z" fill="#86a94e" stroke="#243028" strokeWidth="8" />
              <path d="M0 485 C175 415 370 492 535 420 S820 485 1030 407 S1285 462 1440 400 V700H0Z" fill="url(#safari-hill)" stroke="#243028" strokeWidth="8" />
              <g className="safari-vista-acacia" fill="#243028">
                <path d="M236 494h44l-12-205h-24Z" />
                <path d="M181 310c17-75 110-90 143-35c64-47 138 5 107 65c-23 45-80 24-105 21c-39 34-138 11-145-51Z" />
                <path d="M1260 478h29l-7-142h-16Z" />
                <path d="M1197 350c15-55 83-71 113-31c48-32 104 5 82 50c-17 34-61 19-83 17c-29 25-104 8-112-36Z" />
              </g>
              <g className="safari-vista-herd" fill="#243028">
                <path d="M865 499c0-37 37-57 74-41c21-34 80-22 83 25c27 3 38 20 36 42h-22v29h-15v-29h-46v29h-15v-29h-29v29h-15v-29h-22Z" />
                <path d="M1069 523c0-47 40-75 86-67l8-112h18l7 112h33v-45h12v45h17v68h-24v30h-15v-30h-84v30h-15v-30Z" />
                <circle cx="1174" cy="323" r="19" />
                <path d="M1210 345l13-28m-5 29l19-22" fill="none" stroke="#243028" strokeWidth="7" strokeLinecap="round" />
              </g>
              <path d="M0 565c184-74 338-10 512-59c228-64 377 66 616 7c141-35 229-24 312-1v188H0Z" fill="#1d4a35" stroke="#243028" strokeWidth="8" />
            </svg>
          </div>

          <div className="safari-foreground-fronds safari-foreground-fronds-left" aria-hidden="true" />
          <div className="safari-foreground-fronds safari-foreground-fronds-right" aria-hidden="true" />

          {/* Small Floating Fullscreen Button */}
          <div className="fixed top-4 right-4 z-[9999]">
            <GlobalFullscreenToggle compact />
          </div>

          <section className="safari-welcome-sign" aria-labelledby="reserve-title">
            <div className="safari-sign-rope safari-sign-rope-left" aria-hidden="true" />
            <div className="safari-sign-rope safari-sign-rope-right" aria-hidden="true" />
            <div className="safari-ranger-plaque">
              <p className="safari-ranger-kicker">GAMES PRESENTS</p>
              <h1 id="reserve-title" className="safari-reserve-title brutal-font">VICTOR ZONE</h1>
              <div className="safari-sign-divider" aria-hidden="true"><span /> <span /> <span /></div>
              <button
                onClick={enterSafariReserve}
                className="safari-reserve-button brutal-font"
              >
                ENTER THE RESERVE <span aria-hidden="true"></span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Illustrated Safari Basecamp */}
      {safariStage === "exploring" && (
        <div className="safari-basecamp-page">
          <div className="safari-basecamp-sun" aria-hidden="true" />
          <div className="safari-basecamp-hills safari-basecamp-hills-back" aria-hidden="true" />
          <div className="safari-basecamp-hills safari-basecamp-hills-front" aria-hidden="true" />

          <nav className="safari-basecamp-nav" aria-label="Basecamp controls">
            <div className="safari-basecamp-brand">
              <TrailMark kind="compass" className="safari-brand-mark" />
              <div>
                <strong className="brutal-font">Animal Kingdom</strong>
                <span>Expedition basecamp</span>
              </div>
            </div>

            <div className="safari-nav-actions">
              <button
                type="button"
                onClick={() => router.push("/mixer")}
                className="px-3 py-1.5 border-2 border-[#243028] rounded-xl bg-[#F4B942] text-[#243028] font-black text-xs uppercase shadow-[3px_3px_0px_#243028] hover:bg-[#f9d778] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>⚙️</span> Admin
              </button>
              <GlobalFullscreenToggle />
              <button type="button" aria-pressed={soundOn} onClick={() => setSoundOn(!soundOn)}>
                Sound {soundOn ? "on" : "off"}
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push("/");
                }}
              >
                Exit reserve
              </button>
            </div>
          </nav>

          <main className="safari-basecamp-shell">
            <section className="safari-basecamp-hero" aria-labelledby="basecamp-heading">
              <div className="safari-hero-copy">
                <p className="safari-eyebrow">THE RESERVE IS AWAKE</p>
                <h1 id="basecamp-heading" className="brutal-font">Ready for the Wild Field Games?</h1>
                <p className="safari-hero-lede">
                  Enter the Savanna Activity Field to read game challenges, launch 1v1 duels, gather supplies, and cue the video reels.
                </p>
                <div className="safari-hero-status">
                  <span className="safari-hero-count brutal-font">{roster.length}</span>
                  <span>{roster.length === 1 ? "explorer is" : "explorers are"} waiting at the campfire</span>
                </div>
              </div>

              <div className="safari-hero-lookout" aria-hidden="true">
                <svg viewBox="0 0 420 300" role="presentation">
                  <circle cx="292" cy="91" r="70" fill="#F4B942" stroke="#243028" strokeWidth="7" />
                  <path d="M0 213c75-55 147-25 214-52 84-34 140 31 206-5v144H0Z" fill="#86A94E" stroke="#243028" strokeWidth="7" />
                  <path d="M0 247c78-39 145 7 232-30 80-34 134 16 188-1v84H0Z" fill="#1D4A35" stroke="#243028" strokeWidth="7" />
                  <path d="M76 225h25L94 115H82Z" fill="#243028" />
                  <path d="M38 131c10-43 65-56 88-24 38-27 84 2 67 39-14 28-50 15-66 14-23 18-84 6-89-29Z" fill="#243028" />
                  <path d="M272 229c0-26 25-41 51-31 15-23 56-14 58 19 19 2 27 14 25 29h-15v23h-12v-23h-31v23h-12v-23h-21v23h-12v-23h-15Z" fill="#243028" />
                  <path d="M235 129q13-12 26 0q13-12 26 0M325 78q10-9 20 0q10-9 20 0" fill="none" stroke="#243028" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </div>
            </section>

            <div className="safari-basecamp-grid">
              <section className="safari-expedition-map safari-map-surface" aria-labelledby="map-heading">
                <header className="safari-map-heading">
                  <div>
                    <p className="safari-eyebrow">SAVANNA ACTIVITY FIELD</p>
                    <h2 id="map-heading" className="brutal-font">Wild Field Games</h2>
                  </div>
                  <p>Your central basecamp for game reels, live duels, and team challenges.</p>
                </header>

                <div className="safari-map-canvas">
                  <svg className="safari-map-landscape" viewBox="0 0 900 670" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M-50 560C125 450 185 655 350 520S585 365 745 470s177-40 225-62" fill="none" stroke="#5CC8E8" strokeWidth="58" strokeLinecap="round" opacity=".72" />
                    <path d="M62 150c185-74 280 65 367 167s194 47 288-56 145-38 174 31" fill="none" stroke="#9E7046" strokeWidth="15" strokeLinecap="round" strokeDasharray="3 30" />
                    <path d="M68 150c183-70 274 67 360 166s191 48 286-54 143-39 171 29" fill="none" stroke="#FFF3C4" strokeWidth="5" strokeLinecap="round" strokeDasharray="3 30" />
                    <path d="m34 559 58-93 66 93Zm77 0 75-130 82 130Z" fill="#86A94E" stroke="#243028" strokeWidth="6" strokeLinejoin="round" />
                    <path d="m648 143 58-93 64 93Zm77 0 70-119 74 119Z" fill="#A96238" stroke="#243028" strokeWidth="6" strokeLinejoin="round" />
                    <circle cx="88" cy="151" r="15" fill="#F4B942" stroke="#243028" strokeWidth="6" />
                    <circle cx="453" cy="347" r="15" fill="#F4B942" stroke="#243028" strokeWidth="6" />
                    <circle cx="844" cy="288" r="15" fill="#F4B942" stroke="#243028" strokeWidth="6" />
                  </svg>

                  <Link href="/games" className="safari-map-stop safari-map-stop-games">
                    <TrailMark kind="games" className="safari-stop-icon" />
                    <span className="safari-stop-copy">
                      <small>ACTIVITY FIELD PORTAL</small>
                      <strong className="brutal-font">Enter the Field Guide</strong>
                      <em>Read challenge rules, gather game supplies, launch 1v1 duels, and cue video reels.</em>
                      <b>Open the field guide <span aria-hidden="true">→</span></b>
                    </span>
                  </Link>
                </div>
              </section>

              <aside className="safari-roll-call" aria-labelledby="roll-call-heading">
                <div className="safari-roll-call-header">
                  <span className="safari-roll-call-icon" aria-hidden="true">
                    <TrailMark kind="compass" className="safari-brand-mark" />
                  </span>
                  <div>
                    <p className="safari-eyebrow">RANGER STATION CHECK-IN</p>
                    <h2 id="roll-call-heading" className="brutal-font">Join the Expedition</h2>
                  </div>
                </div>

                <div className="safari-ticket-card">
                  <div className="safari-ticket-header brutal-font">
                    <span className="safari-animal-mini"><CartoonAnimalIcon animal="lion" /></span>
                    <span className="safari-animal-mini"><CartoonAnimalIcon animal="parrot" /></span>
                    <span>EXPEDITION PASS</span>
                    <span className="safari-animal-mini"><CartoonAnimalIcon animal="cheetah" /></span>
                    <span className="safari-animal-mini"><CartoonAnimalIcon animal="zebra" /></span>
                  </div>

                  <div className="safari-qr-stage">
                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="safari-qr-frame-button group focus:outline-none"
                      title="Click to enlarge QR code for scanning"
                      aria-label="Click to enlarge QR code"
                    >
                      <div className="safari-qr-frame relative">
                        <QRCodeSVG
                          value="https://docs.google.com/forms/d/e/1FAIpQLSfIjmZMfPsbdXJ-5eYNVzQ2525PFaeVspfeEht2QxuvoCS-_w/viewform?usp=dialog"
                          size={190}
                          bgColor="#FFFDF5"
                          fgColor="#243028"
                          level="H"
                          marginSize={2}
                        />
                        <div className="safari-qr-hover-badge brutal-font">
                          🔍 Click to Enlarge
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="safari-ticket-footer">
                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="safari-camera-pill hover:scale-105 transition-transform cursor-pointer"
                    >
                      <span aria-hidden="true">🔍</span> CLICK TO ENLARGE QR CODE
                    </button>
                  </div>
                </div>

                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfIjmZMfPsbdXJ-5eYNVzQ2525PFaeVspfeEht2QxuvoCS-_w/viewform?usp=dialog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="safari-checkin-button brutal-font"
                >
                  Open Form Directly <span aria-hidden="true">→</span>
                </a>
              </aside>

              {/* Enlarged QR Modal */}
              {showQrModal && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
                  onClick={() => setShowQrModal(false)}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Enlarged Check-In QR Code"
                >
                  <div
                    className="relative w-full max-w-lg p-6 md:p-8 bg-[#FFFDF5] border-4 border-[#243028] rounded-3xl shadow-[14px_14px_0px_#243028] text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setShowQrModal(false)}
                      className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 border-3 border-[#243028] rounded-full bg-[#E8614D] text-[#FFF3C4] font-black text-xl shadow-[3px_3px_0px_#243028] hover:bg-red-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      aria-label="Close enlarged QR code"
                    >
                      ✕
                    </button>

                    <div className="flex items-center justify-center gap-2 mb-2 brutal-font text-2xl md:text-3xl text-[#243028]">
                      <span className="w-8 h-8 md:w-10 md:h-10 inline-block"><CartoonAnimalIcon animal="lion" /></span>
                      <span>EXPEDITION CHECK-IN</span>
                      <span className="w-8 h-8 md:w-10 md:h-10 inline-block"><CartoonAnimalIcon animal="cheetah" /></span>
                    </div>

                    <p className="text-xs md:text-sm font-bold text-[#243028] uppercase tracking-wider mb-4">
                      Point phone camera at code to join basecamp
                    </p>

                    <div className="p-4 md:p-6 bg-[#FFF3C4] border-4 border-[#243028] rounded-2xl shadow-[6px_6px_0px_#243028] inline-block my-2 max-w-full">
                      <QRCodeSVG
                        value="https://docs.google.com/forms/d/e/1FAIpQLSfIjmZMfPsbdXJ-5eYNVzQ2525PFaeVspfeEht2QxuvoCS-_w/viewform?usp=dialog"
                        size={320}
                        bgColor="#FFF3C4"
                        fgColor="#243028"
                        level="H"
                        marginSize={2}
                        className="w-full h-auto max-w-[280px] md:max-w-[340px]"
                      />
                    </div>

                    <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSfIjmZMfPsbdXJ-5eYNVzQ2525PFaeVspfeEht2QxuvoCS-_w/viewform?usp=dialog"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-6 py-3 border-3 border-[#243028] rounded-xl bg-[#F4B942] text-[#243028] brutal-font text-sm uppercase shadow-[4px_4px_0px_#243028] hover:bg-[#f9d778] active:translate-x-1 active:translate-y-1 transition-all"
                      >
                        Open Form Link →
                      </a>
                      <button
                        type="button"
                        onClick={() => setShowQrModal(false)}
                        className="w-full sm:w-auto px-6 py-3 border-3 border-[#243028] rounded-xl bg-[#FFFDF5] text-[#243028] font-bold text-sm uppercase shadow-[4px_4px_0px_#243028] hover:bg-zinc-200 active:translate-x-1 active:translate-y-1 transition-all cursor-pointer"
                      >
                        Close [ESC]
                      </button>
                    </div>
                  </div>
                </div>
              )}            </div>
          </main>

          <footer className="safari-basecamp-footer">
            <span>Animal Kingdom Basecamp</span>
            <span>Gather boldly. Play wildly.</span>
          </footer>
        </div>
      )}
    </div>
  );
}
