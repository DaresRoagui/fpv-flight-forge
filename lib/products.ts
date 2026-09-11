import { productSchema, Product, ProductCategory, ProductState } from "@/lib/schema";
import { PRODUCTS } from "@/data/products";
import { PRODUCT_OVERRIDES } from "@/lib/catalog-profiles";
import { CURATED_DRONE_PRODUCTS } from "@/lib/curated-drone-products";

const RESEARCH_STATE_GATES: Record<string, ProductState> = {
  // Superseded or explicitly demoted by curated Segments 01–09.
  "drone-betafpv-cetus-pro": "DO_NOT_DEFAULT",
  "drone-betafpv-meteor65-pro-o4": "LEGACY",
  "drone-iflight-nazgul5-v3": "LEGACY",
  "drone-geprc-cinelog35-v2": "WATCHLIST",
  "drone-iflight-chimera7-pro-v2": "DO_NOT_DEFAULT",
  "drone-geprc-cinelog35-v3-o4": "DO_NOT_DEFAULT",
  "drone-iflight-chimera7-pro-v2-o4": "DO_NOT_DEFAULT",
  "drone-geprc-mark5-o4": "DO_NOT_DEFAULT",
  "drone-geprc-vapor-d5-o4": "DO_NOT_DEFAULT",
};

const NON_DEFAULT_STATES = new Set<ProductState>([
  "CONDITIONAL",
  "WATCHLIST",
  "DO_NOT_DEFAULT",
  "LEGACY",
]);

function mergeProductOverrides(products: Product[]): Product[] {
  return products.map((product) => {
    const override = PRODUCT_OVERRIDES[product.id];
    const gatedState = RESEARCH_STATE_GATES[product.id];
    return {
      ...product,
      ...(override ?? {}),
      ...(gatedState ? { state: gatedState } : {}),
    } as Product;
  });
}

function mergeCuratedProducts(base: Product[], curated: Product[]): Product[] {
  const byId = new Map<string, Product>();
  base.forEach((product) => byId.set(product.id, product));
  curated.forEach((product) => byId.set(product.id, product));
  return [...byId.values()];
}

const ALL_PRODUCTS: Product[] = mergeCuratedProducts(
  mergeProductOverrides(PRODUCTS),
  CURATED_DRONE_PRODUCTS
);

const DEFAULT_RECOMMENDATION_PRODUCTS: Product[] = ALL_PRODUCTS.filter((product) => {
  if (product.availability === "unavailable") return false;
  if (product.state && NON_DEFAULT_STATES.has(product.state)) return false;
  return true;
});

export function validateProducts(products: unknown[]): Product[] {
  return products.map((p, i) => {
    const result = productSchema.safeParse(p);
    if (!result.success) {
      throw new Error(
        `Product at index ${i} (${(p as { id?: string })?.id ?? "unknown"}) is invalid: ${result.error.message}`
      );
    }
    return result.data;
  });
}

/** Products eligible for the normal recommendation flow. */
export function getProducts(): Product[] {
  return DEFAULT_RECOMMENDATION_PRODUCTS;
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return DEFAULT_RECOMMENDATION_PRODUCTS.filter((p) => p.category === category);
}

/** Direct lookup intentionally includes gated/watchlist products for audit and owned-gear compatibility. */
export function getProductById(id: string): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.id === id);
}

export function getAllProductsForAudit(): Product[] {
  return ALL_PRODUCTS;
}
