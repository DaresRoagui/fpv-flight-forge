import type {
  Availability,
  ControlProtocol,
  ExperienceLevel,
  FlightStyle,
  ProductCategory,
  ProductState,
  VideoSystem,
} from "@/lib/schema";

export type ComponentRecommendationStatus = "ENABLED" | "FALLBACK_ONLY" | "CATALOG_ONLY";
export type FpvVideoUnit = "ANALOG_5_8" | "DJI_O3" | "DJI_O4" | "DJI_O4_WIDE" | "DJI_O4_PRO" | "HDZERO";
export type BatteryChemistry = "LiPo" | "LiHV" | "LiFe" | "LiIon" | "NiMH" | "NiCd" | "Pb";

export type LatencyProfile = {
  videoUnit?: FpvVideoUnit;
  mode?: "NORMAL" | "RACING" | "ANALOG";
  minLatencyMs?: number;
  referenceLatencyMs?: number;
  sourceType: "MANUFACTURER" | "INDEPENDENT" | "COMMUNITY";
  note?: string;
};

export type GoggleProfile = {
  supportedVideoUnits: FpvVideoUnit[];
  unsupportedVideoUnits?: FpvVideoUnit[];
  builtInAnalogReceiver?: boolean;
  receiverModuleRequired?: boolean;
  o4RaceMode?: boolean;
  displayType?: string;
  displayCount?: number;
  resolution?: string;
  refreshHzMax?: number;
  fovDeg?: number;
  ipdAdjustment?: boolean;
  diopterAdjustment?: boolean;
  glassesFriendly?: boolean;
  latencyProfiles?: LatencyProfile[];
  requiresLatencyFixFirmware?: boolean;
  minimumRecommendedFirmwareBranch?: string;
};

export type RadioProfile = {
  internalProtocol: "ELRS" | "OTHER";
  rfBands: Array<"2.4GHz" | "900MHz">;
  selectableBands?: boolean;
  simultaneousBands?: boolean;
  gemini?: boolean;
  geminiX?: boolean;
  maxRfPowerMw?: number;
  firmware?: string;
  usbSimulator?: boolean;
  gimbals?: string;
  batteryRequired?: string[];
  batteryIncluded?: boolean;
  moduleBay?: string;
};

export type ChargerProfile = {
  supportedCells: number[];
  supportedChemistries: BatteryChemistry[];
  channels: number;
  independentChannels?: boolean;
  independentPerChannelSettings?: boolean;
  nativeConnectors: string[];
  acceptedBatteryConnectors: string[];
  connectorRules?: string[];
  balanceConnector?: string;
  storageSupport: boolean;
  dischargeSupport?: boolean;
  inputTypes: string[];
  inputVoltage?: string;
  requiresExternalPsu: boolean;
  recommendedPsuW?: number;
  maxChargePowerW?: number;
  maxChargeCurrentA?: number;
  minChargeCurrentA?: number;
  targetVoltagesV?: number[];
  regular5VUsbSupported?: boolean;
};

export type BatteryProfile = {
  cells: number;
  chemistry: BatteryChemistry;
  connector: string;
  capacityMah: number;
  weightG?: number;
  cRating?: number;
  maxChargeVoltageV?: number;
  balanceConnector?: string;
  exactTrayFitRequired?: boolean;
  connectorCompatibility?: string[];
  roles: string[];
};

export type CuratedComponentRecord = {
  id: string;
  name: string;
  brand: string;
  category: Exclude<ProductCategory, "drone">;
  sourceSegment: number;
  sourceStatus: string;
  state: ProductState;
  recommendationStatus: ComponentRecommendationStatus;
  priceUsd: number | null;
  priceNote?: string;
  availability: Availability;
  videoSystems: VideoSystem[];
  protocols: ControlProtocol[];
  flightStyles: FlightStyle[];
  experienceLevel: ExperienceLevel[];
  primaryRoles: string[];
  fitScores?: Record<string, number>;
  editorialScores?: boolean;
  weightG?: number;
  goggleProfile?: GoggleProfile;
  radioProfile?: RadioProfile;
  chargerProfile?: ChargerProfile;
  batteryProfile?: BatteryProfile;
  blockerReasons?: string[];
  notes?: string[];
  sourceUrl?: string;
  verifiedAt: string;
};
