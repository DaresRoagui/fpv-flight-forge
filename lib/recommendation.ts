import {
  Product,
  UserPreferences,
  KitBundle,
  RecommendationResult,
  FlightStyle,
  VideoSystem,
  ExperienceLevel,
  BundleItem,
  Warning,
  Reason,
  ProductCategory,
  OwnedGear,
} from "@/lib/schema";
import {
  videoSystemMatches,
  protocolMatches,
  batteryMatchesDrone,
  chargerMatchesBattery,
  flightStyleMatches,
  styleIsRecommended,
  getBatteryCapacityMah,
  parseWeightG,
} from "@/lib/compat";
import { assessRegulation } from "@/lib/regulation";

// ---------- Constants ----------

const DEFAULT_BATTERY_QTY: Record<FlightStyle, number> = {
  tinywhoop: 6,
  cinematic: 3,
  longRange: 2,
  racing: 8,
  freestyle: 4,
};

const PSU_PRICE_USD = 35;
const RADIO_CELLS_PRICE_USD = 25;

const EXTRA_PRICES: Record<string, number> = {
  props: 8,
  straps: 5,
  basicTools: 15,
  spareFrame: 15,
  buzzer: 10,
  psu: PSU_PRICE_USD,
  radioCells: RADIO_CELLS_PRICE_USD,
  chargeAdapter: 8,
};

// ---------- Helpers ----------

function batteryQuantity(style: FlightStyle): number {
  return DEFAULT_BATTERY_QTY[style] ?? 4;
}

function videoSystemLabel(videoSystem: VideoSystem): string {
  if (videoSystem === "dji_o4") return "DJI O4";
  if (videoSystem === "dji_o3") return "DJI O3";
  if (videoSystem === "analog") return "analógico";
  if (videoSystem === "hdzero") return "HDZero";
  if (videoSystem === "walksnail") return "Walksnail";
  return videoSystem;
}

function getProductWeightG(product: Product): number | null {
  if (product.weightG !== undefined) return product.weightG;
  return parseWeightG(product.keySpecs?.weight);
}

function getOwnedProduct(
  category: ProductCategory,
  ownedGear: OwnedGear | undefined,
  products: Product[]
): Product | undefined {
  if (!ownedGear) return undefined;
  const idMap: Record<ProductCategory, string | undefined> = {
    goggles: ownedGear.gogglesProductId,
    radio: ownedGear.radioProductId,
    charger: ownedGear.chargerProductId,
    battery: ownedGear.batteryProductIds?.[0],
    drone: undefined,
  };
  const id = idMap[category];
  if (!id) return undefined;
  return products.find((p) => p.id === id);
}

function isOwnedCompatible(
  category: ProductCategory,
  owned: Product,
  drone: Product,
  battery: Product
): { compatible: boolean; warnings: Warning[] } {
  if (category === "goggles") {
    return { compatible: videoSystemMatches(owned, drone), warnings: [] };
  }
  if (category === "radio") {
    return { compatible: protocolMatches(owned, drone), warnings: [] };
  }
  if (category === "charger") {
    const match = chargerMatchesBattery(owned, battery);
    return {
      compatible: match.state !== "HARD_INVALID",
      warnings: match.warnings,
    };
  }
  if (category === "battery") {
    const match = batteryMatchesDrone(owned, drone);
    return {
      compatible: match.state !== "HARD_INVALID",
      warnings: match.warnings,
    };
  }
  return { compatible: false, warnings: [] };
}

// ---------- Extras ----------

type Extra = { key: string; priceUsd: number; labelKey: string };

function isItemOwned(bundle: KitBundle, category: ProductCategory): boolean {
  return bundle.items.some((item) => item.category === category && item.owned);
}

function getRecommendedExtras(bundle: KitBundle): Extra[] {
  const extras: Extra[] = [];
  const style = bundle.drone.recommendedStyles?.[0] ?? bundle.drone.flightStyles[0];

  if (bundle.charger?.requiresPsu) {
    extras.push({ key: "psu", priceUsd: EXTRA_PRICES.psu, labelKey: "cost.requiredPsu" });
  }
  if (bundle.radio && !isItemOwned(bundle, "radio")) {
    extras.push({ key: "radioCells", priceUsd: EXTRA_PRICES.radioCells, labelKey: "cost.radioBatteries" });
  }

  if (style === "tinywhoop") {
    extras.push({ key: "props", priceUsd: EXTRA_PRICES.props, labelKey: "communityValue.commonConsumables" });
    extras.push({ key: "spareFrame", priceUsd: EXTRA_PRICES.spareFrame, labelKey: "communityValue.commonConsumables" });
  } else if (style === "freestyle" || style === "racing") {
    extras.push({ key: "props", priceUsd: EXTRA_PRICES.props, labelKey: "communityValue.commonConsumables" });
    extras.push({ key: "straps", priceUsd: EXTRA_PRICES.straps, labelKey: "communityValue.commonConsumables" });
    extras.push({ key: "basicTools", priceUsd: EXTRA_PRICES.basicTools, labelKey: "communityValue.commonConsumables" });
  } else if (style === "cinematic") {
    extras.push({ key: "props", priceUsd: EXTRA_PRICES.props, labelKey: "communityValue.commonConsumables" });
    extras.push({ key: "straps", priceUsd: EXTRA_PRICES.straps, labelKey: "communityValue.commonConsumables" });
  } else if (style === "longRange") {
    extras.push({ key: "props", priceUsd: EXTRA_PRICES.props, labelKey: "communityValue.commonConsumables" });
    if (!bundle.drone.aircraftProfile?.recovery.gpsIncluded) {
      extras.push({ key: "buzzer", priceUsd: EXTRA_PRICES.buzzer, labelKey: "communityValue.commonConsumables" });
    }
  }

  return extras;
}

// ---------- Scoring ----------

function scoreDrone(drone: Product, prefs: UserPreferences, videoSystem: VideoSystem): number {
  let score = drone.rating * 3.5;
  const styleMatch = styleIsRecommended(drone, prefs.style) ? 1 : flightStyleMatches(drone, prefs.style) ? 0.5 : 0;
  score += styleMatch * 2.5;

  // Mark5 is a freestyle frame, not a competitive racer; avoid it winning racing recommendations.
  if (prefs.style === "racing" && !drone.recommendedStyles?.includes("racing")) {
    score -= 8;
  }

  if (drone.aircraftProfile?.video.system === videoSystem) score += 1;
  if (drone.availability === "available") score += 1;

  const experienceMap: Record<ExperienceLevel, number> = { beginner: 0, intermediate: 1, advanced: 2 };
  const userExp = experienceMap[prefs.experience];
  const droneExp =
    drone.experienceLevel.length > 0
      ? Math.max(...drone.experienceLevel.map((e) => experienceMap[e]))
      : 1;
  score -= Math.abs(userExp - droneExp) * 0.5;

  if (prefs.advancedPriority === "REPAIRABILITY" && drone.repairabilityScore) {
    score += drone.repairabilityScore * 0.3;
  }
  if (prefs.advancedPriority === "FLIGHT_TIME" && drone.aircraftProfile?.battery.capacityMah.idealMax) {
    // Prefer drones with larger ideal battery capacity normalized to 10
    score += Math.min(drone.aircraftProfile.battery.capacityMah.idealMax / 1500, 1) * 1.5;
  }

  if (prefs.environment === "INDOOR_TIGHT") {
    if (["WHOOP_65_1S", "WHOOP_75_1S", "CINE_2_5", "CINE_3", "CINE_3_5"].includes(drone.aircraftProfile?.sizeClass ?? "")) {
      score += 1.5;
    }
  } else if (prefs.environment === "OUTDOOR") {
    if (["FREESTYLE_5", "RACE_5", "LONG_RANGE_7", "CINE_3_5"].includes(drone.aircraftProfile?.sizeClass ?? "")) {
      score += 1;
    }
  }

  return Math.max(0, score);
}

function scoreBattery(battery: Product, drone: Product, prefs: UserPreferences): number {
  let score = (battery.rating ?? 5) * 2;
  const capacity = getBatteryCapacityMah(battery);
  const range = drone.aircraftProfile?.battery.capacityMah;

  if (capacity !== null && range) {
    if (capacity >= range.idealMin && capacity <= range.idealMax) {
      score += 3;
    } else if (capacity >= range.min && capacity <= range.max) {
      score += 1.5;
    }
    if (prefs.advancedPriority === "FLIGHT_TIME" && capacity >= range.idealMax * 0.9) {
      score += 1.5;
    }
    if (prefs.advancedPriority === "PORTABILITY") {
      const weight = getProductWeightG(battery) ?? capacity;
      score += Math.max(0, 1 - weight / 300) * 1.5;
    }
  }

  return Math.max(0, score);
}

function scoreGoggles(goggles: Product, prefs: UserPreferences, videoSystem: VideoSystem): number {
  let score = (goggles.rating ?? 5) * 2.5;
  if (goggles.videoSystems.includes(videoSystem)) score += 2;
  if (prefs.advancedPriority === "LOW_LATENCY" && goggles.subcategory?.toLowerCase().includes("analog")) {
    score += 1.5;
  }
  if (prefs.advancedPriority === "IMAGE_QUALITY" && goggles.videoSystems.includes("dji_o4")) {
    score += 1.5;
  }
  if (goggles.availability === "available") score += 0.5;
  return Math.max(0, score);
}

function scoreRadio(radio: Product, prefs: UserPreferences, drone: Product): number {
  let score = (radio.rating ?? 5) * 2;
  if (protocolMatches(radio, drone)) score += 2;
  if (prefs.advancedPriority === "LOW_LATENCY" && radio.protocols.includes("elrs_2.4")) {
    score += 1;
  }
  if (prefs.advancedPriority === "PORTABILITY" && radio.subcategory?.toLowerCase().includes("compact")) {
    score += 1;
  }
  return Math.max(0, score);
}

function scoreCharger(charger: Product, battery: Product): number {
  let score = (charger.rating ?? 5) * 2;
  const match = chargerMatchesBattery(charger, battery);
  if (match.state !== "HARD_INVALID") score += 2;
  if (match.state === "VALID") score += 1;
  if (charger.availability === "available") score += 0.5;
  return Math.max(0, score);
}

function scoreBundle(bundle: KitBundle, prefs: UserPreferences, videoSystem: VideoSystem): number {
  const droneScore = scoreDrone(bundle.drone, prefs, videoSystem);
  const batteryScore = scoreBattery(bundle.battery, bundle.drone, prefs);
  const goggleScore = bundle.goggles ? scoreGoggles(bundle.goggles, prefs, videoSystem) : 0;
  const radioScore = bundle.radio ? scoreRadio(bundle.radio, prefs, bundle.drone) : 0;
  const chargerScore = bundle.charger ? scoreCharger(bundle.charger, bundle.battery) : 0;

  const weightedRating =
    droneScore * 0.3 +
    batteryScore * 0.2 +
    goggleScore * 0.2 +
    radioScore * 0.15 +
    chargerScore * 0.1;

  const budgetRatio = Math.min(bundle.totalPrice / prefs.budget, 1);
  const budgetBonus = budgetRatio * 2;
  const overBudgetPenalty =
    bundle.totalPrice > prefs.budget ? -((bundle.totalPrice - prefs.budget) / prefs.budget) * 5 : 0;

  let priorityBonus = 0;
  if (prefs.advancedPriority === "VALUE" && bundle.totalPrice <= prefs.budget * 0.9) {
    priorityBonus += 1.5;
  }
  if (prefs.advancedPriority === "PORTABILITY") {
    const totalWeight =
      (getProductWeightG(bundle.drone) ?? 0) +
      (getProductWeightG(bundle.battery) ?? 0) * bundle.batteryQuantity +
      (bundle.goggles ? getProductWeightG(bundle.goggles) ?? 0 : 0) +
      (bundle.radio ? getProductWeightG(bundle.radio) ?? 0 : 0);
    priorityBonus += Math.max(0, 1 - totalWeight / 2500) * 1.5;
  }

  let value = weightedRating + budgetBonus + overBudgetPenalty + priorityBonus;
  if (styleIsRecommended(bundle.drone, prefs.style)) value += 0.05;
  return Math.max(0, value);
}

// ---------- Bundle builders ----------

type ScoredBundle = KitBundle & { score: number };

function buildBundle(
  prefs: UserPreferences,
  products: Product[],
  drone: Product,
  videoSystem: VideoSystem
): ScoredBundle[] {
  const scope = prefs.scope ?? "FULL_KIT";
  const batteries = products.filter((p) => p.category === "battery");
  const chargers = products.filter((p) => p.category === "charger");
  const gogglesList = products.filter((p) => p.category === "goggles");
  const radios = products.filter((p) => p.category === "radio");

  const compatibleBatteries = batteries
    .map((b) => ({ product: b, match: batteryMatchesDrone(b, drone) }))
    .filter(({ match }) => match.state !== "HARD_INVALID");

  if (compatibleBatteries.length === 0) return [];

  const results: ScoredBundle[] = [];

  for (const { product: battery, match: batteryMatch } of compatibleBatteries) {
    const qty = batteryQuantity(prefs.style);

    // Owned-gear resolution
    const ownedBattery = getOwnedProduct("battery", prefs.ownedGear, products);
    let selectedBattery = battery;
    let batteryOwned = false;
    if (scope === "COMPLETE_EXISTING_SETUP" && ownedBattery) {
      const ownedCheck = isOwnedCompatible("battery", ownedBattery, drone, selectedBattery);
      if (ownedCheck.compatible) {
        selectedBattery = ownedBattery;
        batteryOwned = true;
      }
    }

    const bundleWarnings: Warning[] = [...batteryMatch.warnings];
    const bundleReasons: Reason[] = [];

    // Charger selection
    let selectedCharger: Product | undefined;
    const ownedCharger = getOwnedProduct("charger", prefs.ownedGear, products);
    if (scope === "COMPLETE_EXISTING_SETUP" && ownedCharger) {
      const ownedCheck = chargerMatchesBattery(ownedCharger, selectedBattery);
      if (ownedCheck.state !== "HARD_INVALID") {
        selectedCharger = ownedCharger;
        bundleWarnings.push(...ownedCheck.warnings);
      }
    }
    if (!selectedCharger) {
      const charger = chargers.find((c) => chargerMatchesBattery(c, selectedBattery).state !== "HARD_INVALID");
      if (charger) selectedCharger = charger;
    }

    if (scope === "FULL_KIT" || scope === "COMPLETE_EXISTING_SETUP") {
      if (!selectedCharger) continue;
    }

    // Goggles and radio selection (required for full/complete, optional reference for DRONE_ONLY)
    let selectedGoggles: Product | undefined;
    let gogglesOwned = false;
    const ownedGoggles = getOwnedProduct("goggles", prefs.ownedGear, products);
    if (scope === "COMPLETE_EXISTING_SETUP" && ownedGoggles && videoSystemMatches(ownedGoggles, drone)) {
      selectedGoggles = ownedGoggles;
      gogglesOwned = true;
    } else {
      selectedGoggles = gogglesList.find((g) => videoSystemMatches(g, drone));
    }
    if (!selectedGoggles && scope !== "DRONE_ONLY") continue;

    let selectedRadio: Product | undefined;
    let radioOwned = false;
    const ownedRadio = getOwnedProduct("radio", prefs.ownedGear, products);
    if (scope === "COMPLETE_EXISTING_SETUP" && ownedRadio && protocolMatches(ownedRadio, drone)) {
      selectedRadio = ownedRadio;
      radioOwned = true;
    } else {
      selectedRadio = radios.find((r) => protocolMatches(r, drone));
    }
    if (!selectedRadio && scope !== "DRONE_ONLY") continue;

    // Build items and price
    const items: BundleItem[] = [];
    let totalPrice = 0;

    const addItem = (category: ProductCategory, product: Product, owned: boolean, included: boolean, reference?: boolean) => {
      items.push({ category, product, owned, includedInPrice: included, referenceOnly: reference });
      if (included) totalPrice += product.priceUsd * (category === "battery" ? qty : 1);
    };

    addItem("drone", drone, false, true);
    addItem("battery", selectedBattery, batteryOwned, true);

    if (scope !== "DRONE_ONLY") {
      if (selectedGoggles) addItem("goggles", selectedGoggles, gogglesOwned, !gogglesOwned);
      if (selectedRadio) addItem("radio", selectedRadio, radioOwned, !radioOwned);
      if (selectedCharger) addItem("charger", selectedCharger, false, true);
    } else {
      if (selectedGoggles) addItem("goggles", selectedGoggles, false, false, true);
      if (selectedRadio) addItem("radio", selectedRadio, false, false, true);
      if (selectedCharger) addItem("charger", selectedCharger, false, false, true);
    }

    // Reuse owned gear explanations
    if (scope === "COMPLETE_EXISTING_SETUP") {
      items.forEach((item) => {
        if (item.owned) {
          bundleReasons.push({
            category: "VALUE",
            messageKey: "ownedGear.compatibleReuse",
            params: { product: item.product.name },
          });
        }
      });
    }

    // Racing + O4 warning
    if (prefs.style === "racing" && videoSystem === "dji_o4") {
      bundleWarnings.push({
        type: "RACING_COMPROMISE",
        messageKey: "warnings.racingO4Compromise",
      });
    }

    // Mark5 not winning racing
    if (prefs.style === "racing" && drone.id.includes("mark5")) {
      // Already penalized by style recommendation, but add explicit warning if it surfaces
      bundleWarnings.push({
        type: "VIDEO_TRADEOFF",
        messageKey: "warnings.videoTradeoff",
      });
    }

    const corePrice = totalPrice;

    const bundle: KitBundle = {
      scope,
      drone,
      battery: selectedBattery,
      batteryQuantity: qty,
      goggles: selectedGoggles,
      radio: selectedRadio,
      charger: selectedCharger,
      items,
      totalPrice,
      corePrice,
      extrasPrice: 0,
      totalWithExtras: totalPrice,
      explanation: "",
      reasons: bundleReasons,
      warnings: bundleWarnings,
      regulatory: assessRegulation(drone, selectedBattery, prefs.regulatoryRegion ?? "OTHER", prefs.operationPurpose ?? "RECREATIONAL"),
    };

    const extrasReal = getRecommendedExtras(bundle);
    bundle.extrasPrice = extrasReal.reduce((sum, e) => sum + e.priceUsd, 0);
    bundle.totalWithExtras = bundle.totalPrice + bundle.extrasPrice;

    bundle.score = scoreBundle(bundle, prefs, videoSystem);
    results.push(bundle as ScoredBundle);
  }

  return results;
}

// ---------- Extras recomputation helper ----------

// (extras are computed inside buildBundle, no top-level export needed)

// ---------- Main recommendation ----------

export function recommendKit(prefs: UserPreferences, products: Product[]): RecommendationResult {
  const systems: VideoSystem[] =
    prefs.videoSystem === "recommend" ? ["analog", "dji_o4"] : [prefs.videoSystem];

  const drones = products.filter((p) => p.category === "drone");

  const allCandidates: ScoredBundle[] = [];

  for (const videoSystem of systems) {
    for (const drone of drones) {
      if (!drone.videoSystems.includes(videoSystem)) {
        // If drone has a single profile video system, still try if it matches
        if (drone.aircraftProfile?.video.system !== videoSystem && !drone.videoSystems.includes(videoSystem)) {
          continue;
        }
      }

      const styleFit =
        styleIsRecommended(drone, prefs.style) || flightStyleMatches(drone, prefs.style);
      if (!styleFit) continue;

      // Experience filter: beginners should not get advanced-only drones unless no alternative
      const droneExp = drone.experienceLevel;
      if (prefs.experience === "beginner" && !droneExp.includes("beginner") && !droneExp.includes("intermediate")) {
        continue;
      }

      const bundles = buildBundle(prefs, products, drone, videoSystem);
      allCandidates.push(...bundles);
    }
  }

  if (allCandidates.length === 0) {
    return {
      kind: "insufficient",
      minBudget: Infinity,
      message: `No existe una configuración completa recomendable dentro de este presupuesto.`,
    };
  }

  const withinBudget = allCandidates.filter((c) => c.totalPrice <= prefs.budget);

  if (withinBudget.length === 0) {
    const cheapest = allCandidates.slice().sort((a, b) => a.totalPrice - b.totalPrice)[0];
    return {
      kind: "insufficient",
      minBudget: cheapest.totalPrice,
      message: `No encontramos un kit completo recomendable dentro de US$${prefs.budget} en sistema ${videoSystemLabel(
        cheapest.drone.aircraftProfile?.video.system ?? cheapest.drone.videoSystems[0]
      )}.`,
      kit: cheapest,
    };
  }

  withinBudget.sort((a, b) => b.score - a.score);
  const chosen = withinBudget[0];

  return { kind: "kit", kit: chosen };
}
