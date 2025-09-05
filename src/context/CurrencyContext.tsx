import React, { createContext, useContext, useState, useEffect } from 'react';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  exchangeRates: Record<string, number>;
  formatAmount: (amount: number) => string;
  convertAmount: (amount: number, fromCurrency?: string) => number;
  isLoading: boolean;
  error: string | null;
  fetchExchangeRates: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrency] = useState('EUR');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch exchange rates
  const fetchExchangeRates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Using a free API that doesn't require authentication
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      const data = await response.json();
      setExchangeRates(data.rates || {});
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
      setError('Failed to load exchange rates');
      // Set default rates if API fails
      setExchangeRates({
        EUR: 1,
        USD: 1.1,
        GBP: 0.85,
        JPY: 160,
        CAD: 1.5,
        AUD: 1.65,
        CHF: 0.95,
        CNY: 7.8
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const formatAmount = (amount: number): string => {
    const currencySymbols: Record<string, string> = {
      EUR: '€',
      USD: '$',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
      CNY: '¥'
    };

    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  const convertAmount = (amount: number, fromCurrency: string = 'EUR'): number => {
    if (fromCurrency === currency) return amount;
    
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[currency] || 1;
    
    return (amount / fromRate) * toRate;
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    exchangeRates,
    formatAmount,
    convertAmount,
    isLoading,
    error,
    fetchExchangeRates
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
