import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFeatureFlags } from '../config/features';
import { useSidebarVisibility } from '../hooks/useSidebarVisibility';
import { Settings as SettingsIcon, ToggleLeft, ToggleRight, Save, RefreshCw, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

export const Settings = () => {
  const { featureFlags, updateFeatureFlag } = useFeatureFlags();
  const { visibility: sidebarVisibility, updateVisibility, resetToDefaults: resetSidebar } = useSidebarVisibility();
  const [localFlags, setLocalFlags] = useState(featureFlags);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setLocalFlags(featureFlags);
  }, [featureFlags]);

  const handleToggle = (flag: string) => {
    const newValue = !localFlags[flag as keyof typeof localFlags];
    setLocalFlags(prev => ({ ...prev, [flag]: newValue }));
    setHasChanges(true);
  };

  const handleSave = () => {
    Object.entries(localFlags).forEach(([key, value]) => {
      if (value !== featureFlags[key as keyof typeof featureFlags]) {
        updateFeatureFlag(key as keyof typeof featureFlags, value);
      }
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalFlags(featureFlags);
    setHasChanges(false);
  };

  const coreFeatures = [
    { key: 'FEATURE_GUIDES', label: 'Guides Management', description: 'Manage tour guides and their assignments' },
    { key: 'FEATURE_RESOURCE_AVAILABILITY', label: 'Resource Availability', description: 'Track vehicle and guide availability' },
    { key: 'FEATURE_PRICING_SEASONS', label: 'Pricing & Seasons', description: 'Dynamic pricing and seasonal rates' },
    { key: 'FEATURE_MANIFESTS', label: 'Manifests', description: 'Tour manifests and passenger lists' },
    { key: 'FEATURE_QR_CHECKIN', label: 'QR Check-in', description: 'QR code check-in system' },
    { key: 'FEATURE_REPORTS', label: 'Reports', description: 'Basic reporting functionality' },
  ];

  const advancedFeatures = [
    { key: 'FEATURE_ADDONS', label: 'Add-ons', description: 'Tour add-ons and extras management' },
    { key: 'FEATURE_POLICIES_DEPOSITS', label: 'Policies & Deposits', description: 'Booking policies and deposit management' },
    { key: 'FEATURE_COMMS', label: 'Communications', description: 'Customer communication tools' },
    { key: 'FEATURE_WAIVERS', label: 'Waivers', description: 'Digital waiver management' },
    { key: 'FEATURE_PROMOS', label: 'Promotions', description: 'Promotional campaigns and discounts' },
    { key: 'FEATURE_AGENTS', label: 'Agents', description: 'Travel agent management' },
    { key: 'FEATURE_INTEGRATIONS', label: 'Integrations', description: 'Third-party integrations' },
    { key: 'FEATURE_MAINTENANCE', label: 'Maintenance', description: 'Vehicle maintenance tracking' },
    { key: 'FEATURE_CHECKLISTS', label: 'Checklists', description: 'Pre-tour checklists' },
    { key: 'FEATURE_INVENTORY', label: 'Inventory', description: 'Equipment and inventory management' },
    { key: 'FEATURE_AUDIT', label: 'Audit', description: 'System audit logs' },
    { key: 'FEATURE_WEBHOOKS', label: 'Webhooks', description: 'Webhook integrations' },
    { key: 'FEATURE_ADVANCED_REPORTS', label: 'Advanced Reports', description: 'Advanced reporting and analytics' },
  ];

  const advancedModules = [
    { id: 'policies', label: 'Policies', description: 'Booking policies and deposit management' },
    { id: 'communications', label: 'Communications', description: 'Customer communication tools' },
    { id: 'qr-tickets', label: 'QR Tickets', description: 'QR code check-in system' },
    { id: 'waivers', label: 'Waivers', description: 'Digital waiver management' },
    { id: 'promotions', label: 'Promotions', description: 'Promotional campaigns and discounts' },
    { id: 'agents', label: 'Agents', description: 'Travel agent management' },
    { id: 'integrations', label: 'Integrations', description: 'Third-party service integrations' },
    { id: 'customers', label: 'Customers', description: 'Customer management' },
    { id: 'inventory', label: 'Inventory', description: 'Inventory management' },
    { id: 'checklists', label: 'Checklists', description: 'Operational checklists' },
    { id: 'webhooks', label: 'Webhooks', description: 'Webhook configurations' },
  ];

  const FeatureToggle = ({ flag, label, description, isEnabled }: { 
    flag: string; 
    label: string; 
    description: string; 
    isEnabled: boolean; 
  }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{label}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <button
        onClick={() => handleToggle(flag)}
        className={`ml-4 p-1 rounded-full transition-colors ${
          isEnabled ? 'text-green-600' : 'text-gray-400'
        }`}
      >
        {isEnabled ? (
          <ToggleRight className="w-8 h-8" />
        ) : (
          <ToggleLeft className="w-8 h-8" />
        )}
      </button>
    </div>
  );

  const SidebarToggle = ({ moduleId, label, description, isVisible }: { 
    moduleId: string; 
    label: string; 
    description: string; 
    isVisible: boolean; 
  }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{label}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <button
        onClick={() => updateVisibility(moduleId, !isVisible)}
        className={`ml-4 p-1 rounded-full transition-colors ${
          isVisible ? 'text-blue-600' : 'text-gray-400'
        }`}
      >
        {isVisible ? (
          <Eye className="w-6 h-6" />
        ) : (
          <EyeOff className="w-6 h-6" />
        )}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className="w-8 h-8 mr-3 text-blue-600" />
            Settings
          </h1>
          <p className="text-gray-600 mt-1">Configure system features and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="flex items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Core Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Core Features</h2>
          <p className="text-sm text-gray-600 mb-4">Essential features for daily operations</p>
        </div>
        <div className="space-y-3">
          {coreFeatures.map((feature) => (
            <FeatureToggle
              key={feature.key}
              flag={feature.key}
              label={feature.label}
              description={feature.description}
              isEnabled={localFlags[feature.key as keyof typeof localFlags] || false}
            />
          ))}
        </div>
      </motion.div>

      {/* Advanced Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Advanced Features</h2>
          <p className="text-sm text-gray-600 mb-4">Additional features that can be enabled as needed</p>
        </div>
        <div className="space-y-3">
          {advancedFeatures.map((feature) => (
            <FeatureToggle
              key={feature.key}
              flag={feature.key}
              label={feature.label}
              description={feature.description}
              isEnabled={localFlags[feature.key as keyof typeof localFlags] || false}
            />
          ))}
        </div>
      </motion.div>

      {/* Advanced Sidebar Visibility */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Advanced Modules</h2>
            <p className="text-sm text-gray-600 mb-4">Control which advanced modules appear in the sidebar</p>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            {showAdvanced ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show
              </>
            )}
          </button>
        </div>
        
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {advancedModules.map((module) => (
              <SidebarToggle
                key={module.id}
                moduleId={module.id}
                label={module.label}
                description={module.description}
                isVisible={sidebarVisibility[module.id] || false}
              />
            ))}
            <div className="flex justify-end pt-2">
              <button
                onClick={resetSidebar}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Reset to defaults
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <h3 className="font-medium text-blue-900 mb-2">About Feature Flags</h3>
        <p className="text-sm text-blue-800">
          Feature flags allow you to enable or disable specific functionality. Changes are saved locally 
          and will persist across sessions. Core features are recommended for daily operations, while 
          advanced features can be enabled based on your specific needs.
        </p>
      </motion.div>
    </div>
  );
};
