import { describe, expect, it } from "vitest";
import { regulatoryWeightPreference } from "@/lib/recommendation-v4";
import type { KitBundle, UserPreferences } from "@/lib/schema";

function prefs(prefer: boolean): UserPreferences {
  return {
    budget: 1000,
    experience: "advanced",
    style: "freestyle",
    videoSystem: "analog",
    scope: "FULL_KIT",
    advancedPriority: "BALANCED",
    environment: "OUTDOOR",
    ownedGear: {},
    regulatoryRegion: "CO",
    operationPurpose: "RECREATIONAL",
    preferSimplerWeightClass: prefer,
  };
}

function bundle(weight: number | null, threshold: number | null): KitBundle {
  return {
    regulatory: {
      region: "CO",
      purpose: "RECREATIONAL",
      estimatedTakeoffWeightG: weight,
      weightThresholdG: threshold,
      status: "CHECK_LOCAL_RULES",
      messageKey: "regulation.generalDisclaimer",
      warnings: [],
    },
  } as unknown as KitBundle;
}

describe("Iteration 4 regulatory weight preference", () => {
  it("adds only a secondary ranking bonus below a known threshold", () => {
    expect(regulatoryWeightPreference(bundle(199, 200), prefs(true))).toBe(0.55);
    expect(regulatoryWeightPreference(bundle(200, 200), prefs(true))).toBe(-0.15);
  });

  it("does nothing when disabled or when ready-to-fly weight is unknown", () => {
    expect(regulatoryWeightPreference(bundle(199, 200), prefs(false))).toBe(0);
    expect(regulatoryWeightPreference(bundle(null, 200), prefs(true))).toBe(0);
    expect(regulatoryWeightPreference(bundle(199, null), prefs(true))).toBe(0);
  });
});
