"use client";

import React from "react";
import { CartoonAnimalIcon } from "../CartoonAnimalIcon";

export function Game1NameChallenge() {
  return (
    <div className="space-y-6">
      {/* Header Banner with Tactile Stamps & Folded Badges */}
      <div className="relative overflow-hidden rounded-3xl border-5 border-[#243028] bg-[#FFF3C4] p-6 shadow-[10px_10px_0px_#243028] md:p-8">
        {/* Tactile Stamp Overlay */}
        <div className="absolute right-4 top-4 pointer-events-none hidden sm:block">
          <div className="rotate-3 rounded-xl border-3 border-dashed border-[#E8614D] bg-rose-50/90 px-3 py-1.5 text-[11px] font-black uppercase text-[#E8614D] shadow-[3px_3px_0px_#E8614D]">
            ✦ OFFICIAL DISPATCH #01
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-[#243028] pb-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-[#243028] bg-[#F4B942] p-2 shadow-[4px_4px_0px_#243028]">
              <CartoonAnimalIcon animal="lion" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border-2 border-[#243028] bg-[#F4B942] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#243028]">
                  OFFICIAL GAME RULES & REGULATIONS
                </span>
                <span className="-rotate-2 rounded border-2 border-[#243028] bg-sky-200 px-2 py-0.5 text-[9px] font-black uppercase text-[#243028]">
                  PROJECTIONIST READY 📽️
                </span>
              </div>
              <h2 className="brutal-font mt-1 text-2xl text-[#243028] md:text-4xl">
                Game 1: Get the Name Right 🦁
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border-3 border-[#243028] bg-[#5CC8E8] px-4 py-2 text-xs font-black uppercase text-[#243028] shadow-[3px_3px_0px_#243028]">
              CANOPY CURTAIN DROP
            </span>
          </div>
        </div>

        <p className="mt-4 text-base font-bold text-[#243028] leading-relaxed">
          <strong className="text-black uppercase">Objective:</strong> Test how well team members can remember each other’s names.
        </p>
      </div>

      {/* Main Rules & Regulations Dossier */}
      <div className="rounded-3xl border-4 border-[#243028] bg-[#FFF3C4] p-6 shadow-[8px_8px_0px_#243028] md:p-8 space-y-6">
        <h3 className="brutal-font text-2xl text-[#243028]">
          How to Play Regulations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1 */}
          <div className="flex items-start gap-4 rounded-2xl border-3 border-[#243028] bg-white p-4 shadow-[4px_4px_0px_#243028]">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-3 border-[#243028] bg-[#5CC8E8] font-black text-[#243028]">
              01
            </span>
            <div>
              <h4 className="font-black text-base text-[#243028] uppercase">1. Introduction</h4>
              <ul className="mt-1.5 space-y-1 text-xs font-bold text-zinc-700">
                <li>• First, everyone introduces themselves and says their name clearly.</li>
                <li>• Players should try their best to remember the names of members from the other teams.</li>
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 rounded-2xl border-3 border-[#243028] bg-white p-4 shadow-[4px_4px_0px_#243028]">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-3 border-[#243028] bg-[#F4B942] font-black text-[#243028]">
              02
            </span>
            <div className="w-full">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-black text-base text-[#243028] uppercase">2. Round 1 – One Person</h4>
                <span className="rounded border border-[#243028] bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-900">
                  Winner: 1 pt
                </span>
              </div>
              <ul className="mt-1.5 space-y-1 text-xs font-bold text-zinc-700">
                <li>• Each team sends <strong>1 person</strong> to the centre.</li>
                <li>• A curtain will separate the players.</li>
                <li>• When the curtain drops, the players must quickly identify and correctly say the names of the people from the other teams.</li>
                <li>• The fastest player to correctly name the others wins.</li>
                <li>• <strong>Play 3 rounds.</strong></li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4 rounded-2xl border-3 border-[#243028] bg-white p-4 shadow-[4px_4px_0px_#243028]">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-3 border-[#243028] bg-[#B7DF77] font-black text-[#243028]">
              03
            </span>
            <div className="w-full">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-black text-base text-[#243028] uppercase">3. Round 2 – Two People</h4>
                <span className="rounded border border-[#243028] bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-900">
                  Winner: 2 pts
                </span>
              </div>
              <ul className="mt-1.5 space-y-1 text-xs font-bold text-zinc-700">
                <li>• Each team sends <strong>2 people</strong> to the centre.</li>
                <li>• When the curtain drops, quickly identify and name the opposing players.</li>
                <li>• <strong>Play 2 rounds.</strong></li>
              </ul>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-4 rounded-2xl border-3 border-[#243028] bg-white p-4 shadow-[4px_4px_0px_#243028]">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-3 border-[#243028] bg-[#E8614D] font-black text-[#FFF3C4]">
              04
            </span>
            <div className="w-full">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-black text-base text-[#243028] uppercase">4. Round 3 – Three People</h4>
                <span className="rounded border border-[#243028] bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-900">
                  Winner: 3 pts
                </span>
              </div>
              <ul className="mt-1.5 space-y-1 text-xs font-bold text-zinc-700">
                <li>• Each team sends <strong>3 people</strong> to the centre.</li>
                <li>• <strong>Play 1 round.</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bonus Points Badge & Reminder Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-2xl border-3 border-[#243028] bg-[#F4B942] p-4 text-xs font-black text-[#243028] shadow-[4px_4px_0px_#243028]">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border-2 border-[#243028] bg-white text-lg">
              ⭐
            </span>
            <div>
              <div className="uppercase tracking-wider">Tournament Bonus</div>
              <div className="text-sm font-black">The final winning herd gets +3 extra points!</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border-3 border-[#243028] bg-amber-100 p-4 text-xs font-bold text-amber-950 shadow-[4px_4px_0px_#243028]">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border-2 border-[#243028] bg-white text-lg">
              📌
            </span>
            <div>
              <div className="uppercase font-black tracking-wider text-amber-900">Pro-Tip Reminder</div>
              <div>Listen carefully during the introductions and try to remember as many names as possible!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
