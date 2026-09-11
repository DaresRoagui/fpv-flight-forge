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

export const CATALOG_V2: Record<"es" | "en", CatalogDictionary> = {
  es: unwrap(esRaw as { fpvCatalogV2?: CatalogDictionary } & Record<string, unknown>),
  en: unwrap(enRaw as { fpvCatalogV2?: CatalogDictionary } & Record<string, unknown>),
};
