import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeatureFlag } from '../config/features';
import { GuideModal } from '../components/GuideModal';
import type { Guide } from '../types/guides';
import { 
  User, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface GuidesPageProps {
  guides: Guide[];
  onSave: (guide: Omit<Guide, 'id'>) => void;
  onUpdate: (guide: Omit<Guide, 'id'>) => void;
  onDelete: (guideId: string) => void;
}

export const GuidesPage: React.FC<GuidesPageProps> = ({
  guides,
  onSave,
  onUpdate,
  onDelete
}) => {
  const isGuidesEnabled = useFeatureFlag('FEATURE_GUIDES');
  const [guideModal, setGuideModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; guide?: Guide }>({ 
    isOpen: false, 
    mode: 'create' 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'on-leave'>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');

  if (!isGuidesEnabled) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Feature Not Available</h3>
        <p className="text-gray-500">The Guides feature is currently disabled.</p>
      </div>
    );
  }

  // Get unique languages for filter
  const allLanguages = Array.from(new Set(guides.flatMap(guide => guide.languages)));

  // Filter guides
  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || guide.status === statusFilter;
    const matchesLanguage = languageFilter === 'all' || guide.languages.includes(languageFilter);
    
    return matchesSearch && matchesStatus && matchesLanguage;
  });

  const getStatusColor = (status: Guide['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCertificationStatus = (cert: { expiryDate: string }) => {
    const expiry = new Date(cert.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', color: 'text-red-600' };
    if (daysUntilExpiry <= 30) return { status: 'expiring', color: 'text-yellow-600' };
    return { status: 'valid', color: 'text-green-600' };
  };

  const handleSave = (guideData: Omit<Guide, 'id'>) => {
    if (guideModal.mode === 'create') {
      onSave(guideData);
    } else {
      onUpdate(guideData);
    }
    setGuideModal({ isOpen: false, mode: 'create' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guides & Staff</h1>
          <p className="text-gray-600">Manage your tour guides and staff members</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setGuideModal({ isOpen: true, mode: 'create' })}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Guide</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'on-leave')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Languages</option>
              {allLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Guides</p>
              <p className="text-2xl font-bold text-gray-900">{guides.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {guides.filter(g => g.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-gray-900">
                {guides.filter(g => g.status === 'on-leave').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">
                {guides.filter(g => g.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Guides List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Guides ({filteredGuides.length})
          </h3>
        </div>
        
        <div className="p-6">
          {filteredGuides.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No guides found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all' || languageFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first guide'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && languageFilter === 'all' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGuideModal({ isOpen: true, mode: 'create' })}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Guide
                </motion.button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredGuides.map(guide => (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{guide.name}</h4>
                        <p className="text-sm text-gray-600">{guide.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(guide.status)}`}>
                      {guide.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {guide.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {guide.address || 'No address provided'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      Max {guide.maxDailyHours}h/day
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Languages</p>
                    <div className="flex flex-wrap gap-1">
                      {guide.languages.map(lang => (
                        <span key={lang} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {guide.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                      {guide.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded">
                          +{guide.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Certifications */}
                  {guide.certifications.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Certifications</p>
                      <div className="space-y-1">
                        {guide.certifications.slice(0, 2).map(cert => {
                          const certStatus = getCertificationStatus(cert);
                          return (
                            <div key={cert.id} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">{cert.name}</span>
                              <span className={`font-medium ${certStatus.color}`}>
                                {certStatus.status}
                              </span>
                            </div>
                          );
                        })}
                        {guide.certifications.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{guide.certifications.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setGuideModal({ isOpen: true, mode: 'edit', guide })}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(guide.id)}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Guide Modal */}
      <GuideModal
        isOpen={guideModal.isOpen}
        onClose={() => setGuideModal({ isOpen: false, mode: 'create' })}
        onSave={handleSave}
        guide={guideModal.guide}
        mode={guideModal.mode}
      />
    </div>
  );
};
