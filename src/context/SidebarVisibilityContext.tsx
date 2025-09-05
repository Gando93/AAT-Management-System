import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SidebarVisibilitySettings {
  [key: string]: boolean;
}

interface SidebarVisibilityContextType {
  visibility: SidebarVisibilitySettings;
  setVisibility: (moduleId: string, visible: boolean) => void;
  reset: () => void;
  isModuleVisible: (moduleId: string) => boolean;
}

const SIDEBAR_VISIBILITY_KEY = 'sidebarVisibility';

// Default visibility settings for advanced modules
const defaultVisibility: SidebarVisibilitySettings = {
  policies: false,
  communications: false,
  'qr-tickets': false,
  waivers: false,
  promotions: false,
  agents: false,
  integrations: false,
  customers: false,
  inventory: false,
  checklists: false,
  webhooks: false,
};

const SidebarVisibilityContext = createContext<SidebarVisibilityContextType | undefined>(undefined);

export const useSidebarVisibility = () => {
  const context = useContext(SidebarVisibilityContext);
  if (!context) {
    throw new Error('useSidebarVisibility must be used within a SidebarVisibilityProvider');
  }
  return context;
};

interface SidebarVisibilityProviderProps {
  children: React.ReactNode;
}

export const SidebarVisibilityProvider: React.FC<SidebarVisibilityProviderProps> = ({ children }) => {
  const [visibility, setVisibilityState] = useState<SidebarVisibilitySettings>(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_VISIBILITY_KEY);
      if (stored) {
        return { ...defaultVisibility, ...JSON.parse(stored) };
      }
      return defaultVisibility;
    } catch (error) {
      console.warn('Failed to load sidebar visibility settings:', error);
      return defaultVisibility;
    }
  });

  // Listen for storage changes across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SIDEBAR_VISIBILITY_KEY && e.newValue) {
        try {
          const newVisibility = { ...defaultVisibility, ...JSON.parse(e.newValue) };
          setVisibilityState(newVisibility);
        } catch (error) {
          console.warn('Failed to parse sidebar visibility from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setVisibility = useCallback((moduleId: string, visible: boolean) => {
    const newVisibility = { ...visibility, [moduleId]: visible };
    setVisibilityState(newVisibility);
    
    try {
      localStorage.setItem(SIDEBAR_VISIBILITY_KEY, JSON.stringify(newVisibility));
    } catch (error) {
      console.warn('Failed to save sidebar visibility settings:', error);
    }
  }, [visibility]);

  const reset = useCallback(() => {
    setVisibilityState(defaultVisibility);
    try {
      localStorage.setItem(SIDEBAR_VISIBILITY_KEY, JSON.stringify(defaultVisibility));
    } catch (error) {
      console.warn('Failed to reset sidebar visibility settings:', error);
    }
  }, []);

  const isModuleVisible = useCallback((moduleId: string): boolean => {
    return visibility[moduleId] || false;
  }, [visibility]);

  const value: SidebarVisibilityContextType = {
    visibility,
    setVisibility,
    reset,
    isModuleVisible,
  };

  return (
    <SidebarVisibilityContext.Provider value={value}>
      {children}
    </SidebarVisibilityContext.Provider>
  );
};
