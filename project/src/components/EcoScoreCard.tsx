/**
 * EcoScoreCard – Displays the user's Eco Score, carbon saved vs.
 * the global average, and AI sustainability recommendations.
 */
import { Leaf, TrendingDown, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import {
  calculateEcoScore,
  calculateCarbonSaved,
  getAISustainabilityRecommendations,
} from '../lib/ecoScore';

interface EcoScoreCardProps {
  totalCarbonKg: number;
  categoryTotals: { transport: number; food: number; energy: number };
}

export function EcoScoreCard({ totalCarbonKg, categoryTotals }: EcoScoreCardProps) {
  const [showRecommendations, setShowRecommendations] = useState(false);

  const ecoResult = calculateEcoScore(totalCarbonKg);
  const carbonSaved = calculateCarbonSaved(totalCarbonKg);
  const recommendations = getAISustainabilityRecommendations(categoryTotals);

  return (
    <section aria-label="Eco Score and AI Recommendations" className="space-y-3">
      {/* Eco Score + Carbon Saved Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Eco Score */}
        <div
          className="bg-carbon-gray rounded-xl p-4 border border-carbon-light"
          role="status"
          aria-label={`Eco Score: ${ecoResult.score} out of 100, grade ${ecoResult.grade}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-emerald" aria-hidden="true" />
            <p className="text-carbon-muted text-xs font-medium">Eco Score</p>
          </div>
          <div className="flex items-end gap-1">
            <span
              className="text-3xl font-black font-mono"
              style={{ color: ecoResult.color }}
            >
              {ecoResult.score}
            </span>
            <span className="text-carbon-muted text-xs mb-1">/100</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${ecoResult.color}20`, color: ecoResult.color }}
            >
              Grade {ecoResult.grade}
            </span>
            <span className="text-carbon-muted text-xs">{ecoResult.label}</span>
          </div>
        </div>

        {/* Carbon Saved */}
        <div
          className="bg-carbon-gray rounded-xl p-4 border border-carbon-light"
          role="status"
          aria-label={`Carbon saved: ${carbonSaved.toFixed(1)} kilograms CO2 compared to global average`}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-emerald" aria-hidden="true" />
            <p className="text-carbon-muted text-xs font-medium">Carbon Saved</p>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black font-mono text-emerald">
              {carbonSaved.toFixed(1)}
            </span>
            <span className="text-carbon-muted text-xs mb-1">kg</span>
          </div>
          <p className="text-carbon-muted text-xs mt-1">vs. global avg</p>
        </div>
      </div>

      {/* Weekly Progress Bar */}
      <div
        className="bg-carbon-gray rounded-xl p-4 border border-carbon-light"
        role="progressbar"
        aria-valuenow={ecoResult.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Weekly eco progress: ${ecoResult.score}%`}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-white text-sm font-medium">Weekly Progress</p>
          <span className="text-carbon-muted text-xs">
            {ecoResult.percentBelowAverage}% below avg
          </span>
        </div>
        <div className="w-full bg-carbon-dark rounded-full h-2.5" aria-hidden="true">
          <div
            className="h-2.5 rounded-full transition-all duration-500"
            style={{
              width: `${ecoResult.score}%`,
              backgroundColor: ecoResult.color,
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-carbon-muted text-xs">0</span>
          <span className="text-carbon-muted text-xs">Global Avg</span>
          <span className="text-carbon-muted text-xs">100</span>
        </div>
      </div>

      {/* AI Recommendations Panel */}
      <div className="bg-carbon-gray rounded-xl border border-carbon-light overflow-hidden">
        <button
          onClick={() => setShowRecommendations(!showRecommendations)}
          aria-expanded={showRecommendations}
          aria-controls="ai-recommendations-panel"
          className="w-full flex items-center justify-between p-4 hover:bg-carbon-light/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-emerald" aria-hidden="true" />
            <span className="text-white text-sm font-medium">AI Recommendations</span>
            <span className="text-xs bg-emerald/20 text-emerald px-2 py-0.5 rounded-full">
              {recommendations.length}
            </span>
          </div>
          {showRecommendations
            ? <ChevronUp className="w-4 h-4 text-carbon-muted" aria-hidden="true" />
            : <ChevronDown className="w-4 h-4 text-carbon-muted" aria-hidden="true" />
          }
        </button>

        {showRecommendations && (
          <div id="ai-recommendations-panel" className="border-t border-carbon-light">
            <ul className="divide-y divide-carbon-light" role="list" aria-label="AI sustainability recommendations">
              {recommendations.map((rec) => (
                <li key={rec.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0" aria-hidden="true">{rec.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white text-sm font-medium">{rec.title}</p>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            rec.priority === 'high'
                              ? 'bg-war-red/20 text-war-red'
                              : rec.priority === 'medium'
                              ? 'bg-war-amber/20 text-war-amber'
                              : 'bg-emerald/20 text-emerald'
                          }`}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-carbon-muted text-xs leading-relaxed">{rec.description}</p>
                      {rec.potentialSavingKg > 0 && (
                        <p className="text-emerald text-xs mt-1 font-mono">
                          💚 Save ~{rec.potentialSavingKg.toFixed(1)} kg CO₂
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
