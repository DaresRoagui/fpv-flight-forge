import { describe, it, expect } from "vitest";
import { getProducts, getProductById } from "@/lib/products";
import { recommendKit } from "@/lib/recommendation";
import {
  videoSystemMatches,
  protocolMatches,
  batteryMatchesDrone,
  chargerMatchesBattery,
  validateBundle,
} from "@/lib/compat";
import { CURATED_DRONE_CATALOG, getCuratedDroneRecord } from "@/data/curated-drones";
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

describe("compatibility rules", () => {
  it("keeps direct compatibility checks available for gated historical gear", () => {
    const n3 = find("goggles-dji-n3");
    const ev800d = find("goggles-eachine-ev800d");
    const cetus = find("drone-betafpv-cetus-pro");
    expect(videoSystemMatches(n3, cetus)).toBe(false);
    expect(videoSystemMatches(ev800d, cetus)).toBe(true);
  });

  it("matches control protocol and battery electrical constraints", () => {
    const zorro = find("radio-radiomaster-zorro");
    const meteor = find("betafpv-meteor75-pro-ii-o4-wide");
    expect(protocolMatches(zorro, meteor)).toBe(true);

    const sixS = find("battery-ovonic-6s-1300");
    expect(batteryMatchesDrone(sixS, meteor).state).toBe("HARD_INVALID");
  });

  it("matches charger cells and rejects an impossible battery", () => {
    const charger = find("charger-vifly-whoopstor-v3");
    const oneS = find("battery-gnb-1s-530");
    const sixS = find("battery-ovonic-6s-1300");
    expect(chargerMatchesBattery(charger, oneS).state).not.toBe("HARD_INVALID");
    expect(chargerMatchesBattery(charger, sixS).state).toBe("HARD_INVALID");
  });

  it("rejects a full bundle with a video mismatch", () => {
    const error = validateBundle(
      find("goggles-dji-n3"),
      find("drone-betafpv-cetus-pro"),
      find("radio-radiomaster-pocket"),
      find("charger-vifly-whoopstor-v3"),
      find("battery-gnb-1s-530")
    );
    expect(error?.kind).toBe("video");
  });
});

describe("recommendation coverage after Iteration 1 catalog ingestion", () => {
  it("Racing Analog has purpose-built curated aircraft instead of freestyle stand-ins", () => {
    const racers = CURATED_DRONE_CATALOG.filter(
      (record) => record.sourceSegment === 7 && record.videoSystems.includes("analog") && record.flightStyles.includes("racing")
    );
    expect(racers.some((record) => record.id === "vroom-comet-pro-5-wrekd-analog-elrs")).toBe(true);
    expect(racers.some((record) => record.id.includes("mark5"))).toBe(false);
  });

  it("Racing O4 keeps the researched Manta compromise without pretending it is competitive", () => {
    const manta = getCuratedDroneRecord("axisflying-manta5-se-v2-squashed-x-o4-wide-elrs");
    expect(manta?.sourceStatus).toBe("CORE_RECREATIONAL_O4");
    expect(manta?.flightStyles).toContain("racing");
    expect(manta?.recommendationStatus).toBe("CATALOG_ONLY");
  });

  it("Tinywhoop + Analog builds a modern non-Cetus kit", () => {
    const result = recommendKit(
      buildPrefs({ budget: 425, experience: "beginner", style: "tinywhoop", videoSystem: "analog" }),
      allProducts
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.drone.id).not.toBe("drone-betafpv-cetus-pro");
    expect(result.kit.drone.videoSystems).toContain("analog");
    expect(result.kit.totalPrice).toBeLessThanOrEqual(425);
  });

  it("Tinywhoop + O4 uses a current O4 whoop when hardware fits", () => {
    const result = recommendKit(
      buildPrefs({ budget: 700, experience: "beginner", style: "tinywhoop", videoSystem: "dji_o4" }),
      allProducts
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.drone.id).toBe("betafpv-meteor75-pro-ii-o4-wide");
    expect(result.kit.goggles?.videoSystems).toContain("dji_o4");
  });

  it("Freestyle Analog and O4 still build coherent kits", () => {
    const analog = recommendKit(
      buildPrefs({ budget: 750, experience: "intermediate", style: "freestyle", videoSystem: "analog" }),
      allProducts
    );
    expect(analog.kind).toBe("kit");
    if (analog.kind === "kit") expect(analog.kit.drone.recommendedStyles).toContain("freestyle");

    const o4 = recommendKit(
      buildPrefs({ budget: 1200, experience: "intermediate", style: "freestyle", videoSystem: "dji_o4" }),
      allProducts
    );
    expect(o4.kind).toBe("kit");
    if (o4.kind === "kit") expect(o4.kit.drone.recommendedStyles).toContain("freestyle");
  });

  it("Cinematic O4 builds a current exact-profile kit", () => {
    const result = recommendKit(
      buildPrefs({ budget: 1200, experience: "intermediate", style: "cinematic", videoSystem: "dji_o4" }),
      allProducts
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.drone.recommendedStyles).toContain("cinematic");
    expect(result.kit.drone.videoSystems).toContain("dji_o4");
  });

  it("Long Range source coverage contains compact Analog and O4 plus 7-inch exact profiles", () => {
    expect(getProductById("geprc-tern-lr40-analog")?.aircraftProfile?.sizeClass).toBe("LONG_RANGE_4");
    expect(getProductById("flywoo-explorer-lr4-v2-o4-wide")?.aircraftProfile?.sizeClass).toBe("LONG_RANGE_4");
    expect(getProductById("geprc-moz7-v2-o4-pro")?.aircraftProfile?.sizeClass).toBe("LONG_RANGE_7");
  });
});

describe("kit validation", () => {
  it("does not mix incompatible video systems or radio protocols", () => {
    const result = recommendKit(
      buildPrefs({ budget: 1200, experience: "intermediate", style: "freestyle", videoSystem: "dji_o4" }),
      allProducts
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    const droneSystem = result.kit.drone.aircraftProfile?.video.system ?? result.kit.drone.videoSystems[0];
    const droneProtocol = result.kit.drone.aircraftProfile?.control.protocol ?? result.kit.drone.protocols[0];
    expect(result.kit.goggles?.videoSystems).toContain(droneSystem);
    expect(result.kit.radio?.protocols).toContain(droneProtocol);
    expect(batteryMatchesDrone(result.kit.battery, result.kit.drone).state).not.toBe("HARD_INVALID");
    expect(chargerMatchesBattery(result.kit.charger!, result.kit.battery).state).not.toBe("HARD_INVALID");
  });

  it("returns insufficient budget with a meaningful minimum", () => {
    const result = recommendKit(
      buildPrefs({ budget: 100, experience: "beginner", style: "tinywhoop", videoSystem: "analog" }),
      allProducts
    );
    expect(result.kind).toBe("insufficient");
    if (result.kind !== "insufficient") return;
    expect(Number.isFinite(result.minBudget)).toBe(true);
    expect(result.minBudget).toBeGreaterThan(100);
    expect(result.message).toContain("US$");
  });
});
