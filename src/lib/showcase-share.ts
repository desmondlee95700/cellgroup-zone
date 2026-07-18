import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

export interface ShowcaseTeamMember {
  name: string;
  cg: string;
}

export interface ShowcaseTeam {
  name: string;
  color: string;
  members: ShowcaseTeamMember[];
}

const SHARE_FORMAT_PREFIX = "v1.";

// QR version 40 at error-correction level M holds 2,331 bytes. Keep headroom
// for encoder differences and future URL changes.
export const MAX_QR_URL_LENGTH = 2_200;

type CompactTeam = [
  name: string,
  color: string,
  members: Array<[name: string, cellGroup: string]>,
];

function parseTeams(value: unknown): ShowcaseTeam[] {
  if (!Array.isArray(value)) {
    throw new Error("Showcase payload must be an array");
  }

  return value.map((team) => {
    if (
      !team ||
      typeof team !== "object" ||
      typeof team.name !== "string" ||
      typeof team.color !== "string" ||
      !Array.isArray(team.members)
    ) {
      throw new Error("Invalid showcase team");
    }

    const members = team.members.map((member: unknown) => {
      if (
        !member ||
        typeof member !== "object" ||
        !("name" in member) ||
        !("cg" in member) ||
        typeof member.name !== "string" ||
        typeof member.cg !== "string"
      ) {
        throw new Error("Invalid showcase member");
      }

      return { name: member.name, cg: member.cg };
    });

    return { name: team.name, color: team.color, members };
  });
}

function decodeLegacyBase64(value: string): ShowcaseTeam[] {
  const normalized = value.replace(/ /g, "+");
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return parseTeams(JSON.parse(new TextDecoder().decode(bytes)));
}

export function encodeShowcaseTeams(teams: ShowcaseTeam[]): string {
  const compactTeams: CompactTeam[] = teams.map((team) => [
    team.name,
    team.color,
    team.members.map((member) => [member.name, member.cg]),
  ]);

  return `${SHARE_FORMAT_PREFIX}${compressToEncodedURIComponent(JSON.stringify(compactTeams))}`;
}

export function decodeShowcaseTeams(value: string): ShowcaseTeam[] {
  if (!value.startsWith(SHARE_FORMAT_PREFIX)) {
    return decodeLegacyBase64(value);
  }

  const decompressed = decompressFromEncodedURIComponent(
    value.slice(SHARE_FORMAT_PREFIX.length),
  );
  if (!decompressed) {
    throw new Error("Invalid compressed showcase payload");
  }

  const compactTeams = JSON.parse(decompressed) as unknown;
  if (!Array.isArray(compactTeams)) {
    throw new Error("Invalid compressed showcase payload");
  }

  return parseTeams(
    compactTeams.map((team) => {
      if (!Array.isArray(team) || team.length !== 3 || !Array.isArray(team[2])) {
        throw new Error("Invalid compact showcase team");
      }

      return {
        name: team[0],
        color: team[1],
        members: team[2].map((member) => {
          if (!Array.isArray(member) || member.length !== 2) {
            throw new Error("Invalid compact showcase member");
          }
          return { name: member[0], cg: member[1] };
        }),
      };
    }),
  );
}

export function buildShowcaseShareUrl(origin: string, teams: ShowcaseTeam[]): string {
  const url = new URL("/showcase", origin);
  url.searchParams.set("t", encodeShowcaseTeams(teams));
  return url.toString();
}

export function isShowcaseQrSafe(url: string): boolean {
  return url.length <= MAX_QR_URL_LENGTH;
}
