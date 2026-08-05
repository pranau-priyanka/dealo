import { describe, expect, it } from "vitest";
import { canChangeDealStatus, getDealStatusTransitions } from "./types";

describe("merchant deal lifecycle", () => {
  it("only exposes safe merchant status transitions", () => {
    expect(getDealStatusTransitions("draft")).toEqual(["published", "expired"]);
    expect(canChangeDealStatus("published", "paused")).toBe(true);
    expect(canChangeDealStatus("paused", "published")).toBe(true);
    expect(canChangeDealStatus("expired", "published")).toBe(false);
    expect(canChangeDealStatus("draft", "paused")).toBe(false);
  });
});
