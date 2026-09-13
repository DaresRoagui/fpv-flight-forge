import { CURATED_RECOMMENDER_DRONES } from "@/data/curated-drones";
import { ParsedCuratedDroneRecord } from "@/lib/catalog-schema";
import { FlightStyle, Product } from "@/lib/schema";

const SOURCE_WEIGHT_G: Record<string, number> = {
  "betafpv-air65-ii-freestyle": 17.8,
  "betafpv-air65-ii-racing": 17.7,
  "betafpv-air65-ii-champion": 16.6,
  "betafpv-meteor75-pro-analog": 30.5,
};

function recommendedStyles(record: ParsedCuratedDroneRecord): FlightStyle[] {
  if (record.sourceSegment === 1) {
    if (record.id.includes("racing") || record.id.includes("champion")) return ["tinywhoop", "racing"];
    return ["tinywhoop", "freestyle"];
  }
  if (record.sourceSegment === 2) return ["tinywhoop", "freestyle"];
  if (record.sourceSegment === 5 || record.sourceSegment === 6) {
    if (record.id.includes("vapor-d5")) return ["freestyle", "cinematic"];
    return ["freestyle"];
  }
  if (record.sourceSegment === 7) return ["racing"];
  if (record.sourceSegment === 8) return ["cinematic"];
  if (record.sourceSegment === 9) return ["longRange"];
  return record.flightStyles;
}

function score(record: ParsedCuratedDroneRecord, key: string): number | undefined {
  const scores = record.fitScores ?? {};
  const direct = scores[key];
  if (direct !== undefined) return direct;
  const found = Object.entries(scores).find(([name]) => name.toLowerCase().includes(key.toLowerCase()));
  return found?.[1];
}

function connectorFamily(connector: string): string {
  const upper = connector.toUpperCase();
  if (upper.startsWith("XT60")) return "XT60";
  if (upper.startsWith("XT30")) return "XT30";
  return connector;
}

function toProduct(record: ParsedCuratedDroneRecord): Product {
  if (record.priceUsd === null || record.priceUsd === undefined || !record.aircraftProfile) {
    throw new Error(`Curated winner ${record.id} is missing price/profile and cannot enter runtime catalog`);
  }

  const weightG = record.dryWeightG ?? record.aircraftProfile.dryWeightG ?? SOURCE_WEIGHT_G[record.id];
  const ratingCandidates = [score(record, "performance"), score(record, "value"), score(record, "freestyle"), score(record, "racing"), score(record, "cinematic")]
    .filter((value): value is number => value !== undefined);
  const rating = ratingCandidates.length
    ? Math.round((ratingCandidates.reduce((sum, value) => sum + value, 0) / ratingCandidates.length) * 10) / 10
    : 8.5;
  const primaryRoles = record.primaryRoles ?? [];
  const installedConnector = record.aircraftProfile.battery.connector;
  const compatibilityConnector = connectorFamily(installedConnector);

  return {
    id: record.id,
    name: record.name,
    brand: record.brand,
    category: "drone",
    subcategory: record.videoSystems[0] ?? "curated",
    priceUsd: record.priceUsd,
    priceNote: record.priceNote,
    rating,
    videoSystems: record.videoSystems,
    protocols: record.protocols,
    flightStyles: record.flightStyles,
    compatibleStyles: record.flightStyles,
    recommendedStyles: recommendedStyles(record),
    experienceLevel: record.experienceLevel.length ? record.experienceLevel : ["intermediate"],
    state: record.state,
    repairabilityScore: score(record, "repairability"),
    partsAvailabilityScore: score(record, "parts") ?? score(record, "racePartsEcosystem"),
    weightG,
    aircraftProfile: {
      ...record.aircraftProfile,
      battery: {
        ...record.aircraftProfile.battery,
        connector: compatibilityConnector,
      },
      dryWeightG: record.aircraftProfile.dryWeightG ?? weightG,
    },
    compat: [],
    incompat: [],
    keySpecs: {
      sourceSegment: String(record.sourceSegment).padStart(2, "0"),
      sourceStatus: record.sourceStatus,
      videoUnit: record.videoUnit ?? record.aircraftProfile.video.unit ?? record.aircraftProfile.video.system,
      cells: record.aircraftProfile.battery.cellsAllowed.map((cells) => `${cells}S`).join(","),
      chemistry: record.aircraftProfile.battery.chemistriesAllowed.join(","),
      connector: installedConnector,
      connectorCompatibility: compatibilityConnector,
      batteryMah: `${record.aircraftProfile.battery.capacityMah.min}-${record.aircraftProfile.battery.capacityMah.max}mAh`,
      ...(record.raceClass ? { raceClass: record.raceClass } : {}),
      ...(weightG !== undefined ? { weight: `${weightG}g` } : {}),
    },
    description: `Curated 2026 FPV catalog product from research segment ${String(record.sourceSegment).padStart(2, "0")}.`,
    idealFor: primaryRoles.length ? primaryRoles : recommendedStyles(record),
    limitations: [...record.blockerReasons, ...record.sourceNotes],
    images: ["/images/drone.svg"],
    productUrl: record.sourceUrl,
    availability: record.availability,
    verifiedAt: record.verifiedAt,
    sources: [`Curated research segment ${String(record.sourceSegment).padStart(2, "0")}`, ...(record.sourceUrl ? [record.sourceUrl] : [])],
  };
}

export const CURATED_DRONE_PRODUCTS: Product[] = CURATED_RECOMMENDER_DRONES.map(toProduct);
