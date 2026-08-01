# Next.js 15, React, Tailwind v4, and GSAP Review Reference

Use these guardrails whenever a changed file is TypeScript, TSX, CSS, a route, or an animation. They are intentionally practical: report a framework issue only when it can break rendering, navigation, state, styling, accessibility, or safe extension of the changed area.

## Next.js 15 App Router

- Treat `page.tsx`, `layout.tsx`, and route handlers as server-rendered by default. Add `"use client"` only to the smallest component that needs state, effects, event handlers, browser APIs, GSAP, or client-only libraries.
- Keep `localStorage`, `sessionStorage`, `window`, `document`, `AudioContext`, and `matchMedia` out of module scope and server components. Access them from guarded client effects or user event handlers.
- Keep route files as entry points. Share view logic through `src/components` and domain logic through `src/lib`; never reuse a route by importing another route's `page.tsx`.
- Use `next/link` for internal navigation and `useRouter` from `next/navigation` only for imperative client navigation. Check that route transitions preserve intended history semantics (`push` versus `replace`).
- Review `useSearchParams`, client-only data, and browser-dependent widgets for an appropriate Suspense boundary or client boundary. Do not make metadata, server data fetching, or layouts client-side merely to satisfy one interactive child.
- Check loading, error, not-found, direct URL, and refresh behavior when a change adds or alters a route or its persisted/query state.
- Do not assume the declared framework version matches the installed package. If a change uses version-specific APIs, verify the current `package.json` and report a mismatch as a compatibility risk rather than silently applying an incompatible pattern.

## React

- Derive values during render when possible; do not add effects solely to mirror props or compute synchronous derived state.
- Use functional state updates when the next value depends on the previous value. Keep state ownership near the behavior it controls and avoid parallel state that can fall out of sync.
- Ensure effects declare correct dependencies and clean up intervals, listeners, subscriptions, animation contexts, and pending work. Repeated mounts and interactions must not accumulate resources.
- Keep lists keyed by stable domain IDs. Index keys are acceptable only for immutable, non-reordered presentation lists.
- Avoid mutating state-derived arrays or objects (`sort`, `reverse`, `push`, property assignment). Copy before transforming and centralize reusable transforms.
- Give empty, loading, and error states a real path when data is asynchronous, persisted, or can fail to parse.

## Tailwind CSS v4 and CSS

- Keep Tailwind class names statically discoverable. Do not build classes such as `bg-${color}-500` or `grid-cols-${count}` from runtime strings; use a typed lookup, CSS variable, or static class map instead.
- Prefer the project's existing Tailwind v4 and CSS conventions. Do not introduce legacy JavaScript configuration assumptions or a second token system without a concrete need.
- Use utilities for local layout and state; keep reusable visual primitives and feature-specific selectors intentionally scoped. New global selectors must not alter unrelated routes through broad element or utility-class rules.
- Check responsive states, text wrapping, focus visibility, contrast, reduced motion, and touch targets whenever visual behavior changes.
- Avoid opaque, duplicated arbitrary values when an existing token or component rule expresses the same meaning. Do not refactor stable styling merely to reduce class length.

## GSAP and @gsap/react

- Prefer `useGSAP` or a `gsap.context` scoped to a component ref. Scope selectors so one route cannot animate matching elements on another route.
- Revert GSAP contexts and clean up timelines, delayed calls, intervals, and event listeners on unmount. A transition that works once but leaves animations alive is a regression.
- Use refs or component-scoped targets rather than global selectors for interaction-driven animation. Do not query the entire document from a reusable component.
- Respect `prefers-reduced-motion`; either reduce duration or provide a clear non-animated state without blocking interaction.
- Keep animation as an enhancement. Navigation, game controls, and state changes must finish correctly if animation is skipped, interrupted, or reduced.
- Avoid creating a new `AudioContext` or timeline on rapid repeated input without bounding or disposing it; test the repeated-click path for leaks and stacked sound.

## Focused verification

| Change | What to prove |
| --- | --- |
| App Router path or back link | Direct load, forward navigation, intended browser history, and production build route output |
| Client boundary or browser API | Server/prerender safety and hydration without console errors |
| React state/effect | Repeated interaction and unmount/re-entry leave no stale state or duplicate side effects |
| Tailwind or global CSS | Desktop/mobile layout, focus state, and no visual regression on another route sharing the stylesheet |
| GSAP interaction | Reduced-motion path, repeated activation, route exit/unmount cleanup, and final state without animation |
