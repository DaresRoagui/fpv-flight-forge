import { z } from "zod";
import {
  aircraftProfileSchema,
  availabilitySchema,
  controlProtocolSchema,
  experienceLevelSchema,
  flightStyleSchema,
  productStateSchema,
  videoSystemSchema,
} from "@/lib/schema";

/**
 * Source-grounded catalog representation used before a record is allowed into
 * the live recommendation Product[] array.
 *
 * Unlike Product, priceUsd may be null here. That is intentional: missing
 * source data must never be represented with a fake $0 price simply to satisfy
 * the runtime Product type.
 */
export const catalogRecommendationStatusSchema = z.enum([
  "ENABLED",
  "FALLBACK_ONLY",
  "CATALOG_ONLY",
]);
export type CatalogRecommendationStatus = z.infer<
  typeof catalogRecommendationStatusSchema
>;

export const curatedDroneRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().min(1),
  sourceSegment: z.number().int().min(1).max(9),
  sourceStatus: z.string().min(1),
  state: productStateSchema,
  recommendationStatus: catalogRecommendationStatusSchema,
  priceUsd: z.number().nonnegative().nullable(),
  priceNote: z.string().optional(),
  availability: availabilitySchema,
  videoSystems: z.array(videoSystemSchema),
  protocols: z.array(controlProtocolSchema),
  flightStyles: z.array(flightStyleSchema),
  experienceLevel: z.array(experienceLevelSchema),
  primaryRoles: z.array(z.string()).default([]),
  secondaryRoles: z.array(z.string()).default([]),
  fitScores: z.record(z.string(), z.number()).default({}),
  blockerReasons: z.array(z.string()).default([]),
  sourceNotes: z.array(z.string()).default([]),
  currentGeneration: z.boolean().optional(),
  videoUnit: z.string().optional(),
  raceClass: z.string().optional(),
  skillFloor: z.string().optional(),
  skillCeiling: z.string().optional(),
  evidenceConfidence: z.number().min(0).max(10).optional(),
  availabilityConfidence: z.number().min(0).max(10).optional(),
  dryWeightG: z.number().nonnegative().optional(),
  verifiedAt: z.string(),
  sourceUrl: z.string().url().optional(),
  aircraftProfile: aircraftProfileSchema.optional(),
});

export type CuratedDroneRecord = z.infer<typeof curatedDroneRecordSchema>;
