import { CuratedDroneRecord } from "@/lib/catalog-schema";
import { AircraftProfile, Availability, ControlProtocol, ExperienceLevel, FlightStyle, ProductState, VideoSystem } from "@/lib/schema";

type BaseInput = {
  id: string;
  name: string;
  brand: string;
  sourceSegment: number;
  sourceStatus: string;
  priceUsd?: number | null;
  availability?: Availability;
  videoSystems?: VideoSystem[];
  protocols?: ControlProtocol[];
  flightStyles?: FlightStyle[];
  experienceLevel?: ExperienceLevel[];
  primaryRoles?: string[];
  blockerReasons?: string[];
  sourceUrl?: string;
  videoUnit?: string;
  dryWeightG?: number;
  aircraftProfile?: AircraftProfile;
  fitScores?: Record<string, number>;
};

function stateFromSource(sourceStatus: string): ProductState {
  const status = sourceStatus.toUpperCase();
  if (status.includes("LEGACY")) return "LEGACY";
  if (status.includes("WATCHLIST")) return "WATCHLIST";
  if (status.includes("DO_NOT") || status.includes("DO NOT")) return "DO_NOT_DEFAULT";
  if (status.includes("CONDITIONAL") || status.includes("VERIFY_STOCK") || status.includes("AVAILABILITY_CHECK")) return "CONDITIONAL";
  if (status.includes("PREMIUM")) return "CORE_PREMIUM";
  if (status.includes("VALUE") || status.includes("BUDGET")) return "CORE_VALUE";
  if (status.includes("SPECIALIST") || status.includes("COMPETITIVE") || status.includes("TRAINER")) return "CORE_SPECIALIST";
  return "CORE";
}

function base(input: BaseInput, recommendationStatus: CuratedDroneRecord["recommendationStatus"]): CuratedDroneRecord {
  return {
    id: input.id,
    name: input.name,
    brand: input.brand,
    sourceSegment: input.sourceSegment,
    sourceStatus: input.sourceStatus,
    state: stateFromSource(input.sourceStatus),
    recommendationStatus,
    priceUsd: input.priceUsd ?? null,
    availability: input.availability ?? "unknown",
    videoSystems: input.videoSystems ?? [],
    protocols: input.protocols ?? [],
    flightStyles: input.flightStyles ?? [],
    experienceLevel: input.experienceLevel ?? [],
    primaryRoles: input.primaryRoles ?? [],
    secondaryRoles: [],
    fitScores: input.fitScores ?? {},
    blockerReasons: input.blockerReasons ?? [],
    sourceNotes: [],
    currentGeneration: !input.sourceStatus.toUpperCase().includes("LEGACY"),
    videoUnit: input.videoUnit,
    dryWeightG: input.dryWeightG,
    verifiedAt: "2026-09-06",
    sourceUrl: input.sourceUrl,
    aircraftProfile: input.aircraftProfile,
  };
}

export function catalogOnly(input: BaseInput): CuratedDroneRecord {
  return base(input, "CATALOG_ONLY");
}

export function enabled(input: BaseInput & { priceUsd: number; aircraftProfile: AircraftProfile }): CuratedDroneRecord {
  return base(input, "ENABLED");
}
