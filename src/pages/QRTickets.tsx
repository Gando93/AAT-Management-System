import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeatureFlag } from '../config/features';
import { QRTicketModal } from './QRTicketModal';
import type { QRTicket, CheckInSession, CheckInEvent, QRCodeConfig, CheckInAnalytics, MobileCheckInApp, CustomerSelfService, QRValidationRule, OfflineCheckInData, QRCodeTemplate } from '../types/qrTickets';
import { 
  QrCode, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Smartphone,
  Upload,
  BarChart3,
  Settings,
  Eye,
  Search,
  Smartphone as MobileIcon,
  WifiOff,
  X
} from 'lucide-react';

interface QRTicketsPageProps {
  qrTickets: QRTicket[];
  checkInSessions: CheckInSession[];
  checkInEvents: CheckInEvent[];
  qrCodeConfigs: QRCodeConfig[];
  checkInAnalytics: CheckInAnalytics[];
  mobileApps: MobileCheckInApp[];
  selfServicePortals: CustomerSelfService[];
  validationRules: QRValidationRule[];
  offlineData: OfflineCheckInData[];
  qrTemplates: QRCodeTemplate[];
  onSaveQRTicket: (ticket: Omit<QRTicket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateQRTicket: (ticket: Omit<QRTicket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteQRTicket: (ticketId: string) => void;
  onSaveCheckInSession: (session: Omit<CheckInSession, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateCheckInSession: (session: Omit<CheckInSession, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteCheckInSession: (sessionId: string) => void;
  onProcessCheckIn: (event: Omit<CheckInEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onSaveQRConfig: (config: Omit<QRCodeConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateQRConfig: (config: Omit<QRCodeConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteQRConfig: (configId: string) => void;
  onGenerateQRCode: (ticketId: string) => void;
  onValidateQRCode: (qrCode: string) => Promise<QRTicket | null>;
  onSyncOfflineData: () => void;
}

export const QRTicketsPage: React.FC<QRTicketsPageProps> = ({
  qrTickets,
  checkInSessions,
  checkInEvents,
  qrCodeConfigs,
  checkInAnalytics,
  mobileApps,
  selfServicePortals,
  validationRules: _validationRules,
  offlineData,
  qrTemplates: _qrTemplates,
  onSaveQRTicket,
  onUpdateQRTicket,
  onDeleteQRTicket,
  onSaveCheckInSession,
  onUpdateCheckInSession,
  onDeleteCheckInSession,
  onProcessCheckIn: _onProcessCheckIn,
  onSaveQRConfig,
  onUpdateQRConfig,
  onDeleteQRConfig,
  onGenerateQRCode,
  onValidateQRCode: _onValidateQRCode,
  onSyncOfflineData
}) => {
  const isQRTicketsEnabled = useFeatureFlag('FEATURE_QR_CHECKIN');
  const [activeTab, setActiveTab] = useState<'tickets' | 'sessions' | 'events' | 'config' | 'analytics' | 'mobile' | 'selfservice' | 'offline'>('tickets');
  const [qrModal, setQrModal] = useState<{ 
    isOpen: boolean; 
    mode: 'create' | 'edit'; 
    type: 'ticket' | 'session' | 'config' | 'template';
    item?: QRTicket | CheckInSession | QRCodeConfig | QRCodeTemplate;
  }>({ isOpen: false, mode: 'create', type: 'ticket' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'used' | 'expired' | 'cancelled'>('all');
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  if (!isQRTicketsEnabled) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Feature Not Available</h3>
        <p className="text-gray-500">The QR E-tickets & Check-in feature is currently disabled.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'scheduled': case 'synced': return 'bg-green-100 text-green-800';
      case 'used': case 'completed': case 'checked_in': return 'bg-blue-100 text-blue-800';
      case 'expired': case 'cancelled': case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ticket': return <QrCode className="w-5 h-5" />;
      case 'session': return <Users className="w-5 h-5" />;
      case 'event': return <CheckCircle className="w-5 h-5" />;
      case 'config': return <Settings className="w-5 h-5" />;
      case 'analytics': return <BarChart3 className="w-5 h-5" />;
      case 'mobile': return <MobileIcon className="w-5 h-5" />;
      case 'selfservice': return <Smartphone className="w-5 h-5" />;
      case 'offline': return <WifiOff className="w-5 h-5" />;
      default: return <QrCode className="w-5 h-5" />;
    }
  };

  const handleSave = (itemData: any) => {
    if (qrModal.type === 'ticket') {
      if (qrModal.mode === 'create') {
        onSaveQRTicket(itemData);
      } else {
        onUpdateQRTicket(itemData);
      }
    } else if (qrModal.type === 'session') {
      if (qrModal.mode === 'create') {
        onSaveCheckInSession(itemData);
      } else {
        onUpdateCheckInSession(itemData);
      }
    } else if (qrModal.type === 'config') {
      if (qrModal.mode === 'create') {
        onSaveQRConfig(itemData);
      } else {
        onUpdateQRConfig(itemData);
      }
    }
    setQrModal({ isOpen: false, mode: 'create', type: 'ticket' });
  };

  const totalTickets = qrTickets.length;
  const activeTickets = qrTickets.filter(t => t.status === 'active').length;
  const usedTickets = qrTickets.filter(t => t.status === 'used').length;
  const pendingOfflineData = offlineData.filter(d => d.syncStatus === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR E-tickets & Check-in</h1>
          <p className="text-gray-600">Manage QR tickets, check-in sessions, and mobile check-in capabilities</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setQrScannerOpen(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setQrModal({ isOpen: true, mode: 'create', type: 'ticket' })}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <QrCode className="w-4 h-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{activeTickets}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Used Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{usedTickets}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <WifiOff className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending Sync</p>
              <p className="text-2xl font-bold text-gray-900">{pendingOfflineData}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'tickets', name: 'QR Tickets', count: qrTickets.length },
              { id: 'sessions', name: 'Check-in Sessions', count: checkInSessions.length },
              { id: 'events', name: 'Check-in Events', count: checkInEvents.length },
              { id: 'config', name: 'QR Config', count: qrCodeConfigs.length },
              { id: 'analytics', name: 'Analytics', count: checkInAnalytics.length },
              { id: 'mobile', name: 'Mobile Apps', count: mobileApps.length },
              { id: 'selfservice', name: 'Self Service', count: selfServicePortals.length },
              { id: 'offline', name: 'Offline Data', count: offlineData.length }
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
                  placeholder="Search tickets..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'used' | 'expired' | 'cancelled')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="used">Used</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex space-x-2 mt-4 sm:mt-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSyncOfflineData}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Sync Offline</span>
              </motion.button>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              {qrTickets.length === 0 ? (
                <div className="text-center py-12">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No QR tickets</h3>
                  <p className="text-gray-500 mb-6">Create your first QR ticket to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQrModal({ isOpen: true, mode: 'create', type: 'ticket' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create QR Ticket
                  </motion.button>
                </div>
              ) : (
                qrTickets.map(ticket => (
                  <div key={ticket.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('ticket')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{ticket.customerName}</h4>
                          <p className="text-sm text-gray-600">{ticket.tourName} - {ticket.tourDate}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Ticket: {ticket.ticketNumber}</span>
                            <span>Seat: {ticket.seatNumber || 'Not assigned'}</span>
                            <span>Time: {ticket.departureTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <button
                          onClick={() => onGenerateQRCode(ticket.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          title="Generate QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setQrModal({ isOpen: true, mode: 'edit', type: 'ticket', item: ticket })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteQRTicket(ticket.id)}
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

          {activeTab === 'sessions' && (
            <div className="space-y-4">
              {checkInSessions.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No check-in sessions</h3>
                  <p className="text-gray-500 mb-6">Create your first check-in session to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQrModal({ isOpen: true, mode: 'create', type: 'session' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Check-in Session
                  </motion.button>
                </div>
              ) : (
                checkInSessions.map(session => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('session')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{session.sessionName}</h4>
                          <p className="text-sm text-gray-600">{session.tourName} - {session.tourDate}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Time: {session.startTime} - {session.endTime}</span>
                            <span>Location: {session.checkInLocation}</span>
                            <span>Checked in: {session.checkedInTickets}/{session.totalTickets}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                        <button
                          onClick={() => setQrModal({ isOpen: true, mode: 'edit', type: 'session', item: session })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCheckInSession(session.id)}
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

          {activeTab === 'events' && (
            <div className="space-y-4">
              {checkInEvents.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No check-in events</h3>
                  <p className="text-gray-500">Check-in events will appear here when customers check in</p>
                </div>
              ) : (
                checkInEvents.map(event => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('event')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{event.customerName}</h4>
                          <p className="text-sm text-gray-600">Checked in at {new Date(event.checkInTime).toLocaleString()}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Method: {event.checkInMethod}</span>
                            <span>Location: {event.checkInLocation}</span>
                            <span>Staff: {event.staffMemberName}</span>
                            {event.isLate && <span className="text-red-600">Late: {event.lateMinutes} min</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Checked In
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-4">
              {qrCodeConfigs.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No QR configurations</h3>
                  <p className="text-gray-500 mb-6">Create your first QR code configuration to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQrModal({ isOpen: true, mode: 'create', type: 'config' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create QR Config
                  </motion.button>
                </div>
              ) : (
                qrCodeConfigs.map(config => (
                  <div key={config.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('config')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{config.name}</h4>
                          <p className="text-sm text-gray-600">Size: {config.size}px, Error Level: {config.errorCorrectionLevel}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Foreground: {config.foregroundColor}</span>
                            <span>Background: {config.backgroundColor}</span>
                            <span>Margin: {config.margin}px</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(config.isActive ? 'active' : 'inactive')}`}>
                          {config.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => setQrModal({ isOpen: true, mode: 'edit', type: 'config', item: config })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteQRConfig(config.id)}
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

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              {checkInAnalytics.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data</h3>
                  <p className="text-gray-500">Analytics will appear here as check-ins are processed</p>
                </div>
              ) : (
                checkInAnalytics.map(analytics => (
                  <div key={analytics.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('analytics')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{analytics.tourName} - {analytics.date}</h4>
                          <p className="text-sm text-gray-600">Check-in Rate: {analytics.checkInRate}%</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Total: {analytics.totalTickets}</span>
                            <span>Checked In: {analytics.checkedInTickets}</span>
                            <span>No Shows: {analytics.noShowTickets}</span>
                            <span>Avg Time: {analytics.averageCheckInTime}s</span>
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

          {activeTab === 'mobile' && (
            <div className="space-y-4">
              {mobileApps.length === 0 ? (
                <div className="text-center py-12">
                  <MobileIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No mobile apps</h3>
                  <p className="text-gray-500">Mobile check-in apps will appear here when configured</p>
                </div>
              ) : (
                mobileApps.map(app => (
                  <div key={app.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('mobile')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{app.appName}</h4>
                          <p className="text-sm text-gray-600">Version {app.version}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Status: {app.status}</span>
                            <span>Last Sync: {new Date(app.lastSync).toLocaleString()}</span>
                            <span>Offline Mode: {app.features.offlineMode ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'selfservice' && (
            <div className="space-y-4">
              {selfServicePortals.length === 0 ? (
                <div className="text-center py-12">
                  <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No self-service portals</h3>
                  <p className="text-gray-500">Customer self-service portals will appear here when created</p>
                </div>
              ) : (
                selfServicePortals.map(portal => (
                  <div key={portal.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('selfservice')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{portal.customerName}</h4>
                          <p className="text-sm text-gray-600">{portal.tourName} - {portal.tourDate}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Access Code: {portal.accessCode}</span>
                            <span>Access Count: {portal.accessCount}</span>
                            <span>Last Accessed: {new Date(portal.lastAccessed).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(portal.isActive ? 'active' : 'inactive')}`}>
                          {portal.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'offline' && (
            <div className="space-y-4">
              {offlineData.length === 0 ? (
                <div className="text-center py-12">
                  <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No offline data</h3>
                  <p className="text-gray-500">Offline check-in data will appear here when collected</p>
                </div>
              ) : (
                offlineData.map(data => (
                  <div key={data.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('offline')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{data.customerData.name}</h4>
                          <p className="text-sm text-gray-600">{data.tourData.name} - {data.tourData.date}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Check-in: {new Date(data.checkInData.time).toLocaleString()}</span>
                            <span>Method: {data.checkInData.method}</span>
                            <span>Staff: {data.checkInData.staffMember}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(data.syncStatus)}`}>
                          {data.syncStatus}
                        </span>
                        <span className="text-xs text-gray-500">
                          Attempts: {data.syncAttempts}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {qrScannerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">QR Code Scanner</h3>
                <button
                  onClick={() => setQrScannerOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center py-8">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">QR Scanner functionality would be implemented here</p>
                <p className="text-sm text-gray-500 mt-2">This would integrate with device camera for QR code scanning</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* QR Modal */}
      <QRTicketModal
        isOpen={qrModal.isOpen}
        onClose={() => setQrModal({ isOpen: false, mode: 'create', type: 'ticket' })}
        onSave={handleSave}
        item={qrModal.item}
        mode={qrModal.mode}
        type={qrModal.type}
      />
    </div>
  );
};
