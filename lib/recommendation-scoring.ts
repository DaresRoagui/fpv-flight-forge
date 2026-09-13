import { getCuratedComponentRecord } from "@/data/curated-components";
import { getCuratedDroneRecord } from "@/data/curated-drones";
import type { CuratedComponentRecord, FpvVideoUnit } from "@/lib/component-catalog-schema";
import type { BundleScoreBreakdown, KitBundle, Product, UserPreferences } from "@/lib/schema";
import {
  batteryMatchesDrone,
  chargerMatchesBattery,
  getBatteryCapacityMah,
  parseWeightG,
  protocolMatches,
  styleIsRecommended,
  videoSystemMatches,
} from "@/lib/compat";

const clamp10 = (value: number) => Math.max(0, Math.min(10, value));
const scoreOr = (value: number | undefined, fallback: number) =>
  value === undefined || !Number.isFinite(value) ? fallback : clamp10(value);

function average(values: Array<number | undefined>, fallback = 7.5): number {
  const finite = values.filter((value): value is number => value !== undefined && Number.isFinite(value));
  return finite.length ? clamp10(finite.reduce((sum, value) => sum + value, 0) / finite.length) : fallback;
}

function weighted(parts: Array<[number, number]>): number {
  const totalWeight = parts.reduce((sum, [, weight]) => sum + weight, 0);
  if (totalWeight <= 0) return 0;
  return clamp10(parts.reduce((sum, [value, weight]) => sum + clamp10(value) * weight, 0) / totalWeight);
}

export function productWeightG(product: Product): number | null {
  if (product.weightG !== undefined) return product.weightG;
  return parseWeightG(product.keySpecs?.weight);
}

export function availabilityFit(product: Product): number {
  if (product.availability === "available") return 10;
  if (product.availability === "unavailable") return 0;
  if (product.state === "LEGACY") return 0;
  if (product.state === "WATCHLIST") return 3;
  if (product.state === "CONDITIONAL") return 5;
  return 6;
}

function fitScore(record: { fitScores?: Record<string, number> } | undefined, keys: string[]): number | undefined {
  if (!record?.fitScores) return undefined;
  for (const key of keys) {
    const exact = record.fitScores[key];
    if (exact !== undefined) return exact;
  }
  for (const key of keys) {
    const normalized = key.toLowerCase();
    const entry = Object.entries(record.fitScores).find(([name]) => name.toLowerCase().includes(normalized));
    if (entry) return entry[1];
  }
  return undefined;
}

function componentRecord(product: Product): CuratedComponentRecord | undefined {
  return getCuratedComponentRecord(product.id);
}

function droneRecord(product: Product) {
  return getCuratedDroneRecord(product.id);
}

export function experienceFitScore(drone: Product, prefs: UserPreferences): number {
  if (drone.experienceLevel.includes(prefs.experience)) return 10;
  if (prefs.experience === "beginner" && drone.experienceLevel.includes("intermediate")) return 6;
  if (prefs.experience === "intermediate" && drone.experienceLevel.includes("advanced")) return 7;
  if (prefs.experience === "advanced" && drone.experienceLevel.includes("intermediate")) return 9;
  return 4;
}

function videoUnit(drone: Product): FpvVideoUnit | undefined {
  const raw = (drone.aircraftProfile?.video.unit ?? "").toUpperCase().replace(/[\s-]+/g, "_");
  if (raw.includes("O3")) return "DJI_O3";
  if (raw.includes("O4") && raw.includes("PRO")) return "DJI_O4_PRO";
  if (raw.includes("O4") && raw.includes("WIDE")) return "DJI_O4_WIDE";
  if (raw.includes("O4")) return "DJI_O4";
  if (raw.includes("HDZERO") || raw.includes("HD_ZERO")) return "HDZERO";
  if (drone.aircraftProfile?.video.system === "analog") return "ANALOG_5_8";
  if (drone.aircraftProfile?.video.system === "hdzero") return "HDZERO";
  return undefined;
}

function videoImageQuality(drone: Product): number {
  const unit = videoUnit(drone);
  if (unit === "DJI_O4_PRO") return 10;
  if (unit === "DJI_O4_WIDE") return 9.2;
  if (unit === "DJI_O4") return 9;
  if (unit === "HDZERO") return 8.8;
  if (unit === "ANALOG_5_8") return 6.5;
  return 7;
}

function ecosystemLatencyPotential(drone: Product): number {
  const unit = videoUnit(drone);
  if (unit === "HDZERO") return 10;
  if (unit === "ANALOG_5_8") return 8.7;
  if (unit === "DJI_O4_PRO") return 7.8;
  if (unit === "DJI_O4_WIDE" || unit === "DJI_O4") return 7.2;
  return 6.5;
}

function weightPortability(product: Product, referenceG: number): number {
  const weight = productWeightG(product);
  if (weight === null) return 6.5;
  return clamp10(10 - (weight / referenceG) * 5);
}

function environmentAdjustedStyle(base: number, drone: Product, prefs: UserPreferences): number {
  const environment = prefs.environment;
  const size = drone.aircraftProfile?.sizeClass;
  if (!environment || !size) return base;

  let adjusted = base;

  if (prefs.style === "tinywhoop") {
    if (environment === "INDOOR_TIGHT") {
      if (size === "WHOOP_65_1S") adjusted += 1.6;
      else if (size === "WHOOP_75_1S" || size === "WHOOP_75_85_2S") adjusted += 0.3;
    } else if (environment === "OUTDOOR") {
      if (size === "WHOOP_75_1S" || size === "WHOOP_75_85_2S") adjusted += 1.8;
      if (size === "WHOOP_65_1S") adjusted -= 1.4;
    }
  }

  // The current questionnaire groups 2–3.5in micro freestyle under freestyle.
  // Tight-space intent therefore needs to pull the score away from a normal 5in.
  if (prefs.style === "freestyle") {
    if (environment === "INDOOR_TIGHT") {
      if (size.startsWith("WHOOP") || size.startsWith("MICRO_") || size === "CINE_2" || size === "CINE_2_5") adjusted += 2.0;
      if (size === "FREESTYLE_5") adjusted -= 3.0;
    } else if (environment === "OUTDOOR") {
      if (size === "FREESTYLE_5") adjusted += 1.2;
      if (size.startsWith("WHOOP")) adjusted -= 1.8;
    }
  }

  if (prefs.style === "cinematic") {
    if (environment === "INDOOR_TIGHT") {
      if (size === "CINE_2" || size === "CINE_2_5") adjusted += 2.6;
      if (size === "CINE_3") adjusted += 0.6;
      if (size === "CINE_3_5") adjusted -= 2.6;
    } else if (environment === "OUTDOOR") {
      if (size === "CINE_3_5") adjusted += 2.4;
      if (size === "CINE_3") adjusted += 0.9;
      if (size === "CINE_2" || size === "CINE_2_5") adjusted -= 1.6;
    }
  }

  return clamp10(adjusted);
}

function styleScoreFromResearch(drone: Product, prefs: UserPreferences): number {
  const record = droneRecord(drone);
  const tinyKeys =
    prefs.environment === "INDOOR_TIGHT"
      ? ["indoor", "beginner", "freestyle"]
      : prefs.environment === "OUTDOOR"
        ? ["outdoor", "freestyle", "beginner"]
        : ["freestyle", "indoor", "beginner"];
  const cinematicKeys =
    prefs.environment === "OUTDOOR"
      ? ["outdoorCinematic", "outdoor", "cinematic", "cinematicSmoothness"]
      : prefs.environment === "INDOOR_TIGHT"
        ? ["indoor", "cinematic", "cinematicSmoothness"]
        : ["cinematic", "cinematicSmoothness", "indoor"];

  const keysByStyle: Record<UserPreferences["style"], string[]> = {
    tinywhoop: tinyKeys,
    freestyle: ["generalFreestyle", "aggressiveFreestyle", "freestyle", "performance"],
    cinematic: cinematicKeys,
    longRange: ["longRange", "endurance", "efficiency"],
    racing: prefs.experience === "advanced" ? ["competitiveRacing", "advancedRacing", "racing"] : ["intermediateRacing", "recreationalRacing", "racing"],
  };

  const research = fitScore(record, keysByStyle[prefs.style]);
  let base = research ?? (styleIsRecommended(drone, prefs.style) ? 9 : drone.flightStyles.includes(prefs.style) ? 6.5 : 0);
  const size = drone.aircraftProfile?.sizeClass;

  if (prefs.style === "freestyle" && prefs.experience !== "beginner" && prefs.environment !== "INDOOR_TIGHT") {
    if (size?.startsWith("WHOOP")) base = Math.min(base, 5.8);
    if (size === "FREESTYLE_5") base = Math.max(base, 9.2);
  }

  if (prefs.style === "racing") {
    const raceClass = record?.raceClass ?? drone.keySpecs?.raceClass;
    if (prefs.experience !== "beginner" && raceClass === "OPEN_5IN") base = Math.max(base, 9.4);
    if (prefs.experience !== "beginner" && size?.startsWith("WHOOP")) base = Math.min(base, 6.8);
    if (size === "FREESTYLE_5") base = Math.min(base, 4);
  }

  return environmentAdjustedStyle(base, drone, prefs);
}

export function droneFitScore(drone: Product, prefs: UserPreferences): number {
  const record = droneRecord(drone);
  const style = styleScoreFromResearch(drone, prefs);
  const experience = experienceFitScore(drone, prefs);
  const current = record?.currentGeneration === false ? 4 : 9.5;
  const availability = availabilityFit(drone);
  const durability = scoreOr(fitScore(record, ["durability", "buildQuality"]), 7.5);
  const parts = scoreOr(drone.partsAvailabilityScore ?? fitScore(record, ["partsAvailability", "racePartsEcosystem"]), 7.5);
  const value = scoreOr(fitScore(record, ["value"]), drone.rating ?? 7.5);
  const ecosystem = drone.aircraftProfile ? 10 : 5;

  let base = weighted([
    [style, 0.35],
    [experience, 0.15],
    [current, 0.10],
    [availability, 0.10],
    [durability, 0.08],
    [parts, 0.08],
    [value, 0.08],
    [ecosystem, 0.06],
  ]);

  if (prefs.advancedPriority === "REPAIRABILITY") {
    const repair = scoreOr(drone.repairabilityScore ?? fitScore(record, ["repairability"]), 6.5);
    base = weighted([[base, 0.58], [repair, 0.27], [parts, 0.15]]);
  } else if (prefs.advancedPriority === "PORTABILITY") {
    const reference = prefs.style === "tinywhoop" ? 40 : prefs.style === "racing" ? 400 : prefs.style === "longRange" ? 900 : 550;
    base = weighted([[base, 0.72], [weightPortability(drone, reference), 0.28]]);
  } else if (prefs.advancedPriority === "FLIGHT_TIME") {
    const efficiency = scoreOr(fitScore(record, ["efficiency", "endurance"]), Math.min(10, (drone.aircraftProfile?.battery.capacityMah.idealMax ?? 500) / 300));
    base = weighted([[base, 0.75], [efficiency, 0.25]]);
  } else if (prefs.advancedPriority === "IMAGE_QUALITY") {
    base = weighted([[base, 0.78], [videoImageQuality(drone), 0.22]]);
  } else if (prefs.advancedPriority === "LOW_LATENCY") {
    base = weighted([[base, 0.68], [ecosystemLatencyPotential(drone), 0.32]]);
  } else if (prefs.advancedPriority === "VALUE") {
    base = weighted([[base, 0.74], [value, 0.26]]);
  }

  return clamp10(base);
}

function latencyScore(goggles: Product, drone: Product): number {
  const record = componentRecord(goggles);
  const unit = videoUnit(drone);
  const profiles = record?.goggleProfile?.latencyProfiles ?? [];
  const matching = profiles.filter((profile) => !profile.videoUnit || profile.videoUnit === unit);
  const preferred = matching.find((profile) => profile.mode === "RACING") ?? matching[0];
  const ms = preferred?.minLatencyMs ?? preferred?.referenceLatencyMs;
  if (ms !== undefined) {
    if (ms <= 3) return 10;
    if (ms <= 8) return 9.7;
    if (ms <= 12) return 9.2;
    if (ms <= 16) return 8.7;
    if (ms <= 20) return 8.2;
    if (ms <= 25) return 7.5;
    if (ms <= 30) return 6.8;
    return 5.5;
  }
  if (unit === "HDZERO") return 9.5;
  if (unit === "ANALOG_5_8") return scoreOr(fitScore(record, ["racing"]), 7.5);
  return 6.5;
}

export function goggleFitScore(goggles: Product, drone: Product, prefs: UserPreferences): number {
  if (!videoSystemMatches(goggles, drone)) return 0;
  const record = componentRecord(goggles);
  const compatibility = 10;
  const latency = latencyScore(goggles, drone);
  const display = scoreOr(fitScore(record, ["displayQuality", "imageQuality"]), record?.goggleProfile?.displayType?.includes("OLED") ? 9 : 7);
  const value = scoreOr(fitScore(record, ["value", "valueForAnalogPlusHDZero"]), goggles.rating ?? 7.5);
  const vision = scoreOr(fitScore(record, ["glassesCompatibility", "glassesUse"]), record?.goggleProfile?.diopterAdjustment || record?.goggleProfile?.glassesFriendly ? 9 : 7);
  const portability = weightPortability(goggles, 600);
  const comfort = average([fitScore(record, ["comfort", "ergonomics"]), portability], 7);
  const availability = availabilityFit(goggles);
  const future = scoreOr(fitScore(record, ["futureProofing"]), goggles.videoSystems.length > 1 ? 9 : 7.5);

  let weights = { video: 0.30, latency: 0.18, display: 0.15, value: 0.12, vision: 0.10, comfort: 0.06, availability: 0.05, future: 0.04 };
  if (prefs.style === "racing") weights = { ...weights, latency: 0.28, display: 0.11, value: 0.08, vision: 0.07, comfort: 0.05, future: 0.03 };
  if (prefs.advancedPriority === "LOW_LATENCY") weights = { video: 0.25, latency: 0.42, display: 0.08, value: 0.06, vision: 0.05, comfort: 0.04, availability: 0.05, future: 0.05 };
  if (prefs.advancedPriority === "IMAGE_QUALITY") weights = { video: 0.23, latency: 0.10, display: 0.38, value: 0.06, vision: 0.07, comfort: 0.04, availability: 0.04, future: 0.08 };
  if (prefs.advancedPriority === "VALUE") weights = { video: 0.24, latency: 0.07, display: 0.06, value: 0.42, vision: 0.05, comfort: 0.03, availability: 0.09, future: 0.04 };
  if (prefs.advancedPriority === "PORTABILITY") weights = { video: 0.25, latency: 0.10, display: 0.08, value: 0.09, vision: 0.06, comfort: 0.28, availability: 0.07, future: 0.07 };

  return weighted([
    [compatibility, weights.video], [latency, weights.latency], [display, weights.display], [value, weights.value],
    [vision, weights.vision], [comfort, weights.comfort], [availability, weights.availability], [future, weights.future],
  ]);
}

export function radioFitScore(radio: Product, drone: Product, prefs: UserPreferences): number {
  if (!protocolMatches(radio, drone)) return 0;
  const record = componentRecord(radio);
  const protocol = 10;
  const ergonomics = scoreOr(fitScore(record, ["ergonomics", "racing"]), 8);
  const gimbal = scoreOr(fitScore(record, ["gimbalPrecision"]), radio.keySpecs?.gimbals ? 8.2 : 7);
  const value = scoreOr(fitScore(record, ["value"]), radio.rating ?? 7.5);
  const batteryLife = scoreOr(fitScore(record, ["batteryLife"]), 7.5);
  const portability = scoreOr(fitScore(record, ["portability"]), weightPortability(radio, 900));
  const rf = scoreOr(fitScore(record, ["RFRedundancy", "longRange"]), radio.protocols.includes("gemini_x") ? 10 : 8);
  const availability = availabilityFit(radio);
  const display = scoreOr(fitScore(record, ["displayUsability"]), radio.id.includes("tx15") || radio.id.includes("tx16") ? 9 : 6.5);

  let weights = { protocol: 0.30, ergonomics: 0.16, gimbal: 0.14, value: 0.12, battery: 0.08, portability: 0.07, rf: 0.06, availability: 0.04, display: 0.03 };
  if (prefs.style === "racing") weights = { protocol: 0.28, ergonomics: 0.20, gimbal: 0.22, value: 0.09, battery: 0.05, portability: 0.05, rf: 0.04, availability: 0.04, display: 0.03 };
  if (prefs.style === "longRange") weights = { protocol: 0.28, ergonomics: 0.12, gimbal: 0.10, value: 0.10, battery: 0.08, portability: 0.06, rf: 0.18, availability: 0.05, display: 0.03 };
  if (prefs.advancedPriority === "PORTABILITY") weights = { protocol: 0.25, ergonomics: 0.10, gimbal: 0.08, value: 0.10, battery: 0.06, portability: 0.30, rf: 0.03, availability: 0.05, display: 0.03 };
  if (prefs.advancedPriority === "VALUE") weights = { protocol: 0.27, ergonomics: 0.10, gimbal: 0.08, value: 0.32, battery: 0.05, portability: 0.06, rf: 0.04, availability: 0.06, display: 0.02 };

  return weighted([
    [protocol, weights.protocol], [ergonomics, weights.ergonomics], [gimbal, weights.gimbal], [value, weights.value],
    [batteryLife, weights.battery], [portability, weights.portability], [rf, weights.rf], [availability, weights.availability], [display, weights.display],
  ]);
}

export function batteryFitScore(battery: Product, drone: Product, prefs: UserPreferences): number {
  const match = batteryMatchesDrone(battery, drone);
  if (match.state === "HARD_INVALID") return 0;
  const record = componentRecord(battery);
  const profile = record?.batteryProfile;
  const capacity = profile?.capacityMah ?? getBatteryCapacityMah(battery);
  const range = drone.aircraftProfile?.battery.capacityMah;
  const exactFit = match.state === "VALID" ? 10 : match.state === "SOFT_PENALTY" ? 8 : 8.5;
  const weight = productWeightG(battery);
  let weightScore = weight === null ? 7 : clamp10(10 - weight / (prefs.style === "tinywhoop" ? 4 : prefs.style === "racing" ? 35 : 60));
  if (range && capacity !== null) {
    const middle = (range.idealMin + range.idealMax) / 2;
    if (prefs.advancedPriority === "FLIGHT_TIME") {
      const span = Math.max(1, range.max - range.min);
      weightScore = weighted([[weightScore, 0.7], [clamp10(5 + ((capacity - range.min) / span) * 5), 0.3]]);
    } else if (Math.abs(capacity - middle) <= Math.max(50, (range.idealMax - range.idealMin) / 2)) {
      weightScore = Math.min(10, weightScore + 0.5);
    }
  }

  let capacityScore = 7;
  if (range && capacity !== null) {
    if (capacity >= range.idealMin && capacity <= range.idealMax) capacityScore = 10;
    else if (capacity >= range.min && capacity <= range.max) capacityScore = 7.5;
    if (prefs.advancedPriority === "FLIGHT_TIME") {
      const span = Math.max(1, range.max - range.min);
      capacityScore = clamp10(6 + ((capacity - range.min) / span) * 4);
    }
  }
  const power = scoreOr(fitScore(record, ["powerDelivery", "outrightRacePerformance", "voltageHold", "racing"]), 8);
  const physical = match.state === "VALID" ? 10 : 8;
  const value = scoreOr(fitScore(record, ["value", "raceValue"]), battery.rating ?? 7.5);
  const availability = availabilityFit(battery);
  const evidence = scoreOr(fitScore(record, ["evidenceConfidence"]), 8.5);

  let weights = { exact: 0.25, weight: 0.20, capacity: 0.18, power: 0.15, physical: 0.10, value: 0.05, availability: 0.04, evidence: 0.03 };
  if (prefs.style === "racing") weights = { exact: 0.24, weight: 0.25, capacity: 0.14, power: 0.20, physical: 0.08, value: 0.03, availability: 0.03, evidence: 0.03 };
  if (prefs.advancedPriority === "FLIGHT_TIME") weights = { exact: 0.20, weight: 0.08, capacity: 0.43, power: 0.10, physical: 0.08, value: 0.04, availability: 0.04, evidence: 0.03 };
  if (prefs.advancedPriority === "PORTABILITY") weights = { exact: 0.22, weight: 0.44, capacity: 0.08, power: 0.08, physical: 0.07, value: 0.04, availability: 0.04, evidence: 0.03 };
  if (prefs.advancedPriority === "VALUE") weights = { exact: 0.22, weight: 0.13, capacity: 0.13, power: 0.10, physical: 0.08, value: 0.24, availability: 0.06, evidence: 0.04 };

  return weighted([
    [exactFit, weights.exact], [weightScore, weights.weight], [capacityScore, weights.capacity], [power, weights.power],
    [physical, weights.physical], [value, weights.value], [availability, weights.availability], [evidence, weights.evidence],
  ]);
}

export function chargerFitScore(charger: Product, battery: Product, prefs: UserPreferences): number {
  const match = chargerMatchesBattery(charger, battery);
  if (match.state === "HARD_INVALID") return 0;
  const record = componentRecord(charger);
  const profile = record?.chargerProfile;
  const compatibility = match.state === "VALID" ? 10 : 8.2;
  const storage = profile?.storageSupport ? 10 : 3;
  const channels = profile ? clamp10(5 + Math.min(profile.channels, 4) * 1.25) : 6;
  const psu = profile?.requiresExternalPsu || charger.requiresPsu ? 6 : 10;
  const balance = scoreOr(fitScore(record, ["balancePerformance"]), profile && profile.supportedCells.some((cell) => cell > 1) ? 8.5 : 8);
  const value = scoreOr(fitScore(record, ["value"]), charger.rating ?? 7.5);
  const reliability = scoreOr(fitScore(record, ["reliabilityConfidence"]), 8);
  const portability = scoreOr(fitScore(record, ["portability"]), weightPortability(charger, 900));
  const availability = availabilityFit(charger);

  let weights = { compatibility: 0.30, storage: 0.12, channels: 0.12, psu: 0.10, balance: 0.10, value: 0.08, reliability: 0.08, portability: 0.05, availability: 0.05 };
  if (prefs.advancedPriority === "VALUE") weights = { compatibility: 0.25, storage: 0.08, channels: 0.08, psu: 0.13, balance: 0.07, value: 0.27, reliability: 0.05, portability: 0.03, availability: 0.04 };
  if (prefs.advancedPriority === "PORTABILITY") weights = { compatibility: 0.25, storage: 0.07, channels: 0.07, psu: 0.10, balance: 0.06, value: 0.07, reliability: 0.05, portability: 0.29, availability: 0.04 };

  return weighted([
    [compatibility, weights.compatibility], [storage, weights.storage], [channels, weights.channels], [psu, weights.psu],
    [balance, weights.balance], [value, weights.value], [reliability, weights.reliability], [portability, weights.portability], [availability, weights.availability],
  ]);
}

function budgetEfficiency(price: number, budget: number, prefs: UserPreferences): number {
  if (budget <= 0 || price > budget) return 0;
  const ratio = price / budget;
  if (prefs.advancedPriority === "VALUE") {
    if (ratio <= 0.45) return 10;
    if (ratio <= 0.55) return 9.8;
    if (ratio <= 0.70) return 9.3;
    if (ratio <= 0.82) return 8.7;
    if (ratio <= 0.90) return 8;
    if (ratio <= 0.98) return 6.8;
    return 5.5;
  }
  if (ratio <= 0.90) return 10;
  if (ratio <= 0.98) return 8;
  return 6.5;
}

function bundleAvailability(bundle: KitBundle): number {
  const products = bundle.items.filter((item) => !item.referenceOnly).map((item) => item.product);
  return average(products.map(availabilityFit), 7);
}

function futureProofing(bundle: KitBundle): number {
  const goggle = bundle.goggles ? componentRecord(bundle.goggles) : undefined;
  const radio = bundle.radio ? componentRecord(bundle.radio) : undefined;
  return average([
    fitScore(goggle, ["futureProofing"]),
    bundle.goggles && bundle.goggles.videoSystems.length > 1 ? 9 : 7.5,
    radio?.radioProfile?.geminiX ? 10 : radio?.radioProfile?.selectableBands ? 9 : 7.5,
    droneRecord(bundle.drone)?.currentGeneration === false ? 4 : 9,
  ], 8);
}

function compatibilityConfidence(bundle: KitBundle): number {
  const drone = droneRecord(bundle.drone);
  const evidence = average([
    drone?.evidenceConfidence,
    bundle.goggles ? fitScore(componentRecord(bundle.goggles), ["evidenceConfidence"] ) : undefined,
    bundle.radio ? fitScore(componentRecord(bundle.radio), ["evidenceConfidence"]) : undefined,
    bundle.battery ? fitScore(componentRecord(bundle.battery), ["evidenceConfidence"]) : undefined,
    bundle.charger ? fitScore(componentRecord(bundle.charger), ["reliabilityConfidence"]) : undefined,
  ], 9);
  const warningPenalty = Math.min(2.5, bundle.warnings.filter((warning) => warning.type !== "REGULATORY_INFO_STALE" && warning.type !== "NO_EXACT_TAKEOFF_WEIGHT").length * 0.35);
  return clamp10(weighted([[10, 0.7], [evidence, 0.3]]) - warningPenalty);
}

export function scoreBundleNormalized(bundle: KitBundle, prefs: UserPreferences): BundleScoreBreakdown {
  const droneStyleFit = droneFitScore(bundle.drone, prefs);
  const batteryFit = batteryFitScore(bundle.battery, bundle.drone, prefs);
  const gogglesFit = bundle.goggles ? goggleFitScore(bundle.goggles, bundle.drone, prefs) : 10;
  const radioFit = bundle.radio ? radioFitScore(bundle.radio, bundle.drone, prefs) : 10;
  const chargerFit = bundle.charger ? chargerFitScore(bundle.charger, bundle.battery, prefs) : 10;
  const compatibility = compatibilityConfidence(bundle);
  const budget = budgetEfficiency(bundle.totalPrice, prefs.budget, prefs);
  const availability = bundleAvailability(bundle);
  const experience = experienceFitScore(bundle.drone, prefs);
  const future = futureProofing(bundle);

  const total = clamp10(
    droneStyleFit * 0.24 +
    compatibility * 0.20 +
    budget * 0.14 +
    batteryFit * 0.10 +
    gogglesFit * 0.09 +
    radioFit * 0.07 +
    chargerFit * 0.06 +
    availability * 0.05 +
    experience * 0.03 +
    future * 0.02
  );

  return {
    droneStyleFit,
    compatibilityConfidence: compatibility,
    budgetEfficiency: budget,
    batteryFit,
    gogglesFit,
    radioFit,
    chargerFit,
    availability,
    experienceFit: experience,
    futureProofing: future,
    total,
  };
}
