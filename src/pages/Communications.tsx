import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeatureFlag } from '../config/features';
// import { CommunicationModal } from '../components/CommunicationModal';
import type { EmailTemplate, SMSMessage, CommunicationLog, NotificationRule, MarketingCampaign } from '../types/communications';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  AlertTriangle,
  Search,
  FileText,
  Users,
  Settings,
  Eye,
  Clock
} from 'lucide-react';

interface CommunicationsPageProps {
  emailTemplates: EmailTemplate[];
  smsMessages: SMSMessage[];
  communicationLogs: CommunicationLog[];
  notificationRules: NotificationRule[];
  marketingCampaigns: MarketingCampaign[];
  onSaveEmailTemplate: (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateEmailTemplate: (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteEmailTemplate: (templateId: string) => void;
  onSendSMS: (message: Omit<SMSMessage, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onSaveNotificationRule: (rule: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNotificationRule: (rule: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteNotificationRule: (ruleId: string) => void;
  onSaveMarketingCampaign: (campaign: Omit<MarketingCampaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateMarketingCampaign: (campaign: Omit<MarketingCampaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteMarketingCampaign: (campaignId: string) => void;
  onSendCampaign: (campaignId: string) => void;
}

export const CommunicationsPage: React.FC<CommunicationsPageProps> = ({
  emailTemplates,
  smsMessages,
  communicationLogs,
  notificationRules,
  marketingCampaigns,
  onSaveEmailTemplate,
  onUpdateEmailTemplate,
  onDeleteEmailTemplate,
  onSendSMS,
  onSaveNotificationRule,
  onUpdateNotificationRule,
  onDeleteNotificationRule,
  onSaveMarketingCampaign,
  onUpdateMarketingCampaign,
  onDeleteMarketingCampaign,
  onSendCampaign
}) => {
  const isCommunicationsEnabled = useFeatureFlag('FEATURE_COMMS');
  const [activeTab, setActiveTab] = useState<'templates' | 'messages' | 'logs' | 'rules' | 'campaigns'>('templates');
  const [communicationModal, setCommunicationModal] = useState<{ 
    isOpen: boolean; 
    mode: 'create' | 'edit'; 
    type: 'email_template' | 'sms_message' | 'notification_rule' | 'marketing_campaign';
    item?: EmailTemplate | SMSMessage | NotificationRule | MarketingCampaign;
  }>({ isOpen: false, mode: 'create', type: 'email_template' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  if (!isCommunicationsEnabled) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Feature Not Available</h3>
        <p className="text-gray-500">The Communications feature is currently disabled.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'sent': case 'delivered': case 'read': return 'bg-green-100 text-green-800';
      case 'pending': case 'scheduled': case 'sending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': case 'failed': case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email_template': case 'email': return <Mail className="w-5 h-5" />;
      case 'sms_message': case 'sms': return <MessageSquare className="w-5 h-5" />;
      case 'notification_rule': return <Settings className="w-5 h-5" />;
      case 'marketing_campaign': return <Users className="w-5 h-5" />;
      case 'call': return <Phone className="w-5 h-5" />;
      case 'in_person': return <Eye className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const handleSave = (itemData: any) => {
    if (communicationModal.type === 'email_template') {
      if (communicationModal.mode === 'create') {
        onSaveEmailTemplate(itemData);
      } else {
        onUpdateEmailTemplate(itemData);
      }
    } else if (communicationModal.type === 'sms_message') {
      onSendSMS(itemData);
    } else if (communicationModal.type === 'notification_rule') {
      if (communicationModal.mode === 'create') {
        onSaveNotificationRule(itemData);
      } else {
        onUpdateNotificationRule(itemData);
      }
    } else if (communicationModal.type === 'marketing_campaign') {
      if (communicationModal.mode === 'create') {
        onSaveMarketingCampaign(itemData);
      } else {
        onUpdateMarketingCampaign(itemData);
      }
    }
    setCommunicationModal({ isOpen: false, mode: 'create', type: 'email_template' });
  };

  const totalEmails = communicationLogs.filter(log => log.type === 'email').length;
  const totalSMS = communicationLogs.filter(log => log.type === 'sms').length;
  const pendingMessages = smsMessages.filter(msg => msg.status === 'pending').length;
  const activeCampaigns = marketingCampaigns.filter(campaign => campaign.status === 'sending' || campaign.status === 'scheduled').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-600">Manage email templates, SMS messages, and customer communications</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCommunicationModal({ isOpen: true, mode: 'create', type: 'email_template' })}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Communication</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900">{totalEmails}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">SMS Sent</p>
              <p className="text-2xl font-bold text-gray-900">{totalSMS}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingMessages}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{activeCampaigns}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'templates', name: 'Email Templates', count: emailTemplates.length },
              { id: 'messages', name: 'SMS Messages', count: smsMessages.length },
              { id: 'logs', name: 'Communication Logs', count: communicationLogs.length },
              { id: 'rules', name: 'Notification Rules', count: notificationRules.length },
              { id: 'campaigns', name: 'Marketing Campaigns', count: marketingCampaigns.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search communications..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              {emailTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No email templates</h3>
                  <p className="text-gray-500 mb-6">Create your first email template to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCommunicationModal({ isOpen: true, mode: 'create', type: 'email_template' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Email Template
                  </motion.button>
                </div>
              ) : (
                emailTemplates.map(template => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('email_template')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.subject}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>{template.type}</span>
                            <span>{template.language}</span>
                            <span>{template.variables.length} variables</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(template.isActive ? 'active' : 'inactive')}`}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => setCommunicationModal({ isOpen: true, mode: 'edit', type: 'email_template', item: template })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteEmailTemplate(template.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-4">
              {smsMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No SMS messages</h3>
                  <p className="text-gray-500 mb-6">SMS messages will appear here when sent</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCommunicationModal({ isOpen: true, mode: 'create', type: 'sms_message' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send SMS
                  </motion.button>
                </div>
              ) : (
                smsMessages.map(message => (
                  <div key={message.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('sms_message')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{message.recipient}</h4>
                          <p className="text-sm text-gray-600">{message.content}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>{message.type}</span>
                            <span>{message.sentAt ? new Date(message.sentAt).toLocaleString() : 'Not sent'}</span>
                            {message.cost && <span>€{message.cost.toFixed(2)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                          {message.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              {communicationLogs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No communication logs</h3>
                  <p className="text-gray-500">Communication logs will appear here when messages are sent</p>
                </div>
              ) : (
                communicationLogs.map(log => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          {getTypeIcon(log.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{log.customerName}</h4>
                          <p className="text-sm text-gray-600">{log.subject || log.content.substring(0, 100)}...</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>{log.type}</span>
                            <span>{log.direction}</span>
                            <span>{new Date(log.sentAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              {notificationRules.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notification rules</h3>
                  <p className="text-gray-500 mb-6">Create your first notification rule to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCommunicationModal({ isOpen: true, mode: 'create', type: 'notification_rule' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Notification Rule
                  </motion.button>
                </div>
              ) : (
                notificationRules.map(rule => (
                  <div key={rule.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('notification_rule')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>{rule.trigger}</span>
                            <span>Priority: {rule.priority}</span>
                            <span>{rule.actions.email ? 'Email' : ''} {rule.actions.sms ? 'SMS' : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(rule.isActive ? 'active' : 'inactive')}`}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => setCommunicationModal({ isOpen: true, mode: 'edit', type: 'notification_rule', item: rule })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteNotificationRule(rule.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="space-y-4">
              {marketingCampaigns.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No marketing campaigns</h3>
                  <p className="text-gray-500 mb-6">Create your first marketing campaign to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCommunicationModal({ isOpen: true, mode: 'create', type: 'marketing_campaign' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Campaign
                  </motion.button>
                </div>
              ) : (
                marketingCampaigns.map(campaign => (
                  <div key={campaign.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('marketing_campaign')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                          <p className="text-sm text-gray-600">{campaign.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>{campaign.type}</span>
                            <span>{campaign.stats.totalSent} sent</span>
                            <span>{campaign.stats.opened} opened</span>
                            <span>{campaign.schedule.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                        {campaign.status === 'draft' && (
                          <button
                            onClick={() => onSendCampaign(campaign.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Send Campaign"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setCommunicationModal({ isOpen: true, mode: 'edit', type: 'marketing_campaign', item: campaign })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteMarketingCampaign(campaign.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Communication Modal */}
      {/* <CommunicationModal
        isOpen={communicationModal.isOpen}
        onClose={() => setCommunicationModal({ isOpen: false, mode: 'create', type: 'email_template' })}
        onSave={handleSave}
        item={communicationModal.item}
        mode={communicationModal.mode}
        type={communicationModal.type}
      /> */}
    </div>
  );
};
