import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeatureFlag } from '../config/features';
import { AgentModal } from './AgentModal';
import type { Agent, Territory, CommissionStructure, Lead, Commission, AgentReport, AgentTraining, AgentAuditLog } from '../types/agents';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  MapPin,
  DollarSign,
  Target,
  TrendingUp,
  BookOpen,
  FileText,
  Settings,
  Star
} from 'lucide-react';

interface AgentsPageProps {
  agents: Agent[];
  territories: Territory[];
  commissionStructures: CommissionStructure[];
  leads: Lead[];
  commissions: Commission[];
  agentReports: AgentReport[];
  agentTrainings: AgentTraining[];
  agentAuditLogs: AgentAuditLog[];
  onSaveAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onUpdateAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onDeleteAgent: (agentId: string) => void;
  onSaveTerritory: (territory: Omit<Territory, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onUpdateTerritory: (territory: Omit<Territory, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onDeleteTerritory: (territoryId: string) => void;
  onSaveCommissionStructure: (structure: Omit<CommissionStructure, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onUpdateCommissionStructure: (structure: Omit<CommissionStructure, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onDeleteCommissionStructure: (structureId: string) => void;
  onSaveLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onUpdateLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onDeleteLead: (leadId: string) => void;
  onGenerateAgentReport: (report: Omit<AgentReport, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onSaveAgentTraining: (training: Omit<AgentTraining, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onUpdateAgentTraining: (training: Omit<AgentTraining, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  onDeleteAgentTraining: (trainingId: string) => void;
}

export const AgentsPage: React.FC<AgentsPageProps> = ({
  agents,
  territories,
  commissionStructures: _commissionStructures,
  leads,
  commissions,
  agentReports,
  agentTrainings,
  agentAuditLogs,
  onSaveAgent,
  onUpdateAgent,
  onDeleteAgent,
  onSaveTerritory,
  onUpdateTerritory,
  onDeleteTerritory,
  onSaveCommissionStructure,
  onUpdateCommissionStructure,
  onDeleteCommissionStructure: _onDeleteCommissionStructure,
  onSaveLead,
  onUpdateLead,
  onDeleteLead,
  onGenerateAgentReport,
  onSaveAgentTraining,
  onUpdateAgentTraining,
  onDeleteAgentTraining
}) => {
  const [activeTab, setActiveTab] = useState<'agents' | 'territories' | 'commissions' | 'leads' | 'reports' | 'training' | 'audit'>('agents');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [agentModal, setAgentModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; type: 'agent' | 'territory' | 'commission' | 'lead' | 'training'; item?: any }>({ 
    isOpen: false, 
    mode: 'create', 
    type: 'agent' 
  });

  const isFeatureEnabled = useFeatureFlag('FEATURE_AGENTS');

  if (!isFeatureEnabled) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Agents & Resellers</h3>
          <p className="text-gray-500">This feature is currently disabled.</p>
        </div>
      </div>
    );
  }

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.contactInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.contactInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = (type: 'agent' | 'territory' | 'commission' | 'lead' | 'training') => {
    setAgentModal({ isOpen: true, mode: 'create', type });
  };

  const handleEdit = (type: 'agent' | 'territory' | 'commission' | 'lead' | 'training', item: any) => {
    setAgentModal({ isOpen: true, mode: 'edit', type, item });
  };

  const handleCloseModal = () => {
    setAgentModal({ isOpen: false, mode: 'create', type: 'agent' });
  };

  const handleSave = (item: any) => {
    let success = false;
    
    switch (agentModal.type) {
      case 'agent':
        success = agentModal.mode === 'create' ? onSaveAgent(item) : onUpdateAgent(item);
        break;
      case 'territory':
        success = agentModal.mode === 'create' ? onSaveTerritory(item) : onUpdateTerritory(item);
        break;
      case 'commission':
        success = agentModal.mode === 'create' ? onSaveCommissionStructure(item) : onUpdateCommissionStructure(item);
        break;
      case 'lead':
        success = agentModal.mode === 'create' ? onSaveLead(item) : onUpdateLead(item);
        break;
      case 'training':
        success = agentModal.mode === 'create' ? onSaveAgentTraining(item) : onUpdateAgentTraining(item);
        break;
    }
    
    if (success) {
      handleCloseModal();
    }
  };

  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const totalCommissions = commissions.reduce((sum, c) => sum + c.netCommission, 0);
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(l => l.status === 'closed_won').length;
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  const tabs = [
    { id: 'agents', name: 'Agents', icon: Users, count: totalAgents },
    { id: 'territories', name: 'Territories', icon: MapPin, count: territories.length },
    { id: 'commissions', name: 'Commissions', icon: DollarSign, count: commissions.length },
    { id: 'leads', name: 'Leads', icon: Target, count: totalLeads },
    { id: 'reports', name: 'Reports', icon: FileText, count: agentReports.length },
    { id: 'training', name: 'Training', icon: BookOpen, count: agentTrainings.length },
    { id: 'audit', name: 'Audit Log', icon: Settings, count: agentAuditLogs.length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents & Resellers</h1>
          <p className="text-gray-600">Manage agents, territories, commissions, and performance</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCreate('agent')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Agent
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">{totalAgents}</p>
              <p className="text-sm text-green-600">{activeAgents} active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Commissions</p>
              <p className="text-2xl font-bold text-gray-900">${totalCommissions.toLocaleString()}</p>
              <p className="text-sm text-gray-500">This month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
              <p className="text-sm text-green-600">{conversionRate.toFixed(1)}% conversion</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Performance</p>
              <p className="text-2xl font-bold text-gray-900">{convertedLeads}</p>
              <p className="text-sm text-gray-500">Won leads</p>
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
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending_approval">Pending Approval</option>
              </select>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'agents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Agents</h3>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCreate('territory')}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <MapPin className="w-4 h-4 mr-1 inline" />
                    Territory
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCreate('commission')}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <DollarSign className="w-4 h-4 mr-1 inline" />
                    Commission
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                          <p className="text-sm text-gray-600">{agent.email}</p>
                          <p className="text-xs text-gray-500">{agent.company || 'Individual'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          agent.status === 'active' ? 'bg-green-100 text-green-800' :
                          agent.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          agent.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {agent.status.replace('_', ' ')}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEdit('agent', agent)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteAgent(agent.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{agent.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Territory:</span>
                        <span className="font-medium">{agent.territory.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Commission:</span>
                        <span className="font-medium">{agent.commissionStructure.baseRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Performance:</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="font-medium">{agent.performance.metrics.customerSatisfaction.toFixed(1)}/5</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Revenue:</span>
                        <span className="font-semibold text-green-600">
                          ${agent.performance.metrics.totalRevenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Leads</h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCreate('lead')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Add Lead
                </motion.button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{lead.title}</div>
                            <div className="text-sm text-gray-500">{lead.contactInfo.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {agents.find(a => a.id === lead.agentId)?.name || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            lead.status === 'closed_won' ? 'bg-green-100 text-green-800' :
                            lead.status === 'closed_lost' ? 'bg-red-100 text-red-800' :
                            lead.status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {lead.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${lead.value.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            lead.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            lead.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            lead.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {lead.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit('lead', lead)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteLead(lead.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'commissions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Commissions</h3>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Commission Management</h4>
                <p className="text-gray-600 mb-4">Track and manage agent commissions</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      ${commissions.reduce((sum, c) => sum + c.netCommission, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Commissions</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {commissions.filter(c => c.status === 'paid').length}
                    </div>
                    <div className="text-sm text-gray-600">Paid Commissions</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {commissions.filter(c => c.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-600">Pending Commissions</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'territories' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Territories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {territories.map((territory) => (
                  <div key={territory.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{territory.name}</h4>
                          <p className="text-sm text-gray-600">{territory.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit('territory', territory)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTerritory(territory.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{territory.description}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Products:</span>
                      <span className="font-medium">{territory.products.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Customers:</span>
                      <span className="font-medium">{territory.customers.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onGenerateAgentReport({
                    agentId: agents[0]?.id || '',
                    reportType: 'performance',
                    period: {
                      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      endDate: new Date().toISOString().split('T')[0]
                    },
                    data: {},
                    generatedAt: new Date().toISOString(),
                    generatedBy: '1',
                    isScheduled: false
                  })}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  <FileText className="w-4 h-4 mr-2 inline" />
                  Generate Report
                </motion.button>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Agent Reports</h4>
                <p className="text-gray-600">Generate performance and commission reports for agents</p>
              </div>
            </div>
          )}

          {activeTab === 'training' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Training</h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCreate('training')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Add Training
                </motion.button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agentTrainings.map((training) => (
                  <div key={training.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{training.title}</h4>
                          <p className="text-sm text-gray-600">{training.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit('training', training)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteAgentTraining(training.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{training.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          training.status === 'completed' ? 'bg-green-100 text-green-800' :
                          training.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          training.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {training.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-medium">{training.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${training.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Audit Log</h3>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Audit Trail</h4>
                <p className="text-gray-600">Track all agent-related activities and changes</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AgentModal
        isOpen={agentModal.isOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        item={agentModal.item}
        mode={agentModal.mode}
        type={agentModal.type}
      />
    </div>
  );
};
