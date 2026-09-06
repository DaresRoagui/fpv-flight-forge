import Image from "next/image";
import { Product } from "@/lib/schema";
import { formatPrice } from "@/lib/utils";

export function ProductCard({
  product,
  label,
  onDetail,
  quantity,
  highlight = false,
}: {
  product: Product;
  label: string;
  onDetail: (product: Product) => void;
  quantity?: number;
  highlight?: boolean;
}) {
  const displayPrice =
    quantity && quantity > 1 ? product.priceUsd * quantity : product.priceUsd;

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-2xl border-2 bg-white transition hover:shadow-lg ${
        highlight ? "border-zinc-900" : "border-zinc-100"
      }`}
    >
      <div className="relative aspect-[4/3] w-full bg-zinc-100">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-contain p-6"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</div>
        <h3 className="mt-1 text-lg font-semibold text-zinc-900">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="text-lg font-semibold text-zinc-900">
            {quantity && quantity > 1 ? `${quantity} × ` : ""}
            {formatPrice(displayPrice)}
          </div>
          <button
            onClick={() => onDetail(product)}
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}
