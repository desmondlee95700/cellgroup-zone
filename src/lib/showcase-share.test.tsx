import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";
import { describe, expect, it } from "vitest";
import {
  buildShowcaseShareUrl,
  decodeShowcaseTeams,
  isShowcaseQrSafe,
  type ShowcaseTeam,
} from "./showcase-share";

function createTeams(playerCount: number): ShowcaseTeam[] {
  const teamCount = 5;
  const teams = Array.from({ length: teamCount }, (_, index) => ({
    name: `Team ${index + 1}`,
    color: "bg-[#FACC15] text-black",
    members: [] as ShowcaseTeam["members"],
  }));

  for (let index = 0; index < playerCount; index++) {
    teams[index % teamCount].members.push({
      name: `Participant ${index + 1}`,
      cg: `Cell Group ${(index % 8) + 1}`,
    });
  }

  return teams;
}

describe("showcase share URLs", () => {
  it("round-trips and renders a QR code for a 60-player roster", () => {
    const teams = createTeams(60);
    const url = buildShowcaseShareUrl("https://example.com", teams);
    const payload = new URL(url).searchParams.get("t");

    expect(payload).not.toBeNull();
    expect(decodeShowcaseTeams(payload!)).toEqual(teams);
    expect(isShowcaseQrSafe(url)).toBe(true);
    expect(() =>
      renderToStaticMarkup(
        <QRCodeSVG value={url} size={112} level="M" marginSize={1} />,
      ),
    ).not.toThrow();
  });

  it("keeps existing base64 share links readable", () => {
    const teams = createTeams(10);
    const legacyPayload = Buffer.from(JSON.stringify(teams), "utf8").toString("base64");

    expect(decodeShowcaseTeams(legacyPayload)).toEqual(teams);
  });

  it("rejects oversized URLs before QR rendering", () => {
    const teams = createTeams(2_000);
    const url = buildShowcaseShareUrl("https://example.com", teams);

    expect(isShowcaseQrSafe(url)).toBe(false);
  });
});
