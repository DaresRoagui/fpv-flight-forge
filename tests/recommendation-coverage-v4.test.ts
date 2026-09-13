import { describe, expect, it } from "vitest";
import { buildRecommendedExtras } from "@/lib/accessories";
import { batteryMatchesDrone, chargerMatchesBattery, protocolMatches, videoSystemMatches } from "@/lib/compat";
import { EXCHANGE_RATES, formatPrice } from "@/lib/i18n";
import { getProductById, getProducts } from "@/lib/products";
import { questionnaireSteps } from "@/lib/questionnaire";
import { recommendKitV4 } from "@/lib/recommendation-v4";
import { assessRegulation } from "@/lib/regulation";
import type { KitBundle, Product, UserPreferences } from "@/lib/schema";

const products = getProducts();

function prefs(overrides: Partial<UserPreferences> = {}): UserPreferences {
  return {
    budget: 1800,
    experience: "intermediate",
    style: "freestyle",
    videoSystem: "recommend",
    scope: "FULL_KIT",
    advancedPriority: "BALANCED",
    environment: "MIXED",
    ownedGear: {},
    regulatoryRegion: "CO",
    operationPurpose: "RECREATIONAL",
    preferSimplerWeightClass: false,
    ...overrides,
  };
}

function hardValid(bundle: KitBundle) {
  if (bundle.goggles) expect(videoSystemMatches(bundle.goggles, bundle.drone)).toBe(true);
  if (bundle.radio) expect(protocolMatches(bundle.radio, bundle.drone)).toBe(true);
  expect(batteryMatchesDrone(bundle.battery, bundle.drone).state).not.toBe("HARD_INVALID");
  if (bundle.charger) expect(chargerMatchesBattery(bundle.charger, bundle.battery).state).not.toBe("HARD_INVALID");
}

const scenarios: Array<[string, Partial<UserPreferences>]> = [
  ["tiny analog beginner indoor", { budget: 800, experience: "beginner", style: "tinywhoop", videoSystem: "analog", environment: "INDOOR_TIGHT" }],
  ["tiny analog intermediate mixed", { budget: 1000, style: "tinywhoop", videoSystem: "analog", environment: "MIXED" }],
  ["tiny O4 beginner indoor", { budget: 1100, experience: "beginner", style: "tinywhoop", videoSystem: "dji_o4", environment: "INDOOR_TIGHT" }],
  ["tiny recommend beginner mixed", { budget: 1100, experience: "beginner", style: "tinywhoop", videoSystem: "recommend", environment: "MIXED" }],
  ["micro-like freestyle indoor", { budget: 1300, experience: "beginner", style: "freestyle", videoSystem: "analog", environment: "INDOOR_TIGHT" }],
  ["freestyle analog", { budget: 1500, style: "freestyle", videoSystem: "analog", environment: "OUTDOOR" }],
  ["freestyle O4", { budget: 2000, style: "freestyle", videoSystem: "dji_o4", environment: "OUTDOOR" }],
  ["freestyle recommend advanced", { budget: 2400, experience: "advanced", style: "freestyle", videoSystem: "recommend", environment: "OUTDOOR" }],
  ["cinematic O4 beginner indoor", { budget: 1600, experience: "beginner", style: "cinematic", videoSystem: "dji_o4", environment: "INDOOR_TIGHT" }],
  ["cinematic O4 mixed", { budget: 2000, style: "cinematic", videoSystem: "dji_o4", environment: "MIXED" }],
  ["cinematic O4 outdoor advanced", { budget: 2600, experience: "advanced", style: "cinematic", videoSystem: "dji_o4", environment: "OUTDOOR" }],
  ["cinematic analog", { budget: 1600, style: "cinematic", videoSystem: "analog", environment: "MIXED" }],
  ["long range O4", { budget: 2700, style: "longRange", videoSystem: "dji_o4" }],
  ["long range O4 advanced", { budget: 2900, experience: "advanced", style: "longRange", videoSystem: "dji_o4" }],
  ["long range analog", { budget: 2400, experience: "advanced", style: "longRange", videoSystem: "analog" }],
  ["racing analog", { budget: 2700, experience: "advanced", style: "racing", videoSystem: "analog" }],
  ["racing HDZero", { budget: 2700, experience: "advanced", style: "racing", videoSystem: "hdzero" }],
  ["racing recommend", { budget: 2700, experience: "advanced", style: "racing", videoSystem: "recommend" }],
  ["racing explicit O4", { budget: 2700, experience: "advanced", style: "racing", videoSystem: "dji_o4" }],
  ["value cinematic", { budget: 2000, style: "cinematic", videoSystem: "dji_o4", advancedPriority: "VALUE" }],
  ["low latency racing", { budget: 2700, experience: "advanced", style: "racing", videoSystem: "recommend", advancedPriority: "LOW_LATENCY" }],
  ["portable freestyle", { budget: 1800, style: "freestyle", videoSystem: "analog", advancedPriority: "PORTABILITY" }],
  ["flight time tiny", { budget: 1100, style: "tinywhoop", videoSystem: "analog", advancedPriority: "FLIGHT_TIME" }],
  ["drone only freestyle", { budget: 600, style: "freestyle", videoSystem: "analog", scope: "DRONE_ONLY" }],
  ["drone only cinematic O4", { budget: 600, style: "cinematic", videoSystem: "dji_o4", scope: "DRONE_ONLY" }],
];

describe("Iteration 4 recommendation coverage", () => {
  it("covers at least 95% of the high-value scenario matrix with complete valid recommendations", () => {
    const failures: string[] = [];
    for (const [name, overrides] of scenarios) {
      const result = recommendKitV4(prefs(overrides), products);
      if (result.kind !== "kit") {
        failures.push(name);
        continue;
      }
      hardValid(result.kit);
      expect(result.kit.totalPrice, name).toBeLessThanOrEqual(prefs(overrides).budget);
    }
    const coverage = (scenarios.length - failures.length) / scenarios.length;
    expect(coverage, `uncovered=${failures.join(", ")}`).toBeGreaterThanOrEqual(0.95);
  });

  it("returns closest technically-valid kit and finite minimum budget when money is the only blocker", () => {
    const result = recommendKitV4(prefs({ budget: 100, experience: "beginner", style: "tinywhoop", videoSystem: "analog" }), products);
    expect(result.kind).toBe("insufficient");
    if (result.kind !== "insufficient") return;
    expect(Number.isFinite(result.minBudget)).toBe(true);
    expect(result.kit).toBeDefined();
    if (result.kit) hardValid(result.kit);
  });

  it("keeps alternatives hard-valid when Value/Premium alternatives exist", () => {
    const result = recommendKitV4(prefs({ budget: 2100, style: "cinematic", videoSystem: "dji_o4" }), products);
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    for (const alternative of result.alternatives ?? []) hardValid(alternative);
    const roles = result.alternatives?.map((item) => item.alternativeRole) ?? [];
    expect(new Set(roles).size).toBe(roles.length);
  });
});

describe("Iteration 4 progressive questionnaire", () => {
  it("does not overload a beginner full-kit flow with owned gear or advanced priorities", () => {
    const steps = questionnaireSteps(prefs({ experience: "beginner", scope: "FULL_KIT", style: "longRange" }));
    expect(steps).toEqual(["scope", "budget", "style", "experience", "video"]);
  });

  it("adds environment only to contextual styles and advanced options only for advanced pilots", () => {
    const advanced = questionnaireSteps(prefs({ experience: "advanced", style: "cinematic", scope: "FULL_KIT" }));
    expect(advanced).toContain("environment");
    expect(advanced).toContain("advancedPriority");
    const longRange = questionnaireSteps(prefs({ experience: "intermediate", style: "longRange" }));
    expect(longRange).not.toContain("environment");
    expect(longRange).not.toContain("advancedPriority");
  });

  it("asks for owned gear only when completing an existing setup", () => {
    expect(questionnaireSteps(prefs({ scope: "COMPLETE_EXISTING_SETUP" }))).toContain("ownedGear");
    expect(questionnaireSteps(prefs({ scope: "DRONE_ONLY" }))).not.toContain("ownedGear");
  });
});

describe("Iteration 4 accessory separation", () => {
  it("never defaults a self-powered Finder onto a 65mm whoop", () => {
    const drone = getProductById("betafpv-air65-ii-freestyle");
    expect(drone).toBeDefined();
    const extras = buildRecommendedExtras(drone as Product, prefs({ experience: "beginner", style: "tinywhoop", environment: "INDOOR_TIGHT" }));
    expect(extras.some((item) => item.id.startsWith("vifly-finder"))).toBe(false);
    expect(extras.some((item) => item.id === "air65-ii-spare-frame")).toBe(true);
  });

  it("adds recovery to a large long-range craft only when not already integrated", () => {
    const drone = getProductById("geprc-moz7-v2-o4-pro");
    expect(drone).toBeDefined();
    const extras = buildRecommendedExtras(drone as Product, prefs({ experience: "advanced", style: "longRange", videoSystem: "dji_o4" }));
    const finder = extras.find((item) => item.id === "vifly-finder-2");
    if ((drone as Product).aircraftProfile?.recovery.selfPoweredBuzzerIncluded) expect(finder).toBeUndefined();
    else expect(finder).toBeDefined();
  });

  it("does not contaminate core price with practical extras", () => {
    const result = recommendKitV4(prefs({ budget: 1500, style: "freestyle", videoSystem: "analog" }), products);
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.totalPrice).toBe(result.kit.corePrice);
    expect(result.kit.totalWithExtras).toBeGreaterThanOrEqual(result.kit.corePrice);
  });
});

describe("Iteration 4 regulation and localization", () => {
  const baseDrone = () => ({ ...(getProductById("betafpv-air65-ii-freestyle") as Product), aircraftProfile: { ...(getProductById("betafpv-air65-ii-freestyle") as Product).aircraftProfile!, dryWeightG: 169, payloadWeightG: 0, mandatoryOnboardWeightG: 0 } });
  const baseBattery = () => ({ ...(products.find((item) => item.category === "battery") as Product), weightG: 30 });

  it("uses ready-to-fly weight at Colombia's 200g boundary", () => {
    const below = assessRegulation(baseDrone(), { ...baseBattery(), weightG: 30 }, "CO", "RECREATIONAL");
    const at = assessRegulation(baseDrone(), { ...baseBattery(), weightG: 31 }, "CO", "RECREATIONAL");
    expect(below.estimatedTakeoffWeightG).toBe(199);
    expect(below.status).toBe("NO_REGISTRATION_BY_WEIGHT");
    expect(at.estimatedTakeoffWeightG).toBe(200);
    expect(at.status).toBe("REGISTRATION_REQUIRED");
  });

  it("uses the US 250g recreational boundary and keeps non-recreational registration weight-independent", () => {
    const drone = { ...baseDrone(), aircraftProfile: { ...baseDrone().aircraftProfile!, dryWeightG: 219 } };
    expect(assessRegulation(drone, { ...baseBattery(), weightG: 30 }, "US", "RECREATIONAL").status).toBe("NO_REGISTRATION_BY_WEIGHT");
    expect(assessRegulation(drone, { ...baseBattery(), weightG: 31 }, "US", "RECREATIONAL").status).toBe("REGISTRATION_REQUIRED");
    expect(assessRegulation(baseDrone(), { ...baseBattery(), weightG: 1 }, "US", "COMMERCIAL_OR_SPECIFIC").status).toBe("REGISTRATION_REQUIRED");
  });

  it("never labels sub-250 EASA FPV as no-registration-by-weight", () => {
    const assessment = assessRegulation(baseDrone(), { ...baseBattery(), weightG: 30 }, "EU_EASA", "RECREATIONAL");
    expect(assessment.status).toBe("LIGHTWEIGHT_BENEFIT");
    expect(assessment.status).not.toBe("NO_REGISTRATION_BY_WEIGHT");
  });

  it("keeps USD canonical and COP conversion fixed at 3200", () => {
    expect(EXCHANGE_RATES.cop).toBe(3200);
    expect(formatPrice(10, "cop")).toMatch(/32[.\s]?000/);
    expect(formatPrice(10, "usd")).toContain("10");
  });
});
