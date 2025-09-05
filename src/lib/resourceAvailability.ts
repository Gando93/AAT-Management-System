import { featureFlags } from '../config/features';

export interface TimeRange {
  start: string; // ISO datetime
  end: string;   // ISO datetime
}

export interface ResourceAssignment extends TimeRange {
  id: string;
  resourceId: string; // vehicleId or guideId
  date: string; // YYYY-MM-DD for daily grouping
}

export interface CapacityInfo {
  maxCapacity: number;
  bookedCount: number;
}

export type AvailabilityStatus = 'available' | 'low' | 'sold-out' | 'conflicted';

export interface AvailabilityResult {
  status: AvailabilityStatus;
  conflicts: string[]; // human-readable conflict messages
}

const clampToDay = (iso: string): string => new Date(iso).toISOString().slice(0, 10);

export const rangesOverlap = (a: TimeRange, b: TimeRange): boolean => {
  const aStart = new Date(a.start).getTime();
  const aEnd = new Date(a.end).getTime();
  const bStart = new Date(b.start).getTime();
  const bEnd = new Date(b.end).getTime();
  return aStart < bEnd && bStart < aEnd;
};

const msToHours = (ms: number): number => ms / (1000 * 60 * 60);

export const sumDailyHours = (assignments: ResourceAssignment[], date: string): number => {
  const target = date;
  let totalMs = 0;
  for (const a of assignments) {
    if (clampToDay(a.start) !== target) continue;
    const start = new Date(a.start).getTime();
    const end = new Date(a.end).getTime();
    if (end > start) totalMs += (end - start);
  }
  return Number(msToHours(totalMs).toFixed(2));
};

export const findOverlapConflicts = (assignments: ResourceAssignment[]): ResourceAssignment[][] => {
  const conflicts: ResourceAssignment[][] = [];
  const byResource = new Map<string, ResourceAssignment[]>();
  for (const a of assignments) {
    const arr = byResource.get(a.resourceId) || [];
    arr.push(a);
    byResource.set(a.resourceId, arr);
  }
  for (const group of byResource.values()) {
    group.sort((x, y) => new Date(x.start).getTime() - new Date(y.start).getTime());
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        if (rangesOverlap(group[i], group[j])) {
          conflicts.push([group[i], group[j]]);
        }
      }
    }
  }
  return conflicts;
};

export const evaluateCapacity = ({ maxCapacity, bookedCount }: CapacityInfo): AvailabilityStatus => {
  if (bookedCount >= maxCapacity) return 'sold-out';
  if (bookedCount >= Math.max(1, Math.floor(maxCapacity * 0.8))) return 'low';
  return 'available';
};

export interface DepartureCheckInput {
  date: string; // YYYY-MM-DD
  capacity: CapacityInfo;
  vehicleAssignments: ResourceAssignment[];
  guideAssignments: ResourceAssignment[];
  guideMaxDailyHours?: number; // optional policy threshold
}

export const checkDepartureAvailability = (input: DepartureCheckInput): AvailabilityResult => {
  // Feature-gated: if disabled, report available without checks
  if (!featureFlags.FEATURE_RESOURCE_AVAILABILITY) {
    return { status: evaluateCapacity(input.capacity), conflicts: [] };
  }

  const conflicts: string[] = [];

  // Overlap conflicts
  const vehicleOverlaps = findOverlapConflicts(input.vehicleAssignments);
  if (vehicleOverlaps.length > 0) {
    conflicts.push('Vehicle schedule conflict');
  }
  const guideOverlaps = findOverlapConflicts(input.guideAssignments);
  if (guideOverlaps.length > 0) {
    conflicts.push('Guide schedule conflict');
  }

  // Daily hours for guides
  const threshold = input.guideMaxDailyHours ?? 10;
  const byGuide = new Map<string, ResourceAssignment[]>();
  for (const g of input.guideAssignments) {
    const arr = byGuide.get(g.resourceId) || [];
    arr.push(g);
    byGuide.set(g.resourceId, arr);
  }
  for (const [guideId, arr] of byGuide) {
    const hours = sumDailyHours(arr, input.date);
    if (hours > threshold) {
      conflicts.push(`Guide ${guideId} exceeds daily hours (${hours}h > ${threshold}h)`);
    }
  }

  // Capacity
  const capacityStatus = evaluateCapacity(input.capacity);

  if (conflicts.length > 0) return { status: 'conflicted', conflicts };
  return { status: capacityStatus, conflicts };
};




