# Frontend Design Review

Use this checklist before finalizing a substantial frontend change. It is meant to catch design quality issues that tests and linters miss.

## Brief Fit

- The subject, audience, and page job are clear from the first viewport or first usable screen.
- The design borrows from the subject's real world rather than generic web trends.
- The signature element is visible, memorable, and tied to the brief.
- The chosen risk is concentrated in one place; supporting UI is disciplined.

## Visual System

- Palette has 4-6 purposeful colors with distinct jobs.
- Typography roles are distinct: display, body, and utility text do different work.
- Spacing, border radius, borders, shadows, and surfaces follow a clear rule.
- Imagery or media reveals the product, place, object, gameplay, state, or person when that matters.

## Layout And Interaction

- The first screen is the actual usable experience for apps, dashboards, tools, games, and portals.
- Layout devices encode meaning: sequences are numbered, comparisons align, repeated items share shape, actions sit near outcomes.
- Cards are used only for repeated items, modals, or genuinely framed tools.
- Controls use familiar patterns: icon buttons for common tools, tabs for views, toggles for binary settings, sliders or steppers for numeric controls, menus for option sets.
- Motion reveals state, guides attention, or expresses the subject. Reduced motion is respected.

## Usability Floor

- Text fits its containers at mobile and desktop sizes.
- Focus states are visible.
- Color contrast is sufficient for body text and controls.
- Empty, loading, and error states give specific direction.
- Console is free of relevant runtime errors.
- Screenshots across mobile and desktop show no overlaps, clipped labels, accidental blank space, or blank canvases.

## Copy

- Buttons use stable, active verbs: "Save changes," "Publish," "Start round."
- Labels name what users recognize, not implementation details.
- Error messages say what happened and how to fix it.
- Empty states invite a next action.
- Tone matches the product and audience without filler.

