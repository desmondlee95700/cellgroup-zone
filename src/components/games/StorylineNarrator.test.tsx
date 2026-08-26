import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { STORY_ACTS, StorylineNarrator } from "./StorylineNarrator";

describe("STORY_ACTS data integrity", () => {
  it("contains complete narrative text for Act I and Act II", () => {
    expect(STORY_ACTS.length).toBe(2);
    const act1 = STORY_ACTS.find((a) => a.id === "act-1");
    const act2 = STORY_ACTS.find((a) => a.id === "act-2");

    expect(act1?.narrativeText).toContain("Lion King");
    expect(act1?.narrativeText).toContain("introduce themselves");

    expect(act2?.narrativeText).toContain("strong wind blew");
    expect(act2?.narrativeText).toContain("bridge had been completely destroyed");
  });

  it("renders StorylineNarrator statically without error", () => {
    const html = renderToStaticMarkup(<StorylineNarrator />);
    expect(html).toContain("FOREST GUARDIAN NARRATOR");
    expect(html).toContain("Act I: The Birthday Gathering");
  });
});
