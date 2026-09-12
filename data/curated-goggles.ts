import type { CuratedComponentRecord } from "@/lib/component-catalog-schema";

const ALL = ["tinywhoop", "freestyle", "cinematic", "longRange", "racing"] as const;
const EXP = ["beginner", "intermediate", "advanced"] as const;
const V = "2026-09-06";

export const CURATED_GOGGLES: CuratedComponentRecord[] = [
  {
    id: "fatshark-echo-analog", name: "Fat Shark ECHO", brand: "Fat Shark", category: "goggles", sourceSegment: 10,
    sourceStatus: "CORE_BUDGET", state: "CORE_VALUE", recommendationStatus: "ENABLED", priceUsd: 99, availability: "available",
    videoSystems: ["analog"], protocols: [], flightStyles: [...ALL], experienceLevel: ["beginner", "intermediate"], primaryRoles: ["beginner-budget", "tinywhoop", "casual-analog"],
    fitScores: { value: 9, imageQuality: 7, racing: 6.5, receiverPerformance: 5.5 }, editorialScores: true,
    goggleProfile: { supportedVideoUnits: ["ANALOG_5_8"], builtInAnalogReceiver: true, displayType: "TFT LCD", displayCount: 1, resolution: "800x480", fovDeg: 55 },
    sourceUrl: "https://www.fatshark.com/product-page/echo", verifiedAt: V,
  },
  {
    id: "betafpv-vr04-analog", name: "BETAFPV VR04 Analog", brand: "BETAFPV", category: "goggles", sourceSegment: 10,
    sourceStatus: "CORE_BUDGET_STOCK_GATED", state: "CORE_VALUE", recommendationStatus: "FALLBACK_ONLY", priceUsd: 74.99, availability: "unknown",
    videoSystems: ["analog"], protocols: [], flightStyles: [...ALL], experienceLevel: ["beginner", "intermediate"], primaryRoles: ["ultra-budget", "tinywhoop", "glasses-user"],
    weightG: 425, fitScores: { value: 10, racing: 8, glassesUse: 9.5 }, editorialScores: true,
    goggleProfile: { supportedVideoUnits: ["ANALOG_5_8"], builtInAnalogReceiver: true, displayType: "LCD", displayCount: 1, resolution: "800x480", glassesFriendly: true },
    blockerReasons: ["DIRECT_STOCK_SOLD_OUT_AT_RESEARCH"], sourceUrl: "https://betafpv.com/products/vr04-fpv-goggles", verifiedAt: V,
  },
  {
    id: "skyzone-cobra-x-v4", name: "Skyzone Cobra X V4", brand: "Skyzone", category: "goggles", sourceSegment: 10,
    sourceStatus: "CORE_MID_GENERAL", state: "CORE", recommendationStatus: "CATALOG_ONLY", priceUsd: null, priceNote: "Official routes observed ~US$259–292; preserve range rather than inventing one exact price.", availability: "available",
    videoSystems: ["analog"], protocols: [], flightStyles: [...ALL], experienceLevel: [...EXP], primaryRoles: ["midrange-box", "general-analog", "glasses-user"],
    weightG: 332, fitScores: { imageQuality: 8.5, racing: 5.5, receiverPerformance: 9, glassesUse: 9.5 }, editorialScores: true,
    goggleProfile: { supportedVideoUnits: ["ANALOG_5_8"], builtInAnalogReceiver: true, displayType: "LCD", displayCount: 1, resolution: "1280x720", fovDeg: 50, glassesFriendly: true, latencyProfiles: [{ videoUnit: "ANALOG_5_8", mode: "ANALOG", referenceLatencyMs: 29.5, sourceType: "INDEPENDENT", note: "~29–30ms 2026 reference; methodology-dependent" }] },
    sourceUrl: "https://www.skyzonefpv.com/products/skyzone-cobra-x-v4-goggle", verifiedAt: V,
  },
  {
    id: "skyzone-cobra-sd", name: "Skyzone Cobra SD", brand: "Skyzone", category: "goggles", sourceSegment: 10,
    sourceStatus: "CORE_MID_VALUE", state: "CORE_VALUE", recommendationStatus: "CATALOG_ONLY", priceUsd: null, priceNote: "Observed ~US$202–219.", availability: "unknown",
    videoSystems: ["analog"], protocols: [], flightStyles: [...ALL], experienceLevel: [...EXP], primaryRoles: ["midrange-value", "general-analog", "glasses-user"], weightG: 332,
    fitScores: { value: 8.4, imageQuality: 7.5, racing: 5.5, glassesUse: 9.5 }, editorialScores: true,
    goggleProfile: { supportedVideoUnits: ["ANALOG_5_8"], builtInAnalogReceiver: true, displayType: "LCD", resolution: "800x480", fovDeg: 50, glassesFriendly: true, latencyProfiles: [{ videoUnit: "ANALOG_5_8", mode: "ANALOG", referenceLatencyMs: 29, sourceType: "COMMUNITY" }] },
    sourceUrl: "https://www.skyzonefpv.com/products/skyzone-lcd-screen-cobra-sd-fpv-goggle-with-diversity-receiver", verifiedAt: V,
  },
  {
    id: "skyzone-sky04x-pro", name: "Skyzone SKY04X Pro", brand: "Skyzone", category: "goggles", sourceSegment: 10,
    sourceStatus: "CORE_PREMIUM", state: "CORE_PREMIUM", recommendationStatus: "ENABLED", priceUsd: 548, availability: "available",
    videoSystems: ["analog"], protocols: [], flightStyles: [...ALL], experienceLevel: ["intermediate", "advanced"], primaryRoles: ["premium-analog", "freestyle", "racing-after-firmware-fix"], weightG: 267,
    fitScores: { imageQuality: 9.8, racing: 9.1, freestyle: 9.8, value: 8.8 }, editorialScores: true,
    goggleProfile: { supportedVideoUnits: ["ANALOG_5_8"], builtInAnalogReceiver: false, displayType: "OLED", displayCount: 2, resolution: "1920x1080", refreshHzMax: 100, fovDeg: 52, diopterAdjustment: true, ipdAdjustment: true, requiresLatencyFixFirmware: true, minimumRecommendedFirmwareBranch: "4.2.x", latencyProfiles: [{ videoUnit: "ANALOG_5_8", mode: "ANALOG", referenceLatencyMs: 12, sourceType: "COMMUNITY", note: "Post latency-fix firmware reference; not an immutable device constant" }] },
    sourceUrl: "https://www.skyzonefpv.com/products/sky04x-pro", verifiedAt: V,
  },
  {
    id: "orqa-fpv-one-pilot-rapidfire", name: "Orqa FPV.One Pilot + rapidFIRE", brand: "Orqa", category: "goggles", sourceSegment: 10,
    sourceStatus: "CORE_RACING_PREMIUM_STOCK_GATED", state: "CORE_SPECIALIST", recommendationStatus: "FALLBACK_ONLY", priceUsd: null, priceNote: "Goggle and rapidFIRE/module/antennas/power are separate costs; no false single USD total stored.", availability: "unknown",
    videoSystems: ["analog"], protocols: [], flightStyles: [...ALL], experienceLevel: ["advanced"], primaryRoles: ["premium-racing", "competitive-analog"], weightG: 256,
    fitScores: { racing: 10, imageQuality: 9.7, receiverPerformance: 10 }, editorialScores: true,
    goggleProfile: { supportedVideoUnits: ["ANALOG_5_8"], builtInAnalogReceiver: false, receiverModuleRequired: true, displayType: "OLED", displayCount: 2, resolution: "1280x960", fovDeg: 37, diopterAdjustment: true, ipdAdjustment: true, latencyProfiles: [{ videoUnit: "ANALOG_5_8", mode: "ANALOG", referenceLatencyMs: 9, sourceType: "COMMUNITY", note: "With rapidFIRE, 2026 reference" }] },
    blockerReasons: ["STOCK_GATED", "ANALOG_MODULE_AND_ANTENNAS_REQUIRED"], sourceUrl: "https://orqafpv.com/products/fpvonepilot", verifiedAt: V,
  },
  {
    id: "hdzero-goggle-2", name: "HDZero Goggle 2", brand: "HDZero", category: "goggles", sourceSegment: 10,
    sourceStatus: "CORE_HYBRID_PREMIUM", state: "CORE_PREMIUM", recommendationStatus: "ENABLED", priceUsd: 699.99, availability: "unknown",
    videoSystems: ["analog", "hdzero"], protocols: [], flightStyles: [...ALL], experienceLevel: ["intermediate", "advanced"], primaryRoles: ["premium-analog-plus-hdzero", "competitive-racing", "futureproof"], weightG: 305,
    fitScores: { racing: 10, imageQuality: 9.7, futureProofing: 10, valueForAnalogPlusHDZero: 9 }, editorialScores: true,
    goggleProfile: { supportedVideoUnits: ["ANALOG_5_8", "HDZERO"], builtInAnalogReceiver: true, displayType: "OLED", displayCount: 2, resolution: "1920x1080", refreshHzMax: 90, fovDeg: 46, diopterAdjustment: true, ipdAdjustment: true, latencyProfiles: [{ videoUnit: "ANALOG_5_8", mode: "ANALOG", minLatencyMs: 2, sourceType: "MANUFACTURER", note: "Manufacturer glass-to-glass claim <2ms; methodology differs from independent full-chain testing" }, { videoUnit: "ANALOG_5_8", mode: "ANALOG", referenceLatencyMs: 11, sourceType: "INDEPENDENT", note: "Independent/community full-chain reference" }, { videoUnit: "HDZERO", mode: "NORMAL", minLatencyMs: 3, sourceType: "MANUFACTURER", note: "Manufacturer platform claim <3ms" }] },
    sourceUrl: "https://www.hd-zero.com/product-page/hdzero-goggle-2", verifiedAt: V,
  },
  {
    id: "dji-goggles-n3", name: "DJI Goggles N3", brand: "DJI", category: "goggles", sourceSegment: 11,
    sourceStatus: "CORE_VALUE", state: "CORE_VALUE", recommendationStatus: "ENABLED", priceUsd: 229, availability: "unknown",
    videoSystems: ["dji_o4"], protocols: [], flightStyles: [...ALL], experienceLevel: ["beginner", "intermediate", "advanced"], primaryRoles: ["budget-O4", "glasses-user", "tinywhoop-O4", "value-racing-recreational"], weightG: 536,
    fitScores: { value: 10, displayQuality: 7, glassesCompatibility: 10, O4Performance: 9, O4Racing: 9, O3Compatibility: 0 }, editorialScores: true,
    goggleProfile: { supportedVideoUnits: ["DJI_O4", "DJI_O4_WIDE", "DJI_O4_PRO"], unsupportedVideoUnits: ["DJI_O3", "ANALOG_5_8"], o4RaceMode: true, displayType: "LCD", displayCount: 1, resolution: "1920x1080", refreshHzMax: 60, fovDeg: 54, ipdAdjustment: false, diopterAdjustment: false, glassesFriendly: true, latencyProfiles: [{ videoUnit: "DJI_O4", mode: "RACING", minLatencyMs: 24, sourceType: "MANUFACTURER" }, { videoUnit: "DJI_O4_PRO", mode: "RACING", minLatencyMs: 19, sourceType: "MANUFACTURER" }] },
    sourceUrl: "https://www.dji.com/goggles-n3/specs", verifiedAt: V,
  },
  {
    id: "dji-goggles-3", name: "DJI Goggles 3", brand: "DJI", category: "goggles", sourceSegment: 11,
    sourceStatus: "CORE_PREMIUM", state: "CORE_PREMIUM", recommendationStatus: "ENABLED", priceUsd: 499, availability: "available",
    videoSystems: ["dji_o3", "dji_o4"], protocols: [], flightStyles: [...ALL], experienceLevel: [...EXP], primaryRoles: ["premium-O4", "O3-and-O4", "O4-racing"], weightG: 470,
    fitScores: { displayQuality: 10, O4Performance: 10, O4Racing: 10, O3Compatibility: 10, value: 8.2 }, editorialScores: true,
    goggleProfile: { supportedVideoUnits: ["DJI_O3", "DJI_O4", "DJI_O4_WIDE", "DJI_O4_PRO"], unsupportedVideoUnits: ["ANALOG_5_8"], o4RaceMode: true, displayType: "MICRO_OLED", displayCount: 2, resolution: "1920x1080 per eye", refreshHzMax: 100, fovDeg: 44, ipdAdjustment: true, diopterAdjustment: true, latencyProfiles: [{ videoUnit: "DJI_O4", mode: "RACING", minLatencyMs: 20, sourceType: "MANUFACTURER" }, { videoUnit: "DJI_O4_WIDE", mode: "RACING", minLatencyMs: 20, sourceType: "MANUFACTURER" }, { videoUnit: "DJI_O4_PRO", mode: "RACING", minLatencyMs: 15, sourceType: "MANUFACTURER" }, { videoUnit: "DJI_O3", mode: "NORMAL", minLatencyMs: 30, sourceType: "MANUFACTURER", note: "1080p100 mode" }] },
    sourceUrl: "https://www.dji.com/goggles-3/specs", verifiedAt: V,
  },
  {
    id: "dji-goggles-integra", name: "DJI Goggles Integra", brand: "DJI", category: "goggles", sourceSegment: 11,
    sourceStatus: "CORE_LEGACY_VALUE_STOCK_GATED", state: "CONDITIONAL", recommendationStatus: "FALLBACK_ONLY", priceUsd: null, priceNote: "Historical/current value depends heavily on exact stock; source suggests strong value only around US$349–380.", availability: "unknown",
    videoSystems: ["dji_o3", "dji_o4"], protocols: [], flightStyles: [...ALL], experienceLevel: [...EXP], primaryRoles: ["discounted-OLED-DJI", "O3-and-O4-value"],
    goggleProfile: { supportedVideoUnits: ["DJI_O3", "DJI_O4", "DJI_O4_WIDE", "DJI_O4_PRO"], o4RaceMode: false, displayType: "MICRO_OLED", displayCount: 2, resolution: "1920x1080 per eye", refreshHzMax: 100, fovDeg: 44, ipdAdjustment: true, diopterAdjustment: false }, verifiedAt: V,
  },
  {
    id: "dji-goggles-2", name: "DJI Goggles 2", brand: "DJI", category: "goggles", sourceSegment: 11,
    sourceStatus: "CONDITIONAL_LEGACY", state: "CONDITIONAL", recommendationStatus: "CATALOG_ONLY", priceUsd: null, availability: "unknown",
    videoSystems: ["dji_o3", "dji_o4"], protocols: [], flightStyles: [...ALL], experienceLevel: ["intermediate", "advanced"], primaryRoles: ["O3-owner", "strong-diopter-range"], weightG: 290,
    goggleProfile: { supportedVideoUnits: ["DJI_O3", "DJI_O4", "DJI_O4_WIDE", "DJI_O4_PRO"], o4RaceMode: false, displayType: "MICRO_OLED", displayCount: 2, resolution: "1920x1080 per eye", refreshHzMax: 100, fovDeg: 51, ipdAdjustment: true, diopterAdjustment: true }, verifiedAt: V,
  },
  {
    id: "dji-fpv-goggles-v2", name: "DJI FPV Goggles V2", brand: "DJI", category: "goggles", sourceSegment: 11,
    sourceStatus: "LEGACY_O3_ONLY_FOR_THIS_PROJECT", state: "LEGACY", recommendationStatus: "CATALOG_ONLY", priceUsd: null, availability: "unknown",
    videoSystems: ["dji_o3"], protocols: [], flightStyles: [...ALL], experienceLevel: ["advanced"], primaryRoles: ["legacy-O3"],
    goggleProfile: { supportedVideoUnits: ["DJI_O3"], unsupportedVideoUnits: ["DJI_O4", "DJI_O4_WIDE", "DJI_O4_PRO"], o4RaceMode: false }, verifiedAt: V,
  },
  ...[
    ["fatshark-hdo2_1", "Fat Shark HDO2/HDO2.1", "Fat Shark", "WATCHLIST_AVAILABILITY", "WATCHLIST"],
    ["skyzone-sky04o-pro", "Skyzone SKY04O Pro", "Skyzone", "DO_NOT_DEFAULT_LATENCY", "DO_NOT_DEFAULT"],
    ["fatshark-hdo-plus", "Fat Shark HDO+", "Fat Shark", "DO_NOT_DEFAULT_LATENCY_VALUE", "DO_NOT_DEFAULT"],
    ["eachine-ev800d", "Eachine EV800D", "Eachine", "DO_NOT_DEFAULT_AUTHENTICITY", "CONDITIONAL"],
    ["skyzone-sky02o", "Skyzone SKY02O", "Skyzone", "CONDITIONAL_PRICE_POSITIONING", "CONDITIONAL"],
  ].map(([id, name, brand, sourceStatus, state]) => ({
    id, name, brand, category: "goggles" as const, sourceSegment: 10, sourceStatus, state: state as CuratedComponentRecord["state"], recommendationStatus: "CATALOG_ONLY" as const,
    priceUsd: null, availability: "unknown" as const, videoSystems: ["analog" as const], protocols: [], flightStyles: [...ALL], experienceLevel: [...EXP], primaryRoles: ["historical-or-gated-analog"],
    goggleProfile: { supportedVideoUnits: ["ANALOG_5_8" as const] }, verifiedAt: V,
  })),
];
