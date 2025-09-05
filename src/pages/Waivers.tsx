import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeatureFlag } from '../config/features';
import { WaiverModal } from './WaiverModal';
import type { Waiver, WaiverSignature, WaiverTemplate, ComplianceReport, WaiverAnalytics, WaiverNotification, WaiverWorkflow, WaiverTranslation, WaiverAuditLog } from '../types/waivers';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Users,
  BarChart3,
  Eye,
  Search,
  Clock,
  Bell,
  Workflow,
  Languages,
  History
} from 'lucide-react';

interface WaiversPageProps {
  waivers: Waiver[];
  waiverSignatures: WaiverSignature[];
  waiverTemplates: WaiverTemplate[];
  complianceReports: ComplianceReport[];
  waiverAnalytics: WaiverAnalytics[];
  waiverNotifications: WaiverNotification[];
  waiverWorkflows: WaiverWorkflow[];
  waiverTranslations: WaiverTranslation[];
  waiverAuditLogs: WaiverAuditLog[];
  onSaveWaiver: (waiver: Omit<Waiver, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateWaiver: (waiver: Omit<Waiver, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteWaiver: (waiverId: string) => void;
  onSaveWaiverSignature: (signature: Omit<WaiverSignature, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateWaiverSignature: (signature: Omit<WaiverSignature, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteWaiverSignature: (signatureId: string) => void;
  onSaveWaiverTemplate: (template: Omit<WaiverTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateWaiverTemplate: (template: Omit<WaiverTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteWaiverTemplate: (templateId: string) => void;
  onGenerateComplianceReport: (report: Omit<ComplianceReport, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onSaveWaiverWorkflow: (workflow: Omit<WaiverWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateWaiverWorkflow: (workflow: Omit<WaiverWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteWaiverWorkflow: (workflowId: string) => void;
  onSendWaiverNotification: (notification: Omit<WaiverNotification, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const WaiversPage: React.FC<WaiversPageProps> = ({
  waivers,
  waiverSignatures,
  waiverTemplates,
  complianceReports,
  waiverAnalytics,
  waiverNotifications,
  waiverWorkflows,
  waiverTranslations: _waiverTranslations,
  waiverAuditLogs: _waiverAuditLogs,
  onSaveWaiver,
  onUpdateWaiver,
  onDeleteWaiver,
  onSaveWaiverSignature,
  onUpdateWaiverSignature,
  onDeleteWaiverSignature,
  onSaveWaiverTemplate,
  onUpdateWaiverTemplate,
  onDeleteWaiverTemplate,
  onGenerateComplianceReport,
  onSaveWaiverWorkflow,
  onUpdateWaiverWorkflow,
  onDeleteWaiverWorkflow,
  onSendWaiverNotification: _onSendWaiverNotification
}) => {
  const isWaiversEnabled = useFeatureFlag('FEATURE_WAIVERS');
  const [activeTab, setActiveTab] = useState<'waivers' | 'signatures' | 'templates' | 'reports' | 'analytics' | 'notifications' | 'workflows' | 'translations' | 'audit'>('waivers');
  const [waiverModal, setWaiverModal] = useState<{ 
    isOpen: boolean; 
    mode: 'create' | 'edit'; 
    type: 'waiver' | 'signature' | 'template' | 'workflow';
    item?: Waiver | WaiverSignature | WaiverTemplate | WaiverWorkflow;
  }>({ isOpen: false, mode: 'create', type: 'waiver' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'liability' | 'medical' | 'photo_video' | 'participation' | 'custom'>('all');

  if (!isWaiversEnabled) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Feature Not Available</h3>
        <p className="text-gray-500">The Waivers & Legal Documents feature is currently disabled.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'signed': case 'approved': case 'published': return 'bg-green-100 text-green-800';
      case 'pending': case 'draft': case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': case 'expired': case 'cancelled': case 'invalid': return 'bg-red-100 text-red-800';
      case 'sent': case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'waiver': return <FileText className="w-5 h-5" />;
      case 'signature': return <CheckCircle className="w-5 h-5" />;
      case 'template': return <FileText className="w-5 h-5" />;
      case 'report': return <BarChart3 className="w-5 h-5" />;
      case 'analytics': return <BarChart3 className="w-5 h-5" />;
      case 'notification': return <Bell className="w-5 h-5" />;
      case 'workflow': return <Workflow className="w-5 h-5" />;
      case 'translation': return <Languages className="w-5 h-5" />;
      case 'audit': return <History className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const handleSave = (itemData: any) => {
    if (waiverModal.type === 'waiver') {
      if (waiverModal.mode === 'create') {
        onSaveWaiver(itemData);
      } else {
        onUpdateWaiver(itemData);
      }
    } else if (waiverModal.type === 'signature') {
      if (waiverModal.mode === 'create') {
        onSaveWaiverSignature(itemData);
      } else {
        onUpdateWaiverSignature(itemData);
      }
    } else if (waiverModal.type === 'template') {
      if (waiverModal.mode === 'create') {
        onSaveWaiverTemplate(itemData);
      } else {
        onUpdateWaiverTemplate(itemData);
      }
    } else if (waiverModal.type === 'workflow') {
      if (waiverModal.mode === 'create') {
        onSaveWaiverWorkflow(itemData);
      } else {
        onUpdateWaiverWorkflow(itemData);
      }
    }
    setWaiverModal({ isOpen: false, mode: 'create', type: 'waiver' });
  };

  const totalWaivers = waivers.length;
  const activeWaivers = waivers.filter(w => w.isActive).length;
  const signedWaivers = waiverSignatures.filter(s => s.status === 'signed').length;
  const pendingSignatures = waiverSignatures.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waivers & Legal Documents</h1>
          <p className="text-gray-600">Manage digital waivers, legal documents, and compliance tracking</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setWaiverModal({ isOpen: true, mode: 'create', type: 'waiver' })}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Waiver</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Waivers</p>
              <p className="text-2xl font-bold text-gray-900">{totalWaivers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Waivers</p>
              <p className="text-2xl font-bold text-gray-900">{activeWaivers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Signed Waivers</p>
              <p className="text-2xl font-bold text-gray-900">{signedWaivers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending Signatures</p>
              <p className="text-2xl font-bold text-gray-900">{pendingSignatures}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'waivers', name: 'Waivers', count: waivers.length },
              { id: 'signatures', name: 'Signatures', count: waiverSignatures.length },
              { id: 'templates', name: 'Templates', count: waiverTemplates.length },
              { id: 'reports', name: 'Compliance', count: complianceReports.length },
              { id: 'analytics', name: 'Analytics', count: waiverAnalytics.length },
              { id: 'notifications', name: 'Notifications', count: waiverNotifications.length },
              { id: 'workflows', name: 'Workflows', count: waiverWorkflows.length },
              { id: 'translations', name: 'Translations', count: 0 },
              { id: 'audit', name: 'Audit Log', count: 0 }
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
                  placeholder="Search waivers..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'expired')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'liability' | 'medical' | 'photo_video' | 'participation' | 'custom')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="liability">Liability</option>
                <option value="medical">Medical</option>
                <option value="photo_video">Photo/Video</option>
                <option value="participation">Participation</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'waivers' && (
            <div className="space-y-4">
              {waivers.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No waivers</h3>
                  <p className="text-gray-500 mb-6">Create your first waiver to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setWaiverModal({ isOpen: true, mode: 'create', type: 'waiver' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Waiver
                  </motion.button>
                </div>
              ) : (
                waivers.map(waiver => (
                  <div key={waiver.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('waiver')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{waiver.title}</h4>
                          <p className="text-sm text-gray-600">{waiver.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Type: {waiver.type.replace('_', ' ')}</span>
                            <span>Version: {waiver.version}</span>
                            <span>Language: {waiver.language}</span>
                            <span>Category: {waiver.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(waiver.isActive ? 'active' : 'inactive')}`}>
                          {waiver.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => setWaiverModal({ isOpen: true, mode: 'edit', type: 'waiver', item: waiver })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteWaiver(waiver.id)}
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

          {activeTab === 'signatures' && (
            <div className="space-y-4">
              {waiverSignatures.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No signatures</h3>
                  <p className="text-gray-500">Customer signatures will appear here when waivers are signed</p>
                </div>
              ) : (
                waiverSignatures.map(signature => (
                  <div key={signature.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('signature')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{signature.customerName}</h4>
                          <p className="text-sm text-gray-600">{signature.tourName} - {new Date(signature.tourDate).toLocaleDateString()}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Signed: {new Date(signature.signedAt).toLocaleString()}</span>
                            <span>Method: {signature.signatureMethod}</span>
                            <span>IP: {signature.ipAddress}</span>
                            {signature.witnessName && <span>Witness: {signature.witnessName}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(signature.status)}`}>
                          {signature.status}
                        </span>
                        <button
                          onClick={() => setWaiverModal({ isOpen: true, mode: 'edit', type: 'signature', item: signature })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteWaiverSignature(signature.id)}
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

          {activeTab === 'templates' && (
            <div className="space-y-4">
              {waiverTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No templates</h3>
                  <p className="text-gray-500 mb-6">Create your first waiver template to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setWaiverModal({ isOpen: true, mode: 'create', type: 'template' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Template
                  </motion.button>
                </div>
              ) : (
                waiverTemplates.map(template => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('template')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Type: {template.templateType}</span>
                            <span>Category: {template.category}</span>
                            <span>Language: {template.language}</span>
                            <span>Sections: {template.sections.length}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(template.isActive ? 'active' : 'inactive')}`}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => setWaiverModal({ isOpen: true, mode: 'edit', type: 'template', item: template })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteWaiverTemplate(template.id)}
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

          {activeTab === 'reports' && (
            <div className="space-y-4">
              {complianceReports.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No compliance reports</h3>
                  <p className="text-gray-500 mb-6">Generate your first compliance report to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onGenerateComplianceReport({
                      reportName: 'Monthly Compliance Report',
                      reportType: 'waiver_compliance',
                      period: {
                        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        endDate: new Date().toISOString().split('T')[0]
                      },
                      jurisdiction: 'US-CA',
                      totalWaivers: 0,
                      signedWaivers: 0,
                      pendingWaivers: 0,
                      expiredWaivers: 0,
                      complianceRate: 0,
                      issues: [],
                      recommendations: [],
                      generatedAt: new Date().toISOString(),
                      generatedBy: '1',
                      status: 'draft'
                    })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Generate Report
                  </motion.button>
                </div>
              ) : (
                complianceReports.map(report => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('report')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{report.reportName}</h4>
                          <p className="text-sm text-gray-600">{report.reportType.replace('_', ' ')} - {report.jurisdiction}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Period: {new Date(report.period.startDate).toLocaleDateString()} - {new Date(report.period.endDate).toLocaleDateString()}</span>
                            <span>Compliance: {report.complianceRate}%</span>
                            <span>Issues: {report.issues.length}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <button
                          onClick={() => {/* View report */}}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              {waiverAnalytics.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data</h3>
                  <p className="text-gray-500">Analytics will appear here as waivers are used</p>
                </div>
              ) : (
                waiverAnalytics.map(analytics => (
                  <div key={analytics.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('analytics')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{analytics.waiverName} - {analytics.date}</h4>
                          <p className="text-sm text-gray-600">Completion Rate: {analytics.completionRate}%</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Presented: {analytics.totalPresented}</span>
                            <span>Signed: {analytics.totalSigned}</span>
                            <span>Declined: {analytics.totalDeclined}</span>
                            <span>Avg Time: {analytics.averageSigningTime}s</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {/* View detailed analytics */}}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {waiverNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-500">Waiver notifications will appear here when sent</p>
                </div>
              ) : (
                waiverNotifications.map(notification => (
                  <div key={notification.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('notification')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Type: {notification.type.replace('_', ' ')}</span>
                            <span>Priority: {notification.priority}</span>
                            <span>Recipients: {notification.recipientIds.length}</span>
                            <span>Sent: {notification.sentAt ? new Date(notification.sentAt).toLocaleString() : 'Pending'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(notification.status)}`}>
                          {notification.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'workflows' && (
            <div className="space-y-4">
              {waiverWorkflows.length === 0 ? (
                <div className="text-center py-12">
                  <Workflow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows</h3>
                  <p className="text-gray-500 mb-6">Create your first waiver workflow to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setWaiverModal({ isOpen: true, mode: 'create', type: 'workflow' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Workflow
                  </motion.button>
                </div>
              ) : (
                waiverWorkflows.map(workflow => (
                  <div key={workflow.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('workflow')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{workflow.name}</h4>
                          <p className="text-sm text-gray-600">{workflow.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Trigger: {workflow.trigger.replace('_', ' ')}</span>
                            <span>Priority: {workflow.priority}</span>
                            <span>Active: {workflow.isActive ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(workflow.isActive ? 'active' : 'inactive')}`}>
                          {workflow.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => setWaiverModal({ isOpen: true, mode: 'edit', type: 'workflow', item: workflow })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteWaiverWorkflow(workflow.id)}
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

          {activeTab === 'translations' && (
            <div className="text-center py-12">
              <Languages className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Translations</h3>
              <p className="text-gray-500">Multi-language support for waivers will be available here</p>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Audit Log</h3>
              <p className="text-gray-500">Audit trail for waiver activities will be available here</p>
            </div>
          )}
        </div>
      </div>

      {/* Waiver Modal */}
      <WaiverModal
        isOpen={waiverModal.isOpen}
        onClose={() => setWaiverModal({ isOpen: false, mode: 'create', type: 'waiver' })}
        onSave={handleSave}
        item={waiverModal.item}
        mode={waiverModal.mode}
        type={waiverModal.type}
      />
    </div>
  );
};
