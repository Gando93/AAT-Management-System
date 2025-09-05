import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeatureFlag } from '../config/features';
import { AddonModal } from '../components/AddonModal';
import type { Addon, AddonCategory } from '../types/addons';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Search,
  Grid,
  List
} from 'lucide-react';

interface AddonsPageProps {
  addons: Addon[];
  categories: AddonCategory[];
  onSave: (addon: Omit<Addon, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (addon: Omit<Addon, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete: (addonId: string) => void;
}

export const AddonsPage: React.FC<AddonsPageProps> = ({
  addons,
  categories,
  onSave,
  onUpdate,
  onDelete
}) => {
  const isAddonsEnabled = useFeatureFlag('FEATURE_ADDONS');
  const [addonModal, setAddonModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; addon?: Addon }>({ 
    isOpen: false, 
    mode: 'create' 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (!isAddonsEnabled) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Feature Not Available</h3>
        <p className="text-gray-500">The Add-ons feature is currently disabled.</p>
      </div>
    );
  }

  // Filter addons
  const filteredAddons = addons.filter(addon => {
    const matchesSearch = addon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         addon.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || addon.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && addon.isActive) ||
                         (statusFilter === 'inactive' && !addon.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryIcon = (category: Addon['category']) => {
    switch (category) {
      case 'equipment': return '🛠️';
      case 'service': return '🎯';
      case 'food': return '🍽️';
      case 'transport': return '🚗';
      case 'accommodation': return '🏨';
      default: return '📦';
    }
  };

  const getPricingTypeLabel = (type: Addon['pricingType']) => {
    switch (type) {
      case 'per_person': return 'Per Person';
      case 'per_booking': return 'Per Booking';
      case 'per_hour': return 'Per Hour';
      case 'fixed': return 'Fixed Price';
      default: return type;
    }
  };

  const handleSave = (addonData: Omit<Addon, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (addonModal.mode === 'create') {
      onSave(addonData);
    } else {
      onUpdate(addonData);
    }
    setAddonModal({ isOpen: false, mode: 'create' });
  };

  const totalRevenue = addons.reduce((sum, addon) => sum + addon.basePrice, 0);
  const activeAddons = addons.filter(addon => addon.isActive).length;
  const categoriesCount = new Set(addons.map(addon => addon.category)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add-ons & Extras</h1>
          <p className="text-gray-600">Manage additional services and products for your tours</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAddonModal({ isOpen: true, mode: 'create' })}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Add-on</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Add-ons</p>
              <p className="text-2xl font-bold text-gray-900">{addons.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">{activeAddons}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Grid className="w-4 h-4 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categoriesCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">€{totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search add-ons..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              
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
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add-ons List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Add-ons ({filteredAddons.length})
          </h3>
        </div>
        
        <div className="p-6">
          {filteredAddons.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No add-ons found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first add-on'
                }
              </p>
              {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAddonModal({ isOpen: true, mode: 'create' })}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Add-on
                </motion.button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAddons.map(addon => (
                <motion.div
                  key={addon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getCategoryIcon(addon.category)}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                        <p className="text-sm text-gray-600">{addon.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        addon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {addon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{addon.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium text-gray-900">€{addon.basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium text-gray-900">{getPricingTypeLabel(addon.pricingType)}</span>
                    </div>
                    {addon.requiresQuantity && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium text-gray-900">
                          {addon.minQuantity || 1} - {addon.maxQuantity || '∞'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setAddonModal({ isOpen: true, mode: 'edit', addon })}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(addon.id)}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAddons.map(addon => (
                <div key={addon.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getCategoryIcon(addon.category)}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                      <p className="text-sm text-gray-600">{addon.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>€{addon.basePrice.toFixed(2)}</span>
                        <span>{getPricingTypeLabel(addon.pricingType)}</span>
                        <span>{addon.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      addon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {addon.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => setAddonModal({ isOpen: true, mode: 'edit', addon })}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(addon.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Addon Modal */}
      <AddonModal
        isOpen={addonModal.isOpen}
        onClose={() => setAddonModal({ isOpen: false, mode: 'create' })}
        onSave={handleSave}
        addon={addonModal.addon}
        mode={addonModal.mode}
        categories={categories}
      />
    </div>
  );
};
