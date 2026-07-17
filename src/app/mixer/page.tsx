"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { QRCodeSVG } from "qrcode.react";

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
}

const PRESET_CG_NAMES = ["Jason", "Victor", "Lemuel"];

const TEAM_COLOR_PALETTES = [
  "bg-[#FACC15] text-black", // Yellow
  "bg-[#38BDF8] text-black", // Blue
  "bg-[#F59E0B] text-black", // Orange
  "bg-[#F87171] text-black", // Red
  "bg-[#C084FC] text-black", // Purple
  "bg-[#4ADE80] text-black", // Green
  "bg-[#F472B6] text-black", // Pink
  "bg-[#2DD4BF] text-black", // Teal
];

function generateId(): string {
  return `${Date.now()}-${Math.random()}`;
}

const CG_COLORS = [
  'bg-[#38BDF8]', // Blue
  'bg-[#FACC15]', // Yellow
  'bg-[#F59E0B]', // Orange
  'bg-[#4ADE80]', // Green
  'bg-[#F472B6]', // Pink
  'bg-[#C084FC]', // Purple
  'bg-[#2DD4BF]', // Teal
  'bg-[#F87171]', // Red
];

const getGroupColor = (name: string) => {
  if (!name) return 'bg-[#FFFDF5]';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CG_COLORS.length;
  return CG_COLORS[index];
};

const getTeamEmoji = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("yellow")) return "🟡";
  if (lower.includes("blue")) return "🔵";
  if (lower.includes("orange")) return "🟠";
  if (lower.includes("red")) return "🔴";
  if (lower.includes("purple")) return "🟣";
  if (lower.includes("green")) return "🟢";
  if (lower.includes("pink")) return "🌸";
  if (lower.includes("teal")) return "💎";
  return "🎮";
};

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
  
  // Single member inputs
  const [inputName, setInputName] = useState("");
  const [inputCG, setInputCG] = useState("");
  
  // Bulk import
  const [bulkInput, setBulkInput] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Google Form sync (published CSV link)
  const [sheetUrl, setSheetUrl] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [showShowcase, setShowShowcase] = useState(false);
  
  // Mixer settings
  const [groupCount, setGroupCount] = useState(5);
  const [namingPreset, setNamingPreset] = useState<"numbers" | "colors" | "heroes">("colors");
  
  // Output state
  const [finalTeams, setFinalTeams] = useState<Team[]>([]);
  const [isDealing, setIsDealing] = useState(false);
  const [dealIndex, setDealIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState<"roster" | "teams">("roster");
  
  // Notification Toast state
  const [toastMessage, setToastMessage] = useState("");

  // Synthesize retro chiptune sound effects
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
        if (savedGroups) setCellGroups(JSON.parse(savedGroups));

        const savedTeams = localStorage.getItem("cg_mixer_teams");
        if (savedTeams) setFinalTeams(JSON.parse(savedTeams));

        const savedCount = localStorage.getItem("cg_mixer_groupcount");
        if (savedCount) setGroupCount(parseInt(savedCount, 10));

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

  // Get Naming Lists
  const getTeamNames = (count: number): string[] => {
    if (namingPreset === "colors") {
      const colors = ["Yellows", "Blues", "Oranges", "Reds", "Purples", "Greens", "Pinks", "Teals", "Golds", "Silvers"];
      return Array.from({ length: count }, (_, i) => `Team ${colors[i % colors.length]}`);
    } else if (namingPreset === "heroes") {
      const heroes = ["Titans", "Avengers", "Justice", "Defenders", "Guardians", "Storms", "Raptors", "Warriors", "Legends", "Monarchs"];
      return Array.from({ length: count }, (_, i) => `Team ${heroes[i % heroes.length]}`);
    } else {
      return Array.from({ length: count }, (_, i) => `Team ${i + 1}`);
    }
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
    const teamNames = getTeamNames(groupCount);
    const groups: Team[] = Array.from({ length: groupCount }, (_, i) => ({
      id: i + 1,
      name: teamNames[i],
      members: [],
      color: TEAM_COLOR_PALETTES[i % TEAM_COLOR_PALETTES.length],
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
      members: t.members.map(m => ({ name: m.name, cg: m.cg }))
    }));
    const serialized = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    return `${window.location.origin}/showcase?t=${serialized}`;
  };

  // Fixed routing path here: pointing directly to `/showcase` instead of `/find-my-team`
  const copyShareLink = () => {
    if (finalTeams.length === 0) return;
    try {
      navigator.clipboard.writeText(buildShareUrl());
      playSuccessChirp();
      showToast("Player Share Link Copied! 🔗");
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
    if (overlaps === 0) return { grade: "🌟 S-TIER", text: "PERFECT DISPERSION", color: "bg-[#22C55E]" };
    if (overlaps <= 2) return { grade: "🟢 A-TIER", text: "OPTIMALLY BALANCED", color: "bg-[#4ADE80]" };
    if (overlaps <= 5) return { grade: "🟡 B-TIER", text: "STABLE DISPERSION", color: "bg-[#FACC15]" };
    return { grade: "🔴 C-TIER", text: "CHAOTIC OVERLAPS", color: "bg-[#EF4444] text-white" };
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

  return (
    <div ref={containerRef} className="min-h-screen bg-[#18181B] bg-grid-pattern-dark text-white selection:bg-[#FACC15] selection:text-black pb-24">
      {/* Header Panel */}
      <header className="bg-[#18181B] border-b-4 border-black py-10 px-6 text-center shadow-[0_6px_0px_#000] relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link
            href="/"
            className="brutal-box bg-[#FFFDF5] text-black font-black uppercase text-sm px-5 py-2.5 border-2 border-black hover:bg-[#FACC15] transition-all shadow-[2px_2px_0px_#000] active:translate-y-0.5"
          >
            ← ESC BACK
          </Link>
          <h1 className="brutal-font text-3xl md:text-5xl text-[#FACC15] uppercase tracking-wider select-none">
            🎲 DIGITAL TEAM SHUFFLER
          </h1>
          {isAuthenticated && (
            <div className="flex gap-2">
              <button
                onClick={handleClearRoster}
                disabled={members.length === 0}
                className="brutal-box bg-red-500 text-white font-black uppercase text-xs md:text-sm px-4 py-2.5 border-2 border-black hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer"
              >
                Clear Roster ❌
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Space */}
      {!isAuthenticated ? (
        <main className="max-w-md mx-auto px-6 py-20">
          {/* Bezel locked screen style */}
          <div className="arcade-bezel bg-[#27272A] p-6 shadow-[12px_12px_0px_#000] border-8 border-black rounded-3xl relative text-center text-black">
            <div className="screw top-3 left-3"></div>
            <div className="screw top-3 right-3"></div>
            <div className="screw bottom-3 left-3"></div>
            <div className="screw bottom-3 right-3"></div>

            <div className="brutal-box p-6 bg-[#EF4444] text-white border-4 border-black shadow-[6px_6px_0px_#000] relative rounded-2xl">
              <div className="scanline-line"></div>
              <h2 className="brutal-font text-2xl mb-1 uppercase text-black brutal-text-glow-yellow">
                🔒 ACCESS RESTRICTED
              </h2>
              <p className="text-[10px] font-black text-black/80 mb-6 uppercase tracking-wider">
                ENTER AUTHORIZATION PASSCODE TO ACCESS SYSTEM INTERFACES
              </p>

              <form onSubmit={handleVerifyPasscode} className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 text-black">DECRYPT KEY</label>
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 brutal-box bg-white border border-black hover:bg-gray-100 text-[9px] text-black font-black px-2 py-0.5 uppercase"
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
                  className="w-full brutal-box bg-black text-[#FACC15] hover:text-[#fff] font-black uppercase text-xs py-3.5 border-2 border-black hover:bg-zinc-800 shadow-[4px_4px_0px_#000] cursor-pointer"
                >
                  DECRYPT & MOUNT SYSTEM 🔓
                </button>
              </form>
            </div>
            
            <div className="mt-6">
              <Link href="/" className="text-xs font-black uppercase hover:underline text-white font-mono">
                ← Return to Lobby Landing
              </Link>
            </div>
          </div>
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Setup Command Center Modules (5 cols) */}
        <section className="lg:col-span-5 space-y-8">
          
          {/* Module 1: Member Intake Panel */}
          <div className="brutal-box p-6 bg-white text-black shadow-[8px_8px_0px_#000] rounded-3xl border-4 border-black relative">
            <div className="fold-corner-orange"></div>
            <h2 className="brutal-font text-xl md:text-2xl mb-4 uppercase text-[#F59E0B] border-b-2 border-black pb-2">
              1. MEMBER INTAKE
            </h2>
            
            {/* Quick Add Form */}
            <form onSubmit={handleAddMember} className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-black uppercase mb-1">PLAYER DETAILS (NAME)</label>
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
                  <label className="block text-[10px] font-black uppercase mb-1">CELL GROUP SLOT</label>
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
                    ADD SLOT +
                  </button>
                </div>
              </div>
            </form>

            <div className="border-t-4 border-black pt-4">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-[10px] font-black uppercase">MANAGE LOCAL CELL GROUPS</label>
                <span className="text-[9px] bg-gray-200 font-bold px-2 py-0.5 border border-black uppercase font-mono">
                  {cellGroups.length} GROUPS
                </span>
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
                  CREATE
                </button>
              </div>
            </div>

            {/* Bulk Sheets Import button */}
            <div className="mt-6 pt-4 border-t-4 border-black">
              <button
                onClick={() => setShowBulkModal(true)}
                className="w-full brutal-box bg-[#38BDF8] text-black font-black uppercase text-xs py-3.5 border-2 border-black hover:bg-[#0ea5e9] shadow-[3px_3px_0px_#000] cursor-pointer active:translate-y-0.5"
              >
                📥 BULK EXCEL/SHEETS IMPORT
              </button>
            </div>

            {/* Google Form Auto-Sync */}
            <div className="mt-4 pt-4 border-t-4 border-black">
              <label className="block text-[10px] font-black uppercase mb-1">📡 GOOGLE FORM AUTO-SYNC</label>
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
              <button
                onClick={handleSheetSync}
                disabled={isSyncing || !sheetUrl.trim()}
                className="w-full brutal-box bg-[#4ADE80] text-black font-black uppercase text-xs py-3 border-2 border-black hover:bg-[#34d399] disabled:opacity-50 disabled:cursor-not-allowed shadow-[3px_3px_0px_#000] cursor-pointer active:translate-y-0.5"
              >
                {isSyncing ? "SYNCING... 📡" : "🔄 SYNC FROM GOOGLE FORM"}
              </button>
            </div>
          </div>

          {/* Module 2: Shuffler Configuration Panel */}
          <div className="brutal-box p-6 bg-[#FACC15] text-black shadow-[8px_8px_0px_#000] rounded-3xl border-4 border-black relative">
            <div className="fold-corner-orange"></div>
            <h2 className="brutal-font text-xl md:text-2xl mb-6 uppercase text-black border-b-2 border-black pb-2">
              2. CONFIG MIXER
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black uppercase">TARGET SPLIT QUANTITY</label>
                  <span className="brutal-font text-base bg-black text-[#FACC15] px-3 py-1 border-2 border-black font-mono">
                    {groupCount} TEAMS
                  </span>
                </div>
                {/* Visual styled slider */}
                <input
                  type="range"
                  min="2"
                  max={Math.max(2, members.length)}
                  value={groupCount}
                  onChange={(e) => setGroupCount(parseInt(e.target.value, 10))}
                  className="w-full accent-black cursor-pointer bg-black h-2 rounded-full outline-none"
                />
                <div className="flex justify-between text-[9px] font-mono font-bold mt-1 uppercase text-black">
                  <span>MIN: 2</span>
                  <span>MAX: {members.length || 2} PLATES</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase mb-2">NOMENCLATURE PRESETS</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["numbers", "colors", "heroes"] as const).map(preset => (
                    <button
                      key={preset}
                      onClick={() => setNamingPreset(preset)}
                      className={`px-3 py-2 border-2 border-black font-bold uppercase text-[10px] tracking-tighter transition-all shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer ${
                        namingPreset === preset
                          ? "bg-black text-[#FACC15]"
                          : "bg-white text-black hover:bg-gray-100"
                      }`}
                    >
                      {preset === "colors" ? "🌈 Colors" : preset === "heroes" ? "🦸 Heroes" : "🔢 Numbers"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateTeams}
                disabled={members.length < 2 || isDealing}
                className="w-full brutal-font text-lg bg-black text-[#FACC15] hover:text-[#fff] hover:bg-zinc-950 py-4 border-4 border-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[6px_6px_0px_#000] cursor-pointer active:translate-x-[4px] active:translate-y-[4px] active:shadow-[2px_2px_0px_#000]"
              >
                {isDealing ? "MIXING & DEALING... 🎲" : "SPLIT TEAMS NOW 🎲"}
              </button>
            </div>
          </div>
        </section>

        {/* Right Side: Roster ledger and shuffler boards (7 cols) */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* Tab Navigation knobs */}
          <div className="flex gap-2 relative z-10">
            <button
              onClick={() => setActiveTab("roster")}
              className={`brutal-font text-base sm:text-lg px-6 py-4 uppercase border-4 border-black border-b-0 rounded-t-2xl transition-all duration-200 shadow-[4px_0_0_#000] cursor-pointer ${
                activeTab === "roster"
                  ? "bg-[#FACC15] text-black -translate-y-1.5 h-15"
                  : "bg-gray-300 text-gray-600 hover:bg-gray-200 mt-2 h-13"
              }`}
            >
              Roster ({members.length} players)
            </button>
            <button
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
              Shuffler Results 🚀
            </button>
          </div>

          {/* Roster Ledger sheet Tab */}
          {activeTab === "roster" && (
            <div className="brutal-box p-6 bg-white text-black shadow-[8px_8px_0px_#000] rounded-b-3xl border-4 border-black min-h-[500px]">
              <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-6">
                <h3 className="brutal-font text-lg md:text-xl uppercase text-black">ACTIVE ROSTER LEDGER</h3>
                <span className="text-[9px] bg-black text-[#FFFDF5] font-black px-2.5 py-1 border-2 border-black uppercase tracking-wider font-mono">
                  BALANCED SHUFFLER QUEUE
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
                        <th className="p-3.5 font-black uppercase">PLAYER SLOTS</th>
                        <th className="p-3.5 font-black uppercase">CELL LEAD</th>
                        <th className="p-3.5 font-black uppercase text-right w-24">COMMANDS</th>
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
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleRemoveMember(m.id)}
                              className="text-red-600 hover:text-red-700 font-black uppercase text-[10px] tracking-wide border border-transparent hover:border-red-600 px-2 py-1 transition-all rounded"
                            >
                              [ REMOVE ]
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
            <div className="space-y-6">
              
              {/* Output Actions dashboard Belt */}
              <div className="brutal-box p-4 bg-white text-black shadow-[6px_6px_0px_#000] rounded-2xl border-4 border-black flex flex-wrap gap-4 items-center justify-between">
                <span className="font-black text-xs uppercase tracking-wider">EXPORT TEAMS DATA:</span>
                <div className="flex gap-2.5 flex-wrap">
                  <button
                    onClick={copyShareLink}
                    className="brutal-box bg-[#38BDF8] text-black font-black uppercase text-xs px-4 py-2.5 border-2 border-black hover:bg-[#0ea5e9] shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer"
                  >
                    🔗 Copy Share Link
                  </button>
                  <button
                    onClick={() => {
                      setShowShowcase(true);
                      playSynthSound(600, 0.2, "sine");
                    }}
                    className="brutal-box bg-[#FACC15] text-black font-black uppercase text-xs px-4 py-2.5 border-2 border-black hover:bg-[#eab308] shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer"
                  >
                    📺 Showcase Presentation
                  </button>
                </div>
              </div>

              {/* Dealing simulation screen overlay */}
              {isDealing && (
                <div className="brutal-box p-8 bg-black text-white text-center shadow-[8px_8px_0px_#000] border-4 border-black rounded-3xl relative overflow-hidden">
                  <div className="scanline-line"></div>
                  <h4 className="brutal-font text-2xl text-[#FACC15] mb-2 uppercase animate-bounce">DEALING ACTIVE...</h4>
                  <div className="flex justify-center items-center gap-4 my-6">
                    <div className="w-16 h-24 bg-[#F59E0B] border-4 border-black rounded-lg shadow-[4px_4px_0px_#000] transform rotate-[-12deg] flex items-center justify-center animate-pulse">
                      <span className="text-black font-black text-3xl">🃏</span>
                    </div>
                    <div className="w-16 h-24 bg-[#38BDF8] border-4 border-black rounded-lg shadow-[4px_4px_0px_#000] transform translate-y-[-10px] flex items-center justify-center scale-105">
                      <span className="text-black font-black text-3xl">🎲</span>
                    </div>
                    <div className="w-16 h-24 bg-[#FACC15] border-4 border-black rounded-lg shadow-[4px_4px_0px_#000] transform rotate-[12deg] flex items-center justify-center animate-pulse">
                      <span className="text-black font-black text-3xl">⚡</span>
                    </div>
                  </div>
                  <p className="font-bold text-lg text-[#FFFDF5]">
                    Dealing <span className="text-[#38BDF8] font-black uppercase underline">{members[dealIndex]?.name || "slots..."}</span>
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500 mt-2 uppercase tracking-wider">
                    GreedyDealer is allocating buckets based on cell group collision grids
                  </p>
                </div>
              )}

              {/* Quality Stats Board */}
              {!isDealing && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Quality rating grade metric */}
                  <div className={`md:col-span-5 brutal-box p-4 shadow-[6px_6px_0px_#000] border-4 border-black rounded-2xl flex flex-col justify-center items-center text-black font-bold text-center ${getMixQualityGrade().color}`}>
                    <span className="text-[10px] uppercase font-black text-black/70 tracking-widest font-mono">MIX RATING MATCH</span>
                    <span className="text-3xl brutal-font tracking-tighter mt-1">{getMixQualityGrade().grade}</span>
                    <span className="text-[8px] font-mono font-black border border-black px-1.5 py-0.5 uppercase tracking-wide bg-black text-[#FFFDF5] mt-1.5">{getMixQualityGrade().text}</span>
                  </div>

                  <div className="md:col-span-7 brutal-box p-4 bg-[#C084FC] text-black shadow-[6px_6px_0px_#000] border-4 border-black rounded-2xl grid grid-cols-3 gap-2 text-center font-bold items-center">
                    <div>
                      <span className="block text-[8px] uppercase font-black text-purple-950 font-mono">SLOTS</span>
                      <span className="text-2xl brutal-font">{members.length}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase font-black text-purple-950 font-mono">COLLISION</span>
                      <span className="text-2xl brutal-font">{totalSameCGOverlaps()}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase font-black text-purple-950 font-mono">TEAMS</span>
                      <span className="text-2xl brutal-font">{finalTeams.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Teams cards Deck Grid */}
              {!isDealing && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {finalTeams.map((team) => (
                    <div
                      key={team.id}
                      className="team-card brutal-box shadow-[8px_8px_0px_#000] rounded-2xl border-4 border-black overflow-hidden flex flex-col justify-between"
                    >
                      {/* Team Header */}
                      <div className={`p-4 border-b-4 border-black flex justify-between items-center ${team.color}`}>
                        <h4 className="brutal-font text-base md:text-lg uppercase tracking-tight flex items-center gap-1.5 truncate">
                          <span>{getTeamEmoji(team.name)}</span> {team.name}
                        </h4>
                        <span className="bg-black text-[#FFFDF5] text-[9px] font-mono font-black px-2.5 py-1 border border-black uppercase tracking-wider shrink-0 shadow-[1px_1px_0px_#000]">
                          {team.members.length} P
                        </span>
                      </div>

                      {/* Team Members List */}
                      <ul className="p-4 bg-white text-black divide-y-2 divide-zinc-150 flex-grow">
                        {team.members.map((m, idx) => (
                          <li key={m.id} className="py-2.5 flex justify-between items-center font-bold text-xs text-black">
                            <span className="flex items-center gap-2 truncate pr-1">
                              <span className="text-zinc-400 font-mono text-[10px]">{idx + 1}.</span>
                              <span className="truncate">{m.name}</span>
                            </span>
                            <span className={`${getGroupColor(m.cg)} text-black text-[9px] px-2 py-0.5 border border-zinc-700 uppercase font-black shrink-0`}>
                              {m.cg}
                            </span>
                          </li>
                        ))}
                        {team.members.length === 0 && (
                          <li className="py-6 text-center text-xs text-zinc-400 italic">No players allocated</li>
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl brutal-box bg-white text-black p-6 md:p-8 shadow-[12px_12px_0px_#000] border-4 border-black rounded-3xl relative">
            <button
              onClick={() => {
                setShowBulkModal(false);
                playSynthSound(400, 0.1, "sine");
              }}
              className="absolute top-4 right-4 brutal-box bg-red-500 text-white font-black text-base w-8 h-8 flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              ×
            </button>
            <h3 className="brutal-font text-xl md:text-2xl mb-3 uppercase text-[#38BDF8] border-b-2 border-black pb-2">
              📥 IMPORT ROSTER SPREADSHEET
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
                Parse & Import 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Presentation Showcase Modal Overlay (Ticket style) */}
      {showShowcase && finalTeams.length > 0 && (
        <div className="fixed inset-0 bg-[#18181B] bg-grid-pattern-dark z-50 overflow-y-auto p-6 md:p-12 flex flex-col justify-between selection:bg-black selection:text-[#FACC15]">
          <div className="max-w-7xl mx-auto w-full space-y-8">
            
            {/* Header section ticket layout */}
            <div className="brutal-box bg-[#FFFDF5] text-black p-6 md:p-8 rounded-3xl shadow-[12px_12px_0px_#000] border-8 border-black flex flex-col items-center gap-6 relative">
              {/* Mechanical panel details */}
              <div className="screw top-3 left-3"></div>
              <div className="screw top-3 right-3"></div>
              <div className="screw bottom-3 left-3"></div>
              <div className="screw bottom-3 right-3"></div>

              {/* Cabinet Top bar */}
              <div className="flex justify-between items-center w-full border-b-4 border-black pb-4 mb-2">
                <span className="font-mono text-xs text-green-650 uppercase tracking-widest flex items-center gap-2 font-black">
                  <span className="w-3 h-3 rounded-full bg-green-500 led-glow-green animate-pulse"></span>
                  • TRANSMITTING STAGE BROADCAST DECK
                </span>
                <button
                  onClick={() => {
                    setShowShowcase(false);
                    playSynthSound(400, 0.15, "triangle");
                  }}
                  className="brutal-box bg-[#EF4444] text-white font-black text-xs px-5 py-2.5 border-4 border-black shadow-[3px_3px_0px_#000] hover:bg-red-600 uppercase flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] cursor-pointer"
                >
                  🚪 CLOSE DECK
                </button>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-8 w-full">
                <div className="space-y-4 max-w-2xl text-center md:text-left">
                  <span className="bg-black text-[#FFFDF5] text-[10px] font-black px-3 py-1 border-2 border-black uppercase tracking-widest inline-block shadow-[2px_2px_0px_#000]">
                    AUDITORIUM SCREEN OVERLAY 📺
                  </span>
                  <h2 className="brutal-font text-4xl sm:text-6xl text-black brutal-text-glow-yellow uppercase tracking-wider select-none leading-none">
                    TEAM DISTRIBUTIONS
                  </h2>
                  <p className="font-bold text-zinc-700 text-sm leading-relaxed max-w-xl">
                    Cell Group shuffles complete. Review allocations below or scan the ticket QR code to launch search highlighting on your own phone device!
                  </p>
                </div>

                {/* QR Code Ticket Frame */}
                <div className="ticket-tear brutal-box p-6 bg-[#FFFDF5] text-black border-4 border-black shadow-[6px_6px_0px_#000] flex flex-col items-center justify-center shrink-0 relative overflow-visible rounded-2xl w-52">
                  {/* Decorative Ticket Barcode */}
                  <div className="w-full flex justify-between h-4 px-2 mb-2 bg-white border border-zinc-200 py-0.5">
                    <div className="w-1 h-full bg-black"></div>
                    <div className="w-2 h-full bg-black"></div>
                    <div className="w-0.5 h-full bg-black"></div>
                    <div className="w-1.5 h-full bg-black"></div>
                    <div className="w-0.5 h-full bg-black"></div>
                    <div className="w-2.5 h-full bg-black"></div>
                    <div className="w-1 h-full bg-black"></div>
                    <div className="w-1.5 h-full bg-black"></div>
                  </div>

                  <div className="bg-white p-2 border-4 border-black mb-2 relative z-0">
                    <QRCodeSVG
                      value={buildShareUrl()}
                      size={112}
                      level="M"
                      marginSize={1}
                      className="w-28 h-28 block select-none"
                    />
                  </div>
                  <span className="text-[9px] text-black font-black uppercase tracking-widest font-mono">
                    🎟️ SCAN MOBILE
                  </span>
                  <span className="text-[6px] text-zinc-500 font-mono mt-1">ADMIT ONE // SERIAL: CG-9957</span>
                </div>
              </div>
            </div>

            {/* Showcase teams grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {finalTeams.map((team, idx) => (
                <div
                  key={idx}
                  className="brutal-box overflow-hidden shadow-[10px_10px_0px_#000] rounded-3xl border-4 border-black flex flex-col bg-white hover:-translate-y-1.5 hover:shadow-[14px_14px_0px_#000] transition-all duration-300"
                >
                  {/* Header card with team color */}
                  <div className={`p-5 border-b-4 border-black text-center font-black uppercase text-xl relative ${team.color || "bg-yellow-400 text-black"}`}>
                    <div className="absolute inset-x-0 top-0 h-1 bg-black/10"></div>
                    <h3 className="brutal-font tracking-wide truncate flex items-center justify-center gap-2">
                      <span>{getTeamEmoji(team.name)}</span> {team.name}
                    </h3>
                    <span className="bg-black text-[#FFFDF5] text-[9px] font-mono px-2.5 py-0.5 border border-black uppercase font-black mt-2 inline-block shadow-[1px_1px_0px_#000]">
                      {team.members.length} PLAYERS
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
                        <span className={`text-[9px] ${getGroupColor(m.cg)} text-black border border-black px-2 py-0.5 uppercase font-black shrink-0 shadow-[1px_1px_0px_#000]`}>
                          {m.cg}
                        </span>
                      </li>
                    ))}
                    {team.members.length === 0 && (
                      <li className="py-6 text-center text-xs text-zinc-400 italic font-bold uppercase">No players allocated</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Floating Notifications Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 animate-bounce">
          <div className="brutal-box bg-[#FACC15] text-black font-black uppercase text-xs px-6 py-4 border-4 border-black shadow-[6px_6px_0px_#000] rounded-xl">
            ⚡ {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
