import type { Product, UserPreferences } from "@/lib/schema";

export type AccessoryNecessity =
  | "REQUIRED_TO_USE"
  | "STRONGLY_RECOMMENDED"
  | "REPAIR_REQUIRED"
  | "FLIGHT_STYLE_SPECIFIC"
  | "OPTIONAL_QUALITY_OF_LIFE";

export type RecommendedExtra = {
  id: string;
  name: string;
  section: "PRACTICAL" | "SAFETY_REPAIR" | "OPTIONAL";
  necessity: AccessoryNecessity;
  quantity: number;
  priceUsd: number | null;
  onboardWeightG: number;
  productUrl?: string;
  reason: { es: string; en: string };
};

const URLS = {
  finder2: "https://www.getfpv.com/batteries/battery-accessories.html?manufacturer=1476",
  finderMini: "https://www.getfpv.com/vifly-finder-mini-drone-buzzer.html",
  shortSaver: "https://pyrodrone.com/products/vifly-short-saver-2",
  batSafe: "https://www.bat-safe.com/product-page/bat-safe",
  batSafeMini: "https://www.bat-safe.com/product-page/bat-safe-mini",
  sequre: "https://sequremall.com/products/sequre-si012-pro-intelligent-oled-electric-soldering-iron-with-adjustable-sensitivity-and-built-in-buzzer-for-t12-ts-soldering-iron-tips-supports-pd-qc-dc5525-power-supply",
  basicTools: "https://www.getfpv.com/tool-kit-w-zipper-case-hex-drivers-needle-nose-pliers.html",
  adapter3: "https://www.speedybee.com/speedybee-adapter-3/",
  air65Frame: "https://betafpv.com/products/air65-ii-brushless-whoop-frame",
  air75Frame: "https://betafpv.com/products/air75-ii-brushless-whoop-frame",
} as const;

function extra(input: RecommendedExtra): RecommendedExtra {
  return input;
}

function propSets(style: UserPreferences["style"], experience: UserPreferences["experience"]): number {
  if (style === "racing") return 10;
  if (style === "longRange") return 3;
  if (style === "cinematic") return 2;
  if (style === "tinywhoop") return experience === "beginner" ? 2 : 4;
  return experience === "beginner" ? 4 : 6;
}

function exactPropLabel(drone: Product): string {
  if (drone.id === "betafpv-air65-ii-freestyle") return "Gemfan 1219S 31mm spare props";
  if (drone.id === "betafpv-air65-ii-racing" || drone.id === "betafpv-air65-ii-champion") {
    return "Current GF1207-profile spare props";
  }
  const stock = drone.aircraftProfile?.prop?.stockPropId;
  if (stock) return `${stock} spare props`;
  return `Exact spare prop set for ${drone.name}`;
}

function propsExtra(drone: Product, prefs: UserPreferences): RecommendedExtra {
  return extra({
    id: `spare-props:${drone.id}`,
    name: exactPropLabel(drone),
    section: "PRACTICAL",
    necessity: "REQUIRED_TO_USE",
    quantity: propSets(prefs.style, prefs.experience),
    priceUsd: null,
    onboardWeightG: 0,
    reason: {
      es: "Las hélices son un consumible habitual; deben coincidir con diámetro, montaje/eje y geometría del dron seleccionado.",
      en: "Props are a normal consumable; diameter, mount/shaft and geometry must match the selected aircraft.",
    },
  });
}

function containmentFor(drone: Product): RecommendedExtra {
  const small = drone.aircraftProfile?.sizeClass.startsWith("WHOOP") ||
    ["MICRO_2", "MICRO_2_5", "CINE_2", "CINE_2_5"].includes(drone.aircraftProfile?.sizeClass ?? "");
  return small
    ? extra({
        id: "bat-safe-mini",
        name: "BAT-SAFE Mini",
        section: "SAFETY_REPAIR",
        necessity: "STRONGLY_RECOMMENDED",
        quantity: 1,
        priceUsd: 49.99,
        productUrl: URLS.batSafeMini,
        onboardWeightG: 0,
        reason: {
          es: "Opción de contención para carga/almacenamiento de packs pequeños; no hace segura la carga desatendida.",
          en: "Containment option for charging/storing smaller packs; it does not make unattended charging safe.",
        },
      })
    : extra({
        id: "bat-safe-standard",
        name: "BAT-SAFE Standard",
        section: "SAFETY_REPAIR",
        necessity: "STRONGLY_RECOMMENDED",
        quantity: 1,
        priceUsd: 79.99,
        productUrl: URLS.batSafe,
        onboardWeightG: 0,
        reason: {
          es: "Contención de mayor confianza para packs grandes dentro de los límites del fabricante; la carga debe seguir supervisada.",
          en: "Higher-confidence containment for larger packs within manufacturer limits; charging still needs supervision.",
        },
      });
}

export function buildRecommendedExtras(drone: Product, prefs: UserPreferences): RecommendedExtra[] {
  const result: RecommendedExtra[] = [propsExtra(drone, prefs)];
  const size = drone.aircraftProfile?.sizeClass;
  const recovery = drone.aircraftProfile?.recovery;
  const isWhoop = size?.startsWith("WHOOP") ?? false;
  const isFive = size === "FREESTYLE_5" || size === "RACE_5";
  const isLongRange = size === "LONG_RANGE_4" || size === "LONG_RANGE_7" || size === "PRO_SPEC_7";
  const outdoor = prefs.environment === "OUTDOOR" || prefs.style === "longRange" || prefs.style === "freestyle";

  if (drone.id.startsWith("betafpv-air65-ii-")) {
    result.push(extra({
      id: "air65-ii-spare-frame",
      name: "BETAFPV Air65 II spare frame",
      section: "PRACTICAL",
      necessity: "STRONGLY_RECOMMENDED",
      quantity: prefs.style === "racing" ? 2 : 1,
      priceUsd: 4.99,
      productUrl: URLS.air65Frame,
      onboardWeightG: 0,
      reason: {
        es: "El frame del whoop es una pieza de desgaste barata; debe ser de la generación Air65 II exacta.",
        en: "The whoop frame is a cheap crash consumable and must match the exact Air65 II generation.",
      },
    }));
  } else if (drone.id.startsWith("betafpv-air75-ii-")) {
    result.push(extra({
      id: "air75-ii-spare-frame",
      name: "BETAFPV Air75 II spare frame",
      section: "PRACTICAL",
      necessity: "STRONGLY_RECOMMENDED",
      quantity: 1,
      priceUsd: 4.99,
      productUrl: URLS.air75Frame,
      onboardWeightG: 0,
      reason: {
        es: "Repuesto económico y específico para la generación Air75 II.",
        en: "Low-cost generation-specific spare for the Air75 II.",
      },
    }));
  }

  if (!isWhoop && (isFive || isLongRange || prefs.style === "cinematic")) {
    result.push(extra({
      id: "basic-fpv-tools",
      name: "Basic FPV hex/plier tool kit",
      section: "PRACTICAL",
      necessity: "REPAIR_REQUIRED",
      quantity: 1,
      priceUsd: 20.99,
      productUrl: URLS.basicTools,
      onboardWeightG: 0,
      reason: {
        es: "Herramientas básicas para mantenimiento de campo; un BNF pequeño no necesita un taller completo el primer día.",
        en: "Basic field-maintenance tools; a small BNF does not need a full workshop on day one.",
      },
    }));
  }

  if (!recovery?.selfPoweredBuzzerIncluded) {
    if (isLongRange || (size === "FREESTYLE_5" && outdoor)) {
      result.push(extra({
        id: "vifly-finder-2",
        name: "VIFLY Finder 2",
        section: "SAFETY_REPAIR",
        necessity: "STRONGLY_RECOMMENDED",
        quantity: 1,
        priceUsd: 19.49,
        productUrl: URLS.finder2,
        onboardWeightG: 5,
        reason: {
          es: "Buzzer con batería propia para recuperar el dron incluso si la batería principal se desconecta. No se incluye por defecto en tinywhoops.",
          en: "Self-powered lost-model buzzer that keeps working if the main battery disconnects. It is not defaulted onto tinywhoops.",
        },
      }));
    } else if (prefs.style === "cinematic" && prefs.environment === "OUTDOOR" && ["CINE_2_5", "CINE_3", "CINE_3_5"].includes(size ?? "")) {
      result.push(extra({
        id: "vifly-finder-mini",
        name: "VIFLY Finder Mini",
        section: "SAFETY_REPAIR",
        necessity: "STRONGLY_RECOMMENDED",
        quantity: 1,
        priceUsd: 20.49,
        productUrl: URLS.finderMini,
        onboardWeightG: 2.7,
        reason: {
          es: "Compromiso de peso más razonable para un cinewhoop/micro exterior; no se recomienda en 65/75 mm.",
          en: "A more reasonable recovery-weight compromise for an outdoor micro/cinewhoop; not recommended on 65/75 mm whoops.",
        },
      }));
    }
  }

  if (!isWhoop && (isFive || isLongRange) && prefs.experience !== "beginner") {
    result.push(extra({
      id: "vifly-shortsaver-2",
      name: "VIFLY ShortSaver 2",
      section: "SAFETY_REPAIR",
      necessity: "REPAIR_REQUIRED",
      quantity: 1,
      priceUsd: 15.99,
      productUrl: URLS.shortSaver,
      onboardWeightG: 0,
      reason: {
        es: "Protección de banco para el primer encendido tras soldar/reparar en 2S–6S; no se usa durante el vuelo.",
        en: "Bench protection for first power-up after soldering/repair on 2S–6S; it is not used in flight.",
      },
    }));
    result.push(extra({
      id: "sequre-si012-pro",
      name: "SEQURE SI012 Pro",
      section: "SAFETY_REPAIR",
      necessity: "REPAIR_REQUIRED",
      quantity: 1,
      priceUsd: 28,
      productUrl: URLS.sequre,
      onboardWeightG: 0,
      reason: {
        es: "Capacidad de soldadura portátil para mantener quads de 3–7 pulgadas a largo plazo.",
        en: "Portable soldering capability for long-term maintenance of typical 3–7 inch quads.",
      },
    }));
  }

  if (prefs.style === "longRange" && prefs.experience !== "beginner") {
    result.push(extra({
      id: "speedybee-adapter-3",
      name: "SpeedyBee Adapter 3",
      section: "OPTIONAL",
      necessity: "OPTIONAL_QUALITY_OF_LIFE",
      quantity: 1,
      priceUsd: 38.48,
      productUrl: URLS.adapter3,
      onboardWeightG: 0,
      reason: {
        es: "Herramienta de configuración de campo útil para firmware/Betaflight/blackbox cuando no quieres depender de un portátil.",
        en: "Useful field configuration tool for firmware/Betaflight/blackbox when you do not want to depend on a laptop.",
      },
    }));
  }

  if (prefs.scope === "FULL_KIT" && prefs.experience !== "advanced") {
    result.push(containmentFor(drone));
  }

  return result;
}

export function pricedExtrasSubtotal(extras: RecommendedExtra[]): number {
  return extras.reduce((sum, item) => sum + (item.priceUsd ?? 0) * item.quantity, 0);
}
