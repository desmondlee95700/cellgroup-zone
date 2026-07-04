---
name: game-website-visuals
description: Create or redesign top-tier game websites, game landing pages, interactive game hubs, tournament lobbies, arcade pages, game dashboards, rules pages, character/world showcases, and visually intense playable web experiences. Use this skill whenever the user asks for a game website or game UI, wants visuals to be "top notch", "AAA", "premium", "cinematic", "immersive", "game-like", "high energy", "not generic", or asks to improve a game-related page's art direction. Do not preserve an existing project style by default; inspect the codebase for technical patterns, then choose a fresh game-appropriate visual direction unless the user explicitly asks to match the current brand.
---

# Game Website Visuals

Use this skill to make game web work feel like a designed game experience, not a normal website with game words pasted onto it.

## First Read The Project

Inspect the local app before editing:

- Check `package.json`, routes/pages, global styles, existing components, assets, and animation libraries.
- Match the project language and framework: file extensions, routing conventions, import aliases, TypeScript strictness, styling system, and component patterns.
- Treat existing brand styles as optional context, not a cage. Preserve them only when the user asks to keep the current look.
- If the user asks for a new visual level, create a stronger art direction even when it replaces the current palette, typography, layout, or component language.

## Pick A Game Design Direction

Choose one primary direction from the game context. Do not mix many genres unless the brief is deliberately chaotic.

- **Cinematic AAA reveal**: full-bleed key art or video, dramatic title treatment, atmospheric lighting, parallax depth, trailer-like pacing.
- **Playable HUD**: health/energy bars, mission objectives, minimap, inventory, ability slots, damage numbers, status chips, diegetic controls.
- **Esports broadcast**: bracket boards, live match cards, team crests, countdowns, ticker ribbons, commentator-panel energy, sharp data hierarchy.
- **Arcade/party chaos**: chunky controls, tokens, score reels, cabinet panels, stickers, mascots, tactile buttons, crowd-ready contrast.
- **Fantasy/RPG codex**: map fragments, quest cards, runes, inventory grids, parchment/metal/gem materials, lore panels, character sheets.
- **Sci-fi command center**: holographic panels, telemetry, radar sweeps, scanlines, star maps, warning states, technical typography.
- **Horror/survival**: flashlight reveals, degraded UI, VHS/camera overlays, scarce color, inventory tension, unsettling empty space.
- **Cozy/whimsical world**: toy-like props, illustrated scenes, soft motion, collectible cards, charming microcopy, warm spatial rhythm.
- **Pixel/retro indie**: true pixel constraints, tile grids, sprite-like UI, limited palette, crisp scaling, chiptune-inspired motion.
- **Racing/sports energy**: speed lines, lap timers, leaderboards, sponsor strips, track maps, motion blur, bold numeric systems.

If the brief names a specific game, genre, platform, age group, or event, let that drive the direction. If it does not, pick the strongest fitting direction and state it briefly before building.

## Top-Tier Design Principles

- Make the first viewport feel like the game has started. Show the world, arena, HUD, character select, scoreboard, map, or playable surface immediately.
- Build around one signature visual device: a character-select wall, live bracket machine, quest board, mission cockpit, inventory grid, card table, cabinet console, map room, boss warning screen, or demo scene.
- Use real game artifacts. Favor characters, props, maps, cards, meters, weapons/tools, terrain, tiles, tokens, badges, scoreboards, timers, and ability icons over generic cards and abstract blobs.
- Make UI state feel like game feedback. Hover, active, selected, disabled, loading, success, and error states should light up, press, charge, shake, scan, level up, lock, unlock, or count down.
- Treat typography like game branding. Use a distinctive display face or title treatment, readable UI/body type, and a clear numeric style for stats, timers, and scores.
- Commit to a palette with contrast and hierarchy. Premium game sites often use a controlled base, high-impact accent, and material colors tied to the world rather than evenly distributed rainbow color.
- Layer depth deliberately: foreground UI, midground content, background world, atmosphere, particles, shadows, parallax, or lighting. Keep readability above spectacle.
- Prefer one orchestrated motion moment over many random animations: boot sequence, scene reveal, card fan, scoreboard flip, map scan, character hover, or combat-ready transition.
- Build the real interaction, not a brochure. Include browse, choose, start, join, inspect, watch, compare, filter, vote, progress, or configure where the page naturally asks for it.

## Visual Quality Bars

Before finishing, check the design against these bars:

- **Genre clarity**: A user can name the game world or genre from the first screen without reading a paragraph.
- **Memorable hook**: There is one visual idea worth describing to someone else.
- **Material believability**: Surfaces, icons, lighting, textures, and controls feel like they belong to the same game.
- **Interaction richness**: Key controls have tactile or cinematic states, not only color changes.
- **Composition**: The layout uses scale, overlap, asymmetry, depth, or strong grids with intention.
- **Responsive polish**: Mobile keeps the fantasy intact; it does not collapse into stacked generic cards.
- **Asset honesty**: Use actual product/game/world/player visuals when available. If assets are missing, create CSS/canvas/SVG/game-prop visuals that are specific rather than decorative filler.
- **Performance restraint**: Heavy visuals should be purposeful. Avoid infinite expensive effects that make the page feel worse to use.
- **Accessibility**: Maintain readable contrast, keyboard focus, sensible labels, and reduced-motion handling for intense movement.

## Implementation Guidance

- Use the project's existing stack and conventions, but choose the visual system from the game direction.
- Add `"use client"` only when needed for state, browser APIs, audio, refs, animation hooks, or interactive canvases.
- Keep data typed and local when building static showcases: games, characters, teams, cards, scores, quests, rounds, or loadouts.
- Use stable responsive dimensions for boards, cards, HUD panels, canvases, videos, timers, and icon grids so interactions do not shift layout.
- Avoid nested generic cards. Make sections feel like arenas, maps, screens, cabinets, dossiers, brackets, panels, or inventory surfaces.
- Use audio only after user interaction and fail silently if blocked.
- Verify desktop and mobile in a browser when possible. Check screenshots for blank canvases, broken media, clipped text, overlapping UI, and weak first-viewport impact.

## Output Notes

When summarizing work, mention:

- The technical language/framework matched.
- The selected game design direction.
- The signature visual device.
- The files changed and verification performed.

## Example Prompts

Input: "Make this game website look top notch, not like a normal landing page."
Output approach: Pick a genre direction, create a signature first-viewport game surface, add game artifacts and tactile states, then verify responsive polish.

Input: "Create a premium tournament lobby page."
Output approach: Use esports broadcast direction with brackets, team identity, countdowns, match cards, and live scoreboard energy.

Input: "Redesign this fantasy game page."
Output approach: Build around an RPG codex, map, quest board, inventory, or character sheet with materials, icons, and motion from that world.

Input: "This arcade page feels boring."
Output approach: Turn it into a playable cabinet or score-reel interface with chunky controls, sound-safe interactions, score states, and animated feedback.
