import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeatureFlag } from '../config/features';
// import { PolicyModal } from '../components/PolicyModal';
import type { RefundPolicy, DepositPolicy, PaymentTerms, RefundRequest } from '../types/policies';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  FileText,
  CreditCard,
  Banknote,
  User
} from 'lucide-react';

interface PoliciesPageProps {
  refundPolicies: RefundPolicy[];
  depositPolicies: DepositPolicy[];
  paymentTerms: PaymentTerms[];
  refundRequests: RefundRequest[];
  onSaveRefundPolicy: (policy: Omit<RefundPolicy, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateRefundPolicy: (policy: Omit<RefundPolicy, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteRefundPolicy: (policyId: string) => void;
  onSaveDepositPolicy: (policy: Omit<DepositPolicy, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateDepositPolicy: (policy: Omit<DepositPolicy, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteDepositPolicy: (policyId: string) => void;
  onSavePaymentTerms: (terms: Omit<PaymentTerms, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePaymentTerms: (terms: Omit<PaymentTerms, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeletePaymentTerms: (termsId: string) => void;
  onProcessRefundRequest: (requestId: string, action: 'approve' | 'reject', notes?: string) => void;
}

export const PoliciesPage: React.FC<PoliciesPageProps> = ({
  refundPolicies,
  depositPolicies,
  paymentTerms,
  refundRequests,
  onSaveRefundPolicy,
  onUpdateRefundPolicy,
  onDeleteRefundPolicy,
  onSaveDepositPolicy,
  onUpdateDepositPolicy,
  onDeleteDepositPolicy,
  onSavePaymentTerms,
  onUpdatePaymentTerms,
  onDeletePaymentTerms,
  onProcessRefundRequest
}) => {
  const isPoliciesEnabled = useFeatureFlag('FEATURE_POLICIES_DEPOSITS');
  const [activeTab, setActiveTab] = useState<'refunds' | 'deposits' | 'payments' | 'requests'>('refunds');
  const [policyModal, setPolicyModal] = useState<{ 
    isOpen: boolean; 
    mode: 'create' | 'edit'; 
    type: 'refund' | 'deposit' | 'payment';
    policy?: RefundPolicy | DepositPolicy | PaymentTerms;
  }>({ isOpen: false, mode: 'create', type: 'refund' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  if (!isPoliciesEnabled) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Feature Not Available</h3>
        <p className="text-gray-500">The Policies & Deposits feature is currently disabled.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'approved': case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': case 'rejected': case 'failed': return 'bg-red-100 text-red-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPolicyTypeIcon = (type: string) => {
    switch (type) {
      case 'refund': return <DollarSign className="w-5 h-5" />;
      case 'deposit': return <Banknote className="w-5 h-5" />;
      case 'payment': return <CreditCard className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const handleSave = (policyData: any) => {
    if (policyModal.type === 'refund') {
      if (policyModal.mode === 'create') {
        onSaveRefundPolicy(policyData);
      } else {
        onUpdateRefundPolicy(policyData);
      }
    } else if (policyModal.type === 'deposit') {
      if (policyModal.mode === 'create') {
        onSaveDepositPolicy(policyData);
      } else {
        onUpdateDepositPolicy(policyData);
      }
    } else if (policyModal.type === 'payment') {
      if (policyModal.mode === 'create') {
        onSavePaymentTerms(policyData);
      } else {
        onUpdatePaymentTerms(policyData);
      }
    }
    setPolicyModal({ isOpen: false, mode: 'create', type: 'refund' });
  };

  const pendingRequests = refundRequests.filter(req => req.status === 'pending');
  const totalRefundAmount = refundRequests
    .filter(req => req.status === 'approved' || req.status === 'processed')
    .reduce((sum, req) => sum + req.requestedAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Policies & Deposits</h1>
          <p className="text-gray-600">Manage refund policies, deposit requirements, and payment terms</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPolicyModal({ isOpen: true, mode: 'create', type: 'refund' })}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Policy</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Policies</p>
              <p className="text-2xl font-bold text-gray-900">
                {refundPolicies.length + depositPolicies.length + paymentTerms.length}
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
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Processed Refunds</p>
              <p className="text-2xl font-bold text-gray-900">€{totalRefundAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Policies</p>
              <p className="text-2xl font-bold text-gray-900">
                {[...refundPolicies, ...depositPolicies, ...paymentTerms].filter(p => p.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'refunds', name: 'Refund Policies', count: refundPolicies.length },
              { id: 'deposits', name: 'Deposit Policies', count: depositPolicies.length },
              { id: 'payments', name: 'Payment Terms', count: paymentTerms.length },
              { id: 'requests', name: 'Refund Requests', count: refundRequests.length }
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
                  placeholder="Search policies..."
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
          {activeTab === 'refunds' && (
            <div className="space-y-4">
              {refundPolicies.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No refund policies</h3>
                  <p className="text-gray-500 mb-6">Create your first refund policy to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPolicyModal({ isOpen: true, mode: 'create', type: 'refund' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Refund Policy
                  </motion.button>
                </div>
              ) : (
                refundPolicies.map(policy => (
                  <div key={policy.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {getPolicyTypeIcon('refund')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{policy.name}</h4>
                          <p className="text-sm text-gray-600">{policy.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>{policy.refundPercentage}% refund</span>
                            <span>{policy.timeRestrictions.hoursBeforeTour}h before tour</span>
                            <span>{policy.policyType}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(policy.isActive ? 'active' : 'inactive')}`}>
                          {policy.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => setPolicyModal({ isOpen: true, mode: 'edit', type: 'refund', policy })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteRefundPolicy(policy.id)}
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

          {activeTab === 'deposits' && (
            <div className="space-y-4">
              {depositPolicies.length === 0 ? (
                <div className="text-center py-12">
                  <Banknote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No deposit policies</h3>
                  <p className="text-gray-500 mb-6">Create your first deposit policy to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPolicyModal({ isOpen: true, mode: 'create', type: 'deposit' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Deposit Policy
                  </motion.button>
                </div>
              ) : (
                depositPolicies.map(policy => (
                  <div key={policy.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          {getPolicyTypeIcon('deposit')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{policy.name}</h4>
                          <p className="text-sm text-gray-600">{policy.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>{policy.depositType === 'percentage' ? `${policy.depositValue}%` : `€${policy.depositValue}`}</span>
                            <span>{policy.dueDate.type}</span>
                            <span>{policy.refundable ? 'Refundable' : 'Non-refundable'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(policy.isActive ? 'active' : 'inactive')}`}>
                          {policy.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => setPolicyModal({ isOpen: true, mode: 'edit', type: 'deposit', policy })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteDepositPolicy(policy.id)}
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

          {activeTab === 'payments' && (
            <div className="space-y-4">
              {paymentTerms.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payment terms</h3>
                  <p className="text-gray-500 mb-6">Create your first payment terms to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPolicyModal({ isOpen: true, mode: 'create', type: 'payment' })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Payment Terms
                  </motion.button>
                </div>
              ) : (
                paymentTerms.map(terms => (
                  <div key={terms.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          {getPolicyTypeIcon('payment')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{terms.name}</h4>
                          <p className="text-sm text-gray-600">{terms.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>{terms.paymentMethods.join(', ')}</span>
                            <span>{terms.currency}</span>
                            <span>{terms.installmentOptions.enabled ? 'Installments' : 'No installments'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(terms.isActive ? 'active' : 'inactive')}`}>
                          {terms.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => setPolicyModal({ isOpen: true, mode: 'edit', type: 'payment', policy: terms })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeletePaymentTerms(terms.id)}
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

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {refundRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No refund requests</h3>
                  <p className="text-gray-500">Refund requests will appear here when customers submit them</p>
                </div>
              ) : (
                refundRequests.map(request => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{request.customerName}</h4>
                          <p className="text-sm text-gray-600">{request.tourName}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>€{request.requestedAmount}</span>
                            <span>{request.refundReason}</span>
                            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => onProcessRefundRequest(request.id, 'approve')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onProcessRefundRequest(request.id, 'reject')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Policy Modal */}
      {/* <PolicyModal
        isOpen={policyModal.isOpen}
        onClose={() => setPolicyModal({ isOpen: false, mode: 'create', type: 'refund' })}
        onSave={handleSave}
        policy={policyModal.policy}
        mode={policyModal.mode}
        type={policyModal.type}
      /> */}
    </div>
  );
};
