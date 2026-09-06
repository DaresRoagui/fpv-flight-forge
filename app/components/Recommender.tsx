"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { recommendKit } from "@/lib/recommendation";
import { PRODUCTS } from "@/data/products";
import { useLocale } from "@/app/components/LocaleProvider";
import { EXCHANGE_RATES } from "@/lib/i18n";
import { Product, UserPreferences, KitBundle, RecommendationResult, VideoSystem } from "@/lib/schema";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";

export function Recommender() {
  const { t, localizeProduct } = useLocale();

  const steps = useMemo(
    () => [
      { id: "budget", label: t("steps.budget") },
      { id: "experience", label: t("steps.experience") },
      { id: "style", label: t("steps.style") },
      { id: "video", label: t("steps.video") },
    ],
    [t]
  );

  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<UserPreferences>({
    budget: 400,
    experience: "beginner",
    style: "tinywhoop",
    videoSystem: "recommend",
  });
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const isComplete = step >= steps.length;

  const recommendations = useMemo(() => {
    return recommendKit(prefs, PRODUCTS);
  }, [prefs]);

  function updatePrefs<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      setResult(recommendations);
      setStep((s) => s + 1);
    }
  }

  function back() {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  }

  function restart() {
    setStarted(false);
    setStep(0);
    setResult(null);
    setPrefs({
      budget: 400,
      experience: "beginner",
      style: "tinywhoop",
      videoSystem: "recommend",
    });
  }

  function setAndNext<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    const updated = { ...prefs, [key]: value } as UserPreferences;
    setPrefs(updated);
    setTimeout(() => {
      if (key === "videoSystem") {
        setResult(recommendKit(updated, PRODUCTS));
        setStep((s) => s + 1);
      } else {
        setStep((s) => s + 1);
      }
    }, 0);
  }

  const localizedDetail = detailProduct ? localizeProduct(detailProduct) : null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12 md:py-16">
      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-1 flex-col items-center justify-center text-center"
          >
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-zinc-900 md:text-6xl">
              {t("welcome.title")}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600">
              {t("welcome.description")}
            </p>
            <button
              data-testid="start-button"
              onClick={() => setStarted(true)}
              className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-zinc-900 px-10 text-lg font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
            >
              {t("welcome.start")}
            </button>
          </motion.div>
        ) : isComplete && result ? (
          <ResultView
            key="result"
            result={result}
            prefs={prefs}
            onRestart={restart}
            onDetail={setDetailProduct}
          />
        ) : (
          <motion.div
            key="step"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex flex-1 flex-col"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {steps.map((s, i) => (
                  <div
                    key={s.id}
                    className={`h-2 w-8 rounded-full ${
                      i <= step ? "bg-zinc-900" : "bg-zinc-200"
                    }`}
                    aria-label={`${t("steps.step")} ${i + 1}: ${s.label}`}
                  />
                ))}
              </div>
              <button
                onClick={back}
                disabled={step === 0}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-30"
              >
                {t("buttons.back")}
              </button>
            </div>

            {step === 0 && (
              <BudgetStep
                budget={prefs.budget}
                onChange={(v) => updatePrefs("budget", v)}
                onNext={next}
              />
            )}
            {step === 1 && (
              <OptionStep
                title={t("experience.title")}
                optionKey="experience"
                selected={prefs.experience}
                onSelect={(v) => setAndNext("experience", v)}
              />
            )}
            {step === 2 && (
              <OptionStep
                title={t("style.title")}
                optionKey="style"
                selected={prefs.style}
                onSelect={(v) => setAndNext("style", v)}
              />
            )}
            {step === 3 && (
              <OptionStep
                title={t("video.title")}
                optionKey="video"
                selected={prefs.videoSystem}
                onSelect={(v) => setAndNext("videoSystem", v)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ProductModal product={localizedDetail} onClose={() => setDetailProduct(null)} />
    </div>
  );
}

function BudgetStep({
  budget,
  onChange,
  onNext,
}: {
  budget: number;
  onChange: (v: number) => void;
  onNext: () => void;
}) {
  const { t, formatPrice, currency } = useLocale();
  const rate = EXCHANGE_RATES[currency];
  const min = 150;
  const max = 2500;

  const currencyValue = Math.round(budget * rate);
  const currencyStep = Math.round(25 * rate);
  const currencyMin = Math.round(min * rate);
  const currencyMax = Math.round(max * rate);

  return (
    <div className="flex flex-1 flex-col justify-center">
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
        {t("budget.title")}
      </h2>
      <p className="mt-3 text-zinc-600">
        {t("budget.description", { currency: t(`currency.${currency}`) })}
      </p>
      <div className="mt-10">
        <div className="flex items-end gap-4">
          <span className="text-5xl font-semibold text-zinc-900">
            {formatPrice(budget, { compact: true })}
          </span>
          <span className="mb-2 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600">
            {t(`currency.${currency}`)}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={25}
          value={budget}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-8 h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900"
          aria-label={t("budget.title")}
        />
        <div className="mt-4 flex justify-between text-sm text-zinc-500">
          <span>{formatPrice(min, { compact: true })}</span>
          <span>{formatPrice(max, { compact: true })}</span>
        </div>
        <div className="mt-8 flex items-center gap-4">
          <label htmlFor="budget-input" className="text-sm font-medium text-zinc-700">
            {t("budget.exactAmount")}
          </label>
          <input
            id="budget-input"
            type="number"
            min={currencyMin}
            max={currencyMax}
            step={currencyStep}
            value={currencyValue}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (Number.isFinite(value)) {
                onChange(value / rate);
              }
            }}
            className="w-40 rounded-xl border border-zinc-200 px-4 py-2 text-zinc-900 focus:border-zinc-900 focus:outline-none"
          />
        </div>
      </div>
      <div className="mt-auto pt-10">
        <button
          data-testid="continue-button"
          onClick={onNext}
          className="inline-flex h-14 items-center justify-center rounded-full bg-zinc-900 px-10 text-lg font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
        >
          {t("buttons.continue")}
        </button>
      </div>
    </div>
  );
}

const optionConfig: Record<
  string,
  { values: readonly string[]; keyPrefix: string }
> = {
  experience: {
    values: ["beginner", "intermediate", "advanced"],
    keyPrefix: "options.experience",
  },
  style: {
    values: ["tinywhoop", "freestyle", "cinematic", "longRange", "racing"],
    keyPrefix: "options.style",
  },
  video: {
    values: ["analog", "dji_o4", "recommend"],
    keyPrefix: "options.video",
  },
};

function OptionStep<T extends string>({
  title,
  optionKey,
  selected,
  onSelect,
}: {
  title: string;
  optionKey: string;
  selected: T;
  onSelect: (value: T) => void;
}) {
  const { t } = useLocale();
  const config = optionConfig[optionKey];

  return (
    <div className="flex flex-1 flex-col justify-center">
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">{title}</h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {config.values.map((value) => {
          const active = selected === value;
          const label = t(`${config.keyPrefix}.${value}.label`);
          const description = t(`${config.keyPrefix}.${value}.desc`);
          return (
            <button
              key={value}
              data-value={value}
              data-testid={`option-${optionKey}-${value}`}
              onClick={() => onSelect(value as T)}
              className={`flex flex-col items-start rounded-2xl border-2 p-6 text-left transition focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 ${
                active
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-100 bg-white text-zinc-900 hover:border-zinc-300"
              }`}
            >
              <span className="text-lg font-semibold">{label}</span>
              <span className={`mt-2 text-sm ${active ? "text-zinc-300" : "text-zinc-500"}`}>
                {description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultView({
  result,
  prefs,
  onRestart,
  onDetail,
}: {
  result: RecommendationResult;
  prefs: UserPreferences;
  onRestart: () => void;
  onDetail: (product: Product) => void;
}) {
  const { t, formatPrice } = useLocale();

  if (result.kind === "insufficient" && !result.kit) {
    return (
      <motion.div
        key="insufficient"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-1 flex-col items-center justify-center text-center"
      >
        <h2 data-testid="insufficient-title" className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
          {t("insufficient.title")}
        </h2>
        <p className="mt-4 max-w-lg text-lg text-zinc-600">
          {t("insufficient.description", {
            style: t(`styleLabel.${prefs.style}`),
            videoSystem: t(`videoSystem.${prefs.videoSystem === "recommend" ? "analog" : prefs.videoSystem}`),
            budget: formatPrice(prefs.budget, { compact: true }),
          })}
        </p>
        <p className="mt-2 text-zinc-600">
          {t("insufficient.minBudget", {
            minBudget: formatPrice(result.minBudget, { compact: true }),
          })}
        </p>
        <button
          onClick={onRestart}
          className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-zinc-900 px-8 text-lg font-medium text-white transition hover:bg-zinc-800"
        >
          {t("buttons.startOver")}
        </button>
      </motion.div>
    );
  }

  const bundle = (result.kind === "kit" ? result.kit : result.kit) as KitBundle;
  const isInsufficient = result.kind === "insufficient";

  return (
    <motion.div
      key={isInsufficient ? "insufficient-kit" : "result"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-1 flex-col"
    >
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2
            data-testid={isInsufficient ? "insufficient-title" : "result-title"}
            className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl"
          >
            {isInsufficient ? t("insufficient.title") : t("result.title")}
          </h2>
          <p className="mt-2 text-zinc-600">
            {isInsufficient
              ? t("insufficient.description", {
                  style: t(`styleLabel.${prefs.style}`),
                  videoSystem: t(`videoSystem.${prefs.videoSystem === "recommend" ? "analog" : prefs.videoSystem}`),
                  budget: formatPrice(prefs.budget, { compact: true }),
                })
              : t("result.description", { style: t(`styleLabel.${prefs.style}`) })}
          </p>
          {isInsufficient && (
            <p className="mt-2 text-zinc-600">
              {t("insufficient.notice")}{" "}
              {t("insufficient.minBudget", {
                minBudget: formatPrice(result.minBudget, { compact: true }),
              })}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-zinc-500">{t("composition.total")}</div>
          <div className="text-4xl font-semibold text-zinc-900">
            {formatPrice(bundle.totalPrice, { compact: true })}
          </div>
        </div>
      </div>

      <div data-testid="kit-composition">
        <KitComposition bundle={bundle} onDetail={onDetail} />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 max-w-3xl rounded-2xl bg-zinc-50 p-6 text-zinc-700 leading-relaxed"
      >
        {buildExplanation(bundle, prefs, t, formatPrice)}
      </motion.p>

      <div data-testid="result-products" className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard product={bundle.drone} label={t("labels.drone")} onDetail={onDetail} highlight />
        <ProductCard product={bundle.goggles} label={t("labels.goggles")} onDetail={onDetail} />
        <ProductCard product={bundle.radio} label={t("labels.radio")} onDetail={onDetail} />
        <ProductCard product={bundle.charger} label={t("labels.charger")} onDetail={onDetail} />
        <ProductCard
          product={bundle.battery}
          label={t("labels.batteries")}
          onDetail={onDetail}
          quantity={bundle.batteryQuantity}
        />
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <a
          href={bundle.drone.productUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-14 items-center justify-center rounded-full bg-zinc-900 px-8 text-lg font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
        >
          {t("buttons.shopDrone")}
        </a>
        <button
          onClick={onRestart}
          className="inline-flex h-14 items-center justify-center rounded-full border border-zinc-200 px-8 text-lg font-medium text-zinc-900 transition hover:bg-zinc-50"
        >
          {t("buttons.startOver")}
        </button>
      </div>
    </motion.div>
  );
}

function buildExplanation(
  bundle: KitBundle,
  prefs: UserPreferences,
  t: (key: string, params?: Record<string, string | number>) => string,
  formatPrice: (value: number, options?: { compact?: boolean }) => string
): string {
  const videoSystem: VideoSystem =
    prefs.videoSystem === "recommend"
      ? bundle.drone.videoSystems[0]
      : prefs.videoSystem;

  const styleLabel = t(`styleLabel.${prefs.style}`);
  const experienceLabel = t(`experienceLabel.${prefs.experience}`);
  const videoSystemLabel = t(`videoSystem.${videoSystem}`);

  const intro =
    prefs.videoSystem === "recommend"
      ? t("explanation.introRecommend", {
          videoSystem: videoSystemLabel,
          budget: formatPrice(prefs.budget, { compact: true }),
          style: styleLabel,
          experience: experienceLabel,
        })
      : t("explanation.introFixed", { style: styleLabel, videoSystem: videoSystemLabel });

  const radioProtocols = bundle.radio.protocols.includes("elrs_2.4")
    ? "ELRS 2.4 GHz"
    : bundle.radio.protocols.join(", ");

  const reasons = [
    t("explanation.drone", {
      drone: bundle.drone.name,
      style: styleLabel,
      videoSystem: videoSystemLabel,
    }),
    t("explanation.goggles", {
      goggles: bundle.goggles.name,
      videoSystem: videoSystemLabel,
      experience: experienceLabel,
    }),
    t("explanation.radio", {
      radio: bundle.radio.name,
      protocols: radioProtocols,
    }),
    t("explanation.battery", {
      battery: bundle.battery.name,
      cells: bundle.battery.keySpecs.cells ?? "",
      connector: bundle.battery.keySpecs.connector ?? "",
      batteryQuantity: bundle.batteryQuantity,
      style: styleLabel,
    }),
    t("explanation.charger", {
      charger: bundle.charger.name,
      cells: bundle.battery.keySpecs.cells ?? "",
      connector: bundle.battery.keySpecs.connector ?? "",
    }),
  ];

  const total = t("explanation.total", {
    price: formatPrice(bundle.totalPrice, { compact: true }),
    batteryQuantity: bundle.batteryQuantity,
    batteryName: bundle.battery.name,
  });

  return `${intro} ${reasons.join(" ")} ${total}`;
}

function KitComposition({
  bundle,
  onDetail,
}: {
  bundle: KitBundle;
  onDetail: (product: Product) => void;
}) {
  const { t, formatPrice, localizeProduct } = useLocale();

  const items: { product: Product; label: string; quantity?: number }[] = [
    { product: bundle.goggles, label: t("labels.goggles") },
    { product: bundle.drone, label: t("labels.drone") },
    { product: bundle.radio, label: t("labels.radio") },
    { product: bundle.charger, label: t("labels.charger") },
    { product: bundle.battery, label: t("labels.batteries"), quantity: bundle.batteryQuantity },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mt-8 flex items-start gap-2 overflow-x-auto rounded-3xl bg-zinc-50 p-4 md:items-center md:justify-center md:p-6"
    >
      {items.map(({ product, label, quantity }, index) => {
        const localized = localizeProduct(product);
        return (
          <div key={product.id} className="flex items-center">
            <motion.button
              variants={itemAnim}
              onClick={() => onDetail(product)}
              className="flex flex-col items-center rounded-2xl bg-white p-3 shadow-sm transition hover:shadow-md md:p-4"
            >
              <div className="relative h-20 w-20 md:h-28 md:w-28">
                <Image
                  src={localized.images[0]}
                  alt={localized.name}
                  fill
                  className="object-contain p-2"
                  sizes="112px"
                />
              </div>
              <div className="mt-2 text-center">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 md:text-xs">
                  {label}
                </div>
                <div
                  title={localized.name}
                  className="mt-0.5 max-w-[100px] truncate text-xs font-semibold text-zinc-900 md:max-w-[120px] md:text-sm"
                >
                  {localized.name}
                </div>
                <div className="text-[10px] text-zinc-500 md:text-xs">
                  {quantity ? `${quantity} × ` : ""}
                  {formatPrice(localized.priceUsd * (quantity ?? 1), { compact: true })}
                </div>
              </div>
            </motion.button>
            {index < items.length - 1 && (
              <div className="mx-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-600 md:mx-2 md:h-10 md:w-10">
                +
              </div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
