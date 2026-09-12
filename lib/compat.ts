import {
  Product,
  UserPreferences,
  FlightStyle,
  CompatibilityState,
  Warning,
  AircraftSizeClass,
  VideoSystem,
  ControlProtocol,
} from "@/lib/schema";
import { getCuratedComponentRecord } from "@/data/curated-components";
import type { BatteryProfile, ChargerProfile, FpvVideoUnit } from "@/lib/component-catalog-schema";

// ---------- Generic size-class capacity guardrails (fallback) ----------

const SIZE_CAPACITY_FALLBACK: Record<AircraftSizeClass, { min: number; max: number }> = {
  WHOOP_65_1S: { min: 250, max: 380 },
  WHOOP_75_1S: { min: 400, max: 700 },
  WHOOP_75_85_2S: { min: 400, max: 700 },
  MICRO_2: { min: 300, max: 550 },
  MICRO_2_5: { min: 450, max: 1100 },
  MICRO_3: { min: 500, max: 1200 },
  MICRO_3_5: { min: 650, max: 1300 },
  CINE_2: { min: 300, max: 850 },
  CINE_2_5: { min: 450, max: 1200 },
  CINE_3: { min: 500, max: 1200 },
  CINE_3_5: { min: 850, max: 1800 },
  FREESTYLE_5: { min: 900, max: 2200 },
  RACE_5: { min: 900, max: 1700 },
  LONG_RANGE_4: { min: 600, max: 3500 },
  LONG_RANGE_7: { min: 2200, max: 10000 },
  PRO_SPEC_7: { min: 1000, max: 2200 },
};

// ---------- Spec parsing ----------

export function extractFirstNumber(value: string | undefined): number | null {
  if (!value) return null;
  const match = value.match(/([0-9]*\.?[0-9]+)/);
  if (!match) return null;
  const n = parseFloat(match[1]);
  return Number.isFinite(n) ? n : null;
}

export function parseCapacityMah(value: string | undefined): number | null {
  return extractFirstNumber(value);
}

export function parseWeightG(value: string | undefined): number | null {
  return extractFirstNumber(value);
}

export function parseCellCount(value: string | undefined): number | null {
  if (!value) return null;
  const match = value.match(/(\d+)\s*S/i);
  if (match) {
    const n = parseInt(match[1], 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function parseList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function cellRangeIncludes(supported: string, cell: string): boolean {
  const exact = supported.split(",").map((s) => s.trim());
  if (exact.includes(cell)) return true;
  const match = supported.match(/(\d+)S\s*-\s*(\d+)S/i);
  if (!match) return false;
  const min = parseInt(match[1], 10);
  const max = parseInt(match[2], 10);
  const cellNum = parseInt(cell.replace(/S$/i, ""), 10);
  return !Number.isNaN(cellNum) && cellNum >= min && cellNum <= max;
}

function normalizeProtocol(protocol: ControlProtocol | string): {
  family: string;
  band?: string;
} {
  const lower = protocol.toLowerCase();
  if (lower.includes("elrs")) {
    const band = lower.includes("2.4") ? "2.4" : lower.includes("900") ? "900" : lower.includes("dual") ? "DUAL" : undefined;
    return { family: "elrs", band };
  }
  if (lower.includes("gemini") || lower.includes("gemx")) {
    return { family: "gemini" };
  }
  return { family: lower };
}

function protocolBandsCompatible(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return true;
  if (a === "DUAL" || b === "DUAL") return true;
  return a === b;
}

function normalizeConnector(connector: string): string {
  const upper = connector.trim().toUpperCase().replace(/\s+/g, "");
  if (upper.startsWith("XT60")) return "XT60";
  if (upper.startsWith("XT30")) return "XT30";
  if (upper === "BT2" || upper === "BT2.0") return "BT2.0";
  if (upper === "PH2" || upper === "PH2.0") return "PH2.0";
  return upper;
}

// ---------- Video ----------

function inferDroneVideoUnit(drone: Product): FpvVideoUnit | undefined {
  const raw = (drone.aircraftProfile?.video.unit ?? "").toUpperCase().replace(/[\s-]+/g, "_");
  if (raw.includes("O3")) return "DJI_O3";
  if (raw.includes("O4") && raw.includes("PRO")) return "DJI_O4_PRO";
  if (raw.includes("O4") && raw.includes("WIDE")) return "DJI_O4_WIDE";
  if (raw.includes("O4")) return "DJI_O4";
  if (raw.includes("HDZERO") || raw.includes("HD_ZERO")) return "HDZERO";
  if (raw.includes("ANALOG")) return "ANALOG_5_8";

  const system = drone.aircraftProfile?.video.system ?? (drone.videoSystems.length === 1 ? drone.videoSystems[0] : undefined);
  if (system === "analog") return "ANALOG_5_8";
  if (system === "dji_o3") return "DJI_O3";
  if (system === "dji_o4") return "DJI_O4";
  if (system === "hdzero") return "HDZERO";
  return undefined;
}

export function videoSystemMatches(goggles: Product, drone: Product): boolean {
  const curatedGoggles = getCuratedComponentRecord(goggles.id)?.goggleProfile;
  const unit = inferDroneVideoUnit(drone);

  if (curatedGoggles && unit) {
    if (curatedGoggles.unsupportedVideoUnits?.includes(unit)) return false;
    return curatedGoggles.supportedVideoUnits.includes(unit);
  }

  const droneSystem: VideoSystem | undefined =
    drone.aircraftProfile?.video.system ??
    (drone.videoSystems.length === 1 ? drone.videoSystems[0] : undefined);

  if (!droneSystem) {
    return goggles.videoSystems.some((v) => drone.videoSystems.includes(v));
  }
  return goggles.videoSystems.includes(droneSystem);
}

// ---------- Radio ----------

export function protocolMatches(radio: Product, drone: Product): boolean {
  const droneProtocol: ControlProtocol | undefined =
    drone.aircraftProfile?.control.protocol ??
    (drone.protocols.length === 1 ? drone.protocols[0] : undefined);

  if (droneProtocol) {
    const d = normalizeProtocol(droneProtocol);
    return radio.protocols.some((p) => {
      const r = normalizeProtocol(p);
      if (d.family !== r.family) return false;
      if (d.family === "elrs") {
        return protocolBandsCompatible(d.band, r.band);
      }
      return true;
    });
  }

  return radio.protocols.some((p) => drone.protocols.includes(p));
}

// ---------- Battery / Drone ----------

function curatedBatteryProfile(battery: Product): BatteryProfile | undefined {
  return getCuratedComponentRecord(battery.id)?.batteryProfile;
}

function batteryChemistry(battery: Product): string {
  return curatedBatteryProfile(battery)?.chemistry ?? battery.keySpecs?.chemistry ?? "";
}

function batteryCells(battery: Product): number | null {
  return curatedBatteryProfile(battery)?.cells ?? parseCellCount(battery.keySpecs?.cells);
}

function batteryConnector(battery: Product): string {
  return curatedBatteryProfile(battery)?.connector ?? parseList(battery.keySpecs?.connector)[0] ?? "";
}

function batteryChemistrySupportedByDrone(battery: Product, drone: Product): boolean {
  const allowed = drone.aircraftProfile?.battery.chemistriesAllowed;
  const chemistry = batteryChemistry(battery).toLowerCase();
  if (allowed && allowed.length > 0) {
    return !!chemistry && allowed.some((c) => c.toLowerCase() === chemistry);
  }
  const droneChemistry = parseList(drone.keySpecs?.chemistry).map((s) => s.toLowerCase());
  return droneChemistry.length > 0 && !!chemistry && droneChemistry.includes(chemistry);
}

function batteryCellsSupportedByDrone(battery: Product, drone: Product): boolean {
  const allowed = drone.aircraftProfile?.battery.cellsAllowed;
  const cells = batteryCells(battery);
  if (allowed && allowed.length > 0) {
    return cells !== null && allowed.includes(cells);
  }
  const droneCells = drone.keySpecs?.cells ?? "";
  const batteryCellsStr = battery.keySpecs?.cells ?? "";
  return droneCells.toLowerCase() === batteryCellsStr.toLowerCase();
}

function batteryConnectorSupportedByDrone(battery: Product, drone: Product): boolean {
  const allowedConnector = drone.aircraftProfile?.battery.connector;
  const profile = curatedBatteryProfile(battery);
  const connector = batteryConnector(battery);

  if (allowedConnector) {
    if (normalizeConnector(connector) === normalizeConnector(allowedConnector)) return true;
    return (profile?.connectorCompatibility ?? []).some(
      (candidate) => normalizeConnector(candidate) === normalizeConnector(allowedConnector)
    );
  }

  const droneConnectors = parseList(drone.keySpecs?.connector).map(normalizeConnector);
  if (droneConnectors.includes(normalizeConnector(connector))) return true;
  return (profile?.connectorCompatibility ?? []).some((candidate) => droneConnectors.includes(normalizeConnector(candidate)));
}

export function getBatteryCapacityMah(battery: Product): number | null {
  return curatedBatteryProfile(battery)?.capacityMah ?? parseCapacityMah(battery.keySpecs?.capacity ?? battery.subcategory);
}

function getBatteryWeightG(battery: Product): number | null {
  return curatedBatteryProfile(battery)?.weightG ?? battery.weightG ?? parseWeightG(battery.keySpecs?.weight);
}

function getDroneCapacityRange(drone: Product): { min: number; max: number; idealMin: number; idealMax: number } | null {
  if (drone.aircraftProfile?.battery.capacityMah) {
    return drone.aircraftProfile.battery.capacityMah;
  }
  const sizeClass = drone.aircraftProfile?.sizeClass;
  if (sizeClass) {
    return { ...SIZE_CAPACITY_FALLBACK[sizeClass], idealMin: 0, idealMax: 0 };
  }
  return null;
}

type BatteryMatchResult = {
  state: CompatibilityState;
  warnings: Warning[];
};

export function batteryMatchesDrone(battery: Product, drone: Product): BatteryMatchResult {
  const warnings: Warning[] = [];

  if (!batteryCellsSupportedByDrone(battery, drone)) return { state: "HARD_INVALID", warnings };
  if (!batteryChemistrySupportedByDrone(battery, drone)) return { state: "HARD_INVALID", warnings };
  if (!batteryConnectorSupportedByDrone(battery, drone)) return { state: "HARD_INVALID", warnings };

  const capacity = getBatteryCapacityMah(battery);
  const range = getDroneCapacityRange(drone);

  if (capacity !== null && range) {
    if (capacity < range.min || capacity > range.max) {
      return {
        state: "HARD_INVALID",
        warnings: [{ type: "BATTERY_OUTSIDE_RECOMMENDED_RANGE", messageKey: "warnings.batteryOutsideRecommendedRange" }],
      };
    }
    if (capacity < range.idealMin || capacity > range.idealMax) {
      warnings.push({ type: "BATTERY_OUTSIDE_RECOMMENDED_RANGE", messageKey: "warnings.batteryOutsideRecommendedRange" });
    } else if (capacity > range.idealMax * 0.9) {
      warnings.push({ type: "BATTERY_HEAVY", messageKey: "warnings.batteryHeavy" });
    }
  } else if (capacity === null) {
    warnings.push({ type: "PHYSICAL_FIT", messageKey: "warnings.physicalFit" });
  }

  const batteryWeight = getBatteryWeightG(battery);
  const maxBatteryWeight = drone.aircraftProfile?.battery.maxBatteryWeightG;
  if (batteryWeight !== null && maxBatteryWeight !== undefined && maxBatteryWeight > 0) {
    if (batteryWeight > maxBatteryWeight) {
      return { state: "HARD_INVALID", warnings: [{ type: "BATTERY_HEAVY", messageKey: "warnings.batteryHeavy" }] };
    }
    if (batteryWeight > maxBatteryWeight * 0.9) warnings.push({ type: "BATTERY_HEAVY", messageKey: "warnings.batteryHeavy" });
  }

  const maxVoltage = drone.aircraftProfile?.battery.maxFullVoltageV;
  if (maxVoltage !== undefined) {
    const profile = curatedBatteryProfile(battery);
    const cells = batteryCells(battery);
    const chemistry = batteryChemistry(battery).toLowerCase();
    const fullVoltage = profile?.maxChargeVoltageV ?? (cells && chemistry.includes("lihv") ? cells * 4.35 : undefined);
    if (fullVoltage !== undefined && fullVoltage > maxVoltage + 0.1) {
      return {
        state: "HARD_INVALID",
        warnings: [{ type: "LIHV_VOLTAGE", messageKey: "warnings.lihvVoltage", params: { voltage: fullVoltage.toFixed(1) } }],
      };
    }
  }

  if (warnings.length > 0) {
    return { state: warnings.some((w) => w.type === "BATTERY_OUTSIDE_RECOMMENDED_RANGE") ? "SOFT_PENALTY" : "VALID_WITH_WARNING", warnings };
  }
  return { state: "VALID", warnings };
}

// ---------- Charger ----------

function curatedChargerProfile(charger: Product): ChargerProfile | undefined {
  return getCuratedComponentRecord(charger.id)?.chargerProfile;
}

function chemistrySupported(charger: Product, battery: Product): boolean {
  const profile = curatedChargerProfile(charger);
  const chemistry = batteryChemistry(battery).toLowerCase();
  if (profile) return profile.supportedChemistries.some((value) => value.toLowerCase() === chemistry);
  const chargerChemistry = parseList(charger.keySpecs?.chemistry).map((s) => s.toLowerCase());
  return chargerChemistry.length > 0 && !!chemistry && chargerChemistry.includes(chemistry);
}

function chargerCellsSupported(charger: Product, battery: Product): boolean {
  const profile = curatedChargerProfile(charger);
  const cells = batteryCells(battery);
  if (profile) return cells !== null && profile.supportedCells.includes(cells);
  const supportedCells = charger.keySpecs?.supportedCells ?? "";
  const batteryCellsStr = battery.keySpecs?.cells ?? "";
  return !!supportedCells && !!batteryCellsStr && cellRangeIncludes(supportedCells, batteryCellsStr);
}

function connectorSupported(charger: Product, battery: Product): boolean {
  const profile = curatedChargerProfile(charger);
  const connector = normalizeConnector(batteryConnector(battery));
  if (profile) return profile.acceptedBatteryConnectors.some((accepted) => normalizeConnector(accepted) === connector);
  const chargerConnectors = parseList(charger.keySpecs?.connector).map(normalizeConnector);
  if (chargerConnectors.length === 0 || !connector) return true;
  return chargerConnectors.includes(connector);
}

function chargerNeedsAdapter(charger: Product, battery: Product): boolean {
  const profile = curatedChargerProfile(charger);
  if (!profile?.adapterRequiredFor?.length) return false;
  const connector = normalizeConnector(batteryConnector(battery));
  return profile.adapterRequiredFor.some((candidate) => normalizeConnector(candidate) === connector);
}

export function chargerMatchesBattery(charger: Product, battery: Product): BatteryMatchResult {
  const warnings: Warning[] = [];
  if (!chargerCellsSupported(charger, battery) || !chemistrySupported(charger, battery) || !connectorSupported(charger, battery)) {
    return { state: "HARD_INVALID", warnings };
  }

  if (charger.requiresPsu || curatedChargerProfile(charger)?.requiresExternalPsu) {
    warnings.push({ type: "REQUIRES_PSU", messageKey: "warnings.requiresPsu" });
    return { state: "INCOMPLETE_KIT", warnings };
  }

  if (chargerNeedsAdapter(charger, battery)) return { state: "INCOMPLETE_KIT", warnings };
  return { state: "VALID", warnings };
}

// ---------- Style coherence ----------

export function flightStyleMatches(drone: Product, style: FlightStyle): boolean {
  const recommended = drone.recommendedStyles ?? drone.flightStyles;
  if (recommended.includes(style)) return true;
  return drone.flightStyles.includes(style);
}

export function styleIsRecommended(drone: Product, style: FlightStyle): boolean {
  if (drone.recommendedStyles && drone.recommendedStyles.length > 0) return drone.recommendedStyles.includes(style);
  return drone.flightStyles.includes(style);
}

// ---------- Video recommendation ----------

export function videoSystemIsRecommended(preferences: UserPreferences): VideoSystem {
  if (preferences.videoSystem !== "recommend") return preferences.videoSystem;
  if (preferences.style === "racing" && preferences.experience !== "beginner") return "hdzero";
  if (preferences.budget >= 550 && preferences.experience !== "advanced") return "dji_o4";
  return "analog";
}

// ---------- Bundle validation (legacy API) ----------

export type ValidationError =
  | { kind: "video"; goggles: Product; drone: Product }
  | { kind: "protocol"; radio: Product; drone: Product }
  | { kind: "battery"; battery: Product; drone: Product }
  | { kind: "charger"; charger: Product; battery: Product };

export function validateBundle(
  goggles: Product,
  drone: Product,
  radio: Product,
  charger: Product,
  battery: Product
): ValidationError | null {
  if (!videoSystemMatches(goggles, drone)) return { kind: "video", goggles, drone };
  if (!protocolMatches(radio, drone)) return { kind: "protocol", radio, drone };
  if (batteryMatchesDrone(battery, drone).state === "HARD_INVALID") return { kind: "battery", battery, drone };
  if (chargerMatchesBattery(charger, battery).state === "HARD_INVALID") return { kind: "charger", charger, battery };
  return null;
}
