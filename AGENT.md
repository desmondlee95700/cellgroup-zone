# Cellgroup Games Zone

## Project Context
This is a web application showcasing highly energetic and chaotic games for a large cellgroup gathering (50+ players). The project consists of a single-page static website and a programmable motion-graphics video generator.

## Design Guidelines (Neo-Brutalism)
- **Theme**: Neo-Brutalist
- **Colors**: Deep Black (`#18181B`), Cream (`#FFFDF5`), Yellow (`#FACC15`), Orange (`#F59E0B`), Blue (`#38BDF8`).
- **Typography**: `Alfa Slab One` for chunky display headers and `Inter` for body copy.
- **Styling**: Hard drop shadows (e.g., `8px 8px 0px #000`), thick borders (`border-4 border-black`), and bold uppercase accents. Use folded corner effects and high-contrast elements.
- **Frontend Design**: Always apply the `frontend-design` skill principles to avoid generic, templated looks. Every UI choice must be distinctive and opinionated.

## Tech Stack
- **Frontend**: HTML5, Tailwind CSS (via CDN), GSAP (via CDN)
- **Video Generation**: Hyperframes 

## Common Commands
- **Render Video Tutorial**: 
  ```bash
  cd video-generator
  npx hyperframes render -o ../assets/videos/games-demo.mp4
  ```
