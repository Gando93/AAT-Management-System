// Debug test to check feature flag loading
import { featureFlags } from './src/config/features.js';

console.log('Feature flags:', featureFlags);
console.log('FEATURE_PRICING_SEASONS:', featureFlags.FEATURE_PRICING_SEASONS);
console.log('FEATURE_RESOURCE_AVAILABILITY:', featureFlags.FEATURE_RESOURCE_AVAILABILITY);


