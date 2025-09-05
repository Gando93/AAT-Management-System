import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import type { Tour } from '../types';
import type { PricingConfig, SeasonRule } from '../types/pricing';
import { useFeatureFlag } from '../config/features';
import { computePrice } from '../lib/pricingEngine';
import { useCurrency } from '../context/CurrencyContext';
import { DollarSign, Settings, Plus, Trash2 } from 'lucide-react';

interface TourDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tour: Omit<Tour, 'id'>) => void;
  tour?: Tour;
  mode: 'create' | 'edit';
}

interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'basic', name: 'Basic Info', icon: Settings },
  { id: 'pricing', name: 'Pricing & Seasons', icon: DollarSign },
];

export const TourDetailModal = ({ isOpen, onClose, onSave, tour, mode }: TourDetailModalProps) => {
  const pricingEnabled = useFeatureFlag('FEATURE_PRICING_SEASONS');
  const { formatAmount } = useCurrency();
  const [activeTab, setActiveTab] = useState('basic');
  
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    price: 0,
    category: '',
    status: 'active' as Tour['status'],
    rating: 0,
    bookings: 0,
    description: '',
    maxCapacity: 0,
    pickupTime: '',
    dropoffTime: '',
  });

  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    baseCurrency: 'USD',
    seasons: [
      {
        id: 'default',
        name: 'Standard',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        paxTierPrices: [
          { category: 'adult', unitPrice: 0 },
          { category: 'child', unitPrice: 0 },
        ],
        taxesPercent: 10,
      },
    ],
  });

  const [pricePreview, setPricePreview] = useState<{
    subtotal: number;
    modifiersApplied: Array<{ label: string; amount: number }>;
    taxes: number;
    total: number;
    currency: string;
  } | null>(null);
  const [previewPax, setPreviewPax] = useState({ adult: 2, child: 0 });
  const [previewDate, setPreviewDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (mode === 'edit' && tour) {
      setFormData({
        name: tour.name,
        duration: tour.duration,
        price: tour.price,
        category: tour.category,
        status: tour.status,
        rating: tour.rating,
        bookings: tour.bookings,
        description: tour.description || '',
        maxCapacity: tour.maxCapacity || 0,
        pickupTime: tour.pickupTime || '',
        dropoffTime: tour.dropoffTime || '',
      });

      // Initialize pricing config with tour price
      setPricingConfig(prev => ({
        ...prev,
        seasons: prev.seasons.map(season => ({
          ...season,
          paxTierPrices: season.paxTierPrices.map(tier => ({
            ...tier,
            unitPrice: tier.category === 'adult' ? tour.price : tour.price * 0.7,
          })),
        })),
      }));
    } else {
      setFormData({
        name: '',
        duration: '',
        price: 0,
        category: '',
        status: 'active',
        rating: 0,
        bookings: 0,
        description: '',
        maxCapacity: 0,
        pickupTime: '',
        dropoffTime: '',
      });
    }
  }, [mode, tour, isOpen]);

  // Calculate price preview when pricing config changes
  useEffect(() => {
    if (pricingEnabled && pricingConfig.seasons.length > 0) {
      const price = computePrice(pricingConfig, {
        tourDateISO: `${previewDate}T10:00:00Z`,
        pax: previewPax,
      });
      setPricePreview(price);
    }
  }, [pricingConfig, previewPax, previewDate, pricingEnabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addSeason = () => {
    const newSeason: SeasonRule = {
      id: `season_${Date.now()}`,
      name: 'New Season',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      paxTierPrices: [
        { category: 'adult', unitPrice: formData.price },
        { category: 'child', unitPrice: formData.price * 0.7 },
      ],
      taxesPercent: 10,
    };

    setPricingConfig(prev => ({
      ...prev,
      seasons: [...prev.seasons, newSeason],
    }));
  };

  const removeSeason = (seasonId: string) => {
    setPricingConfig(prev => ({
      ...prev,
      seasons: prev.seasons.filter(s => s.id !== seasonId),
    }));
  };

  const updateSeason = (seasonId: string, updates: Partial<SeasonRule>) => {
    setPricingConfig(prev => ({
      ...prev,
      seasons: prev.seasons.map(s => s.id === seasonId ? { ...s, ...updates } : s),
    }));
  };

  const updatePaxTierPrice = (seasonId: string, category: 'adult' | 'child', price: number) => {
    setPricingConfig(prev => ({
      ...prev,
      seasons: prev.seasons.map(s => 
        s.id === seasonId 
          ? {
              ...s,
              paxTierPrices: s.paxTierPrices.map(tier => 
                tier.category === category ? { ...tier, unitPrice: price } : tier
              ),
            }
          : s
      ),
    }));
  };

  const renderBasicInfoTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tour Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration
          </label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 3 hours, 1 day"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base Price ($)
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Category</option>
            <option value="City Tour">City Tour</option>
            <option value="Adventure">Adventure</option>
            <option value="Cultural">Cultural</option>
            <option value="Nature">Nature</option>
            <option value="Historical">Historical</option>
            <option value="Wildlife">Wildlife</option>
            <option value="Multi-Day">Multi-Day</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Tour['status'] }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Capacity
          </label>
          <input
            type="number"
            value={formData.maxCapacity}
            onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <input
            type="number"
            value={formData.rating}
            onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="5"
            step="0.1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Time
          </label>
          <input
            type="time"
            value={formData.pickupTime}
            onChange={(e) => setFormData(prev => ({ ...prev, pickupTime: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dropoff Time
          </label>
          <input
            type="time"
            value={formData.dropoffTime}
            onChange={(e) => setFormData(prev => ({ ...prev, dropoffTime: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Describe the tour experience..."
        />
      </div>
    </div>
  );

  const renderPricingTab = () => (
    <div className="space-y-6">
      {!pricingEnabled ? (
        <div className="text-center py-8 text-gray-500">
          <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Pricing & Seasons feature is not enabled</p>
        </div>
      ) : (
        <>
          {/* Price Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-medium text-blue-900 mb-3">Price Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Preview Date
                </label>
                <input
                  type="date"
                  value={previewDate}
                  onChange={(e) => setPreviewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Adults
                </label>
                <input
                  type="number"
                  value={previewPax.adult}
                  onChange={(e) => setPreviewPax(prev => ({ ...prev, adult: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Children
                </label>
                <input
                  type="number"
                  value={previewPax.child}
                  onChange={(e) => setPreviewPax(prev => ({ ...prev, child: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>
            {pricePreview && (
              <div className="mt-3 p-3 bg-white rounded border">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blue-900">Total Price:</span>
                  <span className="text-lg font-bold text-blue-900">{formatAmount(pricePreview.total)}</span>
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  Subtotal: {formatAmount(pricePreview.subtotal)} | Taxes: {formatAmount(pricePreview.taxes)}
                </div>
              </div>
            )}
          </div>

          {/* Seasons Management */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Pricing Seasons</h3>
              <button
                type="button"
                onClick={addSeason}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Season
              </button>
            </div>

            <div className="space-y-4">
              {pricingConfig.seasons.map((season) => (
                <div key={season.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{season.name}</h4>
                    {pricingConfig.seasons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSeason(season.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Season Name
                      </label>
                      <input
                        type="text"
                        value={season.name}
                        onChange={(e) => updateSeason(season.id, { name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Taxes (%)
                      </label>
                      <input
                        type="number"
                        value={season.taxesPercent}
                        onChange={(e) => updateSeason(season.id, { taxesPercent: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={season.startDate}
                        onChange={(e) => updateSeason(season.id, { startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={season.endDate}
                        onChange={(e) => updateSeason(season.id, { endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adult Price ($)
                      </label>
                      <input
                        type="number"
                        value={season.paxTierPrices.find(t => t.category === 'adult')?.unitPrice || 0}
                        onChange={(e) => updatePaxTierPrice(season.id, 'adult', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child Price ($)
                      </label>
                      <input
                        type="number"
                        value={season.paxTierPrices.find(t => t.category === 'child')?.unitPrice || 0}
                        onChange={(e) => updatePaxTierPrice(season.id, 'child', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Tour' : 'Edit Tour'}
      size="lg"
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'basic' && renderBasicInfoTab()}
          {activeTab === 'pricing' && renderPricingTab()}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {mode === 'create' ? 'Add Tour' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
