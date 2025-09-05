import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, CheckCircle, Workflow } from 'lucide-react';
import type { Waiver, WaiverSignature, WaiverTemplate, WaiverWorkflow } from '../types/waivers';

interface WaiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  item?: Waiver | WaiverSignature | WaiverTemplate | WaiverWorkflow;
  mode: 'create' | 'edit';
  type: 'waiver' | 'signature' | 'template' | 'workflow';
}

export const WaiverModal: React.FC<WaiverModalProps> = ({
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
      if (type === 'waiver') {
        setFormData({
          name: '',
          title: '',
          description: '',
          content: '',
          version: '1.0',
          type: 'liability',
          category: 'required',
          isActive: true,
          isDefault: false,
          language: 'en',
          applicableTours: [],
          applicableAgeGroups: ['adult'],
          requiredFields: [],
          legalRequirements: [],
          validityPeriod: {
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            duration: 365
          },
          signatureRequired: true,
          witnessRequired: false,
          parentGuardianRequired: false
        });
      } else if (type === 'signature') {
        setFormData({
          waiverId: '',
          customerId: '',
          customerName: '',
          customerEmail: '',
          bookingId: '',
          tourId: '',
          tourName: '',
          tourDate: '',
          signatureData: '',
          signatureMethod: 'digital',
          signedAt: new Date().toISOString(),
          ipAddress: '',
          userAgent: '',
          witnessName: '',
          witnessSignature: '',
          parentGuardianName: '',
          parentGuardianSignature: '',
          parentGuardianRelationship: '',
          fieldResponses: [],
          status: 'pending',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      } else if (type === 'template') {
        setFormData({
          name: '',
          description: '',
          templateType: 'standard',
          category: 'liability',
          language: 'en',
          content: '',
          variables: [],
          styling: {
            fontFamily: 'Arial',
            fontSize: 12,
            colorScheme: 'blue',
            logoUrl: '',
            headerColor: '#2563eb',
            footerColor: '#64748b'
          },
          sections: [],
          isActive: true,
          isDefault: false
        });
      } else if (type === 'workflow') {
        setFormData({
          name: '',
          description: '',
          trigger: 'booking_created',
          conditions: {
            tourTypes: [],
            ageGroups: [],
            countries: [],
            customRules: ''
          },
          actions: {
            sendWaiver: true,
            waiverId: '',
            sendReminder: true,
            reminderDays: [1, 3, 7],
            requireSignature: true,
            allowDigitalSignature: true,
            requireWitness: false,
            notifyStaff: true,
            staffNotificationTemplate: ''
          },
          isActive: true,
          priority: 1
        });
      }
    }
    setErrors({});
  }, [item, mode, type, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (type === 'waiver') {
      if (!formData.name?.trim()) {
        newErrors.name = 'Waiver name is required';
      }
      if (!formData.title?.trim()) {
        newErrors.title = 'Title is required';
      }
      if (!formData.content?.trim()) {
        newErrors.content = 'Content is required';
      }
      if (!formData.version?.trim()) {
        newErrors.version = 'Version is required';
      }
    } else if (type === 'signature') {
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
    } else if (type === 'template') {
      if (!formData.name?.trim()) {
        newErrors.name = 'Template name is required';
      }
      if (!formData.description?.trim()) {
        newErrors.description = 'Description is required';
      }
      if (!formData.content?.trim()) {
        newErrors.content = 'Content is required';
      }
    } else if (type === 'workflow') {
      if (!formData.name?.trim()) {
        newErrors.name = 'Workflow name is required';
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
      case 'waiver': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'signature': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'template': return <FileText className="w-5 h-5 text-purple-600" />;
      case 'workflow': return <Workflow className="w-5 h-5 text-teal-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'waiver': return 'Waiver';
      case 'signature': return 'Waiver Signature';
      case 'template': return 'Waiver Template';
      case 'workflow': return 'Waiver Workflow';
      default: return 'Waiver Item';
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
            {type === 'waiver' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waiver Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Liability Waiver"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Release of Liability and Assumption of Risk"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
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
                    placeholder="Brief description of this waiver..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type || 'liability'}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="liability">Liability</option>
                    <option value="medical">Medical</option>
                    <option value="photo_video">Photo/Video</option>
                    <option value="participation">Participation</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category || 'required'}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="required">Required</option>
                    <option value="optional">Optional</option>
                    <option value="conditional">Conditional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version *
                  </label>
                  <input
                    type="text"
                    value={formData.version || ''}
                    onChange={(e) => handleInputChange('version', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.version ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 1.0"
                  />
                  {errors.version && (
                    <p className="mt-1 text-sm text-red-600">{errors.version}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={formData.language || 'en'}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content || ''}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={10}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.content ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter the waiver content here..."
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="signatureRequired"
                      checked={formData.signatureRequired || false}
                      onChange={(e) => handleInputChange('signatureRequired', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="signatureRequired" className="text-sm font-medium text-gray-700">
                      Signature Required
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="witnessRequired"
                      checked={formData.witnessRequired || false}
                      onChange={(e) => handleInputChange('witnessRequired', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="witnessRequired" className="text-sm font-medium text-gray-700">
                      Witness Required
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="parentGuardianRequired"
                      checked={formData.parentGuardianRequired || false}
                      onChange={(e) => handleInputChange('parentGuardianRequired', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="parentGuardianRequired" className="text-sm font-medium text-gray-700">
                      Parent/Guardian Required (for minors)
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

            {type === 'signature' && (
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
                    Signature Method
                  </label>
                  <select
                    value={formData.signatureMethod || 'digital'}
                    onChange={(e) => handleInputChange('signatureMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="digital">Digital</option>
                    <option value="touch">Touch</option>
                    <option value="upload">Upload</option>
                    <option value="typed">Typed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || 'pending'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="signed">Signed</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="invalid">Invalid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IP Address
                  </label>
                  <input
                    type="text"
                    value={formData.ipAddress || ''}
                    onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 192.168.1.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Agent
                  </label>
                  <input
                    type="text"
                    value={formData.userAgent || ''}
                    onChange={(e) => handleInputChange('userAgent', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Browser information"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Witness Name
                  </label>
                  <input
                    type="text"
                    value={formData.witnessName || ''}
                    onChange={(e) => handleInputChange('witnessName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Jane Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent/Guardian Name
                  </label>
                  <input
                    type="text"
                    value={formData.parentGuardianName || ''}
                    onChange={(e) => handleInputChange('parentGuardianName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Mary Smith"
                  />
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
                    placeholder="e.g., Standard Liability Waiver Template"
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
                    Category
                  </label>
                  <select
                    value={formData.category || 'liability'}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="liability">Liability</option>
                    <option value="medical">Medical</option>
                    <option value="photo_video">Photo/Video</option>
                    <option value="participation">Participation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={formData.language || 'en'}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <select
                    value={formData.styling?.fontFamily || 'Arial'}
                    onChange={(e) => handleNestedInputChange('styling', 'fontFamily', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content || ''}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={10}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.content ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter the template content here..."
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                  )}
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
                      id="isDefault"
                      checked={formData.isDefault || false}
                      onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                      Default Template
                    </label>
                  </div>
                </div>
              </>
            )}

            {type === 'workflow' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Automatic Waiver Sending"
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
                    placeholder="Describe this workflow..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
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
                    <option value="tour_approaching">Tour Approaching</option>
                    <option value="manual">Manual</option>
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
                      id="sendWaiver"
                      checked={formData.actions?.sendWaiver || false}
                      onChange={(e) => handleNestedInputChange('actions', 'sendWaiver', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="sendWaiver" className="text-sm font-medium text-gray-700">
                      Send Waiver
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="sendReminder"
                      checked={formData.actions?.sendReminder || false}
                      onChange={(e) => handleNestedInputChange('actions', 'sendReminder', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="sendReminder" className="text-sm font-medium text-gray-700">
                      Send Reminder
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="requireSignature"
                      checked={formData.actions?.requireSignature || false}
                      onChange={(e) => handleNestedInputChange('actions', 'requireSignature', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="requireSignature" className="text-sm font-medium text-gray-700">
                      Require Signature
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="allowDigitalSignature"
                      checked={formData.actions?.allowDigitalSignature || false}
                      onChange={(e) => handleNestedInputChange('actions', 'allowDigitalSignature', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="allowDigitalSignature" className="text-sm font-medium text-gray-700">
                      Allow Digital Signature
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="notifyStaff"
                      checked={formData.actions?.notifyStaff || false}
                      onChange={(e) => handleNestedInputChange('actions', 'notifyStaff', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="notifyStaff" className="text-sm font-medium text-gray-700">
                      Notify Staff
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


