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
  it("rejects DJI O4 goggles with an analog drone", () => {
    const n3 = find("goggles-dji-n3");
    const cetus = find("drone-betafpv-cetus-pro");
    expect(videoSystemMatches(n3, cetus)).toBe(false);
  });

  it("matches analog goggles with analog drone", () => {
    const ev800d = find("goggles-eachine-ev800d");
    const cetus = find("drone-betafpv-cetus-pro");
    expect(videoSystemMatches(ev800d, cetus)).toBe(true);
  });

  it("matches FrSky radio with a FrSky drone", () => {
    const pocket = find("radio-radiomaster-pocket");
    const cetus = find("drone-betafpv-cetus-pro");
    expect(protocolMatches(pocket, cetus)).toBe(true);
  });

  it("matches ELRS radio with an ELRS drone", () => {
    const zorro = find("radio-radiomaster-zorro");
    const meteor = find("drone-betafpv-meteor65-pro-o4");
    expect(protocolMatches(zorro, meteor)).toBe(true);
  });

  it("matches battery to drone by cells, connector and chemistry", () => {
    const battery = find("battery-gnb-1s-530");
    const cetus = find("drone-betafpv-cetus-pro");
    expect(batteryMatchesDrone(battery, cetus)).toBe(true);
  });

  it("rejects mismatched battery cells", () => {
    const battery = find("battery-ovonic-6s-1300");
    const cetus = find("drone-betafpv-cetus-pro");
    expect(batteryMatchesDrone(battery, cetus)).toBe(false);
  });

  it("matches charger to battery by cells, connector and chemistry", () => {
    const charger = find("charger-vifly-whoopstor-v3");
    const battery = find("battery-gnb-1s-530");
    expect(chargerMatchesBattery(charger, battery)).toBe(true);
  });

  it("rejects a charger that does not support battery cells", () => {
    const charger = find("charger-vifly-whoopstor-v3");
    const battery = find("battery-ovonic-6s-1300");
    expect(chargerMatchesBattery(charger, battery)).toBe(false);
  });

  it("rejects an incompatible full bundle (video mismatch)", () => {
    const n3 = find("goggles-dji-n3");
    const cetus = find("drone-betafpv-cetus-pro");
    const pocket = find("radio-radiomaster-pocket");
    const charger = find("charger-vifly-whoopstor-v3");
    const battery = find("battery-gnb-1s-530");
    const error = validateBundle(n3, cetus, pocket, charger, battery);
    expect(error).not.toBeNull();
    expect(error?.kind).toBe("video");
  });
});

describe("recommendation coverage matrix", () => {
  it("Racing + Analog devuelve una configuración razonable", () => {
    const result = recommendKit(
      { budget: 900, experience: "advanced", style: "racing", videoSystem: "analog" },
      PRODUCTS
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.drone.flightStyles).toContain("racing");
    expect(result.kit.drone.videoSystems).toContain("analog");
    expect(result.kit.totalPrice).toBeLessThanOrEqual(900);
    expect(result.kit.batteryQuantity).toBe(8);
  });

  it("Racing + DJI O4 devuelve una configuración razonable", () => {
    const result = recommendKit(
      { budget: 1200, experience: "advanced", style: "racing", videoSystem: "dji_o4" },
      PRODUCTS
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.drone.flightStyles).toContain("racing");
    expect(result.kit.drone.videoSystems).toContain("dji_o4");
    expect(result.kit.goggles.videoSystems).toContain("dji_o4");
    expect(result.kit.totalPrice).toBeLessThanOrEqual(1200);
  });

  it("Tinywhoop + Analog funciona", () => {
    const result = recommendKit(
      { budget: 350, experience: "beginner", style: "tinywhoop", videoSystem: "analog" },
      PRODUCTS
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.drone.videoSystems).toContain("analog");
    expect(result.kit.battery.keySpecs.cells).toBe("1S");
    expect(result.kit.totalPrice).toBeLessThanOrEqual(350);
  });

  it("Tinywhoop + O4 funciona cuando existe hardware razonable", () => {
    const result = recommendKit(
      { budget: 650, experience: "beginner", style: "tinywhoop", videoSystem: "dji_o4" },
      PRODUCTS
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.drone.videoSystems).toContain("dji_o4");
    expect(result.kit.drone.flightStyles).toContain("tinywhoop");
    expect(result.kit.goggles.videoSystems).toContain("dji_o4");
    expect(result.kit.totalPrice).toBeLessThanOrEqual(650);
  });

  it("Freestyle + Analog funciona", () => {
    const result = recommendKit(
      { budget: 650, experience: "intermediate", style: "freestyle", videoSystem: "analog" },
      PRODUCTS
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.drone.flightStyles).toContain("freestyle");
    expect(result.kit.drone.videoSystems).toContain("analog");
    expect(result.kit.battery.keySpecs.cells).toBe("6S");
    expect(result.kit.totalPrice).toBeLessThanOrEqual(650);
  });

  it("Freestyle + O4 funciona", () => {
    const result = recommendKit(
      { budget: 1150, experience: "intermediate", style: "freestyle", videoSystem: "dji_o4" },
      PRODUCTS
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.drone.flightStyles).toContain("freestyle");
    expect(result.kit.drone.videoSystems).toContain("dji_o4");
    expect(result.kit.totalPrice).toBeLessThanOrEqual(1150);
  });

  it("Cinematic + O4 funciona", () => {
    const result = recommendKit(
      { budget: 1150, experience: "intermediate", style: "cinematic", videoSystem: "dji_o4" },
      PRODUCTS
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.drone.flightStyles).toContain("cinematic");
    expect(result.kit.drone.videoSystems).toContain("dji_o4");
    expect(result.kit.totalPrice).toBeLessThanOrEqual(1150);
    expect(result.kit.batteryQuantity).toBe(3);
  });

  it("Long Range + Analog funciona", () => {
    const result = recommendKit(
      { budget: 950, experience: "advanced", style: "longRange", videoSystem: "analog" },
      PRODUCTS
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.drone.flightStyles).toContain("longRange");
    expect(result.kit.drone.videoSystems).toContain("analog");
    expect(result.kit.totalPrice).toBeLessThanOrEqual(950);
  });

  it("Long Range + O4 funciona cuando es técnicamente razonable", () => {
    const result = recommendKit(
      { budget: 1350, experience: "advanced", style: "longRange", videoSystem: "dji_o4" },
      PRODUCTS
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(result.kit.drone.flightStyles).toContain("longRange");
    expect(result.kit.drone.videoSystems).toContain("dji_o4");
    expect(result.kit.totalPrice).toBeLessThanOrEqual(1350);
  });
});

describe("kit validation", () => {
  it("no kit mixes incompatible video systems", () => {
    const result = recommendKit(
      { budget: 1200, experience: "intermediate", style: "freestyle", videoSystem: "recommend" },
      PRODUCTS
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(
      result.kit.goggles.videoSystems.some((v) => result.kit.drone.videoSystems.includes(v))
    ).toBe(true);
  });

  it("no kit mixes incompatible radio and drone protocols", () => {
    const result = recommendKit(
      { budget: 1200, experience: "advanced", style: "racing", videoSystem: "analog" },
      PRODUCTS
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(
      result.kit.radio.protocols.some((p) => result.kit.drone.protocols.includes(p))
    ).toBe(true);
  });

  it("battery is electrically compatible with the drone", () => {
    const result = recommendKit(
      { budget: 1200, experience: "advanced", style: "racing", videoSystem: "dji_o4" },
      PRODUCTS
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(batteryMatchesDrone(result.kit.battery, result.kit.drone)).toBe(true);
  });

  it("charger can handle the battery", () => {
    const result = recommendKit(
      { budget: 900, experience: "beginner", style: "tinywhoop", videoSystem: "dji_o4" },
      PRODUCTS
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    expect(chargerMatchesBattery(result.kit.charger, result.kit.battery)).toBe(true);
  });

  it("total price is correct", () => {
    const result = recommendKit(
      { budget: 650, experience: "beginner", style: "tinywhoop", videoSystem: "dji_o4" },
      PRODUCTS
    );
    expect(result.kind).toBe("kit");
    if (result.kind !== "kit") return;
    const expected =
      result.kit.goggles.priceUsd +
      result.kit.drone.priceUsd +
      result.kit.radio.priceUsd +
      result.kit.charger.priceUsd +
      result.kit.battery.priceUsd * result.kit.batteryQuantity;
    expect(result.kit.totalPrice).toBe(expected);
  });

  it("returns insufficient budget with a meaningful minimum", () => {
    const result = recommendKit(
      { budget: 100, experience: "beginner", style: "tinywhoop", videoSystem: "analog" },
      PRODUCTS
    );
    expect(result.kind).toBe("insufficient");
    if (result.kind !== "insufficient") return;
    expect(Number.isFinite(result.minBudget)).toBe(true);
    expect(result.minBudget).toBeGreaterThan(100);
    expect(result.message).toContain("US$");
  });
});
