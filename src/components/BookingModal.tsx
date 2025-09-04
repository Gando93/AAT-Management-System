import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import type { Booking, Customer, Tour } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Omit<Booking, 'id'>) => void;
  booking?: Booking;
  mode: 'create' | 'edit';
  customers: Customer[];
  tours: Tour[];
  onCreateCustomer?: (customer: Omit<Customer, 'id'>) => Promise<Customer>;
}

export const BookingModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  booking, 
  mode, 
  customers, 
  tours,
  onCreateCustomer 
}: BookingModalProps) => {
  const [formData, setFormData] = useState({
    customerName: '',
    tourName: '',
    bookingDate: '',
    tourDate: '',
    totalAmount: 0,
    status: 'pending' as Booking['status'],
    guests: 1,
    participants: 1,
    notes: '',
    paymentMethod: '',
    paymentStatus: 'pending' as Booking['paymentStatus'],
    roomNumber: '',
  });

  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (mode === 'edit' && booking) {
      setFormData({
        customerName: booking.customerName,
        tourName: booking.tourName,
        bookingDate: booking.bookingDate,
        tourDate: booking.tourDate || '',
        totalAmount: booking.totalAmount,
        status: booking.status,
        guests: booking.guests,
        participants: booking.participants || booking.guests,
        notes: booking.notes || '',
        paymentMethod: booking.paymentMethod || '',
        paymentStatus: booking.paymentStatus || 'pending',
        roomNumber: booking.roomNumber || '',
      });
    } else {
      setFormData({
        customerName: '',
        tourName: '',
        bookingDate: new Date().toISOString().split('T')[0],
        tourDate: '',
        totalAmount: 0,
        status: 'pending',
        guests: 1,
        participants: 1,
        notes: '',
        paymentMethod: '',
        paymentStatus: 'pending',
        roomNumber: '',
      });
    }
  }, [mode, booking, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showNewCustomer && onCreateCustomer) {
      const customer = await onCreateCustomer({
        ...newCustomer,
        totalBookings: 0,
        totalSpent: 0,
        status: 'active',
      });
      setFormData(prev => ({ ...prev, customerName: customer.name }));
    }
    
    onSave(formData);
    onClose();
  };

  const handleCreateCustomer = async () => {
    if (onCreateCustomer) {
      const customer = await onCreateCustomer({
        ...newCustomer,
        totalBookings: 0,
        totalSpent: 0,
        status: 'active',
      });
      setFormData(prev => ({ ...prev, customerName: customer.name }));
      setShowNewCustomer(false);
      setNewCustomer({ name: '', email: '', phone: '' });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'New Booking' : 'Edit Booking'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!showNewCustomer ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <div className="flex space-x-2">
                <select
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.name}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                {onCreateCustomer && (
                  <button
                    type="button"
                    onClick={() => setShowNewCustomer(true)}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    New
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-900">Create New Customer</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleCreateCustomer}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create & Select
              </button>
              <button
                type="button"
                onClick={() => setShowNewCustomer(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tour
          </label>
          <select
            value={formData.tourName}
            onChange={(e) => setFormData(prev => ({ ...prev, tourName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Tour</option>
            {tours.map(tour => (
              <option key={tour.id} value={tour.name}>
                {tour.name} - ${tour.price}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Booking Date
          </label>
          <input
            type="date"
            value={formData.bookingDate}
            onChange={(e) => setFormData(prev => ({ ...prev, bookingDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tour Date
          </label>
          <input
            type="date"
            value={formData.tourDate}
            onChange={(e) => setFormData(prev => ({ ...prev, tourDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Guests
          </label>
          <input
            type="number"
            value={formData.guests}
            onChange={(e) => setFormData(prev => ({ ...prev, guests: parseInt(e.target.value) || 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Participants
          </label>
          <input
            type="number"
            value={formData.participants}
            onChange={(e) => setFormData(prev => ({ ...prev, participants: parseInt(e.target.value) || 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Amount
          </label>
          <input
            type="number"
            value={formData.totalAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Booking['status'] }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Payment Method</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="online">Online</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Status
          </label>
          <select
            value={formData.paymentStatus}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value as Booking['paymentStatus'] }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {mode === 'create' ? 'Create Booking' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
