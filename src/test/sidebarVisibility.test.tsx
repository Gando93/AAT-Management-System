import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSidebarVisibility } from '../hooks/useSidebarVisibility';
import { SidebarVisibilityProvider } from '../context/SidebarVisibilityContext';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useSidebarVisibility Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with default visibility settings', () => {
    const { result } = renderHook(() => useSidebarVisibility(), {
      wrapper: ({ children }) => <SidebarVisibilityProvider>{children}</SidebarVisibilityProvider>
    });

    expect(result.current.visibility).toEqual({
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
    });
  });

  it('should load settings from localStorage on initialization', () => {
    const savedSettings = {
      policies: true,
      integrations: true,
      promotions: false,
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));

    const { result } = renderHook(() => useSidebarVisibility(), {
      wrapper: ({ children }) => <SidebarVisibilityProvider>{children}</SidebarVisibilityProvider>
    });

    expect(result.current.visibility).toEqual({
      policies: true,
      communications: false,
      'qr-tickets': false,
      waivers: false,
      promotions: false,
      agents: false,
      integrations: true,
      customers: false,
      inventory: false,
      checklists: false,
      webhooks: false,
    });
  });

  it('should update visibility and save to localStorage', () => {
    const { result } = renderHook(() => useSidebarVisibility(), {
      wrapper: ({ children }) => <SidebarVisibilityProvider>{children}</SidebarVisibilityProvider>
    });

    act(() => {
      result.current.updateVisibility('integrations', true);
    });

    expect(result.current.visibility.integrations).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'sidebarVisibility',
      JSON.stringify({
        policies: false,
        communications: false,
        'qr-tickets': false,
        waivers: false,
        promotions: false,
        agents: false,
        integrations: true,
        customers: false,
        inventory: false,
        checklists: false,
        webhooks: false,
      })
    );
  });

  it('should check module visibility correctly', () => {
    const { result } = renderHook(() => useSidebarVisibility(), {
      wrapper: ({ children }) => <SidebarVisibilityProvider>{children}</SidebarVisibilityProvider>
    });

    expect(result.current.isModuleVisible('integrations')).toBe(false);
    expect(result.current.isModuleVisible('policies')).toBe(false);

    act(() => {
      result.current.updateVisibility('integrations', true);
    });

    expect(result.current.isModuleVisible('integrations')).toBe(true);
    expect(result.current.isModuleVisible('policies')).toBe(false);
  });

  it('should reset to defaults correctly', () => {
    const { result } = renderHook(() => useSidebarVisibility(), {
      wrapper: ({ children }) => <SidebarVisibilityProvider>{children}</SidebarVisibilityProvider>
    });

    // First, update some settings one by one
    act(() => {
      result.current.updateVisibility('integrations', true);
    });
    expect(result.current.visibility.integrations).toBe(true);

    act(() => {
      result.current.updateVisibility('policies', true);
    });
    expect(result.current.visibility.policies).toBe(true);

    // Then reset
    act(() => {
      result.current.resetToDefaults();
    });

    // Check that reset worked
    expect(result.current.visibility).toEqual({
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
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'sidebarVisibility',
      JSON.stringify({
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
      })
    );
  });

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useSidebarVisibility(), {
      wrapper: ({ children }) => <SidebarVisibilityProvider>{children}</SidebarVisibilityProvider>
    });

    act(() => {
      result.current.updateVisibility('integrations', true);
    });

    expect(result.current.visibility.integrations).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save sidebar visibility settings:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should handle invalid localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useSidebarVisibility(), {
      wrapper: ({ children }) => <SidebarVisibilityProvider>{children}</SidebarVisibilityProvider>
    });

    expect(result.current.visibility).toEqual({
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
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load sidebar visibility settings:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should handle multiple rapid updates correctly', () => {
    const { result } = renderHook(() => useSidebarVisibility(), {
      wrapper: ({ children }) => <SidebarVisibilityProvider>{children}</SidebarVisibilityProvider>
    });

    // Update each setting individually to ensure state updates are applied
    act(() => {
      result.current.updateVisibility('integrations', true);
    });
    expect(result.current.visibility.integrations).toBe(true);

    act(() => {
      result.current.updateVisibility('policies', true);
    });
    expect(result.current.visibility.policies).toBe(true);

    act(() => {
      result.current.updateVisibility('promotions', true);
    });
    expect(result.current.visibility.promotions).toBe(true);

    // Check that agents is still false
    expect(result.current.visibility.agents).toBe(false);
  });
});


