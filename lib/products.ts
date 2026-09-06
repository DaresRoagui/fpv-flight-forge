import { productSchema, Product, ProductCategory } from "@/lib/schema";
import { PRODUCTS } from "@/data/products";

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
  return PRODUCTS;
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
