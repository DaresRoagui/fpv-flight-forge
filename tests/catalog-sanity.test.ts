import { describe, expect, it } from "vitest";
import {
  CURATED_DRONE_CATALOG,
  CURATED_RECOMMENDER_DRONES,
  getCuratedDroneRecord,
} from "@/data/curated-drones";
import { getAllProductsForAudit, getProductById, getProducts } from "@/lib/products";

const ids = (items: { id: string }[]) => items.map((item) => item.id);

describe("curated drone catalog sanity", () => {
  it("has unique IDs and preserves all 01-09 inventory plus split variants", () => {
    expect(CURATED_DRONE_CATALOG).toHaveLength(99);
    expect(new Set(ids(CURATED_DRONE_CATALOG)).size).toBe(CURATED_DRONE_CATALOG.length);
    for (let segment = 1; segment <= 9; segment += 1) {
      expect(CURATED_DRONE_CATALOG.some((record) => record.sourceSegment === segment)).toBe(true);
    }
  });

  it("only promotes source-grounded winners with an exact aircraft profile and price", () => {
    expect(CURATED_RECOMMENDER_DRONES).toHaveLength(23);
    CURATED_RECOMMENDER_DRONES.forEach((record) => {
      expect(record.priceUsd).not.toBeNull();
      expect(record.aircraftProfile).toBeDefined();
      expect(record.aircraftProfile?.battery.cellsAllowed.length).toBeGreaterThan(0);
      expect(record.aircraftProfile?.battery.connector).toBeTruthy();
    });

    const runtime = getProducts();
    CURATED_RECOMMENDER_DRONES.forEach((record) => {
      const product = runtime.find((candidate) => candidate.id === record.id);
      expect(product).toBeDefined();
      expect(product?.aircraftProfile).toBeDefined();
      expect(product?.weightG).toBeGreaterThan(0);
      expect(product?.aircraftProfile?.dryWeightG).toBeGreaterThan(0);
    });
  });

  it("keeps conditional/watchlist/legacy/do-not-default records out of normal recommendations", () => {
    const defaultIds = new Set(ids(getProducts()));
    const gatedStates = new Set(["CONDITIONAL", "WATCHLIST", "DO_NOT_DEFAULT", "LEGACY"]);

    CURATED_DRONE_CATALOG
      .filter((record) => gatedStates.has(record.state))
      .forEach((record) => expect(record.recommendationStatus).not.toBe("ENABLED"));

    expect(getProductById("drone-betafpv-cetus-pro")?.state).toBe("DO_NOT_DEFAULT");
    expect(defaultIds.has("drone-betafpv-cetus-pro")).toBe(false);
    expect(getProductById("drone-iflight-mach-r5-sport")?.state).toBe("CONDITIONAL");
    expect(defaultIds.has("drone-iflight-mach-r5-sport")).toBe(false);
  });

  it("cleans Mark5 and Vapor-D5 roles instead of treating freestyle platforms as race specialists", () => {
    const mark5 = getProductById("geprc-mark5-o4-pro-wide-x");
    expect(mark5?.recommendedStyles).toEqual(["freestyle"]);
    expect(mark5?.flightStyles).not.toContain("racing");

    const vaporD5 = getProductById("geprc-vapor-d5-hd-o4-pro");
    expect(vaporD5?.flightStyles).not.toContain("racing");
    expect(vaporD5?.recommendedStyles).toContain("freestyle");

    expect(getProductById("drone-geprc-mark5-o4")?.state).toBe("DO_NOT_DEFAULT");
    expect(getProductById("drone-geprc-vapor-d5-o4")?.state).toBe("DO_NOT_DEFAULT");
  });

  it("contains real HDZero race inventory and the explicit O4 race compromise", () => {
    const hdzero = CURATED_DRONE_CATALOG.filter((record) => record.videoSystems.includes("hdzero"));
    expect(hdzero.length).toBeGreaterThanOrEqual(5);
    expect(hdzero.some((record) => record.id === "iflight-mach-r5-ultra-trainer-hdzero")).toBe(true);
    expect(hdzero.some((record) => record.id === "vroom-comet-pro-5-wrekd-hdzero-elrs")).toBe(true);

    const o4Compromise = getCuratedDroneRecord("axisflying-manta5-se-v2-squashed-x-o4-wide-elrs");
    expect(o4Compromise?.flightStyles).toContain("racing");
    expect(o4Compromise?.recommendationStatus).toBe("CATALOG_ONLY");
  });

  it("does not collapse technically distinct purchase variants", () => {
    expect(getCuratedDroneRecord("betafpv-pavo20-pro-ii-3s-o4-pro")).toBeDefined();
    expect(getCuratedDroneRecord("betafpv-pavo20-pro-ii-4s-o4-pro")).toBeDefined();
    expect(getCuratedDroneRecord("emax-hawk-apex-5-hdzero-elrs-4s")).toBeDefined();
    expect(getCuratedDroneRecord("emax-hawk-apex-5-hdzero-elrs-6s")).toBeDefined();
    expect(getCuratedDroneRecord("geprc-smart35-analog-4s")).toBeDefined();
    expect(getCuratedDroneRecord("geprc-smart35-analog-6s")).toBeDefined();
  });

  it("preserves critical aircraft-specific battery envelopes", () => {
    const cinelog35 = getProductById("geprc-cinelog35-v3-o4-pro-elrs");
    expect(cinelog35?.aircraftProfile?.battery.capacityMah).toEqual({
      min: 1100,
      idealMin: 1100,
      idealMax: 1300,
      max: 1300,
    });

    const cinebot35 = getProductById("geprc-cinebot35-o4-pro-elrs");
    expect(cinebot35?.aircraftProfile?.battery.capacityMah.max).toBe(1550);

    const moz7 = getProductById("geprc-moz7-v2-o4-pro");
    expect(moz7?.aircraftProfile?.battery.capacityMah.min).toBe(3300);
    expect(moz7?.aircraftProfile?.battery.capacityMah.max).toBe(8000);
  });

  it("keeps the historical audit catalog available without leaking it into default products", () => {
    const allProducts = getAllProductsForAudit();
    expect(allProducts.some((product) => product.id === "drone-betafpv-cetus-pro")).toBe(true);
    expect(getProducts().some((product) => product.id === "drone-betafpv-cetus-pro")).toBe(false);
  });
});
