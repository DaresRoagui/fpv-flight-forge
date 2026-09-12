import { describe, expect, it } from "vitest";
import { CURATED_COMPONENT_CATALOG, CURATED_RECOMMENDER_COMPONENTS, getCuratedComponentRecord } from "@/data/curated-components";
import { CURATED_DRONE_CATALOG } from "@/data/curated-drones";
import { batteryMatchesDrone, chargerMatchesBattery, protocolMatches, videoSystemMatches } from "@/lib/compat";
import { getProductById, getProducts } from "@/lib/products";
import type { ControlProtocol, Product, VideoSystem } from "@/lib/schema";

function find(id: string): Product {
  const product = getProductById(id);
  if (!product) throw new Error(`Missing product ${id}`);
  return product;
}

function fakeDrone({
  id,
  videoSystem = "analog",
  videoUnit = "ANALOG_5_8",
  protocol = "elrs_2.4",
  connector = "XT60",
  cells = 6,
  chemistry = "LiPo",
  minMah = 1000,
  maxMah = 1600,
}: {
  id: string;
  videoSystem?: VideoSystem;
  videoUnit?: string;
  protocol?: ControlProtocol;
  connector?: string;
  cells?: number;
  chemistry?: string;
  minMah?: number;
  maxMah?: number;
}): Product {
  return {
    id,
    name: id,
    brand: "Test",
    category: "drone",
    priceUsd: 1,
    rating: 5,
    videoSystems: [videoSystem],
    protocols: [protocol],
    flightStyles: ["freestyle"],
    experienceLevel: ["advanced"],
    compat: [],
    incompat: [],
    description: "test fixture",
    idealFor: [],
    limitations: [],
    images: ["/images/drone.svg"],
    aircraftProfile: {
      sizeClass: cells === 1 ? "WHOOP_75_1S" : "FREESTYLE_5",
      flightRoles: [],
      video: { system: videoSystem, unit: videoUnit },
      control: { protocol, band: protocol === "elrs_900" ? "900MHz" : protocol === "elrs_2.4" ? "2.4GHz" : undefined },
      battery: {
        cellsAllowed: [cells],
        chemistriesAllowed: [chemistry],
        connector,
        capacityMah: { min: minMah, idealMin: minMah, idealMax: maxMah, max: maxMah },
      },
      recovery: { gpsIncluded: false, selfPoweredBuzzerIncluded: false },
    },
  };
}

function fakeBattery(id: string, cells: number, chemistry: string, connector: string, capacityMah = 300): Product {
  return {
    id,
    name: id,
    brand: "Test",
    category: "battery",
    priceUsd: 1,
    rating: 5,
    videoSystems: [],
    protocols: [],
    flightStyles: ["tinywhoop"],
    experienceLevel: ["beginner"],
    compat: [],
    incompat: [],
    keySpecs: {
      cells: `${cells}S`,
      chemistry,
      connector,
      capacity: `${capacityMah}mAh`,
    },
    description: "test fixture",
    idealFor: [],
    limitations: [],
    images: ["/images/battery.svg"],
  };
}

function fakeRadio(id: string, protocol: ControlProtocol): Product {
  return {
    id,
    name: id,
    brand: "Test",
    category: "radio",
    priceUsd: 1,
    rating: 5,
    videoSystems: [],
    protocols: [protocol],
    flightStyles: ["freestyle"],
    experienceLevel: ["beginner"],
    compat: [],
    incompat: [],
    description: "test fixture",
    idealFor: [],
    limitations: [],
    images: ["/images/radio.svg"],
  };
}

describe("Iteration 2 curated component catalog", () => {
  it("has unique component ids and only enables records with exact prices", () => {
    expect(new Set(CURATED_COMPONENT_CATALOG.map((record) => record.id)).size).toBe(CURATED_COMPONENT_CATALOG.length);
    CURATED_RECOMMENDER_COMPONENTS.forEach((record) => expect(record.priceUsd).not.toBeNull());
  });

  it("replaces the incorrect battery-gnb-1s-530 legacy record", () => {
    expect(getProductById("battery-gnb-1s-530")).toBeUndefined();
    const corrected = getCuratedComponentRecord("gnb-1s-530-90c-a30");
    expect(corrected?.batteryProfile?.capacityMah).toBe(530);
    expect(corrected?.batteryProfile?.connector).toBe("A30");
    expect(corrected?.recommendationStatus).toBe("CATALOG_ONLY");
  });

  it("keeps current RadioMaster generations and Pocket as ELRS", () => {
    const pocket = find("radiomaster-pocket-elrs");
    expect(pocket.protocols).toContain("elrs_2.4");
    expect(pocket.protocols).not.toContain("frsky");
    expect(find("radiomaster-tx16s-mk3-elrs").name).toContain("MK3");
    expect(getProductById("radio-radiomaster-tx16s")).toBeUndefined();
  });
});

describe("DJI goggle unit compatibility", () => {
  const n3 = () => find("dji-goggles-n3");

  it("models N3 as single LCD 60Hz and not fictitious OLED", () => {
    const profile = getCuratedComponentRecord("dji-goggles-n3")?.goggleProfile;
    expect(profile?.displayType).toBe("LCD");
    expect(profile?.displayCount).toBe(1);
    expect(profile?.refreshHzMax).toBe(60);
    expect(profile?.supportedVideoUnits).not.toContain("DJI_O3");
  });

  it("N3 + O3 is hard-incompatible at the video layer", () => {
    const o3 = fakeDrone({ id: "o3-drone", videoSystem: "dji_o3", videoUnit: "DJI_O3" });
    expect(videoSystemMatches(n3(), o3)).toBe(false);
  });

  it("N3 accepts supported O4, O4 Wide and O4 Pro units", () => {
    for (const unit of ["DJI_O4", "DJI_O4_WIDE", "DJI_O4_PRO"] as const) {
      const drone = fakeDrone({ id: `drone-${unit}`, videoSystem: "dji_o4", videoUnit: unit });
      expect(videoSystemMatches(n3(), drone)).toBe(true);
    }
  });
});

describe("battery and charger hard compatibility", () => {
  it("enforces charger cell count and chemistry", () => {
    const whoopStor = find("geprc-woopower-w63");
    expect(chargerMatchesBattery(whoopStor, find("betafpv-lava-ii-1s-320")).state).toBe("VALID");
    expect(chargerMatchesBattery(whoopStor, find("gnb-2s-450-80c-lihv-xt30")).state).toBe("HARD_INVALID");

    const lipoOnlyFixture = fakeBattery("6s-life", 6, "LiFe", "XT60", 1300);
    expect(chargerMatchesBattery(find("hota-d6-pro"), lipoOnlyFixture).state).not.toBe("HARD_INVALID");
    const unsupported = fakeBattery("6s-pb", 6, "Pb", "XT60", 1300);
    expect(chargerMatchesBattery(find("hota-d6-pro"), unsupported).state).toBe("HARD_INVALID");
  });

  it("models BT2.0/A30 as directional compatibility rather than identical connectors", () => {
    const a30 = find("gnb-1s-550-100c-a30");
    const bt2Drone = fakeDrone({ id: "bt2-drone", connector: "BT2.0", cells: 1, chemistry: "LiHV", minMah: 450, maxMah: 600 });
    expect(batteryMatchesDrone(a30, bt2Drone).state).not.toBe("HARD_INVALID");

    const bt2 = find("betafpv-lava-ii-1s-580");
    const a30Drone = fakeDrone({ id: "a30-drone", connector: "A30", cells: 1, chemistry: "LiHV", minMah: 450, maxMah: 600 });
    expect(batteryMatchesDrone(bt2, a30Drone).state).toBe("HARD_INVALID");
  });

  it("keeps PH2.0 as a separate supported 1S charger connector", () => {
    const ph2 = fakeBattery("ph2-pack", 1, "LiHV", "PH2.0", 300);
    expect(chargerMatchesBattery(find("geprc-woopower-w63"), ph2).state).toBe("VALID");
  });

  it("marks XT30 on an XT60-native multi-cell charger as incomplete when a charge lead is required", () => {
    const result = chargerMatchesBattery(find("hota-d6-pro"), find("betafpv-lava-ii-4s-580"));
    expect(result.state).toBe("INCOMPLETE_KIT");
  });
});

describe("control link compatibility", () => {
  it("does not pair an ELRS drone with an incompatible radio", () => {
    const drone = find("betafpv-meteor75-pro-ii-o4-wide");
    expect(protocolMatches(fakeRadio("frsky-radio", "frsky"), drone)).toBe(false);
    expect(protocolMatches(find("radiomaster-pocket-elrs"), drone)).toBe(true);
  });

  it("does not pair 2.4GHz-only Pocket with a 900MHz-only ELRS receiver", () => {
    const drone900 = fakeDrone({ id: "elrs900-drone", protocol: "elrs_900" });
    expect(protocolMatches(find("radiomaster-pocket-elrs"), drone900)).toBe(false);
  });
});

describe("HDZero Iteration 3 readiness", () => {
  it("has a real HDZero goggle plus racer, ELRS radio, 6S battery and 6S charger paths", () => {
    expect(find("hdzero-goggle-2").videoSystems).toContain("hdzero");
    expect(CURATED_DRONE_CATALOG.some((record) => record.videoSystems.includes("hdzero") && record.flightStyles.includes("racing"))).toBe(true);
    expect(find("radiomaster-pocket-elrs").protocols).toContain("elrs_2.4");
    expect(find("tattu-rline-v6-6s-1300-st").keySpecs?.cells).toBe("6S");
    expect(find("hota-d6-pro").keySpecs?.supportedCells).toContain("6S");
  });
});

describe("large battery is aircraft-profile dependent", () => {
  it("rejects 3300mAh for CineLog35 V3 and Cinebot35 but accepts it on MOZ7", () => {
    const large = find("battery-iflight-fullsend-6s-3300");
    expect(batteryMatchesDrone(large, find("geprc-cinelog35-v3-o4-pro-elrs")).state).toBe("HARD_INVALID");
    expect(batteryMatchesDrone(large, find("geprc-cinebot35-o4-pro-elrs")).state).toBe("HARD_INVALID");
    expect(batteryMatchesDrone(large, find("geprc-moz7-v2-o4-pro")).state).not.toBe("HARD_INVALID");
  });
});

describe("runtime gating", () => {
  it("does not allow catalog-only/watchlist/conditional component records to win normally", () => {
    const runtimeIds = new Set(getProducts().map((product) => product.id));
    CURATED_COMPONENT_CATALOG
      .filter((record) => record.recommendationStatus !== "ENABLED")
      .forEach((record) => expect(runtimeIds.has(record.id)).toBe(false));
  });
});
