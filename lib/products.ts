import { productSchema, Product, ProductCategory } from "@/lib/schema";
import { PRODUCTS } from "@/data/products";
import { PRODUCT_OVERRIDES } from "@/lib/catalog-profiles";

function mergeProductOverrides(products: Product[]): Product[] {
  return products.map((product) => {
    const override = PRODUCT_OVERRIDES[product.id];
    if (!override) return product;
    return { ...product, ...override } as Product;
  });
}

const MERGED_PRODUCTS: Product[] = mergeProductOverrides(PRODUCTS);

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

export function getProducts(): Product[] {
  return MERGED_PRODUCTS;
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return MERGED_PRODUCTS.filter((p) => p.category === category);
}

export function getProductById(id: string): Product | undefined {
  return MERGED_PRODUCTS.find((p) => p.id === id);
}
