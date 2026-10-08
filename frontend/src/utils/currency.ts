/**
 * ClaimShield Nexus — Centralized Currency Conversion & Formatting Engine
 * 
 * Standardized presentation-layer currency handling supporting USD ($) and INR (₹).
 * Base canonical currency from backend: USD.
 */

export type Currency = 'USD' | 'INR';

// Canonical Presentation FX Conversion Rate (1 USD = 83.50 INR)
export const USD_TO_INR_RATE = 83.50;

/**
 * Converts a canonical USD amount into the target currency.
 */
export function convertAmount(amountInUSD: number, targetCurrency: Currency): number {
  if (typeof amountInUSD !== 'number' || isNaN(amountInUSD)) {
    return 0;
  }
  if (targetCurrency === 'INR') {
    return amountInUSD * USD_TO_INR_RATE;
  }
  return amountInUSD;
}

/**
 * Returns the currency symbol for the selected currency.
 */
export function getCurrencySymbol(currency: Currency): string {
  return currency === 'INR' ? '₹' : '$';
}

/**
 * Formats a monetary amount into standard full currency string.
 * e.g., USD: "$18,450" | INR: "₹15,40,575"
 */
export function formatMoney(
  amountInUSD: number, 
  currency: Currency = 'USD', 
  options?: { decimals?: number; showSymbol?: boolean }
): string {
  if (typeof amountInUSD !== 'number' || isNaN(amountInUSD)) {
    return currency === 'INR' ? '₹0' : '$0';
  }

  const converted = convertAmount(amountInUSD, currency);
  const decimals = options?.decimals !== undefined ? options.decimals : 0;
  const showSymbol = options?.showSymbol !== false;
  const symbol = showSymbol ? getCurrencySymbol(currency) : '';

  if (currency === 'INR') {
    // Standard Indian number grouping: ##,##,###.##
    const formatted = converted.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${symbol}${formatted}`;
  }

  // Standard US number grouping: ###,###.##
  const formatted = converted.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol}${formatted}`;
}

/**
 * Formats a monetary amount into compact notation.
 * e.g., USD: "$483.7K", "$1.25M" | INR: "₹40.39L", "₹4.04Cr", "₹15.4L"
 */
export function formatCompactMoney(
  amountInUSD: number, 
  currency: Currency = 'USD'
): string {
  if (typeof amountInUSD !== 'number' || isNaN(amountInUSD)) {
    return currency === 'INR' ? '₹0' : '$0';
  }

  const converted = convertAmount(amountInUSD, currency);
  const symbol = getCurrencySymbol(currency);
  const abs = Math.abs(converted);

  if (currency === 'INR') {
    // Indian compact financial notation: Crores (Cr) and Lakhs (L)
    if (abs >= 10000000) {
      // 1 Crore = 10,000,000
      const cr = converted / 10000000;
      return `${symbol}${cr.toFixed(cr >= 10 ? 1 : 2)}Cr`;
    }
    if (abs >= 100000) {
      // 1 Lakh = 100,000
      const lakh = converted / 100000;
      return `${symbol}${lakh.toFixed(lakh >= 10 ? 1 : 2)}L`;
    }
    if (abs >= 1000) {
      const k = converted / 1000;
      return `${symbol}${k.toFixed(1)}k`;
    }
    return `${symbol}${converted.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }

  // Western compact notation: K, M, B
  if (abs >= 1000000000) {
    return `${symbol}${(converted / 1000000000).toFixed(2)}B`;
  }
  if (abs >= 1000000) {
    return `${symbol}${(converted / 1000000).toFixed(2)}M`;
  }
  if (abs >= 1000) {
    return `${symbol}${(converted / 1000).toFixed(1)}k`;
  }
  return `${symbol}${converted.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/**
 * Formats values for chart axes (Y-Axis ticks).
 */
export function formatAxisMoney(
  amountInUSD: number, 
  currency: Currency = 'USD'
): string {
  if (amountInUSD === 0) return currency === 'INR' ? '₹0' : '$0';
  return formatCompactMoney(amountInUSD, currency);
}
