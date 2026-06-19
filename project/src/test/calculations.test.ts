/**
 * Tests for carbon footprint calculation utilities.
 * Covers calculateCarbon, validateActivityInput, getCarbonColor,
 * formatCarbon, and aggregateByCategory.
 */
import { describe, it, expect } from 'vitest';
import {
  calculateCarbon,
  validateActivityInput,
  getCarbonColor,
  formatCarbon,
  aggregateByCategory,
  CARBON_COEFFICIENTS,
  HUMAN_BOUNDS,
} from '../lib/calculations';

describe('calculateCarbon', () => {
  it('calculates car transport carbon correctly', () => {
    const result = calculateCarbon({ category: 'transport', activityType: 'car', value: 100, unit: 'km' });
    expect(result.carbonKg).toBe(18); // 0.18 * 100
    expect(result.category).toBe('transport');
    expect(result.activityType).toBe('car');
  });

  it('calculates bus transport carbon correctly', () => {
    const result = calculateCarbon({ category: 'transport', activityType: 'bus', value: 50, unit: 'km' });
    expect(result.carbonKg).toBe(4); // 0.08 * 50
  });

  it('calculates train transport carbon correctly', () => {
    const result = calculateCarbon({ category: 'transport', activityType: 'train', value: 100, unit: 'km' });
    expect(result.carbonKg).toBe(4.1); // 0.041 * 100
  });

  it('calculates plane transport carbon correctly', () => {
    const result = calculateCarbon({ category: 'transport', activityType: 'plane', value: 1000, unit: 'km' });
    expect(result.carbonKg).toBe(255); // 0.255 * 1000
  });

  it('returns zero carbon for walking', () => {
    const result = calculateCarbon({ category: 'transport', activityType: 'walking', value: 10, unit: 'km' });
    expect(result.carbonKg).toBe(0);
  });

  it('returns zero carbon for cycling', () => {
    const result = calculateCarbon({ category: 'transport', activityType: 'cycling', value: 20, unit: 'km' });
    expect(result.carbonKg).toBe(0);
  });

  it('calculates meat-heavy meal carbon correctly', () => {
    const result = calculateCarbon({ category: 'food', activityType: 'meat_heavy', value: 3, unit: 'meals' });
    expect(result.carbonKg).toBeCloseTo(9.9, 1); // 3.3 * 3
  });

  it('calculates vegan meal carbon correctly', () => {
    const result = calculateCarbon({ category: 'food', activityType: 'vegan', value: 2, unit: 'meals' });
    expect(result.carbonKg).toBe(1); // 0.5 * 2
  });

  it('calculates electricity carbon correctly', () => {
    const result = calculateCarbon({ category: 'energy', activityType: 'electricity', value: 10, unit: 'kWh' });
    expect(result.carbonKg).toBe(8.5); // 0.85 * 10
  });

  it('calculates gas carbon correctly', () => {
    const result = calculateCarbon({ category: 'energy', activityType: 'gas', value: 5, unit: 'kWh' });
    expect(result.carbonKg).toBe(10); // 2.0 * 5
  });

  it('rounds to 3 decimal places', () => {
    const result = calculateCarbon({ category: 'transport', activityType: 'train', value: 1, unit: 'km' });
    expect(result.carbonKg).toBe(0.041);
  });

  it('includes displayValue in result', () => {
    const result = calculateCarbon({ category: 'transport', activityType: 'car', value: 25, unit: 'km' });
    expect(result.displayValue).toBe('25 km');
  });

  it('uses fallback coefficient for unknown activity type', () => {
    const result = calculateCarbon({ category: 'transport', activityType: 'unknown', value: 10, unit: 'km' });
    expect(result.carbonKg).toBe(1); // fallback 0.1 * 10
  });
});

describe('validateActivityInput', () => {
  it('returns invalid for zero value', () => {
    const result = validateActivityInput({ category: 'transport', activityType: 'car', value: 0, unit: 'km' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('greater than zero');
  });

  it('returns invalid for negative value', () => {
    const result = validateActivityInput({ category: 'transport', activityType: 'car', value: -5, unit: 'km' });
    expect(result.valid).toBe(false);
  });

  it('returns invalid for value exceeding 10000', () => {
    const result = validateActivityInput({ category: 'transport', activityType: 'car', value: 10001, unit: 'km' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('maximum');
  });

  it('returns invalid for walking over daily limit', () => {
    const result = validateActivityInput({
      category: 'transport', activityType: 'walking',
      value: HUMAN_BOUNDS.daily.walking + 1, unit: 'km'
    });
    expect(result.valid).toBe(false);
    expect(result.error?.toLowerCase()).toContain('walking');
  });

  it('returns invalid for cycling over daily limit', () => {
    const result = validateActivityInput({
      category: 'transport', activityType: 'cycling',
      value: HUMAN_BOUNDS.daily.cycling + 1, unit: 'km'
    });
    expect(result.valid).toBe(false);
  });

  it('returns invalid for long transit without verification ticket', () => {
    const result = validateActivityInput({
      category: 'transport', activityType: 'car',
      value: 1001, unit: 'km', verificationTicket: false
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('verification ticket');
  });

  it('allows long transit with verification ticket', () => {
    const result = validateActivityInput({
      category: 'transport', activityType: 'car',
      value: 1001, unit: 'km', verificationTicket: true
    });
    expect(result.valid).toBe(true);
  });

  it('returns invalid for too many meals', () => {
    const result = validateActivityInput({
      category: 'food', activityType: 'vegan',
      value: HUMAN_BOUNDS.daily.meals + 1, unit: 'meals'
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('meals');
  });

  it('returns invalid for excessive energy usage', () => {
    const result = validateActivityInput({
      category: 'energy', activityType: 'electricity',
      value: HUMAN_BOUNDS.daily.energy_kwh + 1, unit: 'kWh'
    });
    expect(result.valid).toBe(false);
  });

  it('returns valid with warning for long car journey', () => {
    const result = validateActivityInput({
      category: 'transport', activityType: 'car',
      value: 501, unit: 'km', verificationTicket: true
    });
    expect(result.valid).toBe(true);
    expect(result.warning).toBeDefined();
    expect(result.warning).toContain('carpooling');
  });

  it('returns valid with warning for excessive meat consumption', () => {
    const result = validateActivityInput({
      category: 'food', activityType: 'meat_heavy',
      value: 4, unit: 'meals'
    });
    expect(result.valid).toBe(true);
    expect(result.warning).toBeDefined();
  });

  it('returns valid for normal car trip', () => {
    const result = validateActivityInput({
      category: 'transport', activityType: 'car', value: 25, unit: 'km'
    });
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns valid for normal food entry', () => {
    const result = validateActivityInput({
      category: 'food', activityType: 'vegetarian', value: 2, unit: 'meals'
    });
    expect(result.valid).toBe(true);
  });

  it('returns valid for normal energy entry', () => {
    const result = validateActivityInput({
      category: 'energy', activityType: 'electricity', value: 10, unit: 'kWh'
    });
    expect(result.valid).toBe(true);
  });
});

describe('getCarbonColor', () => {
  it('returns excellent (green) for very low carbon', () => {
    const result = getCarbonColor(2);
    expect(result.status).toBe('excellent');
    expect(result.color).toBe('#10b981');
  });

  it('returns good for moderate-low carbon', () => {
    const result = getCarbonColor(8);
    expect(result.status).toBe('good');
    expect(result.color).toBe('#34d399');
  });

  it('returns moderate for medium carbon', () => {
    const result = getCarbonColor(12);
    expect(result.status).toBe('moderate');
    expect(result.color).toBe('#f59e0b');
  });

  it('returns high for excessive carbon', () => {
    const result = getCarbonColor(20);
    expect(result.status).toBe('high');
    expect(result.color).toBe('#f43f5e');
  });

  it('respects custom threshold', () => {
    const result = getCarbonColor(8, 5);
    expect(result.status).toBe('high');
  });
});

describe('formatCarbon', () => {
  it('formats very small values with <0.01', () => {
    expect(formatCarbon(0.001)).toBe('<0.01 kg CO₂');
  });

  it('formats sub-1 kg values to 3 decimals', () => {
    expect(formatCarbon(0.5)).toBe('0.500 kg CO₂');
  });

  it('formats 1–100 kg values to 1 decimal', () => {
    expect(formatCarbon(14.567)).toBe('14.6 kg CO₂');
  });

  it('formats large values to 0 decimals', () => {
    expect(formatCarbon(150.7)).toBe('151 kg CO₂');
  });

  it('formats zero correctly', () => {
    expect(formatCarbon(0)).toBe('<0.01 kg CO₂');
  });
});

describe('aggregateByCategory', () => {
  it('sums up carbon by category', () => {
    const logs = [
      { category: 'transport', carbon_kg: 4.5 },
      { category: 'food', carbon_kg: 1.0 },
      { category: 'transport', carbon_kg: 2.0 },
      { category: 'energy', carbon_kg: 6.8 },
    ];
    const result = aggregateByCategory(logs);
    expect(result.transport).toBeCloseTo(6.5);
    expect(result.food).toBeCloseTo(1.0);
    expect(result.energy).toBeCloseTo(6.8);
  });

  it('returns zeros for empty logs', () => {
    const result = aggregateByCategory([]);
    expect(result.transport).toBe(0);
    expect(result.food).toBe(0);
    expect(result.energy).toBe(0);
  });

  it('ignores unknown categories', () => {
    const logs = [{ category: 'waste', carbon_kg: 5 }];
    const result = aggregateByCategory(logs);
    expect(result.transport).toBe(0);
    expect(result.food).toBe(0);
    expect(result.energy).toBe(0);
  });
});

describe('CARBON_COEFFICIENTS', () => {
  it('exports correct transport coefficients', () => {
    expect(CARBON_COEFFICIENTS.transport.car).toBe(0.18);
    expect(CARBON_COEFFICIENTS.transport.walking).toBe(0);
  });

  it('exports correct food coefficients', () => {
    expect(CARBON_COEFFICIENTS.food.meat_heavy).toBe(3.3);
    expect(CARBON_COEFFICIENTS.food.vegan).toBe(0.5);
  });

  it('exports correct energy coefficients', () => {
    expect(CARBON_COEFFICIENTS.energy.electricity).toBe(0.85);
    expect(CARBON_COEFFICIENTS.energy.gas).toBe(2.0);
  });
});
