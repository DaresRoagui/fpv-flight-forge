import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `≈ US$${Math.round(value).toLocaleString("en-US")}`;
}
