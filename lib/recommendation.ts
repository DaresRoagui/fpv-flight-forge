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
  videoSystemIsRecommended,
  flightStyleMatches,
  protocolMatches,
  videoSystemMatches,
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
  if (videoSystem === "analog") return "Analógico";
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

function scoreBundle(bundle: ScoredBundle, prefs: UserPreferences): number {
  const { goggles, drone, radio, charger, battery, totalPrice } = bundle;
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

  const experienceBonus = (product: Product, userLevel: ExperienceLevel): number => {
    const exact = product.experienceLevel.includes(userLevel);
    const beginnerFriendly =
      userLevel === "beginner" && product.experienceLevel.includes("beginner");
    return exact ? 0.5 : beginnerFriendly ? 0.3 : 0;
  };

  const experienceScore =
    experienceBonus(drone, prefs.experience) +
    experienceBonus(goggles, prefs.experience) * 0.5 +
    experienceBonus(radio, prefs.experience) * 0.3;

  // Prefer ELRS for simpler compatibility.
  const elrsBonus = (p: Product): number =>
    p.protocols.includes("elrs_2.4") ? 0.2 : 0;
  const protocolScore = elrsBonus(drone) + elrsBonus(radio);

  return weightedRating + budgetBonus + experienceScore + protocolScore;
}

export function recommendKit(
  prefs: UserPreferences,
  products: Product[]
): RecommendationResult {
  const videoSystem = videoSystemIsRecommended(prefs);

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
    // No fully compatible bundle found. Compute the cheapest possible
    // compatible bundle to recommend a minimum budget.
    const fallback: Array<{ total: number }> = [];
    for (const g of goggles) {
      for (const d of drones) {
        for (const r of radios) {
          for (const b of batteries) {
            if (
              videoSystemMatches(g, d) &&
              protocolMatches(r, d) &&
              batteryMatchesDrone(b, d)
            ) {
              for (const c of chargers) {
                if (chargerMatchesBattery(c, b)) {
                  fallback.push({
                    total: calculateTotal(g, d, r, c, b, prefs.style),
                  });
                }
              }
            }
          }
        }
      }
    }
    const minBudget = fallback.length
      ? Math.min(...fallback.map((f) => f.total))
      : Infinity;
    return {
      kind: "insufficient",
      minBudget,
      message: `No encontramos un kit completo recomendable dentro de US$${prefs.budget}.`,
    };
  }

  // Prefer bundles within budget, but if none fit, return the cheapest one
  // as an insufficient-budget response.
  const withinBudget = candidates.filter((c) => c.totalPrice <= prefs.budget);
  const pool = withinBudget.length ? withinBudget : candidates;

  pool.sort((a, b) => b.score - a.score);
  const chosen = pool[0];

  if (!withinBudget.length) {
    return {
      kind: "insufficient",
      minBudget: chosen.totalPrice,
      message: `No encontramos un kit completo recomendable dentro de US$${prefs.budget}.`,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { score, ...rest } = chosen;
  rest.explanation = buildExplanation(rest, prefs, videoSystem);
  return { kind: "kit", kit: rest };
}

function buildExplanation(
  kit: KitBundle,
  prefs: UserPreferences,
  videoSystem: VideoSystem
): string {
  const parts: string[] = [];
  if (prefs.videoSystem === "recommend") {
    parts.push(
      `Elegimos sistema ${videoSystemLabel(videoSystem)} porque equilibra tu presupuesto y experiencia.`
    );
  } else {
    parts.push(
      `Kit optimizado para ${videoSystemLabel(videoSystem)} y estilo ${labelStyle(prefs.style)}.`
    );
  }

  if (prefs.experience === "beginner") {
    parts.push("Priorizamos facilidad de uso, disponibilidad de repuestos y configuración sencilla.");
  } else if (prefs.experience === "advanced") {
    parts.push("Priorizamos rendimiento, latencia y componentes de mayor calidad.");
  }

  parts.push(
    `El ${kit.drone.name} encaja en tu presupuesto mientras mantiene compatibilidad total con gafas, radio y baterías.`
  );

  return parts.join(" ");
}

function labelStyle(style: FlightStyle): string {
  const labels: Record<FlightStyle, string> = {
    tinywhoop: "Tinywhoop/interiores",
    freestyle: "Freestyle",
    cinematic: "Cinemático",
    longRange: "Long Range",
    racing: "Racing",
  };
  return labels[style];
}
