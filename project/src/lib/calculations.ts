// Carbon footprint calculation coefficients (kg CO2 per unit)
export const CARBON_COEFFICIENTS = {
  transport: {
    car: 0.18, // kg CO2 per km
    bus: 0.08, // kg CO2 per km
    train: 0.041, // kg CO2 per km
    plane: 0.255, // kg CO2 per km
    walking: 0, // kg CO2 per km
    cycling: 0, // kg CO2 per km
  },
  food: {
    meat_heavy: 3.3, // kg CO2 per meal
    meat_medium: 1.5, // kg CO2 per meal
    pescatarian: 1.2, // kg CO2 per meal
    vegetarian: 0.8, // kg CO2 per meal
    vegan: 0.5, // kg CO2 per meal
  },
  energy: {
    electricity: 0.85, // kg CO2 per kWh
    gas: 2.0, // kg CO2 per kWh
  },
} as const;

// Human bounds for anti-cheat validation
export const HUMAN_BOUNDS = {
  daily: {
    walking: 50, // km - maximum reasonable walking distance per day
    cycling: 200, // km
    transit_without_verification: 1000, // km - max transit without verification ticket
    meals: 10, // maximum meals per day
    energy_kwh: 500, // kWh per day for single person
  },
} as const;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

export interface ActivityInput {
  category: 'transport' | 'food' | 'energy';
  activityType: string;
  value: number;
  unit: string;
  verificationTicket?: boolean;
}

export interface CarbonResult {
  carbonKg: number;
  category: string;
  activityType: string;
  displayValue: string;
}

// Calculate carbon footprint for a single activity
export function calculateCarbon(input: ActivityInput): CarbonResult {
  let carbonKg = 0;

  switch (input.category) {
    case 'transport': {
      const coeff = CARBON_COEFFICIENTS.transport[input.activityType as keyof typeof CARBON_COEFFICIENTS.transport];
      carbonKg = (coeff !== undefined ? coeff : 0.1) * input.value;
      break;
    }
    case 'food': {
      const coeff = CARBON_COEFFICIENTS.food[input.activityType as keyof typeof CARBON_COEFFICIENTS.food];
      carbonKg = (coeff !== undefined ? coeff : 1.5) * input.value;
      break;
    }
    case 'energy': {
      const coeff = CARBON_COEFFICIENTS.energy[input.activityType as keyof typeof CARBON_COEFFICIENTS.energy];
      carbonKg = (coeff !== undefined ? coeff : 0.85) * input.value;
      break;
    }
  }

  return {
    carbonKg: Math.round(carbonKg * 1000) / 1000, // Round to 3 decimal places
    category: input.category,
    activityType: input.activityType,
    displayValue: `${input.value} ${input.unit}`,
  };
}

// Validate activity input against human bounds
export function validateActivityInput(input: ActivityInput): ValidationResult {
  const { category, activityType, value, verificationTicket } = input;

  // Basic value validation
  if (value <= 0) {
    return { valid: false, error: 'Value must be greater than zero' };
  }

  if (value > 10000) {
    return { valid: false, error: 'Value exceeds maximum allowed (10,000)' };
  }

  // Transport category validations
  if (category === 'transport') {
    if (activityType === 'walking' && value > HUMAN_BOUNDS.daily.walking) {
      return {
        valid: false,
        error: `Walking ${value} km in one day exceeds human limits (${HUMAN_BOUNDS.daily.walking} km max). Please verify your input.`,
      };
    }

    if (activityType === 'cycling' && value > HUMAN_BOUNDS.daily.cycling) {
      return {
        valid: false,
        error: `Cycling ${value} km in one day seems unrealistic (${HUMAN_BOUNDS.daily.cycling} km max).`,
      };
    }

    const transitTypes = ['car', 'bus', 'train', 'plane'];
    if (transitTypes.includes(activityType)) {
      if (value > HUMAN_BOUNDS.daily.transit_without_verification && !verificationTicket) {
        return {
          valid: false,
          error: `Transit of ${value} km requires verification ticket. Long-distance travel must be verified.`,
        };
      }
    }
  }

  // Food category validations
  if (category === 'food' && value > HUMAN_BOUNDS.daily.meals) {
    return {
      valid: false,
      error: `${value} meals in one day exceeds human limits (${HUMAN_BOUNDS.daily.meals} max).`,
    };
  }

  // Energy category validations
  if (category === 'energy' && value > HUMAN_BOUNDS.daily.energy_kwh) {
    return {
      valid: false,
      error: `${value} kWh usage exceeds reasonable daily limits for a single person (${HUMAN_BOUNDS.daily.energy_kwh} kWh max).`,
    };
  }

  // Warnings for potentially unusual inputs
  let warning: string | undefined;
  if (category === 'transport' && activityType === 'car' && value > 500) {
    warning = 'Long car journey detected. Consider carpooling or public transport for lower emissions.';
  }

  if (category === 'food' && activityType === 'meat_heavy' && value > 3) {
    warning = 'High meat consumption detected. Plant-based alternatives have significantly lower carbon footprint.';
  }

  return { valid: true, warning };
}

// Calculate color based on carbon value
export function getCarbonColor(carbonKg: number, threshold: number = 15): {
  color: string;
  status: 'excellent' | 'good' | 'moderate' | 'high';
} {
  if (carbonKg > threshold) {
    return { color: '#f43f5e', status: 'high' };
  }
  if (carbonKg <= 5) {
    return { color: '#10b981', status: 'excellent' };
  } else if (carbonKg <= 10) {
    return { color: '#34d399', status: 'good' };
  } else {
    return { color: '#f59e0b', status: 'moderate' };
  }
}

// Format carbon value for display
export function formatCarbon(value: number): string {
  if (value < 0.01) {
    return '<0.01 kg CO₂';
  }
  if (value < 1) {
    return `${value.toFixed(3)} kg CO₂`;
  }
  if (value < 100) {
    return `${value.toFixed(1)} kg CO₂`;
  }
  return `${value.toFixed(0)} kg CO₂`;
}

// Get category totals for charts
export function aggregateByCategory(logs: Array<{ category: string; carbon_kg: number }>): {
  transport: number;
  food: number;
  energy: number;
} {
  return logs.reduce(
    (acc, log) => {
      if (log.category in acc) {
        acc[log.category as keyof typeof acc] += log.carbon_kg;
      }
      return acc;
    },
    { transport: 0, food: 0, energy: 0 }
  );
}
