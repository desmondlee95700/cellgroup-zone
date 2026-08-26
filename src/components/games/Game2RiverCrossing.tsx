"use client";

import React from "react";
import { CartoonAnimalIcon } from "../CartoonAnimalIcon";

export function Game2RiverCrossing() {
  return (
    <div className="space-y-6">
      {/* Header Banner with Stamp Overlay */}
      <div className="relative overflow-hidden rounded-3xl border-5 border-[#243028] bg-[#FFF3C4] p-6 shadow-[10px_10px_0px_#243028] md:p-8">
        {/* Tactile Stamp Overlay */}
        <div className="absolute right-4 top-4 pointer-events-none hidden sm:block">
          <div className="-rotate-2 rounded-xl border-3 border-dashed border-[#5CC8E8] bg-sky-50/90 px-3 py-1.5 text-[11px] font-black uppercase text-[#5CC8E8] shadow-[3px_3px_0px_#5CC8E8]">
            ✦ CLASSIFIED DOSSIER #02
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-[#243028] pb-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-[#243028] bg-[#5CC8E8] p-2 shadow-[4px_4px_0px_#243028]">
              <CartoonAnimalIcon animal="elephant" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border-2 border-[#243028] bg-[#5CC8E8] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#243028]">
                  OFFICIAL GAME RULES & REGULATIONS
                </span>
                <span className="rotate-2 rounded border-2 border-[#243028] bg-amber-200 px-2 py-0.5 text-[9px] font-black uppercase text-[#243028]">
                  A4 BRIDGE MISSION 🎈
                </span>
              </div>
              <h2 className="brutal-font mt-1 text-2xl text-[#243028] md:text-4xl">
                Game 2: Balloon River Crossing 🎈
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border-3 border-[#243028] bg-[#F4B942] px-4 py-2 text-xs font-black uppercase text-[#243028] shadow-[3px_3px_0px_#243028]">
              A4 PAPER BRIDGE
            </span>
          </div>
        </div>

        <p className="mt-4 text-base font-bold text-[#243028] leading-relaxed">
          <strong className="text-black uppercase">Mission:</strong> Transport your team and all birthday balloons safely across the river using a paper bridge of A4 sheets after the original wooden bridge was destroyed by a wild windstorm!
        </p>
      </div>

      {/* Grid Layout: Balloon Prep vs How to Play Regulations & Rules */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Balloon Preparation & Materials */}
        <div className="lg:col-span-5 space-y-6">
          {/* Balloon Prep Instructions Card */}
          <div className="relative rounded-3xl border-4 border-[#243028] bg-[#FFF3C4] p-6 shadow-[8px_8px_0px_#243028]">
            {/* Tactile Stamp */}
            <div className="absolute -top-3 -right-2 -rotate-3 rounded-lg border-2 border-[#243028] bg-[#F4B942] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#243028] shadow-[2px_2px_0px_#243028]">
              BALLOON PREP 🎈
            </div>

            <h3 className="brutal-font text-xl text-[#243028] flex items-center gap-2">
              <span>🎈</span> Balloon Preparation & Setup
            </h3>
            <ul className="mt-3 space-y-2 text-xs font-bold text-zinc-800">
              <li className="rounded-xl border-2 border-[#243028] bg-white p-3 shadow-[2px_2px_0px_#243028]">
                <strong>Normal Name Balloons (+1 pt each):</strong> 1 normal balloon per player. Blow to standard reference size and write your name clearly.
              </li>
              <li className="rounded-xl border-2 border-[#243028] bg-white p-3 shadow-[2px_2px_0px_#243028]">
                <strong>Herd Name Requirement:</strong> Write your Herd / Team Name on EVERY balloon for score identification!
              </li>
              <li className="rounded-xl border-2 border-[#243028] bg-[#F4B942] p-3 text-[#243028] shadow-[2px_2px_0px_#243028]">
                📐 <strong>A4 Paper Formula:</strong> Number of A4 Papers = Team Members + 2 <em>(e.g., 10 players → 12 A4 papers)</em>.
              </li>
              <li className="rounded-xl border-2 border-[#243028] bg-sky-50 p-3 shadow-[2px_2px_0px_#243028]">
                💡 <strong>Strategy Time:</strong> Allow 5–10 minutes for team strategy discussion before starting!
              </li>
            </ul>

            {/* 3 Special Balloons Prompts */}
            <div className="mt-5 border-t-3 border-[#243028] pt-4">
              <h4 className="font-black text-xs text-[#243028] uppercase tracking-wider">
                ⭐ 3 Special Balloons Prompts (+3 Points Each)
              </h4>
              <div className="mt-3 space-y-2 text-xs font-bold text-[#243028]">
                <div className="flex items-center gap-2.5 rounded-xl border-2 border-[#243028] bg-amber-100 p-2.5">
                  <span className="text-xl">🍜</span>
                  <div>
                    <strong className="block font-black uppercase">Special Balloon 1 (+3 pts)</strong>
                    <span>Famous food from your hometown</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border-2 border-[#243028] bg-amber-100 p-2.5">
                  <span className="text-xl">⭐</span>
                  <div>
                    <strong className="block font-black uppercase">Special Balloon 2 (+3 pts)</strong>
                    <span>Something special or interesting about yourself</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border-2 border-[#243028] bg-amber-100 p-2.5">
                  <span className="text-xl">✈️</span>
                  <div>
                    <strong className="block font-black uppercase">Special Balloon 3 (+3 pts)</strong>
                    <span>Country you would most like to visit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: How to Play Regulations & Official Rules */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border-4 border-[#243028] bg-[#FFF3C4] p-6 shadow-[8px_8px_0px_#243028] md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="brutal-font text-2xl text-[#243028]">
                How to Play Regulations
              </h3>
              <span className="rounded-lg border-2 border-[#243028] bg-[#B7DF77] px-3 py-1 text-xs font-black text-[#243028]">
                Fastest Team: +5 Pts
              </span>
            </div>

            {/* Step 1 */}
            <div className="flex items-start gap-4 rounded-2xl border-3 border-[#243028] bg-white p-4 shadow-[4px_4px_0px_#243028]">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-3 border-[#243028] bg-[#5CC8E8] font-black text-[#243028]">
                01
              </span>
              <div>
                <h4 className="font-black text-base text-[#243028] uppercase">1. Start Position</h4>
                <p className="mt-1 text-xs font-bold text-zinc-700">
                  All team members begin behind the starting line carrying their balloons. The first player places an A4 paper on the floor and steps onto it.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 rounded-2xl border-3 border-[#243028] bg-white p-4 shadow-[4px_4px_0px_#243028]">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-3 border-[#243028] bg-[#F4B942] font-black text-[#243028]">
                02
              </span>
              <div>
                <h4 className="font-black text-base text-[#243028] uppercase">2. Build the Bridge</h4>
                <p className="mt-1 text-xs font-bold text-zinc-700">
                  The team must continuously move A4 papers forward. Players pass spare A4 papers from the back to the front so the team keeps moving forward.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 rounded-2xl border-3 border-[#243028] bg-white p-4 shadow-[4px_4px_0px_#243028]">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-3 border-[#243028] bg-[#B7DF77] font-black text-[#243028]">
                03
              </span>
              <div>
                <h4 className="font-black text-base text-[#243028] uppercase">3. Protect the Balloons</h4>
                <p className="mt-1 text-xs font-bold text-zinc-700">
                  Bring all balloons across safely. Players cannot throw balloons across the river! Balloons must physically stay with the team.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-4 rounded-2xl border-3 border-[#243028] bg-white p-4 shadow-[4px_4px_0px_#243028]">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-3 border-[#243028] bg-[#E8614D] font-black text-[#FFF3C4]">
                04
              </span>
              <div>
                <h4 className="font-black text-base text-[#243028] uppercase">4. Reaching the Finish Line</h4>
                <p className="mt-1 text-xs font-bold text-zinc-700">
                  The team finishes when: ✅ All members reach the other side, ✅ All balloons reach the other side, and ✅ Nobody is standing in the river!
                </p>
              </div>
            </div>
          </div>

          {/* Official Game Rules Box */}
          <div className="relative rounded-3xl border-4 border-[#243028] bg-[#FFF3C4] p-6 shadow-[8px_8px_0px_#243028] md:p-8">
            <h3 className="brutal-font text-2xl text-[#243028] flex items-center gap-2 mb-4">
              <span>🚨</span> Official Game Rules
            </h3>
            <ul className="space-y-2.5 text-xs font-bold text-[#243028]">
              <li className="flex items-start gap-3 rounded-2xl border-3 border-[#243028] bg-white p-3.5 shadow-[3px_3px_0px_#243028]">
                <span className="text-base">🚫</span>
                <span>Players cannot step directly onto the floor/river.</span>
              </li>
              <li className="flex items-start gap-3 rounded-2xl border-3 border-[#243028] bg-white p-3.5 shadow-[3px_3px_0px_#243028]">
                <span className="text-base">🚫</span>
                <span>Players cannot throw balloons across the river.</span>
              </li>
              <li className="flex items-start gap-3 rounded-2xl border-3 border-[#243028] bg-white p-3.5 shadow-[3px_3px_0px_#243028]">
                <span className="text-base">🎈</span>
                <span>Balloons must be physically transported by the team.</span>
              </li>
              <li className="flex items-start gap-3 rounded-2xl border-3 border-[#243028] bg-amber-100 p-3.5 shadow-[3px_3px_0px_#243028]">
                <span className="text-base">⚠️</span>
                <span>If a player touches the river <strong>more than 3 times</strong>, the MC can deduct <strong>1 point</strong> for the team.</span>
              </li>
              <li className="flex items-start gap-3 rounded-2xl border-3 border-[#243028] bg-sky-100 p-3.5 shadow-[3px_3px_0px_#243028]">
                <span className="text-base">🌊</span>
                <span>If a balloon falls into the river, the team must retrieve it using their A4-paper bridge.</span>
              </li>
              <li className="flex items-start gap-3 rounded-2xl border-3 border-[#243028] bg-rose-100 p-3.5 shadow-[3px_3px_0px_#243028]">
                <span className="text-base">📄</span>
                <span>All A4 papers must remain intact and unbroken throughout the game. If an A4 paper is torn or broken, it must be removed immediately and cannot be used again.</span>
              </li>
              <li className="flex items-start gap-3 rounded-2xl border-3 border-[#243028] bg-emerald-100 p-3.5 shadow-[3px_3px_0px_#243028]">
                <span className="text-base">🤝</span>
                <span>Players may communicate and help one another.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
