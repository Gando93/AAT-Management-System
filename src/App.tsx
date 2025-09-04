import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, MapPin, Truck, Users, Settings, Plus, Edit, Trash2, ChevronDown, ChevronUp, FileText, FileSpreadsheet, RefreshCw, AlertCircle, CheckCircle, DollarSign, User as UserIcon } from 'lucide-react';
import { dataStore, initializeData } from './lib/storage';
import { UserModal } from './components/UserModal';
import { VehicleModal } from './components/VehicleModal';
import { BookingModal } from './components/BookingModal';
import { TourModal } from './components/TourModal';
import { CustomerModal } from './components/CustomerModal';
import { UserDropdown } from './components/UserDropdown';
import type { User, Vehicle, Booking, Customer, Tour, Notification } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [userModal, setUserModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; user?: User }>({ isOpen: false, mode: 'create' });
  const [vehicleModal, setVehicleModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; vehicle?: Vehicle }>({ isOpen: false, mode: 'create' });
  const [bookingModal, setBookingModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; booking?: Booking }>({ isOpen: false, mode: 'create' });
  const [tourModal, setTourModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; tour?: Tour }>({ isOpen: false, mode: 'create' });
  const [customerModal, setCustomerModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; customer?: Customer }>({ isOpen: false, mode: 'create' });
  const [expandedTours, setExpandedTours] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeData();
    loadAllData();
  }, []);

  const toggleTourExpansion = (tourId: string) => {
    const newExpanded = new Set(expandedTours);
    if (newExpanded.has(tourId)) {
      newExpanded.delete(tourId);
    } else {
      newExpanded.add(tourId);
    }
    setExpandedTours(newExpanded);
  };

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      setUsers(dataStore.users.getAll());
      setVehicles(dataStore.vehicles.getAll());
      setBookings(dataStore.bookings.getAll());
      setCustomers(dataStore.customers.getAll());
      setTours(dataStore.tours.getAll());
      setNotifications(dataStore.notifications.getAll());
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced notification system with proper ordering
  const addNotification = (type: Notification['type'], message: string) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date().toLocaleString(),
      read: false,
    };
    if (dataStore.notifications.add(notification)) {
      setNotifications(dataStore.notifications.getAll());
    }
  };

  const markNotificationRead = (id: string) => {
    const notifications = dataStore.notifications.getAll();
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    dataStore.notifications.save(updated);
    setNotifications(updated);
  };

  const markAllNotificationsRead = () => {
    const notifications = dataStore.notifications.getAll();
    const updated = notifications.map(n => ({ ...n, read: true }));
    dataStore.notifications.save(updated);
    setNotifications(updated);
  };

  // Enhanced receipt generation with better formatting
  const generateReceipt = async (booking: Booking) => {
    if (!window.confirm('Generate receipt for this booking?')) {
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const customer = customers.find(c => c.id === booking.customerId);
      const tour = tours.find(t => t.id === booking.tourId);
      const vehicle = vehicles.find(v => v.id === booking.vehicleId);
      
      // Enhanced header with better styling
      doc.setFontSize(24);
      doc.setTextColor(59, 130, 246); // Blue color
      doc.text('AAT Management System', 20, 30);
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('OFFICIAL RECEIPT', 20, 45);
      
      // Receipt details with better formatting
      doc.setFontSize(12);
      doc.text(`Receipt #: ${booking.id}`, 20, 60);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);
      doc.text(`Time: ${new Date().toLocaleTimeString()}`, 20, 80);
      
      // Line separator
      doc.setDrawColor(59, 130, 246);
      doc.line(20, 90, 190, 90);
      
      // Customer details with enhanced styling
      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text('CUSTOMER DETAILS', 20, 105);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${customer?.name || booking.customerName || 'Unknown'}`, 20, 115);
      doc.text(`Email: ${customer?.email || 'Not provided'}`, 20, 125);
      doc.text(`Phone: ${customer?.phone || 'Not provided'}`, 20, 135);
      
      // Tour details
      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text('TOUR DETAILS', 20, 150);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Tour: ${tour?.name || booking.tourName || 'Unknown'}`, 20, 160);
      doc.text(`Duration: ${tour?.duration || 'Not specified'}`, 20, 170);
      doc.text(`Tour Date: ${booking.tourDate ? new Date(booking.tourDate).toLocaleDateString() : 'Not specified'}`, 20, 180);
      doc.text(`Participants: ${booking.participants || booking.guests || 0}`, 20, 190);
      
      if (vehicle) {
        doc.text(`Vehicle: ${vehicle.name}`, 20, 200);
      }
      
      // Payment details with enhanced formatting
      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text('PAYMENT DETAILS', 20, 215);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Amount: €${booking.totalAmount}`, 20, 225);
      doc.text(`Payment Method: ${booking.paymentMethod || 'Not specified'}`, 20, 235);
      doc.text(`Payment Status: ${booking.paymentStatus || 'Pending'}`, 20, 245);
      doc.text(`Booking Status: ${booking.status}`, 20, 255);
      
      // Enhanced footer
      doc.setDrawColor(59, 130, 246);
      doc.line(20, 265, 190, 265);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text('Thank you for choosing AAT Management System!', 20, 275);
      doc.text('For inquiries, contact us at info@aatmanagement.com', 20, 280);
      
      // Save the PDF
      doc.save(`receipt-${booking.id}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      addNotification('booking', 'Receipt generated successfully');
    } catch (error) {
      console.error('Error generating receipt:', error);
      addNotification('booking', 'Error generating receipt. Please try again.');
    }
  };

  // Enhanced booking operations with better error handling
  const handleBookingSave = (bookingData: Omit<Booking, 'id'>) => {
    try {
      const newBooking: Booking = { ...bookingData, id: 'BK' + Date.now().toString() };
      if (dataStore.bookings.add(newBooking)) {
        setBookings(dataStore.bookings.getAll());
        addNotification('booking', `New booking for "${newBooking.customerName}" has been created`);
        return true;
      }
      throw new Error('Failed to save booking');
    } catch (error) {
      console.error('Error saving booking:', error);
      addNotification('booking', 'Error creating booking. Please try again.');
      return false;
    }
  };

  // User operations
  const handleUserSave = (userData: Omit<User, 'id'>) => {
    try {
      const newUser: User = { ...userData, id: Date.now().toString() };
      if (dataStore.users.add(newUser)) {
        setUsers(dataStore.users.getAll());
        addNotification('user', `New user "${newUser.name}" has been added`);
        return true;
      }
      throw new Error('Failed to save user');
    } catch (error) {
      console.error('Error saving user:', error);
      addNotification('user', 'Error creating user. Please try again.');
      return false;
    }
  };

  const handleUserUpdate = (userData: Omit<User, 'id'>) => {
    try {
      if (userModal.user && dataStore.users.update(userModal.user.id, userData)) {
        setUsers(dataStore.users.getAll());
        addNotification('user', `User "${userData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update user');
    } catch (error) {
      console.error('Error updating user:', error);
      addNotification('user', 'Error updating user. Please try again.');
      return false;
    }
  };

  const handleUserDelete = (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (user && dataStore.users.delete(userId)) {
        setUsers(dataStore.users.getAll());
        addNotification('user', `User "${user.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      addNotification('user', 'Error deleting user. Please try again.');
    }
  };

  // Vehicle operations
  const handleVehicleSave = (vehicleData: Omit<Vehicle, 'id'>) => {
    try {
      const newVehicle: Vehicle = { ...vehicleData, id: 'VEH' + Date.now().toString() };
      if (dataStore.vehicles.add(newVehicle)) {
        setVehicles(dataStore.vehicles.getAll());
        addNotification('vehicle', `New vehicle "${newVehicle.name}" has been added`);
        return true;
      }
      throw new Error('Failed to save vehicle');
    } catch (error) {
      console.error('Error saving vehicle:', error);
      addNotification('vehicle', 'Error creating vehicle. Please try again.');
      return false;
    }
  };

  const handleVehicleUpdate = (vehicleData: Omit<Vehicle, 'id'>) => {
    try {
      if (vehicleModal.vehicle && dataStore.vehicles.update(vehicleModal.vehicle.id, vehicleData)) {
        setVehicles(dataStore.vehicles.getAll());
        addNotification('vehicle', `Vehicle "${vehicleData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update vehicle');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      addNotification('vehicle', 'Error updating vehicle. Please try again.');
      return false;
    }
  };

  const handleVehicleDelete = (vehicleId: string) => {
    try {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle && dataStore.vehicles.delete(vehicleId)) {
        setVehicles(dataStore.vehicles.getAll());
        addNotification('vehicle', `Vehicle "${vehicle.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      addNotification('vehicle', 'Error deleting vehicle. Please try again.');
    }
  };

  // Customer operations
  const handleCustomerSave = (customerData: Omit<Customer, 'id'>) => {
    try {
      const newCustomer: Customer = { ...customerData, id: 'CU' + Date.now().toString() };
      if (dataStore.customers.add(newCustomer)) {
        setCustomers(dataStore.customers.getAll());
        addNotification('customer', `New customer "${newCustomer.name}" has been added`);
        return true;
      }
      throw new Error('Failed to save customer');
    } catch (error) {
      console.error('Error saving customer:', error);
      addNotification('customer', 'Error creating customer. Please try again.');
      return false;
    }
  };

  const handleCustomerUpdate = (customerData: Omit<Customer, 'id'>) => {
    try {
      if (customerModal.customer && dataStore.customers.update(customerModal.customer.id, customerData)) {
        setCustomers(dataStore.customers.getAll());
        addNotification('customer', `Customer "${customerData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update customer');
    } catch (error) {
      console.error('Error updating customer:', error);
      addNotification('customer', 'Error updating customer. Please try again.');
      return false;
    }
  };

  const handleCustomerDelete = (customerId: string) => {
    try {
      const customer = customers.find(c => c.id === customerId);
      if (customer && dataStore.customers.delete(customerId)) {
        setCustomers(dataStore.customers.getAll());
        addNotification('customer', `Customer "${customer.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      addNotification('customer', 'Error deleting customer. Please try again.');
    }
  };

  // Tour operations
  const handleTourSave = (tourData: Omit<Tour, 'id'>) => {
    try {
      const newTour: Tour = { ...tourData, id: 'TOUR' + Date.now().toString() };
      if (dataStore.tours.add(newTour)) {
        setTours(dataStore.tours.getAll());
        addNotification('tour', `New tour "${newTour.name}" has been added`);
        return true;
      }
      throw new Error('Failed to save tour');
    } catch (error) {
      console.error('Error saving tour:', error);
      addNotification('tour', 'Error creating tour. Please try again.');
      return false;
    }
  };

  const handleTourUpdate = (tourData: Omit<Tour, 'id'>) => {
    try {
      if (tourModal.tour && dataStore.tours.update(tourModal.tour.id, tourData)) {
        setTours(dataStore.tours.getAll());
        addNotification('tour', `Tour "${tourData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update tour');
    } catch (error) {
      console.error('Error updating tour:', error);
      addNotification('tour', 'Error updating tour. Please try again.');
      return false;
    }
  };

  const handleTourDelete = (tourId: string) => {
    try {
      const tour = tours.find(t => t.id === tourId);
      if (tour && dataStore.tours.delete(tourId)) {
        setTours(dataStore.tours.getAll());
        addNotification('tour', `Tour "${tour.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
      addNotification('tour', 'Error deleting tour. Please try again.');
    }
  };

  // Create customer for booking modal
  const handleCreateCustomer = async (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
    try {
      const newCustomer: Customer = { ...customerData, id: 'CU' + Date.now().toString() };
      if (dataStore.customers.add(newCustomer)) {
        setCustomers(dataStore.customers.getAll());
        addNotification('customer', `New customer "${newCustomer.name}" has been added`);
        return newCustomer;
      }
      throw new Error('Failed to create customer');
    } catch (error) {
      console.error('Error creating customer:', error);
      addNotification('customer', 'Error creating customer. Please try again.');
      throw error;
    }
  };

  const handleBookingUpdate = (bookingData: Omit<Booking, 'id'>) => {
    try {
      if (bookingModal.booking && dataStore.bookings.update(bookingModal.booking.id, bookingData)) {
        setBookings(dataStore.bookings.getAll());
        addNotification('booking', `Booking for "${bookingData.customerName}" has been updated`);
        return true;
      }
      throw new Error('Failed to update booking');
    } catch (error) {
      console.error('Error updating booking:', error);
      addNotification('booking', 'Error updating booking. Please try again.');
      return false;
    }
  };

  const handleBookingDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        if (dataStore.bookings.delete(id)) {
          setBookings(dataStore.bookings.getAll());
          addNotification('booking', 'Booking deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting booking:', error);
        addNotification('booking', 'Error deleting booking. Please try again.');
      }
    }
  };

  // Enhanced booking status management
  const confirmBooking = (bookingId: string) => {
    if (window.confirm('Confirm this booking?')) {
      try {
        const updatedBookings = bookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'confirmed' as const }
            : booking
        );
        setBookings(updatedBookings);
        dataStore.bookings.save(updatedBookings);
        addNotification('booking', 'Booking confirmed successfully');
      } catch (error) {
        console.error('Error confirming booking:', error);
        addNotification('booking', 'Error confirming booking. Please try again.');
      }
    }
  };

  const markAsPaid = (bookingId: string) => {
    if (window.confirm('Mark this booking as paid?')) {
      try {
        const updatedBookings = bookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'paid' as const, paymentStatus: 'paid' as const }
            : booking
        );
        setBookings(updatedBookings);
        dataStore.bookings.save(updatedBookings);
        addNotification('booking', 'Booking marked as paid');
      } catch (error) {
        console.error('Error marking booking as paid:', error);
        addNotification('booking', 'Error updating payment status. Please try again.');
      }
    }
  };

  // Navigation with improved styling
  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: Home },
    { name: 'Bookings', id: 'bookings', icon: Calendar },
    { name: 'Tours', id: 'tours', icon: MapPin },
    { name: 'Fleet', id: 'fleet', icon: Truck },
    { name: 'Customers', id: 'customers', icon: Users },
    { name: 'Settings', id: 'settings', icon: Settings },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': case 'confirmed': case 'paid': case 'active': return 'bg-green-100 text-green-800';
      case 'in-use': case 'pending': return 'bg-blue-100 text-blue-800';
      case 'maintenance': case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': case 'refunded': case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Header - Only Refresh Button */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end h-16">
            <button
              onClick={() => loadAllData()}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Enhanced Sidebar */}
        <nav className="w-64 bg-white shadow-xl border-r border-gray-200 min-h-screen flex flex-col">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">AAT Management</h1>
                <p className="text-sm text-blue-100">Tour Management System</p>
              </div>
              {/* User Profile moved to top right */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center border border-white border-opacity-30">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-white">
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-blue-100">Administrator</p>
                  </div>
                </div>
                <UserDropdown
                  notifications={notifications}
                  onMarkNotificationRead={markNotificationRead}
                  onMarkAllNotificationsRead={markAllNotificationsRead}
                  onSettingsClick={() => setCurrentPage('settings')}
                />
              </div>
            </div>
          </div>
          <div className="p-4 flex-1">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.id}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentPage(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentPage === item.id 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </motion.button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-red-800">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <p className="text-blue-800">Loading data...</p>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {/* Page Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {currentPage === 'dashboard' && 'Dashboard'}
                  {currentPage === 'bookings' && 'Bookings Management'}
                  {currentPage === 'tours' && 'Tours Management'}
                  {currentPage === 'fleet' && 'Fleet Management'}
                  {currentPage === 'customers' && 'Customers Management'}
                  {currentPage === 'settings' && 'Settings'}
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  {currentPage === 'dashboard' && 'Welcome back! Here\'s what\'s happening with your tours.'}
                  {currentPage === 'bookings' && 'Manage all tour bookings and reservations'}
                  {currentPage === 'tours' && 'Manage your tour offerings and packages'}
                  {currentPage === 'fleet' && 'Manage your vehicle fleet'}
                  {currentPage === 'customers' && 'Manage customer information and relationships'}
                  {currentPage === 'settings' && 'Manage users and system settings'}
                </p>
              </div>
              {/* Action Buttons */}
              {currentPage === 'dashboard' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setBookingModal({ isOpen: true, mode: 'create' })}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Booking</span>
                </motion.button>
              )}
              {currentPage === 'fleet' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setVehicleModal({ isOpen: true, mode: 'create' })}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Vehicle</span>
                </motion.button>
              )}
              {currentPage === 'bookings' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setBookingModal({ isOpen: true, mode: 'create' })}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Booking</span>
                </motion.button>
              )}
              {currentPage === 'tours' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTourModal({ isOpen: true, mode: 'create' })}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Tour</span>
                </motion.button>
              )}
              {currentPage === 'customers' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCustomerModal({ isOpen: true, mode: 'create' })}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Customer</span>
                </motion.button>
              )}
              {currentPage === 'settings' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserModal({ isOpen: true, mode: 'create' })}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add User</span>
                </motion.button>
              )}
            </motion.div>

            {/* Dashboard Content */}
            {currentPage === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Bookings</p>
                      <p className="text-3xl font-bold text-blue-900">{bookings.length}</p>
                      <p className="text-xs text-blue-500 mt-1">+12% from last month</p>
                    </div>
                    <div className="p-3 bg-blue-500 rounded-lg">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Total Customers</p>
                      <p className="text-3xl font-bold text-green-900">{customers.length}</p>
                      <p className="text-xs text-green-500 mt-1">+8% from last month</p>
                    </div>
                    <div className="p-3 bg-green-500 rounded-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Active Tours</p>
                      <p className="text-3xl font-bold text-purple-900">{tours.filter(t => t.status === 'active').length}</p>
                      <p className="text-xs text-purple-500 mt-1">Available for booking</p>
                    </div>
                    <div className="p-3 bg-purple-500 rounded-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Fleet Vehicles</p>
                      <p className="text-3xl font-bold text-orange-900">{vehicles.length}</p>
                      <p className="text-xs text-orange-500 mt-1">{vehicles.filter(v => v.status === 'available').length} available</p>
                    </div>
                    <div className="p-3 bg-orange-500 rounded-lg">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Bookings Management */}
            {currentPage === 'bookings' && (
              <div className="space-y-6">
                {/* Export Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between bg-white p-6 rounded-xl shadow-lg border border-gray-200"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Export Bookings</h2>
                    <p className="text-sm text-gray-600">Download your bookings data in various formats</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {/* Export CSV function */}}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Export CSV</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {/* Export PDF function */}}
                      className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Export PDF</span>
                    </motion.button>
                  </div>
                </motion.div>

                {/* Bookings List */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-200"
                >
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">All Bookings</h3>
                    <p className="text-sm text-gray-600">Manage and view all tour bookings</p>
                  </div>
                  <div className="p-6">
                    {bookings.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                        <p className="text-gray-500 mb-6">Start by creating your first booking</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setBookingModal({ isOpen: true, mode: 'create' })}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Create First Booking
                        </motion.button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map(booking => {
                          const customer = customers.find(c => c.id === booking.customerId);
                          const tour = tours.find(t => t.id === booking.tourId);
                          const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                          
                          return (
                            <div key={booking.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{customer?.name || booking.customerName || 'Unknown Customer'}</h4>
                                  <p className="text-sm text-gray-600">{tour?.name || booking.tourName || 'Unknown Tour'}</p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                    <span>📅 {booking.tourDate ? new Date(booking.tourDate).toLocaleDateString() : 'Not specified'}</span>
                                    <span>👥 {booking.participants || booking.guests || 0} participants</span>
                                    <span>🚗 {vehicle?.name || 'Not assigned'}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <p className="text-lg font-semibold text-gray-900">€{booking.totalAmount}</p>
                                  <p className="text-sm text-gray-500">{booking.paymentStatus || 'Not specified'}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                    {booking.status}
                                  </span>
                                  
                                  {/* Quick Actions */}
                                  {booking.status === 'pending' && (
                                    <button
                                      onClick={() => confirmBooking(booking.id)}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                      title="Confirm Booking"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                  
                                  {booking.status === 'confirmed' && booking.paymentStatus !== 'paid' && (
                                    <button
                                      onClick={() => markAsPaid(booking.id)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                      title="Mark as Paid"
                                    >
                                      <DollarSign className="w-4 h-4" />
                                    </button>
                                  )}
                                  
                                  {(booking.status === 'confirmed' || booking.status === 'paid') && (
                                    <button
                                      onClick={() => generateReceipt(booking)}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                      title="Generate Receipt"
                                    >
                                      <FileText className="w-4 h-4" />
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => setBookingModal({ isOpen: true, mode: 'edit', booking })}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title="Edit Booking"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleBookingDelete(booking.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="Delete Booking"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Tours Management */}
            {currentPage === 'tours' && (
              <div className="space-y-4">
                {tours.map(tour => {
                  const isExpanded = expandedTours.has(tour.id);
                  return (
                    <div key={tour.id} className="bg-white rounded-lg shadow">
                      <div 
                        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleTourExpansion(tour.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">{tour.name}</h3>
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl font-bold text-blue-600">€{tour.price}</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tour.status)}`}>
                                  {tour.status}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <span><span className="font-medium">Duration:</span> {tour.duration}</span>
                              <span><span className="font-medium">Category:</span> {tour.category}</span>
                              <span><span className="font-medium">Capacity:</span> {tour.maxCapacity} people</span>
                              <span><span className="font-medium">Rating:</span> {tour.rating}/5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="px-6 pb-6 border-t bg-gray-50">
                          <div className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Tour Details</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <p><span className="font-medium">Pickup Time:</span> {tour.pickupTime || 'Not specified'}</p>
                                  <p><span className="font-medium">Dropoff Time:</span> {tour.dropoffTime || 'Not specified'}</p>
                                  <p><span className="font-medium">Current Bookings:</span> {tour.bookings}</p>
                                  <p><span className="font-medium">Available Spots:</span> {(tour.maxCapacity || 0) - tour.bookings}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {tour.description || 'No description available.'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex space-x-3 mt-6">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTourModal({ isOpen: true, mode: 'edit', tour });
                                }}
                                className="flex items-center px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Tour
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTourDelete(tour.id);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Tour
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fleet Management */}
            {currentPage === 'fleet' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map(vehicle => (
                  <div key={vehicle.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{vehicle.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Type:</span> {vehicle.type}</p>
                      <p><span className="font-medium">Capacity:</span> {vehicle.capacity} passengers</p>
                      <p><span className="font-medium">License:</span> {vehicle.licensePlate}</p>
                      <p><span className="font-medium">Driver:</span> {vehicle.driver || 'Unassigned'}</p>
                      <p><span className="font-medium">Location:</span> {vehicle.location || 'Unknown'}</p>
                      {vehicle.fuelLevel && <p><span className="font-medium">Fuel:</span> {vehicle.fuelLevel}%</p>}
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => setVehicleModal({ isOpen: true, mode: 'edit', vehicle })}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleVehicleDelete(vehicle.id)}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Customers Management */}
            {currentPage === 'customers' && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">All Customers</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {customers.map(customer => (
                      <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-600">{customer.email}</p>
                          <p className="text-sm text-gray-500">{customer.phone}</p>
                          <p className="text-sm text-gray-500">{customer.totalBookings} bookings • €{customer.totalSpent} spent</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status || 'active')}`}>
                            {customer.status || 'active'}
                          </span>
                          <button
                            onClick={() => setCustomerModal({ isOpen: true, mode: 'edit', customer })}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCustomerDelete(customer.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Management */}
            {currentPage === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">System Overview</h2>
                    <p className="text-sm text-gray-600">Current system status and statistics</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{users.length}</h3>
                        <p className="text-sm text-gray-600">Total Users</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{bookings.length}</h3>
                        <p className="text-sm text-gray-600">Total Bookings</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{tours.length}</h3>
                        <p className="text-sm text-gray-600">Active Tours</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                    <p className="text-sm text-gray-600">Manage system users and permissions</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {users.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <p className="text-sm text-gray-500">{user.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                            <button
                              onClick={() => setUserModal({ isOpen: true, mode: 'edit', user })}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUserDelete(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <UserModal
        isOpen={userModal.isOpen}
        onClose={() => setUserModal({ isOpen: false, mode: 'create' })}
        onSave={userModal.mode === 'create' ? handleUserSave : handleUserUpdate}
        user={userModal.user}
        mode={userModal.mode}
      />

      <VehicleModal
        isOpen={vehicleModal.isOpen}
        onClose={() => setVehicleModal({ isOpen: false, mode: 'create' })}
        onSave={vehicleModal.mode === 'create' ? handleVehicleSave : handleVehicleUpdate}
        vehicle={vehicleModal.vehicle}
        mode={vehicleModal.mode}
      />

      <BookingModal
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal({ isOpen: false, mode: 'create' })}
        onSave={bookingModal.mode === 'create' ? handleBookingSave : handleBookingUpdate}
        booking={bookingModal.booking}
        mode={bookingModal.mode}
        customers={customers}
        tours={tours}
        onCreateCustomer={handleCreateCustomer}
      />

      <TourModal
        isOpen={tourModal.isOpen}
        onClose={() => setTourModal({ isOpen: false, mode: 'create' })}
        onSave={tourModal.mode === 'create' ? handleTourSave : handleTourUpdate}
        tour={tourModal.tour}
        mode={tourModal.mode}
      />

      <CustomerModal
        isOpen={customerModal.isOpen}
        onClose={() => setCustomerModal({ isOpen: false, mode: 'create' })}
        onSave={customerModal.mode === 'create' ? handleCustomerSave : handleCustomerUpdate}
        customer={customerModal.customer}
        mode={customerModal.mode}
      />
    </div>
  );
}

export default App;
