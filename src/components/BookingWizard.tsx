import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import type { Booking, Customer, Tour, Vehicle, User } from '../types';
import { useFeatureFlag } from '../config/features';
import { computePrice } from '../lib/pricingEngine';
import type { PricingConfig } from '../types/pricing';
import { useCurrency } from '../context/CurrencyContext';
import { checkDepartureAvailability } from '../lib/resourceAvailability';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

interface BookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Omit<Booking, 'id'>) => void;
  customers: Customer[];
  tours: Tour[];
  vehicles: Vehicle[];
  guides: User[];
  onCreateCustomer?: (customer: Omit<Customer, 'id'>) => Promise<Customer>;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

const steps: WizardStep[] = [
  { id: 'tour-date', title: 'Tour & Date', description: 'Select tour and departure time' },
  { id: 'pax', title: 'Passengers', description: 'Number of guests and participants' },
  { id: 'addons', title: 'Add-ons', description: 'Select tour-eligible add-ons' },
  { id: 'pickup', title: 'Pickup Details', description: 'Pickup location and special requests' },
  { id: 'resources', title: 'Assign Resources', description: 'Assign vehicle and guide' },
  { id: 'payment', title: 'Payment & Confirmation', description: 'Review and confirm booking' },
];

export const BookingWizard = ({ 
  isOpen, 
  onClose, 
  onSave, 
  customers, 
  tours, 
  vehicles, 
  guides,
  onCreateCustomer 
}: BookingWizardProps) => {
  const pricingEnabled = useFeatureFlag('FEATURE_PRICING_SEASONS');
  const addonsEnabled = useFeatureFlag('FEATURE_ADDONS');
  const { formatAmount } = useCurrency();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    customerName: '',
    tourName: '',
    tourDate: '',
    departureTime: '',
    guests: 1,
    participants: 1,
    addons: [] as string[],
    pickupLocation: '',
    specialRequests: '',
    assignedVehicle: '',
    assignedGuide: '',
    paymentMethod: '',
    paymentStatus: 'pending' as Booking['paymentStatus'],
    notes: '',
  });

  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [pricePreview, setPricePreview] = useState<{
    subtotal: number;
    modifiersApplied: Array<{ label: string; amount: number }>;
    taxes: number;
    total: number;
    currency: string;
  } | null>(null);
  const [resourceConflicts, setResourceConflicts] = useState<string[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [availableGuides, setAvailableGuides] = useState<User[]>([]);

  // Calculate price preview when tour, date, and pax change
  useEffect(() => {
    if (formData.tourName && formData.tourDate && formData.guests) {
      const selectedTour = tours.find(t => t.name === formData.tourName);
      if (selectedTour && pricingEnabled) {
        const pricingConfig: PricingConfig = {
          baseCurrency: 'USD',
          seasons: [
            {
              id: 'default',
              name: 'Standard',
              startDate: '2024-01-01',
              endDate: '2024-12-31',
              paxTierPrices: [
                { category: 'adult', unitPrice: selectedTour.price },
                { category: 'child', unitPrice: selectedTour.price * 0.7 },
              ],
              taxesPercent: 10,
            },
          ],
        };

        const price = computePrice(pricingConfig, {
          tourDateISO: `${formData.tourDate}T${formData.departureTime || '10:00:00'}Z`,
          pax: { adult: formData.guests, child: 0 },
        });

        setPricePreview(price);
      }
    }
  }, [formData.tourName, formData.tourDate, formData.guests, formData.participants, formData.departureTime, pricingEnabled, tours]);

  // Check resource availability when vehicle/guide assignment changes
  useEffect(() => {
    if (formData.assignedVehicle && formData.assignedGuide && formData.tourDate) {
      const selectedVehicle = vehicles.find(v => v.id === formData.assignedVehicle);
      const selectedGuide = guides.find(g => g.id === formData.assignedGuide);
      
      if (selectedVehicle && selectedGuide) {
        const availability = checkDepartureAvailability({
          date: formData.tourDate,
          capacity: { maxCapacity: selectedVehicle.capacity, bookedCount: 0 },
          vehicleAssignments: [
            {
              id: 'temp',
              resourceId: selectedVehicle.id,
              date: formData.tourDate,
              start: `${formData.tourDate}T${formData.departureTime || '10:00:00'}Z`,
              end: `${formData.tourDate}T${formData.departureTime || '10:00:00'}Z`,
            },
          ],
          guideAssignments: [
            {
              id: 'temp',
              resourceId: selectedGuide.id,
              date: formData.tourDate,
              start: `${formData.tourDate}T${formData.departureTime || '10:00:00'}Z`,
              end: `${formData.tourDate}T${formData.departureTime || '10:00:00'}Z`,
            },
          ],
        });

        setResourceConflicts(availability.conflicts);
      }
    }
  }, [formData.assignedVehicle, formData.assignedGuide, formData.tourDate, formData.departureTime, vehicles, guides]);

  // Filter available vehicles and guides
  useEffect(() => {
    const available = vehicles.filter(v => v.status === 'available');
    setAvailableVehicles(available);
    
    const availableGuides = guides.filter(g => g.status === 'active');
    setAvailableGuides(availableGuides);
  }, [vehicles, guides]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

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
    
    const bookingData = {
      ...formData,
      customerName: formData.customerName,
      tourName: formData.tourName,
      bookingDate: new Date().toISOString().split('T')[0],
      tourDate: formData.tourDate,
      totalAmount: pricePreview?.total || 0,
      status: 'pending' as Booking['status'],
      guests: formData.guests,
      participants: formData.participants,
      notes: formData.notes,
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentStatus,
    };
    
    onSave(bookingData);
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

  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Tour & Date
        return !!(formData.tourName && formData.tourDate && formData.departureTime);
      case 1: // Pax
        return !!(formData.guests && formData.participants);
      case 2: // Add-ons
        return true; // Optional step
      case 3: // Pickup
        return !!(formData.pickupLocation);
      case 4: // Resources
        return !!(formData.assignedVehicle && formData.assignedGuide && resourceConflicts.length === 0);
      case 5: // Payment
        return !!(formData.paymentMethod);
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Tour & Date
        return (
          <div className="space-y-4">
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

            {showNewCustomer && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-900">Create New Customer</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    {tour.name} - {formatAmount(tour.price)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Departure Time
                </label>
                <input
                  type="time"
                  value={formData.departureTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, departureTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {pricingEnabled && pricePreview && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-800">Price Preview</span>
                  <span className="font-semibold text-blue-900">{formatAmount(pricePreview.total)}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 1: // Pax
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>
        );

      case 2: // Add-ons
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select any add-ons for this tour. Add-ons are filtered based on tour eligibility.
            </p>
            {addonsEnabled ? (
              <div className="space-y-2">
                {/* This would be populated with actual add-ons from the system */}
                <div className="text-sm text-gray-500">Add-ons functionality will be integrated here</div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Add-ons are not available in this environment</div>
            )}
          </div>
        );

      case 3: // Pickup Details
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Location
              </label>
              <input
                type="text"
                value={formData.pickupLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, pickupLocation: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter pickup address or location"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Any special requests or notes for this booking"
              />
            </div>
          </div>
        );

      case 4: // Assign Resources
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Vehicle
                </label>
                <select
                  value={formData.assignedVehicle}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedVehicle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Vehicle</option>
                  {availableVehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.capacity} seats) - {vehicle.status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Guide
                </label>
                <select
                  value={formData.assignedGuide}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedGuide: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Guide</option>
                  {availableGuides.map(guide => (
                    <option key={guide.id} value={guide.id}>
                      {guide.name} - {guide.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {resourceConflicts.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Resource Conflicts Detected</h4>
                    <ul className="mt-1 text-sm text-red-700">
                      {resourceConflicts.map((conflict, index) => (
                        <li key={index}>• {conflict}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Reassign Resources
                    </button>
                  </div>
                </div>
              </div>
            )}

            {formData.assignedVehicle && formData.assignedGuide && resourceConflicts.length === 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-sm text-green-800">Resources assigned successfully with no conflicts</span>
                </div>
              </div>
            )}
          </div>
        );

      case 5: // Payment & Confirmation
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-900 mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{formData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tour:</span>
                  <span>{formData.tourName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{formData.tourDate} at {formData.departureTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span>{formData.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span>Participants:</span>
                  <span>{formData.participants}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pickup:</span>
                  <span>{formData.pickupLocation}</span>
                </div>
                {pricePreview && (
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total:</span>
                    <span>{formatAmount(pricePreview.total)}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Additional notes for this booking"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Booking"
      size="lg"
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                index <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {index < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
              </div>
              <div className="ml-2 hidden sm:block">
                <div className={`text-sm font-medium ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isStepValid(currentStep)}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Confirm Booking
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};


