# Cellgroup Games Zone

## Project Context
This is a web application showcasing highly energetic and chaotic games for a large cellgroup gathering (50+ players). The project consists of a Next.js 15 web application and a programmable motion-graphics video generator.

## Design Guidelines (Neo-Brutalism)
- **Theme**: Neo-Brutalist
- **Colors**: Deep Black (`#18181B`), Cream (`#FFFDF5`), Yellow (`#FACC15`), Orange (`#F59E0B`), Blue (`#38BDF8`).
- **Typography**: `Alfa Slab One` for chunky display headers and `Inter` for body copy.
- **Styling**: Hard drop shadows (e.g., `8px 8px 0px #000`), thick borders (`border-4 border-black`), and bold uppercase accents. Use folded corner effects and high-contrast elements.
- **Frontend Design**: Always apply the `frontend-design` skill principles to avoid generic, templated looks. Every UI choice must be distinctive and opinionated.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS v4, GSAP (`@gsap/react`)
- **Video Generation**: Hyperframes 

## Common Commands
- **Run Development Server**:
  ```bash
  npm run dev
  ```
- **Render Video Tutorial**: 
  ```bash
  cd video-generator
  npx hyperframes render -o ../public/assets/videos/games-demo.mp4
  ```
