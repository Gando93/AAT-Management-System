import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import type { Booking, Tour } from '../types';
import { isFeatureEnabled, type FeatureFlags } from '../config/features';
import { evaluateCapacity } from '../lib/resourceAvailability';

interface CalendarProps {
  bookings: Booking[];
  onDateClick: (date: Date) => void;
  onCreateBooking: () => void;
  tours?: Tour[]; // optional; used for availability coloring when flag is enabled
}

export const Calendar: React.FC<CalendarProps> = ({ bookings, onDateClick, onCreateBooking, tours = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Get previous month's last days
  const prevMonth = new Date(year, month - 1, 0);
  const daysInPrevMonth = prevMonth.getDate();

  // Get next month's first days (unused but kept for future use)
  // const nextMonth = new Date(year, month + 1, 1);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      if (booking.tourDate) {
        const bookingDate = new Date(booking.tourDate).toISOString().split('T')[0];
        return bookingDate === dateString;
      }
      return false;
    });
  };

  // Availability helper (flagged)
  const getAvailabilityStatusForDate = (date: Date) => {
    if (!isFeatureEnabled('FEATURE_RESOURCE_AVAILABILITY' as keyof FeatureFlags)) return null;
    const dateBookings = getBookingsForDate(date);
    if (dateBookings.length === 0) return null;
    // Sum participants and capacity across tours for a simple day-level indicator
    let participants = 0;
    let capacity = 0;
    for (const b of dateBookings) {
      participants += b.participants || b.guests || 0;
      const tour = tours.find(t => t.name === b.tourName);
      if (tour?.maxCapacity) capacity += tour.maxCapacity;
    }
    if (capacity <= 0) return null;
    return evaluateCapacity({ maxCapacity: capacity, bookedCount: participants });
  };

  // Check if date is today
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in current month (unused but kept for future use)
  // const isCurrentMonth = (date: Date) => {
  //   return date.getMonth() === month;
  // };

  // Render calendar days
  const renderCalendarDays = () => {
    const days = [];

    // Previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      const bookings = getBookingsForDate(date);
      const availStatus = getAvailabilityStatusForDate(date);
      
      days.push(
        <motion.div
          key={`prev-${day}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDateClick(date)}
          className={`h-24 p-2 text-gray-400 cursor-pointer rounded-lg transition-colors ${
            availStatus === 'sold-out' ? 'bg-red-100 hover:bg-red-200' :
            availStatus === 'low' ? 'bg-yellow-100 hover:bg-yellow-200' :
            'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <div className="text-sm font-medium">{day}</div>
          {bookings.length > 0 && (
            <div className="mt-1 space-y-1">
              {bookings.slice(0, 2).map(booking => (
                <div key={booking.id} className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate">
                  {booking.customerName || 'Booking'}
                </div>
              ))}
              {bookings.length > 2 && (
                <div className="text-xs text-blue-600">+{bookings.length - 2} more</div>
              )}
            </div>
          )}
        </motion.div>
      );
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const bookings = getBookingsForDate(date);
      const availStatus = getAvailabilityStatusForDate(date);
      const isTodayDate = isToday(date);
      
      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDateClick(date)}
          className={`h-24 p-2 cursor-pointer rounded-lg transition-colors ${
            isTodayDate
              ? 'bg-blue-100 border-2 border-blue-500'
              : availStatus === 'sold-out'
                ? 'bg-red-50 border border-red-300 hover:bg-red-100'
                : availStatus === 'low'
                  ? 'bg-yellow-50 border border-yellow-300 hover:bg-yellow-100'
                  : 'bg-white hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <div className={`text-sm font-medium ${isTodayDate ? 'text-blue-900' : 'text-gray-900'}`}>
            {day}
          </div>
          {bookings.length > 0 && (
            <div className="mt-1 space-y-1">
              {bookings.slice(0, 2).map(booking => (
                <div key={booking.id} className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate">
                  {booking.customerName || 'Booking'}
                </div>
              ))}
              {bookings.length > 2 && (
                <div className="text-xs text-blue-600">+{bookings.length - 2} more</div>
              )}
            </div>
          )}
        </motion.div>
      );
    }

    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const bookings = getBookingsForDate(date);
      const availStatus = getAvailabilityStatusForDate(date);
      
      days.push(
        <motion.div
          key={`next-${day}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDateClick(date)}
          className={`h-24 p-2 text-gray-400 cursor-pointer rounded-lg transition-colors ${
            availStatus === 'sold-out' ? 'bg-red-100 hover:bg-red-200' :
            availStatus === 'low' ? 'bg-yellow-100 hover:bg-yellow-200' :
            'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <div className="text-sm font-medium">{day}</div>
          {bookings.length > 0 && (
            <div className="mt-1 space-y-1">
              {bookings.slice(0, 2).map(booking => (
                <div key={booking.id} className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate">
                  {booking.customerName || 'Booking'}
                </div>
              ))}
              {bookings.length > 2 && (
                <div className="text-xs text-blue-600">+{bookings.length - 2} more</div>
              )}
            </div>
          )}
        </motion.div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Booking Calendar</h3>
              <p className="text-sm text-gray-600">Click any date to create a booking</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToToday}
              className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Today
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateBooking}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Booking</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[month]} {year}
            </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 border-2 border-blue-500 rounded"></div>
            <span className="text-gray-600">Today</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span className="text-gray-600">Has Bookings</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <span className="text-gray-600">Available</span>
          </div>
          {isFeatureEnabled('FEATURE_RESOURCE_AVAILABILITY' as keyof FeatureFlags) && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                <span className="text-gray-600">Low Capacity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-100 rounded"></div>
                <span className="text-gray-600">Sold Out</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
