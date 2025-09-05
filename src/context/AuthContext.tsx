import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, PasswordSetup } from '../types';
import { dataStore, initializeData, clearAndReinitialize } from '../lib/storage';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  setupPassword: (data: PasswordSetup) => Promise<{ success: boolean; message: string }>;
  updateUser: (user: User) => void;
  checkPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Simple password hashing (in production, use bcrypt or similar)
const hashPassword = (password: string): string => {
  return btoa(password + 'salt'); // Simple base64 encoding for demo
};

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

// Permission definitions
const ROLE_PERMISSIONS = {
  Administrator: [
    'dashboard.read',
    'users.create', 'users.read', 'users.update', 'users.delete',
    'bookings.create', 'bookings.read', 'bookings.update', 'bookings.delete',
    'tours.create', 'tours.read', 'tours.update', 'tours.delete',
    'customers.create', 'customers.read', 'customers.update', 'customers.delete',
    'vehicles.create', 'vehicles.read', 'vehicles.update', 'vehicles.delete',
    'reports.read', 'integrations.read', 'settings.read', 'settings.update'
  ],
  Manager: [
    'dashboard.read',
    'users.read', 'users.update',
    'bookings.create', 'bookings.read', 'bookings.update', 'bookings.delete',
    'tours.create', 'tours.read', 'tours.update', 'tours.delete',
    'customers.create', 'customers.read', 'customers.update', 'customers.delete',
    'vehicles.create', 'vehicles.read', 'vehicles.update', 'vehicles.delete',
    'reports.read', 'integrations.read', 'settings.read'
  ],
  Agent: [
    'dashboard.read',
    'bookings.create', 'bookings.read', 'bookings.update',
    'tours.read',
    'customers.create', 'customers.read', 'customers.update',
    'vehicles.read',
    'reports.read'
  ],
  Viewer: [
    'dashboard.read',
    'bookings.read', 'tours.read', 'customers.read', 'vehicles.read', 'reports.read'
  ]
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentUser: null,
    token: null
  });


  // Initialize data and check for existing session on mount
  useEffect(() => {
    // Initialize data first
    initializeData();
    
    // Add debug function to window for troubleshooting
    (window as unknown as { clearAndReinitializeAAT?: () => void }).clearAndReinitializeAAT = clearAndReinitialize;
    
    // Small delay to ensure data is initialized
    setTimeout(() => {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('currentUserId');
      
      if (token && userId) {
        const users = dataStore.users.getAll();
        const user = users.find((u: User) => u.id === userId);
        
        if (user && user.status === 'active') {
          setAuthState({
            isAuthenticated: true,
            currentUser: user,
            token
          });
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUserId');
        }
      }
    }, 100);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message: string }> => {
    try {
      // Ensure data is initialized before login attempt
      initializeData();
      
      // Add a small delay to ensure localStorage operations complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const users = dataStore.users.getAll();
      const user = users.find((u: User) => u.email.toLowerCase() === credentials.email.toLowerCase());
      
      if (!user) {
        // Try one more time after reinitializing
        initializeData();
        await new Promise(resolve => setTimeout(resolve, 50));
        const usersRetry = dataStore.users.getAll();
        const userRetry = usersRetry.find((u: User) => u.email.toLowerCase() === credentials.email.toLowerCase());
        
        if (!userRetry) {
          return { success: false, message: 'User not found' };
        }
        
        // Use the retry user
        const finalUser = userRetry;
        if (finalUser.status !== 'active') {
          return { success: false, message: 'Account is inactive' };
        }
        
        if (finalUser.needsPasswordSetup) {
          return { success: false, message: 'Password setup required' };
        }
        
        if (!finalUser.password || !verifyPassword(credentials.password, finalUser.password)) {
          return { success: false, message: 'Invalid password' };
        }
        
        // Update last login
        const updatedUser = { ...finalUser, lastLogin: new Date().toISOString() };
        dataStore.users.update(updatedUser.id, updatedUser);
        
        const token = btoa(JSON.stringify({ userId: finalUser.id, timestamp: Date.now() }));
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUserId', finalUser.id);
        
        setAuthState({
          isAuthenticated: true,
          currentUser: updatedUser,
          token
        });
        
        return { success: true, message: 'Login successful' };
      }
      
      if (user.status !== 'active') {
        return { success: false, message: 'Account is inactive' };
      }
      
      if (user.needsPasswordSetup) {
        return { success: false, message: 'Password setup required' };
      }
      
      if (!user.password || !verifyPassword(credentials.password, user.password)) {
        return { success: false, message: 'Invalid password' };
      }
      
      // Update last login
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      dataStore.users.update(updatedUser.id, updatedUser);
      
      const token = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUserId', user.id);
      
      setAuthState({
        isAuthenticated: true,
        currentUser: updatedUser,
        token
      });
      
      return { success: true, message: 'Login successful' };
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  };

  const setupPassword = async (data: PasswordSetup): Promise<{ success: boolean; message: string }> => {
    try {
      if (data.password !== data.confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }
      
      if (data.password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
      }
      
      const users = dataStore.users.getAll();
      const user = users.find((u: User) => u.email.toLowerCase() === data.email.toLowerCase());
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      const updatedUser = {
        ...user,
        password: hashPassword(data.password),
        needsPasswordSetup: false,
        lastLogin: new Date().toISOString()
      };
      
      dataStore.users.update(updatedUser.id, updatedUser);
      
      const token = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUserId', user.id);
      
      setAuthState({
        isAuthenticated: true,
        currentUser: updatedUser,
        token
      });
      
      return { success: true, message: 'Password setup successful' };
    } catch (error) {
      return { success: false, message: 'Password setup failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUserId');
    setAuthState({
      isAuthenticated: false,
      currentUser: null,
      token: null
    });
  };

  const updateUser = (user: User) => {
    if (authState.currentUser?.id === user.id) {
      setAuthState(prev => ({
        ...prev,
        currentUser: user
      }));
    }
  };

  const checkPermission = (permission: string): boolean => {
    if (!authState.currentUser) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[authState.currentUser.role as keyof typeof ROLE_PERMISSIONS] || [];
    return rolePermissions.includes(permission);
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    setupPassword,
    updateUser,
    checkPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
