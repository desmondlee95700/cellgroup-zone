# 🐾 Cellgroup Games Zone — Animal Kingdom Safari

A high-energy, PRESENTATION-READY Neo-Brutalist web application and motion-graphics engine designed for hosting large cellgroup gatherings (50+ players). Features automated team balancing, real-time score keeping, interactive game simulators, mobile crew finders, and a 3D presenter winner podium with joyful animated animal characters.

---

## 🌟 Key Functional Modules

### 🦁 1. Safari Basecamp (`/home`)
- **Event Dashboard**: The entry hub providing an interactive expedition map for rangers, cell leaders, and players.
- **Stage Navigation**: Seamless routing to Herd Maker, Wild Field Guide, Team Finder, and Live Victory Standings.

### 🐘 2. Herd Maker & Crew Mixer (`/mixer`)
- **Automated Team Generator**: Instantly balances 50+ explorers across custom safari animal crews (Lion, Elephant, Flamingo, Zebra, Cheetah, Hippo, Croc).
- **Preset Cellgroup Roster**: Supports quick selection across cellgroup rosters (Jason, Lemuel, Rebecca, Jackson) or custom imports.
- **Live Scoreboard**: Real-time score awarding controls (+1, +2, +3 points) with instant QR code generation for live projector sync.

### 🦩 3. Wild Field Games Guide (`/games`)
- **Expedition Game Rules**: Interactive rulebooks, step-by-step ranger dispatches, and audio-visual trial simulators for **Canopy Call** (name game reveal) and **Herd Round-Up** (migration race).
- **Campfire Screening Reel**: Embedded motion-graphics video tutorial previewing game mechanics.

### 📱 4. Mobile Explorer Team Finder (`/showcase`)
- **Instant Crew Finder**: Mobile-optimized player tool for explorers to look up their assigned animal crew and teammates on their smartphones via QR code or shared URL (`/showcase?t=...`).

### 👑 5. Victory Standings & 3D Winner Podium (`/showcase/standings`)
- **3D Presenter Podium Stage**: Projector-ready 3D Olympic Winner Podium featuring Step 1 (Center Gold Champion), Step 2 (Left Blue Runner-Up), and Step 3 (Right Bronze).
- **Stacked Tied Team Support**: Multiple teams tied for 1st, 2nd, or 3rd place are stacked together on their earned podium step with special tied champion banners.
- **Joyful Jumping Animal Animations**: Animated cartoon animal avatars perform high-jump celebrations and joyful bouncing on podium team cards.
- **Chasing Herds Leaderboard**: Displays non-podium and 0-point teams below the main stage.

---

## 🎨 Design System (Neo-Brutalism)

- **Theme**: Neo-Brutalist Safari
- **Typography**: `Alfa Slab One` for bold display headers and `Inter` for crisp body copy.
- **Colors**: Deep Black (`#18181B`), Cream (`#FFFDF5`), Gold Yellow (`#FACC15`), Orange (`#F59E0B`), Sky Blue (`#38BDF8`), Emerald Green (`#2E7D4D`).
- **Styling**: Hard drop shadows (`shadow-[5px_5px_0px_#000]`), thick borders (`border-4 border-black`), and high-contrast energetic elements.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 15 (App Router, Turbopack)
- **UI & Styling**: React 19, Tailwind CSS v4, Vanilla CSS Design System (`globals.css`)
- **Animations**: GSAP (`@gsap/react`), CSS Keyframes
- **Testing**: Vitest (`npm test`)
- **Video Generation**: [Hyperframes](https://github.com/aidenybai/hyperframes) + GSAP canvas renderer

---

## 🚀 Commands

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Unit Tests
```bash
npm test
```

### Production Build
```bash
npm run build
```

### Render Motion-Graphics Video Tutorial
```bash
cd video-generator
npm install
npx hyperframes render -o ../public/assets/videos/games-demo.mp4
```

---

## 📁 Codebase Structure

```text
cellgroup-games/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Entry Landing Page router export
│   │   ├── EntryLandingPage.tsx         # Welcome Gathering Page logic
│   │   ├── home/                        # Basecamp Hub (/home)
│   │   ├── mixer/                       # Herd Maker & Crew Mixer (/mixer)
│   │   ├── games/                       # Wild Field Guide (/games)
│   │   ├── showcase/                    # Mobile Team Finder (/showcase)
│   │   └── showcase/standings/          # Victory Winner Podium (/showcase/standings)
│   ├── components/                      # Reusable UI, Cartoon Animal Icons & Modals
│   └── lib/                             # Data decoding, share URL encoders & safari profiles
├── video-generator/                     # Hyperframes video generator project
└── public/assets/                       # Static media, images & games-demo.mp4 video
```
