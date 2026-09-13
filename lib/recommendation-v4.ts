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

export function regulatoryWeightPreference(bundle: KitBundle, prefs: UserPreferences): number {
  if (!prefs.preferSimplerWeightClass) return 0;
  const assessment = bundle.regulatory;
  const threshold = assessment?.weightThresholdG;
  const weight = assessment?.estimatedTakeoffWeightG;
  if (threshold === null || threshold === undefined || weight === null || weight === undefined) return 0;

  // This is deliberately a secondary preference, never a compatibility rule.
  // Staying below a known jurisdictional threshold can break a close tie, while
  // a technically better valid bundle is still allowed to win.
  return weight < threshold ? 0.55 : -0.15;
}

function baseScore(bundle: KitBundle): number {
  return bundle.score ?? bundle.scoreBreakdown?.total ?? 0;
}

function effectiveScore(bundle: KitBundle, prefs: UserPreferences): number {
  return baseScore(bundle) + regulatoryWeightPreference(bundle, prefs);
}

function signature(bundle: KitBundle): string {
  return [bundle.drone.id, bundle.battery.id, bundle.goggles?.id ?? "-", bundle.radio?.id ?? "-", bundle.charger?.id ?? "-"].join("|");
}

function rerankForRegulatoryPreference(
  primary: KitBundle,
  alternatives: KitBundle[],
  prefs: UserPreferences
): { primary: KitBundle; alternatives: KitBundle[] } {
  if (!prefs.preferSimplerWeightClass || alternatives.length === 0) {
    return { primary, alternatives };
  }

  const pool = [primary, ...alternatives]
    .map((bundle) => ({ ...bundle }))
    .sort((a, b) => {
      const delta = effectiveScore(b, prefs) - effectiveScore(a, prefs);
      if (delta !== 0) return delta;
      if (a.totalPrice !== b.totalPrice) return a.totalPrice - b.totalPrice;
      return signature(a).localeCompare(signature(b));
    });

  const winner = pool[0];
  winner.alternativeRole = "PRIMARY";
  const remaining = pool.slice(1);
  const value = [...remaining]
    .filter((bundle) => bundle.totalPrice < winner.totalPrice * 0.98)
    .sort((a, b) => a.totalPrice - b.totalPrice || signature(a).localeCompare(signature(b)))[0];
  const premium = [...remaining]
    .filter((bundle) => signature(bundle) !== (value ? signature(value) : "") && bundle.totalPrice > winner.totalPrice * 1.05)
    .sort((a, b) => baseScore(b) - baseScore(a) || a.totalPrice - b.totalPrice || signature(a).localeCompare(signature(b)))[0];

  const nextAlternatives: KitBundle[] = [];
  if (value) {
    value.alternativeRole = "VALUE";
    nextAlternatives.push(value);
  }
  if (premium) {
    premium.alternativeRole = "PREMIUM";
    nextAlternatives.push(premium);
  }

  // If price bands do not produce typed alternatives, keep the strongest
  // remaining compatible option instead of silently discarding it.
  if (nextAlternatives.length === 0 && remaining[0]) {
    const fallback = remaining[0];
    fallback.alternativeRole = fallback.totalPrice <= winner.totalPrice ? "VALUE" : "PREMIUM";
    nextAlternatives.push(fallback);
  }

  return { primary: winner, alternatives: nextAlternatives };
}

export function recommendKitV4(prefs: UserPreferences, products: Product[]): RecommendationResult {
  const result = recommendCore(prefs, products);
  if (result.kind === "kit") {
    const decoratedPrimary = decorateBundle(result.kit, prefs);
    const decoratedAlternatives = (result.alternatives ?? []).map((bundle) => decorateBundle(bundle, prefs));
    const ranked = rerankForRegulatoryPreference(decoratedPrimary, decoratedAlternatives, prefs);
    return {
      ...result,
      kit: ranked.primary,
      ...(ranked.alternatives.length ? { alternatives: ranked.alternatives } : { alternatives: undefined }),
    };
  }
  return {
    ...result,
    kit: result.kit ? decorateBundle(result.kit, prefs) : undefined,
  };
}
