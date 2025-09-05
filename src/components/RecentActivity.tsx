import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { Booking, Customer, Notification } from '../types';

interface RecentActivityProps {
  bookings: Booking[];
  customers: Customer[];
  notifications: Notification[];
}

interface ActivityItem {
  id: string;
  type: 'booking' | 'customer' | 'tour' | 'vehicle' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  bookings,
  customers,
  notifications
}) => {
  // Create activity items from recent data
  const createActivityItems = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    // Recent bookings
    const recentBookings = bookings
      .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
      .slice(0, 3);

    recentBookings.forEach(booking => {
      activities.push({
        id: `booking-${booking.id}`,
        type: 'booking',
        title: `New Booking: ${booking.customerName}`,
        description: `${booking.tourName} - ${booking.guests} guests`,
        timestamp: booking.bookingDate,
        icon: Calendar,
        color: 'text-blue-600'
      });
    });

    // Recent customers
    const recentCustomers = customers
      .sort((a, b) => new Date(b.totalBookings).getTime() - new Date(a.totalBookings).getTime())
      .slice(0, 2);

    recentCustomers.forEach(customer => {
      activities.push({
        id: `customer-${customer.id}`,
        type: 'customer',
        title: `Customer Added: ${customer.name}`,
        description: `${customer.email} - ${customer.totalBookings} bookings`,
        timestamp: new Date().toISOString(),
        icon: User,
        color: 'text-green-600'
      });
    });

    // Recent notifications
    const recentNotifications = notifications
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3);

    recentNotifications.forEach(notification => {
      activities.push({
        id: `notification-${notification.id}`,
        type: 'notification',
        title: notification.message,
        description: notification.type,
        timestamp: notification.timestamp,
        icon: notification.read ? CheckCircle : AlertCircle,
        color: notification.read ? 'text-gray-500' : 'text-yellow-600'
      });
    });

    // Sort all activities by timestamp
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  };

  const activities = createActivityItems();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                <activity.icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
};
