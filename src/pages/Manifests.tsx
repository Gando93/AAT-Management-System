import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeatureFlag } from '../config/features';
import { ManifestModal } from './ManifestModal';
import type { TourManifest, DailyOperations, VehiclePreparation, CustomerCheckIn, TourDeparture, DailyReport } from '../types/manifests';
import { 
  ClipboardList, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Truck,
  MapPin,
  Calendar,
  Search,
  FileText,
  BarChart3
} from 'lucide-react';

interface ManifestsPageProps {
  manifests: TourManifest[];
  dailyOperations: DailyOperations[];
  vehiclePreparations: VehiclePreparation[];
  customerCheckIns: CustomerCheckIn[];
  tourDepartures: TourDeparture[];
  dailyReports: DailyReport[];
  onSaveManifest: (manifest: Omit<TourManifest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateManifest: (manifest: Omit<TourManifest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteManifest: (manifestId: string) => void;
  onSaveDailyOperations: (operations: Omit<DailyOperations, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateDailyOperations: (operations: Omit<DailyOperations, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteDailyOperations: (operationsId: string) => void;
  onSaveVehiclePreparation: (preparation: Omit<VehiclePreparation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateVehiclePreparation: (preparation: Omit<VehiclePreparation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteVehiclePreparation: (preparationId: string) => void;
  onCheckInCustomer: (checkIn: Omit<CustomerCheckIn, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateDeparture: (departure: Omit<TourDeparture, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onSaveDailyReport: (report: Omit<DailyReport, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const ManifestsPage: React.FC<ManifestsPageProps> = ({
  manifests,
  dailyOperations,
  vehiclePreparations,
  customerCheckIns,
  tourDepartures,
  dailyReports,
  onSaveManifest,
  onUpdateManifest,
  onDeleteManifest,
  onSaveDailyOperations,
  onUpdateDailyOperations,
  onDeleteDailyOperations,
  onSaveVehiclePreparation,
  onUpdateVehiclePreparation,
  onDeleteVehiclePreparation,
  onCheckInCustomer,
  onUpdateDeparture,
  onSaveDailyReport
}) => {
  const isManifestsEnabled = useFeatureFlag('FEATURE_MANIFESTS');
  const [activeTab, setActiveTab] = useState<'manifests' | 'operations' | 'preparations' | 'checkins' | 'departures' | 'reports'>('manifests');
  const [manifestModal, setManifestModal] = useState<{ 
    isOpen: boolean; 
    mode: 'create' | 'edit'; 
    type: 'manifest' | 'operations' | 'preparation' | 'checkin' | 'departure' | 'report';
    item?: TourManifest | DailyOperations | VehiclePreparation | CustomerCheckIn | TourDeparture | DailyReport;
  }>({ isOpen: false, mode: 'create', type: 'manifest' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'confirmed' | 'in_progress' | 'completed'>('all');

  if (!isManifestsEnabled) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Feature Not Available</h3>
        <p className="text-gray-500">The Manifests & Daily Operations feature is currently disabled.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': case 'completed': case 'active': return 'bg-green-100 text-green-800';
      case 'draft': case 'planning': case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': case 'boarding': return 'bg-blue-100 text-blue-800';
      case 'cancelled': case 'failed': case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'manifest': return <ClipboardList className="w-5 h-5" />;
      case 'operations': return <BarChart3 className="w-5 h-5" />;
      case 'preparation': return <Truck className="w-5 h-5" />;
      case 'checkin': return <CheckCircle className="w-5 h-5" />;
      case 'departure': return <MapPin className="w-5 h-5" />;
      case 'report': return <FileText className="w-5 h-5" />;
      default: return <ClipboardList className="w-5 h-5" />;
    }
  };

  const handleSave = (itemData: any) => {
    if (manifestModal.type === 'manifest') {
      if (manifestModal.mode === 'create') {
        onSaveManifest(itemData);
      } else {
        onUpdateManifest(itemData);
      }
    } else if (manifestModal.type === 'operations') {
      if (manifestModal.mode === 'create') {
        onSaveDailyOperations(itemData);
      } else {
        onUpdateDailyOperations(itemData);
      }
    } else if (manifestModal.type === 'preparation') {
      if (manifestModal.mode === 'create') {
        onSaveVehiclePreparation(itemData);
      } else {
        onUpdateVehiclePreparation(itemData);
      }
    } else if (manifestModal.type === 'checkin') {
      onCheckInCustomer(itemData);
    } else if (manifestModal.type === 'departure') {
      onUpdateDeparture(itemData);
    } else if (manifestModal.type === 'report') {
      onSaveDailyReport(itemData);
    }
    setManifestModal({ isOpen: false, mode: 'create', type: 'manifest' });
  };

  const totalManifests = manifests.length;
  const activeManifests = manifests.filter(m => m.status === 'confirmed' || m.status === 'in_progress').length;
  const completedToday = manifests.filter(m => m.status === 'completed' && new Date(m.tourDate).toDateString() === new Date().toDateString()).length;
  const totalPassengers = manifests.reduce((sum, m) => sum + m.totalPassengers, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manifests & Daily Operations</h1>
          <p className="text-gray-600">Manage tour manifests, daily operations, and customer check-ins</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setManifestModal({ isOpen: true, mode: 'create', type: 'manifest' })}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Manifest</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Manifests</p>
              <p className="text-2xl font-bold text-gray-900">{totalManifests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Tours</p>
              <p className="text-2xl font-bold text-gray-900">{activeManifests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Passengers</p>
              <p className="text-2xl font-bold text-gray-900">{totalPassengers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">{completedToday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'manifests', name: 'Tour Manifests', count: manifests.length },
              { id: 'operations', name: 'Daily Operations', count: dailyOperations.length },
              { id: 'preparations', name: 'Vehicle Prep', count: vehiclePreparations.length },
              { id: 'checkins', name: 'Check-ins', count: customerCheckIns.length },
              { id: 'departures', name: 'Departures', count: tourDepartures.length },
              { id: 'reports', name: 'Daily Reports', count: dailyReports.length }
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
                  placeholder="Search manifests..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'confirmed' | 'in_progress' | 'completed')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'manifests' && (
            <div className="space-y-4">
              {manifests.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tour manifests</h3>
                  <p className="text-gray-500 mb-6">Create your first tour manifest to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setManifestModal({ isOpen: true, mode: 'create', type: 'manifest' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Tour Manifest
                  </motion.button>
                </div>
              ) : (
                manifests.map(manifest => (
                  <div key={manifest.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('manifest')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{manifest.tourName}</h4>
                          <p className="text-sm text-gray-600">{new Date(manifest.tourDate).toLocaleDateString()} at {manifest.departureTime}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Guide: {manifest.guideName}</span>
                            <span>Vehicle: {manifest.vehicleName}</span>
                            <span>{manifest.totalPassengers}/{manifest.maxCapacity} passengers</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(manifest.status)}`}>
                          {manifest.status.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => setManifestModal({ isOpen: true, mode: 'edit', type: 'manifest', item: manifest })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteManifest(manifest.id)}
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

          {activeTab === 'operations' && (
            <div className="space-y-4">
              {dailyOperations.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No daily operations</h3>
                  <p className="text-gray-500 mb-6">Create your first daily operations record to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setManifestModal({ isOpen: true, mode: 'create', type: 'operations' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Daily Operations
                  </motion.button>
                </div>
              ) : (
                dailyOperations.map(operations => (
                  <div key={operations.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('operations')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Daily Operations - {new Date(operations.date).toLocaleDateString()}</h4>
                          <p className="text-sm text-gray-600">{operations.totalTours} tours, {operations.totalPassengers} passengers</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Status: {operations.status}</span>
                            <span>Completed: {operations.completedTours}</span>
                            <span>Weather: {operations.weather.condition}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(operations.status)}`}>
                          {operations.status}
                        </span>
                        <button
                          onClick={() => setManifestModal({ isOpen: true, mode: 'edit', type: 'operations', item: operations })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteDailyOperations(operations.id)}
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

          {activeTab === 'preparations' && (
            <div className="space-y-4">
              {vehiclePreparations.length === 0 ? (
                <div className="text-center py-12">
                  <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicle preparations</h3>
                  <p className="text-gray-500 mb-6">Vehicle preparations will appear here when scheduled</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setManifestModal({ isOpen: true, mode: 'create', type: 'preparation' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Schedule Preparation
                  </motion.button>
                </div>
              ) : (
                vehiclePreparations.map(preparation => (
                  <div key={preparation.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('preparation')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{preparation.vehicleName}</h4>
                          <p className="text-sm text-gray-600">Tour: {new Date(preparation.tourDate).toLocaleDateString()}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Fuel: {preparation.fuelLevel}%</span>
                            <span>Mileage: {preparation.mileage}</span>
                            <span>Condition: {preparation.exteriorCondition}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(preparation.status)}`}>
                          {preparation.status}
                        </span>
                        <button
                          onClick={() => setManifestModal({ isOpen: true, mode: 'edit', type: 'preparation', item: preparation })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteVehiclePreparation(preparation.id)}
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

          {activeTab === 'checkins' && (
            <div className="space-y-4">
              {customerCheckIns.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No customer check-ins</h3>
                  <p className="text-gray-500">Customer check-ins will appear here when customers check in</p>
                </div>
              ) : (
                customerCheckIns.map(checkIn => (
                  <div key={checkIn.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('checkin')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{checkIn.customerName}</h4>
                          <p className="text-sm text-gray-600">Checked in at {new Date(checkIn.checkInTime).toLocaleString()}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Method: {checkIn.checkInMethod}</span>
                            <span>Seat: {checkIn.seatAssignment || 'Not assigned'}</span>
                            <span>Waiver: {checkIn.waiverSigned ? 'Signed' : 'Pending'}</span>
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

          {activeTab === 'departures' && (
            <div className="space-y-4">
              {tourDepartures.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tour departures</h3>
                  <p className="text-gray-500">Tour departures will appear here when tours are scheduled</p>
                </div>
              ) : (
                tourDepartures.map(departure => (
                  <div key={departure.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('departure')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Tour Departure</h4>
                          <p className="text-sm text-gray-600">Scheduled: {new Date(departure.scheduledDeparture).toLocaleString()}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Status: {departure.status}</span>
                            <span>Passengers: {departure.passengersOnBoard}/{departure.passengersExpected}</span>
                            {departure.delayMinutes && <span>Delay: {departure.delayMinutes} min</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(departure.status)}`}>
                          {departure.status}
                        </span>
                        <button
                          onClick={() => setManifestModal({ isOpen: true, mode: 'edit', type: 'departure', item: departure })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
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
              {dailyReports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No daily reports</h3>
                  <p className="text-gray-500 mb-6">Create your first daily report to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setManifestModal({ isOpen: true, mode: 'create', type: 'report' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Daily Report
                  </motion.button>
                </div>
              ) : (
                dailyReports.map(report => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('report')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Daily Report - {new Date(report.date).toLocaleDateString()}</h4>
                          <p className="text-sm text-gray-600">{report.reportType} report</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Revenue: €{report.financialSummary.totalRevenue}</span>
                            <span>Issues: {report.issues.length}</span>
                            <span>Highlights: {report.highlights.length}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setManifestModal({ isOpen: true, mode: 'edit', type: 'report', item: report })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {/* Handle delete */}}
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

      {/* Manifest Modal */}
      <ManifestModal
        isOpen={manifestModal.isOpen}
        onClose={() => setManifestModal({ isOpen: false, mode: 'create', type: 'manifest' })}
        onSave={handleSave}
        item={manifestModal.item}
        mode={manifestModal.mode}
        type={manifestModal.type}
      />
    </div>
  );
};
