import { AircraftProfile, Product } from "@/lib/schema";

export type ProductOverride = Partial<Product> & {
  aircraftProfile?: AircraftProfile;
};

export const PRODUCT_OVERRIDES: Record<string, ProductOverride> = {
  // --- Tinywhoop 65mm analog ---
  "drone-betafpv-cetus-pro": {
    weightG: 35,
    state: "CORE",
    compatibleStyles: ["tinywhoop"],
    recommendedStyles: ["tinywhoop"],
    aircraftProfile: {
      sizeClass: "WHOOP_65_1S",
      flightRoles: ["beginner", "indoor"],
      video: { system: "analog" },
      control: { protocol: "frsky" },
      battery: {
        cellsAllowed: [1],
        chemistriesAllowed: ["LiPo", "LiHV"],
        capacityMah: { min: 250, idealMin: 280, idealMax: 500, max: 500 },
        maxBatteryWeightG: 20,
        connector: "BT2.0",
      },
      prop: { diameterIn: 1.6, diameterMm: 40, shaftMm: 1 },
      recovery: { gpsIncluded: false, selfPoweredBuzzerIncluded: false },
    },
  },

  // --- Tinywhoop 65mm DJI O4 ---
  "drone-betafpv-meteor65-pro-o4": {
    weightG: 28,
    state: "CORE",
    compatibleStyles: ["tinywhoop"],
    recommendedStyles: ["tinywhoop"],
    aircraftProfile: {
      sizeClass: "WHOOP_65_1S",
      flightRoles: ["beginner", "indoor", "hd-tinywhoop"],
      video: { system: "dji_o4" },
      control: { protocol: "elrs_2.4", band: "2.4GHz" },
      battery: {
        cellsAllowed: [1],
        chemistriesAllowed: ["LiPo", "LiHV"],
        capacityMah: { min: 250, idealMin: 280, idealMax: 500, max: 500 },
        maxBatteryWeightG: 18,
        connector: "BT2.0",
      },
      prop: { diameterIn: 1.6, diameterMm: 40, shaftMm: 1 },
      recovery: { gpsIncluded: false, selfPoweredBuzzerIncluded: false },
    },
  },

  // --- 5" Freestyle analog ---
  "drone-iflight-nazgul5-v3": {
    weightG: 435,
    state: "CORE",
    compatibleStyles: ["freestyle", "cinematic"],
    recommendedStyles: ["freestyle"],
    aircraftProfile: {
      sizeClass: "FREESTYLE_5",
      flightRoles: ["freestyle", "acro", "park"],
      video: { system: "analog" },
      control: { protocol: "elrs_2.4", band: "2.4GHz" },
      battery: {
        cellsAllowed: [6],
        chemistriesAllowed: ["LiPo"],
        capacityMah: { min: 1050, idealMin: 1300, idealMax: 1550, max: 1800 },
        maxBatteryWeightG: 280,
        connector: "XT60",
      },
      prop: { diameterIn: 5, shaftMm: 5, mount: "T-mount" },
      recovery: { gpsIncluded: false, selfPoweredBuzzerIncluded: false },
    },
  },

  // --- 5" Racing analog ---
  "drone-iflight-mach-r5-sport": {
    weightG: 320,
    state: "CONDITIONAL",
    compatibleStyles: ["racing", "freestyle"],
    recommendedStyles: ["racing"],
    aircraftProfile: {
      sizeClass: "RACE_5",
      flightRoles: ["racing", "track"],
      video: { system: "analog" },
      control: { protocol: "elrs_2.4", band: "2.4GHz" },
      battery: {
        cellsAllowed: [6],
        chemistriesAllowed: ["LiPo"],
        capacityMah: { min: 1050, idealMin: 1100, idealMax: 1400, max: 1600 },
        maxBatteryWeightG: 240,
        connector: "XT60",
      },
      prop: { diameterIn: 5, shaftMm: 5, mount: "T-mount" },
      recovery: { gpsIncluded: false, selfPoweredBuzzerIncluded: false },
    },
  },

  // --- 3.5" CineWhoop analog ---
  "drone-geprc-cinelog35-v2": {
    weightG: 263,
    state: "CORE",
    compatibleStyles: ["cinematic", "freestyle"],
    recommendedStyles: ["cinematic"],
    aircraftProfile: {
      sizeClass: "CINE_3_5",
      flightRoles: ["cinematic", "indoor", "outdoor-cine"],
      video: { system: "analog" },
      control: { protocol: "elrs_2.4", band: "2.4GHz" },
      battery: {
        cellsAllowed: [6],
        chemistriesAllowed: ["LiPo"],
        capacityMah: { min: 1100, idealMin: 1100, idealMax: 1300, max: 1300 },
        maxBatteryWeightG: 230,
        connector: "XT60",
      },
      prop: { diameterIn: 3.5, shaftMm: 5 },
      recovery: { gpsIncluded: false, selfPoweredBuzzerIncluded: false },
    },
  },

  // --- 7.5" Long Range analog ---
  "drone-iflight-chimera7-pro-v2": {
    weightG: 705,
    state: "CORE",
    compatibleStyles: ["longRange", "cinematic"],
    recommendedStyles: ["longRange"],
    aircraftProfile: {
      sizeClass: "LONG_RANGE_7",
      flightRoles: ["long-range", "exploration", "cruise"],
      video: { system: "analog" },
      control: { protocol: "elrs_2.4", band: "2.4GHz" },
      battery: {
        cellsAllowed: [6],
        chemistriesAllowed: ["LiPo", "LiIon"],
        capacityMah: { min: 2200, idealMin: 3300, idealMax: 8000, max: 10000 },
        maxBatteryWeightG: 900,
        connector: "XT60",
      },
      prop: { diameterIn: 7, shaftMm: 5 },
      recovery: { gpsIncluded: true, selfPoweredBuzzerIncluded: false },
    },
  },

  // --- 3.5" CineWhoop DJI O4 ---
  "drone-geprc-cinelog35-v3-o4": {
    weightG: 245,
    state: "CORE",
    compatibleStyles: ["cinematic", "freestyle"],
    recommendedStyles: ["cinematic"],
    aircraftProfile: {
      sizeClass: "CINE_3_5",
      flightRoles: ["cinematic", "indoor", "outdoor-cine"],
      video: { system: "dji_o4" },
      control: { protocol: "elrs_2.4", band: "2.4GHz" },
      battery: {
        cellsAllowed: [6],
        chemistriesAllowed: ["LiPo"],
        capacityMah: { min: 1100, idealMin: 1100, idealMax: 1300, max: 1300 },
        maxBatteryWeightG: 250,
        connector: "XT60",
      },
      prop: { diameterIn: 3.5, shaftMm: 5 },
      recovery: { gpsIncluded: false, selfPoweredBuzzerIncluded: false },
    },
  },

  // --- 7.5" Long Range DJI O4 ---
  "drone-iflight-chimera7-pro-v2-o4": {
    weightG: 760,
    state: "CORE",
    compatibleStyles: ["longRange", "cinematic"],
    recommendedStyles: ["longRange"],
    aircraftProfile: {
      sizeClass: "LONG_RANGE_7",
      flightRoles: ["long-range-hd", "exploration"],
      video: { system: "dji_o4" },
      control: { protocol: "elrs_2.4", band: "2.4GHz" },
      battery: {
        cellsAllowed: [6],
        chemistriesAllowed: ["LiPo", "LiIon"],
        capacityMah: { min: 2200, idealMin: 3300, idealMax: 8000, max: 10000 },
        maxBatteryWeightG: 950,
        connector: "XT60",
      },
      prop: { diameterIn: 7, shaftMm: 5 },
      recovery: { gpsIncluded: true, selfPoweredBuzzerIncluded: false },
    },
  },

  // --- 5" Freestyle DJI O4 ---
  "drone-geprc-mark5-o4": {
    weightG: 410,
    state: "CORE",
    compatibleStyles: ["freestyle", "racing", "cinematic"],
    recommendedStyles: ["freestyle"],
    aircraftProfile: {
      sizeClass: "FREESTYLE_5",
      flightRoles: ["freestyle-hd", "acro"],
      video: { system: "dji_o4" },
      control: { protocol: "elrs_2.4", band: "2.4GHz" },
      battery: {
        cellsAllowed: [6],
        chemistriesAllowed: ["LiPo"],
        capacityMah: { min: 1050, idealMin: 1300, idealMax: 1550, max: 1800 },
        maxBatteryWeightG: 280,
        connector: "XT60",
      },
      prop: { diameterIn: 5, shaftMm: 5, mount: "T-mount" },
      recovery: { gpsIncluded: false, selfPoweredBuzzerIncluded: false },
    },
  },

  // --- 5" Racing DJI O4 ---
  "drone-geprc-vapor-d5-o4": {
    weightG: 428,
    state: "CORE",
    compatibleStyles: ["racing", "freestyle"],
    recommendedStyles: ["racing"],
    aircraftProfile: {
      sizeClass: "RACE_5",
      flightRoles: ["racing-hd", "track"],
      video: { system: "dji_o4" },
      control: { protocol: "elrs_2.4", band: "2.4GHz" },
      battery: {
        cellsAllowed: [6],
        chemistriesAllowed: ["LiPo"],
        capacityMah: { min: 1050, idealMin: 1100, idealMax: 1400, max: 1600 },
        maxBatteryWeightG: 250,
        connector: "XT60",
      },
      prop: { diameterIn: 5, shaftMm: 5, mount: "T-mount" },
      recovery: { gpsIncluded: false, selfPoweredBuzzerIncluded: false },
    },
  },

  // --- 1S tinywhoop battery ---
  "battery-gnb-1s-530": {
    weightG: 12.7,
    state: "CORE",
  },

  // --- 6S 1300 freestyle/racing battery ---
  "battery-ovonic-6s-1300": {
    weightG: 222,
    state: "CORE",
  },

  // --- 6S 3300 long-range battery ---
  "battery-iflight-fullsend-6s-3300": {
    weightG: 442,
    state: "CORE",
  },

  // --- Chargers ---
  "charger-toolkitrc-m6d": {
    requiresPsu: true,
    state: "CORE",
  },

  // --- Goggles ---
  "goggles-dji-n3": {
    state: "CORE",
    videoSystems: ["dji_o4"],
  },
  "goggles-dji-goggles-3": {
    state: "CORE_PREMIUM",
    videoSystems: ["dji_o3", "dji_o4"],
  },
  "goggles-eachine-ev800d": {
    state: "CORE_VALUE",
  },
  "goggles-betafpv-vr04": {
    state: "CORE_VALUE",
  },
  "goggles-skyzone-cobra-x": {
    state: "CORE",
  },
  "goggles-skyzone-sky04x": {
    state: "CORE_PREMIUM",
  },

  // --- Radios ---
  "radio-radiomaster-pocket": {
    state: "CORE_VALUE",
  },
  "radio-radiomaster-zorro": {
    state: "CORE",
  },
  "radio-radiomaster-boxer": {
    state: "CORE",
  },
  "radio-radiomaster-tx16s": {
    state: "CORE_PREMIUM",
  },

  // --- Other chargers ---
  "charger-vifly-whoopstor-v3": {
    state: "CORE",
  },
  "charger-hota-t6": {
    state: "CORE",
  },
  "charger-hota-d6-pro": {
    state: "CORE_PREMIUM",
  },
};
