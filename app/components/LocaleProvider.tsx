"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  type Locale,
  type Currency,
  DEFAULT_LOCALE,
  DEFAULT_CURRENCY,
  t,
  formatPrice,
  getLocalizedProduct,
  type FormatPriceOptions,
} from "@/lib/i18n";
import { Product } from "@/lib/schema";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatPrice: (valueUsd: number, options?: FormatPriceOptions) => string;
  localizeProduct: (product: Product) => Product;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const LOCALE_KEY = "fpv-locale";
const CURRENCY_KEY = "fpv-currency";
const LOCALE_CHANGE = "fpv-locale-change";
const CURRENCY_CHANGE = "fpv-currency-change";

function isLocale(value: string | null): value is Locale {
  return value === "es" || value === "en";
}

function isCurrency(value: string | null): value is Currency {
  return value === "usd" || value === "cop";
}

function readLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function readCurrency(): Currency {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  try {
    const stored = localStorage.getItem(CURRENCY_KEY);
    return isCurrency(stored) ? stored : DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

function subscribeLocale(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(LOCALE_CHANGE, handler);
  return () => window.removeEventListener(LOCALE_CHANGE, handler);
}

function subscribeCurrency(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(CURRENCY_CHANGE, handler);
  return () => window.removeEventListener(CURRENCY_CHANGE, handler);
}

function writeLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.lang = locale;
    window.dispatchEvent(new Event(LOCALE_CHANGE));
  } catch {
    // ignore storage errors
  }
}

function writeCurrency(currency: Currency) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CURRENCY_KEY, currency);
    window.dispatchEvent(new Event(CURRENCY_CHANGE));
  } catch {
    // ignore storage errors
  }
}

function useStoredLocale(): Locale {
  return useSyncExternalStore(
    subscribeLocale,
    readLocale,
    () => DEFAULT_LOCALE
  );
}

function useStoredCurrency(): Currency {
  return useSyncExternalStore(
    subscribeCurrency,
    readCurrency,
    () => DEFAULT_CURRENCY
  );
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useStoredLocale();
  const currency = useStoredCurrency();

  useEffect(() => {
    try {
      document.documentElement.lang = locale;
    } catch {
      // ignore
    }
  }, [locale]);

  const setLocale = useCallback((value: Locale) => {
    writeLocale(value);
  }, []);

  const setCurrency = useCallback((value: Currency) => {
    writeCurrency(value);
  }, []);

  const tBound = useCallback(
    (key: string, params?: Record<string, string | number>) => t(locale, key, params),
    [locale]
  );

  const formatPriceBound = useCallback(
    (valueUsd: number, options?: FormatPriceOptions) => formatPrice(valueUsd, currency, options),
    [currency]
  );

  const localizeProduct = useCallback(
    (product: Product) => getLocalizedProduct(product, locale),
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      currency,
      setCurrency,
      t: tBound,
      formatPrice: formatPriceBound,
      localizeProduct,
    }),
    [locale, setLocale, currency, setCurrency, tBound, formatPriceBound, localizeProduct]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}
