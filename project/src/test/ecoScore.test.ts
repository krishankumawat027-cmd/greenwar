/**
 * Tests for the eco score utility library.
 */
import { describe, it, expect } from 'vitest';
import {
  calculateEcoScore,
  calculateCarbonSaved,
  getAISustainabilityRecommendations,
  getDailyGreenChallenges,
  getAchievements,
  GLOBAL_WEEKLY_AVG_KG,
} from '../lib/ecoScore';

describe('calculateEcoScore', () => {
  it('returns score of 100 for zero carbon', () => {
    const result = calculateEcoScore(0);
    expect(result.score).toBe(100);
    expect(result.grade).toBe('A');
    expect(result.label).toBe('Excellent');
  });

  it('returns A grade for 80+ score', () => {
    const result = calculateEcoScore(10);
    expect(result.grade).toBe('A');
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it('returns B grade for 60–79 score', () => {
    // 60% of 112 = 67.2 kg → score ~40... actually: score = 100 - (67.2/112*100) = 40
    // For B grade (60-79): totalCarbon = 112 * (1 - score/100)
    // score=70 → totalCarbon = 33.6
    const result = calculateEcoScore(34);
    expect(result.grade).toBe('B');
  });

  it('returns C grade for 40–59 score', () => {
    // score=50 → totalCarbon = 56
    const result = calculateEcoScore(56);
    expect(result.grade).toBe('C');
  });

  it('returns D grade for 20–39 score', () => {
    // score=30 → totalCarbon = 78.4
    const result = calculateEcoScore(79);
    expect(result.grade).toBe('D');
  });

  it('returns F grade for score below 20', () => {
    const result = calculateEcoScore(110);
    expect(result.grade).toBe('F');
    expect(result.label).toBe('Critical');
  });

  it('clamps score at 0 for very high carbon', () => {
    const result = calculateEcoScore(9999);
    expect(result.score).toBe(0);
  });

  it('calculates carbonSavedKg correctly', () => {
    const result = calculateEcoScore(50);
    expect(result.carbonSavedKg).toBeCloseTo(62, 0);
  });

  it('returns zero carbonSaved when over average', () => {
    const result = calculateEcoScore(200);
    expect(result.carbonSavedKg).toBe(0);
  });

  it('includes a color string', () => {
    const result = calculateEcoScore(10);
    expect(result.color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('includes percentBelowAverage', () => {
    const result = calculateEcoScore(0);
    expect(result.percentBelowAverage).toBe(100);
  });
});

describe('calculateCarbonSaved', () => {
  it('returns positive savings when below average', () => {
    const saved = calculateCarbonSaved(50);
    expect(saved).toBeCloseTo(62, 0);
  });

  it('returns 0 when above global average', () => {
    const saved = calculateCarbonSaved(200);
    expect(saved).toBe(0);
  });

  it('returns full average when carbon is 0', () => {
    const saved = calculateCarbonSaved(0);
    expect(saved).toBe(GLOBAL_WEEKLY_AVG_KG);
  });
});

describe('getAISustainabilityRecommendations', () => {
  it('returns an array of recommendations', () => {
    const recs = getAISustainabilityRecommendations({ transport: 5, food: 5, energy: 5 });
    expect(Array.isArray(recs)).toBe(true);
    expect(recs.length).toBeGreaterThan(0);
  });

  it('returns high priority transport recommendation for high emissions', () => {
    const recs = getAISustainabilityRecommendations({ transport: 25, food: 5, energy: 5 });
    const transportRec = recs.find(r => r.category === 'transport');
    expect(transportRec?.priority).toBe('high');
  });

  it('returns high priority food recommendation for high meat consumption', () => {
    const recs = getAISustainabilityRecommendations({ transport: 5, food: 20, energy: 5 });
    const foodRec = recs.find(r => r.category === 'food');
    expect(foodRec?.priority).toBe('high');
  });

  it('returns high priority energy recommendation for high usage', () => {
    const recs = getAISustainabilityRecommendations({ transport: 5, food: 5, energy: 30 });
    const energyRec = recs.find(r => r.category === 'energy');
    expect(energyRec?.priority).toBe('high');
  });

  it('returns low priority recommendations for low-impact users', () => {
    const recs = getAISustainabilityRecommendations({ transport: 2, food: 2, energy: 2 });
    const highPriority = recs.filter(r => r.priority === 'high');
    expect(highPriority.length).toBe(0);
  });

  it('always includes a general recommendation', () => {
    const recs = getAISustainabilityRecommendations({ transport: 5, food: 5, energy: 5 });
    const general = recs.find(r => r.category === 'general');
    expect(general).toBeDefined();
  });

  it('sorts by priority (high first)', () => {
    const recs = getAISustainabilityRecommendations({ transport: 30, food: 20, energy: 30 });
    expect(recs[0].priority).toBe('high');
  });

  it('each recommendation has required fields', () => {
    const recs = getAISustainabilityRecommendations({ transport: 5, food: 5, energy: 5 });
    recs.forEach(rec => {
      expect(rec.id).toBeTruthy();
      expect(rec.title).toBeTruthy();
      expect(rec.description).toBeTruthy();
      expect(rec.icon).toBeTruthy();
      expect(typeof rec.potentialSavingKg).toBe('number');
    });
  });
});

describe('getDailyGreenChallenges', () => {
  it('returns an array of challenges', () => {
    const challenges = getDailyGreenChallenges();
    expect(Array.isArray(challenges)).toBe(true);
    expect(challenges.length).toBeGreaterThan(0);
  });

  it('all challenges start as not completed', () => {
    const challenges = getDailyGreenChallenges();
    challenges.forEach(c => {
      expect(c.completed).toBe(false);
    });
  });

  it('each challenge has required fields', () => {
    const challenges = getDailyGreenChallenges();
    challenges.forEach(c => {
      expect(c.id).toBeTruthy();
      expect(c.title).toBeTruthy();
      expect(c.description).toBeTruthy();
      expect(typeof c.carbonSavingKg).toBe('number');
      expect(typeof c.points).toBe('number');
      expect(c.points).toBeGreaterThan(0);
    });
  });

  it('covers multiple categories', () => {
    const challenges = getDailyGreenChallenges();
    const categories = new Set(challenges.map(c => c.category));
    expect(categories.size).toBeGreaterThan(1);
  });
});

describe('getAchievements', () => {
  it('unlocks First Step after 1 log', () => {
    const achievements = getAchievements(1, 50, 0, 50);
    const badge = achievements.find(a => a.id === 'ach-first-log');
    expect(badge?.unlocked).toBe(true);
  });

  it('does not unlock First Step with no logs', () => {
    const achievements = getAchievements(0, 0, 0, 50);
    const badge = achievements.find(a => a.id === 'ach-first-log');
    expect(badge?.unlocked).toBe(false);
  });

  it('unlocks Consistent Tracker at 10 logs', () => {
    const achievements = getAchievements(10, 20, 0, 70);
    const badge = achievements.find(a => a.id === 'ach-ten-logs');
    expect(badge?.unlocked).toBe(true);
  });

  it('unlocks Green Week for low carbon footprint', () => {
    const achievements = getAchievements(5, 10, 0, 80);
    const badge = achievements.find(a => a.id === 'ach-low-carbon');
    expect(badge?.unlocked).toBe(true);
  });

  it('does not unlock Green Week for zero logs', () => {
    const achievements = getAchievements(0, 0, 0, 0);
    const badge = achievements.find(a => a.id === 'ach-low-carbon');
    expect(badge?.unlocked).toBe(false);
  });

  it('unlocks Eco Champion at score 80', () => {
    const achievements = getAchievements(5, 10, 0, 80);
    const badge = achievements.find(a => a.id === 'ach-eco-champion');
    expect(badge?.unlocked).toBe(true);
  });

  it('unlocks Challenger at 1 completed challenge', () => {
    const achievements = getAchievements(1, 50, 1, 50);
    const badge = achievements.find(a => a.id === 'ach-challenger');
    expect(badge?.unlocked).toBe(true);
  });

  it('returns all 8 achievement types', () => {
    const achievements = getAchievements(0, 0, 0, 0);
    expect(achievements.length).toBe(8);
  });

  it('each achievement has required fields', () => {
    const achievements = getAchievements(0, 0, 0, 0);
    achievements.forEach(a => {
      expect(a.id).toBeTruthy();
      expect(a.title).toBeTruthy();
      expect(a.description).toBeTruthy();
      expect(a.icon).toBeTruthy();
      expect(typeof a.unlocked).toBe('boolean');
    });
  });
});
