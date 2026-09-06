"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recommendKit } from "@/lib/recommendation";
import { PRODUCTS } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { Product, UserPreferences, KitBundle, RecommendationResult } from "@/lib/schema";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";

const steps = [
  { id: "budget", label: "Budget" },
  { id: "experience", label: "Experience" },
  { id: "style", label: "Style" },
  { id: "video", label: "Video" },
];

const experienceOptions = [
  { value: "beginner", label: "Beginner", description: "First drone, learning to fly" },
  { value: "intermediate", label: "Intermediate", description: "Comfortable in manual / acro" },
  { value: "advanced", label: "Advanced", description: "Building, tuning, racing or filming" },
] as const;

const styleOptions = [
  { value: "tinywhoop", label: "Tiny Whoop", description: "Indoor, safe, easy to start" },
  { value: "freestyle", label: "Freestyle", description: "Acro tricks and open park flying" },
  { value: "cinematic", label: "Cinematic", description: "Smooth, slow footage" },
  { value: "longRange", label: "Long Range", description: "Distance cruising and exploration" },
  { value: "racing", label: "Racing", description: "Fast laps and competition" },
] as const;

const videoOptions = [
  { value: "analog", label: "Analog", description: "Cheapest, lower image quality" },
  { value: "dji_o4", label: "DJI O4", description: "HD digital, best image quality" },
] as const;

export function Recommender() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<UserPreferences>({
    budget: 400,
    experience: "beginner",
    style: "tinywhoop",
    videoSystem: "analog",
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
      videoSystem: "analog",
    });
  }

  function setAndNext<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    updatePrefs(key, value);
    // Allow state to update before advancing.
    setTimeout(() => {
      if (key === "videoSystem") {
        const updated = { ...prefs, [key]: value } as UserPreferences;
        setResult(recommendKit(updated, PRODUCTS));
        setStep((s) => s + 1);
      } else {
        setStep((s) => s + 1);
      }
    }, 0);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12 md:py-16">
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
              Build your perfect FPV kit
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600">
              Answer four quick questions and get a complete, compatible drone setup with goggles, drone, radio, charger and batteries.
            </p>
            <button
              onClick={() => setStarted(true)}
              className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-zinc-900 px-10 text-lg font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
            >
              Start the quiz
            </button>
          </motion.div>
        ) : isComplete && result ? (
          <ResultView
            key="result"
            result={result}
            prefs={prefs}
            onRestart={restart}
            onBack={() => setStep(steps.length - 1)}
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
                    aria-label={`Step ${i + 1}: ${s.label}`}
                  />
                ))}
              </div>
              <button
                onClick={back}
                disabled={step === 0}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-30"
              >
                Back
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
                title="What is your experience level?"
                options={experienceOptions}
                selected={prefs.experience}
                onSelect={(v) => setAndNext("experience", v)}
              />
            )}
            {step === 2 && (
              <OptionStep
                title="What do you want to fly?"
                options={styleOptions}
                selected={prefs.style}
                onSelect={(v) => setAndNext("style", v)}
              />
            )}
            {step === 3 && (
              <OptionStep
                title="Which video system do you prefer?"
                options={videoOptions}
                selected={prefs.videoSystem}
                onSelect={(v) => setAndNext("videoSystem", v)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ProductModal product={detailProduct} onClose={() => setDetailProduct(null)} />
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
  return (
    <div className="flex flex-1 flex-col justify-center">
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
        What is your budget?
      </h2>
      <p className="mt-3 text-zinc-600">Total budget for the full kit in USD.</p>
      <div className="mt-10">
        <div className="flex items-end gap-4">
          <span className="text-5xl font-semibold text-zinc-900">{formatPrice(budget)}</span>
          <span className="mb-2 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600">
            USD
          </span>
        </div>
        <input
          type="range"
          min={150}
          max={2500}
          step={25}
          value={budget}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-8 h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900"
          aria-label="Budget range"
        />
        <div className="mt-4 flex justify-between text-sm text-zinc-500">
          <span>{formatPrice(150)}</span>
          <span>{formatPrice(2500)}</span>
        </div>
        <div className="mt-8 flex items-center gap-4">
          <label htmlFor="budget-input" className="text-sm font-medium text-zinc-700">
            Exact amount
          </label>
          <input
            id="budget-input"
            type="number"
            min={150}
            max={2500}
            step={25}
            value={budget}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-32 rounded-xl border border-zinc-200 px-4 py-2 text-zinc-900 focus:border-zinc-900 focus:outline-none"
          />
        </div>
      </div>
      <div className="mt-auto pt-10">
        <button
          onClick={onNext}
          className="inline-flex h-14 items-center justify-center rounded-full bg-zinc-900 px-10 text-lg font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function OptionStep<T extends string>({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: readonly { value: T; label: string; description: string }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">{title}</h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`flex flex-col items-start rounded-2xl border-2 p-6 text-left transition focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 ${
                active
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-100 bg-white text-zinc-900 hover:border-zinc-300"
              }`}
            >
              <span className="text-lg font-semibold">{opt.label}</span>
              <span className={`mt-2 text-sm ${active ? "text-zinc-300" : "text-zinc-500"}`}>
                {opt.description}
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
  onBack,
  onDetail,
}: {
  result: RecommendationResult;
  prefs: UserPreferences;
  onRestart: () => void;
  onBack: () => void;
  onDetail: (product: Product) => void;
}) {
  if (result.kind === "insufficient") {
    return (
      <motion.div
        key="insufficient"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-1 flex-col items-center justify-center text-center"
      >
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
          Budget too tight
        </h2>
        <p className="mt-4 max-w-lg text-lg text-zinc-600">
          We could not build a compatible {prefs.style} kit with {prefs.videoSystem.toUpperCase()}{" "}
          video within {formatPrice(prefs.budget)}.
        </p>
        <p className="mt-2 text-zinc-600">
          Try raising your budget to at least{" "}
          <span className="font-semibold text-zinc-900">{formatPrice(result.minBudget)}</span>.
        </p>
        <div className="mt-10 flex gap-4">
          <button
            onClick={onBack}
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 px-6 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
          >
            Change budget
          </button>
          <button
            onClick={onRestart}
            className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Start over
          </button>
        </div>
      </motion.div>
    );
  }

  const bundle = result.kit as KitBundle;

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-1 flex-col"
    >
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Your kit
          </h2>
          <p className="mt-2 text-zinc-600">
            Complete, compatible setup tuned for {prefs.style} flying.
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-zinc-500">Total</div>
          <div className="text-4xl font-semibold text-zinc-900">{formatPrice(bundle.totalPrice)}</div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard
          product={bundle.drone}
          label="Drone"
          onDetail={onDetail}
          highlight
        />
        <ProductCard product={bundle.goggles} label="Goggles" onDetail={onDetail} />
        <ProductCard product={bundle.radio} label="Radio" onDetail={onDetail} />
        <ProductCard product={bundle.charger} label="Charger" onDetail={onDetail} />
        <ProductCard
          product={bundle.battery}
          label="Batteries"
          onDetail={onDetail}
          quantity={bundle.batteryQuantity}
        />
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <a
          href={bundle.drone.purchaseUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-14 items-center justify-center rounded-full bg-zinc-900 px-8 text-lg font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
        >
          Shop this kit
        </a>
        <button
          onClick={onRestart}
          className="inline-flex h-14 items-center justify-center rounded-full border border-zinc-200 px-8 text-lg font-medium text-zinc-900 transition hover:bg-zinc-50"
        >
          Start over
        </button>
      </div>
    </motion.div>
  );
}
