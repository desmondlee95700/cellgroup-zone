"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import GameIcon from "@/components/GameIcon";

export default function GamesPage() {
  const container = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"blanket" | "balloon">("blanket");

  useGSAP(
    () => {
      gsap.fromTo(
        ".gsap-reveal",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.2)",
          clearProps: "all",
        }
      );
    },
    { scope: container }
  );

  return (
    <div ref={container} className="min-h-screen bg-[#FFFDF5] pb-24">
      {/* Header Section */}
      <header className="gsap-reveal bg-[#18181B] border-b-4 border-black py-12 px-6 text-center shadow-[0_8px_0px_#000] relative z-20">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link
            href="/"
            className="brital-box bg-[#FFFDF5] text-black font-black uppercase text-sm px-4 py-2 border-2 border-black hover:bg-[#FACC15] transition-all shadow-[2px_2px_0px_#000] self-start md:self-auto"
          >
            ← Back to Entry
          </Link>
          <h1 className="brutal-font text-3xl md:text-5xl text-[#FACC15] drop-shadow-[3px_3px_0px_#000] hover:scale-105 transition-transform duration-300 inline-flex items-center gap-4 cursor-default uppercase">
            <GameIcon className="w-10 h-10 md:w-16 md:h-16" />
            Games Gathering
          </h1>
          <div className="w-24 hidden md:block"></div> {/* Spacer for balancing */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 overflow-hidden">
        {/* Video Demo Section */}
        <section className="gsap-reveal mb-20">
          <h2 className="brutal-font text-4xl mb-6 uppercase flex items-center gap-4">
            <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-black block"></span>
            Live Demo Feed
          </h2>

          {/* Signature Jumbotron Player */}
          <div className="brutal-box brutal-box-hover bg-[#18181B] p-4 md:p-8 rounded-xl shadow-[16px_16px_0px_#000]">
            {/* Industrial Screws */}
            <div className="screw top-3 left-3"></div>
            <div className="screw top-3 right-3"></div>
            <div className="screw bottom-3 left-3"></div>
            <div className="screw bottom-3 right-3"></div>

            <div className="border-8 border-black rounded-lg overflow-hidden bg-black relative group">
              <video
                className="w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity duration-300"
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

        {/* Tricky Part: Team Formation */}
        <section className="gsap-reveal mb-20">
          <h2 className="brutal-font text-4xl mb-6 uppercase">
            Team Formation{" "}
            <span className="text-[#F59E0B] drop-shadow-[2px_2px_0px_#000]">
              (The Tricky Part!)
            </span>
          </h2>
          <p className="text-xl font-bold mb-8">
            Dividing 50 players is a game itself. Use these methods to
            chaos-group everyone before the main event:
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="brutal-box brutal-box-hover p-8 bg-white cursor-default">
              <h3 className="brutal-font text-2xl mb-4 text-[#F59E0B] drop-shadow-[2px_2px_0px_#000]">
                1. Puzzle Pieces
              </h3>
              <p className="font-bold text-lg leading-relaxed">
                Hand out picture fragments at the door. Players must scramble to
                find matching pieces to assemble their team.
              </p>
            </div>
            <div className="brutal-box brutal-box-hover p-8 bg-white cursor-default">
              <h3 className="brutal-font text-2xl mb-4 text-[#F59E0B] drop-shadow-[2px_2px_0px_#000]">
                2. Colored Candies
              </h3>
              <p className="font-bold text-lg leading-relaxed">
                Pass around an opaque bag of Skittles. Players draw one blindly.
                Matching colors form a team.
              </p>
            </div>
          </div>

          {/* Full-width Digital Mixer CTA Card */}
          <div className="brutal-box brutal-box-hover p-8 bg-[#FACC15] mt-8 relative overflow-hidden group">
            <div className="fold-corner-orange"></div>
            <div className="relative z-10">
              <span className="bg-black text-[#FFFDF5] text-xs font-black px-3 py-1 uppercase tracking-wider inline-block mb-4 border-2 border-black">
                RECOMMENDED METHOD
              </span>
              <h3 className="brutal-font text-3xl md:text-4xl mb-4 text-black uppercase">
                3. Digital Roster Mixer 🎲
              </h3>
              <p className="font-bold text-lg text-black leading-relaxed max-w-2xl mb-6">
                Paste your Excel/Google Sheets roster or add names on the fly. Our Greedy Dealer algorithm shuffles players instantly, guaranteeing equal team sizes and minimizing overlap from the same cell groups!
              </p>
              <Link
                href="/mixer"
                className="inline-block brutal-font text-lg md:text-xl bg-black text-[#FFFDF5] hover:bg-zinc-800 hover:text-white px-8 py-5 border-4 border-black uppercase transition-all duration-200 shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000]"
              >
                Launch Digital Mixer →
              </Link>
            </div>
          </div>
        </section>

        {/* Games Section */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="gsap-reveal flex gap-2 md:gap-4 px-2 md:px-0 mt-8 mb-[-4px] relative z-10">
            <button
              onClick={() => setActiveTab("blanket")}
              className={`brutal-font text-xl md:text-2xl px-6 py-4 uppercase border-4 border-black border-b-0 rounded-t-xl transition-all duration-200 shadow-[4px_0_0_#000] ${
                activeTab === "blanket"
                  ? "bg-[#FACC15] text-black h-16 -translate-y-2"
                  : "bg-gray-300 text-gray-600 h-14 hover:bg-gray-200 mt-2"
              }`}
            >
              Blanket Name Game
            </button>
            <button
              onClick={() => setActiveTab("balloon")}
              className={`brutal-font text-xl md:text-2xl px-6 py-4 uppercase border-4 border-black border-b-0 rounded-t-xl transition-all duration-200 shadow-[4px_0_0_#000] ${
                activeTab === "balloon"
                  ? "bg-[#38BDF8] text-black h-16 -translate-y-2"
                  : "bg-gray-300 text-gray-600 h-14 hover:bg-gray-200 mt-2"
              }`}
            >
              Balloon Scatter
            </button>
          </div>

          {/* Game 1: Blanket Name Game */}
          {activeTab === "blanket" && (
            <article className="gsap-reveal group relative z-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-[#18181B] border-4 border-black border-b-0 py-8 px-8 flex flex-col md:flex-row md:items-center justify-between shadow-[8px_0px_0px_#000]">
                <div>
                  <h2 className="brutal-font text-4xl text-[#FACC15] mb-2">
                    Blanket Name Game
                  </h2>
                  <p className="text-gray-300 font-bold tracking-widest text-xs uppercase">
                    Icebreaker · Fast Reflexes · Quick Memory
                  </p>
                </div>
              </div>
              <div className="brutal-box bg-[#FACC15] p-8 md:p-12 border-b-0 shadow-none">
                <div className="fold-corner-orange"></div>
                <h3 className="brutal-font text-3xl mb-8 uppercase">
                  How to Play
                </h3>
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <span className="game-token bg-[#FFFDF5] text-[#F59E0B] shadow-[4px_4px_0px_#000]">
                      1
                    </span>
                    <span className="text-2xl font-black mt-1">
                      Split the group into two large halves.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="game-token bg-[#FFFDF5] text-[#F59E0B] shadow-[4px_4px_0px_#000]">
                      2
                    </span>
                    <span className="text-2xl font-black mt-1">
                      Hold up a large black blanket between the groups to block
                      their view.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="game-token bg-[#FFFDF5] text-[#F59E0B] shadow-[4px_4px_0px_#000]">
                      3
                    </span>
                    <span className="text-2xl font-black mt-1">
                      Each group silently selects 1 or 2 players to sit facing the
                      blanket.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="game-token bg-[#FFFDF5] text-[#F59E0B] shadow-[4px_4px_0px_#000]">
                      4
                    </span>
                    <span className="text-2xl font-black mt-1">
                      On THREE, drop the blanket! The selected players race to
                      shout the opponent&apos;s name. First to say it wins!
                    </span>
                  </li>
                </ul>
              </div>
              {/* Illustration */}
              <div className="bg-white border-4 border-black border-t-0 p-4 brutal-box shadow-[12px_12px_0px_#000]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/images/blanket_game.png"
                  alt="Blanket Name Game"
                  className="w-full h-auto border-4 border-black object-cover"
                />
              </div>
            </article>
          )}

          {/* Game 2: Balloon Team Scatter */}
          {activeTab === "balloon" && (
            <article className="gsap-reveal group relative z-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-[#18181B] border-4 border-black border-b-0 py-8 px-8 flex flex-col md:flex-row md:items-center justify-between shadow-[8px_0px_0px_#000]">
                <div>
                  <h2 className="brutal-font text-4xl text-[#38BDF8] mb-2">
                    Balloon Team Scatter
                  </h2>
                  <p className="text-gray-300 font-bold tracking-widest text-xs uppercase">
                    Teamwork · Chaos · Coordination
                  </p>
                </div>
              </div>
              <div className="brutal-box bg-[#38BDF8] p-8 md:p-12 border-b-0 shadow-none">
                <div className="fold-corner-blue"></div>
                <h3 className="brutal-font text-3xl mb-8 uppercase drop-shadow-[2px_2px_0px_#fff]">
                  How to Play
                </h3>
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <span className="game-token bg-[#FFFDF5] text-[#0284C7] shadow-[4px_4px_0px_#000]">
                      1
                    </span>
                    <span className="text-2xl font-black mt-1">
                      Give every player a balloon and a marker.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="game-token bg-[#FFFDF5] text-[#0284C7] shadow-[4px_4px_0px_#000]">
                      2
                    </span>
                    <span className="text-2xl font-black mt-1">
                      Players write their names clearly on their balloons.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="game-token bg-[#FFFDF5] text-[#0284C7] shadow-[4px_4px_0px_#000]">
                      3
                    </span>
                    <span className="text-2xl font-black mt-1">
                      Players toss their balloons into the center. Scatter them
                      wildly.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="game-token bg-[#FFFDF5] text-[#0284C7] shadow-[4px_4px_0px_#000]">
                      4
                    </span>
                    <span className="text-2xl font-black mt-1">
                      On GO, players rush in, find their teammates&apos;
                      balloons, gather them, and sit in a circle. First fully
                      seated team wins!
                    </span>
                  </li>
                </ul>
              </div>
              {/* Illustration */}
              <div className="bg-white border-4 border-black border-t-0 p-4 brutal-box shadow-[12px_12px_0px_#000]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/images/balloon_scatter.png"
                  alt="Balloon Scatter Game"
                  className="w-full h-auto border-4 border-black object-cover"
                />
              </div>
            </article>
          )}
        </div>
      </main>
    </div>
  );
}
