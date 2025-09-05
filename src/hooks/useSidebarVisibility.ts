import { useSidebarVisibility as useSidebarVisibilityContext } from '../context/SidebarVisibilityContext';

// Re-export the context hook for backward compatibility
export const useSidebarVisibility = () => {
  const context = useSidebarVisibilityContext();
  
  // Map the context methods to the old interface for backward compatibility
  return {
    visibility: context.visibility,
    updateVisibility: context.setVisibility,
    isModuleVisible: context.isModuleVisible,
    resetToDefaults: context.reset,
  };
};
