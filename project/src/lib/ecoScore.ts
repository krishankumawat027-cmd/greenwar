/**
 * Eco Score & Sustainability Utilities
 *
 * Provides calculations for:
 * - Eco Score (0–100 scale)
 * - Carbon saved vs. global average
 * - AI-driven sustainability recommendations
 * - Daily green challenges
 * - Achievement badges
 */

// Global average weekly carbon footprint: ~112 kg CO₂/week (16 kg/day × 7)
export const GLOBAL_WEEKLY_AVG_KG = 112;

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface SustainabilityRecommendation {
  id: string;
  category: 'transport' | 'food' | 'energy' | 'general';
  title: string;
  description: string;
  potentialSavingKg: number;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  carbonSavingKg: number;
  points: number;
  category: 'transport' | 'food' | 'energy' | 'waste' | 'general';
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface EcoScoreResult {
  score: number;          // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;
  color: string;
  carbonSavedKg: number;
  percentBelowAverage: number;
}

// ------------------------------------------------------------------
// Eco Score
// ------------------------------------------------------------------

/**
 * Calculate an Eco Score (0–100) based on weekly carbon footprint.
 * Score = 100 – (totalCarbon / GLOBAL_WEEKLY_AVG_KG × 100), clamped 0–100.
 * A higher score means a smaller footprint.
 */
export function calculateEcoScore(totalCarbonKg: number): EcoScoreResult {
  const raw = Math.max(0, 100 - (totalCarbonKg / GLOBAL_WEEKLY_AVG_KG) * 100);
  const score = Math.round(Math.min(100, raw));

  let grade: EcoScoreResult['grade'];
  let label: string;
  let color: string;

  if (score >= 80) {
    grade = 'A'; label = 'Excellent'; color = '#10b981';
  } else if (score >= 60) {
    grade = 'B'; label = 'Good'; color = '#34d399';
  } else if (score >= 40) {
    grade = 'C'; label = 'Moderate'; color = '#f59e0b';
  } else if (score >= 20) {
    grade = 'D'; label = 'High Impact'; color = '#f97316';
  } else {
    grade = 'F'; label = 'Critical'; color = '#f43f5e';
  }

  const carbonSavedKg = Math.max(0, GLOBAL_WEEKLY_AVG_KG - totalCarbonKg);
  const percentBelowAverage = Math.round((carbonSavedKg / GLOBAL_WEEKLY_AVG_KG) * 100);

  return { score, grade, label, color, carbonSavedKg, percentBelowAverage };
}

// ------------------------------------------------------------------
// Carbon Saved Calculation
// ------------------------------------------------------------------

/**
 * Calculate how much carbon was saved compared to the global weekly average.
 * Returns 0 if the user emitted more than average.
 */
export function calculateCarbonSaved(totalCarbonKg: number): number {
  return Math.max(0, GLOBAL_WEEKLY_AVG_KG - totalCarbonKg);
}

// ------------------------------------------------------------------
// AI Sustainability Recommendations
// ------------------------------------------------------------------

/**
 * Generate personalised sustainability recommendations based on
 * the user's category breakdown. Returns recommendations sorted by
 * priority (high → medium → low).
 */
export function getAISustainabilityRecommendations(
  categoryTotals: { transport: number; food: number; energy: number }
): SustainabilityRecommendation[] {
  const recommendations: SustainabilityRecommendation[] = [];

  // Transport recommendations
  if (categoryTotals.transport > 20) {
    recommendations.push({
      id: 'rec-transport-1',
      category: 'transport',
      title: 'Switch to Public Transport',
      description: 'Your transport emissions are high. Taking the bus instead of car can cut transport CO₂ by up to 55%.',
      potentialSavingKg: categoryTotals.transport * 0.55,
      priority: 'high',
      icon: '🚌',
    });
  } else if (categoryTotals.transport > 10) {
    recommendations.push({
      id: 'rec-transport-2',
      category: 'transport',
      title: 'Try Cycling for Short Trips',
      description: 'For trips under 5 km, cycling produces zero emissions and improves your health.',
      potentialSavingKg: categoryTotals.transport * 0.3,
      priority: 'medium',
      icon: '🚲',
    });
  } else {
    recommendations.push({
      id: 'rec-transport-3',
      category: 'transport',
      title: 'Great Low-Carbon Travel!',
      description: 'Your transport footprint is already below average. Consider electric vehicles for further reduction.',
      potentialSavingKg: categoryTotals.transport * 0.1,
      priority: 'low',
      icon: '⚡',
    });
  }

  // Food recommendations
  if (categoryTotals.food > 15) {
    recommendations.push({
      id: 'rec-food-1',
      category: 'food',
      title: 'Reduce Red Meat Consumption',
      description: 'Beef and lamb have the highest carbon footprint of any food. Switching to plant-based meals 3× per week could save up to 600 kg CO₂ per year.',
      potentialSavingKg: categoryTotals.food * 0.6,
      priority: 'high',
      icon: '🥗',
    });
  } else if (categoryTotals.food > 8) {
    recommendations.push({
      id: 'rec-food-2',
      category: 'food',
      title: 'Try Meatless Mondays',
      description: 'One plant-based day per week reduces food emissions by ~14%. Explore vegetarian and vegan recipes.',
      potentialSavingKg: categoryTotals.food * 0.14,
      priority: 'medium',
      icon: '🌿',
    });
  } else {
    recommendations.push({
      id: 'rec-food-3',
      category: 'food',
      title: 'Excellent Food Choices!',
      description: 'Your diet has a low carbon footprint. Buying local and seasonal produce can reduce it further.',
      potentialSavingKg: categoryTotals.food * 0.05,
      priority: 'low',
      icon: '✅',
    });
  }

  // Energy recommendations
  if (categoryTotals.energy > 25) {
    recommendations.push({
      id: 'rec-energy-1',
      category: 'energy',
      title: 'Reduce Home Energy Usage',
      description: 'Your energy consumption is significant. Switching to LED lighting, better insulation, and a smart thermostat can cut energy emissions by 30%.',
      potentialSavingKg: categoryTotals.energy * 0.3,
      priority: 'high',
      icon: '💡',
    });
  } else if (categoryTotals.energy > 10) {
    recommendations.push({
      id: 'rec-energy-2',
      category: 'energy',
      title: 'Consider Renewable Energy',
      description: 'Switching to a green energy tariff or installing solar panels can eliminate home electricity emissions.',
      potentialSavingKg: categoryTotals.energy * 0.5,
      priority: 'medium',
      icon: '☀️',
    });
  } else {
    recommendations.push({
      id: 'rec-energy-3',
      category: 'energy',
      title: 'Low Energy Footprint!',
      description: 'Your energy use is minimal. Make sure devices are unplugged when not in use to avoid phantom loads.',
      potentialSavingKg: categoryTotals.energy * 0.05,
      priority: 'low',
      icon: '🔋',
    });
  }

  // General recommendation always included
  recommendations.push({
    id: 'rec-general-1',
    category: 'general',
    title: 'Track Daily & Stay Consistent',
    description: 'Consistent tracking leads to 23% better carbon reduction on average. Log every activity to maximise your Eco Score.',
    potentialSavingKg: 2,
    priority: 'medium',
    icon: '📊',
  });

  // Sort: high → medium → low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// ------------------------------------------------------------------
// Daily Green Challenges
// ------------------------------------------------------------------

/** Returns today's set of daily green challenges (seeded by date). */
export function getDailyGreenChallenges(): DailyChallenge[] {
  return [
    {
      id: 'dgc-1',
      title: 'Walk or Cycle Today',
      description: 'Skip the car for all trips under 3 km today.',
      carbonSavingKg: 1.8,
      points: 50,
      category: 'transport',
      completed: false,
    },
    {
      id: 'dgc-2',
      title: 'Plant-Based Meal',
      description: 'Eat at least one fully plant-based meal today.',
      carbonSavingKg: 2.8,
      points: 40,
      category: 'food',
      completed: false,
    },
    {
      id: 'dgc-3',
      title: 'Unplug Idle Devices',
      description: 'Turn off and unplug devices you\'re not using for at least 4 hours.',
      carbonSavingKg: 0.5,
      points: 20,
      category: 'energy',
      completed: false,
    },
    {
      id: 'dgc-4',
      title: 'Zero Single-Use Plastic',
      description: 'Refuse all single-use plastics today — bring your own bag, bottle & cutlery.',
      carbonSavingKg: 0.3,
      points: 30,
      category: 'waste',
      completed: false,
    },
    {
      id: 'dgc-5',
      title: 'Share Your Eco Journey',
      description: 'Tell one friend or colleague about carbon tracking and invite them to join.',
      carbonSavingKg: 0,
      points: 25,
      category: 'general',
      completed: false,
    },
  ];
}

// ------------------------------------------------------------------
// Achievement Badges
// ------------------------------------------------------------------

/**
 * Compute which achievement badges have been unlocked based on
 * the user's activity logs and completed challenges.
 */
export function getAchievements(
  logsCount: number,
  totalCarbonKg: number,
  completedChallengesCount: number,
  ecoScore: number
): Achievement[] {
  return [
    {
      id: 'ach-first-log',
      title: 'First Step',
      description: 'Log your first activity',
      icon: '🌱',
      unlocked: logsCount >= 1,
    },
    {
      id: 'ach-ten-logs',
      title: 'Consistent Tracker',
      description: 'Log 10 or more activities',
      icon: '📋',
      unlocked: logsCount >= 10,
    },
    {
      id: 'ach-low-carbon',
      title: 'Green Week',
      description: 'Keep weekly carbon under 14 kg CO₂',
      icon: '🌿',
      unlocked: totalCarbonKg > 0 && totalCarbonKg < 14,
    },
    {
      id: 'ach-eco-champion',
      title: 'Eco Champion',
      description: 'Achieve an Eco Score of 80 or above',
      icon: '🏆',
      unlocked: ecoScore >= 80,
    },
    {
      id: 'ach-challenger',
      title: 'Challenger',
      description: 'Complete your first daily challenge',
      icon: '⚔️',
      unlocked: completedChallengesCount >= 1,
    },
    {
      id: 'ach-challenge-master',
      title: 'Challenge Master',
      description: 'Complete 5 or more daily challenges',
      icon: '🎖️',
      unlocked: completedChallengesCount >= 5,
    },
    {
      id: 'ach-carbon-saver',
      title: 'Carbon Saver',
      description: 'Save over 50 kg CO₂ vs. the global average',
      icon: '💚',
      unlocked: (GLOBAL_WEEKLY_AVG_KG - totalCarbonKg) >= 50,
    },
    {
      id: 'ach-planet-hero',
      title: 'Planet Hero',
      description: 'Achieve Eco Score of 90+ with 5+ challenges completed',
      icon: '🌍',
      unlocked: ecoScore >= 90 && completedChallengesCount >= 5,
    },
  ];
}
