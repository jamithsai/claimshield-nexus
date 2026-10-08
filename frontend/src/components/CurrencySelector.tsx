import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { Currency } from '../utils/currency';
import { DollarSign, ChevronDown, Check } from 'lucide-react';

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currencies: { code: Currency; symbol: string; label: string }[] = [
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Select Currency Display"
        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#F2FCFF] hover:bg-[#E8F8EE] border border-[#005F68]/20 text-xs font-semibold text-[#005F68] transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#209B47]"
      >
        <span className="font-mono font-bold text-[#209B47] text-xs">
          {currency === 'INR' ? '₹' : '$'}
        </span>
        <span className="font-mono text-[11px] font-bold text-[#042126]">
          {currency}
        </span>
        <ChevronDown className={`w-3 h-3 text-[#005F68]/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-40 rounded-lg bg-white border border-[#042126]/15 shadow-md py-1 z-50 text-xs font-sans animate-in fade-in-50 duration-100">
          <div className="px-2.5 py-1 text-[10px] font-bold text-[#042126]/50 uppercase tracking-wider border-b border-[#042126]/5">
            Currency Display
          </div>
          {currencies.map((c) => {
            const isSelected = currency === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setCurrency(c.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#209B47]/10 text-[#209B47] font-bold'
                    : 'text-[#042126] hover:bg-[#F2FCFF]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-4 font-mono font-bold text-center text-xs">
                    {c.symbol}
                  </span>
                  <span className="text-xs">{c.code}</span>
                  <span className="text-[10px] text-[#042126]/50">({c.label})</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#209B47]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
