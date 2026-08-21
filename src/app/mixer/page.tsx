"use client";

import type { CSSProperties } from "react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { QRCodeSVG } from "qrcode.react";
import {
  buildShowcaseShareUrl,
  isShowcaseQrSafe,
} from "@/lib/showcase-share";
import { getSafariTeamLabel, getSafariTeamProfile, SAFARI_PROFILES } from "@/lib/safari-theme";
import { CartoonAnimalIcon } from "@/components/CartoonAnimalIcon";
import { Game1DuelArenaModal } from "@/components/mixer/Game1DuelArenaModal";
import { LeaderboardSection } from "@/components/mixer/LeaderboardSection";

interface Member {
  id: string;
  name: string;
  cg: string;
}

interface Team {
  id: number;
  name: string;
  members: Member[];
  color: string;
  score?: number;
}

const PRESET_CG_NAMES = ["Jason", "Lemuel", "Rebecca", "Jackson"];

const SCORE_AWARDS = [
  { label: "+1", delta: 1, title: "Add 1 point" },
  { label: "+2", delta: 2, title: "Add 2 points" },
  { label: "+3", delta: 3, title: "Add 3 points" },
] as const;

function ScoreAwardControls({
  team,
  onAward,
  compact = false,
}: {
  team: Team;
  onAward: (teamId: number, delta: number) => void;
  compact?: boolean;
}) {
  return (
    <div className={`safari-score-awards${compact ? " is-compact" : ""}`}>
      {SCORE_AWARDS.map((award) => (
        <button
          key={award.delta}
          type="button"
          title={award.title}
          aria-label={`${award.title} for ${team.name}`}
          onClick={() => onAward(team.id, award.delta)}
          className={
            award.delta === 3
              ? "is-major"
              : award.delta === 2
                ? "is-mid"
                : ""
          }
        >
          {award.label}
        </button>
      ))}
    </div>
  );
}

const TEAM_COLOR_PALETTES = [
  "bg-[#F4B942] text-[#243028]", // Lion gold
  "bg-[#5CC8E8] text-[#243028]", // River blue
  "bg-[#F2A85B] text-[#243028]", // Cheetah orange
  "bg-[#E8614D] text-[#243028]", // Flamingo coral
  "bg-[#B7DF77] text-[#243028]", // Fresh leaf
  "bg-[#2E7D4D] text-[#FFF3C4]", // Canopy
  "bg-[#E6D27A] text-[#243028]", // Savanna grass
  "bg-[#79C8B5] text-[#243028]", // Lagoon
];

function generateId(): string {
  return `${Date.now()}-${Math.random()}`;
}

const CG_COLORS = [
  'bg-[#5CC8E8]',
  'bg-[#F4B942]',
  'bg-[#F2A85B]',
  'bg-[#B7DF77]',
  'bg-[#E6D27A]',
  'bg-[#79C8B5]',
  'bg-[#D8A56F]',
  'bg-[#E8614D]',
];

const TEAM_ACCENTS = ["#F4B942", "#5CC8E8", "#F2A85B", "#E8614D", "#B7DF77", "#79C8B5"];

const getGroupColor = (name: string) => {
  if (!name) return 'bg-[#FFFDF5]';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CG_COLORS.length;
  return CG_COLORS[index];
};

const getTeamAccent = (color: string, index: number) => {
  const match = color?.match(/#[0-9a-fA-F]{6}/)?.[0];
  return match ?? TEAM_ACCENTS[index % TEAM_ACCENTS.length];
};

function TeamMark({ name, compact = false }: { name: string; compact?: boolean }) {
  const profile = getSafariTeamProfile(name);

  return (
    <span className={`safari-animal-mark${compact ? " is-compact" : ""}`} aria-hidden="true" title={profile.animal}>
      <CartoonAnimalIcon animal={profile.animal} />
    </span>
  );
}

export default function MixerPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadedRef = useRef(false);
  
  // State for Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPasscode, setEnteredPasscode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [cellGroups, setCellGroups] = useState<string[]>(PRESET_CG_NAMES);
  const [newCGName, setNewCGName] = useState("");
  
  // Quick check-in & import method dropdown
  const [checkInMethod, setCheckInMethod] = useState<"single" | "bulk" | "sheets">("sheets");

  // Single member inputs
  const [inputName, setInputName] = useState("");
  const [inputCG, setInputCG] = useState("");
  
  // Bulk import
  const [bulkInput, setBulkInput] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Google Form sync (published CSV link & guide)
  const [sheetUrl, setSheetUrl] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideTab, setGuideTab] = useState<"csv" | "appscript">("csv");
  const [showShowcase, setShowShowcase] = useState(false);
  const [showTeamRosters, setShowTeamRosters] = useState(false);
  const [showRangerControls, setShowRangerControls] = useState(false);
  const [spotlightTeamId, setSpotlightTeamId] = useState<number | null>(null);
  const [isQrEnlarged, setIsQrEnlarged] = useState(false);
  
  // Mixer settings
  const [groupCount, setGroupCount] = useState(5);
  const [selectedAnimals, setSelectedAnimals] = useState<number[]>([0, 1, 2, 3, 4]);
  const [namingPreset, setNamingPreset] = useState<"numbers" | "colors" | "heroes">("colors");
  
  // Output state
  const [finalTeams, setFinalTeams] = useState<Team[]>([]);

  // Game 1 1v1 Duel Arena state
  const [showDuelModal, setShowDuelModal] = useState(false);
  const [duelTeamAId, setDuelTeamAId] = useState<number | null>(null);
  const [duelTeamBId, setDuelTeamBId] = useState<number | null>(null);

  // Open 1v1 Duel Arena with 2 teams pre-selected
  const openDuelArena = () => {
    if (finalTeams.length < 2) {
      showToast("Form at least 2 animal herds first!");
      return;
    }
    const tA = duelTeamAId && finalTeams.some(t => t.id === duelTeamAId) ? duelTeamAId : finalTeams[0].id;
    const tB = duelTeamBId && finalTeams.some(t => t.id === duelTeamBId) && duelTeamBId !== tA
      ? duelTeamBId
      : (finalTeams.find(t => t.id !== tA)?.id ?? finalTeams[1]?.id ?? finalTeams[0].id);

    setDuelTeamAId(tA);
    setDuelTeamBId(tB);
    setShowDuelModal(true);
    playSynthSound(520, 0.12, "square");
  };
  const [isDealing, setIsDealing] = useState(false);
  const [dealIndex, setDealIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState<"roster" | "teams">("roster");
  const [scoreFlashTeamId, setScoreFlashTeamId] = useState<number | null>(null);
  
  // Notification Toast state
  const [toastMessage, setToastMessage] = useState("");

  // Synthesize lightweight trail-call sound effects
  const playSynthSound = (freq: number, duration: number, type: OscillatorType = "sine") => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn("Audio blocked", e);
    }
  };

  const playSuccessChirp = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const playTone = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      };
      playTone(523.25, now, 0.08); // C5
      playTone(783.99, now + 0.08, 0.15); // G5
    } catch (e) {
      console.warn(e);
    }
  };

  const playDeleteChirp = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const playTone = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      };
      playTone(659.25, now, 0.08); // E5
      playTone(329.63, now + 0.08, 0.15); // E4
    } catch (e) {
      console.warn(e);
    }
  };

  // Authenticate Admin Passcode
  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPasscode.trim() === "admin@123") {
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        if (rememberMe) {
          localStorage.setItem("cg_mixer_auth", "true");
        } else {
          sessionStorage.setItem("cg_mixer_auth", "true");
        }
      }
      playSuccessChirp();
      showToast("Access granted! System unlocked.");
    } else {
      playSynthSound(150, 0.25, "sawtooth");
      showToast("Incorrect access code!");
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        const savedMembers = localStorage.getItem("cg_mixer_members");
        if (savedMembers) setMembers(JSON.parse(savedMembers));

        const savedGroups = localStorage.getItem("cg_mixer_cellgroups");
        if (savedGroups) {
          try {
            const parsed = JSON.parse(savedGroups);
            if (JSON.stringify(parsed) === JSON.stringify(["Jason", "Victor", "Lemuel"]) || parsed.length === 3 && parsed.includes("Victor")) {
              setCellGroups(PRESET_CG_NAMES);
              localStorage.setItem("cg_mixer_cellgroups", JSON.stringify(PRESET_CG_NAMES));
            } else {
              setCellGroups(parsed);
            }
          } catch {
            setCellGroups(PRESET_CG_NAMES);
          }
        }

        const savedTeams = localStorage.getItem("cg_mixer_teams");
        if (savedTeams) setFinalTeams(JSON.parse(savedTeams));

        const savedCount = localStorage.getItem("cg_mixer_groupcount");
        if (savedCount) setGroupCount(parseInt(savedCount, 10));

        const savedSelectedAnimals = localStorage.getItem("cg_mixer_selected_animals");
        if (savedSelectedAnimals) {
          try {
            const parsed = JSON.parse(savedSelectedAnimals);
            if (Array.isArray(parsed) && parsed.length >= 2) {
              setSelectedAnimals(parsed);
            }
          } catch {
            // fallback
          }
        }

        const savedPreset = localStorage.getItem("cg_mixer_preset");
        if (savedPreset) setNamingPreset(savedPreset as "numbers" | "colors" | "heroes");
        
        const savedSheetUrl = localStorage.getItem("cg_mixer_sheet_url");
        if (savedSheetUrl) setSheetUrl(savedSheetUrl);

        const savedAuth = localStorage.getItem("cg_mixer_auth") || sessionStorage.getItem("cg_mixer_auth");
        if (savedAuth === "true") setIsAuthenticated(true);

        isLoadedRef.current = true;
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Handle ESC key to dismiss enlarged QR modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isQrEnlarged) {
        setIsQrEnlarged(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQrEnlarged]);

  // Sync states to localStorage
  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("cg_mixer_members", JSON.stringify(members));
    }
  }, [members]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("cg_mixer_cellgroups", JSON.stringify(cellGroups));
    }
  }, [cellGroups]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("cg_mixer_teams", JSON.stringify(finalTeams));
    }
  }, [finalTeams]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("cg_mixer_groupcount", groupCount.toString());
    }
  }, [groupCount]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("cg_mixer_selected_animals", JSON.stringify(selectedAnimals));
    }
  }, [selectedAnimals]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("cg_mixer_preset", namingPreset);
    }
  }, [namingPreset]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("cg_mixer_sheet_url", sheetUrl);
    }
  }, [sheetUrl]);

  // Add individual cell group
  const addCellGroup = () => {
    const clean = newCGName.trim();
    if (!clean) return;
    if (cellGroups.map(c => c.toLowerCase()).includes(clean.toLowerCase())) {
      playSynthSound(220, 0.15, "triangle");
      showToast("Cell Group already exists!");
      return;
    }
    setCellGroups([...cellGroups, clean]);
    setNewCGName("");
    setInputCG(clean);
    playSuccessChirp();
    showToast(`Added group "${clean}"`);
  };

  // Remove individual cell group
  const removeCellGroup = (cg: string) => {
    if (cellGroups.length <= 1) {
      playSynthSound(220, 0.15, "triangle");
      showToast("You need at least one cell group!");
      return;
    }
    setCellGroups(cellGroups.filter(c => c !== cg));
    setMembers(members.map(m => m.cg === cg ? { ...m, cg: cellGroups.find(c => c !== cg) || "General" } : m));
    playDeleteChirp();
    showToast(`Removed group "${cg}"`);
  };

  // Add manual player
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = inputName.trim();
    if (!cleanName) return;

    if (cleanName.length > 50) {
      playSynthSound(300, 0.1, "triangle");
      showToast("Name too long! Max 50 characters.");
      return;
    }

    const isDup = members.some(m => m.name.toLowerCase() === cleanName.toLowerCase());
    if (isDup) {
      playSynthSound(300, 0.1, "triangle");
      showToast(`"${cleanName}" is already in the roster. Not added.`);
      return;
    }

    const newMember: Member = {
      id: generateId(),
      name: cleanName,
      cg: inputCG || cellGroups[0] || "General",
    };

    setMembers([newMember, ...members]);
    setInputName("");
    playSuccessChirp();
    showToast(`Added ${cleanName} (${newMember.cg})`);
  };

  // Remove player
  const handleRemoveMember = (id: string) => {
    const member = members.find(m => m.id === id);
    setMembers(members.filter(m => m.id !== id));
    playDeleteChirp();
    if (member) showToast(`Removed ${member.name}`);
  };

  // Clear Roster
  const handleClearRoster = () => {
    if (confirm("Are you sure you want to clear the roster?")) {
      setMembers([]);
      setFinalTeams([]);
      playSynthSound(200, 0.4, "sawtooth");
      showToast("Roster cleared!");
    }
  };

  // Parse bulk paste
  const handleBulkImport = () => {
    const lines = bulkInput.split("\n");
    const added: Member[] = [];
    const duplicates: string[] = [];
    const tooLong: string[] = [];
    const currentNames = new Set(members.map(m => m.name.toLowerCase()));

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      const lowerLine = cleanLine.toLowerCase();
      if (
        lowerLine.startsWith("name\t") ||
        lowerLine.startsWith("name ") ||
        lowerLine.startsWith("full name\t") ||
        lowerLine === "name\tcellgroup" ||
        lowerLine === "name\tcg"
      ) {
        return;
      }

      let name = cleanLine;
      let cg = inputCG || cellGroups[0] || "General";

      const tabSpaceMatch = cleanLine.split(/\t| {2,}/);
      if (tabSpaceMatch.length >= 2) {
        name = tabSpaceMatch[0].trim();
        cg = tabSpaceMatch[1].trim();
      } else {
        const bracketMatch = cleanLine.match(/^([^(]+)\(([^)]+)\)$/);
        if (bracketMatch) {
          name = bracketMatch[1].trim();
          cg = bracketMatch[2].trim();
        } else {
          const commaIdx = cleanLine.indexOf(",");
          if (commaIdx !== -1) {
            name = cleanLine.substring(0, commaIdx).trim();
            cg = cleanLine.substring(commaIdx + 1).trim();
          } else {
            // Only split on dashes surrounded by spaces, so hyphenated
            // names like "Mary-Jane" are kept intact.
            const dashIdx = cleanLine.indexOf(" - ");
            if (dashIdx !== -1) {
              name = cleanLine.substring(0, dashIdx).trim();
              const cgPart = cleanLine.substring(dashIdx + 3).trim();
              if (cgPart) cg = cgPart;
            }
          }
        }
      }

      cg = cg.replace(/\s+/g, " ").trim();
      if (!cellGroups.includes(cg)) {
        setCellGroups(prev => [...prev, cg]);
      }

      if (name.length > 50) {
        tooLong.push(name.substring(0, 20) + "…");
        return;
      }

      const lookupName = name.toLowerCase();
      if (currentNames.has(lookupName)) {
        duplicates.push(name);
      } else {
        added.push({
          id: generateId(),
          name,
          cg,
        });
        currentNames.add(lookupName);
      }
    });

    if (added.length > 0) {
      setMembers(prev => [...added, ...prev]);
      playSuccessChirp();
    }
    setShowBulkModal(false);
    setBulkInput("");

    let msg = `Imported ${added.length} players.`;
    if (duplicates.length > 0) {
      const shown = duplicates.slice(0, 3).join(", ");
      const more = duplicates.length > 3 ? ` +${duplicates.length - 3} more` : "";
      msg += ` Skipped ${duplicates.length} duplicates: ${shown}${more}.`;
    }
    if (tooLong.length > 0) {
      msg += ` Skipped ${tooLong.length} names over 50 characters.`;
    }
    showToast(msg);
  };

  // --- Google Form Sync (published CSV) ---

  // Minimal CSV parser that handles quoted fields (commas/newlines inside quotes)
  const parseCsv = (text: string): string[][] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else field += ch;
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field); field = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(field); field = "";
        if (row.some(f => f.trim() !== "")) rows.push(row);
        row = [];
      } else field += ch;
    }
    row.push(field);
    if (row.some(f => f.trim() !== "")) rows.push(row);
    return rows;
  };

  // Same header-matching logic as the Apps Script: exact match first, then partial
  const findColumnByHeader = (headers: string[], candidates: string[]): number => {
    for (const c of candidates) {
      const idx = headers.indexOf(c);
      if (idx !== -1) return idx;
    }
    for (let h = 0; h < headers.length; h++) {
      for (const c of candidates) {
        if (headers[h].includes(c)) return h;
      }
    }
    return -1;
  };

  const handleSheetSync = async () => {
    const url = sheetUrl.trim();
    if (!url) {
      showToast("Paste your published CSV link first!");
      return;
    }
    setIsSyncing(true);
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (text.trim().startsWith("<")) {
        showToast("That link returns a webpage, not CSV. Use File → Share → Publish to web → CSV.");
        return;
      }

      const rows = parseCsv(text);
      if (rows.length < 2) {
        showToast("No form responses in the sheet yet.");
        return;
      }

      const headers = rows[0].map(h => h.trim().toLowerCase());
      const nameCol = findColumnByHeader(headers, ["name", "full name"]);
      const cgCol = findColumnByHeader(headers, ["cell group", "cellgroup", "cg"]);
      if (nameCol === -1 || cgCol === -1) {
        showToast("Couldn't find Name / Cell Group columns in the sheet headers.");
        return;
      }

      // Dedup within the sheet: latest submission wins (same rule as Apps Script)
      const latest: { [key: string]: { name: string; cg: string } } = {};
      for (let i = 1; i < rows.length; i++) {
        const rawName = (rows[i][nameCol] || "").trim();
        const rawCG = (rows[i][cgCol] || "").trim().replace(/\s+/g, " ");
        if (!rawName || !rawCG) continue;
        latest[rawName.toLowerCase()] = { name: rawName, cg: rawCG };
      }

      // Merge mode: only add people not already in the roster; never delete
      const currentNames = new Set(members.map(m => m.name.toLowerCase()));
      const added: Member[] = [];
      const newCGs: string[] = [];
      let skipped = 0;
      Object.values(latest).forEach(p => {
        if (currentNames.has(p.name.toLowerCase())) {
          skipped++;
          return;
        }
        if (p.name.length > 50) return;
        added.push({ id: generateId(), name: p.name, cg: p.cg });
        if (!cellGroups.includes(p.cg) && !newCGs.includes(p.cg)) newCGs.push(p.cg);
      });

      if (newCGs.length > 0) {
        setCellGroups(prev => [...prev, ...newCGs.filter(c => !prev.includes(c))]);
      }
      if (added.length > 0) {
        setMembers(prev => [...added, ...prev]);
        playSuccessChirp();
      }
      showToast(`Synced! ${added.length} added, ${skipped} already in roster.`);
    } catch (e) {
      console.error("Sheet sync failed", e);
      playSynthSound(150, 0.25, "sawtooth");
      showToast("Sync failed — check the link and your connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // Set herd count (via slider, stepper, or quick chips) and auto-select first N animals
  const changeHerdCount = (count: number) => {
    const finalCount = Math.min(10, Math.max(2, count));
    setGroupCount(finalCount);
    setSelectedAnimals(Array.from({ length: finalCount }, (_, i) => i));
  };

  // Toggle individual animal herd selection freely
  const toggleAnimalSelection = (index: number) => {
    let updated: number[];
    if (selectedAnimals.includes(index)) {
      if (selectedAnimals.length <= 2) {
        showToast("Need at least 2 active animal herds!");
        return;
      }
      updated = selectedAnimals.filter(idx => idx !== index);
    } else {
      if (selectedAnimals.length >= 10) {
        showToast("Maximum 10 animal herds allowed!");
        return;
      }
      updated = [...selectedAnimals, index].sort((a, b) => a - b);
    }
    setSelectedAnimals(updated);
    setGroupCount(updated.length);
    playSynthSound(450, 0.08, "triangle");
    showToast(
      selectedAnimals.includes(index)
        ? `Removed ${SAFARI_PROFILES[index].animal} (${updated.length} Herds Active)`
        : `Added ${SAFARI_PROFILES[index].animal} (${updated.length} Herds Active)`
    );
  };

  // Core Mixing Engine: Greedy Dealer with Smart Tie-breaking
  const generateTeams = () => {
    if (members.length < 2) {
      showToast("Need at least 2 members to split teams!");
      return;
    }
    if (groupCount < 2 || groupCount > members.length) {
      showToast(`Teams count must be between 2 and ${members.length}`);
      return;
    }

    setIsDealing(true);
    setDealIndex(-1);
    setActiveTab("teams");
    playSynthSound(300, 0.1, "sawtooth");

    // Shuffle helper
    const shuffleArray = <T,>(arr: T[]): T[] => {
      const res = [...arr];
      for (let i = res.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [res[i], res[j]] = [res[j], res[i]];
      }
      return res;
    };

    // 1. Group members by Cell Group
    const buckets: { [key: string]: Member[] } = {};
    members.forEach(m => {
      const normalizedCG = m.cg.trim().replace(/\s+/g, " ");
      if (!buckets[normalizedCG]) buckets[normalizedCG] = [];
      buckets[normalizedCG].push(m);
    });

    // 2. Shuffle internally within each bucket
    const bucketList = Object.keys(buckets).map(cg => {
      return shuffleArray(buckets[cg]);
    });

    // 3. Sort buckets largest-first (greedy priority)
    bucketList.sort((a, b) => b.length - a.length);

    // 4. Initialize target groups
    const COLOR_NAMES = ["Yellows", "Blues", "Oranges", "Reds", "Purples", "Greens", "Pinks", "Teals", "Golds", "Silvers"];
    const activeIndices = selectedAnimals.length === groupCount 
      ? selectedAnimals 
      : Array.from({ length: groupCount }, (_, i) => i);

    const teamNames = activeIndices.map(animalIdx => `Team ${COLOR_NAMES[animalIdx % COLOR_NAMES.length]}`);
    const groups: Team[] = activeIndices.map((animalIdx, i) => ({
      id: i + 1,
      name: teamNames[i],
      members: [],
      color: TEAM_COLOR_PALETTES[animalIdx % TEAM_COLOR_PALETTES.length],
      score: 0,
    }));

    const findSmallestGroupForMember = (targetCG: string): Team => {
      let minLen = Infinity;
      groups.forEach(g => {
        if (g.members.length < minLen) minLen = g.members.length;
      });

      let candidates = groups.filter(g => g.members.length === minLen);

      let minSameCG = Infinity;
      const counts = candidates.map(g => {
        const n = g.members.filter(m => m.cg === targetCG).length;
        if (n < minSameCG) minSameCG = n;
        return n;
      });

      candidates = candidates.filter((_, i) => counts[i] === minSameCG);
      return candidates[Math.floor(Math.random() * candidates.length)];
    };

    // 5. Deal members into selected groups
    bucketList.forEach(bucket => {
      bucket.forEach(member => {
        const targetGroup = findSmallestGroupForMember(member.cg);
        targetGroup.members.push(member);
      });
    });

    setFinalTeams(groups);
    if (typeof window !== "undefined") {
      localStorage.setItem("cg_mixer_teams", JSON.stringify(groups));
    }
    
    // Simulate dealer dealing card effects
    let currentIdx = 0;
    const interval = setInterval(() => {
      setDealIndex(currentIdx);
      playSynthSound(400 + (currentIdx * 10), 0.05, "sine");
      currentIdx++;
      if (currentIdx >= members.length) {
        clearInterval(interval);
        setIsDealing(false);
        playSuccessChirp();
        showToast("Teams generated successfully with maximum mixing!");
      }
    }, Math.max(15, Math.min(120, 1500 / members.length)));
  };

  // Build the showcase share URL (used by both Copy Link and the QR code)
  const buildShareUrl = (): string => {
    const payload = finalTeams.map(t => ({
      name: t.name,
      color: t.color,
      score: t.score ?? 0,
      members: t.members.map(m => ({ name: m.name, cg: m.cg }))
    }));
    return buildShowcaseShareUrl(window.location.origin, payload);
  };

  // Fixed routing path here: pointing directly to `/showcase` instead of `/find-my-team`
  const copyShareLink = () => {
    if (finalTeams.length === 0) return;
    try {
      navigator.clipboard.writeText(buildShareUrl());
      playSuccessChirp();
      showToast("Read-only team viewer link copied!");
    } catch (e) {
      console.error(e);
      showToast("Failed to generate share link!");
    }
  };

  // Calculate same CG overlaps count
  const totalSameCGOverlaps = () => {
    let overlaps = 0;
    finalTeams.forEach(team => {
      const cgCounts: { [key: string]: number } = {};
      team.members.forEach(m => {
        cgCounts[m.cg] = (cgCounts[m.cg] || 0) + 1;
      });
      Object.values(cgCounts).forEach(cnt => {
        if (cnt > 1) overlaps += (cnt - 1);
      });
    });
    return overlaps;
  };

  // Calculate rating grade
  const getMixQualityGrade = () => {
    const overlaps = totalSameCGOverlaps();
    if (overlaps === 0) return { grade: "S", text: "Perfectly dispersed" };
    if (overlaps <= 2) return { grade: "A", text: "Beautifully balanced" };
    if (overlaps <= 5) return { grade: "B", text: "Trail-ready balance" };
    return { grade: "C", text: "Try another shuffle" };
  };

  const rankedTeams = [...finalTeams].sort((a, b) => {
    const scoreDifference = (b.score ?? 0) - (a.score ?? 0);
    return scoreDifference !== 0 ? scoreDifference : a.id - b.id;
  });

  const topScore = rankedTeams[0]?.score ?? 0;
  const runnerUpScore = rankedTeams[1]?.score ?? 0;
  const leadMargin = Math.max(0, topScore - runnerUpScore);
  const leaderTeam = rankedTeams[0];
  const challengerTeams = rankedTeams.slice(1);
  const liveReferenceScore = Math.max(topScore, 1);
  const totalLivePoints = rankedTeams.reduce((total, team) => total + (team.score ?? 0), 0);
  const spotlightTeam = rankedTeams.find((team) => team.id === spotlightTeamId) ?? leaderTeam;
  const podiumTeams = [rankedTeams[1], rankedTeams[0], rankedTeams[2]].filter((team): team is Team => Boolean(team));
  const chasingTeams = rankedTeams.slice(3);
  const leaderTargetProgress = topScore === 0 ? 0 : 100;
  const hasChampion = false;

  const getTeamRank = (teamId: number) => {
    return rankedTeams.findIndex((team) => team.id === teamId) + 1;
  };

  const updateTeamScore = (teamId: number, delta: number) => {
    const team = finalTeams.find((entry) => entry.id === teamId);
    if (!team) return;

    const nextScore = Math.max(0, (team.score ?? 0) + delta);
    setFinalTeams((currentTeams) =>
      currentTeams.map((entry) =>
        entry.id === teamId ? { ...entry, score: nextScore } : entry
      )
    );
    setScoreFlashTeamId(teamId);
    window.setTimeout(() => setScoreFlashTeamId(null), 520);

    if (delta > 0) {
      playSynthSound(520 + Math.min(delta, 100) * 3, 0.12, "square");
    } else {
      playSynthSound(190, 0.12, "sawtooth");
    }
    showToast(`${getSafariTeamLabel(team.name)} ${delta > 0 ? "+" : ""}${delta} points`);
  };

  const resetAllScores = () => {
    if (!window.confirm("Reset every team score to zero?")) return;
    setFinalTeams((currentTeams) =>
      currentTeams.map((team) => ({ ...team, score: 0 }))
    );
    playSynthSound(220, 0.18, "triangle");
    showToast("Safari trail reset. A fresh expedition is ready!");
  };

  const toggleRallyFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      const rallyScreen = document.querySelector<HTMLElement>(".safari-control-overlay");
      await rallyScreen?.requestFullscreen();
    } catch (error) {
      console.warn("Fullscreen mode is unavailable", error);
      showToast("Fullscreen is unavailable in this browser.");
    }
  };

  // GSAP animations for active parts
  useGSAP(() => {
    if (activeTab === "teams" && finalTeams.length > 0 && !isDealing) {
      gsap.fromTo(
        ".team-card",
        { scale: 0.8, y: 50, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "back.out(1.4)" }
      );
    }
  }, [activeTab, finalTeams, isDealing]);

  const shareUrl = showShowcase && finalTeams.length > 0 && typeof window !== "undefined"
    ? buildShareUrl()
    : "";
  const canRenderShareQr = isShowcaseQrSafe(shareUrl);

  return (
    <div ref={containerRef} className="safari-mixer-page min-h-screen text-[#243028] selection:bg-[#F4B942] selection:text-[#243028]">
      <header className="safari-mixer-nav-wrap">
        <div className="safari-mixer-nav">
          <Link
            href="/home"
            className="safari-mixer-back"
          >
            Back to basecamp
          </Link>
          <h1 className="safari-mixer-brand">
            <span className="safari-mixer-brand-mark" aria-hidden="true"><i /><i /><i /></span>
            <span><small>Animal Kingdom</small> Ranger Registration Camp</span>
          </h1>
          {isAuthenticated && (
            <button onClick={handleClearRoster} disabled={members.length === 0} className="safari-clear-roster">
              Clear roster
            </button>
          )}
        </div>
      </header>

      {/* Main Content Space */}
      {!isAuthenticated ? (
        <main className="safari-gate-clearing">
          <div className="safari-ranger-lodge">
            <div className="safari-lodge-sun" aria-hidden="true" />
            <div className="safari-lodge-tree" aria-hidden="true"><i /><i /><i /></div>

            <div className="safari-gate-pass">
              <p className="safari-eyebrow">Staff trail entrance</p>
              <h2>Open the registration lodge</h2>
              <p className="safari-gate-intro">
                Enter the ranger passcode to check in explorers and form balanced animal herds.
              </p>

              <form onSubmit={handleVerifyPasscode} className="safari-gate-form">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 text-black">RANGER PASSCODE</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter passcode..."
                      value={enteredPasscode}
                      onChange={(e) => setEnteredPasscode(e.target.value)}
                      className="w-full px-4 py-3 border-4 border-black font-bold focus:bg-[#FFFDF5] outline-none text-black bg-white placeholder-zinc-400 pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="safari-password-toggle"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 border-2 border-black accent-black rounded cursor-pointer animate-none"
                  />
                  <label htmlFor="rememberMe" className="text-[10px] font-black uppercase cursor-pointer select-none text-black">
                    Keep me logged in
                  </label>
                </div>

                <button
                  type="submit"
                  className="safari-open-lodge"
                >
                  Open registration lodge
                </button>
              </form>
            </div>
          </div>
        </main>
      ) : (
        <main className="safari-mixer-workspace">
          <section className="safari-mixer-hero">
            <div>
              <p className="safari-eyebrow">Morning roll call</p>
              <h2>Gather every explorer. Build every herd.</h2>
              <p>Check in the room, balance the crews, then send the live points ceremony to the big screen.</p>
            </div>
            <div className="safari-mixer-hero-counts" aria-label="Registration summary">
              <span><strong>{members.length}</strong> explorers</span>
              <span><strong>{cellGroups.length}</strong> cell groups</span>
              <span><strong>{finalTeams.length}</strong> animal herds</span>
            </div>
          </section>
        
        {/* Left Side: Setup Command Center Modules (5 cols) */}
        <section className="safari-mixer-setup">
          
          {/* Module 1: Member Intake Panel */}
          <div className="safari-registration-lodge">
            <div className="safari-lodge-awning" aria-hidden="true" />
            <div className="safari-section-heading">
              <span>01</span><div><p>Registration lodge</p><h2>Explorer check-in</h2></div>
            </div>
            
            {/* Check-In Mode Selector Dropdown */}
            <div className="mb-5 pb-4 border-b-4 border-black">
              <label className="block text-[10px] font-black uppercase mb-1">Check-in method</label>
              <select
                value={checkInMethod}
                onChange={(e) => setCheckInMethod(e.target.value as "single" | "bulk" | "sheets")}
                className="w-full px-3 py-2.5 border-4 border-black font-bold bg-[#FFFDF5] text-black outline-none text-xs shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                <option value="single">👤 Single Explorer Check-In</option>
                <option value="bulk">📋 Bulk Text Roster Import</option>
                <option value="sheets">📊 Google Form / Sheets CSV Sync</option>
              </select>
            </div>
            
            {/* Active Check-In Method Form */}
            {checkInMethod === "single" && (
              <form onSubmit={handleAddMember} className="space-y-4 mb-6">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Explorer name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className="w-full px-4 py-2.5 border-4 border-black font-bold focus:bg-[#FFFDF5] outline-none text-black bg-white placeholder-zinc-400 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase mb-1">Home cell group</label>
                    <select
                      value={inputCG || cellGroups[0] || ""}
                      onChange={(e) => setInputCG(e.target.value)}
                      className="w-full px-3 py-2.5 border-4 border-black font-bold bg-white text-black outline-none text-sm"
                    >
                      {cellGroups.map(cg => (
                        <option key={cg} value={cg}>{cg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full brutal-box bg-[#4ADE80] text-black font-black uppercase text-xs py-3 border-2 border-black hover:bg-[#34d399] shadow-[2px_2px_0px_#000] cursor-pointer active:translate-y-0.5"
                    >
                      Check in explorer
                    </button>
                  </div>
                </div>
              </form>
            )}

            {checkInMethod === "bulk" && (
              <div className="mb-6 space-y-3">
                <p className="text-[10px] font-bold text-zinc-500 uppercase leading-relaxed">
                  Paste multiple explorer names directly from Excel or plain text manifest.
                </p>
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="w-full brutal-box bg-[#38BDF8] text-black font-black uppercase text-xs py-3.5 border-2 border-black hover:bg-[#0ea5e9] shadow-[3px_3px_0px_#000] cursor-pointer active:translate-y-0.5"
                >
                  Import a full roster
                </button>
              </div>
            )}

            {checkInMethod === "sheets" && (
              <div className="mb-6 space-y-3">
                <label className="block text-[10px] font-black uppercase">Google Form trail sync</label>
                <p className="text-[9px] font-bold text-zinc-500 mb-2 uppercase leading-relaxed">
                  In your response sheet: File → Share → Publish to web → &quot;Form Responses 1&quot; as CSV. Paste that link once — it&apos;s remembered.
                </p>
                <input
                  type="text"
                  placeholder="https://docs.google.com/spreadsheets/d/e/...output=csv"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black text-[10px] font-bold font-mono outline-none text-black bg-white placeholder-zinc-400 mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSheetSync}
                    disabled={isSyncing || !sheetUrl.trim()}
                    className="flex-1 brutal-box bg-[#4ADE80] text-black font-black uppercase text-xs py-3 border-2 border-black hover:bg-[#34d399] disabled:opacity-50 disabled:cursor-not-allowed shadow-[3px_3px_0px_#000] cursor-pointer active:translate-y-0.5"
                  >
                    {isSyncing ? "Syncing responses..." : "Sync responses"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowGuideModal(true);
                      playSynthSound(400, 0.1, "sine");
                    }}
                    title="Open Google Sheets & Apps Script Setup Guide"
                    className="brutal-box bg-[#FACC15] text-black font-black text-xs px-3 py-3 border-2 border-black hover:bg-[#eab308] shadow-[3px_3px_0px_#000] cursor-pointer active:translate-y-0.5 flex items-center justify-center gap-1 shrink-0"
                  >
                    <span>📖</span> Setup Guide
                  </button>
                </div>
              </div>
            )}

            <div className="border-t-4 border-black pt-4">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-[10px] font-black uppercase">Cell-group trail markers</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCellGroups(PRESET_CG_NAMES);
                      showToast("Reset trail markers to Jason, Lemuel, Rebecca, Jackson");
                      playSynthSound(450, 0.08, "sine");
                    }}
                    className="text-[8px] font-mono text-black bg-white hover:bg-zinc-100 px-2 py-0.5 border border-black font-black shadow-[1px_1px_0px_#000] cursor-pointer"
                    title="Reset trail markers to default presets"
                  >
                    Reset presets
                  </button>
                  <span className="text-[9px] bg-gray-200 font-bold px-2 py-0.5 border border-black uppercase font-mono">
                    {cellGroups.length} GROUPS
                  </span>
                </div>
              </div>
              
              {/* Dynamic Groups Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {cellGroups.map(cg => (
                  <span
                    key={cg}
                    className={`inline-flex items-center gap-1 ${getGroupColor(cg)} text-black font-bold text-[10px] px-2.5 py-1 border-2 border-black shadow-[1px_1px_0px_#000]`}
                  >
                    {cg.toUpperCase()}
                    <button
                      onClick={() => removeCellGroup(cg)}
                      className="text-black hover:text-red-600 font-black ml-1 text-xs leading-none"
                      title="Remove cell group"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add New Cell Group inline */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Group Name"
                  value={newCGName}
                  onChange={(e) => setNewCGName(e.target.value)}
                  className="flex-1 px-3 py-2 border-2 border-black text-xs font-bold outline-none text-black bg-white placeholder-zinc-400"
                />
                <button
                  onClick={addCellGroup}
                  className="brutal-box bg-white text-black font-black uppercase text-[10px] px-3 py-2 border-2 border-black hover:bg-gray-100 shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  Add group
                </button>
              </div>
            </div>
          </div>

          {/* Module 2: Shuffler Configuration Panel */}
          <div className="safari-herd-trail">
            <div className="safari-section-heading">
              <span>02</span><div><p>Herd-forming trail</p><h2>Expedition setup</h2></div>
            </div>
            
            <div className="space-y-6">
              {/* Herd Count Selector with Stepper & Quick Chips */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black uppercase tracking-wider">How many animal herds?</label>
                  <span className="brutal-font text-base bg-black text-[#FACC15] px-3 py-1 border-2 border-black font-mono shadow-[2px_2px_0px_#000]">
                    {groupCount} HERDS
                  </span>
                </div>

                {/* Range Slider + Stepper controls */}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => changeHerdCount(groupCount - 1)}
                    disabled={groupCount <= 2}
                    className="w-10 h-10 brutal-box bg-white text-black font-black text-lg border-2 border-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000] flex items-center justify-center cursor-pointer active:translate-y-0.5"
                    title="Decrease herds"
                  >
                    −
                  </button>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="2"
                      max={Math.max(2, members.length)}
                      value={groupCount}
                      onChange={(e) => changeHerdCount(parseInt(e.target.value, 10))}
                      className="w-full accent-black cursor-pointer bg-black h-2 rounded-full outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => changeHerdCount(groupCount + 1)}
                    disabled={groupCount >= Math.max(2, members.length)}
                    className="w-10 h-10 brutal-box bg-white text-black font-black text-lg border-2 border-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000] flex items-center justify-center cursor-pointer active:translate-y-0.5"
                    title="Increase herds"
                  >
                    +
                  </button>
                </div>

                {/* Quick Count Chips & Explorer Ratio */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                  <div className="flex gap-1.5">
                    {[4, 6, 8, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => changeHerdCount(num)}
                        className={`text-[9px] font-black font-mono px-2.5 py-1 border-2 border-black shadow-[1px_1px_0px_#000] cursor-pointer transition-all ${
                          groupCount === num
                            ? "bg-black text-[#FACC15]"
                            : "bg-white text-black hover:bg-zinc-100"
                        }`}
                      >
                        {num} Herds
                      </button>
                    ))}
                  </div>
                  <span className="text-[9px] font-mono font-bold uppercase text-zinc-600">
                    {members.length > 0
                      ? `~${Math.ceil(members.length / groupCount)} explorers / herd`
                      : "Add explorers first"}
                  </span>
                </div>
              </div>

              {/* Animal Realm Exclusive Showcase Banner */}
              <div className="border-4 border-black bg-[#FFFDF5] p-4 shadow-[4px_4px_0px_#000] relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🦁</span>
                    <div>
                      <span className="brutal-font text-xs uppercase tracking-wider text-black block leading-none">
                        Animal Realm
                      </span>
                      <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase">
                        Wild Safari Expedition Theme
                      </span>
                    </div>
                  </div>
                  <span className="bg-[#4ADE80] text-black font-black text-[9px] uppercase px-2 py-0.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
                    ✓ ONLY THEME ACTIVE
                  </span>
                </div>

                <p className="text-[10px] font-bold text-zinc-600 mb-3 uppercase leading-relaxed flex items-center justify-between">
                  <span>Click any animal card to freely toggle individual herds ON or OFF:</span>
                  <span className="font-mono text-[9px] text-black bg-[#FACC15] px-2 py-0.5 border border-black font-black shadow-[1px_1px_0px_#000] shrink-0">
                    {selectedAnimals.length} / 10 SELECTED
                  </span>
                </p>

                {/* Animal Herds Preview Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {SAFARI_PROFILES.map((profile, i) => {
                    const isSelected = selectedAnimals.includes(i);
                    return (
                      <button
                        key={profile.animal}
                        type="button"
                        onClick={() => toggleAnimalSelection(i)}
                        title={`Click to ${isSelected ? "deselect" : "select"} ${profile.animal} ${profile.collective}`}
                        className={`p-2 border-2 border-black text-center flex flex-col items-center justify-center transition-all cursor-pointer select-none rounded-lg relative ${
                          isSelected
                            ? "bg-white shadow-[2px_2px_0px_#000] hover:bg-[#FACC15] hover:scale-[1.04] active:translate-y-0.5"
                            : "bg-zinc-100/70 opacity-40 border-dashed hover:opacity-100 hover:border-black hover:border-solid hover:bg-white hover:shadow-[2px_2px_0px_#000]"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-1 right-1 text-[8px] font-black text-black leading-none bg-[#4ADE80] px-1 py-0.5 rounded-sm border border-black shadow-[0.5px_0.5px_0px_#000]">
                            ✓
                          </span>
                        )}
                        <span className="text-lg leading-none mb-0.5">{profile.emoji}</span>
                        <span className="text-[9px] font-black uppercase text-black truncate w-full">
                          {profile.animal}
                        </span>
                        <span className="text-[7px] font-bold font-mono text-zinc-500 uppercase truncate w-full">
                          {profile.collective}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Action CTA */}
              <button
                onClick={generateTeams}
                disabled={members.length < 2 || isDealing}
                className="w-full brutal-font text-lg bg-black text-[#FACC15] hover:text-[#fff] hover:bg-zinc-950 py-4 border-4 border-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[6px_6px_0px_#000] cursor-pointer active:translate-x-[4px] active:translate-y-[4px] active:shadow-[2px_2px_0px_#000] flex items-center justify-center gap-2"
              >
                <span className="text-xl">🦁</span>
                <span>{isDealing ? "Guides are forming herds..." : "Form balanced animal herds"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right Side: Roster ledger and shuffler boards (7 cols) */}
        <section className="safari-ranger-ledger">
          
          {/* Tab Navigation knobs */}
          <div className="safari-ledger-tabs" role="tablist" aria-label="Ranger ledger views">
            <button
              role="tab"
              aria-selected={activeTab === "roster"}
              onClick={() => setActiveTab("roster")}
              className={`brutal-font text-base sm:text-lg px-6 py-4 uppercase border-4 border-black border-b-0 rounded-t-2xl transition-all duration-200 shadow-[4px_0_0_#000] cursor-pointer ${
                activeTab === "roster"
                  ? "bg-[#FACC15] text-black -translate-y-1.5 h-15"
                  : "bg-gray-300 text-gray-600 hover:bg-gray-200 mt-2 h-13"
              }`}
            >
              Explorer ledger ({members.length})
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "teams"}
              onClick={() => {
                if (finalTeams.length > 0) setActiveTab("teams");
              }}
              disabled={finalTeams.length === 0}
              className={`brutal-font text-base sm:text-lg px-6 py-4 uppercase border-4 border-black border-b-0 rounded-t-2xl transition-all duration-200 shadow-[4px_0_0_#000] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                activeTab === "teams"
                  ? "bg-[#38BDF8] text-black -translate-y-1.5 h-15"
                  : "bg-gray-300 text-gray-600 hover:bg-gray-200 mt-2 h-13"
              }`}
            >
              Animal herds ({finalTeams.length})
            </button>
          </div>

          {/* Roster Ledger sheet Tab */}
          {activeTab === "roster" && (
            <div className="safari-ledger-sheet">
              <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-6">
                <h3 className="brutal-font text-lg md:text-xl uppercase text-black">Today&apos;s ranger ledger</h3>
                <span className="text-[9px] bg-black text-[#FFFDF5] font-black px-2.5 py-1 border-2 border-black uppercase tracking-wider font-mono">
                  Ready for herd forming
                </span>
              </div>

              {members.length === 0 ? (
                <div className="text-center py-24 border-4 border-dashed border-zinc-300 rounded-2xl bg-zinc-50">
                  <p className="font-black text-xl text-zinc-400 mb-2 uppercase">Ledger is Empty</p>
                  <p className="text-xs text-zinc-500 mb-6 max-w-xs mx-auto uppercase">
                    Manually add players on the left or paste your sheet roster values.
                  </p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[520px] border-4 border-black shadow-[4px_4px_0px_#000]">
                  <table className="w-full text-left border-collapse text-xs text-black">
                    <thead>
                      <tr className="bg-black text-[#FFFDF5] border-b-4 border-black">
                        <th className="p-3.5 font-black uppercase text-left w-12 font-mono">#</th>
                        <th className="p-3.5 font-black uppercase">Explorer</th>
                        <th className="p-3.5 font-black uppercase">Home group</th>
                        <th className="p-3.5 font-black uppercase text-right w-28 whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black bg-[#FFFDF5]">
                      {members.map((m, idx) => (
                        <tr key={m.id} className="hover:bg-zinc-100 font-bold transition-colors">
                          <td className="p-3.5 text-zinc-500 font-mono">{members.length - idx}</td>
                          <td className="p-3.5 text-base font-black truncate max-w-[180px]">{m.name}</td>
                          <td className="p-3.5">
                            <span className={`inline-block ${getGroupColor(m.cg)} text-black text-[9px] px-2.5 py-1 border-2 border-black font-black uppercase tracking-wider shadow-[1px_1px_0px_#000]`}>
                              {m.cg}
                            </span>
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(m.id)}
                              className="inline-flex items-center gap-1 bg-[#E8614D] !text-white hover:bg-[#d54e3a] font-black uppercase text-[9px] px-2.5 py-1 border-2 border-black shadow-[1.5px_1.5px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2.5px_2.5px_0px_#000] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all cursor-pointer rounded-md whitespace-nowrap"
                              title={`Remove ${m.name} from roster`}
                            >
                              <span className="text-white font-black">✕</span>
                              <span className="text-white font-black">Remove</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Shuffler Results tab */}
          {activeTab === "teams" && finalTeams.length > 0 && (
            <div className="safari-herd-results">
              
              {/* Herd handoff actions */}
              <div className="safari-herd-actions">
                <span className="font-black text-xs uppercase tracking-wider">The herds are ready for the savanna</span>
                <div className="flex gap-2.5 flex-wrap">
                  <button
                    onClick={copyShareLink}
                    className="brutal-box bg-[#38BDF8] text-black font-black uppercase text-xs px-4 py-2.5 border-2 border-black hover:bg-[#0ea5e9] shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer"
                  >
                    Copy explorer link
                  </button>
                  <button
                    onClick={() => {
                      setShowShowcase(true);
                      playSynthSound(600, 0.2, "sine");
                    }}
                    className="brutal-box bg-[#FACC15] text-black font-black uppercase text-xs px-4 py-2.5 border-2 border-black hover:bg-[#eab308] shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer"
                  >
                    Open points ceremony
                  </button>
                </div>
              </div>

              {/* Dealing simulation screen overlay */}
              {isDealing && (
                <div className="safari-herds-gathering">
                  <h4>Herds are gathering...</h4>
                  <div className="flex justify-center items-center gap-4 my-6">
                    <div className="w-16 h-24 bg-[#F2A85B] border-4 border-[#243028] rounded-[45%] shadow-[4px_4px_0px_#243028] transform rotate-[-12deg] flex items-center justify-center animate-pulse">
                      <span className="text-[#243028] font-black text-3xl">L</span>
                    </div>
                    <div className="w-16 h-24 bg-[#5CC8E8] border-4 border-[#243028] rounded-[45%] shadow-[4px_4px_0px_#243028] transform translate-y-[-10px] flex items-center justify-center scale-105">
                      <span className="text-[#243028] font-black text-3xl">E</span>
                    </div>
                    <div className="w-16 h-24 bg-[#B7DF77] border-4 border-[#243028] rounded-[45%] shadow-[4px_4px_0px_#243028] transform rotate-[12deg] flex items-center justify-center animate-pulse">
                      <span className="text-[#243028] font-black text-3xl">G</span>
                    </div>
                  </div>
                  <p className="font-bold text-lg text-[#FFFDF5]">
                    Placing <span className="text-[#B7DF77] font-black uppercase underline">{members[dealIndex]?.name || "explorers..."}</span>
                  </p>
                  <p className="text-[10px] font-mono text-[#B7DF77]/75 mt-2 uppercase tracking-wider">
                    The herd guide is balancing each animal crew
                  </p>
                </div>
              )}

              {/* Quality Stats Board */}
              {!isDealing && (
                <div className="safari-mix-report">
                  <div className="safari-mix-report-heading">
                    <div>
                      <p className="safari-eyebrow">Ranger&apos;s field report</p>
                      <h3>The herds found their trail.</h3>
                    </div>
                    <p>Balanced across cell groups and ready for the first challenge.</p>
                  </div>

                  {/* Quality rating grade metric */}
                  <div className="safari-mix-grade">
                    <div className="safari-grade-medallion"><strong>{getMixQualityGrade().grade}</strong></div>
                    <div>
                      <span>Trail balance</span>
                      <h4>{getMixQualityGrade().text}</h4>
                      <small>{totalSameCGOverlaps() === 0 ? "No cell-group collisions" : `${totalSameCGOverlaps()} overlaps to watch`}</small>
                    </div>
                    <div className="safari-grade-trail" aria-hidden="true"><i /><i /><i /><i /></div>
                  </div>

                  <div className="safari-mix-counts">
                    <div className="is-explorers">
                      <i aria-hidden="true" />
                      <span>Explorers</span>
                      <strong>{members.length}</strong>
                      <small>checked in</small>
                    </div>
                    <div className="is-overlaps">
                      <i aria-hidden="true" />
                      <span>Overlaps</span>
                      <strong>{totalSameCGOverlaps()}</strong>
                      <small>same-group pairs</small>
                    </div>
                    <div className="is-herds">
                      <i aria-hidden="true" />
                      <span>Animal herds</span>
                      <strong>{finalTeams.length}</strong>
                      <small>ready to roam</small>
                    </div>
                  </div>
                </div>
              )}

              {/* Teams cards Deck Grid */}
              {!isDealing && (
                <div className="safari-herd-camp-grid">
                  {finalTeams.map((team, teamIndex) => (
                    <div
                      key={team.id}
                      className="team-card safari-generated-herd"
                      data-animal={getSafariTeamProfile(team.name).animal.toLowerCase()}
                      style={{ "--team-accent": getTeamAccent(team.color, teamIndex) } as CSSProperties}
                    >
                      <div className="safari-herd-habitat" aria-hidden="true">
                        <i className="habitat-sun" />
                        <i className="habitat-hill hill-one" />
                        <i className="habitat-hill hill-two" />
                        <i className="habitat-tree"><b /><b /><b /></i>
                        <span className="habitat-tracks"><b /><b /><b /></span>
                      </div>
                      {/* Team Header */}
                      <div className="safari-generated-herd-head">
                        <TeamMark name={team.name} compact />
                        <h4>
                          <small>Herd {teamIndex + 1}</small>{getSafariTeamLabel(team.name)}
                        </h4>
                        <span>
                          {team.members.length} explorers
                        </span>
                      </div>

                      {/* Team Members List */}
                      <ul className="safari-generated-roster">
                        {team.members.map((m, idx) => (
                          <li key={m.id}>
                            <span className="safari-roster-name">
                              <span>{String(idx + 1).padStart(2, "0")}</span>
                              <b>{m.name}</b>
                            </span>
                          </li>
                        ))}
                        {team.members.length === 0 && (
                          <li className="is-empty">This campsite is waiting for explorers.</li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      )}

      {/* Bulk Import Modal dialog box */}
      {showBulkModal && (
        <div className="safari-modal-backdrop">
          <div className="safari-import-tent" role="dialog" aria-modal="true" aria-labelledby="import-roster-title">
            <button
              onClick={() => {
                setShowBulkModal(false);
                playSynthSound(400, 0.1, "sine");
              }}
              className="absolute top-4 right-4 brutal-box bg-red-500 text-white font-black text-base w-8 h-8 flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              ×
            </button>
            <h3 id="import-roster-title" className="brutal-font text-xl md:text-2xl mb-3 uppercase text-[#243028] border-b-2 border-black pb-2">
              Bring in the explorer manifest
            </h3>
            
            <p className="text-[10px] font-bold text-zinc-500 mb-4 leading-relaxed uppercase">
              Copy-paste values directly from Excel or Google Sheets. Columns will auto-map (Name, Group):
              <span className="block mt-2 font-mono text-[9px] text-zinc-600 bg-gray-100 p-2.5 border border-dashed border-gray-300 font-normal normal-case leading-normal">
                Supported formatting presets:<br />
                - Alex Chew (Jason CG)<br />
                - Alex Chew, Lemuel<br />
                - Alex Chew - Jason<br />
                - Alex Chew (defaults to general lead if blank)
              </span>
            </p>

            <textarea
              rows={8}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="Paste names here... (one player name per line)"
              className="w-full p-4 border-4 border-black font-bold font-mono text-xs mb-6 outline-none bg-[#FFFDF5] text-black placeholder-zinc-400"
            ></textarea>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowBulkModal(false)}
                className="brutal-box bg-white text-black font-black uppercase text-xs px-5 py-3 border-2 border-black hover:bg-gray-100 shadow-[3px_3px_0px_#000] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkImport}
                className="brutal-box bg-[#38BDF8] text-black font-black uppercase text-xs px-5 py-3 border-2 border-black hover:bg-[#0ea5e9] shadow-[3px_3px_0px_#000] cursor-pointer"
              >
                Import explorers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets & Apps Script Setup Guide Bottom Sheet */}
      {showGuideModal && (
        <div className="safari-modal-backdrop" onClick={() => setShowGuideModal(false)}>
          <div
            className="safari-import-tent max-w-2xl w-full max-h-[88vh] flex flex-col my-auto overflow-hidden animate-in slide-in-from-bottom duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheets-guide-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setShowGuideModal(false);
                playSynthSound(400, 0.1, "sine");
              }}
              className="absolute top-4 right-4 brutal-box bg-red-500 text-white font-black text-base w-8 h-8 flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer z-10"
            >
              ×
            </button>

            {/* Header */}
            <div className="border-b-4 border-black pb-3 pr-10">
              <span className="inline-block bg-[#FACC15] text-black font-black text-[9px] uppercase px-2 py-0.5 border border-black mb-1 shadow-[1px_1px_0px_#000]">
                Integration Cheat Sheet
              </span>
              <h3 id="sheets-guide-title" className="brutal-font text-xl md:text-2xl uppercase text-[#243028] leading-tight">
                Google Sheets & Apps Script Guide
              </h3>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b-2 border-black py-3 bg-[#fff3c4] shrink-0">
              <button
                type="button"
                onClick={() => {
                  setGuideTab("csv");
                  playSynthSound(500, 0.05, "sine");
                }}
                className={`px-3 py-1.5 font-black uppercase text-[10px] border-2 border-black cursor-pointer transition-all ${
                  guideTab === "csv"
                    ? "bg-[#38BDF8] text-black shadow-[2px_2px_0px_#000]"
                    : "bg-white text-zinc-600 hover:bg-gray-100"
                }`}
              >
                1. Publish CSV Link (Direct Sync)
              </button>
              <button
                type="button"
                onClick={() => {
                  setGuideTab("appscript");
                  playSynthSound(500, 0.05, "sine");
                }}
                className={`px-3 py-1.5 font-black uppercase text-[10px] border-2 border-black cursor-pointer transition-all ${
                  guideTab === "appscript"
                    ? "bg-[#FACC15] text-black shadow-[2px_2px_0px_#000]"
                    : "bg-white text-zinc-600 hover:bg-gray-100"
                }`}
              >
                2. Google Apps Script Code
              </button>
            </div>

            {/* Tab Content (Scrollable Body) */}
            <div className="flex-1 overflow-y-auto p-1 pt-3 space-y-4 text-xs">
              {guideTab === "csv" ? (
                <div className="space-y-3">
                  <div className="bg-amber-100/70 border-2 border-black p-3 shadow-[2px_2px_0px_#000]">
                    <h4 className="font-black uppercase text-[11px] text-black mb-1 flex items-center gap-1.5">
                      <span className="text-sm">⚡</span> Fastest Setup — No Code Required
                    </h4>
                    <p className="text-[10px] font-semibold text-zinc-700 leading-normal">
                      Publish your Google Sheet responses as a CSV web link. The Mixer auto-parses names &amp; cell groups and deduplicates repeat submissions.
                    </p>
                  </div>

                  <ol className="space-y-2.5 font-medium text-[11px]">
                    <li className="flex gap-3 items-start bg-white p-3 border-2 border-black shadow-[2px_2px_0px_#000]">
                      <span className="bg-[#38BDF8] text-black font-black text-[11px] w-6 h-6 rounded-full border border-black flex items-center justify-center shrink-0">1</span>
                      <div>
                        <strong className="font-black uppercase block text-black">Open Response Sheet</strong>
                        Open the Google Sheet linked to your Google Form.
                      </div>
                    </li>
                    <li className="flex gap-3 items-start bg-white p-3 border-2 border-black shadow-[2px_2px_0px_#000]">
                      <span className="bg-[#38BDF8] text-black font-black text-[11px] w-6 h-6 rounded-full border border-black flex items-center justify-center shrink-0">2</span>
                      <div>
                        <strong className="font-black uppercase block text-black">Click File → Share → Publish to web</strong>
                        In the top menu bar: <code className="bg-gray-100 px-1 border border-black text-[10px]">File</code> → <code className="bg-gray-100 px-1 border border-black text-[10px]">Share</code> → <code className="bg-gray-100 px-1 border border-black text-[10px]">Publish to web</code>.
                      </div>
                    </li>
                    <li className="flex gap-3 items-start bg-white p-3 border-2 border-black shadow-[2px_2px_0px_#000]">
                      <span className="bg-[#38BDF8] text-black font-black text-[11px] w-6 h-6 rounded-full border border-black flex items-center justify-center shrink-0">3</span>
                      <div>
                        <strong className="font-black uppercase block text-black">Configure Dropdowns</strong>
                        - Dropdown 1: Select <span className="font-bold text-black">&quot;Form Responses 1&quot;</span><br />
                        - Dropdown 2: Select <span className="font-bold text-black">&quot;Comma-separated values (.csv)&quot;</span>
                      </div>
                    </li>
                    <li className="flex gap-3 items-start bg-white p-3 border-2 border-black shadow-[2px_2px_0px_#000]">
                      <span className="bg-[#38BDF8] text-black font-black text-[11px] w-6 h-6 rounded-full border border-black flex items-center justify-center shrink-0">4</span>
                      <div>
                        <strong className="font-black uppercase block text-black">Publish &amp; Copy Link</strong>
                        Click <span className="font-bold text-blue-700">&quot;Publish&quot;</span>, copy the generated URL (<code className="bg-gray-100 px-1 border text-[9px] font-mono">https://docs.google.com/spreadsheets/...output=csv</code>), and paste it into the sync box in the Mixer!
                      </div>
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-amber-100/70 border-2 border-black p-3 shadow-[2px_2px_0px_#000]">
                    <h4 className="font-black uppercase text-[11px] text-black mb-1 flex items-center gap-1.5">
                      <span className="text-sm">🛠️</span> Google Apps Script Code
                    </h4>
                    <p className="text-[10px] font-semibold text-zinc-700 leading-normal">
                      Use this script inside Google Sheets (<code className="bg-white px-1 border border-black text-[10px]">Extensions → Apps Script</code>) to process, deduplicate, or format responses directly inside Google Sheets.
                    </p>
                  </div>

                  <ol className="space-y-1.5 font-medium text-[11px]">
                    <li className="flex gap-2 items-center">
                      <span className="font-black text-black">1.</span> In Google Sheet, click <code className="bg-white px-1.5 py-0.5 border border-black text-[10px]">Extensions → Apps Script</code>.
                    </li>
                    <li className="flex gap-2 items-center">
                      <span className="font-black text-black">2.</span> Replace contents of <code className="bg-white px-1.5 py-0.5 border border-black text-[10px]">Code.gs</code> with the script below.
                    </li>
                    <li className="flex gap-2 items-center">
                      <span className="font-black text-black">3.</span> Press <code className="bg-white px-1 border border-black text-[10px]">Cmd + S</code>, select <code className="bg-white px-1 border border-black text-[10px]">formatCellgroupRoster</code>, and click <code className="bg-white px-1 border border-black text-[10px]">▶ Run</code>.
                    </li>
                  </ol>

                  <div className="relative border-2 border-black bg-zinc-900 text-amber-300 p-3 font-mono text-[10px] overflow-x-auto shadow-[3px_3px_0px_#000]">
                    <button
                      type="button"
                      onClick={() => {
                        const code = `/**
 * Google Apps Script for Cellgroup Games Response Sheet
 * Open Sheet -> Extensions -> Apps Script -> Paste this script
 */
function formatCellgroupRoster() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    Logger.log("No data rows found.");
    return;
  }
  
  var headers = data[0].map(function(h) { return h.toString().trim().toLowerCase(); });
  
  // Find Name and Cell Group column indices
  var nameCol = headers.findIndex(function(h) { return h.includes("name"); });
  var cgCol = headers.findIndex(function(h) { return h.includes("cell group") || h.includes("cg"); });
  
  if (nameCol === -1 || cgCol === -1) {
    SpreadsheetApp.getUi().alert("Error: Couldn't find 'Name' or 'Cell Group' column headers!");
    return;
  }
  
  // Deduplicate by Name (latest response wins)
  var latestPlayers = {};
  for (var i = 1; i < data.length; i++) {
    var name = data[i][nameCol].toString().trim();
    var cg = data[i][cgCol].toString().trim();
    if (name && cg) {
      latestPlayers[name.toLowerCase()] = { name: name, cellGroup: cg };
    }
  }
  
  Logger.log("Unique Players Count: " + Object.keys(latestPlayers).length);
  return Object.values(latestPlayers);
}`;
                        navigator.clipboard.writeText(code);
                        showToast("Apps Script copied to clipboard!");
                        playSynthSound(600, 0.1, "sine");
                      }}
                      className="absolute top-2 right-2 bg-[#FACC15] text-black font-black text-[9px] uppercase px-2 py-1 border border-black hover:bg-[#eab308] cursor-pointer shadow-[1px_1px_0px_#000] active:translate-y-0.5 z-10"
                    >
                      📋 Copy Script
                    </button>
                    <pre className="whitespace-pre overflow-x-auto text-emerald-300">
{`/**
 * Google Apps Script for Cellgroup Games Response Sheet
 * Open Sheet -> Extensions -> Apps Script -> Paste this script
 */
function formatCellgroupRoster() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    Logger.log("No data rows found.");
    return;
  }
  
  var headers = data[0].map(function(h) { return h.toString().trim().toLowerCase(); });
  
  // Find Name and Cell Group column indices
  var nameCol = headers.findIndex(function(h) { return h.includes("name"); });
  var cgCol = headers.findIndex(function(h) { return h.includes("cell group") || h.includes("cg"); });
  
  if (nameCol === -1 || cgCol === -1) {
    SpreadsheetApp.getUi().alert("Error: Couldn't find 'Name' or 'Cell Group' column headers!");
    return;
  }
  
  // Deduplicate by Name (latest response wins)
  var latestPlayers = {};
  for (var i = 1; i < data.length; i++) {
    var name = data[i][nameCol].toString().trim();
    var cg = data[i][cgCol].toString().trim();
    if (name && cg) {
      latestPlayers[name.toLowerCase()] = { name: name, cellGroup: cg };
    }
  }
  
  Logger.log("Unique Players Count: " + Object.keys(latestPlayers).length);
  return Object.values(latestPlayers);
}`}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t-2 border-black flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowGuideModal(false);
                  playSynthSound(400, 0.1, "sine");
                }}
                className="brutal-box bg-white text-black font-black uppercase text-xs px-5 py-2 border-2 border-black hover:bg-gray-100 shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}




      {/* Open-ended Safari Rally projector overlay */}
      {showShowcase && finalTeams.length > 0 && (
        <div className="safari-control-overlay">
          <div className="safari-rally-screen" role="dialog" aria-modal="true" aria-labelledby="safari-rally-title">
            <header className="safari-rally-nav">
              <button
                type="button"
                className="safari-rally-close"
                onClick={() => {
                  setShowShowcase(false);
                  if (document.fullscreenElement) void document.exitFullscreen();
                  playSynthSound(400, 0.15, "triangle");
                }}
              >
                Close rally
              </button>

              <div className="safari-rally-brand">
                <span className="safari-rally-brand-mark" aria-hidden="true"><i /><i /><i /></span>
                <div>
                  <small>Animal Kingdom · live</small>
                  <strong>Safari Rally</strong>
                </div>
              </div>

              <div className="safari-rally-tools">
                <button
                  type="button"
                  onClick={openDuelArena}
                  className="!bg-[#4ADE80] !text-black font-black uppercase text-[10px] px-3 py-1.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] hover:!bg-[#34d399] transition-all cursor-pointer flex items-center gap-1"
                  title="Launch Game 1 1v1 Head-to-Head Duel Arena"
                >
                  <span>⚔️</span> Game 1 Duel
                </button>
                <span className="safari-rally-live"><i aria-hidden="true" /> Live counting</span>
                <button type="button" onClick={() => setShowRangerControls((visible) => !visible)}>
                  {showRangerControls ? "Hide controls" : "Ranger controls"}
                </button>
                <button type="button" onClick={toggleRallyFullscreen}>Full screen</button>
              </div>
            </header>

            <section className="safari-broadcast-banner">
              <div className="safari-broadcast-sun" aria-hidden="true" />
              <div className="safari-broadcast-hill" aria-hidden="true" />
              <div className="safari-broadcast-fence" aria-hidden="true">
                <svg viewBox="0 0 60 70" className="fence-svg">
                  <path d="M 14 15 L 22 15 L 22 65 L 14 65 Z" fill="#4a241b" stroke="#23382d" strokeWidth="2.5" />
                  <path d="M 14 15 L 18 8 L 22 15 Z" fill="#5c2e22" stroke="#23382d" strokeWidth="2.5" />
                  <path d="M 44 10 L 52 10 L 52 60 L 44 60 Z" fill="#4a241b" stroke="#23382d" strokeWidth="2.5" />
                  <path d="M 44 10 L 48 3 L 52 10 Z" fill="#5c2e22" stroke="#23382d" strokeWidth="2.5" />
                  <path d="M 6 22 L 56 17 L 56 26 L 6 31 Z" fill="#361912" stroke="#23382d" strokeWidth="2.5" />
                  <path d="M 6 40 L 56 35 L 56 44 L 6 49 Z" fill="#361912" stroke="#23382d" strokeWidth="2.5" />
                </svg>
              </div>
              <div className="safari-jumping-herd" aria-hidden="true">
                <div className="jumping-sheep sheep-1">
                  <svg viewBox="0 0 100 80" className="sheep-svg">
                    <g className="sheep-legs">
                      <rect x="64" y="46" width="7" height="20" rx="3.5" fill="#e58c72" transform="rotate(-35 64 46)" />
                      <rect x="64" y="60" width="7" height="6" fill="#361912" transform="rotate(-35 64 46)" />
                      <rect x="74" y="42" width="7" height="20" rx="3.5" fill="#d97a60" transform="rotate(-22 74 42)" />
                      <rect x="74" y="56" width="7" height="6" fill="#2d130d" transform="rotate(-22 74 42)" />
                      <rect x="20" y="46" width="7" height="20" rx="3.5" fill="#e58c72" transform="rotate(32 20 46)" />
                      <rect x="20" y="60" width="7" height="6" fill="#361912" transform="rotate(32 20 46)" />
                      <rect x="28" y="50" width="7" height="20" rx="3.5" fill="#d97a60" transform="rotate(42 28 50)" />
                      <rect x="28" y="64" width="7" height="6" fill="#2d130d" transform="rotate(42 28 50)" />
                    </g>
                    <path
                      d="M 30 25 a 10 10 0 0 1 14 -5 a 11 11 0 0 1 16 0 a 10 10 0 0 1 14 5 a 10 10 0 0 1 10 12 a 10 10 0 0 1 -4 14 a 11 11 0 0 1 -12 8 a 10 10 0 0 1 -16 2 a 10 10 0 0 1 -16 -6 a 10 10 0 0 1 -8 -14 a 10 10 0 0 1 2 -16 z"
                      fill="#FFFDF5" stroke="#23382d" strokeWidth="2.5" strokeLinejoin="round"
                    />
                    <g className="sheep-head-group">
                      <ellipse cx="22" cy="30" rx="10" ry="9" fill="#e58c72" stroke="#23382d" strokeWidth="2" />
                      <circle cx="25" cy="34" r="3.2" fill="#d96951" opacity="0.65" />
                      <path d="M 28 24 C 36 20, 36 30, 28 27 Z" fill="#d97a60" stroke="#23382d" strokeWidth="2" />
                      <circle cx="18" cy="28" r="2.2" fill="#23382d" />
                      <path d="M 15 33 Q 18 36 21 33" fill="none" stroke="#23382d" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="22" cy="22" r="6" fill="#FFFDF5" stroke="#23382d" strokeWidth="2" />
                      <circle cx="27" cy="21" r="5" fill="#FFFDF5" stroke="#23382d" strokeWidth="2" />
                    </g>
                  </svg>
                </div>
                <div className="jumping-sheep sheep-2">
                  <svg viewBox="0 0 100 80" className="sheep-svg">
                    <g className="sheep-legs">
                      <rect x="64" y="46" width="7" height="20" rx="3.5" fill="#e58c72" transform="rotate(-35 64 46)" />
                      <rect x="64" y="60" width="7" height="6" fill="#361912" transform="rotate(-35 64 46)" />
                      <rect x="74" y="42" width="7" height="20" rx="3.5" fill="#d97a60" transform="rotate(-22 74 42)" />
                      <rect x="74" y="56" width="7" height="6" fill="#2d130d" transform="rotate(-22 74 42)" />
                      <rect x="20" y="46" width="7" height="20" rx="3.5" fill="#e58c72" transform="rotate(32 20 46)" />
                      <rect x="20" y="60" width="7" height="6" fill="#361912" transform="rotate(32 20 46)" />
                      <rect x="28" y="50" width="7" height="20" rx="3.5" fill="#d97a60" transform="rotate(42 28 50)" />
                      <rect x="28" y="64" width="7" height="6" fill="#2d130d" transform="rotate(42 28 50)" />
                    </g>
                    <path
                      d="M 30 25 a 10 10 0 0 1 14 -5 a 11 11 0 0 1 16 0 a 10 10 0 0 1 14 5 a 10 10 0 0 1 10 12 a 10 10 0 0 1 -4 14 a 11 11 0 0 1 -12 8 a 10 10 0 0 1 -16 2 a 10 10 0 0 1 -16 -6 a 10 10 0 0 1 -8 -14 a 10 10 0 0 1 2 -16 z"
                      fill="#FFFDF5" stroke="#23382d" strokeWidth="2.5" strokeLinejoin="round"
                    />
                    <g className="sheep-head-group">
                      <ellipse cx="22" cy="30" rx="10" ry="9" fill="#e58c72" stroke="#23382d" strokeWidth="2" />
                      <circle cx="25" cy="34" r="3.2" fill="#d96951" opacity="0.65" />
                      <path d="M 28 24 C 36 20, 36 30, 28 27 Z" fill="#d97a60" stroke="#23382d" strokeWidth="2" />
                      <circle cx="18" cy="28" r="2.2" fill="#23382d" />
                      <path d="M 15 33 Q 18 36 21 33" fill="none" stroke="#23382d" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="22" cy="22" r="6" fill="#FFFDF5" stroke="#23382d" strokeWidth="2" />
                      <circle cx="27" cy="21" r="5" fill="#FFFDF5" stroke="#23382d" strokeWidth="2" />
                    </g>
                  </svg>
                </div>
                <div className="jumping-sheep sheep-3">
                  <svg viewBox="0 0 100 80" className="sheep-svg">
                    <g className="sheep-legs">
                      <rect x="64" y="46" width="7" height="20" rx="3.5" fill="#e58c72" transform="rotate(-35 64 46)" />
                      <rect x="64" y="60" width="7" height="6" fill="#361912" transform="rotate(-35 64 46)" />
                      <rect x="74" y="42" width="7" height="20" rx="3.5" fill="#d97a60" transform="rotate(-22 74 42)" />
                      <rect x="74" y="56" width="7" height="6" fill="#2d130d" transform="rotate(-22 74 42)" />
                      <rect x="20" y="46" width="7" height="20" rx="3.5" fill="#e58c72" transform="rotate(32 20 46)" />
                      <rect x="20" y="60" width="7" height="6" fill="#361912" transform="rotate(32 20 46)" />
                      <rect x="28" y="50" width="7" height="20" rx="3.5" fill="#d97a60" transform="rotate(42 28 50)" />
                      <rect x="28" y="64" width="7" height="6" fill="#2d130d" transform="rotate(42 28 50)" />
                    </g>
                    <path
                      d="M 30 25 a 10 10 0 0 1 14 -5 a 11 11 0 0 1 16 0 a 10 10 0 0 1 14 5 a 10 10 0 0 1 10 12 a 10 10 0 0 1 -4 14 a 11 11 0 0 1 -12 8 a 10 10 0 0 1 -16 2 a 10 10 0 0 1 -16 -6 a 10 10 0 0 1 -8 -14 a 10 10 0 0 1 2 -16 z"
                      fill="#FFFDF5" stroke="#23382d" strokeWidth="2.5" strokeLinejoin="round"
                    />
                    <g className="sheep-head-group">
                      <ellipse cx="22" cy="30" rx="10" ry="9" fill="#e58c72" stroke="#23382d" strokeWidth="2" />
                      <circle cx="25" cy="34" r="3.2" fill="#d96951" opacity="0.65" />
                      <path d="M 28 24 C 36 20, 36 30, 28 27 Z" fill="#d97a60" stroke="#23382d" strokeWidth="2" />
                      <circle cx="18" cy="28" r="2.2" fill="#23382d" />
                      <path d="M 15 33 Q 18 36 21 33" fill="none" stroke="#23382d" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="22" cy="22" r="6" fill="#FFFDF5" stroke="#23382d" strokeWidth="2" />
                      <circle cx="27" cy="21" r="5" fill="#FFFDF5" stroke="#23382d" strokeWidth="2" />
                    </g>
                  </svg>
                </div>
              </div>
              <div className="safari-broadcast-copy">
                <p className="safari-eyebrow">Ranger scorebook · live</p>
                <h2 id="safari-rally-title">Keep the herd moving.</h2>
                <p>Small points, big cheers. Every score updates the trail right away.</p>
              </div>
            </section>

            <main className="safari-podium-layout">
              <LeaderboardSection
                rankedTeams={rankedTeams}
                topScore={topScore}
                leadMargin={leadMargin}
                leaderTeam={leaderTeam}
                spotlightTeam={spotlightTeam}
                setSpotlightTeamId={setSpotlightTeamId}
                scoreFlashTeamId={scoreFlashTeamId}
                showRangerControls={showRangerControls}
                updateTeamScore={updateTeamScore}
                TeamMark={TeamMark}
                ScoreAwardControls={ScoreAwardControls}
                openDuelArena={openDuelArena}
              />

              <aside className="safari-viewer-pass" style={{ "--team-accent": getTeamAccent(spotlightTeam?.color ?? "", Math.max(0, getTeamRank(spotlightTeam?.id ?? 0) - 1)) } as CSSProperties}>
                <header>
                  <span className="safari-viewer-eye" aria-hidden="true"><i /></span>
                  <div><p>Audience access</p><h3>Your team viewer</h3></div>
                  <b>Read only</b>
                </header>

                <div
                  className={`safari-viewer-qr ${canRenderShareQr ? "is-clickable group" : ""}`}
                  onClick={() => canRenderShareQr && setIsQrEnlarged(true)}
                  title={canRenderShareQr ? "Click to enlarge QR code" : undefined}
                >
                  {canRenderShareQr ? (
                    <QRCodeSVG value={shareUrl} size={220} level="M" marginSize={2} className="block" />
                  ) : (
                    <span>Roster is too large for a QR. Use the viewer link.</span>
                  )}
                </div>
                <div className="safari-viewer-copy">
                  <strong>Scan for teams + scores</strong>
                  <p>Audience members can view standings and rosters on any phone camera.</p>
                  <div>
                    <a href={shareUrl} target="_blank" rel="noreferrer">Open viewer</a>
                    <button type="button" onClick={copyShareLink}>Copy link</button>
                    {canRenderShareQr && (
                      <button type="button" onClick={() => setIsQrEnlarged(true)} className="is-enlarge">🔍 Enlarge</button>
                    )}
                  </div>
                </div>

                {spotlightTeam && (
                  <section className="safari-viewer-roster" aria-label={`${getSafariTeamLabel(spotlightTeam.name)} team viewer`}>
                    <div className="safari-viewer-team-heading"><TeamMark name={spotlightTeam.name} compact /><span><small>Selected herd · rank {getTeamRank(spotlightTeam.id)}</small><strong>{getSafariTeamLabel(spotlightTeam.name)}</strong></span><b>{spotlightTeam.score ?? 0}</b></div>
                    <ul>
                      {spotlightTeam.members.map((member, memberIndex) => <li key={member.id}><span>{String(memberIndex + 1).padStart(2, "0")}</span><strong>{member.name}</strong></li>)}
                      {spotlightTeam.members.length === 0 && <li className="is-empty">This herd is waiting for explorers.</li>}
                    </ul>
                  </section>
                )}
              </aside>
            </main>

            <footer className="safari-rally-footer">
              <span>Live trail · standings update after every point</span>
              <span>Quick awards: +1 · +2 · +3 · +5</span>
            </footer>
          </div>

          {/* Enlarged Spectator Access QR Modal */}
          {isQrEnlarged && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity"
              onClick={() => setIsQrEnlarged(false)}
            >
              <div
                className="relative w-full max-w-md bg-[#FFFDF5] text-black border-4 border-black p-6 sm:p-8 rounded-3xl shadow-[10px_10px_0px_#000] flex flex-col items-center gap-5 text-center transform transition-transform"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setIsQrEnlarged(false)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full border-3 border-black bg-[#E8614D] text-white font-black text-sm flex items-center justify-center shadow-[2px_2px_0px_#000] hover:bg-[#d54e3a] hover:scale-105 transition-all cursor-pointer"
                  aria-label="Close enlarged QR modal"
                >
                  ✕
                </button>

                {/* Modal Header */}
                <div>
                  <span className="inline-block bg-[#FACC15] text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 border-2 border-black rounded-full mb-2.5 shadow-[2px_2px_0px_#000]">
                    SPECTATOR ACCESS QR
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black brutal-font uppercase leading-none text-black">
                    SCAN FOR LIVE STANDINGS & ROSTERS
                  </h2>
                  <p className="text-xs font-bold text-zinc-600 mt-2 max-w-xs mx-auto leading-relaxed">
                    Point your phone camera to view live team scores, standings, and player lists on any device.
                  </p>
                </div>

                {/* Giant QR Code Display */}
                <div className="bg-[#38BDF8] p-5 sm:p-6 border-4 border-black rounded-2xl shadow-[6px_6px_0px_#000] w-full flex flex-col items-center justify-center">
                  <div className="bg-[#FFFDF5] p-4 border-4 border-black rounded-xl shadow-[4px_4px_0px_#000] w-full flex justify-center items-center">
                    {canRenderShareQr ? (
                      <QRCodeSVG
                        value={shareUrl}
                        size={280}
                        level="M"
                        marginSize={2}
                        className="w-full max-w-[260px] h-auto block select-none"
                      />
                    ) : (
                      <div className="py-8 px-4 text-center">
                        <span className="text-3xl mb-2 block" aria-hidden="true">⚠️</span>
                        <p className="text-xs font-black uppercase text-red-600">
                          Roster is too large for QR encoding. Use the direct link below.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    type="button"
                    onClick={copyShareLink}
                    className="flex-1 min-h-[44px] px-4 py-2.5 bg-[#FACC15] text-black border-3 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>📋</span> Copy Link
                  </button>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 min-h-[44px] px-4 py-2.5 bg-[#4ADE80] text-black border-3 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000] transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <span>↗</span> Open Viewer
                  </a>
                </div>

                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Press <kbd className="px-1.5 py-0.5 bg-zinc-200 border border-black rounded text-[9px] font-mono text-black">ESC</kbd> or click outside to dismiss
                </span>
              </div>
            </div>
          )}

          <div className="safari-legacy-control-panel max-w-7xl mx-auto w-full space-y-6" aria-hidden="true">
            
            {/* Header section ticket layout */}
            <div className="safari-expedition-pass brutal-box text-[#243028] p-5 rounded-3xl shadow-[12px_12px_0px_#243028] border-8 border-[#243028] flex flex-col items-center gap-4 relative">
              <span className="safari-leaf-marker top-3 left-3" aria-hidden="true" />
              <span className="safari-leaf-marker top-3 right-3" aria-hidden="true" />

              <div className="flex justify-between items-center w-full border-b-4 border-black pb-3">
                <span className="font-mono text-xs text-green-650 uppercase tracking-widest flex items-center gap-2 font-black">
                  <span className="safari-live-dot"></span>
                  • LIVE FROM THE SAVANNA STAGE
                </span>
                <button
                  onClick={() => {
                    setShowShowcase(false);
                    playSynthSound(400, 0.15, "triangle");
                  }}
                  className="brutal-box bg-[#EF4444] text-white font-black text-xs px-5 py-2.5 border-4 border-black shadow-[3px_3px_0px_#000] hover:bg-red-600 uppercase flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] cursor-pointer"
                >
                  🧭 CLOSE SAFARI
                </button>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                <div className="space-y-3 max-w-2xl text-center md:text-left">
                  <span className="bg-black text-[#FFFDF5] text-[10px] font-black px-3 py-1 border-2 border-black uppercase tracking-widest inline-block shadow-[2px_2px_0px_#000]">
                    WILDLIFE GAMES • LIVE STANDINGS
                  </span>
                  <h2 className="safari-title-text brutal-font text-3xl sm:text-4xl text-[#243028] uppercase tracking-wider select-none leading-none">
                    ANIMAL KINGDOM
                  </h2>
                  <p className="font-bold text-zinc-700 text-xs leading-relaxed max-w-xl">
                    Teams are on the trail. Award paw points from ranger control, then share the live Safari Crown standings.
                  </p>
                </div>

                {/* QR Code Ticket Frame */}
                <div className="ticket-tear brutal-box p-3 bg-[#FFFDF5] text-black border-4 border-black shadow-[5px_5px_0px_#000] flex flex-col items-center justify-center shrink-0 relative overflow-visible rounded-2xl w-36">
                  {/* Decorative Ticket Barcode */}
                  <div className="w-full flex justify-between h-3 px-2 mb-1 bg-white border border-zinc-200 py-0.5">
                    <div className="w-1 h-full bg-black"></div>
                    <div className="w-2 h-full bg-black"></div>
                    <div className="w-0.5 h-full bg-black"></div>
                    <div className="w-1.5 h-full bg-black"></div>
                    <div className="w-0.5 h-full bg-black"></div>
                    <div className="w-2.5 h-full bg-black"></div>
                    <div className="w-1 h-full bg-black"></div>
                    <div className="w-1.5 h-full bg-black"></div>
                  </div>

                  <div className="bg-white p-1.5 border-4 border-black mb-1.5 relative z-0 w-24 h-24 flex items-center justify-center">
                    {canRenderShareQr ? (
                      <QRCodeSVG
                        value={shareUrl}
                        size={80}
                        level="M"
                        marginSize={1}
                        className="w-20 h-20 block select-none"
                      />
                    ) : (
                      <div className="text-center px-2">
                        <span className="block text-2xl mb-1" aria-hidden="true">⚠️</span>
                        <span className="block text-[8px] font-black uppercase leading-tight">
                          Roster too large for QR
                        </span>
                        <button
                          type="button"
                          onClick={copyShareLink}
                          className="mt-2 bg-[#FACC15] border-2 border-black px-2 py-1 text-[8px] font-black uppercase shadow-[2px_2px_0px_#000] cursor-pointer"
                        >
                          Copy Link
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-black font-black uppercase tracking-widest font-mono">
                    Scan the trail
                  </span>
                  <span className="text-[6px] text-zinc-500 font-mono mt-1">ADMIT ONE // SERIAL: CG-9957</span>
                </div>
              </div>
            </div>

            {/* Live point control board */}
            <section
              aria-labelledby="live-scoreboard-title"
                    className="safari-scoreboard brutal-box overflow-hidden rounded-3xl border-8 border-[#243028] text-[#243028] shadow-[12px_12px_0px_#243028]"
            >
              <div className="safari-scoreboard-header flex flex-col gap-4 border-b-4 border-[#243028] px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center border-2 border-[#FFFDF5] bg-[#FACC15] text-xl text-black shadow-[3px_3px_0px_#38BDF8]">
                    <span aria-hidden="true">L</span>
                  </span>
                  <div>
                    <p className="font-mono text-[9px] font-black uppercase tracking-[0.28em] text-[#38BDF8]">
                      Safari ranger control / audience trail
                    </p>
                    <h3 id="live-scoreboard-title" className="brutal-font text-xl uppercase tracking-wide sm:text-2xl">
                      Pride Rock points ceremony
                    </h3>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="border-2 border-[#FFFDF5] bg-[#FACC15] px-3 py-2 font-mono text-[9px] font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#38BDF8]">
                    Live score reference: {liveReferenceScore}
                  </span>
                  <p aria-live="polite" className="border-2 border-[#FFFDF5] bg-[#27272A] px-3 py-2 font-mono text-[9px] font-black uppercase tracking-wider">
                    {topScore > 0
                      ? leadMargin > 0
                        ? `👑 ${getSafariTeamLabel(rankedTeams[0]?.name ?? "")} leads by ${leadMargin}`
                        : `Trails tied • ${topScore} points`
                      : "● Trail ready • Safari 01"}
                  </p>
                  <button
                    type="button"
                    onClick={resetAllScores}
                    className="tactile-btn-active border-2 border-[#FFFDF5] bg-[#EF4444] px-3 py-2 font-mono text-[9px] font-black uppercase tracking-wider text-white shadow-[3px_3px_0px_#FFFDF5] transition-transform hover:bg-red-600 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
                  >
                    Reset trail
                  </button>
                </div>
              </div>

              <div className="safari-board-surface p-4 md:p-6">
                <div className="safari-target-ribbon mb-5 flex flex-col gap-3 border-4 border-[#243028] px-4 py-3 shadow-[5px_5px_0px_#243028] sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center border-2 border-black bg-black text-lg text-[#FACC15]">🏆</span>
                    <div>
                      <p className="font-mono text-[8px] font-black uppercase tracking-[0.24em]">Safari crown target</p>
                      <p className="brutal-font text-lg uppercase">Open-ended live counting</p>
                    </div>
                  </div>
                  <p className="font-mono text-[9px] font-black uppercase tracking-wider">
                    {hasChampion
                      ? `🏁 ${getSafariTeamLabel(leaderTeam?.name ?? "")} reached the pride rock`
                      : `${topScore} current leading score`}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.45fr)]">
                  {leaderTeam && (
                    <article className={`safari-leader-card relative flex min-h-[500px] flex-col overflow-hidden border-4 border-[#243028] ${topScore > 0 ? "score-leader-card" : ""}`}>
                      <div className={`relative border-b-4 border-black p-5 ${leaderTeam.color || "bg-yellow-400 text-black"}`}>
                        <span className="absolute right-4 top-4 border-2 border-black bg-[#FFFDF5] px-3 py-1 font-mono text-[8px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_#000]">
                          {hasChampion ? "Safari crown" : topScore > 0 ? "Pride leader" : "Trailhead"}
                        </span>
                        <span className="mb-5 flex h-16 w-16 items-center justify-center border-4 border-black bg-[#FFFDF5] brutal-font text-4xl shadow-[4px_4px_0px_#000]">
                          1
                        </span>
                        <p className="font-mono text-[9px] font-black uppercase tracking-[0.25em]">Pride rock</p>
                        <h4 className="mt-1 pr-24 brutal-font text-3xl uppercase leading-none tracking-wide sm:text-4xl">
                          <TeamMark name={leaderTeam.name} compact /> {getSafariTeamLabel(leaderTeam.name)}
                        </h4>
                      </div>

                      <div className="flex flex-1 flex-col justify-center p-5 text-[#FFFDF5] md:p-7">
                        <div className="mb-3 flex items-center justify-between font-mono text-[9px] font-black uppercase tracking-[0.28em] text-zinc-400">
                          <span>Score to beat</span>
                          <span className="text-[#B7DF77]">Live trail</span>
                        </div>
                        <div
                          aria-live="polite"
                          aria-label={`${leaderTeam.name} has ${topScore} points`}
                          className={`safari-score-reel score-reel flex items-end justify-between border-4 px-5 py-5 shadow-[inset_0_0_0_3px_#143525] ${scoreFlashTeamId === leaderTeam.id ? "score-pop" : ""}`}
                        >
                          <span className="brutal-font text-7xl leading-[0.82] tracking-wider text-[#FACC15] sm:text-8xl xl:text-9xl">
                            {String(topScore).padStart(3, "0")}
                          </span>
                          <span className="mb-2 font-mono text-[10px] font-black uppercase tracking-widest text-[#B7DF77]">POINTS</span>
                        </div>
                        <div className="safari-trail-progress mt-5 h-7 overflow-hidden border-4 border-[#243028]">
                          <div
                            className={`h-full border-r-4 border-black transition-[width] duration-500 ${leaderTeam.color || "bg-yellow-400"}`}
                            style={{ width: `${leaderTargetProgress}%` }}
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-between font-mono text-[9px] font-black uppercase tracking-wider">
                          <span>{Math.round(leaderTargetProgress)}% to crown</span>
                          <span>{leadMargin > 0 ? `+${leadMargin} trail lead` : "Tied at the rock"}</span>
                        </div>
                      </div>

                      <div className="border-t-4 border-black bg-[#FFFDF5]">
                        <p className="border-b-2 border-black bg-[#38BDF8] px-3 py-2 text-center font-mono text-[8px] font-black uppercase tracking-[0.24em]">
                          Award points to {getSafariTeamLabel(leaderTeam.name)}
                        </p>
                        <ScoreAwardControls team={leaderTeam} onAward={updateTeamScore} />
                      </div>
                    </article>
                  )}

                  <div className="space-y-4">
                    {challengerTeams.map((team, challengerIndex) => {
                      const score = team.score ?? 0;
                      const targetProgress = Math.min(100, (score / liveReferenceScore) * 100);
                      const gapToLeader = Math.max(0, topScore - score);

                      return (
                        <article key={team.id} className="overflow-hidden border-4 border-black bg-white shadow-[6px_6px_0px_#000]">
                          <div className="grid grid-cols-1 md:grid-cols-[190px_minmax(0,1fr)_190px]">
                            <div className={`flex items-center gap-3 border-b-4 border-black p-4 md:border-b-0 md:border-r-4 ${team.color || "bg-yellow-400 text-black"}`}>
                              <span className="flex h-12 w-12 shrink-0 items-center justify-center border-3 border-black bg-[#FFFDF5] brutal-font text-2xl shadow-[3px_3px_0px_#000]">
                                {challengerIndex + 2}
                              </span>
                              <div className="min-w-0">
                                <p className="font-mono text-[8px] font-black uppercase tracking-[0.2em]">On the trail</p>
                                <h4 className="truncate brutal-font text-lg uppercase tracking-wide">
                                  <TeamMark name={team.name} compact /> {getSafariTeamLabel(team.name)}
                                </h4>
                              </div>
                            </div>

                            <div className="flex flex-col justify-center bg-[#18181B] p-4 text-[#FFFDF5]">
                              <div className="mb-2 flex items-center justify-between font-mono text-[8px] font-black uppercase tracking-wider text-zinc-400">
                                <span>{gapToLeader === 0 ? "Level with pride leader" : `${gapToLeader} points behind`}</span>
                                <span>{Math.round(targetProgress)}% to crown</span>
                              </div>
                              <div className="h-5 overflow-hidden border-2 border-zinc-600 bg-black">
                                <div
                                  className={`h-full border-r-2 border-black transition-[width] duration-500 ${team.color || "bg-yellow-400"}`}
                                  style={{ width: `${targetProgress}%` }}
                                />
                              </div>
                            </div>

                            <div
                              aria-live="polite"
                              aria-label={`${team.name} has ${score} points`}
                              className={`safari-score-reel score-reel flex items-end justify-between border-t-4 border-[#243028] px-4 py-4 text-[#FFF3C4] md:border-l-4 md:border-t-0 ${scoreFlashTeamId === team.id ? "score-pop" : ""}`}
                            >
                              <span className="brutal-font text-5xl leading-none tracking-wider text-[#FACC15]">
                                {String(score).padStart(3, "0")}
                              </span>
                              <span className="mb-1 font-mono text-[8px] font-black uppercase text-[#B7DF77]">PTS</span>
                            </div>
                          </div>

                          <div className="border-t-4 border-black bg-zinc-100">
                            <ScoreAwardControls team={team} onAward={updateTeamScore} compact />
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t-4 border-black bg-[#38BDF8] px-5 py-4 md:flex-row md:items-center md:justify-between">
                <span className="w-fit border-2 border-black bg-black px-2 py-1 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#FFFDF5] shadow-[2px_2px_0px_#FACC15]">
                  Safari scoring guide
                </span>
                <p className="font-mono text-[9px] font-black uppercase tracking-wider md:text-right">
                  Crown hunt +100 <span aria-hidden="true">◆</span> Trailblazer +60 <span aria-hidden="true">◆</span> Wild spirit +25 <span aria-hidden="true">◆</span> Mud pit −10
                </p>
              </div>
            </section>

            {/* Secondary roster drawer keeps the main screen score-first */}
            <div className="brutal-box flex flex-col gap-4 rounded-2xl border-4 border-black bg-[#FFFDF5] p-4 text-black shadow-[7px_7px_0px_#000] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[8px] font-black uppercase tracking-[0.25em] text-zinc-500">Secondary deck</p>
                <h3 className="brutal-font text-xl uppercase">Player rosters</h3>
              </div>
              <p className="max-w-xl text-xs font-bold text-zinc-600">
                Keep the projector focused on points. Open allocations only when players need to confirm their team.
              </p>
              <button
                type="button"
                onClick={() => setShowTeamRosters((visible) => !visible)}
                aria-expanded={showTeamRosters}
                className="tactile-btn-active shrink-0 border-2 border-black bg-[#38BDF8] px-5 py-3 font-mono text-[9px] font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-sky-300 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#FACC15]"
              >
                {showTeamRosters ? "Hide rosters ↑" : `View ${members.length} players ↓`}
              </button>
            </div>

            {/* Showcase teams grid */}
            {showTeamRosters && <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {finalTeams.map((team, idx) => (
                <div
                  key={idx}
                  className="brutal-box overflow-hidden shadow-[10px_10px_0px_#000] rounded-3xl border-4 border-black flex flex-col bg-white hover:-translate-y-1.5 hover:shadow-[14px_14px_0px_#000] transition-all duration-300"
                >
                  {/* Header card with team color */}
                  <div className={`p-5 border-b-4 border-black text-center font-black uppercase text-xl relative ${team.color || "bg-yellow-400 text-black"}`}>
                    <div className="absolute inset-x-0 top-0 h-1 bg-black/10"></div>
                    <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center border-2 border-black bg-[#FFFDF5] font-mono text-[10px] font-black shadow-[2px_2px_0px_#000]">
                      #{getTeamRank(team.id)}
                    </span>
                    <h3 className="brutal-font tracking-wide truncate flex items-center justify-center gap-2">
                      <TeamMark name={team.name} compact /> {getSafariTeamLabel(team.name)}
                    </h3>
                    <span className="bg-black text-[#FFFDF5] text-[9px] font-mono px-2.5 py-0.5 border border-black uppercase font-black mt-2 inline-block shadow-[1px_1px_0px_#000]">
                      {team.members.length} PLAYERS
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b-4 border-black bg-[#18181B] px-5 py-3 text-[#FFFDF5]">
                    <span className="font-mono text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">Score total</span>
                    <span className={`brutal-font text-3xl leading-none text-[#FACC15] ${scoreFlashTeamId === team.id ? "score-pop" : ""}`}>
                      {String(team.score ?? 0).padStart(3, "0")}
                      <span className="ml-1 font-mono text-[8px] text-[#38BDF8]">PTS</span>
                    </span>
                  </div>

                  {/* Members lists with custom HUD slot list blocks */}
                  <ul className="p-4 bg-[#FFFDF5] flex-1 space-y-3 max-h-[460px] overflow-y-auto">
                    {team.members.map((m, mIdx) => (
                      <li
                        key={mIdx}
                        className="brutal-box p-3 bg-white border-2 border-black flex justify-between items-center font-black text-sm text-black shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] transition-all rounded-xl"
                      >
                        <span className="flex items-center gap-2 truncate pr-1">
                          <span className="font-mono text-[9px] text-zinc-400">P{mIdx + 1}</span>
                          <span className="truncate uppercase">{m.name}</span>
                        </span>
                      </li>
                    ))}
                    {team.members.length === 0 && (
                      <li className="py-6 text-center text-xs text-zinc-400 italic font-bold uppercase">No players allocated</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>}

            {/* Game 1: 1v1 Head-to-Head Duel Arena Modal (Inside Fullscreen Stage) */}
            <Game1DuelArenaModal
              isOpen={showDuelModal}
              onClose={() => setShowDuelModal(false)}
              finalTeams={finalTeams}
              duelTeamAId={duelTeamAId}
              duelTeamBId={duelTeamBId}
              setDuelTeamAId={setDuelTeamAId}
              setDuelTeamBId={setDuelTeamBId}
              showRangerControls={showRangerControls}
              isAuthenticated={isAuthenticated}
              scoreFlashTeamId={scoreFlashTeamId}
              updateTeamScore={updateTeamScore}
              TeamMark={TeamMark}
            />

          </div>
        </div>
      )}

      {/* Game 1: 1v1 Head-to-Head Duel Arena Modal (Fallback for non-rally view) */}
      <Game1DuelArenaModal
        isOpen={showDuelModal}
        onClose={() => setShowDuelModal(false)}
        finalTeams={finalTeams}
        duelTeamAId={duelTeamAId}
        duelTeamBId={duelTeamBId}
        setDuelTeamAId={setDuelTeamAId}
        setDuelTeamBId={setDuelTeamBId}
        showRangerControls={showRangerControls}
        isAuthenticated={isAuthenticated}
        scoreFlashTeamId={scoreFlashTeamId}
        updateTeamScore={updateTeamScore}
        TeamMark={TeamMark}
      />

      {/* Floating Notifications Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 animate-bounce">
          <div className="brutal-box bg-[#FACC15] text-black font-black uppercase text-xs px-6 py-4 border-4 border-black shadow-[6px_6px_0px_#000] rounded-xl">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
