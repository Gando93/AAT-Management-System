import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, BarChart3, TrendingUp, Settings, Plus, Minus } from 'lucide-react';
import type { Report, ReportTemplate, Dashboard, Analytics } from '../types/reports';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  item?: Report | ReportTemplate | Dashboard | Analytics;
  mode: 'create' | 'edit';
  type: 'report' | 'template' | 'dashboard' | 'analytics';
}

export const ReportModal: React.FC<ReportModalProps> = ({
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
      if (type === 'report') {
        setFormData({
          name: '',
          description: '',
          type: 'booking',
          status: 'draft',
          format: 'pdf',
          filters: [],
          metrics: [],
          charts: [],
          recipients: [],
          isPublic: false,
          isTemplate: false,
          tags: []
        });
      } else if (type === 'template') {
        setFormData({
          name: '',
          description: '',
          type: 'booking',
          category: 'general',
          isDefault: false,
          isPublic: false,
          template: {
            filters: [],
            metrics: [],
            charts: [],
            layout: {
              columns: 2,
              rows: 2,
              sections: []
            }
          }
        });
      } else if (type === 'dashboard') {
        setFormData({
          name: '',
          description: '',
          isPublic: false,
          isDefault: false,
          layout: {
            columns: 3,
            rows: 3,
            breakpoints: {
              mobile: { columns: 1, rows: 3 },
              tablet: { columns: 2, rows: 3 },
              desktop: { columns: 3, rows: 3 }
            }
          },
          widgets: [],
          filters: [],
          refreshInterval: 300
        });
      } else if (type === 'analytics') {
        setFormData({
          name: '',
          description: '',
          type: 'kpi',
          dataSource: '',
          metrics: [],
          dimensions: [],
          filters: [],
          timeRange: {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            granularity: 'day'
          },
          isRealTime: false,
          refreshInterval: 60
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

    if (type === 'report') {
      if (!formData.type) {
        newErrors.type = 'Report type is required';
      }
      if (!formData.format) {
        newErrors.format = 'Format is required';
      }
    } else if (type === 'template') {
      if (!formData.category?.trim()) {
        newErrors.category = 'Category is required';
      }
    } else if (type === 'analytics') {
      if (!formData.dataSource?.trim()) {
        newErrors.dataSource = 'Data source is required';
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

  const addFilter = () => {
    const newFilter = {
      id: Date.now().toString(),
      field: '',
      label: '',
      operator: 'equals',
      value: '',
      dataType: 'string',
      isRequired: false
    };
    setFormData((prev: any) => ({
      ...prev,
      filters: [...(prev.filters || []), newFilter]
    }));
  };

  const removeFilter = (filterId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      filters: prev.filters.filter((f: any) => f.id !== filterId)
    }));
  };

  const addMetric = () => {
    const newMetric = {
      id: Date.now().toString(),
      name: '',
      label: '',
      type: 'count',
      field: '',
      isVisible: true,
      order: (formData.metrics || []).length
    };
    setFormData((prev: any) => ({
      ...prev,
      metrics: [...(prev.metrics || []), newMetric]
    }));
  };

  const removeMetric = (metricId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      metrics: prev.metrics.filter((m: any) => m.id !== metricId)
    }));
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'report': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'template': return <Settings className="w-5 h-5 text-orange-600" />;
      case 'dashboard': return <BarChart3 className="w-5 h-5 text-green-600" />;
      case 'analytics': return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'report': return 'Report';
      case 'template': return 'Template';
      case 'dashboard': return 'Dashboard';
      case 'analytics': return 'Analytics';
      default: return 'Report Item';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
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

            {type === 'report' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type *
                  </label>
                  <select
                    value={formData.type || 'booking'}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.type ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="booking">Booking</option>
                    <option value="revenue">Revenue</option>
                    <option value="customer">Customer</option>
                    <option value="agent">Agent</option>
                    <option value="tour">Tour</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="guide">Guide</option>
                    <option value="commission">Commission</option>
                    <option value="custom">Custom</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format *
                  </label>
                  <select
                    value={formData.format || 'pdf'}
                    onChange={(e) => handleInputChange('format', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.format ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                  {errors.format && (
                    <p className="mt-1 text-sm text-red-600">{errors.format}</p>
                  )}
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
                    <option value="generating">Generating</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </>
            )}

            {type === 'template' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type || 'booking'}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="booking">Booking</option>
                    <option value="revenue">Revenue</option>
                    <option value="customer">Customer</option>
                    <option value="agent">Agent</option>
                    <option value="tour">Tour</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., General, Financial, Operations"
                  />
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>
              </>
            )}

            {type === 'analytics' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type || 'kpi'}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="kpi">KPI</option>
                    <option value="trend">Trend</option>
                    <option value="comparison">Comparison</option>
                    <option value="distribution">Distribution</option>
                    <option value="correlation">Correlation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Source *
                  </label>
                  <input
                    type="text"
                    value={formData.dataSource || ''}
                    onChange={(e) => handleInputChange('dataSource', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.dataSource ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., bookings, customers, revenue"
                  />
                  {errors.dataSource && (
                    <p className="mt-1 text-sm text-red-600">{errors.dataSource}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={formData.timeRange?.startDate || ''}
                      onChange={(e) => handleNestedInputChange('timeRange', 'startDate', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={formData.timeRange?.endDate || ''}
                      onChange={(e) => handleNestedInputChange('timeRange', 'endDate', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Granularity
                  </label>
                  <select
                    value={formData.timeRange?.granularity || 'day'}
                    onChange={(e) => handleNestedInputChange('timeRange', 'granularity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="quarter">Quarter</option>
                    <option value="year">Year</option>
                  </select>
                </div>
              </>
            )}

            {type === 'dashboard' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Layout Columns
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.layout?.columns || 3}
                    onChange={(e) => handleNestedInputChange('layout', 'columns', parseInt(e.target.value) || 3)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Layout Rows
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.layout?.rows || 3}
                    onChange={(e) => handleNestedInputChange('layout', 'rows', parseInt(e.target.value) || 3)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refresh Interval (seconds)
                  </label>
                  <input
                    type="number"
                    min="30"
                    value={formData.refreshInterval || 300}
                    onChange={(e) => handleInputChange('refreshInterval', parseInt(e.target.value) || 300)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Filters Section */}
          {(type === 'report' || type === 'analytics') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                <button
                  type="button"
                  onClick={addFilter}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Filter
                </button>
              </div>

              <div className="space-y-3">
                {(formData.filters || []).map((filter: any, index: number) => (
                  <div key={filter.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Field"
                        value={filter.field}
                        onChange={(e) => {
                          const newFilters = [...(formData.filters || [])];
                          newFilters[index] = { ...filter, field: e.target.value };
                          setFormData({ ...formData, filters: newFilters });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Label"
                        value={filter.label}
                        onChange={(e) => {
                          const newFilters = [...(formData.filters || [])];
                          newFilters[index] = { ...filter, label: e.target.value };
                          setFormData({ ...formData, filters: newFilters });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={filter.operator}
                        onChange={(e) => {
                          const newFilters = [...(formData.filters || [])];
                          newFilters[index] = { ...filter, operator: e.target.value };
                          setFormData({ ...formData, filters: newFilters });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="equals">Equals</option>
                        <option value="not_equals">Not Equals</option>
                        <option value="contains">Contains</option>
                        <option value="not_contains">Not Contains</option>
                        <option value="greater_than">Greater Than</option>
                        <option value="less_than">Less Than</option>
                        <option value="between">Between</option>
                        <option value="in">In</option>
                        <option value="not_in">Not In</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Value"
                        value={filter.value}
                        onChange={(e) => {
                          const newFilters = [...(formData.filters || [])];
                          newFilters[index] = { ...filter, value: e.target.value };
                          setFormData({ ...formData, filters: newFilters });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFilter(filter.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics Section */}
          {(type === 'report' || type === 'analytics') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Metrics</h3>
                <button
                  type="button"
                  onClick={addMetric}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Metric
                </button>
              </div>

              <div className="space-y-3">
                {(formData.metrics || []).map((metric: any, index: number) => (
                  <div key={metric.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Name"
                        value={metric.name}
                        onChange={(e) => {
                          const newMetrics = [...(formData.metrics || [])];
                          newMetrics[index] = { ...metric, name: e.target.value };
                          setFormData({ ...formData, metrics: newMetrics });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Label"
                        value={metric.label}
                        onChange={(e) => {
                          const newMetrics = [...(formData.metrics || [])];
                          newMetrics[index] = { ...metric, label: e.target.value };
                          setFormData({ ...formData, metrics: newMetrics });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={metric.type}
                        onChange={(e) => {
                          const newMetrics = [...(formData.metrics || [])];
                          newMetrics[index] = { ...metric, type: e.target.value };
                          setFormData({ ...formData, metrics: newMetrics });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="count">Count</option>
                        <option value="sum">Sum</option>
                        <option value="average">Average</option>
                        <option value="percentage">Percentage</option>
                        <option value="ratio">Ratio</option>
                        <option value="trend">Trend</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMetric(metric.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic || false}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                Public (visible to all users)
              </label>
            </div>

            {type === 'template' && (
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault || false}
                  onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                  Default template
                </label>
              </div>
            )}

            {type === 'analytics' && (
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isRealTime"
                  checked={formData.isRealTime || false}
                  onChange={(e) => handleInputChange('isRealTime', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isRealTime" className="text-sm font-medium text-gray-700">
                  Real-time analytics
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


