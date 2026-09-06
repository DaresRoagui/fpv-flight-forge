"use client";

import { useState } from "react";
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
  const [imageIndex, setImageIndex] = useState(0);

  if (!product) return null;

  const buyUrl = product.affiliateUrl || product.productUrl || "#";
  const availabilityLabel: Record<string, string> = {
    available: "Available",
    unavailable: "Unavailable",
    unknown: "Unknown",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-title"
    >
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {product.brand} {product.subcategory ? `· ${product.subcategory}` : ""}
            </div>
            <h2
              id="product-title"
              className="mt-1 text-2xl font-semibold text-zinc-900 md:text-3xl"
            >
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100">
              <Image
                src={product.images[imageIndex]}
                alt={`${product.name} - photo ${imageIndex + 1}`}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {product.images.map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    onClick={() => setImageIndex(idx)}
                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-zinc-100 ${
                      idx === imageIndex ? "border-zinc-900" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      className="object-contain p-2"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <p className="text-lg leading-relaxed text-zinc-700">
              {product.description}
            </p>

            {Object.keys(product.keySpecs).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  Key specs
                </h3>
                <dl className="mt-3 grid grid-cols-2 gap-3">
                  {Object.entries(product.keySpecs).map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-zinc-50 p-3">
                      <dt className="text-xs font-medium uppercase text-zinc-500">{k}</dt>
                      <dd className="mt-1 text-sm font-semibold text-zinc-900">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  Ideal for
                </h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-zinc-700">
                  {product.idealFor.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  Limitations
                </h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-zinc-700">
                  {product.limitations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Compatibility & sources
              </h3>
              <div className="mt-3 space-y-2 text-sm text-zinc-700">
                <div>
                  <span className="font-semibold text-zinc-900">Video:</span>{" "}
                  {product.videoSystems.join(", ") || "—"}
                </div>
                <div>
                  <span className="font-semibold text-zinc-900">Protocols:</span>{" "}
                  {product.protocols.join(", ") || "—"}
                </div>
                <div>
                  <span className="font-semibold text-zinc-900">Availability:</span>{" "}
                  {availabilityLabel[product.availability] || product.availability}
                </div>
                <div>
                  <span className="font-semibold text-zinc-900">Verified:</span>{" "}
                  {product.verifiedAt || "—"}
                </div>
                {product.sources.length > 0 && (
                  <div>
                    <span className="font-semibold text-zinc-900">Sources:</span>{" "}
                    {product.sources.join("; ")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-stretch justify-between gap-4 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center">
          <div className="text-3xl font-semibold text-zinc-900">
            {formatPrice(product.priceUsd)}
          </div>
          <div className="flex gap-3">
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
            >
              Buy {product.name}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
