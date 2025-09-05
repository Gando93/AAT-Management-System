import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plug, Zap, TestTube, Activity, Plus, Minus } from 'lucide-react';
import type { Integration, WebhookConfig, IntegrationTest, IntegrationMonitor } from '../types/integrations';

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  item?: Integration | WebhookConfig | IntegrationTest | IntegrationMonitor;
  mode: 'create' | 'edit';
  type: 'integration' | 'webhook' | 'test' | 'monitor';
}

export const IntegrationModal: React.FC<IntegrationModalProps> = ({
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
      if (type === 'integration') {
        setFormData({
          name: '',
          description: '',
          type: 'api',
          status: 'pending',
          provider: '',
          version: '1.0.0',
          baseUrl: '',
          authentication: {
            type: 'api_key',
            credentials: {}
          },
          configuration: {
            timeout: 30000,
            retryAttempts: 3,
            retryStrategy: 'exponential_backoff',
            retryDelay: 1000,
            rateLimit: {
              requests: 100,
              period: 60
            },
            dataFormat: 'json',
            encoding: 'utf-8',
            compression: false,
            encryption: false
          },
          webhooks: [],
          syncRules: [],
          isActive: false,
          isTestMode: true
        });
      } else if (type === 'webhook') {
        setFormData({
          name: '',
          url: '',
          events: [],
          method: 'POST',
          headers: {},
          isActive: true,
          retryAttempts: 3,
          timeout: 30000
        });
      } else if (type === 'test') {
        setFormData({
          name: '',
          description: '',
          testType: 'connection',
          configuration: {
            endpoint: '',
            method: 'GET',
            headers: {},
            timeout: 30000
          },
          isActive: true
        });
      } else if (type === 'monitor') {
        setFormData({
          name: '',
          description: '',
          metric: 'uptime',
          threshold: {
            value: 99,
            operator: 'less_than',
            unit: '%'
          },
          isActive: true,
          alertChannels: []
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

    if (type === 'integration') {
      if (!formData.provider?.trim()) {
        newErrors.provider = 'Provider is required';
      }
      if (!formData.baseUrl?.trim()) {
        newErrors.baseUrl = 'Base URL is required';
      }
    } else if (type === 'webhook') {
      if (!formData.url?.trim()) {
        newErrors.url = 'URL is required';
      }
      if (!formData.events?.length) {
        newErrors.events = 'At least one event is required';
      }
    } else if (type === 'test') {
      if (!formData.testType) {
        newErrors.testType = 'Test type is required';
      }
    } else if (type === 'monitor') {
      if (!formData.metric) {
        newErrors.metric = 'Metric is required';
      }
      if (!formData.threshold?.value) {
        newErrors.threshold = 'Threshold value is required';
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

  const addWebhook = () => {
    const newWebhook = {
      id: Date.now().toString(),
      name: '',
      url: '',
      events: [],
      method: 'POST',
      headers: {},
      isActive: true,
      retryAttempts: 3,
      timeout: 30000
    };
    setFormData((prev: any) => ({
      ...prev,
      webhooks: [...(prev.webhooks || []), newWebhook]
    }));
  };

  const removeWebhook = (webhookId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      webhooks: prev.webhooks.filter((w: any) => w.id !== webhookId)
    }));
  };

  const addSyncRule = () => {
    const newRule = {
      id: Date.now().toString(),
      name: '',
      sourceField: '',
      targetField: '',
      direction: 'bidirectional',
      isActive: true,
      priority: 1
    };
    setFormData((prev: any) => ({
      ...prev,
      syncRules: [...(prev.syncRules || []), newRule]
    }));
  };

  const removeSyncRule = (ruleId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      syncRules: prev.syncRules.filter((r: any) => r.id !== ruleId)
    }));
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'integration': return <Plug className="w-5 h-5 text-blue-600" />;
      case 'webhook': return <Zap className="w-5 h-5 text-green-600" />;
      case 'test': return <TestTube className="w-5 h-5 text-purple-600" />;
      case 'monitor': return <Activity className="w-5 h-5 text-orange-600" />;
      default: return <Plug className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'integration': return 'Integration';
      case 'webhook': return 'Webhook';
      case 'test': return 'Test';
      case 'monitor': return 'Monitor';
      default: return 'Integration Item';
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
                {mode === 'create' ? `Create New ${getTypeTitle()}` : `Edit ${getTypeTitle()}`}
              </h2>
              <p className="text-sm text-gray-600">
                {mode === 'create' ? `Create a new ${type}` : `Update ${type} details`}
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
                placeholder={`Enter ${type} name`}
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
                placeholder={`Enter ${type} description`}
              />
            </div>

            {type === 'integration' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type || 'api'}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="payment_gateway">Payment Gateway</option>
                    <option value="booking_platform">Booking Platform</option>
                    <option value="crm">CRM</option>
                    <option value="email_service">Email Service</option>
                    <option value="sms_service">SMS Service</option>
                    <option value="analytics">Analytics</option>
                    <option value="webhook">Webhook</option>
                    <option value="api">API</option>
                    <option value="database">Database</option>
                    <option value="file_sync">File Sync</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider *
                  </label>
                  <input
                    type="text"
                    value={formData.provider || ''}
                    onChange={(e) => handleInputChange('provider', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.provider ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Stripe, Booking.com, Salesforce"
                  />
                  {errors.provider && (
                    <p className="mt-1 text-sm text-red-600">{errors.provider}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={formData.version || '1.0.0'}
                    onChange={(e) => handleInputChange('version', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1.0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base URL *
                  </label>
                  <input
                    type="url"
                    value={formData.baseUrl || ''}
                    onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.baseUrl ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="https://api.example.com"
                  />
                  {errors.baseUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.baseUrl}</p>
                  )}
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="error">Error</option>
                    <option value="testing">Testing</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </>
            )}

            {type === 'webhook' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={formData.url || ''}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.url ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="https://your-webhook-endpoint.com"
                  />
                  {errors.url && (
                    <p className="mt-1 text-sm text-red-600">{errors.url}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Method
                  </label>
                  <select
                    value={formData.method || 'POST'}
                    onChange={(e) => handleInputChange('method', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Events *
                  </label>
                  <div className="space-y-2">
                    {['booking_created', 'booking_updated', 'booking_cancelled', 'payment_received', 'customer_created', 'tour_updated'].map((event) => (
                      <label key={event} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.events?.includes(event) || false}
                          onChange={(e) => {
                            const events = formData.events || [];
                            if (e.target.checked) {
                              handleInputChange('events', [...events, event]);
                            } else {
                              handleInputChange('events', events.filter((ev: string) => ev !== event));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{event.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                  {errors.events && (
                    <p className="mt-1 text-sm text-red-600">{errors.events}</p>
                  )}
                </div>
              </>
            )}

            {type === 'test' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Type *
                  </label>
                  <select
                    value={formData.testType || 'connection'}
                    onChange={(e) => handleInputChange('testType', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.testType ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="connection">Connection Test</option>
                    <option value="authentication">Authentication Test</option>
                    <option value="data_sync">Data Sync Test</option>
                    <option value="webhook">Webhook Test</option>
                    <option value="custom">Custom Test</option>
                  </select>
                  {errors.testType && (
                    <p className="mt-1 text-sm text-red-600">{errors.testType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endpoint
                  </label>
                  <input
                    type="url"
                    value={formData.configuration?.endpoint || ''}
                    onChange={(e) => handleNestedInputChange('configuration', 'endpoint', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="/api/test"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Method
                  </label>
                  <select
                    value={formData.configuration?.method || 'GET'}
                    onChange={(e) => handleNestedInputChange('configuration', 'method', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeout (ms)
                  </label>
                  <input
                    type="number"
                    value={formData.configuration?.timeout || 30000}
                    onChange={(e) => handleNestedInputChange('configuration', 'timeout', parseInt(e.target.value) || 30000)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {type === 'monitor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metric *
                  </label>
                  <select
                    value={formData.metric || 'uptime'}
                    onChange={(e) => handleInputChange('metric', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.metric ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="uptime">Uptime</option>
                    <option value="response_time">Response Time</option>
                    <option value="error_rate">Error Rate</option>
                    <option value="throughput">Throughput</option>
                    <option value="custom">Custom</option>
                  </select>
                  {errors.metric && (
                    <p className="mt-1 text-sm text-red-600">{errors.metric}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Threshold Value *
                  </label>
                  <input
                    type="number"
                    value={formData.threshold?.value || 99}
                    onChange={(e) => handleNestedInputChange('threshold', 'value', parseFloat(e.target.value) || 99)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.threshold ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.threshold && (
                    <p className="mt-1 text-sm text-red-600">{errors.threshold}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operator
                  </label>
                  <select
                    value={formData.threshold?.operator || 'less_than'}
                    onChange={(e) => handleNestedInputChange('threshold', 'operator', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="greater_than">Greater Than</option>
                    <option value="less_than">Less Than</option>
                    <option value="equals">Equals</option>
                    <option value="not_equals">Not Equals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={formData.threshold?.unit || '%'}
                    onChange={(e) => handleNestedInputChange('threshold', 'unit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="%, ms, requests/min"
                  />
                </div>
              </>
            )}
          </div>

          {/* Integration-specific sections */}
          {type === 'integration' && (
            <>
              {/* Webhooks Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Webhooks</h3>
                  <button
                    type="button"
                    onClick={addWebhook}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Webhook
                  </button>
                </div>

                <div className="space-y-3">
                  {(formData.webhooks || []).map((webhook: any, index: number) => (
                    <div key={webhook.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Webhook Name"
                          value={webhook.name}
                          onChange={(e) => {
                            const newWebhooks = [...(formData.webhooks || [])];
                            newWebhooks[index] = { ...webhook, name: e.target.value };
                            setFormData({ ...formData, webhooks: newWebhooks });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="url"
                          placeholder="Webhook URL"
                          value={webhook.url}
                          onChange={(e) => {
                            const newWebhooks = [...(formData.webhooks || [])];
                            newWebhooks[index] = { ...webhook, url: e.target.value };
                            setFormData({ ...formData, webhooks: newWebhooks });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={webhook.method}
                          onChange={(e) => {
                            const newWebhooks = [...(formData.webhooks || [])];
                            newWebhooks[index] = { ...webhook, method: e.target.value };
                            setFormData({ ...formData, webhooks: newWebhooks });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="POST">POST</option>
                          <option value="GET">GET</option>
                          <option value="PUT">PUT</option>
                          <option value="PATCH">PATCH</option>
                          <option value="DELETE">DELETE</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeWebhook(webhook.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sync Rules Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Sync Rules</h3>
                  <button
                    type="button"
                    onClick={addSyncRule}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Rule
                  </button>
                </div>

                <div className="space-y-3">
                  {(formData.syncRules || []).map((rule: any, index: number) => (
                    <div key={rule.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                          type="text"
                          placeholder="Rule Name"
                          value={rule.name}
                          onChange={(e) => {
                            const newRules = [...(formData.syncRules || [])];
                            newRules[index] = { ...rule, name: e.target.value };
                            setFormData({ ...formData, syncRules: newRules });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Source Field"
                          value={rule.sourceField}
                          onChange={(e) => {
                            const newRules = [...(formData.syncRules || [])];
                            newRules[index] = { ...rule, sourceField: e.target.value };
                            setFormData({ ...formData, syncRules: newRules });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Target Field"
                          value={rule.targetField}
                          onChange={(e) => {
                            const newRules = [...(formData.syncRules || [])];
                            newRules[index] = { ...rule, targetField: e.target.value };
                            setFormData({ ...formData, syncRules: newRules });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={rule.direction}
                          onChange={(e) => {
                            const newRules = [...(formData.syncRules || [])];
                            newRules[index] = { ...rule, direction: e.target.value };
                            setFormData({ ...formData, syncRules: newRules });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="inbound">Inbound</option>
                          <option value="outbound">Outbound</option>
                          <option value="bidirectional">Bidirectional</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSyncRule(rule.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Options */}
          <div className="space-y-3">
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

            {type === 'integration' && (
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isTestMode"
                  checked={formData.isTestMode || false}
                  onChange={(e) => handleInputChange('isTestMode', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isTestMode" className="text-sm font-medium text-gray-700">
                  Test Mode
                </label>
              </div>
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


