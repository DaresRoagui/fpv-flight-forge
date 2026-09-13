"use client";

import { KitBundle } from "@/lib/schema";
import { useLocale } from "@/app/components/LocaleProvider";

function regionLabelKey(region: string): string {
  switch (region) {
    case "CO":
      return "regulation.colombia";
    case "US":
      return "regulation.unitedStates";
    case "EU_EASA":
      return "regulation.euEasa";
    default:
      return "regulation.other";
  }
}

function contextualNotes(region: string, purpose: string, estimatedWeight: number | null): string[] {
  if (purpose === "NOT_SURE") return ["regulation.generalDisclaimer"];
  if (region === "CO") {
    return purpose === "RECREATIONAL"
      ? ["regulation.coFpvObserver", "regulation.generalDisclaimer"]
      : ["regulation.generalDisclaimer"];
  }
  if (region === "US") {
    return purpose === "RECREATIONAL"
      ? ["regulation.usTrust", "regulation.generalDisclaimer"]
      : ["regulation.generalDisclaimer"];
  }
  if (region === "EU_EASA") {
    // The sub-250 copy itself states the camera/operator-registration nuance.
    // Above 250g we still keep the general EASA/national-rules disclaimer.
    return estimatedWeight !== null && estimatedWeight < 250
      ? ["regulation.generalDisclaimer"]
      : ["regulation.generalDisclaimer"];
  }
  return ["regulation.generalDisclaimer"];
}

export function RegulatoryBadge({ bundle }: { bundle: KitBundle }) {
  const { t } = useLocale();
  const reg = bundle.regulatory;
  if (!reg) return null;

  const weight =
    reg.estimatedTakeoffWeightG !== null
      ? Math.round(reg.estimatedTakeoffWeightG).toString()
      : t("regulation.unknownWeight");
  const threshold = reg.weightThresholdG !== null ? reg.weightThresholdG.toString() : "";
  const params = { weight, threshold };
  const notes = contextualNotes(reg.region, reg.purpose, reg.estimatedTakeoffWeightG);

  return (
    <div data-testid="regulatory-badge" className="mt-8 rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {t("regulation.title")}
        </span>
        <span className="text-xs font-medium text-zinc-700">
          {t(regionLabelKey(reg.region))}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-zinc-900">{reg.estimatedTakeoffWeightG !== null ? `${weight} g` : "—"}</span>
        <span className="text-sm text-zinc-500">{t("regulation.readyToFlyWeight")}</span>
      </div>
      <p className="mt-2 text-sm text-zinc-700">{t(reg.messageKey, params)}</p>
      {notes.map((key) => (
        <p key={key} className="mt-2 text-xs text-zinc-500">{t(key, params)}</p>
      ))}
      {reg.warnings.length > 0 && (
        <ul className="mt-3 space-y-1">
          {reg.warnings.map((warning, idx) => (
            <li key={`${warning.type}-${idx}`} className="text-xs text-zinc-500">
              {t(warning.messageKey, warning.params ?? params)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
