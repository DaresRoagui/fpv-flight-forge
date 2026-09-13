import { describe, expect, it } from "vitest";
import { getProducts } from "@/lib/products";
import { recommendKitV4 } from "@/lib/recommendation-v4";
import type { AdvancedPriority, FlightEnvironment, FlightStyle, UserPreferences } from "@/lib/schema";

const products = getProducts();

type PreferenceVideoSystem = UserPreferences["videoSystem"];

const styles: FlightStyle[] = ["tinywhoop", "freestyle", "cinematic", "longRange", "racing"];
const experiences: UserPreferences["experience"][] = ["beginner", "intermediate", "advanced"];
const budgets = [450, 700, 950, 1300, 1800, 2400, 3000];
const priorities: AdvancedPriority[] = ["BALANCED", "VALUE", "IMAGE_QUALITY", "LOW_LATENCY", "PORTABILITY", "FLIGHT_TIME", "REPAIRABILITY"];
const contextualEnvironments: FlightEnvironment[] = ["INDOOR_TIGHT", "MIXED", "OUTDOOR"];

function videos(style: FlightStyle, experience: UserPreferences["experience"]): PreferenceVideoSystem[] {
  const base: PreferenceVideoSystem[] = ["analog", "dji_o4", "recommend"];
  if (style === "racing" || experience === "advanced") base.splice(2, 0, "hdzero");
  return base;
}

function environments(style: FlightStyle): Array<FlightEnvironment | undefined> {
  return style === "tinywhoop" || style === "freestyle" || style === "cinematic" ? contextualEnvironments : [undefined];
}

function prefs(input: {
  budget: number;
  style: FlightStyle;
  experience: UserPreferences["experience"];
  videoSystem: PreferenceVideoSystem;
  environment?: FlightEnvironment;
  advancedPriority: AdvancedPriority;
}): UserPreferences {
  return {
    ...input,
    scope: "FULL_KIT",
    ownedGear: {},
    regulatoryRegion: "CO",
    operationPurpose: "RECREATIONAL",
    preferSimplerWeightClass: false,
  };
}

describe("Iteration 5 recommendation asset discovery", () => {
  it("prints the exact product surface that can appear as primary/value/premium in a broad reasonable questionnaire matrix", () => {
    const seen = new Map<string, { id: string; name: string; category: string; roles: Set<string> }>();
    let kits = 0;

    for (const style of styles) {
      for (const experience of experiences) {
        const activePriorities = experience === "advanced" ? priorities : (["BALANCED"] as AdvancedPriority[]);
        for (const videoSystem of videos(style, experience)) {
          for (const environment of environments(style)) {
            for (const advancedPriority of activePriorities) {
              for (const budget of budgets) {
                const result = recommendKitV4(prefs({ budget, style, experience, videoSystem, environment, advancedPriority }), products);
                const bundles = result.kind === "kit" ? [result.kit, ...(result.alternatives ?? [])] : result.kit ? [result.kit] : [];
                for (const bundle of bundles) {
                  kits += 1;
                  const role = bundle.alternativeRole ?? (result.kind === "kit" && bundle === result.kit ? "PRIMARY" : "CLOSEST_VALID");
                  for (const item of bundle.items.filter((entry) => !entry.referenceOnly)) {
                    const existing = seen.get(item.product.id) ?? {
                      id: item.product.id,
                      name: item.product.name,
                      category: item.product.category,
                      roles: new Set<string>(),
                    };
                    existing.roles.add(role);
                    seen.set(item.product.id, existing);
                  }
                }
              }
            }
          }
        }
      }
    }

    const audit = [...seen.values()]
      .map((entry) => ({ ...entry, roles: [...entry.roles].sort() }))
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

    console.log("V5_ASSET_AUDIT_START");
    console.log(JSON.stringify({ kits, products: audit }, null, 2));
    console.log("V5_ASSET_AUDIT_END");

    expect(kits).toBeGreaterThan(0);
    expect(audit.length).toBeGreaterThan(0);
  });
});
