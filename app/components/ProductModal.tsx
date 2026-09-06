import Image from "next/image";
import { Product } from "@/lib/schema";
import { formatPrice } from "@/lib/utils";

export function ProductModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-title"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {product.brand}
            </div>
            <h2 id="product-title" className="mt-1 text-2xl font-semibold text-zinc-900 md:text-3xl">
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-2xl bg-zinc-100">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain p-8"
            sizes="(max-width: 768px) 100vw, 672px"
          />
        </div>

        <p className="mt-6 text-lg leading-relaxed text-zinc-700">{product.description}</p>

        {Object.keys(product.keySpecs).length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Key specs</h3>
            <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.entries(product.keySpecs).map(([k, v]) => (
                <div key={k} className="rounded-xl bg-zinc-50 p-3">
                  <dt className="text-xs font-medium uppercase text-zinc-500">{k}</dt>
                  <dd className="mt-1 text-sm font-semibold text-zinc-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Ideal for</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-zinc-700">
              {product.idealFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Limitations</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-zinc-700">
              {product.limitations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-6">
          <div className="text-3xl font-semibold text-zinc-900">{formatPrice(product.priceUsd)}</div>
          <a
            href={product.purchaseUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
          >
            Buy {product.name}
          </a>
        </div>
      </div>
    </div>
  );
}
