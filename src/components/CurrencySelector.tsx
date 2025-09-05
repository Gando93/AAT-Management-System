import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { DollarSign, RefreshCw } from 'lucide-react';

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency, isLoading, error, fetchExchangeRates } = useCurrency();

  const currencies = [
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-medium text-gray-900">Currency</h3>
        </div>
        <button
          onClick={fetchExchangeRates}
          disabled={isLoading}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh exchange rates"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      >
        {currencies.map(curr => (
          <option key={curr.code} value={curr.code}>
            {curr.symbol} {curr.name} ({curr.code})
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
      
      {isLoading && (
        <p className="text-xs text-gray-500 mt-2">Updating rates...</p>
      )}
    </div>
  );
};
