import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CurrencyContextType {
  currency: 'PKR' | 'USD';
  setCurrency: (currency: 'PKR' | 'USD') => void;
  formatCurrency: (amount: number) => string;
  exchangeRate: number;
  convertAmount: (amount: number, fromCurrency?: 'PKR' | 'USD') => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR'); // Default to PKR
  const [exchangeRate] = useState(280); // 1 USD = 280 PKR (approximate rate)

  // Load currency preference from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency') as 'PKR' | 'USD';
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  // Save currency preference to localStorage
  const handleSetCurrency = (newCurrency: 'PKR' | 'USD') => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const formatCurrency = (amount: number): string => {
    if (currency === 'PKR') {
      return `Rs. ${amount.toLocaleString('en-PK')}`;
    } else {
      return `$${amount.toLocaleString('en-US')}`;
    }
  };

  const convertAmount = (amount: number, fromCurrency: 'PKR' | 'USD' = 'PKR'): number => {
    if (currency === fromCurrency) {
      return amount;
    }
    
    if (currency === 'USD' && fromCurrency === 'PKR') {
      return Math.round(amount / exchangeRate);
    } else if (currency === 'PKR' && fromCurrency === 'USD') {
      return Math.round(amount * exchangeRate);
    }
    
    return amount;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency: handleSetCurrency,
      formatCurrency,
      exchangeRate,
      convertAmount
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}