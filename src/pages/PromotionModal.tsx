import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Percent, Users, Bell, Settings, Share2, Star } from 'lucide-react';
import type { Promotion, CustomerSegment, Campaign, PromotionRule, ReferralProgram, LoyaltyProgram } from '../types/promotions';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  item?: Promotion | CustomerSegment | Campaign | PromotionRule | ReferralProgram | LoyaltyProgram;
  mode: 'create' | 'edit';
  type: 'promotion' | 'segment' | 'campaign' | 'rule' | 'referral' | 'loyalty';
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
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
      if (type === 'promotion') {
        setFormData({
          name: '',
          description: '',
          code: '',
          type: 'percentage',
          value: 0,
          currency: 'USD',
          minOrderValue: 0,
          maxDiscountAmount: 0,
          usageLimit: 0,
          usageCount: 0,
          perCustomerLimit: 1,
          applicableTours: [],
          applicableAddons: [],
          customerSegments: [],
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          isActive: true,
          isPublic: true,
          priority: 1,
          conditions: [],
          exclusions: []
        });
      } else if (type === 'segment') {
        setFormData({
          name: '',
          description: '',
          criteria: {
            minBookings: 0,
            maxBookings: 0,
            minSpent: 0,
            maxSpent: 0,
            countries: [],
            ageGroups: [],
            tourTypes: [],
            tags: []
          },
          customerCount: 0,
          isActive: true
        });
      } else if (type === 'campaign') {
        setFormData({
          name: '',
          description: '',
          type: 'email',
          status: 'draft',
          targetAudience: {
            segments: [],
            customCriteria: {}
          },
          content: {
            subject: '',
            title: '',
            message: '',
            imageUrl: '',
            buttonText: '',
            buttonUrl: ''
          },
          promotionId: '',
          schedule: {
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            timezone: 'UTC',
            frequency: 'once'
          },
          metrics: {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            converted: 0,
            revenue: 0,
            currency: 'USD'
          }
        });
      } else if (type === 'rule') {
        setFormData({
          name: '',
          description: '',
          trigger: 'booking_created',
          conditions: [],
          actions: {
            createPromotion: false,
            sendNotification: false,
            applyDiscount: false,
            addToSegment: false
          },
          isActive: true,
          priority: 1
        });
      } else if (type === 'referral') {
        setFormData({
          name: '',
          description: '',
          referrerReward: {
            type: 'percentage',
            value: 10,
            currency: 'USD'
          },
          refereeReward: {
            type: 'percentage',
            value: 5,
            currency: 'USD'
          },
          conditions: {
            minBookingValue: 0,
            maxReferrals: 0,
            expirationDays: 30
          },
          isActive: true,
          totalReferrals: 0,
          totalRewards: 0
        });
      } else if (type === 'loyalty') {
        setFormData({
          name: '',
          description: '',
          tiers: [],
          pointsPerDollar: 1,
          pointsPerBooking: 10,
          redemptionRules: {
            minPoints: 100,
            maxRedemptionPercentage: 50,
            pointValue: 0.01
          },
          isActive: true,
          totalMembers: 0,
          totalPointsIssued: 0,
          totalPointsRedeemed: 0
        });
      }
    }
    setErrors({});
  }, [item, mode, type, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (type === 'promotion') {
      if (!formData.name?.trim()) {
        newErrors.name = 'Promotion name is required';
      }
      if (!formData.code?.trim()) {
        newErrors.code = 'Promotion code is required';
      }
      if (!formData.value || formData.value <= 0) {
        newErrors.value = 'Promotion value must be greater than 0';
      }
    } else if (type === 'segment') {
      if (!formData.name?.trim()) {
        newErrors.name = 'Segment name is required';
      }
    } else if (type === 'campaign') {
      if (!formData.name?.trim()) {
        newErrors.name = 'Campaign name is required';
      }
      if (!formData.content?.title?.trim()) {
        newErrors.title = 'Campaign title is required';
      }
    } else if (type === 'rule') {
      if (!formData.name?.trim()) {
        newErrors.name = 'Rule name is required';
      }
    } else if (type === 'referral') {
      if (!formData.name?.trim()) {
        newErrors.name = 'Program name is required';
      }
    } else if (type === 'loyalty') {
      if (!formData.name?.trim()) {
        newErrors.name = 'Program name is required';
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
      case 'promotion': return <Percent className="w-5 h-5 text-blue-600" />;
      case 'segment': return <Users className="w-5 h-5 text-green-600" />;
      case 'campaign': return <Bell className="w-5 h-5 text-purple-600" />;
      case 'rule': return <Settings className="w-5 h-5 text-teal-600" />;
      case 'referral': return <Share2 className="w-5 h-5 text-indigo-600" />;
      case 'loyalty': return <Star className="w-5 h-5 text-yellow-600" />;
      default: return <Percent className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'promotion': return 'Promotion';
      case 'segment': return 'Customer Segment';
      case 'campaign': return 'Campaign';
      case 'rule': return 'Promotion Rule';
      case 'referral': return 'Referral Program';
      case 'loyalty': return 'Loyalty Program';
      default: return 'Promotion Item';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
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
            {type === 'promotion' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promotion Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Summer Sale 2024"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe this promotion..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promotion Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.code ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., SUMMER2024"
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type || 'percentage'}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                    <option value="buy_one_get_one">Buy One Get One</option>
                    <option value="free_shipping">Free Shipping</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.value || 0}
                    onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.value ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 20"
                  />
                  {errors.value && (
                    <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency || 'USD'}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
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

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={formData.isPublic || false}
                      onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                      Public (customers can see and use)
                    </label>
                  </div>
                </div>
              </>
            )}

            {type === 'segment' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Segment Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., High Value Customers"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe this customer segment..."
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
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

            {type === 'campaign' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Summer Promotion Campaign"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe this campaign..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Type
                  </label>
                  <select
                    value={formData.type || 'email'}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="push">Push Notification</option>
                    <option value="banner">Banner</option>
                    <option value="popup">Popup</option>
                    <option value="social">Social Media</option>
                  </select>
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
                    <option value="scheduled">Scheduled</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    value={formData.content?.title || ''}
                    onChange={(e) => handleNestedInputChange('content', 'title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Special Summer Offer!"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.content?.message || ''}
                    onChange={(e) => handleNestedInputChange('content', 'message', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your campaign message..."
                  />
                </div>
              </>
            )}

            {type === 'rule' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rule Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Auto Apply Summer Discount"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe this rule..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trigger
                  </label>
                  <select
                    value={formData.trigger || 'booking_created'}
                    onChange={(e) => handleInputChange('trigger', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="booking_created">Booking Created</option>
                    <option value="payment_received">Payment Received</option>
                    <option value="tour_completed">Tour Completed</option>
                    <option value="customer_registered">Customer Registered</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority || 1}
                    onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
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

            {type === 'referral' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Refer a Friend Program"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe this referral program..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referrer Reward Type
                  </label>
                  <select
                    value={formData.referrerReward?.type || 'percentage'}
                    onChange={(e) => handleNestedInputChange('referrerReward', 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                    <option value="free_tour">Free Tour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referrer Reward Value
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.referrerReward?.value || 0}
                    onChange={(e) => handleNestedInputChange('referrerReward', 'value', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 10"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
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

            {type === 'loyalty' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., VIP Loyalty Program"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe this loyalty program..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points Per Dollar
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.pointsPerDollar || 1}
                    onChange={(e) => handleInputChange('pointsPerDollar', parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points Per Booking
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.pointsPerBooking || 10}
                    onChange={(e) => handleInputChange('pointsPerBooking', parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 10"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
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


