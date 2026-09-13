import type { CuratedComponentRecord, RadioProfile } from "@/lib/component-catalog-schema";

const ALL = ["tinywhoop", "freestyle", "cinematic", "longRange", "racing"] as const;
const EXP = ["beginner", "intermediate", "advanced"] as const;
const V = "2026-09-06";

function elrs(
  id: string, name: string, priceUsd: number | null, status: string, state: CuratedComponentRecord["state"], recommendationStatus: CuratedComponentRecord["recommendationStatus"],
  profile: RadioProfile, scores: Record<string, number>, roles: string[], weightG?: number, note?: string
): CuratedComponentRecord {
  return {
    id, name, brand: id.startsWith("jumper") ? "Jumper" : id.startsWith("betafpv") ? "BETAFPV" : "RadioMaster", category: "radio", sourceSegment: 12,
    sourceStatus: status, state, recommendationStatus, priceUsd, priceNote: note, availability: recommendationStatus === "ENABLED" ? "available" : "unknown",
    videoSystems: [], protocols: profile.geminiX ? ["elrs_2.4", "elrs_900", "gemini_x"] : profile.rfBands.includes("900MHz") ? ["elrs_2.4", "elrs_900"] : ["elrs_2.4"],
    flightStyles: [...ALL], experienceLevel: [...EXP], primaryRoles: roles, fitScores: scores, editorialScores: true, weightG, radioProfile: profile, verifiedAt: V,
  };
}

export const CURATED_RADIOS: CuratedComponentRecord[] = [
  elrs("radiomaster-pocket-elrs", "RadioMaster Pocket ELRS", 59.99, "CORE_BUDGET", "CORE_VALUE", "ENABLED",
    { internalProtocol: "ELRS", rfBands: ["2.4GHz"], gemini: false, geminiX: false, maxRfPowerMw: 250, firmware: "EdgeTX", usbSimulator: true, gimbals: "X5 Hall nano", batteryRequired: ["2x18650"], batteryIncluded: false, moduleBay: "Nano" },
    { beginner: 10, value: 10, portability: 10, racing: 8, gimbalPrecision: 7.5 }, ["beginner", "budget", "portable", "tinywhoop", "simulator"], 288,
    "US$59.99 family entry reference; exact ELRS variant must be selected. Pocket Crush is a cosmetic/accessory variant, not a different RF tier."),
  elrs("radiomaster-pocket-crush-elrs", "RadioMaster Pocket Crush ELRS", 64.99, "CORE_BUDGET_VARIANT", "CORE_VALUE", "ENABLED",
    { internalProtocol: "ELRS", rfBands: ["2.4GHz"], gemini: false, geminiX: false, maxRfPowerMw: 250, firmware: "EdgeTX", usbSimulator: true, gimbals: "X5 Hall nano", batteryRequired: ["2x18650"], batteryIncluded: false, moduleBay: "Nano" },
    { beginner: 10, value: 9.8, portability: 10, racing: 8 }, ["beginner", "budget", "portable"], 288),
  elrs("radiomaster-t8l-elrs", "RadioMaster T8L ELRS", 34.99, "CORE_ULTRABUDGET", "CORE_VALUE", "FALLBACK_ONLY",
    { internalProtocol: "ELRS", rfBands: ["2.4GHz"], maxRfPowerMw: 100, firmware: "T8L special firmware (not normal EdgeTX)", usbSimulator: true, gimbals: "Quad-bearing Hall nano", batteryRequired: ["2x18650"], batteryIncluded: false },
    { value: 10, portability: 10, racing: 6.5 }, ["ultra-budget", "trainer", "backup"], 204),
  elrs("radiomaster-boxer-elrs", "RadioMaster Boxer ELRS", 153.99, "CORE_VALUE", "CORE_VALUE", "ENABLED",
    { internalProtocol: "ELRS", rfBands: ["2.4GHz"], gemini: false, geminiX: false, maxRfPowerMw: 1000, firmware: "EdgeTX", usbSimulator: true, gimbals: "V4 full-size Hall", batteryRequired: ["2x18650", "2S LiPo"], batteryIncluded: false, moduleBay: "JR" },
    { value: 10, portability: 7.8, racing: 9.5, gimbalPrecision: 9.5 }, ["all-round", "freestyle", "racing"], 520),
  elrs("radiomaster-boxer-crush-elrs", "RadioMaster Boxer Crush ELRS", 189.99, "CORE_PREMIUM_CONTROLS", "CORE_PREMIUM", "ENABLED",
    { internalProtocol: "ELRS", rfBands: ["2.4GHz"], gemini: false, geminiX: false, maxRfPowerMw: 1000, firmware: "EdgeTX", usbSimulator: true, gimbals: "AG01 CNC Hall", batteryRequired: ["2x18650", "2S LiPo"], batteryIncluded: false, moduleBay: "JR" },
    { value: 8.8, racing: 10, gimbalPrecision: 10 }, ["premium-controls", "racing", "freestyle"]),
  elrs("radiomaster-tx15-standard-elrs", "RadioMaster TX15 Standard ELRS", 153.99, "CORE_COLORSCREEN", "CORE_VALUE", "ENABLED",
    { internalProtocol: "ELRS", rfBands: ["2.4GHz", "900MHz"], selectableBands: true, simultaneousBands: false, gemini: false, geminiX: false, maxRfPowerMw: 1000, firmware: "EdgeTX 3", usbSimulator: true, gimbals: "V5 full-size Hall", batteryRequired: ["2x18650", "2S LiPo"], batteryIncluded: false, moduleBay: "JR" },
    { beginner: 9.5, value: 10, racing: 9.7, longRange: 9.4, gimbalPrecision: 9.3 }, ["color-screen-value", "all-round", "selectable-band"], 605),
  elrs("radiomaster-tx15-max-elrs", "RadioMaster TX15 Max ELRS", 219.99, "CORE_PREMIUM", "CORE_PREMIUM", "ENABLED",
    { internalProtocol: "ELRS", rfBands: ["2.4GHz", "900MHz"], selectableBands: true, simultaneousBands: false, gemini: false, geminiX: false, maxRfPowerMw: 1000, firmware: "EdgeTX 3", usbSimulator: true, gimbals: "AG02 CNC Hall", batteryRequired: ["2x18650", "2S LiPo"], batteryIncluded: false, moduleBay: "JR" },
    { value: 8.8, racing: 10, longRange: 9.5, gimbalPrecision: 10 }, ["premium-freestyle", "premium-racing", "selectable-band"], 672),
  elrs("jumper-t20s-v2-elrs", "Jumper T20S / T20S V2 ELRS", null, "CORE_PORTABLE", "CORE_SPECIALIST", "FALLBACK_ONLY",
    { internalProtocol: "ELRS", rfBands: ["2.4GHz"], firmware: "EdgeTX", usbSimulator: true, gimbals: "Full-size Hall family", batteryRequired: ["2x21700 class depending exact variant"], batteryIncluded: false },
    { portability: 9.5, value: 8.8, racing: 8.8 }, ["portable-full-size-controls"], undefined, "Current market ~US$135–150 depending exact V2/variant; no false exact price stored."),
  elrs("radiomaster-gx12-gemini-x", "RadioMaster GX12 Gemini-X", 169.99, "CORE_LONG_RANGE", "CORE_SPECIALIST", "ENABLED",
    { internalProtocol: "ELRS", rfBands: ["2.4GHz", "900MHz"], selectableBands: true, simultaneousBands: true, gemini: true, geminiX: true, maxRfPowerMw: 1000, firmware: "EdgeTX", usbSimulator: true, gimbals: "GX01 CNC digital Hall", batteryRequired: ["2x18650", "2S pack"], batteryIncluded: false, moduleBay: "Lite/Nano-class" },
    { value: 9.4, portability: 8.5, racing: 8.3, longRange: 10, RFRedundancy: 10 }, ["long-range", "Gemini-X", "RF-redundancy"], 573),
  elrs("radiomaster-tx16s-mk3-elrs", "RadioMaster TX16S MK3 Standard ELRS", 199.99, "CORE_FLAGSHIP", "CORE_PREMIUM", "ENABLED",
    { internalProtocol: "ELRS", rfBands: ["2.4GHz", "900MHz"], selectableBands: true, simultaneousBands: true, gemini: true, geminiX: true, maxRfPowerMw: 1000, firmware: "EdgeTX 3", usbSimulator: true, gimbals: "V6 full-size Hall", batteryRequired: ["2x18650", "21700 pack", "2S LiPo"], batteryIncluded: false, moduleBay: "JR" },
    { value: 9.5, racing: 9.3, longRange: 10, RFRedundancy: 10, gimbalPrecision: 9.5 }, ["current-flagship", "long-range-GemX", "complex-aircraft"], 813),
  elrs("radiomaster-tx16s-mk3-max-elrs", "RadioMaster TX16S MK3 MAX ELRS", 269.99, "CORE_FLAGSHIP_PREMIUM", "CORE_PREMIUM", "ENABLED",
    { internalProtocol: "ELRS", rfBands: ["2.4GHz", "900MHz"], selectableBands: true, simultaneousBands: true, gemini: true, geminiX: true, maxRfPowerMw: 1000, firmware: "EdgeTX 3", usbSimulator: true, gimbals: "AG02 CNC Hall", batteryRequired: ["2x18650", "21700 pack", "2S LiPo"], batteryIncluded: false, moduleBay: "JR" },
    { value: 8.2, racing: 9.6, longRange: 10, gimbalPrecision: 10 }, ["premium-flagship", "premium-long-range"], 864),
  elrs("radiomaster-zorro-elrs", "RadioMaster Zorro ELRS", 119.99, "CONDITIONAL_GAMEPAD", "CONDITIONAL", "CATALOG_ONLY",
    { internalProtocol: "ELRS", rfBands: ["2.4GHz"], firmware: "EdgeTX", usbSimulator: true, gimbals: "Hall", batteryRequired: ["2x18350"], batteryIncluded: false },
    { portability: 9, value: 7.5 }, ["gamepad-ergonomics"], 350),
  elrs("betafpv-literadio3-pro-elrs", "BETAFPV LiteRadio 3 Pro ELRS", 89.99, "DO_NOT_DEFAULT_VALUE", "DO_NOT_DEFAULT", "CATALOG_ONLY",
    { internalProtocol: "ELRS", rfBands: ["2.4GHz"], firmware: "EdgeTX-family support per exact version", usbSimulator: true, batteryIncluded: true },
    { value: 6.5 }, ["compact-entry"]),
  elrs("radiomaster-gx15", "RadioMaster GX15", 199.99, "DO_NOT_DEFAULT_FPV", "DO_NOT_DEFAULT", "CATALOG_ONLY",
    { internalProtocol: "ELRS", rfBands: ["2.4GHz"], gemini: true, geminiX: false, firmware: "EdgeTX", usbSimulator: true, batteryIncluded: false },
    { value: 7 }, ["fixed-wing-first", "not-default-fpv"]),
];
