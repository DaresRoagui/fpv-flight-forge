"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recommendKitV4 } from "@/lib/recommendation-v4";
import { buildRecommendedExtras } from "@/lib/accessories";
import { questionnaireSteps, type QuestionnaireStepId } from "@/lib/questionnaire";
import { getProducts, getProductsByCategory } from "@/lib/products";
import { useLocale } from "@/app/components/LocaleProvider";
import { EXCHANGE_RATES } from "@/lib/i18n";
import type {
  AdvancedPriority,
  FlightEnvironment,
  KitBundle,
  OperationPurpose,
  OwnedGear,
  Product,
  ProductCategory,
  RecommendationResult,
  RecommendationScope,
  UserPreferences,
  VideoSystem,
} from "@/lib/schema";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import { RegulatoryBadge } from "./RegulatoryBadge";

const DEFAULT_PREFS: Omit<UserPreferences, "regulatoryRegion"> = {
  budget: 400,
  experience: "beginner",
  style: "tinywhoop",
  videoSystem: "recommend",
  scope: "FULL_KIT",
  advancedPriority: "BALANCED",
  environment: undefined,
  ownedGear: {},
  operationPurpose: "RECREATIONAL",
  preferSimplerWeightClass: false,
};

export function RecommenderV4() {
  const { t, regulatoryRegion } = useLocale();
  const products = useMemo(() => getProducts(), []);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<UserPreferences>({ ...DEFAULT_PREFS, regulatoryRegion });
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const steps = useMemo(() => questionnaireSteps(prefs), [prefs]);
  const current = steps[step];
  const isComplete = started && step >= steps.length && result !== null;

  const finish = useCallback((updated: UserPreferences) => {
    setPrefs(updated);
    setResult(recommendKitV4(updated, products));
    setStep(questionnaireSteps(updated).length);
  }, [products]);

  const advance = useCallback((updated: UserPreferences) => {
    const nextSteps = questionnaireSteps(updated);
    setPrefs(updated);
    if (step >= nextSteps.length - 1) {
      setResult(recommendKitV4(updated, products));
      setStep(nextSteps.length);
    } else {
      setStep((value) => value + 1);
    }
  }, [products, step]);

  const setAndAdvance = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    advance({ ...prefs, [key]: value, regulatoryRegion });
  }, [advance, prefs, regulatoryRegion]);

  const prevRegion = useRef(regulatoryRegion);
  useEffect(() => {
    if (prevRegion.current === regulatoryRegion) return;
    prevRegion.current = regulatoryRegion;
    const updated = { ...prefs, regulatoryRegion };
    setPrefs(updated);
    if (result) setResult(recommendKitV4(updated, products));
  }, [regulatoryRegion, prefs, products, result]);

  function restart() {
    setStarted(false);
    setStep(0);
    setResult(null);
    setPrefs({ ...DEFAULT_PREFS, regulatoryRegion });
  }

  function back() {
    setResult(null);
    setStep((value) => Math.max(0, value - 1));
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12 md:py-16">
      <AnimatePresence mode="wait">
        {!started ? (
          <Welcome onStart={() => setStarted(true)} />
        ) : isComplete && result ? (
          <ResultView result={result} prefs={prefs} onRestart={restart} onDetail={setDetailProduct} />
        ) : (
          <motion.div key={`step-${current}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex flex-1 flex-col">
            <Progress steps={steps} step={step} onBack={back} />
            {current === "scope" && (
              <ChoiceStep
                title={t("scope.question")}
                testKey="scope"
                selected={prefs.scope}
                values={["FULL_KIT", "DRONE_ONLY", "COMPLETE_EXISTING_SETUP"]}
                label={(value) => t(`scope.${value}`)}
                onSelect={(value) => setAndAdvance("scope", value as RecommendationScope)}
              />
            )}
            {current === "budget" && (
              <BudgetStep budget={prefs.budget} onChange={(budget) => setPrefs((old) => ({ ...old, budget }))} onNext={() => advance({ ...prefs, regulatoryRegion })} />
            )}
            {current === "style" && (
              <ChoiceStep
                title={t("style.title")}
                testKey="style"
                selected={prefs.style}
                values={["tinywhoop", "freestyle", "cinematic", "longRange", "racing"]}
                label={(value) => t(`options.style.${value}.label`)}
                description={(value) => t(`options.style.${value}.desc`)}
                onSelect={(value) => setAndAdvance("style", value as UserPreferences["style"])}
              />
            )}
            {current === "experience" && (
              <ChoiceStep
                title={t("experience.title")}
                testKey="experience"
                selected={prefs.experience}
                values={["beginner", "intermediate", "advanced"]}
                label={(value) => t(`options.experience.${value}.label`)}
                description={(value) => t(`options.experience.${value}.desc`)}
                onSelect={(value) => setAndAdvance("experience", value as UserPreferences["experience"])}
              />
            )}
            {current === "environment" && (
              <ChoiceStep
                title={t("environment.question")}
                testKey="environment"
                selected={prefs.environment ?? "MIXED"}
                values={["INDOOR_TIGHT", "MIXED", "OUTDOOR"]}
                label={(value) => t(`environment.${value}`)}
                onSelect={(value) => setAndAdvance("environment", value as FlightEnvironment)}
              />
            )}
            {current === "video" && (
              <ChoiceStep
                title={t("video.title")}
                testKey="video"
                selected={prefs.videoSystem}
                values={videoChoices(prefs)}
                label={(value) => value === "hdzero" ? t("videoSystem.hdzero") : t(`options.video.${value}.label`)}
                description={(value) => value === "hdzero" ? undefined : t(`options.video.${value}.desc`)}
                onSelect={(value) => setAndAdvance("videoSystem", value as UserPreferences["videoSystem"])}
              />
            )}
            {current === "ownedGear" && <OwnedGearStep onContinue={(ownedGear) => advance({ ...prefs, ownedGear, regulatoryRegion })} />}
            {current === "advancedPriority" && (
              <AdvancedStep prefs={prefs} onContinue={(values) => finish({ ...prefs, ...values, regulatoryRegion })} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <ProductModal key={detailProduct?.id ?? "none"} product={detailProduct} onClose={() => setDetailProduct(null)} />
    </div>
  );
}

function videoChoices(prefs: UserPreferences): string[] {
  const choices = ["analog", "dji_o4"];
  if (prefs.style === "racing" || prefs.experience === "advanced") choices.push("hdzero");
  choices.push("recommend");
  return choices;
}

function Welcome({ onStart }: { onStart: () => void }) {
  const { t } = useLocale();
  return (
    <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col items-center justify-center text-center">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-zinc-900 md:text-6xl">{t("welcome.title")}</h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600">{t("welcome.description")}</p>
      <button data-testid="start-button" onClick={onStart} className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-zinc-900 px-10 text-lg font-medium text-white">{t("welcome.start")}</button>
    </motion.div>
  );
}

function Progress({ steps, step, onBack }: { steps: QuestionnaireStepId[]; step: number; onBack: () => void }) {
  const { t } = useLocale();
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex flex-wrap items-center gap-2" data-testid="questionnaire-progress">
        {steps.map((item, index) => <span key={item} className={`h-2 w-7 rounded-full ${index <= step ? "bg-zinc-900" : "bg-zinc-200"}`} />)}
      </div>
      <button onClick={onBack} disabled={step === 0} className="text-sm font-medium text-zinc-600 disabled:opacity-30">{t("buttons.back")}</button>
    </div>
  );
}

function ChoiceStep({ title, testKey, selected, values, label, description, onSelect }: {
  title: string;
  testKey: string;
  selected?: string;
  values: readonly string[];
  label: (value: string) => string;
  description?: (value: string) => string | undefined;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">{title}</h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((value) => {
          const active = selected === value;
          const desc = description?.(value);
          return (
            <button key={value} data-testid={`option-${testKey}-${value}`} onClick={() => onSelect(value)} className={`flex flex-col items-start rounded-2xl border-2 p-6 text-left transition ${active ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-100 bg-white text-zinc-900 hover:border-zinc-300"}`}>
              <span className="text-lg font-semibold">{label(value)}</span>
              {desc && !desc.includes(".desc") && <span className={`mt-2 text-sm ${active ? "text-zinc-300" : "text-zinc-500"}`}>{desc}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BudgetStep({ budget, onChange, onNext }: { budget: number; onChange: (value: number) => void; onNext: () => void }) {
  const { t, formatPrice, currency } = useLocale();
  const rate = EXCHANGE_RATES[currency];
  const min = 100;
  const max = 3000;
  return (
    <div className="flex flex-1 flex-col justify-center">
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">{t("budget.title")}</h2>
      <p className="mt-3 text-zinc-600">{t("budget.description", { currency: t(`currency.${currency}`) })}</p>
      <div className="mt-10 text-5xl font-semibold text-zinc-900">{formatPrice(budget, { compact: true })}</div>
      <input type="range" min={min} max={max} step={25} value={budget} onChange={(event) => onChange(Number(event.target.value))} className="mt-8 h-2 w-full accent-zinc-900" aria-label={t("budget.title")} />
      <div className="mt-6 flex items-center gap-4">
        <label htmlFor="budget-input-v4" className="text-sm font-medium text-zinc-700">{t("budget.exactAmount")}</label>
        <input id="budget-input-v4" type="number" value={Math.round(budget * rate)} min={Math.round(min * rate)} max={Math.round(max * rate)} step={Math.round(25 * rate)} onChange={(event) => Number.isFinite(Number(event.target.value)) && onChange(Number(event.target.value) / rate)} className="w-44 rounded-xl border border-zinc-200 px-4 py-2" />
      </div>
      <button data-testid="continue-button" onClick={onNext} className="mt-10 inline-flex h-14 w-fit items-center justify-center rounded-full bg-zinc-900 px-10 text-lg font-medium text-white">{t("buttons.continue")}</button>
    </div>
  );
}

function OwnedGearStep({ onContinue }: { onContinue: (owned: OwnedGear) => void }) {
  const { t } = useLocale();
  const [selections, setSelections] = useState<Record<string, string>>({});
  const categories: Array<{ key: Exclude<ProductCategory, "drone">; label: string }> = [
    { key: "goggles", label: t("labels.goggles") },
    { key: "radio", label: t("labels.radio") },
    { key: "charger", label: t("labels.charger") },
    { key: "battery", label: t("labels.batteries") },
  ];
  function submit() {
    const owned: OwnedGear = {};
    if (selections.goggles) owned.gogglesProductId = selections.goggles;
    if (selections.radio) owned.radioProductId = selections.radio;
    if (selections.charger) owned.chargerProductId = selections.charger;
    if (selections.battery) owned.batteryProductIds = [selections.battery];
    onContinue(owned);
  }
  return (
    <div className="flex flex-1 flex-col justify-center">
      <h2 className="text-3xl font-semibold text-zinc-900">{t("scope.ownedQuestion")}</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {categories.map(({ key, label }) => (
          <label key={key} className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-medium text-zinc-700">
            {label}
            <select data-testid={`owned-${key}`} value={selections[key] ?? ""} onChange={(event) => setSelections((old) => ({ ...old, [key]: event.target.value }))} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2">
              <option value="">{t("scope.nothing")}</option>
              {getProductsByCategory(key).slice().sort((a, b) => a.priceUsd - b.priceUsd).map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
          </label>
        ))}
      </div>
      <button data-testid="continue-button" onClick={submit} className="mt-10 inline-flex h-14 w-fit items-center justify-center rounded-full bg-zinc-900 px-10 text-lg font-medium text-white">{t("buttons.continue")}</button>
    </div>
  );
}

function AdvancedStep({ prefs, onContinue }: { prefs: UserPreferences; onContinue: (values: { advancedPriority: AdvancedPriority; operationPurpose: OperationPurpose; preferSimplerWeightClass: boolean }) => void }) {
  const { t } = useLocale();
  const [priority, setPriority] = useState<AdvancedPriority>(prefs.advancedPriority ?? "BALANCED");
  const [purpose, setPurpose] = useState<OperationPurpose>(prefs.operationPurpose ?? "RECREATIONAL");
  const [simpleWeight, setSimpleWeight] = useState(Boolean(prefs.preferSimplerWeightClass));
  const priorities: AdvancedPriority[] = ["BALANCED", "LOW_LATENCY", "IMAGE_QUALITY", "VALUE", "PORTABILITY", "FLIGHT_TIME", "REPAIRABILITY"];
  return (
    <div className="flex flex-1 flex-col justify-center">
      <h2 className="text-3xl font-semibold text-zinc-900">{t("advancedPriority.title")}</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {priorities.map((value) => <button key={value} data-testid={`option-advancedPriority-${value}`} onClick={() => setPriority(value)} className={`rounded-xl border p-4 text-left ${priority === value ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white"}`}>{t(`advancedPriority.${value}`)}</button>)}
      </div>
      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5">
        <label className="text-sm font-semibold text-zinc-700">{t("regulation.operationType")}
          <select data-testid="operation-purpose" value={purpose} onChange={(event) => setPurpose(event.target.value as OperationPurpose)} className="mt-2 block w-full rounded-xl border border-zinc-200 px-3 py-2 font-normal">
            <option value="RECREATIONAL">{t("regulation.recreational")}</option>
            <option value="COMMERCIAL_OR_SPECIFIC">{t("regulation.commercial")}</option>
            <option value="NOT_SURE">{t("regulation.notSure")}</option>
          </select>
        </label>
        <label className="mt-4 flex items-center gap-3 text-sm text-zinc-700">
          <input data-testid="prefer-simple-weight" type="checkbox" checked={simpleWeight} onChange={(event) => setSimpleWeight(event.target.checked)} />
          {t("regulation.preferSimpleWeight")}
        </label>
      </div>
      <button data-testid="continue-button" onClick={() => onContinue({ advancedPriority: priority, operationPurpose: purpose, preferSimplerWeightClass: simpleWeight })} className="mt-8 inline-flex h-14 w-fit items-center justify-center rounded-full bg-zinc-900 px-10 text-lg font-medium text-white">{t("buttons.continue")}</button>
    </div>
  );
}

function ResultView({ result, prefs, onRestart, onDetail }: { result: RecommendationResult; prefs: UserPreferences; onRestart: () => void; onDetail: (product: Product) => void }) {
  const { t, formatPrice, locale, currency } = useLocale();
  if (result.kind === "insufficient" && !result.kit) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h2 data-testid="insufficient-title" className="text-3xl font-semibold text-zinc-900">{t("budget.belowMinimumTitle")}</h2>
        <p className="mt-4 max-w-xl text-zinc-600">{result.message}</p>
        <button onClick={onRestart} className="mt-8 rounded-full bg-zinc-900 px-8 py-4 text-white">{t("buttons.startOver")}</button>
      </div>
    );
  }

  const bundle = result.kit as KitBundle;
  const insufficient = result.kind === "insufficient";
  const purchased = bundle.items.filter((item) => !item.referenceOnly);
  const references = bundle.items.filter((item) => item.referenceOnly);
  const extras = buildRecommendedExtras(bundle.drone, prefs);
  const alternatives = result.kind === "kit" ? result.alternatives ?? [] : [];

  return (
    <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("result.bestPick")}</div>
          <h2 data-testid={insufficient ? "insufficient-title" : "result-title"} className="mt-1 text-3xl font-semibold text-zinc-900 md:text-4xl">{insufficient ? t("budget.belowMinimumTitle") : t("result.title")}</h2>
          <p className="mt-2 max-w-2xl text-zinc-600">
            {insufficient ? t("budget.belowMinimumBody", { minimumPrice: formatPrice(result.minBudget, { compact: true }) }) : t("result.description", { style: t(`styleLabel.${prefs.style}`) })}
          </p>
          {insufficient && <p className="mt-2 text-zinc-600">{t("budget.difference", { difference: formatPrice(Math.max(0, result.minBudget - prefs.budget), { compact: true }) })}</p>}
        </div>
        <div className="text-right"><div className="text-sm text-zinc-500">{t("cost.coreKit")}</div><div className="text-4xl font-semibold text-zinc-900">{formatPrice(bundle.corePrice, { compact: true })}</div></div>
      </div>

      <div data-testid="kit-composition" className="mt-8 rounded-3xl bg-zinc-100 p-5 text-sm text-zinc-700">
        {bundle.items.map((item) => item.referenceOnly ? null : <span key={item.product.id} className="mr-2 inline-block rounded-full bg-white px-3 py-2">{item.category === "battery" ? `${item.quantity ?? bundle.batteryQuantity}× ` : ""}{item.product.name}{item.owned ? ` · ${t("scope.alreadyOwned")}` : ""}</span>)}
      </div>

      <div data-testid="result-products" className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {purchased.map((item) => <ProductCard key={item.product.id} product={item.product} label={t(`labels.${item.category}`)} onDetail={onDetail} quantity={item.category === "battery" ? bundle.batteryQuantity : undefined} highlight={item.category === "drone"} owned={item.owned} includedInPrice={item.includedInPrice} />)}
      </div>

      {references.length > 0 && (
        <section data-testid="compatibility-references" className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5">
          <h3 className="font-semibold text-zinc-900">{t("result.compatibility")}</h3>
          <p className="mt-1 text-sm text-zinc-500">{references.map((item) => `${t(`labels.${item.category}`)}: ${item.product.name}`).join(" · ")}</p>
        </section>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5"><div className="text-xs font-semibold uppercase text-zinc-500">{t("cost.coreKit")}</div><div className="mt-1 text-2xl font-semibold">{formatPrice(bundle.corePrice, { compact: true })}</div></div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5"><div className="text-xs font-semibold uppercase text-zinc-500">{t("cost.recommendedExtras")}</div><div className="mt-1 text-2xl font-semibold">{formatPrice(bundle.extrasPrice, { compact: true })}</div><div className="mt-1 text-xs text-zinc-500">{t("cost.totalWithExtras")}: {formatPrice(bundle.totalWithExtras, { compact: true })}</div></div>
      </div>
      {currency === "cop" && <p className="mt-2 text-xs text-zinc-500">{t("cost.fxDisclaimer")}</p>}

      <section data-testid="recommended-extras" className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5">
        <h3 className="font-semibold text-zinc-900">{t("cost.recommendedExtras")}</h3>
        <p className="mt-1 text-xs text-zinc-500">{locale === "es" ? "No forman parte del bundle técnico principal ni alteran la compatibilidad dura." : "These are separate from the technical core bundle and do not alter hard compatibility."}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {extras.map((item) => (
            <div key={item.id} className="rounded-xl bg-zinc-50 p-4">
              <div className="flex items-start justify-between gap-3"><div><div className="font-medium text-zinc-900">{item.quantity > 1 ? `${item.quantity}× ` : ""}{item.name}</div><div className="mt-1 text-xs text-zinc-500">{necessityLabel(item.necessity, locale)}</div></div><div className="text-sm font-semibold text-zinc-700">{item.priceUsd === null ? "—" : formatPrice(item.priceUsd * item.quantity, { compact: true })}</div></div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">{item.reason[locale]}</p>
            </div>
          ))}
        </div>
      </section>

      <RegulatoryBadge bundle={bundle} />

      <section className="mt-8 rounded-2xl bg-zinc-100 p-6">
        <h3 className="font-semibold text-zinc-900">{t("result.whyKit")}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700">{buildExplanation(bundle, prefs, t, formatPrice)}</p>
        {bundle.reasons.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">{bundle.reasons.map((reason, index) => <li key={index}>{t(reason.messageKey, reason.params)}</li>)}</ul>}
        {bundle.warnings.length > 0 && <ul data-testid="warnings" className="mt-4 space-y-2">{bundle.warnings.map((warning, index) => <li key={index} className="rounded-xl border-l-4 border-amber-400 bg-amber-50 p-3 text-sm text-zinc-700">{t(warning.messageKey, warning.params)}</li>)}</ul>}
      </section>

      {prefs.experience === "beginner" && <div data-testid="beginner-learning-note" className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-zinc-700">{t("learning.simulatorBeginner")}</div>}

      {alternatives.length > 0 && (
        <section data-testid="alternatives" className="mt-8">
          <h3 className="text-lg font-semibold text-zinc-900">{locale === "es" ? "Alternativas" : "Alternatives"}</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {alternatives.map((alt) => <AlternativeCard key={`${alt.alternativeRole}-${alt.drone.id}`} bundle={alt} />)}
          </div>
        </section>
      )}

      <div className="mt-10 flex flex-wrap gap-4"><a href={bundle.drone.productUrl || "#"} target="_blank" rel="noopener noreferrer" className="rounded-full bg-zinc-900 px-8 py-4 text-white">{t("buttons.shopDrone")}</a><button onClick={onRestart} className="rounded-full border border-zinc-200 px-8 py-4">{t("buttons.startOver")}</button></div>
    </motion.div>
  );
}

function AlternativeCard({ bundle }: { bundle: KitBundle }) {
  const { t, formatPrice } = useLocale();
  const label = bundle.alternativeRole === "VALUE" ? t("result.valueAlternative") : t("result.premiumUpgrade");
  return <div className="rounded-2xl border border-zinc-200 bg-white p-5"><div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</div><div className="mt-1 font-semibold text-zinc-900">{bundle.drone.name}</div><div className="mt-1 text-sm text-zinc-500">{bundle.drone.aircraftProfile?.video.system ?? bundle.drone.videoSystems[0]}</div><div className="mt-3 text-lg font-semibold">{formatPrice(bundle.totalPrice, { compact: true })}</div></div>;
}

function necessityLabel(value: string, locale: "es" | "en"): string {
  const labels: Record<string, [string, string]> = {
    REQUIRED_TO_USE: ["Práctico / consumible esencial", "Practical / essential consumable"],
    STRONGLY_RECOMMENDED: ["Muy recomendado", "Strongly recommended"],
    REPAIR_REQUIRED: ["Mantenimiento / reparación", "Maintenance / repair"],
    FLIGHT_STYLE_SPECIFIC: ["Específico para este estilo", "Flight-style specific"],
    OPTIONAL_QUALITY_OF_LIFE: ["Opcional / comodidad", "Optional / quality of life"],
  };
  return labels[value]?.[locale === "es" ? 0 : 1] ?? value;
}

function buildExplanation(bundle: KitBundle, prefs: UserPreferences, t: (key: string, params?: Record<string, string | number>) => string, formatPrice: (value: number, options?: { compact?: boolean }) => string): string {
  const video: VideoSystem = prefs.videoSystem === "recommend" ? (bundle.drone.aircraftProfile?.video.system ?? bundle.drone.videoSystems[0]) : prefs.videoSystem;
  const style = t(`styleLabel.${prefs.style}`);
  const experience = t(`experienceLabel.${prefs.experience}`);
  const videoLabel = t(`videoSystem.${video}`);
  const intro = prefs.videoSystem === "recommend" ? t("explanation.introRecommend", { videoSystem: videoLabel, budget: formatPrice(prefs.budget, { compact: true }), style, experience }) : t("explanation.introFixed", { style, videoSystem: videoLabel });
  const reuse = bundle.items.filter((item) => item.owned).map((item) => item.product.name);
  const ownedText = reuse.length ? ` ${reuse.map((name) => t("ownedGear.compatibleReuse", { product: name })).join(" ")}` : "";
  return `${intro} ${t("explanation.drone", { drone: bundle.drone.name, style, videoSystem: videoLabel })}${ownedText}`;
}
