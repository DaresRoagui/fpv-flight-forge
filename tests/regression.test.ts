import { describe, it, expect } from "vitest";
import { getProducts, getProductById } from "@/lib/products";
import { recommendKit } from "@/lib/recommendation";
import { batteryMatchesDrone, chargerMatchesBattery } from "@/lib/compat";
import { assessRegulation } from "@/lib/regulation";
import { UserPreferences } from "@/lib/schema";

const allProducts = getProducts();

function find(id: string) {
  const p = getProductById(id);
  if (!p) throw new Error(`Missing product ${id}`);
  return p;
}

function buildPrefs(overrides: Partial<UserPreferences>): UserPreferences {
  return {
    budget: 500,
    experience: "beginner",
    style: "tinywhoop",
    videoSystem: "recommend",
    scope: "FULL_KIT",
    advancedPriority: "BALANCED",
    ownedGear: {},
    regulatoryRegion: "OTHER",
    operationPurpose: "RECREATIONAL",
    preferSimplerWeightClass: false,
    ...overrides,
  };
}

describe("drone-centric battery compatibility", () => {
  it("CineLog35 V3 O4 accepts the Ovonic 6S 1300mAh and rejects the 3300mAh", () => {
    const drone = find("drone-geprc-cinelog35-v3-o4");
    const ok = find("battery-ovonic-6s-1300");
    const tooBig = find("battery-iflight-fullsend-6s-3300");
    expect(batteryMatchesDrone(ok, drone).state).not.toBe("HARD_INVALID");
    expect(batteryMatchesDrone(tooBig, drone).state).toBe("HARD_INVALID");
  });

  it("Chimera7 Pro V2 accepts the 3300mAh and rejects the 1300mAh", () => {
    const drone = find("drone-iflight-chimera7-pro-v2");
    const ok = find("battery-iflight-fullsend-6s-3300");
    const tooSmall = find("battery-ovonic-6s-1300");
    expect(batteryMatchesDrone(ok, drone).state).not.toBe("HARD_INVALID");
    expect(batteryMatchesDrone(tooSmall, drone).state).toBe("HARD_INVALID");
  });

  it("CineLog35 V3 O4 charger combination is valid", () => {
    const charger = find("charger-hota-t6");
    const battery = find("battery-ovonic-6s-1300");
    expect(chargerMatchesBattery(charger, battery).state).not.toBe("HARD_INVALID");
  });
});

describe("recommendation scope and owned gear", () => {
  it("DRONE_ONLY keeps total price at drone + batteries only", () => {
    const result = recommendKit(
      buildPrefs({ budget: 600, style: "freestyle", videoSystem: "analog", scope: "DRONE_ONLY", experience: "intermediate" }),
      allProducts
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    const pricedIds = result.kit.items.filter((i) => i.includedInPrice).map((i) => i.category);
    expect(pricedIds).toContain("drone");
    expect(pricedIds).toContain("battery");
    expect(pricedIds).not.toContain("goggles");
    expect(pricedIds).not.toContain("radio");
    expect(pricedIds).not.toContain("charger");
    expect(result.kit.items.some((i) => i.referenceOnly && i.category === "goggles")).toBe(true);
  });

  it("COMPLETE_EXISTING_SETUP reuses owned goggles and excludes them from price", () => {
    const result = recommendKit(
      buildPrefs({
        budget: 900,
        style: "cinematic",
        videoSystem: "dji_o4",
        experience: "intermediate",
        scope: "COMPLETE_EXISTING_SETUP",
        ownedGear: { gogglesProductId: "goggles-dji-goggles-3" },
      }),
      allProducts
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    const goggleItem = result.kit.items.find((i) => i.category === "goggles");
    expect(goggleItem).toBeDefined();
    expect(goggleItem?.owned).toBe(true);
    expect(goggleItem?.includedInPrice).toBe(false);
    expect(result.kit.totalPrice).toBeLessThan(900);
  });
});

describe("advanced priority affects ranking", () => {
  it("LOW_LATENCY for racing analog keeps goggles in analog", () => {
    const result = recommendKit(
      buildPrefs({ budget: 900, style: "racing", videoSystem: "analog", experience: "advanced", advancedPriority: "LOW_LATENCY" }),
      allProducts
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.goggles?.videoSystems).toContain("analog");
    expect(result.kit.drone.compatibleStyles).toContain("racing");
  });

  it("IMAGE_QUALITY for cinematic DJI O4 selects DJI O4 goggles", () => {
    const result = recommendKit(
      buildPrefs({ budget: 1150, style: "cinematic", videoSystem: "dji_o4", experience: "intermediate", advancedPriority: "IMAGE_QUALITY" }),
      allProducts
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.goggles?.videoSystems).toContain("dji_o4");
    expect(result.kit.goggles?.id).toMatch(/^goggles-dji/);
  });
});

describe("flight environment narrows drone choice", () => {
  it("cinematic INDOOR_TIGHT does not pick a long-range 7-inch drone", () => {
    const result = recommendKit(
      buildPrefs({ budget: 1150, style: "cinematic", videoSystem: "dji_o4", experience: "intermediate", environment: "INDOOR_TIGHT" }),
      allProducts
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.drone.aircraftProfile?.sizeClass).not.toBe("LONG_RANGE_7");
    expect(result.kit.drone.aircraftProfile?.flightRoles?.some((r) => r.toLowerCase().includes("indoor"))).toBe(true);
  });
});

describe("racing compromises and special cases", () => {
  it("racing + DJI O4 does not choose the freestyle-oriented Mark5", () => {
    const result = recommendKit(
      buildPrefs({ budget: 1200, style: "racing", videoSystem: "dji_o4", experience: "advanced" }),
      allProducts
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.drone.id).not.toBe("drone-geprc-mark5-o4");
    expect(result.kit.drone.compatibleStyles).toContain("racing");
    expect(result.kit.drone.videoSystems).toContain("dji_o4");
    expect(result.kit.warnings.some((w) => w.messageKey === "warnings.racingO4Compromise")).toBe(true);
  });
});

describe("regulatory weight assessment", () => {
  it("Cetus Pro + 1S is below Colombian 200g threshold", () => {
    const drone = find("drone-betafpv-cetus-pro");
    const battery = find("battery-gnb-1s-530");
    const assessment = assessRegulation(drone, battery, "CO", "RECREATIONAL");
    expect(assessment.estimatedTakeoffWeightG).toBeLessThan(200);
    expect(assessment.status).toBe("NO_REGISTRATION_BY_WEIGHT");
    expect(assessment.weightThresholdG).toBe(200);
  });

  it("CineLog35 V3 O4 + 6S 1300 is over US 250g", () => {
    const drone = find("drone-geprc-cinelog35-v3-o4");
    const battery = find("battery-ovonic-6s-1300");
    const assessment = assessRegulation(drone, battery, "US", "RECREATIONAL");
    expect(assessment.estimatedTakeoffWeightG).toBeGreaterThan(250);
    expect(assessment.status).toBe("REGISTRATION_REQUIRED");
    expect(assessment.weightThresholdG).toBe(250);
  });
});
