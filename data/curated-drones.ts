import { CURATED_DRONES_01 } from "@/data/curated-drones-01";
import { CURATED_DRONES_02 } from "@/data/curated-drones-02";
import { CURATED_DRONES_03_09_MANIFEST } from "@/data/curated-drones-03-09-manifest";
import { CURATED_DRONES_ENABLED_03_09 } from "@/data/curated-drones-enabled-03-09";
import { CuratedDroneRecord } from "@/lib/catalog-schema";

export const CURATED_DRONE_CATALOG: CuratedDroneRecord[] = [
  ...CURATED_DRONES_01,
  ...CURATED_DRONES_02,
  ...CURATED_DRONES_03_09_MANIFEST,
  ...CURATED_DRONES_ENABLED_03_09,
];

export const CURATED_RECOMMENDER_DRONES = CURATED_DRONE_CATALOG.filter(
  (record) => record.recommendationStatus === "ENABLED"
);

export const getCuratedDroneRecord = (id: string) =>
  CURATED_DRONE_CATALOG.find((record) => record.id === id);
