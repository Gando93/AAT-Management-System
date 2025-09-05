import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface QuickStatsProps {
  title: string;
  currentValue: number;
  previousValue: number;
  format?: 'number' | 'currency' | 'percentage';
  color?: 'green' | 'red' | 'blue' | 'yellow';
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  title,
  currentValue,
  previousValue,
  format = 'number',
  color = 'green'
}) => {
  const calculateChange = () => {
    if (previousValue === 0) return { percentage: 0, isPositive: true };
    const change = ((currentValue - previousValue) / previousValue) * 100;
    return {
      percentage: Math.abs(change),
      isPositive: change >= 0
    };
  };

  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return `$${value.toFixed(2)}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const change = calculateChange();
  const colorClasses = {
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    yellow: 'text-yellow-600'
  };

  const bgColorClasses = {
    green: 'bg-green-50',
    red: 'bg-red-50',
    blue: 'bg-blue-50',
    yellow: 'bg-yellow-50'
  };

  const iconColorClasses = {
    green: 'text-green-500',
    red: 'text-red-500',
    blue: 'text-blue-500',
    yellow: 'text-yellow-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg ${bgColorClasses[color]} border border-opacity-20`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${colorClasses[color]}`}>
            {formatValue(currentValue)}
          </p>
        </div>
        <div className="flex items-center space-x-1">
          {change.percentage > 0 ? (
            <TrendingUp className={`w-4 h-4 ${iconColorClasses[color]}`} />
          ) : change.percentage < 0 ? (
            <TrendingDown className={`w-4 h-4 ${iconColorClasses[color]}`} />
          ) : (
            <Minus className={`w-4 h-4 ${iconColorClasses[color]}`} />
          )}
          <span className={`text-sm font-medium ${colorClasses[color]}`}>
            {change.percentage > 0 ? '+' : ''}{change.percentage.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="mt-2">
        <div className="text-xs text-gray-500">
          vs previous period: {formatValue(previousValue)}
        </div>
      </div>
    </motion.div>
  );
};

