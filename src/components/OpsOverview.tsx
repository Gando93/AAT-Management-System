import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useFeatureFlag } from '../config/features';
import { useCurrency } from '../context/CurrencyContext';
import type { Booking, Tour, Vehicle, User } from '../types';
import { 
  BarChart3, 
  TrendingUp,
  DollarSign,
  MapPin,
  Calendar,
  Truck,
  UserCheck,
  Download,
  RefreshCw
} from 'lucide-react';

interface OpsOverviewProps {
  bookings: Booking[];
  tours: Tour[];
  vehicles: Vehicle[];
  guides: User[];
  period: 'today' | 'week' | 'month' | 'quarter' | 'year';
  onPeriodChange: (period: 'today' | 'week' | 'month' | 'quarter' | 'year') => void;
}

interface RevenueData {
  tourName: string;
  revenue: number;
  bookings: number;
  loadFactor: number;
}

interface UtilizationData {
  resourceName: string;
  utilization: number;
  totalHours: number;
  availableHours: number;
}

export const OpsOverview: React.FC<OpsOverviewProps> = ({
  bookings,
  tours,
  vehicles,
  guides,
  period,
  onPeriodChange
}) => {
  const { formatAmount } = useCurrency();
  const advancedReportsEnabled = useFeatureFlag('FEATURE_ADVANCED_REPORTS');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [guideUtilization, setGuideUtilization] = useState<UtilizationData[]>([]);
  const [vehicleUtilization, setVehicleUtilization] = useState<UtilizationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate date range based on period
  const getDateRange = useCallback(() => {
    const now = new Date();
    const start = new Date();
    
    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        return { start, end: now };
      case 'week':
        start.setDate(now.getDate() - 7);
        return { start, end: now };
      case 'month':
        start.setMonth(now.getMonth() - 1);
        return { start, end: now };
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        return { start, end: now };
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        return { start, end: now };
      default:
        return { start, end: now };
    }
  }, [period]);

  // Calculate revenue by tour
  useEffect(() => {
    const calculateRevenueData = () => {
      const { start, end } = getDateRange();
      const periodBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.tourDate);
        return bookingDate >= start && bookingDate <= end;
      });

      const revenueMap = new Map<string, { revenue: number; bookings: number; maxCapacity: number }>();
      
      periodBookings.forEach(booking => {
        const tour = tours.find(t => t.name === booking.tourName);
        if (tour) {
          const existing = revenueMap.get(booking.tourName) || { revenue: 0, bookings: 0, maxCapacity: tour.maxCapacity || 0 };
          revenueMap.set(booking.tourName, {
            revenue: existing.revenue + booking.totalAmount,
            bookings: existing.bookings + 1,
            maxCapacity: existing.maxCapacity
          });
        }
      });

      const revenueData = Array.from(revenueMap.entries()).map(([tourName, data]) => ({
        tourName,
        revenue: data.revenue,
        bookings: data.bookings,
        loadFactor: data.maxCapacity > 0 ? (data.bookings / data.maxCapacity) * 100 : 0
      })).sort((a, b) => b.revenue - a.revenue);

      setRevenueData(revenueData);
    };

    calculateRevenueData();
  }, [bookings, tours, period, getDateRange]);

  // Calculate guide utilization
  useEffect(() => {
    const calculateGuideUtilization = () => {
      const { start, end } = getDateRange();
      const periodBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.tourDate);
        return bookingDate >= start && bookingDate <= end;
      });

      const guideMap = new Map<string, { totalHours: number; bookings: number }>();
      
      periodBookings.forEach(booking => {
        // Assuming each booking is 4 hours average
        const hours = 4;
        const guideId = (booking as { assignedGuide?: string }).assignedGuide || 'unassigned';
        const existing = guideMap.get(guideId) || { totalHours: 0, bookings: 0 };
        guideMap.set(guideId, {
          totalHours: existing.totalHours + hours,
          bookings: existing.bookings + 1
        });
      });

      const guideUtilization = Array.from(guideMap.entries()).map(([guideId, data]) => {
        const guide = guides.find(g => g.id === guideId);
        const availableHours = 8 * Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)); // 8 hours per day
        return {
          resourceName: guide?.name || 'Unassigned',
          utilization: availableHours > 0 ? (data.totalHours / availableHours) * 100 : 0,
          totalHours: data.totalHours,
          availableHours
        };
      }).sort((a, b) => b.utilization - a.utilization);

      setGuideUtilization(guideUtilization);
    };

    calculateGuideUtilization();
  }, [bookings, guides, period, getDateRange]);

  // Calculate vehicle utilization
  useEffect(() => {
    const calculateVehicleUtilization = () => {
      const { start, end } = getDateRange();
      const periodBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.tourDate);
        return bookingDate >= start && bookingDate <= end;
      });

      const vehicleMap = new Map<string, { totalHours: number; bookings: number }>();
      
      periodBookings.forEach(booking => {
        // Assuming each booking is 4 hours average
        const hours = 4;
        const vehicleId = (booking as { assignedVehicle?: string }).assignedVehicle || 'unassigned';
        const existing = vehicleMap.get(vehicleId) || { totalHours: 0, bookings: 0 };
        vehicleMap.set(vehicleId, {
          totalHours: existing.totalHours + hours,
          bookings: existing.bookings + 1
        });
      });

      const vehicleUtilization = Array.from(vehicleMap.entries()).map(([vehicleId, data]) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        const availableHours = 8 * Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)); // 8 hours per day
        return {
          resourceName: vehicle?.name || 'Unassigned',
          utilization: availableHours > 0 ? (data.totalHours / availableHours) * 100 : 0,
          totalHours: data.totalHours,
          availableHours
        };
      }).sort((a, b) => b.utilization - a.utilization);

      setVehicleUtilization(vehicleUtilization);
    };

    calculateVehicleUtilization();
  }, [bookings, vehicles, period, getDateRange]);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    // Export functionality would be implemented here
    console.log('Exporting Ops Overview data...');
  };

  const getTotalRevenue = () => {
    return revenueData.reduce((sum, item) => sum + item.revenue, 0);
  };

  const getTotalBookings = () => {
    return revenueData.reduce((sum, item) => sum + item.bookings, 0);
  };

  const getAverageLoadFactor = () => {
    return revenueData.length > 0 
      ? revenueData.reduce((sum, item) => sum + item.loadFactor, 0) / revenueData.length 
      : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operations Overview</h1>
          <p className="text-gray-600">Key metrics and performance indicators</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          {advancedReportsEnabled && (
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              More Reports (Beta)
            </button>
          )}
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center space-x-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Period:</span>
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value as 'today' | 'week' | 'month' | 'quarter' | 'year')}
          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="quarter">Last 3 Months</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(getTotalRevenue())}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalBookings()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Load Factor</p>
              <p className="text-2xl font-bold text-gray-900">{getAverageLoadFactor().toFixed(1)}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Tours</p>
              <p className="text-2xl font-bold text-gray-900">{tours.filter(t => t.status === 'active').length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Revenue by Tour */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Revenue by Tour</h3>
          <p className="text-sm text-gray-600">Performance breakdown by tour type</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {revenueData.map((item, index) => (
              <div key={item.tourName} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.tourName}</p>
                    <p className="text-sm text-gray-600">{item.bookings} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatAmount(item.revenue)}</p>
                  <p className="text-sm text-gray-600">{item.loadFactor.toFixed(1)}% load factor</p>
                </div>
              </div>
            ))}
            {revenueData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No revenue data for the selected period</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Resource Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guide Utilization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Guide Utilization</h3>
            <p className="text-sm text-gray-600">Guide workload and efficiency</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {guideUtilization.map((item) => (
                <div key={item.resourceName} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.resourceName}</p>
                      <p className="text-sm text-gray-600">{item.totalHours}h / {item.availableHours}h</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{item.utilization.toFixed(1)}%</p>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(item.utilization, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {guideUtilization.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <UserCheck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No guide utilization data</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Vehicle Utilization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Vehicle Utilization</h3>
            <p className="text-sm text-gray-600">Fleet usage and efficiency</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {vehicleUtilization.map((item) => (
                <div key={item.resourceName} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.resourceName}</p>
                      <p className="text-sm text-gray-600">{item.totalHours}h / {item.availableHours}h</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{item.utilization.toFixed(1)}%</p>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(item.utilization, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {vehicleUtilization.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Truck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No vehicle utilization data</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
