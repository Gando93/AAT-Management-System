import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, QrCode, Users, Settings, FileText } from 'lucide-react';
import type { QRTicket, CheckInSession, QRCodeConfig, QRCodeTemplate } from '../types/qrTickets';

interface QRTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  item?: QRTicket | CheckInSession | QRCodeConfig | QRCodeTemplate;
  mode: 'create' | 'edit';
  type: 'ticket' | 'session' | 'config' | 'template';
}

export const QRTicketModal: React.FC<QRTicketModalProps> = ({
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
      if (type === 'ticket') {
        setFormData({
          bookingId: '',
          customerId: '',
          customerName: '',
          customerEmail: '',
          tourId: '',
          tourName: '',
          tourDate: '',
          departureTime: '',
          qrCode: '',
          qrCodeUrl: '',
          ticketNumber: '',
          status: 'active',
          seatNumber: '',
          specialInstructions: '',
          generatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          checkInLocation: '',
          checkInMethod: 'qr_scan',
          validationAttempts: 0
        });
      } else if (type === 'session') {
        setFormData({
          sessionName: '',
          tourId: '',
          tourName: '',
          tourDate: '',
          startTime: '',
          endTime: '',
          status: 'scheduled',
          checkInLocation: '',
          staffMembers: [],
          totalTickets: 0,
          checkedInTickets: 0,
          noShowTickets: 0,
          cancelledTickets: 0,
          averageCheckInTime: 0,
          notes: ''
        });
      } else if (type === 'config') {
        setFormData({
          name: '',
          size: 200,
          errorCorrectionLevel: 'M',
          margin: 4,
          foregroundColor: '#000000',
          backgroundColor: '#FFFFFF',
          logoUrl: '',
          logoSize: 50,
          includeBookingDetails: true,
          includeCustomerInfo: true,
          includeTourInfo: true,
          customText: '',
          isActive: true
        });
      } else if (type === 'template') {
        setFormData({
          name: '',
          description: '',
          templateType: 'standard',
          design: {
            layout: 'vertical',
            qrCodePosition: 'center',
            includeLogo: true,
            includeBorder: true,
            includeWatermark: false,
            colorScheme: 'blue',
            fontFamily: 'Arial',
            fontSize: 12
          },
          content: {
            title: 'Tour Ticket',
            subtitle: '',
            tourName: true,
            tourDate: true,
            tourTime: true,
            customerName: true,
            seatNumber: true,
            ticketNumber: true,
            qrCode: true,
            specialInstructions: true,
            termsAndConditions: true
          },
          isActive: true,
          isDefault: false
        });
      }
    }
    setErrors({});
  }, [item, mode, type, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (type === 'ticket') {
      if (!formData.customerName?.trim()) {
        newErrors.customerName = 'Customer name is required';
      }
      if (!formData.customerEmail?.trim()) {
        newErrors.customerEmail = 'Customer email is required';
      }
      if (!formData.tourName?.trim()) {
        newErrors.tourName = 'Tour name is required';
      }
      if (!formData.tourDate) {
        newErrors.tourDate = 'Tour date is required';
      }
      if (!formData.departureTime) {
        newErrors.departureTime = 'Departure time is required';
      }
    } else if (type === 'session') {
      if (!formData.sessionName?.trim()) {
        newErrors.sessionName = 'Session name is required';
      }
      if (!formData.tourName?.trim()) {
        newErrors.tourName = 'Tour name is required';
      }
      if (!formData.tourDate) {
        newErrors.tourDate = 'Tour date is required';
      }
      if (!formData.startTime) {
        newErrors.startTime = 'Start time is required';
      }
      if (!formData.endTime) {
        newErrors.endTime = 'End time is required';
      }
    } else if (type === 'config') {
      if (!formData.name?.trim()) {
        newErrors.name = 'Configuration name is required';
      }
      if (formData.size < 100 || formData.size > 1000) {
        newErrors.size = 'Size must be between 100 and 1000 pixels';
      }
    } else if (type === 'template') {
      if (!formData.name?.trim()) {
        newErrors.name = 'Template name is required';
      }
      if (!formData.description?.trim()) {
        newErrors.description = 'Description is required';
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
      case 'ticket': return <QrCode className="w-5 h-5 text-blue-600" />;
      case 'session': return <Users className="w-5 h-5 text-green-600" />;
      case 'config': return <Settings className="w-5 h-5 text-orange-600" />;
      case 'template': return <FileText className="w-5 h-5 text-purple-600" />;
      default: return <QrCode className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'ticket': return 'QR Ticket';
      case 'session': return 'Check-in Session';
      case 'config': return 'QR Configuration';
      case 'template': return 'QR Template';
      default: return 'QR Item';
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
            {type === 'ticket' && (
              <>
                <div className="md:col-span-2">
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
                    Customer Email *
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail || ''}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customerEmail ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., john@example.com"
                  />
                  {errors.customerEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ticket Number
                  </label>
                  <input
                    type="text"
                    value={formData.ticketNumber || ''}
                    onChange={(e) => handleInputChange('ticketNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., TK-001234"
                  />
                </div>

                <div>
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
                    Seat Number
                  </label>
                  <input
                    type="text"
                    value={formData.seatNumber || ''}
                    onChange={(e) => handleInputChange('seatNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., A1, B2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="used">Used</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
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
                    placeholder="Any special instructions for this ticket..."
                  />
                </div>
              </>
            )}

            {type === 'session' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Name *
                  </label>
                  <input
                    type="text"
                    value={formData.sessionName || ''}
                    onChange={(e) => handleInputChange('sessionName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.sessionName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Morning Check-in Session"
                  />
                  {errors.sessionName && (
                    <p className="mt-1 text-sm text-red-600">{errors.sessionName}</p>
                  )}
                </div>

                <div>
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
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime || ''}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.startTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime || ''}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.endTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.endTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Location
                  </label>
                  <input
                    type="text"
                    value={formData.checkInLocation || ''}
                    onChange={(e) => handleInputChange('checkInLocation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Main Entrance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Tickets
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalTickets || 0}
                    onChange={(e) => handleInputChange('totalTickets', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </>
            )}

            {type === 'config' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Configuration Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Standard QR Code"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size (pixels) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="1000"
                    value={formData.size || 200}
                    onChange={(e) => handleInputChange('size', parseInt(e.target.value) || 200)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.size ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.size && (
                    <p className="mt-1 text-sm text-red-600">{errors.size}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Error Correction Level
                  </label>
                  <select
                    value={formData.errorCorrectionLevel || 'M'}
                    onChange={(e) => handleInputChange('errorCorrectionLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">L (Low)</option>
                    <option value="M">M (Medium)</option>
                    <option value="Q">Q (Quartile)</option>
                    <option value="H">H (High)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Margin
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={formData.margin || 4}
                    onChange={(e) => handleInputChange('margin', parseInt(e.target.value) || 4)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foreground Color
                  </label>
                  <input
                    type="color"
                    value={formData.foregroundColor || '#000000'}
                    onChange={(e) => handleInputChange('foregroundColor', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={formData.backgroundColor || '#FFFFFF'}
                    onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl || ''}
                    onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="includeBookingDetails"
                      checked={formData.includeBookingDetails || false}
                      onChange={(e) => handleInputChange('includeBookingDetails', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="includeBookingDetails" className="text-sm font-medium text-gray-700">
                      Include Booking Details
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="includeCustomerInfo"
                      checked={formData.includeCustomerInfo || false}
                      onChange={(e) => handleInputChange('includeCustomerInfo', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="includeCustomerInfo" className="text-sm font-medium text-gray-700">
                      Include Customer Info
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="includeTourInfo"
                      checked={formData.includeTourInfo || false}
                      onChange={(e) => handleInputChange('includeTourInfo', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="includeTourInfo" className="text-sm font-medium text-gray-700">
                      Include Tour Info
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive || false}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                </div>
              </>
            )}

            {type === 'template' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Standard Ticket Template"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe this template..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Type
                  </label>
                  <select
                    value={formData.templateType || 'standard'}
                    onChange={(e) => handleInputChange('templateType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                    <option value="group">Group</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Layout
                  </label>
                  <select
                    value={formData.design?.layout || 'vertical'}
                    onChange={(e) => handleNestedInputChange('design', 'layout', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="vertical">Vertical</option>
                    <option value="horizontal">Horizontal</option>
                    <option value="square">Square</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Code Position
                  </label>
                  <select
                    value={formData.design?.qrCodePosition || 'center'}
                    onChange={(e) => handleNestedInputChange('design', 'qrCodePosition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="center">Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Scheme
                  </label>
                  <select
                    value={formData.design?.colorScheme || 'blue'}
                    onChange={(e) => handleNestedInputChange('design', 'colorScheme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="red">Red</option>
                    <option value="purple">Purple</option>
                    <option value="orange">Orange</option>
                    <option value="gray">Gray</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size
                  </label>
                  <input
                    type="number"
                    min="8"
                    max="24"
                    value={formData.design?.fontSize || 12}
                    onChange={(e) => handleNestedInputChange('design', 'fontSize', parseInt(e.target.value) || 12)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="includeLogo"
                      checked={formData.design?.includeLogo || false}
                      onChange={(e) => handleNestedInputChange('design', 'includeLogo', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="includeLogo" className="text-sm font-medium text-gray-700">
                      Include Logo
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="includeBorder"
                      checked={formData.design?.includeBorder || false}
                      onChange={(e) => handleNestedInputChange('design', 'includeBorder', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="includeBorder" className="text-sm font-medium text-gray-700">
                      Include Border
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="includeWatermark"
                      checked={formData.design?.includeWatermark || false}
                      onChange={(e) => handleNestedInputChange('design', 'includeWatermark', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="includeWatermark" className="text-sm font-medium text-gray-700">
                      Include Watermark
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive || false}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

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


