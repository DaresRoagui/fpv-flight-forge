import type {
  BundleItem,
  FlightStyle,
  KitBundle,
  OwnedGearConflict,
  Product,
  ProductCategory,
  RecommendationResult,
  UserPreferences,
  VideoSystem,
  Warning,
} from "@/lib/schema";
import {
  batteryMatchesDrone,
  chargerMatchesBattery,
  flightStyleMatches,
  protocolMatches,
  styleIsRecommended,
  videoSystemMatches,
} from "@/lib/compat";
import { getCuratedComponentRecord } from "@/data/curated-components";
import { assessRegulation } from "@/lib/regulation";
import {
  batteryFitScore,
  chargerFitScore,
  droneFitScore,
  goggleFitScore,
  radioFitScore,
  scoreBundleNormalized,
} from "@/lib/recommendation-scoring";

const DEFAULT_BATTERY_QTY: Record<FlightStyle, number> = {
  tinywhoop: 6,
  cinematic: 3,
  longRange: 2,
  racing: 8,
  freestyle: 4,
};

const REQUIRED_EXTRA_PRICES = {
  psu: 35,
  radioCells: 25,
  chargeAdapter: 8,
};

const OPTIONAL_EXTRA_PRICES = {
  props: 8,
  straps: 5,
  basicTools: 15,
  spareFrame: 15,
  buzzer: 10,
};

const PRUNE = {
  dronesPerSystem: 8,
  batteriesPerDrone: 4,
  gogglesPerDrone: 3,
  radiosPerDrone: 3,
  chargersPerBattery: 3,
};

type CandidateChoice = {
  product: Product;
  owned: boolean;
  warnings: Warning[];
};

type ScoredBundle = KitBundle & { score: number };

const batteryQuantity = (style: FlightStyle) => DEFAULT_BATTERY_QTY[style] ?? 4;

function videoSystemLabel(videoSystem: VideoSystem): string {
  if (videoSystem === "dji_o4") return "DJI O4";
  if (videoSystem === "dji_o3") return "DJI O3";
  if (videoSystem === "hdzero") return "HDZero";
  if (videoSystem === "analog") return "analógico";
  return videoSystem;
}

function stableProductSort<T extends { product: Product; score: number }>(a: T, b: T): number {
  if (b.score !== a.score) return b.score - a.score;
  if (a.product.priceUsd !== b.product.priceUsd) return a.product.priceUsd - b.product.priceUsd;
  return a.product.id.localeCompare(b.product.id);
}

function pruneChoices(
  choices: CandidateChoice[],
  limit: number,
  scorer: (product: Product) => number
): CandidateChoice[] {
  return choices
    .map((choice) => ({ ...choice, score: scorer(choice.product) }))
    .sort(stableProductSort)
    .slice(0, limit)
    .map(({ score: _score, ...choice }) => choice);
}

function optionalExtrasPrice(drone: Product, style: FlightStyle): number {
  let total = OPTIONAL_EXTRA_PRICES.props;
  if (style === "tinywhoop") total += OPTIONAL_EXTRA_PRICES.spareFrame;
  if (style === "freestyle" || style === "racing") {
    total += OPTIONAL_EXTRA_PRICES.straps + OPTIONAL_EXTRA_PRICES.basicTools;
  }
  if (style === "cinematic") total += OPTIONAL_EXTRA_PRICES.straps;
  if (style === "longRange" && !drone.aircraftProfile?.recovery.selfPoweredBuzzerIncluded) {
    total += OPTIONAL_EXTRA_PRICES.buzzer;
  }
  return total;
}

function ownedIdFor(category: Exclude<ProductCategory, "drone" | "battery">, prefs: UserPreferences): string | undefined {
  if (category === "goggles") return prefs.ownedGear?.gogglesProductId;
  if (category === "radio") return prefs.ownedGear?.radioProductId;
  if (category === "charger") return prefs.ownedGear?.chargerProductId;
  return undefined;
}

function ownedConflict(
  category: Exclude<ProductCategory, "drone">,
  productId: string,
  reasonKey: string
): OwnedGearConflict {
  return { category, productId, reasonKey };
}

function conflictWarning(conflict: OwnedGearConflict): Warning {
  return {
    type: "OWNED_GEAR_CONFLICT",
    messageKey: conflict.reasonKey,
    params: { category: conflict.category, product: conflict.productId },
  };
}

function resolveStaticChoices(
  category: "goggles" | "radio",
  prefs: UserPreferences,
  products: Product[],
  drone: Product,
  score: (product: Product) => number
): { choices: CandidateChoice[]; conflicts: OwnedGearConflict[] } {
  const source = products.filter((product) => product.category === category);
  const compatible = (product: Product) =>
    category === "goggles" ? videoSystemMatches(product, drone) : protocolMatches(product, drone);
  const normal = source.filter(compatible).map((product) => ({ product, owned: false, warnings: [] }));
  const conflicts: OwnedGearConflict[] = [];

  if ((prefs.scope ?? "FULL_KIT") === "COMPLETE_EXISTING_SETUP") {
    const ownedId = ownedIdFor(category, prefs);
    if (ownedId) {
      const owned = source.find((product) => product.id === ownedId);
      if (owned && compatible(owned)) {
        return { choices: [{ product: owned, owned: true, warnings: [] }], conflicts };
      }
      conflicts.push(ownedConflict(category, ownedId, "ownedGear.incompatible"));
    }
  }

  const limit = category === "goggles" ? PRUNE.gogglesPerDrone : PRUNE.radiosPerDrone;
  return { choices: pruneChoices(normal, limit, score), conflicts };
}

function resolveBatteryChoices(
  prefs: UserPreferences,
  products: Product[],
  drone: Product
): { choices: CandidateChoice[]; conflicts: OwnedGearConflict[] } {
  const batteries = products.filter((product) => product.category === "battery");
  const valid = batteries
    .map((product) => ({ product, match: batteryMatchesDrone(product, drone) }))
    .filter(({ match }) => match.state !== "HARD_INVALID");
  const conflicts: OwnedGearConflict[] = [];

  if ((prefs.scope ?? "FULL_KIT") === "COMPLETE_EXISTING_SETUP" && prefs.ownedGear?.batteryProductIds?.length) {
    const ownedChoices: CandidateChoice[] = [];
    for (const ownedId of prefs.ownedGear.batteryProductIds) {
      const owned = batteries.find((product) => product.id === ownedId);
      if (!owned) {
        conflicts.push(ownedConflict("battery", ownedId, "ownedGear.notInCatalog"));
        continue;
      }
      const match = batteryMatchesDrone(owned, drone);
      if (match.state === "HARD_INVALID") {
        conflicts.push(ownedConflict("battery", ownedId, "ownedGear.batteryIncompatible"));
        continue;
      }
      ownedChoices.push({ product: owned, owned: true, warnings: match.warnings });
    }
    if (ownedChoices.length > 0) {
      return {
        choices: pruneChoices(ownedChoices, PRUNE.batteriesPerDrone, (product) => batteryFitScore(product, drone, prefs)),
        conflicts,
      };
    }
  }

  return {
    choices: pruneChoices(
      valid.map(({ product, match }) => ({ product, owned: false, warnings: match.warnings })),
      PRUNE.batteriesPerDrone,
      (product) => batteryFitScore(product, drone, prefs)
    ),
    conflicts,
  };
}

function resolveChargerChoices(
  prefs: UserPreferences,
  products: Product[],
  battery: Product
): { choices: CandidateChoice[]; conflicts: OwnedGearConflict[] } {
  const chargers = products.filter((product) => product.category === "charger");
  const conflicts: OwnedGearConflict[] = [];
  const compatible = chargers
    .map((product) => ({ product, match: chargerMatchesBattery(product, battery) }))
    .filter(({ match }) => match.state !== "HARD_INVALID")
    .map(({ product, match }) => ({ product, owned: false, warnings: match.warnings }));

  if ((prefs.scope ?? "FULL_KIT") === "COMPLETE_EXISTING_SETUP") {
    const ownedId = prefs.ownedGear?.chargerProductId;
    if (ownedId) {
      const owned = chargers.find((product) => product.id === ownedId);
      if (owned) {
        const match = chargerMatchesBattery(owned, battery);
        if (match.state !== "HARD_INVALID") {
          return { choices: [{ product: owned, owned: true, warnings: match.warnings }], conflicts };
        }
      }
      conflicts.push(ownedConflict("charger", ownedId, "ownedGear.chargerIncompatible"));
    }
  }

  return {
    choices: pruneChoices(compatible, PRUNE.chargersPerBattery, (product) => chargerFitScore(product, battery, prefs)),
    conflicts,
  };
}

function requiredExtrasCost(
  scope: UserPreferences["scope"],
  radio: CandidateChoice | undefined,
  charger: CandidateChoice | undefined,
  battery: Product
): { price: number; warnings: Warning[] } {
  if (scope === "DRONE_ONLY") return { price: 0, warnings: [] };

  let price = 0;
  const warnings: Warning[] = [];

  if (radio && !radio.owned) {
    const radioProfile = getCuratedComponentRecord(radio.product.id)?.radioProfile;
    if (radioProfile?.batteryIncluded === false) price += REQUIRED_EXTRA_PRICES.radioCells;
  }

  if (charger) {
    const match = chargerMatchesBattery(charger.product, battery);
    const chargerProfile = getCuratedComponentRecord(charger.product.id)?.chargerProfile;
    if (charger.product.requiresPsu || chargerProfile?.requiresExternalPsu) {
      price += REQUIRED_EXTRA_PRICES.psu;
      warnings.push({ type: "REQUIRES_PSU", messageKey: "warnings.requiresPsu" });
    }
    if (match.state === "INCOMPLETE_KIT" && !(charger.product.requiresPsu || chargerProfile?.requiresExternalPsu)) {
      price += REQUIRED_EXTRA_PRICES.chargeAdapter;
    }
  }

  return { price, warnings };
}

function buildBundleFromChoices(
  prefs: UserPreferences,
  drone: Product,
  batteryChoice: CandidateChoice,
  gogglesChoice: CandidateChoice | undefined,
  radioChoice: CandidateChoice | undefined,
  chargerChoice: CandidateChoice | undefined,
  conflicts: OwnedGearConflict[]
): ScoredBundle | null {
  const scope = prefs.scope ?? "FULL_KIT";
  const qty = batteryQuantity(prefs.style);

  if (scope !== "DRONE_ONLY" && (!gogglesChoice || !radioChoice || !chargerChoice)) return null;
  if (gogglesChoice && !videoSystemMatches(gogglesChoice.product, drone)) return null;
  if (radioChoice && !protocolMatches(radioChoice.product, drone)) return null;
  if (batteryMatchesDrone(batteryChoice.product, drone).state === "HARD_INVALID") return null;
  if (chargerChoice && chargerMatchesBattery(chargerChoice.product, batteryChoice.product).state === "HARD_INVALID") return null;
  if (scope !== "DRONE_ONLY" && gogglesChoice?.product.requiresReceiverModule) return null;

  const items: BundleItem[] = [];
  let productPrice = 0;
  const addItem = (
    category: ProductCategory,
    product: Product,
    owned: boolean,
    includedInPrice: boolean,
    referenceOnly = false,
    quantity = 1
  ) => {
    items.push({ category, product, owned, includedInPrice, referenceOnly, quantity });
    if (includedInPrice) productPrice += product.priceUsd * quantity;
  };

  addItem("drone", drone, false, true);

  if (scope === "DRONE_ONLY") {
    addItem("battery", batteryChoice.product, false, false, true, qty);
    if (gogglesChoice) addItem("goggles", gogglesChoice.product, false, false, true);
    if (radioChoice) addItem("radio", radioChoice.product, false, false, true);
    if (chargerChoice) addItem("charger", chargerChoice.product, false, false, true);
  } else {
    addItem("battery", batteryChoice.product, batteryChoice.owned, !batteryChoice.owned, false, qty);
    if (gogglesChoice) addItem("goggles", gogglesChoice.product, gogglesChoice.owned, !gogglesChoice.owned);
    if (radioChoice) addItem("radio", radioChoice.product, radioChoice.owned, !radioChoice.owned);
    if (chargerChoice) addItem("charger", chargerChoice.product, chargerChoice.owned, !chargerChoice.owned);
  }

  const requiredExtras = requiredExtrasCost(scope, radioChoice, chargerChoice, batteryChoice.product);
  const totalPrice = productPrice + requiredExtras.price;
  const warnings: Warning[] = [
    ...batteryChoice.warnings,
    ...(chargerChoice?.warnings ?? []),
    ...requiredExtras.warnings,
    ...conflicts.map(conflictWarning),
  ];

  if (prefs.style === "racing" && drone.aircraftProfile?.video.system === "dji_o4") {
    warnings.push({ type: "RACING_COMPROMISE", messageKey: "warnings.racingO4Compromise" });
  }
  if (drone.priceNote?.toLowerCase().includes("budget proxy")) {
    warnings.push({ type: "PRICE_ESTIMATE", messageKey: "warnings.priceEstimate" });
  }

  const bundle: KitBundle = {
    scope,
    drone,
    battery: batteryChoice.product,
    batteryQuantity: qty,
    goggles: gogglesChoice?.product,
    radio: radioChoice?.product,
    charger: chargerChoice?.product,
    items,
    totalPrice,
    corePrice: totalPrice,
    extrasPrice: optionalExtrasPrice(drone, prefs.style),
    totalWithExtras: totalPrice + optionalExtrasPrice(drone, prefs.style),
    explanation: "",
    reasons: [
      { category: "STYLE", messageKey: "recommendation.bundleStyleFit", params: { drone: drone.name } },
      { category: "COMPATIBILITY", messageKey: "recommendation.hardCompatibilityPassed" },
    ],
    warnings,
    ownedGearConflicts: conflicts.length ? conflicts : undefined,
    regulatory: assessRegulation(
      drone,
      batteryChoice.product,
      prefs.regulatoryRegion ?? "OTHER",
      prefs.operationPurpose ?? "RECREATIONAL"
    ),
  };

  if (scope === "COMPLETE_EXISTING_SETUP") {
    for (const item of items.filter((item) => item.owned)) {
      bundle.reasons.push({
        category: "VALUE",
        messageKey: "ownedGear.compatibleReuse",
        params: { product: item.product.name },
      });
    }
  }

  const breakdown = scoreBundleNormalized(bundle, prefs);
  bundle.scoreBreakdown = breakdown;
  bundle.score = breakdown.total;
  return bundle as ScoredBundle;
}

function generateBundlesForDrone(
  prefs: UserPreferences,
  products: Product[],
  drone: Product
): ScoredBundle[] {
  const scope = prefs.scope ?? "FULL_KIT";
  const batteryResult = resolveBatteryChoices(prefs, products, drone);
  if (batteryResult.choices.length === 0) return [];

  const gogglesResult = resolveStaticChoices(
    "goggles",
    prefs,
    products,
    drone,
    (product) => goggleFitScore(product, drone, prefs)
  );
  const radioResult = resolveStaticChoices(
    "radio",
    prefs,
    products,
    drone,
    (product) => radioFitScore(product, drone, prefs)
  );

  if (scope !== "DRONE_ONLY" && (gogglesResult.choices.length === 0 || radioResult.choices.length === 0)) return [];

  const gogglesChoices = scope === "DRONE_ONLY" ? gogglesResult.choices.slice(0, 1) : gogglesResult.choices;
  const radioChoices = scope === "DRONE_ONLY" ? radioResult.choices.slice(0, 1) : radioResult.choices;
  const bundles: ScoredBundle[] = [];

  for (const battery of batteryResult.choices) {
    const chargerResult = resolveChargerChoices(prefs, products, battery.product);
    if (scope !== "DRONE_ONLY" && chargerResult.choices.length === 0) continue;
    const chargerChoices = scope === "DRONE_ONLY" ? chargerResult.choices.slice(0, 1) : chargerResult.choices;
    const conflicts = [...batteryResult.conflicts, ...gogglesResult.conflicts, ...radioResult.conflicts, ...chargerResult.conflicts];

    const gs: Array<CandidateChoice | undefined> = gogglesChoices.length ? gogglesChoices : [undefined];
    const rs: Array<CandidateChoice | undefined> = radioChoices.length ? radioChoices : [undefined];
    const cs: Array<CandidateChoice | undefined> = chargerChoices.length ? chargerChoices : [undefined];

    for (const goggles of gs) {
      for (const radio of rs) {
        for (const charger of cs) {
          const bundle = buildBundleFromChoices(prefs, drone, battery, goggles, radio, charger, conflicts);
          if (bundle) bundles.push(bundle);
        }
      }
    }
  }

  return bundles;
}

function systemsFor(prefs: UserPreferences): VideoSystem[] {
  if (prefs.videoSystem !== "recommend") return [prefs.videoSystem];
  if (prefs.style === "racing") return ["hdzero", "analog", "dji_o4"];
  return ["analog", "dji_o4"];
}

function eligibleDronesForSystem(
  prefs: UserPreferences,
  products: Product[],
  videoSystem: VideoSystem
): Product[] {
  return products
    .filter((product) => product.category === "drone")
    .filter((drone) => (drone.aircraftProfile?.video.system ?? drone.videoSystems[0]) === videoSystem || drone.videoSystems.includes(videoSystem))
    .filter((drone) => styleIsRecommended(drone, prefs.style) || flightStyleMatches(drone, prefs.style))
    .filter((drone) => {
      if (prefs.experience !== "beginner") return true;
      return drone.experienceLevel.includes("beginner") || drone.experienceLevel.includes("intermediate");
    })
    .map((product) => ({ product, score: droneFitScore(product, prefs) }))
    .sort(stableProductSort)
    .slice(0, PRUNE.dronesPerSystem)
    .map(({ product }) => product);
}

function bundleSignature(bundle: KitBundle): string {
  return [
    bundle.drone.id,
    bundle.battery.id,
    bundle.goggles?.id ?? "-",
    bundle.radio?.id ?? "-",
    bundle.charger?.id ?? "-",
  ].join("|");
}

function sortBundles(a: ScoredBundle, b: ScoredBundle): number {
  if (b.score !== a.score) return b.score - a.score;
  if (a.totalPrice !== b.totalPrice) return a.totalPrice - b.totalPrice;
  return bundleSignature(a).localeCompare(bundleSignature(b));
}

function chooseAlternatives(primary: ScoredBundle, candidates: ScoredBundle[]): KitBundle[] {
  const remaining = candidates.filter((candidate) => bundleSignature(candidate) !== bundleSignature(primary));
  if (remaining.length === 0) return [];

  const closeEnough = remaining.filter((candidate) => candidate.score >= primary.score - 1.5);
  const valuePool = closeEnough.length ? closeEnough : remaining;
  const value = [...valuePool].sort((a, b) => {
    if (a.totalPrice !== b.totalPrice) return a.totalPrice - b.totalPrice;
    return sortBundles(a, b);
  })[0];

  const premiumPool = remaining.filter(
    (candidate) =>
      bundleSignature(candidate) !== bundleSignature(value) &&
      candidate.totalPrice > primary.totalPrice * 1.05
  );
  const premium = premiumPool.sort((a, b) => {
    const aQuality = (a.scoreBreakdown?.droneStyleFit ?? 0) + (a.scoreBreakdown?.gogglesFit ?? 0) + (a.scoreBreakdown?.futureProofing ?? 0);
    const bQuality = (b.scoreBreakdown?.droneStyleFit ?? 0) + (b.scoreBreakdown?.gogglesFit ?? 0) + (b.scoreBreakdown?.futureProofing ?? 0);
    if (bQuality !== aQuality) return bQuality - aQuality;
    return sortBundles(a, b);
  })[0];

  const alternatives: KitBundle[] = [];
  if (value && value.totalPrice < primary.totalPrice * 0.98) {
    value.alternativeRole = "VALUE";
    alternatives.push(value);
  }
  if (premium) {
    premium.alternativeRole = "PREMIUM";
    alternatives.push(premium);
  }
  return alternatives;
}

export function recommendKit(prefs: UserPreferences, products: Product[]): RecommendationResult {
  const systems = systemsFor(prefs);
  const allCandidates: ScoredBundle[] = [];
  const seen = new Set<string>();

  for (const system of systems) {
    for (const drone of eligibleDronesForSystem(prefs, products, system)) {
      const key = `${system}:${drone.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      allCandidates.push(...generateBundlesForDrone(prefs, products, drone));
    }
  }

  if (allCandidates.length === 0) {
    return {
      kind: "insufficient",
      minBudget: Infinity,
      message: "No pudimos construir un bundle técnicamente completo con las restricciones actuales.",
    };
  }

  const withinBudget = allCandidates.filter((candidate) => candidate.totalPrice <= prefs.budget).sort(sortBundles);
  if (withinBudget.length === 0) {
    const cheapest = [...allCandidates].sort((a, b) => {
      if (a.totalPrice !== b.totalPrice) return a.totalPrice - b.totalPrice;
      return sortBundles(a, b);
    })[0];
    return {
      kind: "insufficient",
      minBudget: cheapest.totalPrice,
      message: `No encontramos un kit completo recomendable dentro de US$${prefs.budget}. El mínimo compatible actual es aproximadamente US$${cheapest.totalPrice.toFixed(2)} en ${videoSystemLabel(cheapest.drone.aircraftProfile?.video.system ?? cheapest.drone.videoSystems[0])}.`,
      kit: cheapest,
    };
  }

  const primary = withinBudget[0];
  primary.alternativeRole = "PRIMARY";
  const alternatives = chooseAlternatives(primary, withinBudget);
  return { kind: "kit", kit: primary, ...(alternatives.length ? { alternatives } : {}) };
}
