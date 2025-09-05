import { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import type { Booking, Customer, Tour, Vehicle, User } from '../types';
import { useFeatureFlag } from '../config/features';
import { computePrice } from '../lib/pricingEngine';
import type { PricingConfig } from '../types/pricing';
import { useCurrency } from '../context/CurrencyContext';
import { Plus, Minus, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from './Toast';

interface SimpleBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Omit<Booking, 'id'>) => void;
  customers: Customer[];
  tours: Tour[];
  vehicles: Vehicle[];
  guides: User[];
  onCreateCustomer?: (customer: Omit<Customer, 'id'>) => Promise<Customer>;
}

interface Addon {
  id: string;
  name: string;
  price: number;
  type: 'per_booking' | 'per_pax';
  selected: boolean;
}

export const SimpleBookingModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  customers: _customers, 
  tours, 
  vehicles, 
  guides,
  onCreateCustomer 
}: SimpleBookingModalProps) => {
  const pricingEnabled = useFeatureFlag('FEATURE_PRICING_SEASONS');
  const addonsEnabled = useFeatureFlag('FEATURE_ADDONS');
  const { formatAmount } = useCurrency();
  const { showSuccess, showError, showLoading } = useToast();
  
  const firstInputRef = useRef<HTMLSelectElement>(null);
  const lastInputRef = useRef<HTMLButtonElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    tourId: '',
    tourDate: '',
    departureTime: '',
    adults: 2,
    children: 0,
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    pickupLocation: '',
    specialRequests: '',
    assignedVehicle: '',
    assignedGuide: '',
  });

  const [addons, setAddons] = useState<Addon[]>([
    { id: 'hotel_pickup', name: 'Hotel Pickup', price: 20, type: 'per_booking', selected: false },
    { id: 'lunch', name: 'Lunch', price: 12, type: 'per_pax', selected: false },
    { id: 'insurance', name: 'Travel Insurance', price: 25, type: 'per_pax', selected: false },
    { id: 'guide_tip', name: 'Guide Tip', price: 15, type: 'per_pax', selected: false },
  ]);

  const [priceBreakdown, setPriceBreakdown] = useState<{
    subtotal: number;
    addons: number;
    taxes: number;
    total: number;
  } | null>(null);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  // Focus management
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Focus trap
  const handleTabKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstInputRef.current) {
          e.preventDefault();
          lastInputRef.current?.focus();
        }
      } else {
        if (document.activeElement === lastInputRef.current) {
          e.preventDefault();
          firstInputRef.current?.focus();
        }
      }
    }
  };

  // Calculate pricing when form data changes
  useEffect(() => {
    if (formData.tourId && formData.tourDate && formData.adults > 0) {
      const tour = tours.find(t => t.id === formData.tourId);
      if (tour) {
        const pricingConfig: PricingConfig = {
          baseCurrency: 'EUR',
          seasons: [{
            id: 'default',
            name: 'Standard',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            paxTierPrices: [
              { category: 'adult', unitPrice: tour.price },
              { category: 'child', unitPrice: tour.price * 0.7 },
            ],
            taxesPercent: 10,
          }],
        };

        const price = computePrice(pricingConfig, {
          tourDateISO: `${formData.tourDate}T${formData.departureTime}:00Z`,
          pax: { adult: formData.adults, child: formData.children },
        });

        // Add addon costs
        let addonTotal = 0;
        addons.forEach(addon => {
          if (addon.selected) {
            if (addon.type === 'per_booking') {
              addonTotal += addon.price;
            } else {
              addonTotal += addon.price * (formData.adults + formData.children);
            }
          }
        });

        setPriceBreakdown({
          ...price,
          addons: addonTotal,
          total: price.total + addonTotal,
        });
      }
    }
  }, [formData, addons, tours, pricingEnabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const tour = tours.find(t => t.id === formData.tourId);
    if (!tour) {
      showError('Invalid Tour', 'Please select a valid tour');
      return;
    }

    setIsSubmitting(true);
    showLoading('Creating Booking', 'Please wait while we process your booking...');

    try {
      // Create customer if needed
      let customerId = formData.customerId;
      if (!customerId && formData.customerName && onCreateCustomer) {
        setIsCreatingCustomer(true);
        try {
          const newCustomer = await onCreateCustomer({
            name: formData.customerName,
            email: formData.customerEmail,
            phone: formData.customerPhone,
            totalBookings: 0,
            totalSpent: 0,
          });
          customerId = newCustomer.id;
        } catch (error) {
          console.error('Failed to create customer:', error);
          showError('Customer Creation Failed', 'Failed to create customer. Please try again.');
          return;
        } finally {
          setIsCreatingCustomer(false);
        }
      }

      // Get selected add-ons
      const selectedAddons = addons.filter(addon => addon.selected).map(addon => ({
        name: addon.name,
        price: addon.type === 'per_booking' ? addon.price : addon.price * (formData.adults + formData.children)
      }));

      const booking: Omit<Booking, 'id'> = {
        tourName: tour.name,
        tourDate: formData.tourDate,
        departureTime: formData.departureTime,
        customerId: customerId || '',
        customerName: formData.customerName,
        totalAmount: priceBreakdown?.total || 0,
        status: 'confirmed',
        guests: formData.adults + formData.children,
        participants: formData.adults,
        notes: formData.specialRequests,
        vehicleId: formData.assignedVehicle,
        guideId: formData.assignedGuide,
        addOns: selectedAddons,
        bookingDate: new Date().toISOString(),
        tourId: formData.tourId,
        paymentStatus: 'pending',
      };

      onSave(booking);
      showSuccess('Booking Created', `Successfully created booking for ${formData.customerName}`);
      onClose();
    } catch (error) {
      console.error('Failed to create booking:', error);
      showError('Booking Failed', 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAddon = (addonId: string) => {
    setAddons(prev => prev.map(addon => 
      addon.id === addonId ? { ...addon, selected: !addon.selected } : addon
    ));
  };

  const updateFormData = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.tourId && formData.tourDate && formData.departureTime && formData.customerName;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Booking"
      size="lg"
    >
      <form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        onKeyDown={handleKeyDown}
        onKeyUp={handleTabKey}
        aria-label="Create new booking"
      >
        {/* Tour and Departure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tour
            </label>
            <select
              ref={firstInputRef}
              value={formData.tourId}
              onChange={(e) => updateFormData('tourId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              aria-describedby="tour-error"
              data-testid="tour-select"
            >
              <option value="">Select Tour</option>
              {tours.map(tour => (
                <option key={tour.id} value={tour.id}>{tour.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departure
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={formData.tourDate}
                onChange={(e) => updateFormData('tourDate', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="time"
                value={formData.departureTime}
                onChange={(e) => updateFormData('departureTime', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Adults and Children */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adults
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => updateFormData('adults', Math.max(1, formData.adults - 1))}
                className="p-1 border border-gray-300 rounded hover:bg-gray-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={formData.adults}
                onChange={(e) => updateFormData('adults', parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              <button
                type="button"
                onClick={() => updateFormData('adults', formData.adults + 1)}
                className="p-1 border border-gray-300 rounded hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Children
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => updateFormData('children', Math.max(0, formData.children - 1))}
                className="p-1 border border-gray-300 rounded hover:bg-gray-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={formData.children}
                onChange={(e) => updateFormData('children', parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <button
                type="button"
                onClick={() => updateFormData('children', formData.children + 1)}
                className="p-1 border border-gray-300 rounded hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Add-ons */}
        {addonsEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add-ons
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {addons.map(addon => (
                <button
                  key={addon.id}
                  type="button"
                  onClick={() => toggleAddon(addon.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    addon.selected
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium">{addon.name}</div>
                    <div className="text-sm text-gray-600">
                      {addon.type === 'per_booking' ? 'per booking' : 'per pax'} • {formatAmount(addon.price)}
                    </div>
                  </div>
                  {addon.selected && <Check className="w-5 h-5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Customer Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer name
          </label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => updateFormData('customerName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter customer name"
            required
          />
        </div>

        {/* Additional Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => updateFormData('customerEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="customer@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => updateFormData('customerPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>

        {/* Pickup Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Location
          </label>
          <input
            type="text"
            value={formData.pickupLocation}
            onChange={(e) => updateFormData('pickupLocation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Hotel name or address"
          />
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Requests
          </label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => updateFormData('specialRequests', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Any special requirements or notes..."
          />
        </div>

        {/* Resource Assignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Vehicle
            </label>
            <select
              value={formData.assignedVehicle}
              onChange={(e) => updateFormData('assignedVehicle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Auto-assign</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Guide
            </label>
            <select
              value={formData.assignedGuide}
              onChange={(e) => updateFormData('assignedGuide', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Auto-assign</option>
              {guides.map(guide => (
                <option key={guide.id} value={guide.id}>{guide.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Deposit Policy */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Check className="w-4 h-4 text-green-600" />
          <span>Deposit policy (demo): 30% now, balance 72h before tour</span>
        </div>

        {/* Price Summary */}
        {priceBreakdown && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Price Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Base Price ({formData.adults} adults × {formatAmount(priceBreakdown.subtotal / (formData.adults + formData.children))}):</span>
                <span>{formatAmount(priceBreakdown.subtotal)}</span>
              </div>
              {formData.children > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Children ({formData.children} × {formatAmount((priceBreakdown.subtotal / (formData.adults + formData.children)) * 0.7)}):</span>
                  <span>{formatAmount((priceBreakdown.subtotal / (formData.adults + formData.children)) * 0.7 * formData.children)}</span>
                </div>
              )}
              {priceBreakdown.addons > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Add-ons:</span>
                  <span>{formatAmount(priceBreakdown.addons)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax ({priceBreakdown.taxes / priceBreakdown.subtotal * 100}%):</span>
                <span>{formatAmount(priceBreakdown.taxes)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatAmount(priceBreakdown.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 -mx-6 -mb-6 mt-6">
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Cancel booking creation"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                ref={lastInputRef}
                type="submit"
                disabled={!isFormValid || isSubmitting || isCreatingCustomer}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-describedby={!isFormValid ? "form-validation" : undefined}
                data-testid="create-booking-button"
              >
                {isSubmitting || isCreatingCustomer ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Create & Send Confirmation
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
          {!isFormValid && (
            <div id="form-validation" className="mt-2 text-sm text-red-600" role="alert">
              Please fill in all required fields (Tour, Date, Time, Customer Name)
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
