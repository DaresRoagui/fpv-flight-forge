import { buildRecommendedExtras, pricedExtrasSubtotal } from "@/lib/accessories";
import { recommendKit as recommendCore } from "@/lib/recommendation";
import type { KitBundle, Product, RecommendationResult, UserPreferences } from "@/lib/schema";

function decorateBundle(bundle: KitBundle, prefs: UserPreferences): KitBundle {
  const extras = buildRecommendedExtras(bundle.drone, prefs);
  const extrasPrice = pricedExtrasSubtotal(extras);
  return {
    ...bundle,
    extrasPrice,
    totalWithExtras: bundle.corePrice + extrasPrice,
  };
}

export function recommendKitV4(prefs: UserPreferences, products: Product[]): RecommendationResult {
  const result = recommendCore(prefs, products);
  if (result.kind === "kit") {
    return {
      ...result,
      kit: decorateBundle(result.kit, prefs),
      alternatives: result.alternatives?.map((bundle) => decorateBundle(bundle, prefs)),
    };
  }
  return {
    ...result,
    kit: result.kit ? decorateBundle(result.kit, prefs) : undefined,
  };
}
