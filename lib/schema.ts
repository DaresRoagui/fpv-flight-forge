import { z } from "zod";

export const videoSystemSchema = z.enum(["analog", "dji_o4", "hdzero", "walksnail"]);
export type VideoSystem = z.infer<typeof videoSystemSchema>;

export const controlProtocolSchema = z.enum([
  "elrs_2.4",
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

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  category: productCategorySchema,
  subcategory: z.string().optional(),
  priceUsd: z.number().nonnegative(),
  rating: z.number().min(0).max(10).optional().default(5),
  videoSystems: z.array(videoSystemSchema),
  protocols: z.array(controlProtocolSchema),
  flightStyles: z.array(flightStyleSchema),
  experienceLevel: z.array(experienceLevelSchema),
  compat: z.array(z.string()).optional().default([]),
  incompat: z.array(z.string()).optional().default([]),
  keySpecs: z.record(z.string(), z.string()).optional().default({}),
  description: z.string(),
  idealFor: z.array(z.string()),
  limitations: z.array(z.string()),
  images: z.array(z.string()).min(1, "Each product must have at least one image"),
  purchaseUrl: z.string().url().optional(),
  affiliateUrl: z.string().url().optional(),
  availability: availabilitySchema.default("unknown"),
  verifiedAt: z.string().optional(),
  sources: z.array(z.string()).optional().default([]),
});

export type Product = z.infer<typeof productSchema>;

export const userPreferencesSchema = z.object({
  budget: z.number().positive(),
  experience: experienceLevelSchema,
  style: flightStyleSchema,
  videoSystem: z.enum(["analog", "dji_o4", "recommend"]),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export type KitBundle = {
  goggles: Product;
  drone: Product;
  radio: Product;
  charger: Product;
  battery: Product;
  batteryQuantity: number;
  totalPrice: number;
  explanation: string;
};

export type RecommendationResult =
  | { kind: "kit"; kit: KitBundle }
  | { kind: "insufficient"; minBudget: number; message: string };
