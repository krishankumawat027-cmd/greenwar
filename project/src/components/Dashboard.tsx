/**
 * Dashboard – Main view showing carbon footprint metrics, charts,
 * Eco Score, Carbon Saved, Daily Challenges, and recent activity.
 *
 * Accessibility: semantic headings, aria-labels on charts, list markup
 * for activity feed, useMemo for performance.
 */
import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Leaf, Zap, UtensilsCrossed, Car } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { formatCarbon, getCarbonColor } from '../lib/calculations';
import type { MockActivityLog } from '../lib/mockData';
import { EcoScoreCard } from './EcoScoreCard';
import { DailyChallenges } from './DailyChallenges';

interface DashboardProps {
  totalCarbon: number;
  categoryTotals: { transport: number; food: number; energy: number };
  logs: MockActivityLog[];
  username: string;
}

export function Dashboard({ totalCarbon, categoryTotals, logs, username }: DashboardProps) {
  const carbonColor = getCarbonColor(totalCarbon);

  // Memoize chart data to avoid recalculation on re-renders
  const categoryData = useMemo(() => [
    { name: 'Transport', value: categoryTotals.transport, color: '#f59e0b' },
    { name: 'Food', value: categoryTotals.food, color: '#10b981' },
    { name: 'Energy', value: categoryTotals.energy, color: '#3b82f6' },
  ], [categoryTotals]);

  // Prepare timeline data for line chart (last 7 days)
  const timelineData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    return last7Days.map((day, i) => {
      const dayLogs = logs.filter((log) => {
        const logDate = new Date(log.logged_at);
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - (6 - i));
        return logDate.toDateString() === targetDate.toDateString();
      });
      return { day, value: dayLogs.reduce((sum, log) => sum + log.carbon_kg, 0) };
    });
  }, [logs]);

  // Calculate average daily carbon
  const avgDaily = useMemo(() => totalCarbon / 7, [totalCarbon]);

  return (
    <div className="space-y-4 pb-20 md:pb-4">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-carbon-dark to-carbon-gray rounded-2xl p-5 border border-carbon-light">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-carbon-muted text-sm">Welcome back,</p>
            <h2 className="text-white font-semibold text-lg">{username}</h2>
          </div>
          <div className="w-10 h-10 rounded-full bg-carbon-light flex items-center justify-center" aria-hidden="true">
            <Leaf className="w-5 h-5 text-emerald" aria-hidden="true" />
          </div>
        </div>

        <div
          className="bg-carbon-light/50 rounded-xl p-4 border transition-all duration-300"
          style={{ borderColor: carbonColor.color }}
          aria-label={`Your carbon footprint this week: ${formatCarbon(totalCarbon)}`}
        >
          <p className="text-sm text-carbon-muted mb-1">Your Carbon Footprint</p>
          <div className="flex items-end gap-2">
            <h3
              className="text-3xl font-bold font-mono"
              style={{ color: carbonColor.color }}
            >
              {formatCarbon(totalCarbon)}
            </h3>
            <span className="text-carbon-muted text-sm mb-1">this week</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {avgDaily < 2.5 ? (
              <TrendingDown className="w-4 h-4 text-emerald" aria-hidden="true" />
            ) : (
              <TrendingUp className="w-4 h-4 text-war-red" aria-hidden="true" />
            )}
            <span
              className={`text-sm ${avgDaily < 2.5 ? 'text-emerald' : 'text-war-amber'}`}
              aria-label={avgDaily < 2.5 ? 'Below average emissions' : 'Above average emissions'}
            >
              {avgDaily < 2.5 ? 'Below average!' : 'Above average'}
            </span>
            <span className="text-carbon-muted text-sm">
              ({formatCarbon(avgDaily)}/day avg)
            </span>
          </div>
        </div>
      </div>

      {/* Eco Score + Carbon Saved + AI Recommendations */}
      <EcoScoreCard totalCarbonKg={totalCarbon} categoryTotals={categoryTotals} />

      {/* Category Breakdown */}
      <div
        className="grid grid-cols-3 gap-3"
        aria-label="Carbon emissions by category"
      >
        {[
          { icon: Car, label: 'Transport', value: categoryTotals.transport, color: '#f59e0b' },
          { icon: UtensilsCrossed, label: 'Food', value: categoryTotals.food, color: '#10b981' },
          { icon: Zap, label: 'Energy', value: categoryTotals.energy, color: '#3b82f6' },
        ].map((cat) => (
          <div
            key={cat.label}
            className="bg-carbon-gray rounded-xl p-3 border border-carbon-light card-hover"
            aria-label={`${cat.label}: ${cat.value.toFixed(1)} kg CO₂`}
          >
            <cat.icon
              className="w-5 h-5 mb-2"
              style={{ color: cat.color }}
              aria-hidden="true"
            />
            <p className="text-xs text-carbon-muted">{cat.label}</p>
            <p className="text-white font-mono font-semibold">{cat.value.toFixed(1)}</p>
            <p className="text-xs text-carbon-muted">kg CO₂</p>
          </div>
        ))}
      </div>

      {/* Category Bar Chart */}
      <div className="bg-carbon-gray rounded-2xl p-4 border border-carbon-light">
        <h3 className="text-white font-semibold mb-4">Emissions by Category</h3>
        <div
          className="h-40"
          role="img"
          aria-label={`Bar chart showing emissions: Transport ${categoryTotals.transport.toFixed(1)} kg, Food ${categoryTotals.food.toFixed(1)} kg, Energy ${categoryTotals.energy.toFixed(1)} kg CO₂`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
                formatter={(value) => [`${Number(value).toFixed(2)} kg`, 'CO₂']}
              />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-carbon-gray rounded-2xl p-4 border border-carbon-light">
        <h3 className="text-white font-semibold mb-4">Daily Trend</h3>
        <div
          className="h-32"
          role="img"
          aria-label="Line chart showing daily carbon emissions over the past 7 days"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                formatter={(value) => [`${Number(value).toFixed(2)} kg`, 'CO₂']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#34d399"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                activeDot={{ fill: '#34d399', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Challenges + Achievements */}
      <DailyChallenges totalCarbonKg={totalCarbon} logsCount={logs.length} />

      {/* Recent Activity */}
      <div className="bg-carbon-gray rounded-2xl p-4 border border-carbon-light">
        <h3 className="text-white font-semibold mb-3">Recent Activity</h3>
        {logs.length === 0 ? (
          <p className="text-carbon-muted text-sm text-center py-4">
            No activity logged yet. Start tracking your carbon footprint!
          </p>
        ) : (
          <ul className="space-y-2" role="list" aria-label="Recent carbon activities">
            {logs.slice(0, 5).map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between bg-carbon-dark/50 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      log.category === 'transport'
                        ? 'bg-war-amber'
                        : log.category === 'food'
                        ? 'bg-emerald'
                        : 'bg-blue-500'
                    }`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-white text-sm capitalize">
                      {log.activity_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-carbon-muted text-xs">
                      {log.value} {log.unit}
                    </p>
                    <time
                      dateTime={new Date(log.logged_at).toISOString()}
                      className="text-carbon-muted text-xs"
                    >
                      {new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </time>
                  </div>
                </div>
                <p
                  className="text-war-red font-mono text-sm"
                  aria-label={`${log.carbon_kg.toFixed(2)} kilograms CO2`}
                >
                  +{log.carbon_kg.toFixed(2)} kg
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
