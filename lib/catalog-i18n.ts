import esRaw from "@/data/i18n-es-additions.json";
import enRaw from "@/data/i18n-en-additions.json";

export type CatalogDictionary = Record<string, unknown>;

function convertPlaceholders(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(/\{\{/g, "{").replace(/\}\}/g, "}");
  }
  if (Array.isArray(value)) {
    return value.map(convertPlaceholders);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [key, convertPlaceholders(v)])
    );
  }
  return value;
}

function unwrap(raw: { fpvCatalogV2?: CatalogDictionary } & Record<string, unknown>): CatalogDictionary {
  return convertPlaceholders(raw.fpvCatalogV2 ?? {}) as CatalogDictionary;
}

const FINAL_RECOMMENDATION_TEXT: Record<"es" | "en", CatalogDictionary> = {
  es: {
    recommendation: {
      bundleStyleFit: "La plataforma encaja con el estilo de vuelo seleccionado.",
      hardCompatibilityPassed: "Todos los componentes superaron la compatibilidad técnica obligatoria.",
    },
  },
  en: {
    recommendation: {
      bundleStyleFit: "The platform fits the selected flight style.",
      hardCompatibilityPassed: "Every component passed the required hard compatibility checks.",
    },
  },
};

function withFinalText(locale: "es" | "en", raw: { fpvCatalogV2?: CatalogDictionary } & Record<string, unknown>): CatalogDictionary {
  const base = unwrap(raw);
  const final = FINAL_RECOMMENDATION_TEXT[locale];
  return {
    ...base,
    ...final,
    recommendation: {
      ...((base.recommendation as CatalogDictionary | undefined) ?? {}),
      ...((final.recommendation as CatalogDictionary | undefined) ?? {}),
    },
  };
}

export const CATALOG_V2: Record<"es" | "en", CatalogDictionary> = {
  es: withFinalText("es", esRaw as { fpvCatalogV2?: CatalogDictionary } & Record<string, unknown>),
  en: withFinalText("en", enRaw as { fpvCatalogV2?: CatalogDictionary } & Record<string, unknown>),
};
