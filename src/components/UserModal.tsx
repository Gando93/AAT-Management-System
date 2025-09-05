import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import type { User } from '../types';
import { Shield, User as UserIcon, Mail, Lock } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id'>) => void;
  user?: User;
  mode: 'create' | 'edit';
}

// Define all available permissions
const ALL_PERMISSIONS = [
  { key: 'users.create', label: 'Create Users', category: 'Users' },
  { key: 'users.read', label: 'View Users', category: 'Users' },
  { key: 'users.update', label: 'Edit Users', category: 'Users' },
  { key: 'users.delete', label: 'Delete Users', category: 'Users' },
  { key: 'bookings.create', label: 'Create Bookings', category: 'Bookings' },
  { key: 'bookings.read', label: 'View Bookings', category: 'Bookings' },
  { key: 'bookings.update', label: 'Edit Bookings', category: 'Bookings' },
  { key: 'bookings.delete', label: 'Delete Bookings', category: 'Bookings' },
  { key: 'tours.create', label: 'Create Tours', category: 'Tours' },
  { key: 'tours.read', label: 'View Tours', category: 'Tours' },
  { key: 'tours.update', label: 'Edit Tours', category: 'Tours' },
  { key: 'tours.delete', label: 'Delete Tours', category: 'Tours' },
  { key: 'customers.create', label: 'Create Customers', category: 'Customers' },
  { key: 'customers.read', label: 'View Customers', category: 'Customers' },
  { key: 'customers.update', label: 'Edit Customers', category: 'Customers' },
  { key: 'customers.delete', label: 'Delete Customers', category: 'Customers' },
  { key: 'vehicles.create', label: 'Create Vehicles', category: 'Vehicles' },
  { key: 'vehicles.read', label: 'View Vehicles', category: 'Vehicles' },
  { key: 'vehicles.update', label: 'Edit Vehicles', category: 'Vehicles' },
  { key: 'vehicles.delete', label: 'Delete Vehicles', category: 'Vehicles' },
  { key: 'reports.read', label: 'View Reports', category: 'Reports' },
  { key: 'settings.read', label: 'View Settings', category: 'Settings' },
  { key: 'settings.update', label: 'Edit Settings', category: 'Settings' },
];

// Role-based default permissions
const ROLE_PERMISSIONS = {
  Administrator: ALL_PERMISSIONS.map(p => p.key),
  Manager: ALL_PERMISSIONS.filter(p => !p.key.startsWith('users.') && !p.key.startsWith('settings.')).map(p => p.key),
  Agent: ALL_PERMISSIONS.filter(p => 
    p.key.includes('.read') || 
    p.key.includes('bookings.create') || 
    p.key.includes('customers.create') || 
    p.key.includes('customers.update')
  ).map(p => p.key),
  Viewer: ALL_PERMISSIONS.filter(p => p.key.includes('.read')).map(p => p.key),
};

export const UserModal = ({ isOpen, onClose, onSave, user, mode }: UserModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Agent' as User['role'],
    status: 'active' as User['status'],
    permissions: [] as string[],
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        permissions: user.permissions,
        password: '',
        confirmPassword: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'Agent',
        status: 'active',
        permissions: ROLE_PERMISSIONS.Agent,
        password: '',
        confirmPassword: '',
      });
    }
  }, [mode, user, isOpen]);

  // Auto-set permissions when role changes
  useEffect(() => {
    if (formData.role) {
      setFormData(prev => ({
        ...prev,
        permissions: ROLE_PERMISSIONS[formData.role as keyof typeof ROLE_PERMISSIONS] || []
      }));
    }
  }, [formData.role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password for new users
    if (mode === 'create') {
      if (!formData.password || formData.password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
    }
    
    const userData = {
      ...formData,
      createdAt: mode === 'create' ? new Date().toISOString() : user?.createdAt || new Date().toISOString(),
      needsPasswordSetup: mode === 'create' && !formData.password ? true : false,
    };
    onSave(userData);
    onClose();
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }));
  };

  const handleSelectAll = (category: string) => {
    const categoryPermissions = ALL_PERMISSIONS
      .filter(p => p.category === category)
      .map(p => p.key);
    
    const hasAllCategoryPermissions = categoryPermissions.every(p => 
      formData.permissions.includes(p)
    );

    if (hasAllCategoryPermissions) {
      // Remove all category permissions
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !categoryPermissions.includes(p))
      }));
    } else {
      // Add all category permissions
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...categoryPermissions])]
      }));
    }
  };

  const getPermissionsByCategory = () => {
    const categories = [...new Set(ALL_PERMISSIONS.map(p => p.category))];
    return categories.map(category => ({
      category,
      permissions: ALL_PERMISSIONS.filter(p => p.category === category)
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New User' : 'Edit User'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <UserIcon className="w-5 h-5 mr-2" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Role and Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Role & Access
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as User['role'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Administrator">Administrator</option>
                <option value="Manager">Manager</option>
                <option value="Agent">Agent</option>
                <option value="Viewer">Viewer</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.role === 'Administrator' && 'Full system access'}
                {formData.role === 'Manager' && 'Management access without user management'}
                {formData.role === 'Agent' && 'Booking and customer management'}
                {formData.role === 'Viewer' && 'Read-only access'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as User['status'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Permissions
            </h3>
            <div className="text-sm text-gray-500">
              {formData.permissions.length} of {ALL_PERMISSIONS.length} selected
            </div>
          </div>
          
          <div className="space-y-4">
            {getPermissionsByCategory().map(({ category, permissions }) => (
              <div key={category} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{category}</h4>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(category)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {permissions.every(p => formData.permissions.includes(p.key)) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {permissions.map(permission => (
                    <label key={permission.key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission.key)}
                        onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Password Setup */}
        {mode === 'create' && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Password Setup
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Enter password (min 6 characters)"
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Confirm password"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              The user will be able to log in immediately with this password.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {mode === 'create' ? 'Create User' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
