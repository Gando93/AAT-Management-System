import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeatureFlag } from '../config/features';
import { PromotionModal } from './PromotionModal';
import type { Promotion, CustomerSegment, DiscountCode, PromotionUsage, Campaign, PromotionAnalytics, PromotionRule, PromotionTemplate, PromotionBanner, ReferralProgram, Referral, LoyaltyProgram, LoyaltyAccount, LoyaltyTransaction } from '../types/promotions';
import { 
  Percent, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Users,
  BarChart3,
  Eye,
  Search,
  Bell,
  Settings,
  Gift,
  Star,
  Share2,
  Target,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface PromotionsPageProps {
  promotions: Promotion[];
  customerSegments: CustomerSegment[];
  discountCodes: DiscountCode[];
  promotionUsages: PromotionUsage[];
  campaigns: Campaign[];
  promotionAnalytics: PromotionAnalytics[];
  promotionRules: PromotionRule[];
  promotionTemplates: PromotionTemplate[];
  promotionBanners: PromotionBanner[];
  referralPrograms: ReferralProgram[];
  referrals: Referral[];
  loyaltyPrograms: LoyaltyProgram[];
  loyaltyAccounts: LoyaltyAccount[];
  loyaltyTransactions: LoyaltyTransaction[];
  onSavePromotion: (promotion: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePromotion: (promotion: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeletePromotion: (promotionId: string) => void;
  onSaveCustomerSegment: (segment: Omit<CustomerSegment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateCustomerSegment: (segment: Omit<CustomerSegment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteCustomerSegment: (segmentId: string) => void;
  onSaveCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteCampaign: (campaignId: string) => void;
  onSavePromotionRule: (rule: Omit<PromotionRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePromotionRule: (rule: Omit<PromotionRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeletePromotionRule: (ruleId: string) => void;
  onSaveReferralProgram: (program: Omit<ReferralProgram, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateReferralProgram: (program: Omit<ReferralProgram, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteReferralProgram: (programId: string) => void;
  onSaveLoyaltyProgram: (program: Omit<LoyaltyProgram, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateLoyaltyProgram: (program: Omit<LoyaltyProgram, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteLoyaltyProgram: (programId: string) => void;
}

export const PromotionsPage: React.FC<PromotionsPageProps> = ({
  promotions,
  customerSegments,
  discountCodes: _discountCodes,
  promotionUsages,
  campaigns,
  promotionAnalytics,
  promotionRules,
  promotionTemplates,
  promotionBanners,
  referralPrograms,
  referrals: _referrals,
  loyaltyPrograms,
  loyaltyAccounts: _loyaltyAccounts,
  loyaltyTransactions: _loyaltyTransactions,
  onSavePromotion,
  onUpdatePromotion,
  onDeletePromotion,
  onSaveCustomerSegment,
  onUpdateCustomerSegment,
  onDeleteCustomerSegment,
  onSaveCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
  onSavePromotionRule,
  onUpdatePromotionRule,
  onDeletePromotionRule,
  onSaveReferralProgram,
  onUpdateReferralProgram,
  onDeleteReferralProgram,
  onSaveLoyaltyProgram,
  onUpdateLoyaltyProgram,
  onDeleteLoyaltyProgram
}) => {
  const isPromotionsEnabled = useFeatureFlag('FEATURE_PROMOS');
  const [activeTab, setActiveTab] = useState<'promotions' | 'segments' | 'campaigns' | 'analytics' | 'rules' | 'templates' | 'banners' | 'referrals' | 'loyalty'>('promotions');
  const [promotionModal, setPromotionModal] = useState<{ 
    isOpen: boolean; 
    mode: 'create' | 'edit'; 
    type: 'promotion' | 'segment' | 'campaign' | 'rule' | 'referral' | 'loyalty';
    item?: Promotion | CustomerSegment | Campaign | PromotionRule | ReferralProgram | LoyaltyProgram;
  }>({ isOpen: false, mode: 'create', type: 'promotion' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'percentage' | 'fixed_amount' | 'buy_one_get_one' | 'free_shipping' | 'custom'>('all');

  if (!isPromotionsEnabled) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Feature Not Available</h3>
        <p className="text-gray-500">The Promotions & Discounts feature is currently disabled.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'confirmed': case 'rewarded': return 'bg-green-100 text-green-800';
      case 'pending': case 'draft': case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': case 'expired': case 'cancelled': case 'suspended': return 'bg-red-100 text-red-800';
      case 'paused': case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'promotion': return <Percent className="w-5 h-5" />;
      case 'segment': return <Users className="w-5 h-5" />;
      case 'campaign': return <Bell className="w-5 h-5" />;
      case 'analytics': return <BarChart3 className="w-5 h-5" />;
      case 'rule': return <Settings className="w-5 h-5" />;
      case 'template': return <Gift className="w-5 h-5" />;
      case 'banner': return <Target className="w-5 h-5" />;
      case 'referral': return <Share2 className="w-5 h-5" />;
      case 'loyalty': return <Star className="w-5 h-5" />;
      default: return <Percent className="w-5 h-5" />;
    }
  };

  const handleSave = (itemData: any) => {
    if (promotionModal.type === 'promotion') {
      if (promotionModal.mode === 'create') {
        onSavePromotion(itemData);
      } else {
        onUpdatePromotion(itemData);
      }
    } else if (promotionModal.type === 'segment') {
      if (promotionModal.mode === 'create') {
        onSaveCustomerSegment(itemData);
      } else {
        onUpdateCustomerSegment(itemData);
      }
    } else if (promotionModal.type === 'campaign') {
      if (promotionModal.mode === 'create') {
        onSaveCampaign(itemData);
      } else {
        onUpdateCampaign(itemData);
      }
    } else if (promotionModal.type === 'rule') {
      if (promotionModal.mode === 'create') {
        onSavePromotionRule(itemData);
      } else {
        onUpdatePromotionRule(itemData);
      }
    } else if (promotionModal.type === 'referral') {
      if (promotionModal.mode === 'create') {
        onSaveReferralProgram(itemData);
      } else {
        onUpdateReferralProgram(itemData);
      }
    } else if (promotionModal.type === 'loyalty') {
      if (promotionModal.mode === 'create') {
        onSaveLoyaltyProgram(itemData);
      } else {
        onUpdateLoyaltyProgram(itemData);
      }
    }
    setPromotionModal({ isOpen: false, mode: 'create', type: 'promotion' });
  };

  const totalPromotions = promotions.length;
  const activePromotions = promotions.filter(p => p.isActive).length;
  const totalUsage = promotionUsages.reduce((sum, _usage) => sum + 1, 0);
  const totalDiscount = promotionUsages.reduce((sum, usage) => sum + usage.discountAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions & Discounts</h1>
          <p className="text-gray-600">Manage promotional campaigns, discount codes, and customer loyalty programs</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPromotionModal({ isOpen: true, mode: 'create', type: 'promotion' })}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Promotion</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Percent className="w-4 h-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Promotions</p>
              <p className="text-2xl font-bold text-gray-900">{totalPromotions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Promotions</p>
              <p className="text-2xl font-bold text-gray-900">{activePromotions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsage}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Discount</p>
              <p className="text-2xl font-bold text-gray-900">${totalDiscount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'promotions', name: 'Promotions', count: promotions.length },
              { id: 'segments', name: 'Segments', count: customerSegments.length },
              { id: 'campaigns', name: 'Campaigns', count: campaigns.length },
              { id: 'analytics', name: 'Analytics', count: promotionAnalytics.length },
              { id: 'rules', name: 'Rules', count: promotionRules.length },
              { id: 'templates', name: 'Templates', count: promotionTemplates.length },
              { id: 'banners', name: 'Banners', count: promotionBanners.length },
              { id: 'referrals', name: 'Referrals', count: referralPrograms.length },
              { id: 'loyalty', name: 'Loyalty', count: loyaltyPrograms.length }
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
                  placeholder="Search promotions..."
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
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'percentage' | 'fixed_amount' | 'buy_one_get_one' | 'free_shipping' | 'custom')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed Amount</option>
                <option value="buy_one_get_one">Buy One Get One</option>
                <option value="free_shipping">Free Shipping</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'promotions' && (
            <div className="space-y-4">
              {promotions.length === 0 ? (
                <div className="text-center py-12">
                  <Percent className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No promotions</h3>
                  <p className="text-gray-500 mb-6">Create your first promotion to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPromotionModal({ isOpen: true, mode: 'create', type: 'promotion' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Promotion
                  </motion.button>
                </div>
              ) : (
                promotions.map(promotion => (
                  <div key={promotion.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('promotion')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{promotion.name}</h4>
                          <p className="text-sm text-gray-600">{promotion.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Code: {promotion.code}</span>
                            <span>Type: {promotion.type.replace('_', ' ')}</span>
                            <span>Value: {promotion.type === 'percentage' ? `${promotion.value}%` : `$${promotion.value}`}</span>
                            <span>Usage: {promotion.usageCount}/{promotion.usageLimit || '∞'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(promotion.isActive ? 'active' : 'inactive')}`}>
                          {promotion.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => setPromotionModal({ isOpen: true, mode: 'edit', type: 'promotion', item: promotion })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeletePromotion(promotion.id)}
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

          {activeTab === 'segments' && (
            <div className="space-y-4">
              {customerSegments.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No customer segments</h3>
                  <p className="text-gray-500 mb-6">Create your first customer segment to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPromotionModal({ isOpen: true, mode: 'create', type: 'segment' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Segment
                  </motion.button>
                </div>
              ) : (
                customerSegments.map(segment => (
                  <div key={segment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('segment')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{segment.name}</h4>
                          <p className="text-sm text-gray-600">{segment.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Customers: {segment.customerCount}</span>
                            <span>Active: {segment.isActive ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(segment.isActive ? 'active' : 'inactive')}`}>
                          {segment.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => setPromotionModal({ isOpen: true, mode: 'edit', type: 'segment', item: segment })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCustomerSegment(segment.id)}
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
              {campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns</h3>
                  <p className="text-gray-500 mb-6">Create your first marketing campaign to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPromotionModal({ isOpen: true, mode: 'create', type: 'campaign' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Campaign
                  </motion.button>
                </div>
              ) : (
                campaigns.map(campaign => (
                  <div key={campaign.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('campaign')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                          <p className="text-sm text-gray-600">{campaign.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Type: {campaign.type}</span>
                            <span>Sent: {campaign.metrics.sent}</span>
                            <span>Opened: {campaign.metrics.opened}</span>
                            <span>Clicked: {campaign.metrics.clicked}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                        <button
                          onClick={() => setPromotionModal({ isOpen: true, mode: 'edit', type: 'campaign', item: campaign })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCampaign(campaign.id)}
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
              {promotionAnalytics.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data</h3>
                  <p className="text-gray-500">Analytics will appear here as promotions are used</p>
                </div>
              ) : (
                promotionAnalytics.map(analytics => (
                  <div key={analytics.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('analytics')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{analytics.promotionName}</h4>
                          <p className="text-sm text-gray-600">Period: {new Date(analytics.period.startDate).toLocaleDateString()} - {new Date(analytics.period.endDate).toLocaleDateString()}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Uses: {analytics.metrics.totalUses}</span>
                            <span>Revenue: ${analytics.metrics.totalRevenue}</span>
                            <span>Conversion: {analytics.metrics.conversionRate}%</span>
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

          {activeTab === 'rules' && (
            <div className="space-y-4">
              {promotionRules.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No promotion rules</h3>
                  <p className="text-gray-500 mb-6">Create your first promotion rule to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPromotionModal({ isOpen: true, mode: 'create', type: 'rule' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Rule
                  </motion.button>
                </div>
              ) : (
                promotionRules.map(rule => (
                  <div key={rule.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('rule')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Trigger: {rule.trigger.replace('_', ' ')}</span>
                            <span>Priority: {rule.priority}</span>
                            <span>Conditions: {rule.conditions.length}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(rule.isActive ? 'active' : 'inactive')}`}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => setPromotionModal({ isOpen: true, mode: 'edit', type: 'rule', item: rule })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeletePromotionRule(rule.id)}
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
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Templates</h3>
              <p className="text-gray-500">Promotion templates will be available here</p>
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Banners</h3>
              <p className="text-gray-500">Promotional banners will be available here</p>
            </div>
          )}

          {activeTab === 'referrals' && (
            <div className="space-y-4">
              {referralPrograms.length === 0 ? (
                <div className="text-center py-12">
                  <Share2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No referral programs</h3>
                  <p className="text-gray-500 mb-6">Create your first referral program to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPromotionModal({ isOpen: true, mode: 'create', type: 'referral' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Referral Program
                  </motion.button>
                </div>
              ) : (
                referralPrograms.map(program => (
                  <div key={program.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('referral')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{program.name}</h4>
                          <p className="text-sm text-gray-600">{program.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Referrals: {program.totalReferrals}</span>
                            <span>Rewards: ${program.totalRewards}</span>
                            <span>Referrer: {program.referrerReward.value}{program.referrerReward.type === 'percentage' ? '%' : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(program.isActive ? 'active' : 'inactive')}`}>
                          {program.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => setPromotionModal({ isOpen: true, mode: 'edit', type: 'referral', item: program })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteReferralProgram(program.id)}
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

          {activeTab === 'loyalty' && (
            <div className="space-y-4">
              {loyaltyPrograms.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No loyalty programs</h3>
                  <p className="text-gray-500 mb-6">Create your first loyalty program to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPromotionModal({ isOpen: true, mode: 'create', type: 'loyalty' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Loyalty Program
                  </motion.button>
                </div>
              ) : (
                loyaltyPrograms.map(program => (
                  <div key={program.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          {getTypeIcon('loyalty')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{program.name}</h4>
                          <p className="text-sm text-gray-600">{program.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Members: {program.totalMembers}</span>
                            <span>Points Issued: {program.totalPointsIssued}</span>
                            <span>Points Redeemed: {program.totalPointsRedeemed}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(program.isActive ? 'active' : 'inactive')}`}>
                          {program.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => setPromotionModal({ isOpen: true, mode: 'edit', type: 'loyalty', item: program })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteLoyaltyProgram(program.id)}
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

      {/* Promotion Modal */}
      <PromotionModal
        isOpen={promotionModal.isOpen}
        onClose={() => setPromotionModal({ isOpen: false, mode: 'create', type: 'promotion' })}
        onSave={handleSave}
        item={promotionModal.item}
        mode={promotionModal.mode}
        type={promotionModal.type}
      />
    </div>
  );
};
