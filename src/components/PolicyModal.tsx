import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Shield, DollarSign, Banknote, CreditCard } from 'lucide-react';
import type { RefundPolicy, DepositPolicy, PaymentTerms } from '../types/policies';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (policy: RefundPolicy | DepositPolicy | PaymentTerms) => void;
  policy?: RefundPolicy | DepositPolicy | PaymentTerms;
  mode: 'create' | 'edit';
  type: 'refund' | 'deposit' | 'payment';
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  policy,
  mode,
  type
}) => {
  const [formData, setFormData] = useState<Partial<RefundPolicy | DepositPolicy | PaymentTerms>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (policy && mode === 'edit') {
      setFormData(policy);
    } else {
      // Initialize with default values based on type
      if (type === 'refund') {
        setFormData({
          name: '',
          description: '',
          policyType: 'cancellation',
          refundPercentage: 100,
          timeRestrictions: {
            hoursBeforeTour: 24,
            cutoffTime: ''
          },
          conditions: [],
          isActive: true,
          applicableTours: []
        });
      } else if (type === 'deposit') {
        setFormData({
          name: '',
          description: '',
          depositType: 'percentage',
          depositValue: 20,
          isRequired: true,
          dueDate: {
            type: 'immediate',
            value: 0
          },
          refundable: true,
          applicableTours: [],
          isActive: true
        });
      } else if (type === 'payment') {
        setFormData({
          name: '',
          description: '',
          paymentMethods: ['card', 'cash'],
          currency: 'EUR',
          processingFees: {
            card: 2.5,
            bankTransfer: 0,
            mobileMoney: 1.5,
            crypto: 3.0
          },
          installmentOptions: {
            enabled: false,
            maxInstallments: 3,
            minimumAmount: 100,
            interestRate: 0
          },
          latePaymentFees: {
            enabled: false,
            gracePeriodDays: 7,
            feeAmount: 10,
            feeType: 'fixed'
          },
          isActive: true
        });
      }
    }
    setErrors({});
  }, [policy, mode, type, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (type === 'refund') {
      if (formData.refundPercentage < 0 || formData.refundPercentage > 100) {
        newErrors.refundPercentage = 'Refund percentage must be between 0 and 100';
      }
      if (formData.timeRestrictions?.hoursBeforeTour < 0) {
        newErrors.hoursBeforeTour = 'Hours before tour must be positive';
      }
    } else if (type === 'deposit') {
      if (formData.depositValue <= 0) {
        newErrors.depositValue = 'Deposit value must be greater than 0';
      }
    } else if (type === 'payment') {
      if (!formData.paymentMethods?.length) {
        newErrors.paymentMethods = 'At least one payment method is required';
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

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'refund': return <DollarSign className="w-5 h-5 text-blue-600" />;
      case 'deposit': return <Banknote className="w-5 h-5 text-green-600" />;
      case 'payment': return <CreditCard className="w-5 h-5 text-purple-600" />;
      default: return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'refund': return 'Refund Policy';
      case 'deposit': return 'Deposit Policy';
      case 'payment': return 'Payment Terms';
      default: return 'Policy';
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
                {mode === 'create' ? `Create a new ${type} policy` : `Update ${type} policy details`}
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Standard Cancellation Policy"
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
                placeholder="Describe the policy details..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Type-specific fields */}
          {type === 'refund' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Type
                  </label>
                  <select
                    value={formData.policyType || 'cancellation'}
                    onChange={(e) => handleInputChange('policyType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cancellation">Cancellation</option>
                    <option value="no_show">No Show</option>
                    <option value="weather">Weather</option>
                    <option value="force_majeure">Force Majeure</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Percentage *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.refundPercentage || 100}
                      onChange={(e) => handleInputChange('refundPercentage', parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-2 pr-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.refundPercentage ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="100"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                  {errors.refundPercentage && (
                    <p className="mt-1 text-sm text-red-600">{errors.refundPercentage}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hours Before Tour
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.timeRestrictions?.hoursBeforeTour || 24}
                    onChange={(e) => handleNestedInputChange('timeRestrictions', 'hoursBeforeTour', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cutoff Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={formData.timeRestrictions?.cutoffTime || ''}
                    onChange={(e) => handleNestedInputChange('timeRestrictions', 'cutoffTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          {type === 'deposit' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deposit Type
                  </label>
                  <select
                    value={formData.depositType || 'percentage'}
                    onChange={(e) => handleInputChange('depositType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                    <option value="tiered">Tiered</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deposit Value *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.depositValue || 20}
                      onChange={(e) => handleInputChange('depositValue', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 pr-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.depositValue ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="20"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {formData.depositType === 'percentage' ? '%' : '€'}
                    </span>
                  </div>
                  {errors.depositValue && (
                    <p className="mt-1 text-sm text-red-600">{errors.depositValue}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date Type
                  </label>
                  <select
                    value={formData.dueDate?.type || 'immediate'}
                    onChange={(e) => handleNestedInputChange('dueDate', 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="hours_before">Hours Before Tour</option>
                    <option value="days_before">Days Before Tour</option>
                    <option value="specific_date">Specific Date</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.dueDate?.value || 0}
                    onChange={(e) => handleNestedInputChange('dueDate', 'value', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={formData.isRequired || false}
                    onChange={(e) => handleInputChange('isRequired', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isRequired" className="text-sm font-medium text-gray-700">
                    Required
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="refundable"
                    checked={formData.refundable || false}
                    onChange={(e) => handleInputChange('refundable', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="refundable" className="text-sm font-medium text-gray-700">
                    Refundable
                  </label>
                </div>
              </div>
            </>
          )}

          {type === 'payment' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency || 'EUR'}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Methods *
                  </label>
                  <div className="space-y-2">
                    {['cash', 'card', 'bank_transfer', 'mobile_money', 'crypto'].map(method => (
                      <label key={method} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.paymentMethods?.includes(method) || false}
                          onChange={(e) => {
                            const methods = formData.paymentMethods || [];
                            if (e.target.checked) {
                              handleInputChange('paymentMethods', [...methods, method]);
                            } else {
                              handleInputChange('paymentMethods', methods.filter((m: string) => m !== method));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{method.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                  {errors.paymentMethods && (
                    <p className="mt-1 text-sm text-red-600">{errors.paymentMethods}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Processing Fees (%)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(formData.processingFees || {}).map(([method, fee]) => (
                    <div key={method}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {method.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={fee as number}
                        onChange={(e) => handleNestedInputChange('processingFees', method, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Status */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive || false}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active (policy is currently in effect)
            </label>
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
