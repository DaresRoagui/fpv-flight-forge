import { PRODUCT_TRANSLATIONS } from "@/lib/product-translations";
import { Product } from "@/lib/schema";

export type Locale = "es" | "en";
export type Currency = "usd" | "cop";

export const DEFAULT_LOCALE: Locale = "es";
export const DEFAULT_CURRENCY: Currency = "cop";

export const EXCHANGE_RATES: Record<Currency, number> = {
  usd: 1,
  cop: 3200,
};

export type FormatPriceOptions = {
  compact?: boolean;
};

export function formatPrice(
  valueUsd: number,
  currency: Currency,
  options: FormatPriceOptions = {}
): string {
  if (!Number.isFinite(valueUsd)) return "—";
  const rate = EXCHANGE_RATES[currency];
  const value = valueUsd * rate;
  const { compact = false } = options;

  const useCompact = compact && value >= 1_000_000;

  const formatter = new Intl.NumberFormat(currency === "cop" ? "es-CO" : "en-US", {
    style: "currency",
    currency: currency === "cop" ? "COP" : "USD",
    currencyDisplay: "code",
    maximumFractionDigits: 0,
    notation: useCompact ? "compact" : "standard",
    compactDisplay: "short",
  });

  const formatted = formatter.format(value).replace("USD", "US$").replace("COP", "COP$");
  return `≈ ${formatted}`;
}

function getDictValue(obj: unknown, path: string[]): string | undefined {
  if (path.length === 0) return undefined;
  let current: unknown = obj;
  for (const key of path) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

function resolveKey(locale: Locale, key: string): string | undefined {
  const path = key.split(".");
  const value = getDictValue(DICTIONARY[locale], path);
  if (value) return value;
  const fallbackLocale = locale === "es" ? "en" : "es";
  return getDictValue(DICTIONARY[fallbackLocale], path);
}

export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  let value = resolveKey(locale, key) ?? key;
  if (params) {
    Object.entries(params).forEach(([param, paramValue]) => {
      value = value.replace(new RegExp(`\\{${param}\\}`, "g"), String(paramValue));
    });
  }
  return value;
}

export function getLocalizedProduct(product: Product, locale: Locale): Product {
  if (locale === "es") return product;
  const tr = PRODUCT_TRANSLATIONS[product.id];
  if (!tr) return product;
  return {
    ...product,
    description: tr.description ?? product.description,
    idealFor: tr.idealFor ?? product.idealFor,
    limitations: tr.limitations ?? product.limitations,
  };
}

export const DICTIONARY = {
  es: {
    app: { title: "FPV Flight Forge" },
    header: { language: "Idioma", currency: "Moneda" },
    welcome: {
      title: "Arma tu kit FPV perfecto",
      description:
        "Responde cuatro preguntas rápidas y obtén una configuración completa y compatible de dron con gafas, dron, radio, cargador y baterías.",
      start: "Empezar el cuestionario",
    },
    steps: {
      budget: "Presupuesto",
      experience: "Experiencia",
      style: "Estilo",
      video: "Video",
    },
    budget: {
      title: "¿Cuál es tu presupuesto?",
      description: "Presupuesto total para el kit completo en {currency}.",
      exactAmount: "Monto exacto",
      currencyTag: "{currency}",
    },
    experience: { title: "¿Cuál es tu nivel de experiencia?" },
    style: { title: "¿Qué quieres volar?" },
    video: { title: "¿Qué sistema de video prefieres?" },
    options: {
      experience: {
        beginner: { label: "Principiante", desc: "Primer dron, aprendiendo a volar" },
        intermediate: { label: "Intermedio", desc: "Cómodo en manual / acro" },
        advanced: { label: "Avanzado", desc: "Construir, tunear, competir o filmar" },
      },
      style: {
        tinywhoop: { label: "Tiny Whoop", desc: "Interior, seguro, fácil de empezar" },
        freestyle: { label: "Freestyle", desc: "Trucos acro y parques abiertos" },
        cinematic: { label: "Cinemático", desc: "Planos suaves y lentos" },
        longRange: { label: "Long Range", desc: "Crucero y exploración a distancia" },
        racing: { label: "Racing", desc: "Vueltas rápidas y competición" },
      },
      video: {
        analog: { label: "Analógico", desc: "Más barato, menor calidad de imagen" },
        dji_o4: { label: "DJI O4", desc: "HD digital, mejor calidad de imagen" },
        recommend: { label: "Recomendar", desc: "El mejor para mi presupuesto" },
      },
    },
    result: {
      title: "Tu kit",
      description: "Configuración completa y compatible para volar {style}.",
    },
    insufficient: {
      title: "Presupuesto insuficiente",
      description:
        "No pudimos armar un kit {style} con video {videoSystem} dentro de {budget}.",
      minBudget: "Intenta aumentar tu presupuesto a al menos {minBudget}.",
    },
    labels: {
      drone: "Dron",
      goggles: "Gafas",
      radio: "Radio",
      charger: "Cargador",
      batteries: "Baterías",
    },
    composition: { total: "Total" },
    buttons: {
      back: "Atrás",
      continue: "Continuar",
      startOver: "Reiniciar",
      changeBudget: "Cambiar presupuesto",
      shopDrone: "Comprar dron",
      details: "Detalles",
      buy: "Comprar {name}",
    },
    modal: {
      close: "Cerrar",
      keySpecs: "Especificaciones clave",
      idealFor: "Ideal para",
      limitations: "Limitaciones",
      compatibility: "Compatibilidad y fuentes",
      video: "Video",
      protocols: "Protocolos",
      availability: "Disponibilidad",
      verified: "Verificado",
      sources: "Fuentes",
    },
    availability: {
      available: "Disponible",
      unavailable: "No disponible",
      unknown: "Desconocido",
    },
    videoSystem: {
      analog: "Analógico",
      dji_o4: "DJI O4",
      hdzero: "HDZero",
      walksnail: "Walksnail",
    },
    experienceLabel: {
      beginner: "principiante",
      intermediate: "intermedio",
      advanced: "avanzado",
    },
    styleLabel: {
      tinywhoop: "Tiny Whoop",
      freestyle: "Freestyle",
      cinematic: "Cinemático",
      longRange: "Long Range",
      racing: "Racing",
    },
    explanation: {
      introRecommend:
        "Elegimos el sistema {videoSystem} porque equilibra tu presupuesto ({budget}), estilo {style} y nivel {experience}.",
      introFixed: "Kit optimizado para {style} con sistema de video {videoSystem}.",
      drone:
        "El {drone} es el dron {style} en {videoSystem} que mejor equilibra rendimiento, compatibilidad y precio dentro de tu presupuesto.",
      goggles:
        "Las {goggles} comparten el sistema de video {videoSystem} y se ajustan a tu nivel {experience}.",
      radio:
        "La {radio} usa {protocols}, compatible con el receptor del dron y adecuada para tu experiencia.",
      battery:
        "La {battery} ({cells}, conector {connector}) encaja eléctricamente con el dron; recomendamos {batteryQuantity} unidades para {style}.",
      charger:
        "El {charger} puede cargar de forma segura baterías {cells} con conector {connector}.",
      total: "Precio total: {price} con {batteryQuantity} × {batteryName}.",
    },
    currency: { usd: "USD", cop: "COP" },
    keySpecs: {
      resolution: "Resolución",
      fov: "FOV",
      receiver: "Receptor",
      dvr: "DVR",
      weight: "Peso",
      transmission: "Transmisión",
      latency: "Latencia",
      wheelbase: "Distancia entre ejes",
      motors: "Motores",
      vtx: "VTX",
      camera: "Cámara",
      cells: "Celdas",
      connector: "Conector",
      chemistry: "Química",
      gimbals: "Gimbals",
      firmware: "Firmware",
      protocol: "Protocolo",
      battery: "Batería",
      display: "Pantalla",
      supportedCells: "Celdas soportadas",
      ports: "Puertos",
      maxCurrent: "Corriente máxima",
      input: "Entrada",
      maxPower: "Potencia máxima",
      capacity: "Capacidad",
      dischargeRate: "Tasa de descarga",
      voltage: "Voltaje",
    },
  },
  en: {
    app: { title: "FPV Flight Forge" },
    header: { language: "Language", currency: "Currency" },
    welcome: {
      title: "Build your perfect FPV kit",
      description:
        "Answer four quick questions and get a complete, compatible drone setup with goggles, drone, radio, charger and batteries.",
      start: "Start the quiz",
    },
    steps: {
      budget: "Budget",
      experience: "Experience",
      style: "Style",
      video: "Video",
    },
    budget: {
      title: "What is your budget?",
      description: "Total budget for the full kit in {currency}.",
      exactAmount: "Exact amount",
      currencyTag: "{currency}",
    },
    experience: { title: "What is your experience level?" },
    style: { title: "What do you want to fly?" },
    video: { title: "Which video system do you prefer?" },
    options: {
      experience: {
        beginner: { label: "Beginner", desc: "First drone, learning to fly" },
        intermediate: { label: "Intermediate", desc: "Comfortable in manual / acro" },
        advanced: { label: "Advanced", desc: "Building, tuning, racing or filming" },
      },
      style: {
        tinywhoop: { label: "Tiny Whoop", desc: "Indoor, safe, easy to start" },
        freestyle: { label: "Freestyle", desc: "Acro tricks and open park flying" },
        cinematic: { label: "Cinematic", desc: "Smooth, slow footage" },
        longRange: { label: "Long Range", desc: "Distance cruising and exploration" },
        racing: { label: "Racing", desc: "Fast laps and competition" },
      },
      video: {
        analog: { label: "Analog", desc: "Cheapest, lower image quality" },
        dji_o4: { label: "DJI O4", desc: "HD digital, best image quality" },
        recommend: { label: "Recommend", desc: "Best for my budget" },
      },
    },
    result: {
      title: "Your kit",
      description: "Complete, compatible setup tuned for {style} flying.",
    },
    insufficient: {
      title: "Budget too tight",
      description:
        "We could not build a compatible {style} kit with {videoSystem} video within {budget}.",
      minBudget: "Try raising your budget to at least {minBudget}.",
    },
    labels: {
      drone: "Drone",
      goggles: "Goggles",
      radio: "Radio",
      charger: "Charger",
      batteries: "Batteries",
    },
    composition: { total: "Total" },
    buttons: {
      back: "Back",
      continue: "Continue",
      startOver: "Start over",
      changeBudget: "Change budget",
      shopDrone: "Shop drone",
      details: "Details",
      buy: "Buy {name}",
    },
    modal: {
      close: "Close",
      keySpecs: "Key specs",
      idealFor: "Ideal for",
      limitations: "Limitations",
      compatibility: "Compatibility & sources",
      video: "Video",
      protocols: "Protocols",
      availability: "Availability",
      verified: "Verified",
      sources: "Sources",
    },
    availability: {
      available: "Available",
      unavailable: "Unavailable",
      unknown: "Unknown",
    },
    videoSystem: {
      analog: "Analog",
      dji_o4: "DJI O4",
      hdzero: "HDZero",
      walksnail: "Walksnail",
    },
    experienceLabel: {
      beginner: "beginner",
      intermediate: "intermediate",
      advanced: "advanced",
    },
    styleLabel: {
      tinywhoop: "Tiny Whoop",
      freestyle: "Freestyle",
      cinematic: "Cinematic",
      longRange: "Long Range",
      racing: "Racing",
    },
    explanation: {
      introRecommend:
        "We chose the {videoSystem} system because it balances your budget ({budget}), {style} style and {experience} experience level.",
      introFixed: "Kit optimized for {style} with {videoSystem} video system.",
      drone:
        "The {drone} is the best {style} {videoSystem} drone that balances performance, compatibility and price within your budget.",
      goggles:
        "The {goggles} share the {videoSystem} video system and match your {experience} level.",
      radio:
        "The {radio} uses {protocols}, compatible with the drone receiver and suited to your experience.",
      battery:
        "The {battery} ({cells}, {connector} connector) fits the drone electrically; we recommend {batteryQuantity} units for {style}.",
      charger:
        "The {charger} can safely charge {cells} batteries with a {connector} connector.",
      total: "Total price: {price} with {batteryQuantity} × {batteryName}.",
    },
    currency: { usd: "USD", cop: "COP" },
    keySpecs: {
      resolution: "Resolution",
      fov: "FOV",
      receiver: "Receiver",
      dvr: "DVR",
      weight: "Weight",
      transmission: "Transmission",
      latency: "Latency",
      wheelbase: "Wheelbase",
      motors: "Motors",
      vtx: "VTX",
      camera: "Camera",
      cells: "Cells",
      connector: "Connector",
      chemistry: "Chemistry",
      gimbals: "Gimbals",
      firmware: "Firmware",
      protocol: "Protocol",
      battery: "Battery",
      display: "Display",
      supportedCells: "Supported cells",
      ports: "Ports",
      maxCurrent: "Max current",
      input: "Input",
      maxPower: "Max power",
      capacity: "Capacity",
      dischargeRate: "Discharge rate",
      voltage: "Voltage",
    },
  },
} as const;

export type Dictionary = typeof DICTIONARY;
