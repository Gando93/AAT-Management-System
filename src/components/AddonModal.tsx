import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Package, DollarSign } from 'lucide-react';
import type { Addon, AddonCategory } from '../types/addons';

interface AddonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (addon: Omit<Addon, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addon?: Addon;
  mode: 'create' | 'edit';
  categories: AddonCategory[]; // eslint-disable-line @typescript-eslint/no-unused-vars
}

export const AddonModal: React.FC<AddonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  addon,
  mode,
  categories: _categories
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'equipment' as Addon['category'],
    basePrice: 0,
    currency: 'EUR',
    pricingType: 'per_person' as Addon['pricingType'],
    isActive: true,
    requiresQuantity: false,
    maxQuantity: undefined as number | undefined,
    minQuantity: undefined as number | undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (addon && mode === 'edit') {
      setFormData({
        name: addon.name,
        description: addon.description,
        category: addon.category,
        basePrice: addon.basePrice,
        currency: addon.currency,
        pricingType: addon.pricingType,
        isActive: addon.isActive,
        requiresQuantity: addon.requiresQuantity,
        maxQuantity: addon.maxQuantity,
        minQuantity: addon.minQuantity,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'equipment',
        basePrice: 0,
        currency: 'EUR',
        pricingType: 'per_person',
        isActive: true,
        requiresQuantity: false,
        maxQuantity: undefined,
        minQuantity: undefined,
      });
    }
    setErrors({});
  }, [addon, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.basePrice <= 0) {
      newErrors.basePrice = 'Price must be greater than 0';
    }

    if (formData.requiresQuantity) {
      if (formData.minQuantity !== undefined && formData.maxQuantity !== undefined) {
        if (formData.minQuantity > formData.maxQuantity) {
          newErrors.minQuantity = 'Minimum quantity cannot be greater than maximum';
        }
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

    const addonData: Omit<Addon, 'id' | 'createdAt' | 'updatedAt'> = {
      ...formData,
      maxQuantity: formData.requiresQuantity ? formData.maxQuantity : undefined,
      minQuantity: formData.requiresQuantity ? formData.minQuantity : undefined,
      availabilityRules: undefined,
      dependencies: [],
      conflicts: [],
    };

    onSave(addonData);
  };

  const handleInputChange = (field: string, value: string | number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Add New Add-on' : 'Edit Add-on'}
              </h2>
              <p className="text-sm text-gray-600">
                {mode === 'create' ? 'Create a new add-on service' : 'Update add-on details'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add-on Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Photography Package, Lunch, Equipment Rental"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe what this add-on includes..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value as Addon['category'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="equipment">🛠️ Equipment</option>
                <option value="service">🎯 Service</option>
                <option value="food">🍽️ Food & Beverage</option>
                <option value="transport">🚗 Transport</option>
                <option value="accommodation">🏨 Accommodation</option>
                <option value="other">📦 Other</option>
              </select>
            </div>

            {/* Pricing Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Type
              </label>
              <select
                value={formData.pricingType}
                onChange={(e) => handleInputChange('pricingType', e.target.value as Addon['pricingType'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="per_person">Per Person</option>
                <option value="per_booking">Per Booking</option>
                <option value="per_hour">Per Hour</option>
                <option value="fixed">Fixed Price</option>
              </select>
            </div>

            {/* Base Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price (€) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.basePrice}
                  onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.basePrice ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.basePrice && (
                <p className="mt-1 text-sm text-red-600">{errors.basePrice}</p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          {/* Quantity Settings */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                id="requiresQuantity"
                checked={formData.requiresQuantity}
                onChange={(e) => handleInputChange('requiresQuantity', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="requiresQuantity" className="text-sm font-medium text-gray-700">
                Requires quantity selection
              </label>
            </div>

            {formData.requiresQuantity && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minQuantity || ''}
                    onChange={(e) => handleInputChange('minQuantity', parseInt(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                  />
                  {errors.minQuantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.minQuantity}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxQuantity || ''}
                    onChange={(e) => handleInputChange('maxQuantity', parseInt(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="No limit"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active (available for selection)
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
              {mode === 'create' ? 'Create Add-on' : 'Update Add-on'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
