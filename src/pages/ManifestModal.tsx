import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ClipboardList, BarChart3, Truck, CheckCircle, MapPin, FileText } from 'lucide-react';
import type { TourManifest, DailyOperations, VehiclePreparation, CustomerCheckIn, TourDeparture, DailyReport } from '../types/manifests';

interface ManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  item?: TourManifest | DailyOperations | VehiclePreparation | CustomerCheckIn | TourDeparture | DailyReport;
  mode: 'create' | 'edit';
  type: 'manifest' | 'operations' | 'preparation' | 'checkin' | 'departure' | 'report';
}

export const ManifestModal: React.FC<ManifestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
  mode,
  type
}) => {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData(item);
    } else {
      // Initialize with default values based on type
      if (type === 'manifest') {
        setFormData({
          tourId: '',
          tourName: '',
          tourDate: '',
          departureTime: '',
          returnTime: '',
          status: 'draft',
          guideId: '',
          guideName: '',
          vehicleId: '',
          vehicleName: '',
          driverId: '',
          driverName: '',
          passengers: [],
          totalPassengers: 0,
          maxCapacity: 0,
          specialInstructions: '',
          weatherConditions: '',
          equipment: [],
          checklist: [],
          notes: ''
        });
      } else if (type === 'operations') {
        setFormData({
          date: '',
          status: 'planning',
          tours: [],
          totalTours: 0,
          completedTours: 0,
          totalPassengers: 0,
          checkedInPassengers: 0,
          weather: {
            condition: 'sunny',
            temperature: 20,
            windSpeed: 10,
            visibility: 10,
            notes: ''
          },
          incidents: [],
          notes: ''
        });
      } else if (type === 'preparation') {
        setFormData({
          vehicleId: '',
          vehicleName: '',
          preparationDate: '',
          tourDate: '',
          status: 'scheduled',
          checklist: [],
          fuelLevel: 100,
          mileage: 0,
          exteriorCondition: 'excellent',
          interiorCondition: 'excellent',
          safetyEquipment: [],
          maintenanceRequired: false,
          maintenanceNotes: ''
        });
      } else if (type === 'checkin') {
        setFormData({
          manifestId: '',
          tourId: '',
          customerId: '',
          customerName: '',
          checkInTime: new Date().toISOString(),
          checkInMethod: 'manual',
          seatAssignment: '',
          specialRequests: '',
          emergencyContactVerified: false,
          waiverSigned: false,
          photoTaken: false,
          notes: ''
        });
      } else if (type === 'departure') {
        setFormData({
          manifestId: '',
          tourId: '',
          scheduledDeparture: '',
          actualDeparture: '',
          status: 'scheduled',
          delayReason: '',
          delayMinutes: 0,
          passengersOnBoard: 0,
          passengersExpected: 0,
          lastMinuteChanges: [],
          weatherAtDeparture: {
            condition: 'sunny',
            temperature: 20,
            windSpeed: 10
          },
          departureNotes: ''
        });
      } else if (type === 'report') {
        setFormData({
          date: '',
          reportType: 'end_of_day',
          summary: '',
          highlights: [],
          issues: [],
          recommendations: [],
          weatherSummary: '',
          passengerFeedback: [],
          guideFeedback: [],
          equipmentIssues: [],
          safetyIncidents: [],
          financialSummary: {
            totalRevenue: 0,
            totalCosts: 0,
            netProfit: 0,
            currency: 'EUR'
          }
        });
      }
    }
    setErrors({});
  }, [item, mode, type, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (type === 'manifest') {
      if (!formData.tourName?.trim()) {
        newErrors.tourName = 'Tour name is required';
      }
      if (!formData.tourDate) {
        newErrors.tourDate = 'Tour date is required';
      }
      if (!formData.departureTime) {
        newErrors.departureTime = 'Departure time is required';
      }
      if (!formData.guideName?.trim()) {
        newErrors.guideName = 'Guide name is required';
      }
      if (!formData.vehicleName?.trim()) {
        newErrors.vehicleName = 'Vehicle name is required';
      }
    } else if (type === 'operations') {
      if (!formData.date) {
        newErrors.date = 'Date is required';
      }
    } else if (type === 'preparation') {
      if (!formData.vehicleName?.trim()) {
        newErrors.vehicleName = 'Vehicle name is required';
      }
      if (!formData.tourDate) {
        newErrors.tourDate = 'Tour date is required';
      }
    } else if (type === 'checkin') {
      if (!formData.customerName?.trim()) {
        newErrors.customerName = 'Customer name is required';
      }
      if (!formData.checkInTime) {
        newErrors.checkInTime = 'Check-in time is required';
      }
    } else if (type === 'departure') {
      if (!formData.scheduledDeparture) {
        newErrors.scheduledDeparture = 'Scheduled departure time is required';
      }
    } else if (type === 'report') {
      if (!formData.date) {
        newErrors.date = 'Date is required';
      }
      if (!formData.summary?.trim()) {
        newErrors.summary = 'Summary is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'manifest': return <ClipboardList className="w-5 h-5 text-blue-600" />;
      case 'operations': return <BarChart3 className="w-5 h-5 text-green-600" />;
      case 'preparation': return <Truck className="w-5 h-5 text-orange-600" />;
      case 'checkin': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'departure': return <MapPin className="w-5 h-5 text-purple-600" />;
      case 'report': return <FileText className="w-5 h-5 text-indigo-600" />;
      default: return <ClipboardList className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'manifest': return 'Tour Manifest';
      case 'operations': return 'Daily Operations';
      case 'preparation': return 'Vehicle Preparation';
      case 'checkin': return 'Customer Check-in';
      case 'departure': return 'Tour Departure';
      case 'report': return 'Daily Report';
      default: return 'Manifest';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              {getTypeIcon()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? `Add New ${getTypeTitle()}` : `Edit ${getTypeTitle()}`}
              </h2>
              <p className="text-sm text-gray-600">
                {mode === 'create' ? `Create a new ${type.replace('_', ' ')}` : `Update ${type.replace('_', ' ')} details`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {type === 'manifest' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tour Name *
                  </label>
                  <input
                    type="text"
                    value={formData.tourName || ''}
                    onChange={(e) => handleInputChange('tourName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.tourName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., City Walking Tour"
                  />
                  {errors.tourName && (
                    <p className="mt-1 text-sm text-red-600">{errors.tourName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tour Date *
                  </label>
                  <input
                    type="date"
                    value={formData.tourDate || ''}
                    onChange={(e) => handleInputChange('tourDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.tourDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.tourDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.tourDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Time *
                  </label>
                  <input
                    type="time"
                    value={formData.departureTime || ''}
                    onChange={(e) => handleInputChange('departureTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.departureTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.departureTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.departureTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guide Name *
                  </label>
                  <input
                    type="text"
                    value={formData.guideName || ''}
                    onChange={(e) => handleInputChange('guideName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.guideName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., John Smith"
                  />
                  {errors.guideName && (
                    <p className="mt-1 text-sm text-red-600">{errors.guideName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Name *
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleName || ''}
                    onChange={(e) => handleInputChange('vehicleName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.vehicleName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Bus #1"
                  />
                  {errors.vehicleName && (
                    <p className="mt-1 text-sm text-red-600">{errors.vehicleName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxCapacity || 0}
                    onChange={(e) => handleInputChange('maxCapacity', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || 'draft'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    value={formData.specialInstructions || ''}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special instructions for this tour..."
                  />
                </div>
              </>
            )}

            {type === 'operations' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.date ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || 'planning'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Tours
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalTours || 0}
                    onChange={(e) => handleInputChange('totalTours', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Passengers
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalPassengers || 0}
                    onChange={(e) => handleInputChange('totalPassengers', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weather Condition
                  </label>
                  <select
                    value={formData.weather?.condition || 'sunny'}
                    onChange={(e) => handleNestedInputChange('weather', 'condition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sunny">Sunny</option>
                    <option value="cloudy">Cloudy</option>
                    <option value="rainy">Rainy</option>
                    <option value="stormy">Stormy</option>
                    <option value="snowy">Snowy</option>
                    <option value="foggy">Foggy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    value={formData.weather?.temperature || 20}
                    onChange={(e) => handleNestedInputChange('weather', 'temperature', parseInt(e.target.value) || 20)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {type === 'preparation' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Name *
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleName || ''}
                    onChange={(e) => handleInputChange('vehicleName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.vehicleName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Bus #1"
                  />
                  {errors.vehicleName && (
                    <p className="mt-1 text-sm text-red-600">{errors.vehicleName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tour Date *
                  </label>
                  <input
                    type="date"
                    value={formData.tourDate || ''}
                    onChange={(e) => handleInputChange('tourDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.tourDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.tourDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.tourDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Level (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.fuelLevel || 100}
                    onChange={(e) => handleInputChange('fuelLevel', parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mileage
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.mileage || 0}
                    onChange={(e) => handleInputChange('mileage', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exterior Condition
                  </label>
                  <select
                    value={formData.exteriorCondition || 'excellent'}
                    onChange={(e) => handleInputChange('exteriorCondition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interior Condition
                  </label>
                  <select
                    value={formData.interiorCondition || 'excellent'}
                    onChange={(e) => handleInputChange('interiorCondition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </>
            )}

            {type === 'checkin' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName || ''}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customerName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., John Smith"
                  />
                  {errors.customerName && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.checkInTime || ''}
                    onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.checkInTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.checkInTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.checkInTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Method
                  </label>
                  <select
                    value={formData.checkInMethod || 'manual'}
                    onChange={(e) => handleInputChange('checkInMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="manual">Manual</option>
                    <option value="qr_code">QR Code</option>
                    <option value="mobile_app">Mobile App</option>
                    <option value="kiosk">Kiosk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seat Assignment
                  </label>
                  <input
                    type="text"
                    value={formData.seatAssignment || ''}
                    onChange={(e) => handleInputChange('seatAssignment', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., A1, B2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    value={formData.specialRequests || ''}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special requests or requirements..."
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="emergencyContactVerified"
                      checked={formData.emergencyContactVerified || false}
                      onChange={(e) => handleInputChange('emergencyContactVerified', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="emergencyContactVerified" className="text-sm font-medium text-gray-700">
                      Emergency Contact Verified
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="waiverSigned"
                      checked={formData.waiverSigned || false}
                      onChange={(e) => handleInputChange('waiverSigned', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="waiverSigned" className="text-sm font-medium text-gray-700">
                      Waiver Signed
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="photoTaken"
                      checked={formData.photoTaken || false}
                      onChange={(e) => handleInputChange('photoTaken', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="photoTaken" className="text-sm font-medium text-gray-700">
                      Photo Taken
                    </label>
                  </div>
                </div>
              </>
            )}

            {type === 'departure' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Departure *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledDeparture || ''}
                    onChange={(e) => handleInputChange('scheduledDeparture', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.scheduledDeparture ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.scheduledDeparture && (
                    <p className="mt-1 text-sm text-red-600">{errors.scheduledDeparture}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || 'scheduled'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="boarding">Boarding</option>
                    <option value="departed">Departed</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passengers On Board
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.passengersOnBoard || 0}
                    onChange={(e) => handleInputChange('passengersOnBoard', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passengers Expected
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.passengersExpected || 0}
                    onChange={(e) => handleInputChange('passengersExpected', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delay Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.delayMinutes || 0}
                    onChange={(e) => handleInputChange('delayMinutes', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delay Reason
                  </label>
                  <input
                    type="text"
                    value={formData.delayReason || ''}
                    onChange={(e) => handleInputChange('delayReason', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Weather, Traffic, Late passengers"
                  />
                </div>
              </>
            )}

            {type === 'report' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.date ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type
                  </label>
                  <select
                    value={formData.reportType || 'end_of_day'}
                    onChange={(e) => handleInputChange('reportType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="end_of_day">End of Day</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary *
                  </label>
                  <textarea
                    value={formData.summary || ''}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.summary ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Provide a summary of the day's operations..."
                  />
                  {errors.summary && (
                    <p className="mt-1 text-sm text-red-600">{errors.summary}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Revenue (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.financialSummary?.totalRevenue || 0}
                    onChange={(e) => handleNestedInputChange('financialSummary', 'totalRevenue', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Costs (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.financialSummary?.totalCosts || 0}
                    onChange={(e) => handleNestedInputChange('financialSummary', 'totalCosts', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Notes for applicable types */}
          {(type === 'manifest' || type === 'operations' || type === 'preparation' || type === 'departure' || type === 'report') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {mode === 'create' ? `Create ${getTypeTitle()}` : `Update ${getTypeTitle()}`}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};


