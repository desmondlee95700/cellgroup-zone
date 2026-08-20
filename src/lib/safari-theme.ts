export interface SafariTeamProfile {
  animal: string;
  collective: string;
  emoji: string;
}

export const SAFARI_PROFILES: SafariTeamProfile[] = [
  { animal: "Lion", collective: "Pride", emoji: "🦁" },
  { animal: "Elephant", collective: "Herd", emoji: "🐘" },
  { animal: "Cheetah", collective: "Dash", emoji: "🐆" },
  { animal: "Flamingo", collective: "Flock", emoji: "🦩" },
  { animal: "Hippo", collective: "Pod", emoji: "🦛" },
  { animal: "Crocodile", collective: "Crew", emoji: "🐊" },
  { animal: "Zebra", collective: "Dazzle", emoji: "🦓" },
  { animal: "Parrot", collective: "Parliament", emoji: "🦜" },
  { animal: "Rhino", collective: "Crash", emoji: "🦏" },
  { animal: "Giraffe", collective: "Tower", emoji: "🦒" },
];

const COLOR_PROFILE_INDEX: Array<[string, number]> = [
  ["yellow", 0], ["blue", 1], ["orange", 2], ["red", 3], ["purple", 4],
  ["green", 5], ["pink", 6], ["teal", 7], ["gold", 8], ["silver", 9],
];

export function getSafariTeamProfile(name: string): SafariTeamProfile {
  const normalized = name.toLowerCase();

  const animalMatch = SAFARI_PROFILES.find((profile) =>
    normalized.includes(profile.animal.toLowerCase())
  );
  if (animalMatch) return animalMatch;

  const colorProfile = COLOR_PROFILE_INDEX.find(([color]) => normalized.includes(color));
  if (colorProfile) return SAFARI_PROFILES[colorProfile[1]];

  const hash = Array.from(normalized).reduce(
    (total, character) => ((total * 31) + character.charCodeAt(0)) | 0,
    0,
  );
  return SAFARI_PROFILES[Math.abs(hash) % SAFARI_PROFILES.length];
}

export function getSafariTeamLabel(name: string): string {
  const { animal, collective } = getSafariTeamProfile(name);
  return `${animal} ${collective}`;
}
