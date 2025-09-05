import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeatureFlag } from '../config/features';
import { IntegrationModal } from './IntegrationModal';
import type { Integration, WebhookConfig, SyncJob, IntegrationTest, IntegrationMonitor, IntegrationAlert, IntegrationTemplate, IntegrationUsage } from '../types/integrations';
import { 
  Plug, 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Pause,
  Settings,
  Search,
  Activity,
  Clock,
  RefreshCw,
  Zap,
  Database,
  Globe,
  Shield,
  BarChart3,
  TestTube,
  Bell,
  Copy,
  Eye
} from 'lucide-react';

interface IntegrationsPageProps {
  integrations: Integration[];
  webhookConfigs: WebhookConfig[];
  syncJobs: SyncJob[];
  integrationTests: IntegrationTest[];
  integrationMonitors: IntegrationMonitor[];
  integrationAlerts: IntegrationAlert[];
  integrationTemplates: IntegrationTemplate[];
  integrationUsage: IntegrationUsage[];
  onSaveIntegration: (integration: Omit<Integration, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onUpdateIntegration: (integration: Omit<Integration, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onDeleteIntegration: (integrationId: string) => void;
  onTestIntegration: (integrationId: string) => boolean;
  onSyncIntegration: (integrationId: string) => boolean;
  onToggleIntegration: (integrationId: string) => boolean;
  onSaveWebhook: (webhook: Omit<WebhookConfig, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onUpdateWebhook: (webhook: Omit<WebhookConfig, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onDeleteWebhook: (webhookId: string) => void;
  onSaveTest: (test: Omit<IntegrationTest, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onUpdateTest: (test: Omit<IntegrationTest, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onDeleteTest: (testId: string) => void;
  onRunTest: (testId: string) => boolean;
  onSaveMonitor: (monitor: Omit<IntegrationMonitor, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onUpdateMonitor: (monitor: Omit<IntegrationMonitor, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onDeleteMonitor: (monitorId: string) => void;
  onAcknowledgeAlert: (alertId: string) => boolean;
  onResolveAlert: (alertId: string) => boolean;
}

export const IntegrationsPage: React.FC<IntegrationsPageProps> = ({
  integrations,
  webhookConfigs,
  syncJobs,
  integrationTests,
  integrationMonitors,
  integrationAlerts,
  integrationTemplates,
  integrationUsage,
  onSaveIntegration,
  onUpdateIntegration,
  onDeleteIntegration,
  onTestIntegration,
  onSyncIntegration,
  onToggleIntegration,
  onSaveWebhook,
  onUpdateWebhook,
  onDeleteWebhook,
  onSaveTest,
  onUpdateTest,
  onDeleteTest: _onDeleteTest,
  onRunTest: _onRunTest,
  onSaveMonitor,
  onUpdateMonitor,
  onDeleteMonitor: _onDeleteMonitor,
  onAcknowledgeAlert,
  onResolveAlert
}) => {
  const [activeTab, setActiveTab] = useState<'integrations' | 'webhooks' | 'sync' | 'tests' | 'monitors' | 'alerts' | 'templates' | 'usage'>('integrations');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [integrationModal, setIntegrationModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; type: 'integration' | 'webhook' | 'test' | 'monitor'; item?: any }>({ 
    isOpen: false, 
    mode: 'create', 
    type: 'integration' 
  });

  const isFeatureEnabled = useFeatureFlag('FEATURE_INTEGRATIONS');

  if (!isFeatureEnabled) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Plug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Integrations</h3>
          <p className="text-gray-500">This feature is currently disabled.</p>
        </div>
      </div>
    );
  }

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || integration.type === filterType;
    const matchesStatus = filterStatus === 'all' || integration.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreate = (type: 'integration' | 'webhook' | 'test' | 'monitor') => {
    setIntegrationModal({ isOpen: true, mode: 'create', type });
  };

  const handleEdit = (type: 'integration' | 'webhook' | 'test' | 'monitor', item: any) => {
    setIntegrationModal({ isOpen: true, mode: 'edit', type, item });
  };

  const handleCloseModal = () => {
    setIntegrationModal({ isOpen: false, mode: 'create', type: 'integration' });
  };

  const handleSave = (item: any) => {
    let success = false;
    
    switch (integrationModal.type) {
      case 'integration':
        success = integrationModal.mode === 'create' ? onSaveIntegration(item) : onUpdateIntegration(item);
        break;
      case 'webhook':
        success = integrationModal.mode === 'create' ? onSaveWebhook(item) : onUpdateWebhook(item);
        break;
      case 'test':
        success = integrationModal.mode === 'create' ? onSaveTest(item) : onUpdateTest(item);
        break;
      case 'monitor':
        success = integrationModal.mode === 'create' ? onSaveMonitor(item) : onUpdateMonitor(item);
        break;
    }
    
    if (success) {
      handleCloseModal();
    }
  };

  const totalIntegrations = integrations.length;
  const activeIntegrations = integrations.filter(i => i.status === 'active').length;
  const totalWebhooks = webhookConfigs.length;
  const activeWebhooks = webhookConfigs.filter(w => w.isActive).length;
  const totalAlerts = integrationAlerts.length;
  const activeAlerts = integrationAlerts.filter(a => a.status === 'active').length;

  const tabs = [
    { id: 'integrations', name: 'Integrations', icon: Plug, count: totalIntegrations },
    { id: 'webhooks', name: 'Webhooks', icon: Zap, count: totalWebhooks },
    { id: 'sync', name: 'Sync Jobs', icon: RefreshCw, count: syncJobs.length },
    { id: 'tests', name: 'Tests', icon: TestTube, count: integrationTests.length },
    { id: 'monitors', name: 'Monitors', icon: Activity, count: integrationMonitors.length },
    { id: 'alerts', name: 'Alerts', icon: Bell, count: totalAlerts },
    { id: 'templates', name: 'Templates', icon: Settings, count: integrationTemplates.length },
    { id: 'usage', name: 'Usage', icon: BarChart3, count: integrationUsage.length }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'testing': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment_gateway': return <Shield className="w-5 h-5 text-green-600" />;
      case 'booking_platform': return <Globe className="w-5 h-5 text-blue-600" />;
      case 'crm': return <Database className="w-5 h-5 text-purple-600" />;
      case 'email_service': return <Zap className="w-5 h-5 text-orange-600" />;
      case 'sms_service': return <Zap className="w-5 h-5 text-pink-600" />;
      case 'analytics': return <BarChart3 className="w-5 h-5 text-indigo-600" />;
      case 'webhook': return <Zap className="w-5 h-5 text-red-600" />;
      case 'api': return <Globe className="w-5 h-5 text-cyan-600" />;
      case 'database': return <Database className="w-5 h-5 text-gray-600" />;
      case 'file_sync': return <RefreshCw className="w-5 h-5 text-teal-600" />;
      default: return <Plug className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600">Connect and manage third-party services and APIs</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCreate('integration')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Integration
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plug className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Integrations</p>
              <p className="text-2xl font-bold text-gray-900">{totalIntegrations}</p>
              <p className="text-sm text-green-600">{activeIntegrations} active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Webhooks</p>
              <p className="text-2xl font-bold text-gray-900">{totalWebhooks}</p>
              <p className="text-sm text-green-600">{activeWebhooks} active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sync Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{syncJobs.length}</p>
              <p className="text-sm text-gray-500">Data synchronization</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{totalAlerts}</p>
              <p className="text-sm text-red-600">{activeAlerts} active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                  <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
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
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="error">Error</option>
                <option value="pending">Pending</option>
                <option value="testing">Testing</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Integrations</h3>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCreate('webhook')}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Zap className="w-4 h-4 mr-1 inline" />
                    Webhook
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCreate('test')}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <TestTube className="w-4 h-4 mr-1 inline" />
                    Test
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIntegrations.map((integration) => (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          {getTypeIcon(integration.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                          <p className="text-sm text-gray-600">{integration.provider}</p>
                          <p className="text-xs text-gray-500">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
                          {integration.status}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => onTestIntegration(integration.id)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Test Integration"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onSyncIntegration(integration.id)}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="Sync Integration"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onToggleIntegration(integration.id)}
                            className="p-1 text-gray-400 hover:text-yellow-600"
                            title={integration.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {integration.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleEdit('integration', integration)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Edit Integration"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteIntegration(integration.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete Integration"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{integration.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Version:</span>
                        <span className="font-medium">{integration.version}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Webhooks:</span>
                        <span className="font-medium">{integration.webhooks.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sync Rules:</span>
                        <span className="font-medium">{integration.syncRules.length}</span>
                      </div>
                      {integration.lastSyncAt && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Sync:</span>
                          <span className="font-medium">
                            {new Date(integration.lastSyncAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {integration.lastErrorAt && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Error:</span>
                          <span className="font-medium text-red-600">
                            {new Date(integration.lastErrorAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {integration.isTestMode && (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                              Test Mode
                            </span>
                          )}
                          {integration.isActive && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(integration.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Webhooks</h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCreate('webhook')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Create Webhook
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {webhookConfigs.map((webhook) => (
                  <div key={webhook.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{webhook.name}</h4>
                          <p className="text-sm text-gray-600">{webhook.url}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit('webhook', webhook)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteWebhook(webhook.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Method:</span>
                        <span className="font-medium">{webhook.method}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Events:</span>
                        <span className="font-medium">{webhook.events.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Active:</span>
                        <span className="font-medium">{webhook.isActive ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Integration Alerts</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Integration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {integrationAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {integrations.find(i => i.id === alert.integrationId)?.name || 'Unknown Integration'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            {alert.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            alert.status === 'active' ? 'bg-red-100 text-red-800' :
                            alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-800' :
                            alert.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {alert.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(alert.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {alert.status === 'active' && (
                              <button
                                onClick={() => onAcknowledgeAlert(alert.id)}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                Acknowledge
                              </button>
                            )}
                            {alert.status === 'acknowledged' && (
                              <button
                                onClick={() => onResolveAlert(alert.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Integration Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrationTemplates.map((template) => (
                  <div key={template.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Settings className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.provider}</p>
                          <p className="text-xs text-gray-500">{template.description}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{template.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Version:</span>
                        <span className="font-medium">{template.version}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Official:</span>
                        <span className="font-medium">{template.isOfficial ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Usage Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrationUsage.map((usage) => (
                  <div key={usage.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {integrations.find(i => i.id === usage.integrationId)?.name || 'Unknown Integration'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {usage.period.startDate} - {usage.period.endDate}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">API Calls:</span>
                        <span className="font-medium">{usage.metrics.apiCalls.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Webhook Events:</span>
                        <span className="font-medium">{usage.metrics.webhookEvents.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Error Rate:</span>
                        <span className="font-medium">{usage.metrics.errorRate.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Uptime:</span>
                        <span className="font-medium">{usage.metrics.uptime.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <IntegrationModal
        isOpen={integrationModal.isOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        item={integrationModal.item}
        mode={integrationModal.mode}
        type={integrationModal.type}
      />
    </div>
  );
};
