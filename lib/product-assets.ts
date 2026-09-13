import type { Product } from "@/lib/schema";

export const RECOMMENDATION_SURFACE_IDS = [
  "axisflying-manta5-se-v2-squashed-x-o4-wide-elrs",
  "betafpv-air65-ii-champion",
  "betafpv-air65-ii-freestyle",
  "betafpv-air65-ii-racing",
  "betafpv-meteor75-pro-analog",
  "betafpv-meteor75-pro-ii-o4-wide",
  "emax-hawk-apex-5-hdzero-elrs-6s",
  "geprc-cinebot35-o4-pro-elrs",
  "geprc-cinelog30-v2-analog-elrs",
  "geprc-cinelog30-v3-o4-pro-elrs",
  "geprc-moz7-v2-analog",
  "geprc-moz7-v2-o4-pro",
  "geprc-tern-lr40-analog",
  "geprc-vapor-d5-hd-o4-pro",
  "geprc-vapor-x5-analog-6s",
  "geprc-vapor-x5-hd-o4-pro",
  "iflight-chimera7-pro-v2-o4-pro-6s",
  "iflight-mach-r5-ultra-trainer-hdzero",
  "iflight-nazgul-eco-dc5-o4-pro-6s",
  "iflight-nazgul-eco-xl5-v1_1-analog-6s",
  "iflight-sh-cinelr7-o4-pro-6s",
  "vroom-comet-pro-5-wrekd-analog-elrs",
  "vroom-comet-pro-5-wrekd-hdzero-elrs",
  "dji-goggles-3",
  "dji-goggles-n3",
  "fatshark-echo-analog",
  "hdzero-goggle-2",
  "skyzone-sky04x-pro",
  "radiomaster-boxer-elrs",
  "radiomaster-gx12-gemini-x",
  "radiomaster-pocket-crush-elrs",
  "radiomaster-pocket-elrs",
  "radiomaster-tx15-max-elrs",
  "radiomaster-tx15-standard-elrs",
  "radiomaster-tx16s-mk3-max-elrs",
  "radiomaster-tx16s-mk3-elrs",
  "betafpv-6port-basic-1s-charger",
  "betafpv-hexacharger-pro",
  "geprc-woopower-w63",
  "hota-d6-pro",
  "hota-s6",
  "hota-t6",
  "isdt-608ac",
  "betafpv-lava-ii-1s-280",
  "betafpv-lava-ii-1s-320",
  "betafpv-lava-ii-1s-480",
  "betafpv-lava-ii-1s-580",
  "betafpv-lava-ii-1s-680",
  "betafpv-lava-ii-4s-680",
  "geprc-storm2-4s-850",
  "gnb-1s-550-100c-a30",
  "iflight-fullsend-6s-1550-150c",
  "battery-iflight-fullsend-6s-3300",
  "ovonic-6s-1300-100c",
  "smc-hcl-rs-6s-1400",
  "tattu-1s-300-75c-bt2",
  "tattu-rline-v6-6s-1300-st",
] as const;

export type RecommendationSurfaceId = (typeof RECOMMENDATION_SURFACE_IDS)[number];

export type ProductAssetRecord = {
  sourceUrl: string;
  imageUrl?: string;
  sourceKind: "official" | "retailer";
  imageKind: "official-direct" | "exact-product-page-capture" | "retailer-direct";
  note?: string;
};

const SOURCE_OVERRIDES: Partial<Record<RecommendationSurfaceId, Pick<ProductAssetRecord, "sourceUrl" | "sourceKind" | "note">>> = {
  "betafpv-air65-ii-champion": { sourceUrl: "https://betafpv.com/products/air65-ii-brushless-whoop-quadcopter", sourceKind: "official" },
  "betafpv-air65-ii-freestyle": { sourceUrl: "https://betafpv.com/products/air65-ii-brushless-whoop-quadcopter", sourceKind: "official" },
  "betafpv-air65-ii-racing": { sourceUrl: "https://betafpv.com/products/air65-ii-brushless-whoop-quadcopter", sourceKind: "official" },
  "betafpv-meteor75-pro-ii-o4-wide": { sourceUrl: "https://betafpv.com/products/meteor75-pro-ii-o4-brushless-whoop-quadcopter", sourceKind: "official" },
  "geprc-cinebot35-o4-pro-elrs": { sourceUrl: "https://geprc.com/product/geprc-cinebot35-o4-pro-quadcopter/", sourceKind: "official" },
  "geprc-cinelog30-v3-o4-pro-elrs": { sourceUrl: "https://geprc.com/product/geprc-cinelog30-v3-o4-pro-quadcopter/", sourceKind: "official" },
  "iflight-chimera7-pro-v2-o4-pro-6s": { sourceUrl: "https://shop.iflight.com/Chimera7-Pro-V2-6S-O4-HD-Pro2259", sourceKind: "official" },
  "iflight-mach-r5-ultra-trainer-hdzero": { sourceUrl: "https://shop.iflight.com/Mach-R5-Ultra-Trainer-6S-HDZero-Pro3880", sourceKind: "official" },
  "vroom-comet-pro-5-wrekd-analog-elrs": { sourceUrl: "https://wrekd.com/products/comet-pro-5-built-tuned-fpv-racing-drone-w-elrs-analog", sourceKind: "retailer", note: "WREKD states electronics/motors can vary from the product-page photograph." },
  "vroom-comet-pro-5-wrekd-hdzero-elrs": { sourceUrl: "https://wrekd.com/products/comet-pro-racing-drone-hdzero-ready-to-fly", sourceKind: "retailer", note: "WREKD states electronics/motors can vary from the product-page photograph." },
  "dji-goggles-3": { sourceUrl: "https://www.dji.com/goggles-3", sourceKind: "official" },
  "dji-goggles-n3": { sourceUrl: "https://www.dji.com/goggles-n3", sourceKind: "official" },
  "fatshark-echo-analog": { sourceUrl: "https://www.fatshark.com/product-page/echo", sourceKind: "official" },
  "hdzero-goggle-2": { sourceUrl: "https://www.hd-zero.com/product-page/hdzero-goggle-2", sourceKind: "official" },
  "skyzone-sky04x-pro": { sourceUrl: "https://www.skyzonefpv.com/products/sky04x-pro", sourceKind: "official" },
  "radiomaster-boxer-elrs": { sourceUrl: "https://radiomasterrc.com/products/boxer-radio-controller-m2", sourceKind: "official" },
  "radiomaster-gx12-gemini-x": { sourceUrl: "https://www.radiomasterrc.com/products/gx12-dual-band-gemini-x-radio-controller", sourceKind: "official" },
  "radiomaster-pocket-crush-elrs": { sourceUrl: "https://radiomasterrc.com/products/pocket-crush-radio-controller", sourceKind: "official" },
  "radiomaster-pocket-elrs": { sourceUrl: "https://radiomasterrc.com/products/pocket-radio-controller-m2", sourceKind: "official" },
  "radiomaster-tx15-max-elrs": { sourceUrl: "https://radiomasterrc.com/products/tx15-max-radio-controller-elrs-m2", sourceKind: "official" },
  "radiomaster-tx15-standard-elrs": { sourceUrl: "https://radiomasterrc.com/products/tx15-radio-controller-elrs-m2", sourceKind: "official" },
  "radiomaster-tx16s-mk3-max-elrs": { sourceUrl: "https://radiomasterrc.com/products/tx16s-mk3-max-radio-controller-elrs-m2", sourceKind: "official" },
  "radiomaster-tx16s-mk3-elrs": { sourceUrl: "https://radiomasterrc.com/products/tx16s-mk3-radio-controller", sourceKind: "official" },
  "betafpv-6port-basic-1s-charger": { sourceUrl: "https://betafpv.com/products/bt2-0-ph2-0-1s-lipo-charger-adapter", sourceKind: "official" },
  "betafpv-hexacharger-pro": { sourceUrl: "https://betafpv.com/products/hexacharger-1s-charger", sourceKind: "official" },
  "geprc-woopower-w63": { sourceUrl: "https://geprc.com/product/geprc-woopower-w63-1s-charger/", sourceKind: "official" },
  "hota-d6-pro": { sourceUrl: "https://www.hobbydrone.cz/user/related_files/d6_pro_manual_-_english.pdf", sourceKind: "retailer" },
  "hota-s6": { sourceUrl: "https://www.hobbydrone.cz/user/related_files/s6_manual_-_english.pdf", sourceKind: "retailer" },
  "hota-t6": { sourceUrl: "https://hobbyking.com/hota-t6-dc-input-300w-15a-1-6s-pocket-charger-pd-90w-usb-c-lipo-li-ion-nimh-smart-battery-charger-black.html", sourceKind: "retailer" },
  "isdt-608ac": { sourceUrl: "https://www.isdt.co/608ac.html?lang=en", sourceKind: "official" },
  "betafpv-lava-ii-1s-280": { sourceUrl: "https://betafpv.com/products/lava-ii-1s-battery", sourceKind: "official" },
  "betafpv-lava-ii-1s-320": { sourceUrl: "https://betafpv.com/products/lava-ii-1s-battery", sourceKind: "official" },
  "betafpv-lava-ii-1s-480": { sourceUrl: "https://betafpv.com/products/lava-ii-1s-battery", sourceKind: "official" },
  "betafpv-lava-ii-1s-580": { sourceUrl: "https://betafpv.com/products/lava-ii-1s-battery", sourceKind: "official" },
  "betafpv-lava-ii-1s-680": { sourceUrl: "https://betafpv.com/products/lava-ii-1s-battery", sourceKind: "official" },
  "betafpv-lava-ii-4s-680": { sourceUrl: "https://betafpv.com/products/lava-ii-4s-battery", sourceKind: "official" },
  "ovonic-6s-1300-100c": { sourceUrl: "https://www.ovonicshop.com/products/ovonic-1300mah-6s-22-2v-100c-lipo-battery-with-xt60-for-fpv", sourceKind: "official" },
  "iflight-fullsend-6s-1550-150c": { sourceUrl: "https://shop.iflight.com/batteries-cat138", sourceKind: "official" },
  "battery-iflight-fullsend-6s-3300": { sourceUrl: "https://shop.iflight.com/batteries-cat138", sourceKind: "official" },
  "tattu-rline-v6-6s-1300-st": { sourceUrl: "https://www.grepow.com/fpv-battery/r-line-6-0-series-fpv-drone-battery-pack.html", sourceKind: "official" },
};

const DIRECT_IMAGES: Partial<Record<RecommendationSurfaceId, string>> = {
  "betafpv-air65-ii-champion": "https://betafpv.com/cdn/shop/files/Air65_II_Brushless_Whoop_Quadcopter_Champion.jpg?v=1779348978",
  "betafpv-air65-ii-racing": "https://betafpv.com/cdn/shop/files/Air65_II_Brushless_Whoop_Quadcopter_Racing.jpg?v=1779348712",
  "betafpv-air65-ii-freestyle": "https://betafpv.com/cdn/shop/files/Air65_II_Brushless_Whoop_Quadcopter_Freestyle.jpg?v=1779349013",
  "betafpv-meteor75-pro-ii-o4-wide": "https://betafpv.com/cdn/shop/files/Meteor75_Pro_II_O4_Brushless_Whoop_Quadcopter.jpg?v=1783563657",
  "betafpv-lava-ii-1s-280": "https://betafpv.com/cdn/shop/files/LAVA_II_1S_280mAh_Battery_top_view.jpg?v=1763545157",
  "betafpv-lava-ii-1s-320": "https://betafpv.com/cdn/shop/files/LAVA_II_1S_320mAh_Battery_top_view.jpg?v=1763607633",
  "betafpv-lava-ii-1s-480": "https://betafpv.com/cdn/shop/files/LAVA_II_1S_480mAh_Battery_top_view.jpg?v=1763607633",
  "betafpv-lava-ii-1s-580": "https://betafpv.com/cdn/shop/files/LAVA_II_1S_580mAh_Battery_top_view.jpg?v=1763607633",
  "betafpv-lava-ii-1s-680": "https://betafpv.com/cdn/shop/files/LAVA_II_1S_680mAh_Battery_top_view.jpg?v=1763607633",
  "betafpv-lava-ii-4s-680": "https://betafpv.com/cdn/shop/files/LAVA_II_4S_680mAh_Battery.jpg?v=1768794886",
  "betafpv-6port-basic-1s-charger": "https://betafpv.com/cdn/shop/products/74b96dbb2d19db9758ba306fc55ad040_cdc152d1-d69c-4fcd-9bd7-1d66a09a4c28.jpg?v=1626077969",
  "betafpv-hexacharger-pro": "https://betafpv.com/cdn/shop/files/HexaCharger_Pro_1S_Charger.jpg?v=1768804157",
  "radiomaster-boxer-elrs": "https://radiomasterrc.com/cdn/shop/files/BOXER-001.jpg?v=1750061786",
  "radiomaster-pocket-elrs": "https://radiomasterrc.com/cdn/shop/files/POCKET-1000x1000-Charcoal-1.jpg?v=1750061505",
  "radiomaster-pocket-crush-elrs": "https://radiomasterrc.com/cdn/shop/files/Pocket_Crush_Radio_Controller.jpg?v=1750060822",
  "geprc-cinelog30-v3-o4-pro-elrs": "https://geprc.com/wp-content/uploads/2025/01/1_DeMain_0075-600x600.jpg",
};

const FALLBACK_SOURCE_KIND: ProductAssetRecord["sourceKind"] = "official";

function pageCapture(sourceUrl: string): string {
  return `https://image.thum.io/get/noanimate/width/900/crop/900/${sourceUrl}`;
}

export function assetForProduct(product: Product): ProductAssetRecord | undefined {
  if (!RECOMMENDATION_SURFACE_IDS.includes(product.id as RecommendationSurfaceId)) return undefined;

  const id = product.id as RecommendationSurfaceId;
  const override = SOURCE_OVERRIDES[id];
  const sourceUrl = override?.sourceUrl ?? product.productUrl;
  if (!sourceUrl || !sourceUrl.startsWith("https://")) return undefined;

  const directImage = DIRECT_IMAGES[id];
  return {
    sourceUrl,
    imageUrl: directImage ?? pageCapture(sourceUrl),
    sourceKind: override?.sourceKind ?? FALLBACK_SOURCE_KIND,
    imageKind: directImage ? "official-direct" : "exact-product-page-capture",
    note: override?.note,
  };
}

export function enrichProductAssets(product: Product): Product {
  const asset = assetForProduct(product);
  if (!asset?.imageUrl) return product;
  const sourceNote = asset.note ? `Asset note: ${asset.note}` : undefined;
  return {
    ...product,
    images: [asset.imageUrl],
    productUrl: asset.sourceUrl,
    sources: Array.from(new Set([asset.sourceUrl, ...(product.sources ?? []), ...(sourceNote ? [sourceNote] : [])])),
  };
}
