# Cellgroup Games Review Reference

Use this reference to judge changed code against this repository's actual shape. Confirm versions and scripts from the current package files because project metadata can drift.

## Application surfaces

### Next.js application

- `src/app/` owns App Router route entry points and global application styling.
- `src/components/` owns reusable or cross-route React experiences.
- `src/lib/` owns reusable domain logic, serialization, theme data, and shared types.
- `public/assets/` owns runtime images and rendered videos.
- Root `package.json` is the source of truth for framework versions and available checks.

Current product routing intentionally separates the reserve entrance at `/` from basecamp at `/home`. Game, mixer, and showcase navigation that says “back to basecamp” should target `/home`; an explicit “exit reserve” action may target `/`.

### HyperFrames generator

- `video-generator/` is a separate package with its own `AGENTS.md`, commands, and deterministic timeline rules.
- Read its nested instructions before reviewing or changing compositions.
- Browser-app validation does not replace `video-generator`'s own `npm run check`.

## Domain boundaries worth protecting

- Mixer and showcase share team, member, score, color, and share-link concepts. When changed behavior crosses both routes, prefer a shared type or domain helper in `src/lib` over parallel interfaces and parsing rules.
- Persistence uses browser storage for roster, groups, teams, settings, and cached showcase data. When touching persistence, centralize new keys and validate parsed values so schema drift cannot silently poison UI state.
- The showcase share URL is a bounded transport format, not an unlimited database. Review payload growth, encoding failures, and QR safety when team data changes.
- The app's passcode is client-side UI gating, not strong authentication. Do not describe it as secure authorization or attach sensitive server behavior to it.
- GSAP and synthesized audio create resources that need cleanup or bounded lifetimes. Repeated user actions must not accumulate timelines, intervals, listeners, or audio contexts indefinitely.

## Existing debt versus changed-scope findings

- `src/app/mixer/page.tsx` and `src/app/globals.css` are already large. Do not report file size alone. When a change adds a new functional cluster, persistence concern, or reusable visual system, consider extracting that new responsibility so the files do not keep absorbing unrelated behavior.
- Some domain shapes are duplicated today. Report or fix duplication when the current change adds another copy, changes one side without the other, or makes drift likely.
- Keep neo-brutalist and safari styling feature-scoped. New styles should reuse existing palette/type conventions without broad selectors that destabilize other screens.

## Proportional verification guide

| Changed surface | Minimum useful checks | Add when risk warrants |
| --- | --- | --- |
| Shared TypeScript utility | Targeted tests, `npm run lint` | `npm run build` when imported by routes |
| React component or route | `npm run lint`, `npm test` | Production build and browser flow verification |
| Routing/navigation | Lint, tests, production build | Click-through and direct-load verification |
| CSS-only visual behavior | Lint plus visual check | Build for new imports or configuration |
| Root config/dependencies | Relevant script plus production build | Focused runtime smoke test |
| HyperFrames composition | Nested `npm run check` | Preview/render when visual output changed materially |

Treat failed checks according to cause. A product failure is a finding; a network-only font download failure is an environment limitation until retried in an authorized environment.
