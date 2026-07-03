"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

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
  const [showShowcase, setShowShowcase] = useState(false);
  
  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    // Default secret passcode is admin@123
    if (enteredPasscode.trim() === "admin@123") {
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        if (rememberMe) {
          localStorage.setItem("cg_mixer_auth", "true");
        } else {
          sessionStorage.setItem("cg_mixer_auth", "true");
        }
      }
      showToast("Access granted! System unlocked.");
    } else {
      showToast("Incorrect access code!");
    }
  };
  
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

  // Load from localStorage on mount (deferred to prevent hydration mismatch and cascading render warnings)
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
        
        const savedAuth = localStorage.getItem("cg_mixer_auth") || sessionStorage.getItem("cg_mixer_auth");
        if (savedAuth === "true") setIsAuthenticated(true);

        // Mark loading as complete so sync effects can safely execute thereafter
        isLoadedRef.current = true;
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Sync states to localStorage (guarded by isLoadedRef to prevent clobbering on mount)
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
  // Add individual cell group
  const addCellGroup = () => {
    const clean = newCGName.trim();
    if (!clean) return;
    if (cellGroups.map(c => c.toLowerCase()).includes(clean.toLowerCase())) {
      showToast("Cell Group already exists!");
      return;
    }
    setCellGroups([...cellGroups, clean]);
    setNewCGName("");
    setInputCG(clean);
    showToast(`Added group "${clean}"`);
  };

  // Remove individual cell group
  const removeCellGroup = (cg: string) => {
    if (cellGroups.length <= 1) {
      showToast("You need at least one cell group!");
      return;
    }
    setCellGroups(cellGroups.filter(c => c !== cg));
    // Re-bind members of deleted cell group to general group if needed
    setMembers(members.map(m => m.cg === cg ? { ...m, cg: cellGroups.find(c => c !== cg) || "General" } : m));
    showToast(`Removed group "${cg}"`);
  };

  // Add manual player
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = inputName.trim();
    if (!cleanName) return;

    // Check for exact case-insensitive duplicates
    const isDup = members.some(m => m.name.toLowerCase() === cleanName.toLowerCase());
    if (isDup) {
      showToast(`Warning: "${cleanName}" is already in the roster.`);
    }

    const newMember: Member = {
      id: generateId(),
      name: cleanName,
      cg: inputCG || cellGroups[0] || "General",
    };

    setMembers([newMember, ...members]);
    setInputName("");
    showToast(`Added ${cleanName} (${newMember.cg})`);
  };

  // Remove player
  const handleRemoveMember = (id: string) => {
    const member = members.find(m => m.id === id);
    setMembers(members.filter(m => m.id !== id));
    if (member) showToast(`Removed ${member.name}`);
  };

  // Clear Roster
  const handleClearRoster = () => {
    if (confirm("Are you sure you want to clear the roster?")) {
      setMembers([]);
      setFinalTeams([]);
      showToast("Roster cleared!");
    }
  };

  // Parse bulk paste
  const handleBulkImport = () => {
    const lines = bulkInput.split("\n");
    const added: Member[] = [];
    const duplicates: string[] = [];
    const currentNames = new Set(members.map(m => m.name.toLowerCase()));

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      // Skip header rows if copied from spreadsheets (e.g. "Name\tCellGroup")
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

      // Attempt parsing formats:
      // Format 0: Tab or double spaces delimiter (from Excel/Sheets copy-paste)
      const tabSpaceMatch = cleanLine.split(/\t| {2,}/);
      if (tabSpaceMatch.length >= 2) {
        name = tabSpaceMatch[0].trim();
        cg = tabSpaceMatch[1].trim();
      } else {
        // Format 1: "Name (Cell Group)"
        const bracketMatch = cleanLine.match(/^([^(]+)\(([^)]+)\)$/);
        if (bracketMatch) {
          name = bracketMatch[1].trim();
          cg = bracketMatch[2].trim();
        } else {
          // Format 2: "Name, Cell Group"
          const commaIdx = cleanLine.indexOf(",");
          if (commaIdx !== -1) {
            name = cleanLine.substring(0, commaIdx).trim();
            cg = cleanLine.substring(commaIdx + 1).trim();
          } else {
            // Format 3: "Name - Cell Group"
            const dashIdx = cleanLine.indexOf("-");
            if (dashIdx !== -1) {
              name = cleanLine.substring(0, dashIdx).trim();
              cg = dashIdx < cleanLine.length - 1 ? cleanLine.substring(dashIdx + 1).trim() : cg;
            }
          }
        }
      }

      // Normalize CG
      cg = cg.replace(/\s+/g, " ").trim();
      if (!cellGroups.includes(cg)) {
        // Automatically add parsed cell group to our active list if not already present
        setCellGroups(prev => [...prev, cg]);
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
    }
    setShowBulkModal(false);
    setBulkInput("");

    let msg = `Successfully imported ${added.length} players.`;
    if (duplicates.length > 0) {
      msg += ` Resolved ${duplicates.length} duplicate name warnings.`;
    }
    showToast(msg);
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

    // Find the best group using greedy logic
    const findSmallestGroupForMember = (targetCG: string): Team => {
      // Find the absolute minimum length currently in target groups
      let minLen = Infinity;
      groups.forEach(g => {
        if (g.members.length < minLen) minLen = g.members.length;
      });

      // Filter groups to only those at minLen (ensures ±1 balancing)
      let candidates = groups.filter(g => g.members.length === minLen);

      // Find the minimum number of members from the same cell group inside candidates
      let minSameCG = Infinity;
      const counts = candidates.map(g => {
        const n = g.members.filter(m => m.cg === targetCG).length;
        if (n < minSameCG) minSameCG = n;
        return n;
      });

      // Keep candidates with minimum same cell group overlap
      candidates = candidates.filter((_, i) => counts[i] === minSameCG);

      // Random tie-break
      return candidates[Math.floor(Math.random() * candidates.length)];
    };

    // 5. Deal members into selected groups
    bucketList.forEach(bucket => {
      bucket.forEach(member => {
        const targetGroup = findSmallestGroupForMember(member.cg);
        targetGroup.members.push(member);
      });
    });

    // 6. Visual Dealing Stagger Animation using GSAP
    setFinalTeams(groups);
    if (typeof window !== "undefined") {
      localStorage.setItem("cg_mixer_teams", JSON.stringify(groups));
    }
    
    // Simulate dealer dealing card effects
    let currentIdx = 0;
    const interval = setInterval(() => {
      setDealIndex(currentIdx);
      currentIdx++;
      if (currentIdx >= members.length) {
        clearInterval(interval);
        setIsDealing(false);
        showToast("Teams generated successfully with maximum mixing!");
      }
    }, Math.max(10, Math.min(100, 1500 / members.length))); // Dynamic dealing speed
  };



  const copyShareLink = () => {
    if (finalTeams.length === 0) return;
    try {
      const payload = finalTeams.map(t => ({
        name: t.name,
        color: t.color,
        members: t.members.map(m => ({ name: m.name, cg: m.cg }))
      }));

      // Base64 serialize with UTF-8 support
      const serialized = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const shareUrl = `${window.location.origin}/find-my-team?t=${serialized}`;

      navigator.clipboard.writeText(shareUrl);
      showToast("Player Share Link Copied! 🔗");
    } catch (e) {
      console.error(e);
      showToast("Failed to generate share link!");
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

  // Calculate stats for quality check
  const totalSameCGOverlaps = () => {
    let overlaps = 0;
    finalTeams.forEach(team => {
      const cgCounts: { [key: string]: number } = {};
      team.members.forEach(m => {
        cgCounts[m.cg] = (cgCounts[m.cg] || 0) + 1;
      });
      Object.values(cgCounts).forEach(cnt => {
        if (cnt > 1) overlaps += (cnt - 1); // overlap occurrences
      });
    });
    return overlaps;
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#18181B] bg-grid-pattern-dark text-white selection:bg-black selection:text-[#FACC15] pb-24">
      {/* Header Banner */}
      <header className="bg-[#18181B] border-b-4 border-black py-10 px-6 text-center shadow-[0_6px_0px_#000] relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link
            href="/"
            className="brutal-box bg-[#FFFDF5] text-black font-black uppercase text-sm px-4 py-2 border-2 border-black hover:bg-[#FACC15] transition-all shadow-[2px_2px_0px_#000]"
          >
            ← Back to Entry
          </Link>
          <h1 className="brutal-font text-3xl md:text-5xl text-[#FACC15] uppercase tracking-wider">
            🎲 DIGITAL TEAM MIXER
          </h1>
          {isAuthenticated && (
            <div className="flex gap-2">
              <button
                onClick={handleClearRoster}
                disabled={members.length === 0}
                className="brutal-box bg-red-500 text-white font-black uppercase text-xs md:text-sm px-4 py-2 border-2 border-black hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[2px_2px_0px_#000]"
              >
                Clear Roster ❌
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      {!isAuthenticated ? (
        <main className="max-w-md mx-auto px-6 py-20">
          <div className="brutal-box p-8 bg-[#FACC15] text-black shadow-[8px_8px_0px_#000] relative rounded-xl">
            <div className="fold-corner-orange"></div>
            
            <h2 className="brutal-font text-2xl mb-2 uppercase text-black">
              🔒 ADMIN ACCESS REQUIRED
            </h2>
            <p className="text-xs font-black text-black/80 mb-6 uppercase tracking-wider">
              ENTER ACCESS CODE TO UNLOCK ADMIN CONTROLS.
            </p>

            <form onSubmit={handleVerifyPasscode} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1">ACCESS CODE</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter passcode..."
                    value={enteredPasscode}
                    onChange={(e) => setEnteredPasscode(e.target.value)}
                    className="w-full px-4 py-3 border-4 border-black font-bold focus:bg-[#FFFDF5] outline-none text-black bg-white placeholder-zinc-400 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 brutal-box bg-white border border-black hover:bg-gray-100 text-[10px] text-black font-black px-2 py-1 uppercase"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border-2 border-black accent-black rounded cursor-pointer animate-none"
                />
                <label htmlFor="rememberMe" className="text-xs font-black uppercase cursor-pointer select-none text-zinc-800">
                  Keep me logged in
                </label>
              </div>

              <button
                type="submit"
                className="w-full brutal-box brutal-box-hover bg-black text-[#FACC15] font-black uppercase text-sm py-3 border-2 border-black hover:bg-zinc-800 shadow-[4px_4px_0px_#000]"
              >
                UNLOCK SYSTEM 🔓
              </button>
            </form>
            
            <div className="mt-6 pt-4 border-t-2 border-black/20 text-center">
              <Link href="/" className="text-xs font-black uppercase hover:underline">
                ← Return to Landing Page
              </Link>
            </div>
          </div>
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Setup & Settings (4 cols) */}
        <section className="lg:col-span-5 space-y-8">
          
          {/* Quick Roster Config Card */}
          <div className="brutal-box p-6 bg-white text-black shadow-[8px_8px_0px_#000]">
            <div className="fold-corner-orange"></div>
            <h2 className="brutal-font text-xl md:text-2xl mb-4 uppercase text-[#F59E0B] drop-shadow-[1px_1px_0px_#000]">
              1. Add Members
            </h2>
            
            {/* Quick Add Form */}
            <form onSubmit={handleAddMember} className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-black uppercase mb-1">PLAYER NAME</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="w-full px-4 py-2 border-4 border-black font-bold focus:bg-[#FFFDF5] outline-none text-black bg-white placeholder-zinc-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase mb-1">CELL GROUP</label>
                  <select
                    value={inputCG || cellGroups[0] || ""}
                    onChange={(e) => setInputCG(e.target.value)}
                    className="w-full px-3 py-2.5 border-4 border-black font-bold bg-white text-black outline-none"
                  >
                    {cellGroups.map(cg => (
                      <option key={cg} value={cg}>{cg}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full brutal-box bg-[#4ADE80] text-black font-black uppercase text-sm py-2.5 border-2 border-black hover:bg-[#34d399] shadow-[2px_2px_0px_#000]"
                  >
                    Add Player +
                  </button>
                </div>
              </div>
            </form>

            <div className="border-t-4 border-black pt-4">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-xs font-black uppercase">MANAGE GROUPS</label>
                <span className="text-xs bg-gray-200 font-bold px-2 py-0.5 border border-black uppercase">
                  {cellGroups.length} Active
                </span>
              </div>
              
              {/* Dynamic Cell Groups Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {cellGroups.map(cg => (
                  <span
                    key={cg}
                    className={`inline-flex items-center gap-1 ${getGroupColor(cg)} text-black font-bold text-xs px-2.5 py-1 border-2 border-black`}
                  >
                    {cg}
                    <button
                      onClick={() => removeCellGroup(cg)}
                      className="text-black hover:text-red-600 font-black ml-1 text-sm leading-none"
                      title="Remove cell group"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add New Cell Group Inline */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Group Name"
                  value={newCGName}
                  onChange={(e) => setNewCGName(e.target.value)}
                  className="flex-1 px-3 py-1.5 border-2 border-black text-sm font-bold outline-none text-black bg-white placeholder-zinc-500"
                />
                <button
                  onClick={addCellGroup}
                  className="brutal-box bg-white text-black font-black uppercase text-xs px-3 py-1.5 border-2 border-black hover:bg-gray-100 shadow-[2px_2px_0px_#000]"
                >
                  Create
                </button>
              </div>
            </div>

            {/* Bulk Import Button */}
            <div className="mt-6 pt-4 border-t-4 border-black">
              <button
                onClick={() => setShowBulkModal(true)}
                className="w-full brutal-box bg-[#38BDF8] text-black font-black uppercase text-sm py-3 border-2 border-black hover:bg-[#0ea5e9] shadow-[2px_2px_0px_#000]"
              >
                📥 BULK EXCEL/SHEETS IMPORT
              </button>
            </div>
          </div>

          {/* Mixer Settings Panel */}
          <div className="brutal-box p-6 bg-[#FACC15] shadow-[8px_8px_0px_#000]">
            <div className="fold-corner-orange"></div>
            <h2 className="brutal-font text-xl md:text-2xl mb-6 uppercase text-black">
              2. Split Controls
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-black uppercase text-black">TARGET TEAM COUNT</label>
                  <span className="brutal-font text-xl bg-black text-[#FACC15] px-3 py-1 border-2 border-black">
                    {groupCount} Teams
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max={Math.max(2, members.length)}
                  value={groupCount}
                  onChange={(e) => setGroupCount(parseInt(e.target.value, 10))}
                  className="w-full accent-black cursor-pointer"
                />
                <div className="flex justify-between text-xs font-black mt-1 uppercase text-black">
                  <span>Min: 2</span>
                  <span>Max: {members.length || 2} players</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-black uppercase text-black mb-2">TEAM NAMES STYLE</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["numbers", "colors", "heroes"] as const).map(preset => (
                    <button
                      key={preset}
                      onClick={() => setNamingPreset(preset)}
                      className={`px-3 py-2 border-2 border-black font-bold uppercase text-xs transition-all shadow-[2px_2px_0px_#000] ${
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
                className="w-full brutal-box brutal-box-hover bg-black text-[#FACC15] font-black uppercase text-lg py-4 border-4 border-black hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[6px_6px_0px_#000]"
              >
                {isDealing ? "MIXING & DEALING... 🎲" : "SPLIT TEAMS NOW 🎲"}
              </button>
            </div>
          </div>
        </section>

        {/* Right Side: Roster and Results (7 cols) */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* Tab Navigation */}
          <div className="flex gap-2 relative z-10">
            <button
              onClick={() => setActiveTab("roster")}
              className={`brutal-font text-lg md:text-xl px-6 py-3 uppercase border-4 border-black border-b-0 rounded-t-xl transition-all duration-200 shadow-[4px_0_0_#000] ${
                activeTab === "roster"
                  ? "bg-[#FACC15] text-black -translate-y-1 h-13"
                  : "bg-gray-300 text-gray-600 hover:bg-gray-200 mt-1 h-12"
              }`}
            >
              Roster ({members.length} players)
            </button>
            <button
              onClick={() => {
                if (finalTeams.length > 0) setActiveTab("teams");
              }}
              disabled={finalTeams.length === 0}
              className={`brutal-font text-lg md:text-xl px-6 py-3 uppercase border-4 border-black border-b-0 rounded-t-xl transition-all duration-200 shadow-[4px_0_0_#000] disabled:opacity-50 disabled:cursor-not-allowed ${
                activeTab === "teams"
                  ? "bg-[#38BDF8] text-black -translate-y-1 h-13"
                  : "bg-gray-300 text-gray-600 hover:bg-gray-200 mt-1 h-12"
              }`}
            >
              Results 🚀
            </button>
          </div>

          {/* Roster tab content */}
          {activeTab === "roster" && (
            <div className="brutal-box p-6 bg-white text-black shadow-[8px_8px_0px_#000] min-h-[500px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="brutal-font text-xl md:text-2xl uppercase text-black">ACTIVE ROSTER</h3>
                <span className="text-xs bg-black text-white font-bold px-3 py-1 border-2 border-black uppercase">
                  Balanced by Cell Group
                </span>
              </div>

              {members.length === 0 ? (
                <div className="text-center py-20 border-4 border-dashed border-gray-300 rounded-lg">
                  <p className="font-bold text-xl text-gray-500 mb-4 uppercase">Roster is empty</p>
                  <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
                    Manually add players on the left or paste your spreadsheet roster above.
                  </p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[550px] border-4 border-black">
                  <table className="w-full text-left border-collapse text-sm text-black">
                    <thead>
                      <tr className="bg-black text-[#FFFDF5] border-b-4 border-black">
                        <th className="p-3 font-black uppercase text-xs">#</th>
                        <th className="p-3 font-black uppercase text-xs">Player Name</th>
                        <th className="p-3 font-black uppercase text-xs">Cell Group</th>
                        <th className="p-3 font-black uppercase text-xs text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black">
                      {members.map((m, idx) => (
                        <tr key={m.id} className="hover:bg-[#FFFDF5] font-bold">
                          <td className="p-3 text-gray-500">{members.length - idx}</td>
                          <td className="p-3 text-base">{m.name}</td>
                          <td className="p-3">
                            <span className={`inline-block ${getGroupColor(m.cg)} text-black text-xs px-2 py-0.5 border border-black uppercase font-black`}>
                              {m.cg}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleRemoveMember(m.id)}
                              className="text-red-500 hover:text-red-700 hover:underline uppercase text-xs font-black"
                            >
                              Remove
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

          {/* Results Tab Content */}
          {activeTab === "teams" && finalTeams.length > 0 && (
            <div className="space-y-6">
              
              {/* Output Actions Tool Belt */}
              <div className="brutal-box p-4 bg-white text-black shadow-[6px_6px_0px_#000] flex flex-wrap gap-4 items-center justify-between">
                <span className="font-black text-sm uppercase text-black">Export results:</span>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={copyShareLink}
                    className="brutal-box bg-[#38BDF8] text-black font-black uppercase text-xs px-3 py-2 border-2 border-black hover:bg-[#0ea5e9] shadow-[2px_2px_0px_#000]"
                  >
                    🔗 Copy Share Link
                  </button>
                  <button
                    onClick={() => setShowShowcase(true)}
                    className="brutal-box bg-[#FACC15] text-black font-black uppercase text-xs px-3 py-2 border-2 border-black hover:bg-[#eab308] shadow-[2px_2px_0px_#000]"
                  >
                    📺 Showcase Teams
                  </button>
                </div>
              </div>

              {/* Dealing simulation screen */}
              {isDealing && (
                <div className="brutal-box p-8 bg-[#18181B] text-white text-center shadow-[8px_8px_0px_#000] relative overflow-hidden animate-pulse">
                  <h4 className="brutal-font text-2xl text-[#FACC15] mb-2 uppercase">DEALING IN PROGRESS...</h4>
                  <div className="flex justify-center items-center gap-4 my-6">
                    <div className="w-16 h-24 bg-[#F59E0B] border-4 border-black rounded-lg shadow-[4px_4px_0px_#000] transform rotate-[-10deg] flex items-center justify-center">
                      <span className="text-black font-black text-3xl">🃏</span>
                    </div>
                    <div className="w-16 h-24 bg-[#38BDF8] border-4 border-black rounded-lg shadow-[4px_4px_0px_#000] transform translate-y-[-10px] flex items-center justify-center">
                      <span className="text-black font-black text-3xl">🎲</span>
                    </div>
                    <div className="w-16 h-24 bg-[#FACC15] border-4 border-black rounded-lg shadow-[4px_4px_0px_#000] transform rotate-[10deg] flex items-center justify-center">
                      <span className="text-black font-black text-3xl">⚡</span>
                    </div>
                  </div>
                  <p className="font-bold text-lg text-gray-300">
                    Dealing player <span className="text-[#38BDF8] font-black">{members[dealIndex]?.name || "starting..."}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2 uppercase">
                    Greedy Dealer is scanning cells for minimum overlap collisions...
                  </p>
                </div>
              )}

              {/* Quality Stats Board */}
              {!isDealing && (
                <div className="brutal-box p-4 bg-[#C084FC] text-black shadow-[6px_6px_0px_#000] grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-bold">
                  <div>
                    <span className="block text-xs uppercase font-black text-purple-950">PLAYERS MIXED</span>
                    <span className="text-2xl brutal-font">{members.length}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-black text-purple-950">TEAMS TARGET</span>
                    <span className="text-2xl brutal-font">{finalTeams.length}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-black text-purple-950">SIZE DIFFERENCE</span>
                    <span className="text-2xl brutal-font">±{members.length % finalTeams.length === 0 ? "0" : "1"}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-black text-purple-950">CG COLLISONS</span>
                    <span className="text-2xl brutal-font">{totalSameCGOverlaps()}</span>
                  </div>
                </div>
              )}

              {/* Teams Grid */}
              {!isDealing && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {finalTeams.map((team) => (
                    <div
                      key={team.id}
                      className="team-card brutal-box shadow-[8px_8px_0px_#000] overflow-hidden"
                    >
                      {/* Team Header */}
                      <div className={`p-4 border-b-4 border-black flex justify-between items-center ${team.color}`}>
                        <h4 className="brutal-font text-lg md:text-xl uppercase">{team.name}</h4>
                        <span className="bg-black text-white text-xs font-black px-2 py-0.5 border border-black uppercase">
                          {team.members.length} players
                        </span>
                      </div>

                      {/* Team Members List */}
                      <ul className="p-4 bg-white text-black divide-y divide-gray-200">
                        {team.members.map((m, idx) => (
                          <li key={m.id} className="py-2.5 flex justify-between items-center font-bold text-sm text-black">
                            <span className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 font-mono">{idx + 1}.</span>
                              {m.name}
                            </span>
                            <span className={`${getGroupColor(m.cg)} text-black text-[10px] px-2 py-0.5 border border-black uppercase font-black`}>
                              {m.cg}
                            </span>
                          </li>
                        ))}
                        {team.members.length === 0 && (
                          <li className="py-4 text-center text-xs text-gray-400 italic">No players allocated</li>
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

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl brutal-box bg-white text-black p-6 md:p-8 shadow-[12px_12px_0px_#000] relative">
            <button
              onClick={() => setShowBulkModal(false)}
              className="absolute top-4 right-4 brutal-box bg-red-500 text-white font-black text-lg w-8 h-8 flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000]"
            >
              ×
            </button>
            <h3 className="brutal-font text-xl md:text-2xl mb-4 uppercase text-[#38BDF8]">
              📥 Paste Roster from Excel / Sheets
            </h3>
            
            <p className="text-xs font-bold text-gray-500 mb-4 leading-relaxed uppercase">
              Paste names from Excel or Google Sheets (one player per line). Custom Cell Groups will be auto-generated:
              <span className="block mt-2 font-mono text-[10px] text-zinc-600 bg-gray-100 p-2 border border-dashed border-gray-300 font-normal normal-case">
                Example inputs supported:<br />
                John Doe (Youth)<br />
                Sarah Lin, Ignite<br />
                Dave Smith - Adults<br />
                David Chew (No cell group format defaults to selected cell group)
              </span>
            </p>

            <textarea
              rows={8}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="Paste names here..."
              className="w-full p-4 border-4 border-black font-bold font-mono text-sm mb-6 outline-none bg-[#FFFDF5] text-black placeholder-zinc-500"
            ></textarea>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowBulkModal(false)}
                className="brutal-box bg-white text-black font-black uppercase text-sm px-6 py-3 border-2 border-black hover:bg-gray-100 shadow-[4px_4px_0px_#000]"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkImport}
                className="brutal-box bg-[#38BDF8] text-black font-black uppercase text-sm px-6 py-3 border-2 border-black hover:bg-[#0ea5e9] shadow-[4px_4px_0px_#000]"
              >
                Parse & Import 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Presentation Showcase Modal Overlay */}
      {showShowcase && finalTeams.length > 0 && (
        <div className="fixed inset-0 bg-[#FFFDF5] z-50 overflow-y-auto p-6 md:p-12 flex flex-col justify-between selection:bg-black selection:text-[#FACC15]">
          <div className="max-w-7xl mx-auto w-full space-y-8">
            
            {/* Header section with QR Code */}
            <div className="brutal-box bg-[#18181B] text-white p-8 rounded-xl shadow-[8px_8px_0px_#000] flex flex-col items-center gap-6 relative border-4 border-black">
              
              {/* Cabinet Top bar */}
              <div className="flex justify-between items-center w-full border-b-2 border-zinc-800 pb-4 mb-2">
                <span className="font-mono text-xs text-green-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
                  STAGE_PROJECTION_ON
                </span>
                <button
                  onClick={() => setShowShowcase(false)}
                  className="brutal-box bg-[#EF4444] text-white font-black text-xs px-3.5 py-2 border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-red-600 uppercase flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] cursor-pointer"
                >
                  🚪 CLOSE DECK
                </button>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
                <div className="space-y-3 max-w-xl text-center md:text-left">
                  <span className="bg-[#FACC15] text-black text-xs font-black px-2.5 py-1 border-2 border-black uppercase tracking-wider inline-block">
                    PRESENTATION DECK 📺
                  </span>
                  <h2 className="brutal-font text-3xl sm:text-5xl text-[#FACC15] brutal-text-glow-yellow uppercase tracking-wider">
                    TEAM DISTRIBUTIONS
                  </h2>
                  <p className="font-medium text-gray-300 text-sm leading-relaxed">
                    The admin has shuffled and allocated the roster. Check your assigned teams below, or scan the QR code to view the list and search your name on your own phone!
                  </p>
                </div>

                {/* QR Code Container (Ticket Style) */}
                <div className="brutal-box p-6 bg-[#FFFDF5] text-black border-4 border-black shadow-[6px_6px_0px_#000] flex flex-col items-center justify-center shrink-0 relative overflow-visible">
                  {/* Ticket notch cutouts */}
                  <div className="absolute top-1/2 -left-3 w-5 h-5 bg-[#18181B] border-4 border-black rounded-full transform -translate-y-1/2 z-10"></div>
                  <div className="absolute top-1/2 -right-3 w-5 h-5 bg-[#18181B] border-4 border-black rounded-full transform -translate-y-1/2 z-10"></div>
                  
                  {/* Dashed lines representing ticket tear */}
                  <div className="absolute top-4 left-4 right-4 border-t-2 border-dashed border-black"></div>
                  <div className="absolute bottom-10 left-4 right-4 border-t-2 border-dashed border-black"></div>

                  <div className="bg-white p-2.5 border-4 border-black mt-2 mb-2 relative z-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `${window.location.origin}/showcase?t=${btoa(
                          unescape(
                            encodeURIComponent(
                              JSON.stringify(
                                finalTeams.map(t => ({
                                  name: t.name,
                                  color: t.color,
                                  members: t.members.map(m => ({ name: m.name, cg: m.cg }))
                                }))
                              )
                            )
                          )
                        )}`
                      )}`}
                      alt="QR Code"
                      className="w-32 h-32 block"
                    />
                  </div>
                  <span className="text-[10px] text-black font-black uppercase tracking-widest mt-1">
                    🎟️ SCAN FOR MOBILE
                  </span>
                </div>
              </div>
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {finalTeams.map((team, idx) => (
                <div
                  key={idx}
                  className="brutal-box overflow-hidden shadow-[8px_8px_0px_#000] flex flex-col bg-white border-4 border-black hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_#000] transition-all duration-200"
                >
                  {/* Header card with team color */}
                  <div className={`p-4 border-b-4 border-black text-center font-black uppercase text-lg ${team.color || "bg-yellow-400 text-black"}`}>
                    <h3 className="brutal-font tracking-wide truncate flex items-center justify-center gap-1.5">
                      <span>{getTeamEmoji(team.name)}</span> {team.name}
                    </h3>
                    <span className="bg-black text-[#FFFDF5] text-[10px] px-2 py-0.5 border border-black uppercase font-bold mt-1.5 inline-block">
                      {team.members.length} players
                    </span>
                  </div>

                  {/* Members lists */}
                  <ul className="p-3 divide-y-2 divide-zinc-100 flex-1 bg-[#FFFDF5]">
                    {team.members.map((m, mIdx) => (
                      <li
                        key={mIdx}
                        className="py-2 px-2 flex justify-between items-center font-bold text-sm text-zinc-800 hover:bg-zinc-100 transition-colors rounded"
                      >
                        <span className="truncate">{m.name}</span>
                        <span className={`text-[10px] ${getGroupColor(m.cg)} text-black border border-black px-1.5 py-0.5 uppercase font-black shrink-0`}>
                          {m.cg}
                        </span>
                      </li>
                    ))}
                    {team.members.length === 0 && (
                      <li className="py-4 text-center text-xs text-gray-400 italic">No players allocated</li>
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
          <div className="brutal-box bg-[#FACC15] text-black font-black uppercase text-sm px-6 py-4 border-4 border-black shadow-[6px_6px_0px_#000]">
            ⚡ {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
