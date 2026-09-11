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

  return (
    <div data-testid="regulatory-badge" className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {t("regulation.title")}
        </span>
        <span className="text-xs font-medium text-zinc-700">
          {t(regionLabelKey(reg.region))}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-zinc-900">{weight} g</span>
        <span className="text-sm text-zinc-500">{t("regulation.readyToFlyWeight")}</span>
      </div>
      <p className="mt-2 text-sm text-zinc-700">{t(reg.messageKey, params)}</p>
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
