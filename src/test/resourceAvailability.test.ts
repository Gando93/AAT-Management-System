import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ResourceAssignment } from '../lib/resourceAvailability';

// Mock the feature flags module
vi.mock('../config/features', () => ({
  featureFlags: {
    FEATURE_PRICING_SEASONS: false,
    FEATURE_RESOURCE_AVAILABILITY: true,
    FEATURE_GUIDES: false,
    FEATURE_ADDONS: false,
    FEATURE_POLICIES_DEPOSITS: false,
    FEATURE_COMMS: false,
    FEATURE_MANIFESTS: false,
    FEATURE_QR_CHECKIN: false,
    FEATURE_WAIVERS: false,
    FEATURE_PROMOS: false,
    FEATURE_AGENTS: false,
    FEATURE_REPORTS: false,
    FEATURE_INTEGRATIONS: false,
    FEATURE_MAINTENANCE: false,
    FEATURE_CHECKLISTS: false,
    FEATURE_INVENTORY: false,
    FEATURE_AUDIT: false,
    FEATURE_WEBHOOKS: false,
  },
  isFeatureEnabled: vi.fn((flag) => flag === 'FEATURE_RESOURCE_AVAILABILITY'),
  useFeatureFlag: vi.fn(),
  toggleFeatureFlag: vi.fn(),
}));

describe('Resource Availability Engine', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NODE_ENV = 'test';
    process.env.VITEST = 'true';
  });

  it('detects overlapping time ranges', async () => {
    vi.resetModules();
    const { rangesOverlap } = await import('../lib/resourceAvailability');
    expect(rangesOverlap({ start: '2024-01-01T10:00:00Z', end: '2024-01-01T12:00:00Z' }, { start: '2024-01-01T11:00:00Z', end: '2024-01-01T13:00:00Z' })).toBe(true);
    expect(rangesOverlap({ start: '2024-01-01T10:00:00Z', end: '2024-01-01T11:00:00Z' }, { start: '2024-01-01T11:00:00Z', end: '2024-01-01T12:00:00Z' })).toBe(false);
  });

  it('evaluates capacity correctly', async () => {
    vi.resetModules();
    const { evaluateCapacity } = await import('../lib/resourceAvailability');
    expect(evaluateCapacity({ maxCapacity: 10, bookedCount: 0 })).toBe('available');
    expect(evaluateCapacity({ maxCapacity: 10, bookedCount: 8 })).toBe('low');
    expect(evaluateCapacity({ maxCapacity: 10, bookedCount: 10 })).toBe('sold-out');
  });

  it('returns conflict when vehicles overlap', async () => {
    const { checkDepartureAvailability } = await import('../lib/resourceAvailability');
    const vehicleAssignments: ResourceAssignment[] = [
      { id: 'a1', resourceId: 'V1', date: '2024-01-01', start: '2024-01-01T10:00:00Z', end: '2024-01-01T12:00:00Z' },
      { id: 'a2', resourceId: 'V1', date: '2024-01-01', start: '2024-01-01T11:00:00Z', end: '2024-01-01T12:30:00Z' },
    ];
    const res = checkDepartureAvailability({
      date: '2024-01-01',
      capacity: { maxCapacity: 10, bookedCount: 2 },
      vehicleAssignments,
      guideAssignments: [],
    });
    expect(res.status).toBe('conflicted');
    expect(res.conflicts.some(c => c.includes('Vehicle'))).toBe(true);
  });

  it('returns conflict when guide exceeds daily hours', async () => {
    const { checkDepartureAvailability } = await import('../lib/resourceAvailability');
    const guideAssignments: ResourceAssignment[] = [
      { id: 'g1', resourceId: 'G1', date: '2024-01-02', start: '2024-01-02T08:00:00Z', end: '2024-01-02T13:00:00Z' },
      { id: 'g2', resourceId: 'G1', date: '2024-01-02', start: '2024-01-02T14:00:00Z', end: '2024-01-02T20:30:00Z' },
    ];
    const res = checkDepartureAvailability({
      date: '2024-01-02',
      capacity: { maxCapacity: 12, bookedCount: 5 },
      vehicleAssignments: [],
      guideAssignments,
      guideMaxDailyHours: 10,
    });
    expect(res.status).toBe('conflicted');
    expect(res.conflicts.some(c => c.includes('exceeds daily hours'))).toBe(true);
  });

  it('returns capacity status when no conflicts', async () => {
    vi.resetModules();
    const { checkDepartureAvailability } = await import('../lib/resourceAvailability');
    const res = checkDepartureAvailability({
      date: '2024-01-03',
      capacity: { maxCapacity: 10, bookedCount: 8 },
      vehicleAssignments: [],
      guideAssignments: [],
    });
    expect(res.status).toBe('low');
    expect(res.conflicts.length).toBe(0);
  });
});


