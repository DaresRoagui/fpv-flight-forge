import {
  Product,
  UserPreferences,
  KitBundle,
  RecommendationResult,
  FlightStyle,
  VideoSystem,
  ExperienceLevel,
} from "@/lib/schema";
import {
  validateBundle,
  flightStyleMatches,
  batteryMatchesDrone,
  chargerMatchesBattery,
} from "@/lib/compat";

export function batteryQuantity(style: FlightStyle): number {
  switch (style) {
    case "tinywhoop":
      return 6;
    case "cinematic":
      return 3;
    case "longRange":
      return 2;
    case "racing":
      return 8;
    case "freestyle":
    default:
      return 4;
  }
}

function videoSystemLabel(videoSystem: VideoSystem): string {
  if (videoSystem === "dji_o4") return "DJI O4";
  if (videoSystem === "analog") return "analógico";
  if (videoSystem === "hdzero") return "HDZero";
  if (videoSystem === "walksnail") return "Walksnail";
  return videoSystem;
}

function calculateTotal(
  goggles: Product,
  drone: Product,
  radio: Product,
  charger: Product,
  battery: Product,
  style: FlightStyle
): number {
  const qty = batteryQuantity(style);
  return (
    goggles.priceUsd +
    drone.priceUsd +
    radio.priceUsd +
    charger.priceUsd +
    battery.priceUsd * qty
  );
}

type ScoredBundle = KitBundle & { score: number };

function experienceBonus(product: Product, userLevel: ExperienceLevel): number {
  const exact = product.experienceLevel.includes(userLevel);
  const beginnerFriendly =
    userLevel === "beginner" && product.experienceLevel.includes("beginner");
  return exact ? 0.5 : beginnerFriendly ? 0.3 : 0;
}

function styleBonus(product: Product, style: FlightStyle): number {
  const weights: Record<string, number> = {
    drone: 0.35,
    goggles: 0.2,
    radio: 0.1,
    charger: 0.1,
    battery: 0.15,
  };
  return product.flightStyles.includes(style) ? weights[product.category] ?? 0.1 : 0;
}

function scoreBundle(bundle: ScoredBundle, prefs: UserPreferences): number {
  const { drone, goggles, radio, charger, battery, totalPrice } = bundle;

  const weights = {
    drone: 0.35,
    goggles: 0.25,
    radio: 0.15,
    charger: 0.1,
    battery: 0.15,
  };

  const weightedRating =
    drone.rating * weights.drone +
    goggles.rating * weights.goggles +
    radio.rating * weights.radio +
    charger.rating * weights.charger +
    battery.rating * weights.battery;

  const budgetRatio = Math.min(totalPrice / prefs.budget, 1);
  const budgetBonus = budgetRatio * 2;
  const overBudgetPenalty =
    totalPrice > prefs.budget ? -((totalPrice - prefs.budget) / prefs.budget) * 5 : 0;

  const experienceScore =
    experienceBonus(drone, prefs.experience) +
    experienceBonus(goggles, prefs.experience) * 0.5 +
    experienceBonus(radio, prefs.experience) * 0.3;

  const elrsBonus = (p: Product): number => (p.protocols.includes("elrs_2.4") ? 0.2 : 0);
  const protocolScore = elrsBonus(drone) + elrsBonus(radio);

  const styleScore =
    styleBonus(drone, prefs.style) +
    styleBonus(goggles, prefs.style) +
    styleBonus(radio, prefs.style) +
    styleBonus(charger, prefs.style) +
    styleBonus(battery, prefs.style);

  return (
    weightedRating +
    budgetBonus +
    overBudgetPenalty +
    experienceScore +
    protocolScore +
    styleScore
  );
}

function recommendKitForSystem(
  prefs: UserPreferences,
  products: Product[],
  videoSystem: VideoSystem
): RecommendationResult {
  const goggles = products.filter(
    (p) => p.category === "goggles" && p.videoSystems.includes(videoSystem)
  );
  const drones = products.filter(
    (p) =>
      p.category === "drone" &&
      p.videoSystems.includes(videoSystem) &&
      flightStyleMatches(p, prefs.style)
  );
  const radios = products.filter((p) => p.category === "radio");
  const chargers = products.filter((p) => p.category === "charger");
  const batteries = products.filter((p) => p.category === "battery");

  const candidates: ScoredBundle[] = [];

  for (const g of goggles) {
    for (const d of drones) {
      for (const r of radios) {
        for (const b of batteries) {
          if (!batteryMatchesDrone(b, d)) continue;
          for (const c of chargers) {
            if (!chargerMatchesBattery(c, b)) continue;
            const error = validateBundle(g, d, r, c, b);
            if (error) continue;

            const total = calculateTotal(g, d, r, c, b, prefs.style);
            const qty = batteryQuantity(prefs.style);
            const scored: ScoredBundle = {
              goggles: g,
              drone: d,
              radio: r,
              charger: c,
              battery: b,
              batteryQuantity: qty,
              totalPrice: total,
              explanation: "",
              score: 0,
            };
            scored.score = scoreBundle(scored, prefs);
            candidates.push(scored);
          }
        }
      }
    }
  }

  if (candidates.length === 0) {
    return {
      kind: "insufficient",
      minBudget: Infinity,
      message: `No encontramos un kit completo recomendable dentro de US$$${
        prefs.budget
      } en sistema ${videoSystemLabel(videoSystem)}.`,
    };
  }

  const withinBudget = candidates.filter((c) => c.totalPrice <= prefs.budget);

  if (withinBudget.length === 0) {
    const cheapest = candidates.slice().sort((a, b) => a.totalPrice - b.totalPrice)[0];
    return {
      kind: "insufficient",
      minBudget: cheapest.totalPrice,
      message: `No encontramos un kit completo recomendable dentro de US$$${
        prefs.budget
      } en sistema ${videoSystemLabel(videoSystem)}.`,
      kit: cheapest,
    };
  }

  withinBudget.sort((a, b) => b.score - a.score);
  const chosen = withinBudget[0];
  chosen.explanation = "";

  return { kind: "kit", kit: chosen };
}

export function recommendKit(
  prefs: UserPreferences,
  products: Product[]
): RecommendationResult {
  const systems: VideoSystem[] =
    prefs.videoSystem === "recommend" ? ["analog", "dji_o4"] : [prefs.videoSystem];

  const results = systems.map((system) => ({
    system,
    result: recommendKitForSystem(prefs, products, system),
  }));

  const kits = results
    .filter((r) => r.result.kind === "kit")
    .map((r) => r.result as Extract<RecommendationResult, { kind: "kit" }>);

  const insufficient = results
    .filter((r) => r.result.kind === "insufficient")
    .map(
      (r) => r.result as Extract<RecommendationResult, { kind: "insufficient" }>
    );

  if (kits.length > 0) {
    kits.sort((a, b) => (b.kit.score ?? 0) - (a.kit.score ?? 0));
    return kits[0];
  }

  const feasible = insufficient
    .filter((r) => Number.isFinite(r.minBudget))
    .sort((a, b) => a.minBudget - b.minBudget);

  if (feasible.length > 0) {
    return feasible[0];
  }

  return {
    kind: "insufficient",
    minBudget: Infinity,
    message: `No existe una configuración completa recomendable dentro de este presupuesto.`,
  };
}
