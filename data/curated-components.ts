import { CURATED_GOGGLES } from "@/data/curated-goggles";
import { CURATED_RADIOS } from "@/data/curated-radios";
import { CURATED_CHARGERS } from "@/data/curated-chargers";
import { CURATED_BATTERIES } from "@/data/curated-batteries";
import type { CuratedComponentRecord } from "@/lib/component-catalog-schema";

export const CURATED_COMPONENT_CATALOG: CuratedComponentRecord[] = [
  ...CURATED_GOGGLES,
  ...CURATED_RADIOS,
  ...CURATED_CHARGERS,
  ...CURATED_BATTERIES,
];

export const CURATED_RECOMMENDER_COMPONENTS = CURATED_COMPONENT_CATALOG.filter(
  (record) => record.recommendationStatus === "ENABLED"
);

export const getCuratedComponentRecord = (id: string) =>
  CURATED_COMPONENT_CATALOG.find((record) => record.id === id);
