import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeatureFlag } from '../config/features';
import { ReportModal } from './ReportModal';
import { OpsOverview } from '../components/OpsOverview';
import type { Report, ReportTemplate, Dashboard, Analytics, ExportJob, ReportExecution } from '../types/reports';
import type { Booking, Tour, Vehicle, User } from '../types';
import { 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  Search,
  Calendar,
  TrendingUp,
  FileText,
  Share2,
  Clock,
  RefreshCw,
  Settings,
  Users,
  DollarSign,
  MapPin,
  Target
} from 'lucide-react';

interface ReportsPageProps {
  reports: Report[];
  reportTemplates: ReportTemplate[];
  dashboards: Dashboard[];
  analytics: Analytics[];
  exportJobs: ExportJob[];
  reportExecutions: ReportExecution[];
  bookings: Booking[];
  tours: Tour[];
  vehicles: Vehicle[];
  guides: User[];
  onSaveReport: (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onUpdateReport: (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onDeleteReport: (reportId: string) => void;
  onSaveTemplate: (template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onUpdateTemplate: (template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onDeleteTemplate: (templateId: string) => void;
  onSaveDashboard: (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onUpdateDashboard: (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onDeleteDashboard: (dashboardId: string) => void;
  onSaveAnalytics: (analytics: Omit<Analytics, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onUpdateAnalytics: (analytics: Omit<Analytics, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onDeleteAnalytics: (analyticsId: string) => void;
  onExecuteReport: (reportId: string) => boolean;
  onExportReport: (reportId: string, format: string) => boolean;
  onShareReport: (reportId: string) => boolean;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  reports,
  reportTemplates,
  dashboards,
  analytics,
  exportJobs,
  reportExecutions: _reportExecutions,
  bookings,
  tours,
  vehicles,
  guides,
  onSaveReport,
  onUpdateReport,
  onDeleteReport,
  onSaveTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onSaveDashboard,
  onUpdateDashboard,
  onDeleteDashboard,
  onSaveAnalytics,
  onUpdateAnalytics,
  onDeleteAnalytics,
  onExecuteReport,
  onExportReport,
  onShareReport
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'dashboards' | 'analytics' | 'templates' | 'exports'>('overview');
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; type: 'report' | 'template' | 'dashboard' | 'analytics'; item?: any }>({ 
    isOpen: false, 
    mode: 'create', 
    type: 'report' 
  });

  const isFeatureEnabled = useFeatureFlag('FEATURE_REPORTS');

  if (!isFeatureEnabled) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Reports & Analytics</h3>
          <p className="text-gray-500">This feature is currently disabled.</p>
        </div>
      </div>
    );
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreate = (type: 'report' | 'template' | 'dashboard' | 'analytics') => {
    setReportModal({ isOpen: true, mode: 'create', type });
  };

  const handleEdit = (type: 'report' | 'template' | 'dashboard' | 'analytics', item: any) => {
    setReportModal({ isOpen: true, mode: 'edit', type, item });
  };

  const handleCloseModal = () => {
    setReportModal({ isOpen: false, mode: 'create', type: 'report' });
  };

  const handleSave = (item: any) => {
    let success = false;
    
    switch (reportModal.type) {
      case 'report':
        success = reportModal.mode === 'create' ? onSaveReport(item) : onUpdateReport(item);
        break;
      case 'template':
        success = reportModal.mode === 'create' ? onSaveTemplate(item) : onUpdateTemplate(item);
        break;
      case 'dashboard':
        success = reportModal.mode === 'create' ? onSaveDashboard(item) : onUpdateDashboard(item);
        break;
      case 'analytics':
        success = reportModal.mode === 'create' ? onSaveAnalytics(item) : onUpdateAnalytics(item);
        break;
    }
    
    if (success) {
      handleCloseModal();
    }
  };

  const totalReports = reports.length;
  const activeReports = reports.filter(r => r.status === 'completed').length;
  // const _scheduledReports = reports.filter(r => r.schedule?.isActive).length;
  const totalExports = exportJobs.length;
  const completedExports = exportJobs.filter(e => e.status === 'completed').length;

  const tabs = [
    { id: 'overview', name: 'Ops Overview', icon: BarChart3, count: null },
    { id: 'reports', name: 'Reports', icon: FileText, count: totalReports },
    { id: 'dashboards', name: 'Dashboards', icon: BarChart3, count: dashboards.length },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp, count: analytics.length },
    { id: 'templates', name: 'Templates', icon: Settings, count: reportTemplates.length },
    { id: 'exports', name: 'Exports', icon: Download, count: totalExports }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Create, manage, and analyze business reports and dashboards</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCreate('report')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Report
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
              <p className="text-sm text-green-600">{activeReports} active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Dashboards</p>
              <p className="text-2xl font-bold text-gray-900">{dashboards.length}</p>
              <p className="text-sm text-gray-500">Interactive views</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Analytics</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.length}</p>
              <p className="text-sm text-gray-500">Real-time insights</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Exports</p>
              <p className="text-2xl font-bold text-gray-900">{totalExports}</p>
              <p className="text-sm text-green-600">{completedExports} completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                placeholder="Search reports..."
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
                <option value="booking">Booking</option>
                <option value="revenue">Revenue</option>
                <option value="customer">Customer</option>
                <option value="agent">Agent</option>
                <option value="tour">Tour</option>
                <option value="custom">Custom</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="generating">Generating</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <OpsOverview
              bookings={bookings}
              tours={tours}
              vehicles={vehicles}
              guides={guides}
              period={period}
              onPeriodChange={setPeriod}
            />
          )}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCreate('template')}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Settings className="w-4 h-4 mr-1 inline" />
                    Template
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCreate('dashboard')}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <BarChart3 className="w-4 h-4 mr-1 inline" />
                    Dashboard
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {report.type === 'booking' && <Calendar className="w-6 h-6 text-blue-600" />}
                          {report.type === 'revenue' && <DollarSign className="w-6 h-6 text-green-600" />}
                          {report.type === 'customer' && <Users className="w-6 h-6 text-purple-600" />}
                          {report.type === 'agent' && <Target className="w-6 h-6 text-orange-600" />}
                          {report.type === 'tour' && <MapPin className="w-6 h-6 text-indigo-600" />}
                          {report.type === 'custom' && <FileText className="w-6 h-6 text-gray-600" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{report.name}</h4>
                          <p className="text-sm text-gray-600">{report.type.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-500">{report.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          report.status === 'completed' ? 'bg-green-100 text-green-800' :
                          report.status === 'generating' ? 'bg-blue-100 text-blue-800' :
                          report.status === 'failed' ? 'bg-red-100 text-red-800' :
                          report.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status.replace('_', ' ')}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => onExecuteReport(report.id)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Execute Report"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onExportReport(report.id, report.format)}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="Export Report"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onShareReport(report.id)}
                            className="p-1 text-gray-400 hover:text-purple-600"
                            title="Share Report"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit('report', report)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Edit Report"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteReport(report.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Format:</span>
                        <span className="font-medium uppercase">{report.format}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Metrics:</span>
                        <span className="font-medium">{report.metrics.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Charts:</span>
                        <span className="font-medium">{report.charts.length}</span>
                      </div>
                      {report.lastGeneratedAt && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Generated:</span>
                          <span className="font-medium">
                            {new Date(report.lastGeneratedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {report.isPublic && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Public
                            </span>
                          )}
                          {report.isTemplate && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              Template
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dashboards' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Dashboards</h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCreate('dashboard')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Create Dashboard
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboards.map((dashboard) => (
                  <div key={dashboard.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{dashboard.name}</h4>
                          <p className="text-sm text-gray-600">{dashboard.description}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit('dashboard', dashboard)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteDashboard(dashboard.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Widgets:</span>
                        <span className="font-medium">{dashboard.widgets.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Refresh:</span>
                        <span className="font-medium">{dashboard.refreshInterval}s</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Public:</span>
                        <span className="font-medium">{dashboard.isPublic ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCreate('analytics')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Create Analytics
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analytics.map((analytic) => (
                  <div key={analytic.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{analytic.name}</h4>
                          <p className="text-sm text-gray-600">{analytic.description}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit('analytics', analytic)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteAnalytics(analytic.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{analytic.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Real-time:</span>
                        <span className="font-medium">{analytic.isRealTime ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Refresh:</span>
                        <span className="font-medium">{analytic.refreshInterval}s</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Templates</h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCreate('template')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Create Template
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportTemplates.map((template) => (
                  <div key={template.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Settings className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.description}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit('template', template)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTemplate(template.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{template.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{template.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Public:</span>
                        <span className="font-medium">{template.isPublic ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'exports' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Export Jobs</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {exportJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {reports.find(r => r.id === job.reportId)?.name || 'Unknown Report'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full uppercase">
                            {job.format}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            job.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(job.requestedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {job.fileSize ? `${(job.fileSize / 1024).toFixed(1)} KB` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {job.status === 'completed' && job.fileUrl && (
                            <button
                              onClick={() => window.open(job.fileUrl, '_blank')}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        item={reportModal.item}
        mode={reportModal.mode}
        type={reportModal.type}
      />
    </div>
  );
};
