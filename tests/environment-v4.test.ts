import { describe, expect, it } from "vitest";
import { getProducts } from "@/lib/products";
import { recommendKitV4 } from "@/lib/recommendation-v4";
import type { KitBundle, UserPreferences } from "@/lib/schema";

const products = getProducts();

function prefs(overrides: Partial<UserPreferences>): UserPreferences {
  return {
    budget: 2200,
    experience: "intermediate",
    style: "cinematic",
    videoSystem: "dji_o4",
    scope: "FULL_KIT",
    advancedPriority: "BALANCED",
    environment: "MIXED",
    ownedGear: {},
    regulatoryRegion: "OTHER",
    operationPurpose: "RECREATIONAL",
    preferSimplerWeightClass: false,
    ...overrides,
  };
}

function kit(input: UserPreferences): KitBundle {
  const result = recommendKitV4(input, products);
  expect(result.kind).toBe("kit");
  if (result.kind !== "kit") throw new Error("Expected kit");
  return result.kit;
}

describe("Iteration 4 environment intent", () => {
  it("changes the Analog tinywhoop winner between tight indoor and outdoor use", () => {
    const indoor = kit(prefs({ budget: 1100, experience: "beginner", style: "tinywhoop", videoSystem: "analog", environment: "INDOOR_TIGHT" }));
    const outdoor = kit(prefs({ budget: 1100, experience: "beginner", style: "tinywhoop", videoSystem: "analog", environment: "OUTDOOR" }));
    expect(indoor.drone.id, `indoor=${indoor.drone.id}; outdoor=${outdoor.drone.id}`).not.toBe(outdoor.drone.id);
  });

  it("changes micro-like freestyle intent between tight indoor and outdoor use", () => {
    const indoor = kit(prefs({ budget: 1600, experience: "beginner", style: "freestyle", videoSystem: "analog", environment: "INDOOR_TIGHT" }));
    const outdoor = kit(prefs({ budget: 1600, experience: "beginner", style: "freestyle", videoSystem: "analog", environment: "OUTDOOR" }));
    expect(indoor.drone.id, `indoor=${indoor.drone.id}; outdoor=${outdoor.drone.id}`).not.toBe(outdoor.drone.id);
  });

  it("changes O4 cinematic platform between tight indoor and outdoor use", () => {
    const indoor = kit(prefs({ budget: 2300, style: "cinematic", videoSystem: "dji_o4", environment: "INDOOR_TIGHT" }));
    const outdoor = kit(prefs({ budget: 2300, style: "cinematic", videoSystem: "dji_o4", environment: "OUTDOOR" }));
    expect(indoor.drone.id, `indoor=${indoor.drone.id}; outdoor=${outdoor.drone.id}`).not.toBe(outdoor.drone.id);
    const indoorSize = indoor.drone.aircraftProfile?.sizeClass;
    const outdoorSize = outdoor.drone.aircraftProfile?.sizeClass;
    expect(["CINE_2", "CINE_2_5", "CINE_3"]).toContain(indoorSize);
    expect(["CINE_3", "CINE_3_5"]).toContain(outdoorSize);
  });

  it("surfaces at least one typed Value/Premium alternative in a broad O4 cinematic budget", () => {
    const result = recommendKitV4(prefs({ budget: 2600, style: "cinematic", videoSystem: "dji_o4", environment: "MIXED" }), products);
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.alternatives?.length ?? 0).toBeGreaterThan(0);
    expect(result.alternatives?.every((bundle) => bundle.alternativeRole === "VALUE" || bundle.alternativeRole === "PREMIUM")).toBe(true);
  });
});
