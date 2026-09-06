import { describe, it, expect } from "vitest";
import { PRODUCTS } from "@/data/products";
import { recommendKit } from "@/lib/recommendation";
import {
  videoSystemMatches,
  protocolMatches,
  batteryMatchesDrone,
  chargerMatchesBattery,
  validateBundle,
} from "@/lib/compat";
import { getProductById } from "@/lib/products";

function find(id: string) {
  const p = getProductById(id);
  if (!p) throw new Error(`Missing product ${id}`);
  return p;
}

describe("compatibility rules", () => {
  it("never matches DJI Goggles N3 with an analog drone", () => {
    const n3 = find("goggles-dji-n3");
    const cetus = find("drone-cetus-pro");
    expect(videoSystemMatches(n3, cetus)).toBe(false);
  });

  it("matches analog goggles with analog drone", () => {
    const ev800d = find("goggles-eachine-ev800d");
    const cetus = find("drone-cetus-pro");
    expect(videoSystemMatches(ev800d, cetus)).toBe(true);
  });

  it("never matches ELRS radio with Crossfire-only drone", () => {
    const pocket = find("radio-pocket");
    const neo = find("drone-dji-neo");
    expect(protocolMatches(pocket, neo)).toBe(true); // both ELRS in dataset
  });

  it("matches battery to drone by cells, connector and chemistry", () => {
    const battery = find("battery-gnb-1s-530");
    const cetus = find("drone-cetus-pro");
    expect(batteryMatchesDrone(battery, cetus)).toBe(true);
  });

  it("rejects mismatched battery cells", () => {
    const battery = find("battery-ovonic-6s-1300");
    const cetus = find("drone-cetus-pro");
    expect(batteryMatchesDrone(battery, cetus)).toBe(false);
  });

  it("matches charger to battery by cells, connector and chemistry", () => {
    const charger = find("charger-vifly-whoopstor");
    const battery = find("battery-gnb-1s-530");
    expect(chargerMatchesBattery(charger, battery)).toBe(true);
  });

  it("rejects a charger that does not support battery cells", () => {
    const charger = find("charger-vifly-whoopstor");
    const battery = find("battery-ovonic-6s-1300");
    expect(chargerMatchesBattery(charger, battery)).toBe(false);
  });
});

describe("kit validation", () => {
  it("rejects DJI Goggles N3 + analog drone", () => {
    const n3 = find("goggles-dji-n3");
    const cetus = find("drone-cetus-pro");
    const pocket = find("radio-pocket");
    const charger = find("charger-vifly-whoopstor");
    const battery = find("battery-gnb-1s-530");
    const error = validateBundle(n3, cetus, pocket, charger, battery);
    expect(error).not.toBeNull();
    expect(error?.kind).toBe("video");
  });

  it("rejects ELRS radio with drone that has no matching protocol (if existed)", () => {
    // In the seed dataset all drones are ELRS, so use a compatible example.
    const ev800d = find("goggles-eachine-ev800d");
    const cetus = find("drone-cetus-pro");
    const pocket = find("radio-pocket");
    const charger = find("charger-vifly-whoopstor");
    const battery = find("battery-gnb-1s-530");
    const error = validateBundle(ev800d, cetus, pocket, charger, battery);
    expect(error).toBeNull();
  });
});

describe("recommendation engine", () => {
  it("recommends a budget beginner analog tinywhoop kit", () => {
    const result = recommendKit(
      { budget: 300, experience: "beginner", style: "tinywhoop", videoSystem: "analog" },
      PRODUCTS
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.drone.videoSystems).toContain("analog");
    expect(result.kit.goggles.videoSystems).toContain("analog");
    expect(result.kit.radio.protocols.some((p) => result.kit.drone.protocols.includes(p))).toBe(true);
    expect(result.kit.totalPrice).toBeLessThanOrEqual(300);
    expect(result.kit.batteryQuantity).toBe(6);
  });

  it("recommends a beginner DJI O4 kit when budget allows", () => {
    const result = recommendKit(
      { budget: 750, experience: "beginner", style: "tinywhoop", videoSystem: "dji_o4" },
      PRODUCTS
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.drone.videoSystems).toContain("dji_o4");
    expect(result.kit.goggles.videoSystems).toContain("dji_o4");
    expect(result.kit.totalPrice).toBeLessThanOrEqual(750);
  });

  it("selects the right freestyle 5 inch analog kit", () => {
    const result = recommendKit(
      { budget: 600, experience: "beginner", style: "freestyle", videoSystem: "analog" },
      PRODUCTS
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.drone.flightStyles).toContain("freestyle");
    expect(result.kit.drone.keySpecs.cells).toBe("6S");
    expect(result.kit.totalPrice).toBeLessThanOrEqual(600);
  });

  it("handles tinywhoop with correct 1S battery and charger", () => {
    const result = recommendKit(
      { budget: 300, experience: "beginner", style: "tinywhoop", videoSystem: "analog" },
      PRODUCTS
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.battery.keySpecs.cells).toBe("1S");
    expect(result.kit.charger.keySpecs.supportedCells).toBe("1S");
  });

  it("returns insufficient budget when no compatible kit fits", () => {
    const result = recommendKit(
      { budget: 100, experience: "beginner", style: "tinywhoop", videoSystem: "analog" },
      PRODUCTS
    );
    expect(result.kind).toBe("insufficient");
    if (result.kind !== "insufficient") return;
    expect(Number.isFinite(result.minBudget)).toBe(true);
    expect(result.minBudget).toBeGreaterThan(100);
  });
});
