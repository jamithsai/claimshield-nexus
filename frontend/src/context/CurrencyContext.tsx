import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Currency, 
  USD_TO_INR_RATE, 
  convertAmount as convertUtil,
  getCurrencySymbol,
  formatMoney as formatMoneyUtil,
  formatCompactMoney as formatCompactMoneyUtil,
  formatAxisMoney as formatAxisMoneyUtil
} from '../utils/currency';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
  currencySymbol: string;
  currencyLabel: string;
  exchangeRate: number;
  convertAmount: (amountInUSD: number) => number;
  formatMoney: (amountInUSD: number, options?: { decimals?: number; showSymbol?: boolean }) => string;
  formatCompactMoney: (amountInUSD: number) => string;
  formatAxisMoney: (amountInUSD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = 'claimshield_currency';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (saved === 'INR' || saved === 'USD') {
      return saved;
    }
    return 'USD';
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(CURRENCY_STORAGE_KEY, c);
  };

  const toggleCurrency = () => {
    const next = currency === 'USD' ? 'INR' : 'USD';
    setCurrency(next);
  };

  const currencySymbol = getCurrencySymbol(currency);
  const currencyLabel = currency === 'INR' ? 'INR (₹)' : 'USD ($)';

  const convertAmount = (amountInUSD: number) => convertUtil(amountInUSD, currency);
  const formatMoney = (amountInUSD: number, options?: { decimals?: number; showSymbol?: boolean }) =>
    formatMoneyUtil(amountInUSD, currency, options);
  const formatCompactMoney = (amountInUSD: number) =>
    formatCompactMoneyUtil(amountInUSD, currency);
  const formatAxisMoney = (amountInUSD: number) =>
    formatAxisMoneyUtil(amountInUSD, currency);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        currencySymbol,
        currencyLabel,
        exchangeRate: USD_TO_INR_RATE,
        convertAmount,
        formatMoney,
        formatCompactMoney,
        formatAxisMoney,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
