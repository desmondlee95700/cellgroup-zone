---
name: frontend-design
description: Use this skill whenever building, redesigning, or reviewing frontend UI, web pages, dashboards, landing pages, games, interactive tools, or visual components. It helps produce distinctive, brief-specific interfaces instead of generic AI templates, and should be used even when the user only asks to "make it nicer," "polish the UI," "improve the design," "build a page," or "create an app."
license: Complete terms in LICENSE.txt
---

# Frontend Design

Approach frontend work like the design lead at a small studio: the interface should feel inevitable for this subject, audience, and job, not like a reusable template with swapped copy. Make deliberate choices about palette, typography, structure, motion, imagery, and writing. Take one real aesthetic risk that you can justify from the brief.

For this repository, honor the project-level direction in `AGENTS.md` when present. The Cellgroup Games site uses neo-brutalist energy: deep black, cream, yellow, orange, blue, chunky display type, thick borders, hard shadows, folded corners, and bold uppercase accents. Treat that as the local brand language, then make each screen/game page distinct within it.

## Operating Loop

1. **Pin the subject.** If the user did not define the subject tightly, choose one concrete subject, audience, and single job for the page or component. State that choice briefly when it materially affects the design.
2. **Mine the subject's world.** Pull visual cues from real artifacts, materials, rules, instruments, spaces, rituals, data, or verbs in the subject. Distinctiveness comes from the thing itself.
3. **Create a compact design system.** Define 4-6 named colors, type roles, spacing rhythm, component geometry, and one signature visual or interaction. Use these tokens consistently in code.
4. **Sketch structure before styling.** Decide what the user must understand or do first, second, and third. Layout devices such as labels, numbers, dividers, cards, and panels should encode meaning, not merely decorate.
5. **Build the real experience first.** For apps, games, dashboards, tools, and portals, make the first screen usable. Do not default to a marketing landing page unless the user explicitly needs one.
6. **Critique before shipping.** Compare the result against the brief and against common AI-design defaults. Remove decoration that does not serve the chosen direction.

Keep most of this planning private unless the user asks for design rationale. When the design direction is risky or ambiguous, share the plan before a large implementation.

## Design Plan Format

Before significant frontend implementation, form a concise plan:

```text
Subject: [specific subject, audience, job]
Palette: [4-6 named hex values with roles]
Type: [display, body, utility roles]
Layout: [one-sentence concept]
Signature: [the memorable element tied to the subject]
Risk: [the intentional aesthetic risk and why it fits]
```

For large or ambiguous screens, add a tiny ASCII wireframe. Prefer two small competing layout ideas over a long essay.

## Principles

**The hero is a thesis.** Open with the most characteristic thing in the subject's world: a playable moment, a real product image, a dense operational surface, a decisive headline, a map, a score state, an animation, or a strong editorial composition. Avoid the default "big headline, gradient blob, three stats" pattern unless it is truly the right answer.

**Typography carries personality.** Choose type roles deliberately. A display face should have a reason to be there and should be used with restraint. Body text should remain readable. Utility text for labels, metadata, counters, or controls should be consistent and scannable.

**Color has jobs.** Each major color should mean something: background, surface, action, warning, progress, team, status, depth, or emphasis. Avoid one-note palettes where everything is a tint of the same hue family.

**Structure is information.** Use numbering only for real sequences. Use cards for repeated items, modals, or framed tools, not as the default wrapper for every section. Let section shape, density, and alignment reflect how the content is used.

**Motion should have a reason.** Prefer one orchestrated motion idea over many scattered effects. Respect reduced motion. Animation should reveal state, express the subject, or guide attention.

**Copy is interface material.** Write from the user's side of the screen. Use plain verbs, sentence case, stable action names, useful empty states, and specific errors. Labels label; examples demonstrate; marketing adjectives earn their keep.

## Code And Implementation Habits

- Derive every color and type decision from the plan or existing design system.
- Use responsive constraints for fixed-format elements such as boards, grids, toolbars, counters, and cards so content cannot resize or shift the layout unexpectedly.
- Keep text legible and contained at mobile and desktop widths; do not scale font size directly with viewport width.
- Use familiar controls and icons for familiar actions. Prefer the project's icon library, such as `lucide-react`, when available.
- Avoid selector fights. Keep CSS specificity simple, and watch for broad element selectors overriding component classes.
- Verify visually when possible with screenshots across desktop and mobile. Check console errors, overlaps, blank canvases, text overflow, focus states, and reduced-motion behavior.

## When To Read References

- Read `references/anti-patterns.md` when a design risks looking generic, overdecorated, or AI-generated.
- Read `references/design-review.md` before final review of a substantial UI change.
- Use `evals/evals.json` as seed prompts when testing whether changes to this skill improve design outcomes.

