import { describe, expect, it } from "vitest";
import { FINAL_RECOMMENDATION_PRODUCT_IDS, PRODUCT_ASSETS } from "@/data/product-assets";
import { getProducts } from "@/lib/products";

const EXPECTED_COUNTS = {
  drone: 23,
  goggles: 5,
  radio: 8,
  charger: 7,
  battery: 14,
} as const;

describe("Iteration 5 final recommendation assets", () => {
  it("covers the complete audited recommendation-visible surface with real exact assets", () => {
    const products = getProducts();
    expect(FINAL_RECOMMENDATION_PRODUCT_IDS).toHaveLength(57);
    expect(Object.keys(PRODUCT_ASSETS)).toHaveLength(57);

    const counts: Record<string, number> = {};
    for (const id of FINAL_RECOMMENDATION_PRODUCT_IDS) {
      const asset = PRODUCT_ASSETS[id];
      const product = products.find((candidate) => candidate.id === id);
      expect(asset, `${id} missing asset manifest`).toBeDefined();
      expect(product, `${id} missing runtime product`).toBeDefined();
      expect(asset.image.startsWith("https://"), `${id} image must be real HTTPS`).toBe(true);
      expect(asset.productUrl.startsWith("https://"), `${id} source must be HTTPS`).toBe(true);
      expect(asset.image).not.toMatch(/\/images\/(drone|goggles|radio|charger|battery)\.svg$/);
      expect(product?.images[0]).toBe(asset.image);
      expect(product?.productUrl).toBe(asset.productUrl);
      counts[product!.category] = (counts[product!.category] ?? 0) + 1;
    }

    expect(counts).toEqual(EXPECTED_COUNTS);
  });

  it("keeps visually distinct variants on distinct exact images", () => {
    const uniqueImages = (ids: string[]) => new Set(ids.map((id) => PRODUCT_ASSETS[id].image)).size;
    expect(uniqueImages(["betafpv-air65-ii-champion", "betafpv-air65-ii-freestyle", "betafpv-air65-ii-racing"])).toBe(3);
    expect(uniqueImages([
      "betafpv-lava-ii-1s-280",
      "betafpv-lava-ii-1s-320",
      "betafpv-lava-ii-1s-480",
      "betafpv-lava-ii-1s-580",
      "betafpv-lava-ii-1s-680",
    ])).toBe(5);
  });
});
