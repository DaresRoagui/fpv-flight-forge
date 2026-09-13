import { describe, expect, it } from "vitest";
import { getProductById, getProducts } from "@/lib/products";
import { recommendKit } from "@/lib/recommendation";
import {
  batteryMatchesDrone,
  chargerMatchesBattery,
  getBatteryCapacityMah,
  protocolMatches,
  videoSystemMatches,
} from "@/lib/compat";
import type { KitBundle, Product, RecommendationResult, UserPreferences } from "@/lib/schema";

const products = getProducts();

function prefs(overrides: Partial<UserPreferences>): UserPreferences {
  return {
    budget: 1500,
    experience: "intermediate",
    style: "freestyle",
    videoSystem: "recommend",
    scope: "FULL_KIT",
    advancedPriority: "BALANCED",
    environment: "OUTDOOR",
    ownedGear: {},
    regulatoryRegion: "OTHER",
    operationPurpose: "RECREATIONAL",
    preferSimplerWeightClass: false,
    ...overrides,
  };
}

function kit(result: RecommendationResult): KitBundle {
  expect(result.kind).toBe("kit");
  if (result.kind !== "kit") throw new Error(`Expected kit, got ${result.kind}`);
  return result.kit;
}

function hardValid(bundle: KitBundle) {
  if (bundle.goggles) expect(videoSystemMatches(bundle.goggles, bundle.drone), bundle.goggles.id).toBe(true);
  if (bundle.radio) expect(protocolMatches(bundle.radio, bundle.drone), bundle.radio.id).toBe(true);
  expect(batteryMatchesDrone(bundle.battery, bundle.drone).state, bundle.battery.id).not.toBe("HARD_INVALID");
  if (bundle.charger) expect(chargerMatchesBattery(bundle.charger, bundle.battery).state, bundle.charger.id).not.toBe("HARD_INVALID");
}

function byId(id: string): Product {
  const product = getProductById(id);
  if (!product) throw new Error(`Missing ${id}`);
  return product;
}

describe("Iteration 3 complete bundle generation", () => {
  it("beginner tinywhoop Analog indoor builds a hard-valid full kit", () => {
    const result = kit(recommendKit(prefs({ budget: 550, experience: "beginner", style: "tinywhoop", videoSystem: "analog", environment: "INDOOR_TIGHT" }), products));
    expect(result.drone.aircraftProfile?.sizeClass.startsWith("WHOOP")).toBe(true);
    expect(result.drone.aircraftProfile?.video.system).toBe("analog");
    expect(result.totalPrice).toBeLessThanOrEqual(550);
    hardValid(result);
  });

  it("beginner tinywhoop O4 indoor stays explicit O4", () => {
    const result = kit(recommendKit(prefs({ budget: 850, experience: "beginner", style: "tinywhoop", videoSystem: "dji_o4", environment: "INDOOR_TIGHT" }), products));
    expect(result.drone.aircraftProfile?.sizeClass.startsWith("WHOOP")).toBe(true);
    expect(result.drone.aircraftProfile?.video.system).toBe("dji_o4");
    expect(result.goggles?.videoSystems).toContain("dji_o4");
    hardValid(result);
  });

  it("intermediate freestyle Analog defaults to a 5-inch freestyle platform", () => {
    const result = kit(recommendKit(prefs({ budget: 1200, experience: "intermediate", style: "freestyle", videoSystem: "analog" }), products));
    expect(result.drone.aircraftProfile?.sizeClass, `winner=${result.drone.id}`).toBe("FREESTYLE_5");
    expect(result.drone.aircraftProfile?.video.system).toBe("analog");
    hardValid(result);
  });

  it("intermediate freestyle O4 defaults to a 5-inch freestyle platform", () => {
    const result = kit(recommendKit(prefs({ budget: 1650, experience: "intermediate", style: "freestyle", videoSystem: "dji_o4" }), products));
    expect(result.drone.aircraftProfile?.sizeClass, `winner=${result.drone.id}`).toBe("FREESTYLE_5");
    expect(result.drone.aircraftProfile?.video.system).toBe("dji_o4");
    hardValid(result);
  });

  it("competitive Analog racing uses a purpose-built RACE_5 platform", () => {
    const result = kit(recommendKit(prefs({ budget: 2600, experience: "advanced", style: "racing", videoSystem: "analog" }), products));
    expect(result.drone.aircraftProfile?.sizeClass, `winner=${result.drone.id}`).toBe("RACE_5");
    expect(result.drone.aircraftProfile?.video.system).toBe("analog");
    expect(result.drone.id).toBe("vroom-comet-pro-5-wrekd-analog-elrs");
    hardValid(result);
  });

  it("competitive HDZero racing has a complete hard-valid HDZero path", () => {
    const result = kit(recommendKit(prefs({ budget: 2600, experience: "advanced", style: "racing", videoSystem: "hdzero" }), products));
    expect(result.drone.aircraftProfile?.sizeClass, `winner=${result.drone.id}`).toBe("RACE_5");
    expect(result.drone.aircraftProfile?.video.system).toBe("hdzero");
    expect(result.goggles?.id).toBe("hdzero-goggle-2");
    hardValid(result);
  });

  it("competitive racing + recommend chooses Analog or HDZero, not O4 compromise", () => {
    const result = kit(recommendKit(prefs({ budget: 2600, experience: "advanced", style: "racing", videoSystem: "recommend" }), products));
    expect(["analog", "hdzero"]).toContain(result.drone.aircraftProfile?.video.system);
    expect(result.drone.aircraftProfile?.sizeClass, `winner=${result.drone.id}`).toBe("RACE_5");
    hardValid(result);
  });

  it("racing + explicit O4 returns Manta compromise with warning", () => {
    const result = kit(recommendKit(prefs({ budget: 2600, experience: "advanced", style: "racing", videoSystem: "dji_o4" }), products));
    expect(result.drone.id).toBe("axisflying-manta5-se-v2-squashed-x-o4-wide-elrs");
    expect(result.drone.aircraftProfile?.video.system).toBe("dji_o4");
    expect(result.warnings.some((warning) => warning.type === "RACING_COMPROMISE")).toBe(true);
    expect(result.warnings.some((warning) => warning.type === "PRICE_ESTIMATE")).toBe(true);
    hardValid(result);
  });

  it("cinematic and long-range requests remain category coherent", () => {
    const cinematic = kit(recommendKit(prefs({ budget: 1800, style: "cinematic", videoSystem: "dji_o4", experience: "intermediate" }), products));
    expect(cinematic.drone.recommendedStyles).toContain("cinematic");
    hardValid(cinematic);

    const longRange = kit(recommendKit(prefs({ budget: 2600, style: "longRange", videoSystem: "dji_o4", experience: "advanced" }), products));
    expect(longRange.drone.recommendedStyles).toContain("longRange");
    expect(["LONG_RANGE_4", "LONG_RANGE_7"]).toContain(longRange.drone.aircraftProfile?.sizeClass);
    hardValid(longRange);
  });
});

describe("Iteration 3 scoring priorities materially affect ranking", () => {
  it("LOW_LATENCY racing uses the curated low-latency ecosystem", () => {
    const result = kit(recommendKit(prefs({ budget: 2600, experience: "advanced", style: "racing", videoSystem: "recommend", advancedPriority: "LOW_LATENCY" }), products));
    expect(result.drone.aircraftProfile?.video.system).toBe("hdzero");
    expect(result.goggles?.id).toBe("hdzero-goggle-2");
    expect(result.scoreBreakdown?.gogglesFit).toBeGreaterThan(8);
  });

  it("IMAGE_QUALITY and VALUE choose different O4 goggle/value paths when alternatives exist", () => {
    const image = kit(recommendKit(prefs({ budget: 1900, style: "cinematic", videoSystem: "dji_o4", advancedPriority: "IMAGE_QUALITY" }), products));
    const value = kit(recommendKit(prefs({ budget: 1900, style: "cinematic", videoSystem: "dji_o4", advancedPriority: "VALUE" }), products));
    expect(image.goggles?.id, `image=${image.goggles?.id}; value=${value.goggles?.id}`).toBe("dji-goggles-3");
    expect(value.goggles?.id, `image=${image.goggles?.id}; value=${value.goggles?.id}`).toBe("dji-goggles-n3");
    expect(value.totalPrice).toBeLessThan(image.totalPrice);
  });

  it("PORTABILITY favors the compact Pocket family", () => {
    const result = kit(recommendKit(prefs({ budget: 1800, style: "freestyle", videoSystem: "analog", advancedPriority: "PORTABILITY" }), products));
    expect(["radiomaster-pocket-elrs", "radiomaster-pocket-crush-elrs"]).toContain(result.radio?.id);
  });

  it("FLIGHT_TIME chooses a larger compatible pack than PORTABILITY on a fixed 75mm platform", () => {
    const fixed = products.filter((product) => product.category !== "drone" || product.id === "betafpv-meteor75-pro-analog");
    const longFlight = kit(recommendKit(prefs({ budget: 1000, experience: "beginner", style: "tinywhoop", videoSystem: "analog", advancedPriority: "FLIGHT_TIME", environment: "MIXED" }), fixed));
    const portable = kit(recommendKit(prefs({ budget: 1000, experience: "beginner", style: "tinywhoop", videoSystem: "analog", advancedPriority: "PORTABILITY", environment: "MIXED" }), fixed));
    expect(getBatteryCapacityMah(longFlight.battery)).toBeGreaterThan(getBatteryCapacityMah(portable.battery) ?? 0);
  });

  it("REPAIRABILITY materially improves the repairable racing platform score", () => {
    const ids = new Set([
      "vroom-comet-pro-5-wrekd-analog-elrs",
      "betafpv-air65-ii-champion",
    ]);
    const focused = products.filter((product) => product.category !== "drone" || ids.has(product.id));
    const repair = kit(recommendKit(prefs({ budget: 1500, experience: "advanced", style: "racing", videoSystem: "analog", scope: "DRONE_ONLY", advancedPriority: "REPAIRABILITY" }), focused));
    const value = kit(recommendKit(prefs({ budget: 1500, experience: "advanced", style: "racing", videoSystem: "analog", scope: "DRONE_ONLY", advancedPriority: "VALUE" }), focused));
    expect(repair.drone.id).toBe("vroom-comet-pro-5-wrekd-analog-elrs");
    expect(repair.scoreBreakdown?.droneStyleFit).toBeGreaterThan(value.scoreBreakdown?.droneStyleFit ?? 0);
  });
});

describe("Iteration 3 scopes, owned gear and alternatives", () => {
  it("FULL_KIT budget includes every required purchased component", () => {
    const result = kit(recommendKit(prefs({ budget: 1200, style: "freestyle", videoSystem: "analog", scope: "FULL_KIT" }), products));
    const purchased = result.items.filter((item) => item.includedInPrice);
    expect(new Set(purchased.map((item) => item.category))).toEqual(new Set(["drone", "battery", "goggles", "radio", "charger"]));
    expect(result.totalPrice).toBeLessThanOrEqual(1200);
  });

  it("DRONE_ONLY charges only the drone but returns compatibility references", () => {
    const result = kit(recommendKit(prefs({ budget: 500, style: "freestyle", videoSystem: "analog", scope: "DRONE_ONLY" }), products));
    expect(result.totalPrice).toBe(result.drone.priceUsd);
    expect(result.items.filter((item) => item.includedInPrice).map((item) => item.category)).toEqual(["drone"]);
    expect(result.items.some((item) => item.category === "battery" && item.referenceOnly)).toBe(true);
  });

  it("COMPLETE_EXISTING_SETUP reuses compatible owned gear without charging it", () => {
    const result = kit(recommendKit(prefs({
      budget: 1400,
      style: "cinematic",
      videoSystem: "dji_o4",
      scope: "COMPLETE_EXISTING_SETUP",
      ownedGear: { gogglesProductId: "dji-goggles-3", radioProductId: "radiomaster-pocket-elrs" },
    }), products));
    expect(result.items.find((item) => item.category === "goggles")?.owned).toBe(true);
    expect(result.items.find((item) => item.category === "goggles")?.includedInPrice).toBe(false);
    expect(result.items.find((item) => item.category === "radio")?.owned).toBe(true);
    expect(result.items.find((item) => item.category === "radio")?.includedInPrice).toBe(false);
  });

  it("owned gear conflict is explicit and a compatible replacement is selected", () => {
    const result = kit(recommendKit(prefs({
      budget: 1700,
      style: "cinematic",
      videoSystem: "dji_o4",
      scope: "COMPLETE_EXISTING_SETUP",
      ownedGear: { gogglesProductId: "fatshark-echo-analog" },
    }), products));
    expect(result.ownedGearConflicts?.some((conflict) => conflict.productId === "fatshark-echo-analog")).toBe(true);
    expect(result.goggles?.id).not.toBe("fatshark-echo-analog");
    expect(result.warnings.some((warning) => warning.type === "OWNED_GEAR_CONFLICT")).toBe(true);
    hardValid(result);
  });

  it("returns deterministic technically-valid alternatives when enough candidates exist", () => {
    const first = recommendKit(prefs({ budget: 1900, style: "cinematic", videoSystem: "dji_o4" }), products);
    const second = recommendKit(prefs({ budget: 1900, style: "cinematic", videoSystem: "dji_o4" }), products);
    const primary = kit(first);
    const secondPrimary = kit(second);
    expect(primary.drone.id).toBe(secondPrimary.drone.id);
    expect(first.kind === "kit" ? first.alternatives?.map((alt) => alt.alternativeRole) : []).toEqual(
      second.kind === "kit" ? second.alternatives?.map((alt) => alt.alternativeRole) : []
    );
    if (first.kind === "kit") {
      for (const alternative of first.alternatives ?? []) hardValid(alternative);
    }
  });
});

describe("Iteration 3 critical battery regressions", () => {
  it("CineLog35 and Cinebot35 reject 3300mAh while 7-inch MOZ7 accepts it", () => {
    const large = byId("battery-iflight-fullsend-6s-3300");
    expect(batteryMatchesDrone(large, byId("geprc-cinelog35-v3-o4-pro-elrs")).state).toBe("HARD_INVALID");
    expect(batteryMatchesDrone(large, byId("geprc-cinebot35-o4-pro-elrs")).state).toBe("HARD_INVALID");
    expect(batteryMatchesDrone(large, byId("geprc-moz7-v2-o4-pro")).state).not.toBe("HARD_INVALID");
  });
});
