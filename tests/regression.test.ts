import { describe, it, expect } from "vitest";
import { getProducts, getProductById } from "@/lib/products";
import { recommendKit } from "@/lib/recommendation";
import { batteryMatchesDrone, chargerMatchesBattery } from "@/lib/compat";
import { assessRegulation } from "@/lib/regulation";
import { getCuratedDroneRecord } from "@/data/curated-drones";
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
  it("CineLog35 V3 O4 accepts 1300mAh and rejects 3300mAh", () => {
    const drone = find("geprc-cinelog35-v3-o4-pro-elrs");
    const ok = find("ovonic-6s-1300-100c");
    const tooBig = find("battery-iflight-fullsend-6s-3300");
    expect(batteryMatchesDrone(ok, drone).state).not.toBe("HARD_INVALID");
    expect(batteryMatchesDrone(tooBig, drone).state).toBe("HARD_INVALID");
  });

  it("Cinebot35 rejects 3300mAh", () => {
    const drone = find("geprc-cinebot35-o4-pro-elrs");
    const tooBig = find("battery-iflight-fullsend-6s-3300");
    expect(batteryMatchesDrone(tooBig, drone).state).toBe("HARD_INVALID");
  });

  it("MOZ7 legitimately accepts 3300mAh", () => {
    const drone = find("geprc-moz7-v2-o4-pro");
    const battery = find("battery-iflight-fullsend-6s-3300");
    expect(batteryMatchesDrone(battery, drone).state).not.toBe("HARD_INVALID");
  });

  it("CineLog35 charger combination is electrically supported", () => {
    expect(chargerMatchesBattery(find("hota-t6"), find("ovonic-6s-1300-100c")).state).not.toBe("HARD_INVALID");
  });
});

describe("recommendation scope and owned gear", () => {
  it("DRONE_ONLY charges only the drone and keeps battery/system as references", () => {
    const result = recommendKit(
      buildPrefs({ budget: 600, style: "freestyle", videoSystem: "analog", scope: "DRONE_ONLY", experience: "intermediate" }),
      allProducts
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    const priced = result.kit.items.filter((item) => item.includedInPrice);
    expect(priced.map((item) => item.category)).toEqual(["drone"]);
    expect(result.kit.totalPrice).toBe(result.kit.drone.priceUsd);
    expect(result.kit.items.find((item) => item.category === "battery")?.referenceOnly).toBe(true);
  });

  it("COMPLETE_EXISTING_SETUP reuses owned goggles and excludes them from price", () => {
    const result = recommendKit(
      buildPrefs({
        budget: 1000,
        style: "cinematic",
        videoSystem: "dji_o4",
        experience: "intermediate",
        scope: "COMPLETE_EXISTING_SETUP",
        ownedGear: { gogglesProductId: "dji-goggles-3" },
      }),
      allProducts
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    const goggleItem = result.kit.items.find((item) => item.category === "goggles");
    expect(goggleItem?.owned).toBe(true);
    expect(goggleItem?.includedInPrice).toBe(false);
  });

  it("surfaces an incompatible owned goggle instead of silently ignoring it", () => {
    const result = recommendKit(
      buildPrefs({
        budget: 1200,
        style: "cinematic",
        videoSystem: "dji_o4",
        experience: "intermediate",
        scope: "COMPLETE_EXISTING_SETUP",
        ownedGear: { gogglesProductId: "fatshark-echo-analog" },
      }),
      allProducts
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.ownedGearConflicts?.some((conflict) => conflict.category === "goggles")).toBe(true);
    expect(result.kit.warnings.some((warning) => warning.type === "OWNED_GEAR_CONFLICT")).toBe(true);
  });
});

describe("racing source regressions", () => {
  it("keeps genuine Analog/HDZero racers enabled in the runtime catalog", () => {
    expect(getCuratedDroneRecord("vroom-comet-pro-5-wrekd-analog-elrs")?.recommendationStatus).toBe("ENABLED");
    expect(getCuratedDroneRecord("iflight-mach-r5-ultra-trainer-hdzero")?.recommendationStatus).toBe("ENABLED");
  });

  it("racing + O4 uses the researched Manta path, not Mark5/Vapor role pollution", () => {
    const manta = getCuratedDroneRecord("axisflying-manta5-se-v2-squashed-x-o4-wide-elrs");
    expect(manta?.sourceStatus).toBe("CORE_RECREATIONAL_O4");
    expect(manta?.recommendationStatus).toBe("ENABLED");
    expect(find("geprc-mark5-o4-pro-wide-x").flightStyles).not.toContain("racing");
    expect(find("geprc-vapor-d5-hd-o4-pro").flightStyles).not.toContain("racing");
  });
});

describe("flight environment and image path", () => {
  it("cinematic O4 does not choose a long-range 7-inch drone for an indoor-tight request", () => {
    const result = recommendKit(
      buildPrefs({ budget: 1250, style: "cinematic", videoSystem: "dji_o4", experience: "intermediate", environment: "INDOOR_TIGHT" }),
      allProducts
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.drone.aircraftProfile?.sizeClass).not.toBe("LONG_RANGE_7");
  });

  it("IMAGE_QUALITY for cinematic DJI O4 keeps DJI O4 goggles", () => {
    const result = recommendKit(
      buildPrefs({ budget: 1250, style: "cinematic", videoSystem: "dji_o4", experience: "intermediate", advancedPriority: "IMAGE_QUALITY" }),
      allProducts
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.goggles?.videoSystems).toContain("dji_o4");
  });
});

describe("regulatory weight assessment", () => {
  it("historical Cetus Pro + current 1S remains directly assessable below Colombia 200g", () => {
    const assessment = assessRegulation(find("drone-betafpv-cetus-pro"), find("betafpv-lava-ii-1s-320"), "CO", "RECREATIONAL");
    expect(assessment.estimatedTakeoffWeightG).toBeLessThan(200);
    expect(assessment.status).toBe("NO_REGISTRATION_BY_WEIGHT");
  });

  it("curated CineLog35 V3 + 6S 1300 is over US 250g", () => {
    const assessment = assessRegulation(find("geprc-cinelog35-v3-o4-pro-elrs"), find("ovonic-6s-1300-100c"), "US", "RECREATIONAL");
    expect(assessment.estimatedTakeoffWeightG).toBeGreaterThan(250);
    expect(assessment.status).toBe("REGISTRATION_REQUIRED");
  });
});
