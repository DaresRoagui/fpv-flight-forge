import type { ChargerProfile, CuratedComponentRecord } from "@/lib/component-catalog-schema";

const ALL = ["tinywhoop", "freestyle", "cinematic", "longRange", "racing"] as const;
const EXP = ["beginner", "intermediate", "advanced"] as const;
const V = "2026-09-06";

function charger(
  id: string, name: string, brand: string, segment: 13 | 14, status: string, state: CuratedComponentRecord["state"], rec: CuratedComponentRecord["recommendationStatus"],
  priceUsd: number | null, profile: ChargerProfile, scores: Record<string, number>, roles: string[], weightG?: number, priceNote?: string
): CuratedComponentRecord {
  return { id, name, brand, category: "charger", sourceSegment: segment, sourceStatus: status, state, recommendationStatus: rec, priceUsd, priceNote,
    availability: rec === "ENABLED" ? "available" : "unknown", videoSystems: [], protocols: [], flightStyles: [...ALL], experienceLevel: [...EXP], primaryRoles: roles,
    fitScores: scores, editorialScores: true, weightG, chargerProfile: profile, verifiedAt: V };
}

const multiCellProfile = (cells: number[], channels: number, inputs: string[], externalPsu: boolean, extra: Partial<ChargerProfile> = {}): ChargerProfile => ({
  supportedCells: cells,
  supportedChemistries: ["LiPo", "LiHV", "LiFe", "LiIon", "NiMH"],
  channels, independentChannels: channels > 1, nativeConnectors: ["XT60"], acceptedBatteryConnectors: ["XT60", "XT60H", "XT60U", "XT30"], adapterRequiredFor: ["XT30"],
  connectorRules: ["XT30 packs normally require an XT60-to-XT30 charge lead", "2S-6S lithium packs require their balance lead when balance charging"], balanceConnector: "JST-XH (verify exact board/lead)",
  storageSupport: true, dischargeSupport: true, inputTypes: inputs, requiresExternalPsu: externalPsu, ...extra,
});

export const CURATED_CHARGERS: CuratedComponentRecord[] = [
  charger("geprc-woopower-w63", "GEPRC WooPower W63", "GEPRC", 13, "CORE_BEST_OVERALL", "CORE", "ENABLED", 39.99,
    { supportedCells: [1], supportedChemistries: ["LiPo", "LiHV", "LiFe"], channels: 6, independentChannels: true, independentPerChannelSettings: true,
      nativeConnectors: ["BT2.0", "PH2.0"], acceptedBatteryConnectors: ["BT2.0", "A30", "PH2.0"], connectorRules: ["A30 battery plugs are accepted in the BT2.0 channel connector", "Never use BT2.0 and PH2.0 on the same channel simultaneously"],
      storageSupport: true, dischargeSupport: true, inputTypes: ["USB-C PD3", "XT60 DC"], inputVoltage: "7-26V", requiresExternalPsu: false, recommendedPsuW: 100, maxChargePowerW: 78, maxChargeCurrentA: 3, minChargeCurrentA: 0.1, targetVoltagesV: [4.2, 4.35] },
    { beginner: 9, value: 10, storageFunction: 10, mixedBatteryFlexibility: 10, chargingSpeedPotential: 10 }, ["best-overall-1S", "mixed-whoop-fleet", "race-day"], 160),
  charger("vifly-whoopstor-v3", "VIFLY WhoopStor V3", "VIFLY", 13, "CORE_RELIABLE", "CORE", "FALLBACK_ONLY", 32.99,
    { supportedCells: [1], supportedChemistries: ["LiPo", "LiHV"], channels: 6, independentChannels: true, independentPerChannelSettings: false,
      nativeConnectors: ["BT2.0", "PH2.0"], acceptedBatteryConnectors: ["BT2.0", "A30", "PH2.0"], connectorRules: ["A30 batteries are accepted through BT2.0 ports", "Settings are global across ports"], storageSupport: true, dischargeSupport: true,
      inputTypes: ["USB-C PD3", "XT60", "DC5521"], inputVoltage: "USB-C 9-20V; XT60/DC 6-26V", requiresExternalPsu: false, recommendedPsuW: 40, maxChargeCurrentA: 1.3, minChargeCurrentA: 0.3, targetVoltagesV: [3.8, 3.85, 4.2, 4.35], regular5VUsbSupported: false },
    { reliabilityConfidence: 9.5, storageFunction: 10, value: 9 }, ["reliable-1S", "storage", "field"]),
  charger("betafpv-hexacharger-pro", "BETAFPV HexaCharger Pro", "BETAFPV", 13, "CORE_VALUE", "CORE_VALUE", "ENABLED", 29.99,
    { supportedCells: [1], supportedChemistries: ["LiPo", "LiHV"], channels: 6, independentChannels: true, independentPerChannelSettings: false,
      nativeConnectors: ["BT2.0", "PH2.0"], acceptedBatteryConnectors: ["BT2.0", "A30", "PH2.0", "NX69"], connectorRules: ["A30 is accepted through BT2.0", "NX69 via PH2.0 port is an explicitly tested exception, not a global NX69=PH2 rule"], storageSupport: true, dischargeSupport: true,
      inputTypes: ["USB-C PD3"], requiresExternalPsu: false, recommendedPsuW: 100, maxChargePowerW: 78, maxChargeCurrentA: 3, minChargeCurrentA: 0.5, targetVoltagesV: [4.2, 4.35] },
    { beginner: 9, value: 9.8, storageFunction: 9.5, chargingSpeedPotential: 10 }, ["value-smart-1S", "USB-C-desk"]),
  charger("betafpv-6port-basic-1s-charger", "BETAFPV 6-Port 1S Battery Charger", "BETAFPV", 13, "CORE_ULTRABUDGET", "CORE_VALUE", "ENABLED", 11.99,
    { supportedCells: [1], supportedChemistries: ["LiPo", "LiHV"], channels: 6, independentChannels: true, nativeConnectors: ["BT2.0", "PH2.0"], acceptedBatteryConnectors: ["BT2.0", "PH2.0"], storageSupport: false, dischargeSupport: false, inputTypes: ["USB-C 5-12V"], requiresExternalPsu: false, maxChargeCurrentA: 1 },
    { value: 10, storageFunction: 0 }, ["absolute-budget-1S"]),
  charger("isdt-e625", "ISDT E625", "ISDT", 13, "CONDITIONAL_UI_VALUE", "CONDITIONAL", "CATALOG_ONLY", null,
    { supportedCells: [1], supportedChemistries: ["LiPo", "LiHV"], channels: 6, independentChannels: true, nativeConnectors: ["BT2.0", "PH2.0"], acceptedBatteryConnectors: ["BT2.0", "PH2.0"], storageSupport: true, dischargeSupport: true, inputTypes: ["USB-C PD", "XT60"], inputVoltage: "8-30V", requiresExternalPsu: false },
    { value: 8 }, ["conditional-ui-value"], undefined, "Exact current price/QC evidence gated."),
  charger("vifly-1s-series-charging-board-bt2-ph2", "VIFLY 1S Series Charging Board", "VIFLY", 13, "ADVANCED_ACCESSORY", "CORE_SPECIALIST", "CATALOG_ONLY", null,
    { supportedCells: [1], supportedChemistries: ["LiPo", "LiHV"], channels: 6, nativeConnectors: ["BT2.0", "PH2.0"], acceptedBatteryConnectors: ["BT2.0", "PH2.0"], storageSupport: false, inputTypes: ["EXTERNAL_HOBBY_CHARGER"], requiresExternalPsu: true },
    { advanced: 9 }, ["series-board", "advanced-only"], undefined, "Accessory, not a complete charger."),

  charger("skyrc-b6neo-2", "SkyRC B6neo 2", "SkyRC", 14, "CORE_BUDGET_PORTABLE", "CORE_VALUE", "CATALOG_ONLY", null,
    multiCellProfile([1,2,3,4,5,6], 1, ["XT60 DC", "USB-C PD"], false, { inputVoltage: "DC 7-28V; USB-C PD 12-20V", maxChargePowerW: 300, maxChargeCurrentA: 15, minChargeCurrentA: 0.2 }),
    { value: 10, portability: 10, racing: 9, storageFunction: 10 }, ["budget-6S", "portable"], 82, "Observed ~US$40–42; range preserved."),
  charger("isdt-608ac", "ISDT 608AC", "ISDT", 14, "CORE_BEGINNER", "CORE", "ENABLED", 84.49,
    multiCellProfile([1,2,3,4,5,6], 1, ["AC", "DC"], false, { inputVoltage: "AC 100-240V; DC 10-30V", maxChargePowerW: 200, maxChargeCurrentA: 8 }),
    { beginner: 10, homeConvenience: 9, value: 8.5 }, ["beginner-AC", "6S-allround"], 350),
  charger("hota-d6-pro", "HOTA D6 Pro", "HOTA", 14, "CORE_RELIABLE", "CORE", "ENABLED", 149.99,
    multiCellProfile([1,2,3,4,5,6], 2, ["AC", "DC"], false, { inputVoltage: "AC 100-240V; DC per current spec", maxChargePowerW: 650, maxChargeCurrentA: 15 }),
    { beginner: 9.5, reliabilityConfidence: 10, dualBatteryConvenience: 10, racing: 9.8 }, ["reliable-allround", "dual-pack", "home-and-field"], 555),
  charger("toolkitrc-m6dac-v2", "ToolkitRC M6DAC V2", "ToolkitRC", 14, "CORE_MODERN_DUAL", "CORE_VALUE", "CATALOG_ONLY", null,
    multiCellProfile([1,2,3,4,5,6], 2, ["AC", "DC"], false, { inputVoltage: "AC 100-240V; DC 7-28V", maxChargePowerW: 800, maxChargeCurrentA: 16 }),
    { value: 10, dualBatteryConvenience: 10, racing: 9.7 }, ["modern-dual-value", "USB-C-power-user"], 570, "Official ~US$99.99–100.99; range preserved."),
  charger("hota-s6", "HOTA S6", "HOTA", 14, "CORE_HOME_POWER", "CORE_PREMIUM", "ENABLED", 169.99,
    multiCellProfile([1,2,3,4,5,6], 2, ["AC", "DC"], false, { inputVoltage: "AC 100-240V; DC 10.5-30V", maxChargePowerW: 650, maxChargeCurrentA: 15 }),
    { homeConvenience: 10, racing: 10, dualBatteryConvenience: 10 }, ["high-throughput-home", "racing-pit"], 800),
  charger("toolkitrc-q6ac", "ToolkitRC Q6AC", "ToolkitRC", 14, "CORE_QUAD_PREMIUM", "CORE_PREMIUM", "CATALOG_ONLY", null,
    multiCellProfile([1,2,3,4,5,6], 4, ["AC", "DC"], false, { inputVoltage: "AC 100-240V; DC 7-30V", maxChargePowerW: 1000 }),
    { multiBatteryConvenience: 10 }, ["quad-channel-premium"], 1150, "Official US$199.99–200.99; exact balance-current source conflict intentionally not flattened."),
  charger("skyrc-q200neo", "SkyRC Q200neo", "SkyRC", 14, "CORE_QUAD_VALUE", "CORE_VALUE", "CATALOG_ONLY", null,
    multiCellProfile([1,2,3,4,5,6], 4, ["AC", "DC"], false, { inputVoltage: "AC 100-240V; DC 10-30V", maxChargePowerW: 400, maxChargeCurrentA: 10 }),
    { multiBatteryConvenience: 10, value: 9 }, ["quad-channel-value"], 680, "AliExpress reference price was variable; no false exact price stored."),
  charger("toolkitrc-m6d", "ToolkitRC M6D", "ToolkitRC", 14, "CORE_PORTABLE_DUAL", "CORE_SPECIALIST", "ENABLED", 69.99,
    multiCellProfile([1,2,3,4,5,6], 2, ["DC only"], true, { inputVoltage: "7-28V", maxChargePowerW: 500, maxChargeCurrentA: 15 }),
    { value: 10, portability: 10, dualBatteryConvenience: 10, racing: 10 }, ["portable-dual", "field", "existing-PSU-owner"], 220),
  charger("hota-t6", "HOTA T6", "HOTA", 14, "CORE_PORTABLE_SINGLE", "CORE_VALUE", "ENABLED", 47.99,
    multiCellProfile([1,2,3,4,5,6], 1, ["XT60 DC", "USB-C PD"], false, { inputVoltage: "DC 10-30V", maxChargePowerW: 300, maxChargeCurrentA: 15 }),
    { value: 9.3, portability: 10, racing: 9 }, ["travel", "USB-C-field", "single-channel-6S"], 93),
  charger("isdt-q8-max", "ISDT Q8 Max", "ISDT", 14, "CORE_HIGH_POWER_DC", "CORE_SPECIALIST", "ENABLED", 128.99,
    multiCellProfile([1,2,3,4,5,6,7,8], 1, ["DC only"], true, { inputVoltage: "10-34V", maxChargePowerW: 1000, maxChargeCurrentA: 30, connectorRules: ["LiHV is limited to 1-7S; LiPo/LiFe/LiIon support extends to 8S", "XT30 packs require XT60-to-XT30 lead"] }),
    { highPower: 10, valueForAdvanced: 9.5 }, ["advanced-high-power", "large-batteries", "parallel-charging"], 290),
  charger("skyrc-d200neo", "SkyRC D200neo", "SkyRC", 14, "CONDITIONAL_MODERN_DUAL", "CONDITIONAL", "CATALOG_ONLY", null,
    multiCellProfile([1,2,3,4,5,6], 2, ["AC", "DC"], false, { inputVoltage: "AC 100-240V; DC 10-30V", maxChargePowerW: 800 }),
    { highPower: 10 }, ["conditional-dual"], undefined, "Enable only with exact authentic competitive price."),
  charger("toolkitrc-m4-pocket", "ToolkitRC M4 Pocket", "ToolkitRC", 14, "DO_NOT_USE_FOR_6S", "DO_NOT_DEFAULT", "CATALOG_ONLY", 29.99,
    multiCellProfile([1,2,3,4], 1, ["XT60 DC", "USB-C PD"], false), { portability: 10 }, ["1S-4S-only"]),
];
