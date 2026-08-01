---
name: project-code-review
description: Review Cellgroup Games code changes for correctness, maintainability, scalability, and clean project structure. Invoke this skill after every change to source code, routes, React components, styles, tests, configuration, build scripts, dependencies, public behavior, or HyperFrames files and before the final handoff, even when the user did not explicitly ask for a review. Also use it for explicit code reviews, refactors, architecture checks, and pull-request review. Do not invoke it for read-only explanations, status checks, or documentation-only edits that cannot affect runtime or developer workflows.
---

# Project Code Review Gate

Review the current task's code as a senior maintainer who will need to extend it six months from now. Protect behavior first, then improve boundaries where the changed code creates a concrete maintenance or scaling cost. A useful review catches real failure modes without demanding abstractions for their own sake.

## Ground the review

1. Read the root `AGENTS.md` and any nested `AGENTS.md` that governs a changed file.
2. Read `references/project-architecture.md` when the change touches `src/`, project configuration, tests, public assets, or `video-generator/`. Also read `references/next15-react-tailwind-gsap.md` for React, TypeScript, route, CSS, or animation changes.
3. Establish the review scope from the current task, `git status --short`, and the relevant diff. Include untracked files created by the task; a normal `git diff` does not show their contents.
4. Preserve pre-existing user work. Do not attribute unrelated dirty-worktree changes to the current task or rewrite them to satisfy the review.
5. Inspect the actual changed code and its consumers. Never issue a clean verdict from filenames or a diff summary alone.

## Review in this order

### 1. Correctness and regressions

- Trace the changed user flow end to end, including navigation, loading, empty, error, and persisted-state paths that the change can affect.
- Check route targets, component contracts, state transitions, serialization, query parameters, and browser/server boundaries.
- Look for stale closures, missing effect cleanup, unstable dependencies, mutation of React state, invalid keys, race conditions, and hydration hazards.
- Confirm failures are handled honestly. A swallowed exception or a success message after a failed operation is a correctness issue, not polish.

### 2. Maintainability

- Keep each module centered on one reason to change. Extract a unit when the new code adds a distinct responsibility, reusable domain rule, or independently testable behavior.
- Prefer one source of truth for shared types, storage keys, parsing, URL encoding, team/scoring rules, and theme metadata.
- Flag duplication when copies can drift in behavior, not merely because two snippets look similar.
- Keep public component and utility contracts typed and unsurprising. Names should describe domain intent; comments should explain constraints or decisions rather than restating code.
- Avoid speculative frameworks, registries, context providers, hooks, or generic helpers when a local function remains clearer.

### 3. Scalability

- Evaluate realistic gathering sizes of 50+ players and repeated host interactions, not hypothetical internet-scale traffic.
- Watch for nested scans, repeated sorts, unbounded timers/listeners/audio contexts, oversized URL payloads, uncontrolled storage growth, and full-page rerenders on high-frequency actions.
- Keep large datasets and domain transforms outside presentation markup when they are reused, expensive, or difficult to test.
- Check responsive layout and text containment when lists, names, scores, or team counts grow beyond demo data.
- Treat bundle size and client boundaries as scaling concerns: do not push server-safe work or heavy libraries into a broader client tree without a reason.

### 4. Clean structure

- Keep App Router `page.tsx` files as route entry points. Put reusable UI in `src/components` and reusable domain logic/types in `src/lib`.
- Do not import one route's `page.tsx` from another route. Extract the shared component instead.
- Apply the Next.js 15, React, Tailwind CSS v4, and `@gsap/react` guardrails in `references/next15-react-tailwind-gsap.md`.
- Follow the nested HyperFrames architecture and validation rules for video-generator changes; do not apply React assumptions to HTML compositions.

### 5. Tests and verification

- Match checks to risk. Read the available package scripts instead of inventing commands.
- For TypeScript, React, route, or shared-library changes, normally run `npm run lint` and `npm test`.
- Add `npm run build` when routes, server/client boundaries, configuration, dependencies, imports, or production compilation could be affected.
- Do not run browser-based visual verification as part of this review gate unless the user explicitly requests it.
- For HyperFrames changes, work from `video-generator/` and run its required `npm run check` after reading the nested instructions.
- If a check is blocked by network, credentials, sandboxing, or missing services, report the exact limitation. Do not convert an unrun check into a pass.

## Decide what to fix

Use these priorities:

- **P0**: data loss, destructive behavior, exploitable security issue, or unusable release.
- **P1**: likely user-facing breakage, invalid production behavior, corrupted persisted state, or a major regression.
- **P2**: concrete maintainability, scalability, accessibility, or structural defect that will make the changed area unsafe or costly to extend.
- **P3**: small hardening or clarity improvement with limited impact.

During an implementation task, fix high-confidence, in-scope P0-P2 findings before handoff and rerun affected checks. Fix P3 only when it is local and clearly improves the change. During an explicit review-only task, do not edit files; report findings with a precise remedy.

Do not block delivery on style preferences, arbitrary line-count limits, personal naming taste, or a repository-wide concern the current change did not introduce or worsen. Existing large files are context: prevent new responsibilities from making them worse, but do not demand a wholesale rewrite during an unrelated task.

## Review loop

1. Inspect the diff and relevant surrounding code.
2. Record only findings with a specific failure mode or future cost.
3. Fix authorized, high-confidence findings in the smallest coherent patch.
4. Re-read the final diff, including the fix itself.
5. Run proportional verification and `git diff --check`.
6. Stop after a clean pass; do not create churn by repeatedly redesigning sound code.

## Handoff format

Lead with actionable findings, ordered by severity:

```text
[P1] Short finding title — path/to/file.tsx:42
Impact: What breaks or becomes costly, under what conditions.
Evidence: The relevant behavior in the changed code.
Remedy: The smallest robust correction.
Status: Fixed now | Open for user decision
```

If no actionable issue remains, say:

```text
Code review: no actionable maintainability, scalability, or structural issues remain in the changed scope.
```

Then list checks actually run and any residual risk or unverified behavior. Keep a clean review concise; do not manufacture findings to make the gate look busy.
