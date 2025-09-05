import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, MessageSquare, Settings, Users } from 'lucide-react';
import type { EmailTemplate, SMSMessage, NotificationRule, MarketingCampaign } from '../types/communications';

interface CommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: EmailTemplate | SMSMessage | NotificationRule | MarketingCampaign) => void;
  item?: EmailTemplate | SMSMessage | NotificationRule | MarketingCampaign;
  mode: 'create' | 'edit';
  type: 'email_template' | 'sms_message' | 'notification_rule' | 'marketing_campaign';
}

export const CommunicationModal: React.FC<CommunicationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
  mode,
  type
}) => {
  const [formData, setFormData] = useState<Partial<EmailTemplate | SMSMessage | NotificationRule | MarketingCampaign>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData(item);
    } else {
      // Initialize with default values based on type
      if (type === 'email_template') {
        setFormData({
          name: '',
          subject: '',
          content: '',
          type: 'booking_confirmation',
          variables: [],
          isActive: true,
          isDefault: false,
          language: 'en'
        });
      } else if (type === 'sms_message') {
        setFormData({
          recipient: '',
          content: '',
          type: 'booking_confirmation'
        });
      } else if (type === 'notification_rule') {
        setFormData({
          name: '',
          description: '',
          trigger: 'booking_created',
          conditions: {},
          actions: {
            email: {
              templateId: '',
              recipients: ['customer']
            },
            sms: {
              templateId: '',
              recipients: ['customer']
            }
          },
          isActive: true,
          priority: 1
        });
      } else if (type === 'marketing_campaign') {
        setFormData({
          name: '',
          description: '',
          type: 'email',
          status: 'draft',
          targetAudience: {},
          content: {
            subject: '',
            emailContent: '',
            smsContent: ''
          },
          schedule: {
            type: 'immediate'
          },
          stats: {
            totalSent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            unsubscribed: 0
          }
        });
      }
    }
    setErrors({});
  }, [item, mode, type, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (type === 'email_template') {
      if (!formData.subject?.trim()) {
        newErrors.subject = 'Subject is required';
      }
      if (!formData.content?.trim()) {
        newErrors.content = 'Content is required';
      }
    } else if (type === 'sms_message') {
      if (!formData.recipient?.trim()) {
        newErrors.recipient = 'Recipient phone number is required';
      }
      if (!formData.content?.trim()) {
        newErrors.content = 'Message content is required';
      }
    } else if (type === 'notification_rule') {
      if (!formData.trigger) {
        newErrors.trigger = 'Trigger is required';
      }
    } else if (type === 'marketing_campaign') {
      if (!formData.content?.subject?.trim()) {
        newErrors.subject = 'Email subject is required';
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
      case 'email_template': return <Mail className="w-5 h-5 text-blue-600" />;
      case 'sms_message': return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'notification_rule': return <Settings className="w-5 h-5 text-orange-600" />;
      case 'marketing_campaign': return <Users className="w-5 h-5 text-purple-600" />;
      default: return <Mail className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'email_template': return 'Email Template';
      case 'sms_message': return 'SMS Message';
      case 'notification_rule': return 'Notification Rule';
      case 'marketing_campaign': return 'Marketing Campaign';
      default: return 'Communication';
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Booking Confirmation Email"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {type === 'email_template' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject || ''}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.subject ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Your Tour Booking Confirmation"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type || 'booking_confirmation'}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="booking_confirmation">Booking Confirmation</option>
                    <option value="payment_receipt">Payment Receipt</option>
                    <option value="cancellation">Cancellation</option>
                    <option value="reminder">Reminder</option>
                    <option value="marketing">Marketing</option>
                    <option value="custom">Custom</option>
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
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content (HTML) *
                  </label>
                  <textarea
                    value={formData.content || ''}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={8}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.content ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email content here. Use {{variable_name}} for dynamic content..."
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Available variables: {'{{customer_name}}'}, {'{{tour_name}}'}, {'{{booking_date}}'}, {'{{total_amount}}'}
                  </p>
                </div>
              </>
            )}

            {type === 'sms_message' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.recipient || ''}
                    onChange={(e) => handleInputChange('recipient', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.recipient ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+1234567890"
                  />
                  {errors.recipient && (
                    <p className="mt-1 text-sm text-red-600">{errors.recipient}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type || 'booking_confirmation'}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="booking_confirmation">Booking Confirmation</option>
                    <option value="reminder">Reminder</option>
                    <option value="cancellation">Cancellation</option>
                    <option value="marketing">Marketing</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Content *
                  </label>
                  <textarea
                    value={formData.content || ''}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={4}
                    maxLength={160}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.content ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your SMS message here..."
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.content?.length || 0}/160 characters
                  </p>
                </div>
              </>
            )}

            {type === 'notification_rule' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe when this rule should trigger..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trigger Event
                  </label>
                  <select
                    value={formData.trigger || 'booking_created'}
                    onChange={(e) => handleInputChange('trigger', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="booking_created">Booking Created</option>
                    <option value="booking_confirmed">Booking Confirmed</option>
                    <option value="booking_cancelled">Booking Cancelled</option>
                    <option value="payment_received">Payment Received</option>
                    <option value="tour_reminder">Tour Reminder</option>
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
              </>
            )}

            {type === 'marketing_campaign' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your marketing campaign..."
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
                    <option value="both">Both Email & SMS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule
                  </label>
                  <select
                    value={formData.schedule?.type || 'immediate'}
                    onChange={(e) => handleNestedInputChange('schedule', 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="immediate">Send Immediately</option>
                    <option value="scheduled">Schedule for Later</option>
                  </select>
                </div>

                {(formData.type === 'email' || formData.type === 'both') && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Subject *
                      </label>
                      <input
                        type="text"
                        value={formData.content?.subject || ''}
                        onChange={(e) => handleNestedInputChange('content', 'subject', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.subject ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter email subject..."
                      />
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Content
                      </label>
                      <textarea
                        value={formData.content?.emailContent || ''}
                        onChange={(e) => handleNestedInputChange('content', 'emailContent', e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter email content..."
                      />
                    </div>
                  </>
                )}

                {(formData.type === 'sms' || formData.type === 'both') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMS Content
                    </label>
                    <textarea
                      value={formData.content?.smsContent || ''}
                      onChange={(e) => handleNestedInputChange('content', 'smsContent', e.target.value)}
                      rows={3}
                      maxLength={160}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter SMS content..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.content?.smsContent?.length || 0}/160 characters
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Status for applicable types */}
          {(type === 'email_template' || type === 'notification_rule') && (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive || false}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (currently in effect)
              </label>
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
