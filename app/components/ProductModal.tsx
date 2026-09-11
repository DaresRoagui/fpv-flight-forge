"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/lib/schema";
import { useLocale } from "@/app/components/LocaleProvider";

function fallbackImage(category: string): string {
  return `/images/${category}.svg`;
}

function ModalImage({
  src,
  fallback,
  alt,
  className,
  sizes,
}: {
  src: string;
  fallback: string;
  alt: string;
  className: string;
  sizes: string;
}) {
  const [hasFailed, setHasFailed] = useState(false);
  return (
    <Image
      src={hasFailed ? fallback : src}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      onError={() => setHasFailed(true)}
    />
  );
}

export function ProductModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const { t, formatPrice, localizeProduct } = useLocale();

  if (!product) return null;

  const localized = localizeProduct(product);
  const buyUrl = localized.affiliateUrl || localized.productUrl || "#";

  const currentImage = localized.images[imageIndex] || fallbackImage(product.category);
  const fallback = fallbackImage(product.category);

  return (
    <div
      data-testid="product-modal"
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
              {localized.brand} {localized.subcategory ? `· ${localized.subcategory}` : ""}
            </div>
            <h2
              id="product-title"
              className="mt-1 text-2xl font-semibold text-zinc-900 md:text-3xl"
            >
              {localized.name}
            </h2>
          </div>
          <button
            data-testid="close-modal"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
            aria-label={t("modal.close")}
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
              <ModalImage
                key={currentImage}
                src={currentImage}
                fallback={fallback}
                alt={`${localized.name} - ${t("modal.photo")} ${imageIndex + 1}`}
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>
            {localized.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {localized.images.map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    onClick={() => setImageIndex(idx)}
                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-zinc-100 ${
                      idx === imageIndex ? "border-zinc-900" : "border-transparent"
                    }`}
                  >
                    <ModalImage
                      src={src}
                      fallback={fallback}
                      alt={`${localized.name} ${t("modal.thumbnail")} ${idx + 1}`}
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
              {localized.description}
            </p>

            {localized.keySpecs && Object.keys(localized.keySpecs).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  {t("modal.keySpecs")}
                </h3>
                <dl className="mt-3 grid grid-cols-2 gap-3">
                  {Object.entries(localized.keySpecs ?? {}).map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-zinc-50 p-3">
                      <dt className="text-xs font-medium uppercase text-zinc-500">{t(`keySpecs.${k}`)}</dt>
                      <dd className="mt-1 text-sm font-semibold text-zinc-900">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  {t("modal.idealFor")}
                </h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-zinc-700">
                  {localized.idealFor.map((item, i) => (
                    <li key={`${item}-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  {t("modal.limitations")}
                </h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-zinc-700">
                  {localized.limitations.map((item, i) => (
                    <li key={`${item}-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {t("modal.compatibility")}
              </h3>
              <div className="mt-3 space-y-2 text-sm text-zinc-700">
                <div>
                  <span className="font-semibold text-zinc-900">{t("modal.video")}:</span>{" "}
                  {localized.videoSystems.join(", ") || "—"}
                </div>
                <div>
                  <span className="font-semibold text-zinc-900">{t("modal.protocols")}:</span>{" "}
                  {localized.protocols.join(", ") || "—"}
                </div>
                <div>
                  <span className="font-semibold text-zinc-900">{t("modal.availability")}:</span>{" "}
                  {t(`availability.${localized.availability ?? "unknown"}`)}
                </div>
                <div>
                  <span className="font-semibold text-zinc-900">{t("modal.verified")}:</span>{" "}
                  {localized.verifiedAt || "—"}
                </div>
                {(localized.sources ?? []).length > 0 && (
                  <div>
                    <span className="font-semibold text-zinc-900">{t("modal.sources")}:</span>{" "}
                    {(localized.sources ?? []).join("; ")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-stretch justify-between gap-4 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center">
          <div className="text-3xl font-semibold text-zinc-900">
            {formatPrice(localized.priceUsd, { compact: true })}
          </div>
          <div className="flex gap-3">
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
            >
              {t("buttons.buy", { name: localized.name })}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
