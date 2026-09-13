import { z } from "zod";

export const videoSystemSchema = z.enum([
  "analog",
  "dji_o3",
  "dji_o4",
  "hdzero",
  "walksnail",
]);
export type VideoSystem = z.infer<typeof videoSystemSchema>;

export const controlProtocolSchema = z.enum([
  "elrs_2.4",
  "elrs_900",
  "gemini_x",
  "crossfire",
  "tracer",
  "frsky",
  "ghost",
]);
export type ControlProtocol = z.infer<typeof controlProtocolSchema>;

export const flightStyleSchema = z.enum([
  "tinywhoop",
  "freestyle",
  "cinematic",
  "longRange",
  "racing",
]);
export type FlightStyle = z.infer<typeof flightStyleSchema>;

export const experienceLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);
export type ExperienceLevel = z.infer<typeof experienceLevelSchema>;

export const productCategorySchema = z.enum([
  "goggles",
  "drone",
  "radio",
  "charger",
  "battery",
]);
export type ProductCategory = z.infer<typeof productCategorySchema>;

export const availabilitySchema = z.enum(["available", "unavailable", "unknown"]);
export type Availability = z.infer<typeof availabilitySchema>;

export const productStateSchema = z.enum([
  "CORE",
  "CORE_VALUE",
  "CORE_PREMIUM",
  "CORE_SPECIALIST",
  "CONDITIONAL",
  "WATCHLIST",
  "DO_NOT_DEFAULT",
  "LEGACY",
]);
export type ProductState = z.infer<typeof productStateSchema>;

export const purchaseRouteSchema = z.enum([
  "ALIEXPRESS",
  "DIRECT_MANUFACTURER",
  "US_RETAILER",
  "COLOMBIA_LOCAL_VERIFIED",
]);
export type PurchaseRoute = z.infer<typeof purchaseRouteSchema>;

export const aircraftSizeClassSchema = z.enum([
  "WHOOP_65_1S",
  "WHOOP_75_1S",
  "WHOOP_75_85_2S",
  "MICRO_2",
  "MICRO_2_5",
  "MICRO_3",
  "MICRO_3_5",
  "CINE_2",
  "CINE_2_5",
  "CINE_3",
  "CINE_3_5",
  "FREESTYLE_5",
  "RACE_5",
  "LONG_RANGE_4",
  "LONG_RANGE_7",
  "PRO_SPEC_7",
]);
export type AircraftSizeClass = z.infer<typeof aircraftSizeClassSchema>;

export const recommendationScopeSchema = z.enum([
  "FULL_KIT",
  "DRONE_ONLY",
  "COMPLETE_EXISTING_SETUP",
]);
export type RecommendationScope = z.infer<typeof recommendationScopeSchema>;

export const advancedPrioritySchema = z.enum([
  "BALANCED",
  "LOW_LATENCY",
  "IMAGE_QUALITY",
  "VALUE",
  "PORTABILITY",
  "FLIGHT_TIME",
  "REPAIRABILITY",
]);
export type AdvancedPriority = z.infer<typeof advancedPrioritySchema>;

export const flightEnvironmentSchema = z.enum([
  "INDOOR_TIGHT",
  "MIXED",
  "OUTDOOR",
]);
export type FlightEnvironment = z.infer<typeof flightEnvironmentSchema>;

export const regulatoryRegionSchema = z.enum(["CO", "US", "EU_EASA", "OTHER"]);
export type RegulatoryRegion = z.infer<typeof regulatoryRegionSchema>;

export const operationPurposeSchema = z.enum([
  "RECREATIONAL",
  "COMMERCIAL_OR_SPECIFIC",
  "NOT_SURE",
]);
export type OperationPurpose = z.infer<typeof operationPurposeSchema>;

export const capacityRangeSchema = z.object({
  min: z.number().nonnegative(),
  idealMin: z.number().nonnegative(),
  idealMax: z.number().nonnegative(),
  max: z.number().nonnegative(),
});
export type CapacityRange = z.infer<typeof capacityRangeSchema>;

export const aircraftProfileSchema = z.object({
  sizeClass: aircraftSizeClassSchema,
  flightRoles: z.array(z.string()).default([]),
  video: z.object({
    system: videoSystemSchema,
    unit: z.string().optional(),
  }),
  control: z.object({
    protocol: controlProtocolSchema,
    band: z.enum(["2.4GHz", "900MHz", "DUAL"]).optional(),
  }),
  battery: z.object({
    cellsAllowed: z.array(z.number().int().positive()),
    chemistriesAllowed: z.array(z.string()),
    capacityMah: capacityRangeSchema,
    maxBatteryWeightG: z.number().nonnegative().optional(),
    connector: z.string(),
    maxFullVoltageV: z.number().nonnegative().optional(),
  }),
  prop: z.object({
    diameterIn: z.number().nonnegative().optional(),
    diameterMm: z.number().nonnegative().optional(),
    shaftMm: z.number().nonnegative().optional(),
    mount: z.string().optional(),
    stockPropId: z.string().optional(),
  }).optional(),
  recovery: z.object({
    gpsIncluded: z.boolean().default(false),
    selfPoweredBuzzerIncluded: z.boolean().default(false),
  }).default({ gpsIncluded: false, selfPoweredBuzzerIncluded: false }),
  dryWeightG: z.number().nonnegative().optional(),
  payloadWeightG: z.number().nonnegative().optional(),
  mandatoryOnboardWeightG: z.number().nonnegative().optional(),
});
export type AircraftProfile = z.infer<typeof aircraftProfileSchema>;

export const flightTimeReferenceSchema = z.object({
  minMinutes: z.number().nonnegative().optional(),
  maxMinutes: z.number().nonnegative().optional(),
  sourceType: z.enum(["MANUFACTURER", "INDEPENDENT", "COMMUNITY"]),
  conditions: z.string().optional(),
});
export type FlightTimeReference = z.infer<typeof flightTimeReferenceSchema>;

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  category: productCategorySchema,
  subcategory: z.string().optional(),
  priceUsd: z.number().nonnegative(),
  priceNote: z.string().optional(),
  rating: z.number().min(0).max(10).optional().default(5),
  videoSystems: z.array(videoSystemSchema),
  protocols: z.array(controlProtocolSchema),
  flightStyles: z.array(flightStyleSchema),
  experienceLevel: z.array(experienceLevelSchema),
  compatibleStyles: z.array(flightStyleSchema).optional(),
  recommendedStyles: z.array(flightStyleSchema).optional(),
  state: productStateSchema.optional(),
  purchaseRoutes: z.array(purchaseRouteSchema).optional(),
  repairabilityScore: z.number().min(0).max(10).optional(),
  partsAvailabilityScore: z.number().min(0).max(10).optional(),
  maintenanceDifficulty: z.enum(["EASY", "MODERATE", "ADVANCED"]).optional(),
  flightTimeReference: flightTimeReferenceSchema.optional(),
  weightG: z.number().nonnegative().optional(),
  aircraftProfile: aircraftProfileSchema.optional(),
  requiresPsu: z.boolean().optional(),
  requiresReceiverModule: z.boolean().optional(),
  compat: z.array(z.string()).optional().default([]),
  incompat: z.array(z.string()).optional().default([]),
  keySpecs: z.record(z.string(), z.string()).optional(),
  description: z.string(),
  idealFor: z.array(z.string()),
  limitations: z.array(z.string()),
  images: z.array(z.string()).min(1, "Each product must have at least one image"),
  productUrl: z.string().url().optional(),
  affiliateUrl: z.string().url().optional(),
  availability: availabilitySchema.optional(),
  verifiedAt: z.string().optional(),
  sources: z.array(z.string()).optional()
});

export type Product = z.infer<typeof productSchema>;

export const ownedGearSchema = z.object({
  gogglesProductId: z.string().optional(),
  radioProductId: z.string().optional(),
  chargerProductId: z.string().optional(),
  batteryProductIds: z.array(z.string()).optional(),
  knownVideoSystem: videoSystemSchema.optional(),
  knownRadioProtocol: controlProtocolSchema.optional(),
});
export type OwnedGear = z.infer<typeof ownedGearSchema>;

export const userPreferencesSchema = z.object({
  budget: z.number().positive(),
  experience: experienceLevelSchema,
  style: flightStyleSchema,
  videoSystem: z.enum(["analog", "dji_o4", "hdzero", "recommend"]),
  scope: recommendationScopeSchema.optional().default("FULL_KIT"),
  advancedPriority: advancedPrioritySchema.optional().default("BALANCED"),
  environment: flightEnvironmentSchema.optional(),
  ownedGear: ownedGearSchema.optional().default({}),
  regulatoryRegion: regulatoryRegionSchema.optional().default("OTHER"),
  operationPurpose: operationPurposeSchema.optional().default("RECREATIONAL"),
  preferSimplerWeightClass: z.boolean().optional().default(false),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export type CompatibilityState =
  | "VALID"
  | "VALID_WITH_WARNING"
  | "CONDITIONAL"
  | "INCOMPLETE_KIT"
  | "SOFT_PENALTY"
  | "HARD_INVALID";

export const warningTypeSchema = z.enum([
  "VIDEO_TRADEOFF",
  "RACING_COMPROMISE",
  "BATTERY_HEAVY",
  "BATTERY_OUTSIDE_RECOMMENDED_RANGE",
  "LIHV_VOLTAGE",
  "REQUIRES_PSU",
  "REQUIRES_RECEIVER_MODULE",
  "PHYSICAL_FIT",
  "STOCK_LIMITED",
  "LEGACY_PRODUCT",
  "ASPECT_RATIO",
  "OWNED_GEAR_CONFLICT",
  "PRICE_ESTIMATE",
  "REGULATORY_THRESHOLD_CROSSED",
  "REGULATORY_INFO_STALE",
  "NO_EXACT_TAKEOFF_WEIGHT",
]);
export type WarningType = z.infer<typeof warningTypeSchema>;

export type Warning = {
  type: WarningType;
  messageKey: string;
  params?: Record<string, string | number>;
};

export type ReasonCategory =
  | "STYLE"
  | "COMPATIBILITY"
  | "VALUE"
  | "PERFORMANCE"
  | "BATTERY_FIT"
  | "AVAILABILITY";

export type Reason = {
  category: ReasonCategory;
  messageKey: string;
  params?: Record<string, string | number>;
};

export type BundleItem = {
  category: ProductCategory;
  product: Product;
  owned: boolean;
  includedInPrice: boolean;
  referenceOnly?: boolean;
  quantity?: number;
};

export type RegulatoryAssessment = {
  region: RegulatoryRegion;
  purpose: OperationPurpose;
  estimatedTakeoffWeightG: number | null;
  weightThresholdG: number | null;
  status:
    | "NO_REGISTRATION_BY_WEIGHT"
    | "REGISTRATION_REQUIRED"
    | "REGISTRATION_STILL_APPLIES"
    | "LIGHTWEIGHT_BENEFIT"
    | "CHECK_LOCAL_RULES"
    | "UNKNOWN_WEIGHT";
  messageKey: string;
  warnings: Warning[];
};

export type BundleScoreBreakdown = {
  droneStyleFit: number;
  compatibilityConfidence: number;
  budgetEfficiency: number;
  batteryFit: number;
  gogglesFit: number;
  radioFit: number;
  chargerFit: number;
  availability: number;
  experienceFit: number;
  futureProofing: number;
  total: number;
};

export type OwnedGearConflict = {
  category: Exclude<ProductCategory, "drone">;
  productId: string;
  reasonKey: string;
};

export type KitBundle = {
  scope: RecommendationScope;
  drone: Product;
  goggles?: Product;
  radio?: Product;
  charger?: Product;
  battery: Product;
  batteryQuantity: number;
  items: BundleItem[];
  totalPrice: number;
  corePrice: number;
  extrasPrice: number;
  totalWithExtras: number;
  explanation: string;
  reasons: Reason[];
  warnings: Warning[];
  ownedGearConflicts?: OwnedGearConflict[];
  scoreBreakdown?: BundleScoreBreakdown;
  alternativeRole?: "PRIMARY" | "VALUE" | "PREMIUM";
  regulatory?: RegulatoryAssessment;
  score?: number;
};

export type RecommendationResult =
  | { kind: "kit"; kit: KitBundle; alternatives?: KitBundle[] }
  | { kind: "insufficient"; minBudget: number; message: string; kit?: KitBundle };
