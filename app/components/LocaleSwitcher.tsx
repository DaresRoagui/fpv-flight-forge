"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import type { Locale, Currency } from "@/lib/i18n";

export function LocaleSwitcher() {
  const { locale, setLocale, currency, setCurrency, t } = useLocale();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-select" className="sr-only">
        {t("header.language")}
      </label>
      <select
        id="language-select"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="h-9 rounded-full border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 focus:border-zinc-900 focus:outline-none"
      >
        <option value="es">ES</option>
        <option value="en">EN</option>
      </select>

      <label htmlFor="currency-select" className="sr-only">
        {t("header.currency")}
      </label>
      <select
        id="currency-select"
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="h-9 rounded-full border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 focus:border-zinc-900 focus:outline-none"
      >
        <option value="usd">USD</option>
        <option value="cop">COP</option>
      </select>
    </div>
  );
}
