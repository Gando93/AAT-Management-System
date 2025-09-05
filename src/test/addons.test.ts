import { describe, it, expect, beforeEach } from 'vitest';
import type { Addon } from '../types/addons';

describe('Add-ons Functionality', () => {
  let addons: Addon[];

  beforeEach(() => {
    addons = [
      {
        id: 'addon1',
        name: 'Lunch',
        description: 'Included lunch',
        basePrice: 25,
        currency: 'EUR',
        pricingType: 'per_booking',
        category: 'food',
        isActive: true,
        requiresQuantity: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'addon2',
        name: 'Photography',
        description: 'Professional photos',
        basePrice: 50,
        currency: 'EUR',
        pricingType: 'per_person',
        category: 'service',
        isActive: true,
        requiresQuantity: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'addon3',
        name: 'Equipment Rental',
        description: 'Hiking equipment',
        basePrice: 15,
        currency: 'EUR',
        pricingType: 'per_person',
        category: 'equipment',
        isActive: true,
        requiresQuantity: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];
  });

  describe('Add-on Pricing Calculations', () => {
    it('should calculate per_booking add-ons correctly', () => {
      const selectedAddons = [
        { ...addons[0], selected: true, quantity: 1 }, // Lunch - per_booking
      ];
      const pax = { adults: 2, children: 1 };

      const total = selectedAddons.reduce((sum, addon) => {
        if (addon.selected) {
                  if (addon.pricingType === 'per_booking') {
          return sum + (addon.basePrice * addon.quantity);
        } else {
          return sum + (addon.basePrice * addon.quantity * (pax.adults + pax.children));
        }
        }
        return sum;
      }, 0);

      expect(total).toBe(25); // 1 * 25 = 25
    });

    it('should calculate per_pax add-ons correctly', () => {
      const selectedAddons = [
        { ...addons[1], selected: true, quantity: 1 }, // Photography - per_pax
      ];
      const pax = { adults: 2, children: 1 };

      const total = selectedAddons.reduce((sum, addon) => {
        if (addon.selected) {
                  if (addon.pricingType === 'per_booking') {
          return sum + (addon.basePrice * addon.quantity);
        } else {
          return sum + (addon.basePrice * addon.quantity * (pax.adults + pax.children));
        }
        }
        return sum;
      }, 0);

      expect(total).toBe(150); // 1 * 50 * 3 = 150
    });

    it('should calculate mixed add-on types correctly', () => {
      const selectedAddons = [
        { ...addons[0], selected: true, quantity: 1 }, // Lunch - per_booking: 25
        { ...addons[1], selected: true, quantity: 1 }, // Photography - per_pax: 50 * 3 = 150
        { ...addons[2], selected: true, quantity: 2 }, // Equipment - per_pax: 15 * 2 * 3 = 90
      ];
      const pax = { adults: 2, children: 1 };

      const total = selectedAddons.reduce((sum, addon) => {
        if (addon.selected) {
                  if (addon.pricingType === 'per_booking') {
          return sum + (addon.basePrice * addon.quantity);
        } else {
          return sum + (addon.basePrice * addon.quantity * (pax.adults + pax.children));
        }
        }
        return sum;
      }, 0);

      expect(total).toBe(265); // 25 + 150 + 90 = 265
    });

    it('should handle quantity variations correctly', () => {
      const selectedAddons = [
        { ...addons[1], selected: true, quantity: 2 }, // Photography - per_pax: 50 * 2 * 3 = 300
      ];
      const pax = { adults: 2, children: 1 };

      const total = selectedAddons.reduce((sum, addon) => {
        if (addon.selected) {
                  if (addon.pricingType === 'per_booking') {
          return sum + (addon.basePrice * addon.quantity);
        } else {
          return sum + (addon.basePrice * addon.quantity * (pax.adults + pax.children));
        }
        }
        return sum;
      }, 0);

      expect(total).toBe(300); // 2 * 50 * 3 = 300
    });
  });

  describe('Add-on Eligibility Filtering', () => {
    it('should filter add-ons by tour eligibility', () => {
      const tourEligibleAddons = addons.filter(addon => 
        addon.category === 'food' || addon.category === 'service'
      );

      expect(tourEligibleAddons).toHaveLength(2);
      expect(tourEligibleAddons.map(a => a.name)).toEqual(['Lunch', 'Photography']);
    });

    it('should filter add-ons by active status', () => {
      const inactiveAddon = { ...addons[0], isActive: false };
      const allAddons = [...addons, inactiveAddon];

      const activeAddons = allAddons.filter(addon => addon.isActive);

      expect(activeAddons).toHaveLength(3);
      expect(activeAddons.every(addon => addon.isActive)).toBe(true);
    });

    it('should filter add-ons by availability rules', () => {
      const addonWithTourRestriction = {
        ...addons[0],
        availabilityRules: {
          tourIds: ['tour1', 'tour2'],
        },
      };

      const isEligibleForTour = (addon: Addon, tourId: string) => {
        if (!addon.availabilityRules?.tourIds) return true;
        return addon.availabilityRules.tourIds.includes(tourId);
      };

      expect(isEligibleForTour(addonWithTourRestriction, 'tour1')).toBe(true);
      expect(isEligibleForTour(addonWithTourRestriction, 'tour3')).toBe(false);
      expect(isEligibleForTour(addons[0], 'any-tour')).toBe(true); // No restrictions
    });
  });

  describe('Add-on Selection State Management', () => {
    it('should toggle add-on selection correctly', () => {
      const addon = { ...addons[0], selected: false, quantity: 0 };

      const toggleAddon = (addon: any) => ({
        ...addon,
        selected: !addon.selected,
        quantity: addon.selected ? 0 : 1,
      });

      const toggled = toggleAddon(addon);
      expect(toggled.selected).toBe(true);
      expect(toggled.quantity).toBe(1);

      const toggledAgain = toggleAddon(toggled);
      expect(toggledAgain.selected).toBe(false);
      expect(toggledAgain.quantity).toBe(0);
    });

    it('should update add-on quantity correctly', () => {
      const addon = { ...addons[0], selected: true, quantity: 1 };

      const updateQuantity = (addon: any, newQuantity: number) => ({
        ...addon,
        quantity: Math.max(0, newQuantity),
      });

      const updated = updateQuantity(addon, 3);
      expect(updated.quantity).toBe(3);

      const updatedNegative = updateQuantity(addon, -1);
      expect(updatedNegative.quantity).toBe(0);
    });
  });
});