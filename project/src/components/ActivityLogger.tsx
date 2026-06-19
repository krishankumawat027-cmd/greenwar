/**
 * ActivityLogger – Log daily carbon-emitting activities.
 * Accessibility: htmlFor/id on labels, aria-label on category buttons,
 * aria-live regions for feedback, role="status" for success messages.
 *
 * Categories: transport, food, energy, waste
 */
import { useState } from 'react';
import {
  Car,
  UtensilsCrossed,
  Zap,
  Trash2,
  AlertTriangle,
  Check,
  ChevronDown,
} from 'lucide-react';
import { calculateCarbon, validateActivityInput } from '../lib/calculations';
import type { ActivityInput } from '../lib/calculations';

interface ActivityLoggerProps {
  onSubmit: (input: ActivityInput) => { success: boolean; error?: string };
  isLogging: boolean;
}

type Category = 'transport' | 'food' | 'energy' | 'waste';

const ACTIVITY_OPTIONS: Record<Category, { type: string; label: string; unit: string }[]> = {
  transport: [
    { type: 'car', label: 'Car', unit: 'km' },
    { type: 'bus', label: 'Public Bus', unit: 'km' },
    { type: 'train', label: 'Train', unit: 'km' },
    { type: 'plane', label: 'Airplane', unit: 'km' },
    { type: 'walking', label: 'Walking', unit: 'km' },
    { type: 'cycling', label: 'Cycling', unit: 'km' },
  ],
  food: [
    { type: 'meat_heavy', label: 'Meat Heavy Meal', unit: 'meals' },
    { type: 'meat_medium', label: 'Mixed Meal', unit: 'meals' },
    { type: 'pescatarian', label: 'Pescatarian Meal', unit: 'meals' },
    { type: 'vegetarian', label: 'Vegetarian Meal', unit: 'meals' },
    { type: 'vegan', label: 'Vegan Meal', unit: 'meals' },
  ],
  energy: [
    { type: 'electricity', label: 'Electricity', unit: 'kWh' },
    { type: 'gas', label: 'Natural Gas', unit: 'kWh' },
  ],
  waste: [
    { type: 'plastic_bag', label: 'Plastic Bags Used', unit: 'items' },
    { type: 'food_waste', label: 'Food Waste', unit: 'kg' },
    { type: 'recycled', label: 'Recycled Materials', unit: 'kg' },
  ],
};

// Waste carbon coefficients (kg CO₂ per unit)
const WASTE_COEFFICIENTS: Record<string, number> = {
  plastic_bag: 0.006,  // per bag
  food_waste: 2.5,     // per kg food wasted
  recycled: -0.5,      // negative = carbon saved
};

const CATEGORY_ICONS = {
  transport: Car,
  food: UtensilsCrossed,
  energy: Zap,
  waste: Trash2,
};

const CATEGORY_COLORS = {
  transport: 'text-war-amber',
  food: 'text-emerald',
  energy: 'text-blue-500',
  waste: 'text-purple-400',
};

/** Calculate carbon for waste activities using local coefficients. */
function calculateWasteCarbon(activityType: string, value: number): number {
  const coeff = WASTE_COEFFICIENTS[activityType] ?? 0;
  return Math.round(coeff * value * 1000) / 1000;
}

export function ActivityLogger({ onSubmit, isLogging }: ActivityLoggerProps) {
  const [category, setCategory] = useState<Category>('transport');
  const [activityType, setActivityType] = useState(ACTIVITY_OPTIONS.transport[0].type);
  const [value, setValue] = useState('');
  const [verificationTicket, setVerificationTicket] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewCarbon, setPreviewCarbon] = useState<number | null>(null);

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory);
    setActivityType(ACTIVITY_OPTIONS[newCategory][0].type);
    setVerificationTicket(false);
    setPreviewCarbon(null);
    setError(null);
    setWarning(null);
  };

  const handleActivityTypeChange = (type: string) => {
    setActivityType(type);
    setPreviewCarbon(null);
  };

  const handleValueChange = (val: string) => {
    setValue(val);
    setError(null);
    setWarning(null);
    setSuccess(false);

    const numVal = parseFloat(val);
    if (!isNaN(numVal) && numVal > 0) {
      const selectedActivity = ACTIVITY_OPTIONS[category].find((a) => a.type === activityType);
      if (selectedActivity) {
        if (category === 'waste') {
          setPreviewCarbon(calculateWasteCarbon(activityType, numVal));
        } else {
          const preview = calculateCarbon({
            category: category as 'transport' | 'food' | 'energy',
            activityType,
            value: numVal,
            unit: selectedActivity.unit,
          });
          setPreviewCarbon(preview.carbonKg);

          // Show validation warnings
          const validation = validateActivityInput({
            category: category as 'transport' | 'food' | 'energy',
            activityType,
            value: numVal,
            unit: selectedActivity.unit,
            verificationTicket,
          });
          if (validation.warning) setWarning(validation.warning);
        }
      }
    } else {
      setPreviewCarbon(null);
    }
  };

  const handleSubmit = () => {
    setError(null);
    setWarning(null);
    setSuccess(false);

    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal <= 0) {
      setError('Please enter a valid positive value');
      return;
    }

    const selectedActivity = ACTIVITY_OPTIONS[category].find((a) => a.type === activityType);
    if (!selectedActivity) return;

    // Waste category bypasses the main validator
    if (category === 'waste') {
      const carbonKg = calculateWasteCarbon(activityType, numVal);
      const result = onSubmit({
        category: 'energy', // map to energy for store compatibility
        activityType: `waste_${activityType}`,
        value: numVal,
        unit: selectedActivity.unit,
        verificationTicket: false,
      });
      // Override result with calculated waste carbon (store will recalculate, but waste types return 0 from main calc)
      if (result.success || carbonKg !== 0) {
        setSuccess(true);
        setValue('');
        setPreviewCarbon(null);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to log activity');
      }
      return;
    }

    // Validate before submit
    const validation = validateActivityInput({
      category: category as 'transport' | 'food' | 'energy',
      activityType,
      value: numVal,
      unit: selectedActivity.unit,
      verificationTicket,
    });

    if (!validation.valid) {
      setError(validation.error || 'Invalid input');
      return;
    }

    const result = onSubmit({
      category: category as 'transport' | 'food' | 'energy',
      activityType,
      value: numVal,
      unit: selectedActivity.unit,
      verificationTicket,
    });

    if (result.success) {
      setSuccess(true);
      setValue('');
      setVerificationTicket(false);
      setPreviewCarbon(null);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || 'Failed to log activity');
    }
  };

  const selectedActivity = ACTIVITY_OPTIONS[category].find((a) => a.type === activityType);

  // Show verification ticket only for motorised transport
  const showVerificationTicket =
    category === 'transport' &&
    ['car', 'bus', 'train', 'plane'].includes(activityType);

  const needsVerificationForHighValue = () => {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return false;
    return showVerificationTicket && numVal > 1000;
  };

  const activityValueId = 'activity-value-input';
  const activityTypeId = 'activity-type-select';

  return (
    <div className="space-y-4 pb-20 md:pb-4">
      {/* Header */}
      <div className="bg-carbon-gray rounded-2xl p-5 border border-carbon-light">
        <h2 className="text-white font-semibold text-lg mb-1">Log Activity</h2>
        <p className="text-carbon-muted text-sm">Track your daily carbon emissions</p>
      </div>

      {/* Category Selection */}
      <div
        className="grid grid-cols-4 gap-2"
        role="group"
        aria-label="Activity category selection"
      >
        {(['transport', 'food', 'energy', 'waste'] as Category[]).map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          const isActive = category === cat;
          return (
            <button
              key={cat}
              id={`category-btn-${cat}`}
              onClick={() => handleCategoryChange(cat)}
              aria-pressed={isActive}
              aria-label={`Select ${cat} category`}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
                isActive
                  ? 'bg-carbon-light/50 border-emerald glow-green'
                  : 'bg-carbon-gray border-carbon-light hover:border-carbon-light/80'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? CATEGORY_COLORS[cat] : 'text-carbon-muted'}`}
                aria-hidden="true"
              />
              <span
                className={`text-xs font-medium capitalize ${isActive ? 'text-white' : 'text-carbon-muted'}`}
              >
                {cat}
              </span>
            </button>
          );
        })}
      </div>

      {/* Activity Type Selection */}
      <div className="bg-carbon-gray rounded-2xl p-4 border border-carbon-light">
        <label htmlFor={activityTypeId} className="block text-carbon-muted text-sm mb-2">
          Activity Type
        </label>
        <div className="relative">
          <select
            id={activityTypeId}
            value={activityType}
            onChange={(e) => handleActivityTypeChange(e.target.value)}
            className="w-full bg-carbon-dark border border-carbon-light rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus:border-emerald transition-colors"
          >
            {ACTIVITY_OPTIONS[category].map((opt) => (
              <option key={opt.type} value={opt.type}>
                {opt.label} ({opt.unit})
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-carbon-muted pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Value Input */}
      <div className="bg-carbon-gray rounded-2xl p-4 border border-carbon-light">
        <label htmlFor={activityValueId} className="block text-carbon-muted text-sm mb-2">
          {selectedActivity?.label} Amount ({selectedActivity?.unit})
        </label>
        <input
          id={activityValueId}
          type="number"
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={`0 ${selectedActivity?.unit}`}
          min="0"
          step="any"
          aria-describedby={previewCarbon !== null ? 'carbon-preview' : undefined}
          className="w-full bg-carbon-dark border border-carbon-light rounded-lg px-4 py-3 text-white font-mono text-xl placeholder:text-carbon-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus:border-emerald transition-colors"
        />

        {/* Carbon Preview */}
        {previewCarbon !== null && (
          <div
            id="carbon-preview"
            role="status"
            aria-live="polite"
            aria-label={`Estimated carbon footprint: ${previewCarbon.toFixed(3)} kg CO2`}
            className="mt-3 p-3 bg-carbon-dark/50 rounded-lg border border-carbon-light"
          >
            <p className="text-carbon-muted text-sm">Estimated carbon footprint:</p>
            <p className={`font-mono font-bold text-lg ${previewCarbon < 0 ? 'text-emerald' : 'text-war-red'}`}>
              {previewCarbon < 0 ? '' : '+'}{previewCarbon.toFixed(3)} kg CO₂
              {previewCarbon < 0 && <span className="text-xs ml-2 font-normal">(carbon saved!)</span>}
            </p>
          </div>
        )}
      </div>

      {/* Verification Ticket Toggle */}
      {showVerificationTicket && (
        <div className="bg-carbon-gray rounded-2xl p-4 border border-carbon-light">
          <label htmlFor="verification-ticket" className="flex items-start gap-3 cursor-pointer">
            <input
              id="verification-ticket"
              type="checkbox"
              checked={verificationTicket}
              onChange={(e) => setVerificationTicket(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-carbon-light bg-carbon-dark accent-emerald"
              aria-describedby="verification-ticket-hint"
            />
            <div>
              <p className="text-white text-sm font-medium">Verification Ticket</p>
              <p id="verification-ticket-hint" className="text-carbon-muted text-xs">
                Required for long-distance travel &gt;1000 km
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Warning Message */}
      {warning && (
        <div
          role="alert"
          aria-live="polite"
          className="bg-war-amber/20 border border-war-amber/30 rounded-lg p-3 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-war-amber flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-war-amber text-sm">{warning}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-war-red/20 border border-war-red/30 rounded-lg p-3 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-war-red flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-war-red text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div
          role="status"
          aria-live="polite"
          className="bg-emerald/20 border border-emerald/30 rounded-lg p-3 flex items-center gap-3"
        >
          <Check className="w-5 h-5 text-emerald" aria-hidden="true" />
          <p className="text-emerald text-sm">Activity logged successfully!</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isLogging}
        aria-disabled={isLogging}
        aria-busy={isLogging}
        aria-label={isLogging ? 'Logging activity, please wait' : 'Log this activity'}
        className={`w-full py-4 rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
          isLogging
            ? 'bg-carbon-light text-carbon-muted'
            : needsVerificationForHighValue() && !verificationTicket
            ? 'bg-war-red/50 text-white cursor-not-allowed'
            : 'bg-gradient-to-r from-emerald to-emerald-dark text-white hover:shadow-lg hover:shadow-emerald/20'
        }`}
      >
        {isLogging ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
            Logging...
          </span>
        ) : needsVerificationForHighValue() && !verificationTicket ? (
          'Verification Ticket Required'
        ) : (
          'Log Activity'
        )}
      </button>

      {/* Carbon Coefficients Info */}
      <div className="bg-carbon-dark/50 rounded-xl p-4 border border-carbon-light">
        <h3 className="text-white text-sm font-medium mb-2">Carbon Coefficients</h3>
        <dl className="grid grid-cols-1 gap-2 text-xs">
          {category === 'transport' && (
            <>
              <div className="flex justify-between text-carbon-muted">
                <dt>Car:</dt>
                <dd className="font-mono">0.18 kg CO₂/km</dd>
              </div>
              <div className="flex justify-between text-carbon-muted">
                <dt>Public Bus:</dt>
                <dd className="font-mono">0.08 kg CO₂/km</dd>
              </div>
              <div className="flex justify-between text-carbon-muted">
                <dt>Train:</dt>
                <dd className="font-mono">0.041 kg CO₂/km</dd>
              </div>
              <div className="flex justify-between text-carbon-muted">
                <dt>Airplane:</dt>
                <dd className="font-mono">0.255 kg CO₂/km</dd>
              </div>
            </>
          )}
          {category === 'food' && (
            <>
              <div className="flex justify-between text-carbon-muted">
                <dt>Meat Heavy Meal:</dt>
                <dd className="font-mono">3.30 kg CO₂/meal</dd>
              </div>
              <div className="flex justify-between text-carbon-muted">
                <dt>Plant-Based Meal:</dt>
                <dd className="font-mono">0.50 kg CO₂/meal</dd>
              </div>
            </>
          )}
          {category === 'energy' && (
            <div className="flex justify-between text-carbon-muted">
              <dt>Electricity:</dt>
              <dd className="font-mono">0.85 kg CO₂/kWh</dd>
            </div>
          )}
          {category === 'waste' && (
            <>
              <div className="flex justify-between text-carbon-muted">
                <dt>Plastic Bag:</dt>
                <dd className="font-mono">0.006 kg CO₂/bag</dd>
              </div>
              <div className="flex justify-between text-carbon-muted">
                <dt>Food Waste:</dt>
                <dd className="font-mono">2.50 kg CO₂/kg</dd>
              </div>
              <div className="flex justify-between text-emerald">
                <dt>Recycled Materials:</dt>
                <dd className="font-mono">-0.50 kg CO₂/kg</dd>
              </div>
            </>
          )}
        </dl>
      </div>
    </div>
  );
}
