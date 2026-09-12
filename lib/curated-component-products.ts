import { CURATED_RECOMMENDER_COMPONENTS } from "@/data/curated-components";
import type { CuratedComponentRecord } from "@/lib/component-catalog-schema";
import type { Product } from "@/lib/schema";

const imageByCategory: Record<CuratedComponentRecord["category"], string> = {
  goggles: "/images/goggles.svg",
  radio: "/images/radio.svg",
  charger: "/images/charger.svg",
  battery: "/images/battery.svg",
};

function ratingFor(record: CuratedComponentRecord): number {
  const values = Object.values(record.fitScores ?? {}).filter((value) => Number.isFinite(value) && value > 0);
  if (values.length === 0) return 8.5;
  const sorted = [...values].sort((a, b) => b - a).slice(0, 5);
  return Math.round((sorted.reduce((sum, value) => sum + value, 0) / sorted.length) * 10) / 10;
}

function cellsLabel(cells: number[]): string {
  if (cells.length === 0) return "";
  const sorted = [...cells].sort((a, b) => a - b);
  const contiguous = sorted.every((value, index) => index === 0 || value === sorted[index - 1] + 1);
  if (contiguous && sorted.length > 2) return `${sorted[0]}S-${sorted[sorted.length - 1]}S`;
  return sorted.map((cell) => `${cell}S`).join(",");
}

function keySpecsFor(record: CuratedComponentRecord): Record<string, string> {
  const keySpecs: Record<string, string> = {
    sourceSegment: String(record.sourceSegment),
    sourceStatus: record.sourceStatus,
  };

  if (record.goggleProfile) {
    const p = record.goggleProfile;
    keySpecs.videoUnits = p.supportedVideoUnits.join(",");
    if (p.displayType) keySpecs.displayType = p.displayType;
    if (p.resolution) keySpecs.resolution = p.resolution;
    if (p.refreshHzMax !== undefined) keySpecs.refreshHz = String(p.refreshHzMax);
    if (p.fovDeg !== undefined) keySpecs.fov = `${p.fovDeg}°`;
    if (p.latencyProfiles?.length) {
      keySpecs.latencyProfiles = p.latencyProfiles
        .map((latency) => `${latency.videoUnit ?? "SYSTEM"}:${latency.mode ?? "NORMAL"}:${latency.minLatencyMs ?? latency.referenceLatencyMs ?? "range"}ms`)
        .join(";");
    }
  }

  if (record.radioProfile) {
    const p = record.radioProfile;
    keySpecs.protocol = p.internalProtocol;
    keySpecs.rfBands = p.rfBands.join(",");
    if (p.maxRfPowerMw !== undefined) keySpecs.maxRfPower = `${p.maxRfPowerMw}mW`;
    if (p.firmware) keySpecs.firmware = p.firmware;
    if (p.gimbals) keySpecs.gimbals = p.gimbals;
    if (p.batteryRequired?.length) keySpecs.battery = p.batteryRequired.join(" / ");
    keySpecs.batteryIncluded = p.batteryIncluded ? "yes" : "no";
    if (p.geminiX) keySpecs.geminiX = "yes";
  }

  if (record.chargerProfile) {
    const p = record.chargerProfile;
    keySpecs.supportedCells = cellsLabel(p.supportedCells);
    keySpecs.chemistry = p.supportedChemistries.join(",");
    keySpecs.connector = p.acceptedBatteryConnectors.join(",");
    keySpecs.nativeConnector = p.nativeConnectors.join(",");
    keySpecs.channels = String(p.channels);
    keySpecs.storage = p.storageSupport ? "yes" : "no";
    keySpecs.input = p.inputTypes.join(" / ");
    if (p.inputVoltage) keySpecs.inputVoltage = p.inputVoltage;
    if (p.adapterRequiredFor?.length) keySpecs.adapterRequiredFor = p.adapterRequiredFor.join(",");
  }

  if (record.batteryProfile) {
    const p = record.batteryProfile;
    keySpecs.cells = `${p.cells}S`;
    keySpecs.capacity = `${p.capacityMah}mAh`;
    keySpecs.connector = p.connector;
    keySpecs.chemistry = p.chemistry;
    if (p.cRating !== undefined) keySpecs.dischargeRate = `${p.cRating}C`;
    if (p.weightG !== undefined) keySpecs.weight = `${p.weightG}g`;
    if (p.maxChargeVoltageV !== undefined) keySpecs.maxChargeVoltage = `${p.maxChargeVoltageV}V`;
    if (p.balanceConnector) keySpecs.balanceConnector = p.balanceConnector;
    if (p.connectorCompatibility?.length) keySpecs.connectorCompatibility = p.connectorCompatibility.join(",");
  }

  if (record.weightG !== undefined && !keySpecs.weight) keySpecs.weight = `${record.weightG}g`;
  return keySpecs;
}

function toProduct(record: CuratedComponentRecord): Product {
  if (record.priceUsd === null) {
    throw new Error(`Curated runtime component ${record.id} has no exact price and cannot be enabled`);
  }

  return {
    id: record.id,
    name: record.name,
    brand: record.brand,
    category: record.category,
    subcategory: record.sourceStatus,
    priceUsd: record.priceUsd,
    rating: ratingFor(record),
    videoSystems: record.videoSystems,
    protocols: record.protocols,
    flightStyles: record.flightStyles,
    experienceLevel: record.experienceLevel,
    state: record.state,
    weightG: record.weightG ?? record.batteryProfile?.weightG,
    requiresPsu: record.chargerProfile?.requiresExternalPsu,
    requiresReceiverModule: record.goggleProfile?.receiverModuleRequired,
    compat: [],
    incompat: [],
    keySpecs: keySpecsFor(record),
    description: `Curated 2026 FPV ${record.category} from research segment ${record.sourceSegment}.`,
    idealFor: record.primaryRoles,
    limitations: [...(record.blockerReasons ?? []), ...(record.notes ?? [])],
    images: [imageByCategory[record.category]],
    productUrl: record.sourceUrl,
    availability: record.availability,
    verifiedAt: record.verifiedAt,
    sources: [`Curated research segment ${record.sourceSegment}`, ...(record.sourceUrl ? [record.sourceUrl] : [])],
  };
}

export const CURATED_COMPONENT_PRODUCTS: Product[] = CURATED_RECOMMENDER_COMPONENTS.map(toProduct);
