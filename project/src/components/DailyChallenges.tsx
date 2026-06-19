/**
 * DailyChallenges – Displays today's green challenges with completion
 * toggle and accumulated points. Also renders Achievement Badges.
 */
import { useState, useMemo } from 'react';
import { CheckCircle2, Circle, Award, Star } from 'lucide-react';
import { getDailyGreenChallenges, getAchievements, type DailyChallenge } from '../lib/ecoScore';
import { calculateEcoScore } from '../lib/ecoScore';

interface DailyChallengesProps {
  totalCarbonKg: number;
  logsCount: number;
}

const CATEGORY_COLORS: Record<DailyChallenge['category'], string> = {
  transport: 'text-war-amber',
  food: 'text-emerald',
  energy: 'text-blue-400',
  waste: 'text-purple-400',
  general: 'text-carbon-muted',
};

const CATEGORY_BG: Record<DailyChallenge['category'], string> = {
  transport: 'bg-war-amber/10 border-war-amber/20',
  food: 'bg-emerald/10 border-emerald/20',
  energy: 'bg-blue-400/10 border-blue-400/20',
  waste: 'bg-purple-400/10 border-purple-400/20',
  general: 'bg-carbon-light/10 border-carbon-light/20',
};

export function DailyChallenges({ totalCarbonKg, logsCount }: DailyChallengesProps) {
  const initialChallenges = useMemo(() => getDailyGreenChallenges(), []);
  const [challenges, setChallenges] = useState<DailyChallenge[]>(initialChallenges);
  const [showBadges, setShowBadges] = useState(false);

  const completedCount = challenges.filter(c => c.completed).length;
  const totalPoints = challenges.filter(c => c.completed).reduce((s, c) => s + c.points, 0);
  const ecoResult = calculateEcoScore(totalCarbonKg);
  const achievements = getAchievements(logsCount, totalCarbonKg, completedCount, ecoResult.score);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const toggleChallenge = (id: string) => {
    setChallenges(prev =>
      prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c)
    );
  };

  return (
    <section aria-label="Daily Green Challenges and Achievements" className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-war-amber" aria-hidden="true" />
          <h3 className="text-white font-semibold text-sm">Daily Challenges</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-carbon-muted">
          <span aria-label={`${completedCount} of ${challenges.length} challenges completed`}>
            {completedCount}/{challenges.length} done
          </span>
          {totalPoints > 0 && (
            <span className="bg-war-amber/20 text-war-amber px-2 py-0.5 rounded-full font-mono" aria-label={`${totalPoints} points earned`}>
              +{totalPoints} pts
            </span>
          )}
        </div>
      </div>

      {/* Challenge List */}
      <ul className="space-y-2" role="list" aria-label="Daily green challenges">
        {challenges.map((challenge) => (
          <li key={challenge.id}>
            <button
              onClick={() => toggleChallenge(challenge.id)}
              aria-pressed={challenge.completed}
              aria-label={`${challenge.completed ? 'Unmark' : 'Mark'} "${challenge.title}" as ${challenge.completed ? 'incomplete' : 'complete'}. ${challenge.points} points. ${challenge.description}`}
              className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                challenge.completed
                  ? 'bg-emerald/10 border-emerald/30 opacity-80'
                  : `${CATEGORY_BG[challenge.category]}`
              }`}
            >
              <div className="flex items-start gap-3">
                <span aria-hidden="true" className="flex-shrink-0 mt-0.5">
                  {challenge.completed
                    ? <CheckCircle2 className="w-5 h-5 text-emerald" />
                    : <Circle className={`w-5 h-5 ${CATEGORY_COLORS[challenge.category]}`} />
                  }
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm font-medium ${challenge.completed ? 'line-through text-carbon-muted' : 'text-white'}`}>
                      {challenge.title}
                    </p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      challenge.completed ? 'bg-emerald/20 text-emerald' : 'bg-carbon-light text-carbon-muted'
                    }`}>
                      +{challenge.points}
                    </span>
                  </div>
                  <p className="text-carbon-muted text-xs leading-relaxed">{challenge.description}</p>
                  {challenge.carbonSavingKg > 0 && (
                    <p className="text-xs mt-1 font-mono" style={{ color: challenge.completed ? '#10b981' : '#64748b' }}>
                      💚 {challenge.carbonSavingKg} kg CO₂ saved
                    </p>
                  )}
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {/* Achievements Toggle */}
      <button
        onClick={() => setShowBadges(!showBadges)}
        aria-expanded={showBadges}
        aria-controls="achievements-panel"
        className="w-full flex items-center justify-between p-3 bg-carbon-gray rounded-xl border border-carbon-light hover:bg-carbon-light/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-war-amber" aria-hidden="true" />
          <span className="text-white text-sm font-medium">Achievement Badges</span>
          <span className="text-xs bg-war-amber/20 text-war-amber px-2 py-0.5 rounded-full font-mono">
            {unlockedCount}/{achievements.length}
          </span>
        </div>
        <span className="text-carbon-muted text-xs">{showBadges ? 'Hide' : 'Show'}</span>
      </button>

      {/* Achievements Grid */}
      {showBadges && (
        <div
          id="achievements-panel"
          className="bg-carbon-gray rounded-xl border border-carbon-light p-4"
        >
          <ul
            className="grid grid-cols-4 gap-3"
            role="list"
            aria-label="Achievement badges"
          >
            {achievements.map((achievement) => (
              <li key={achievement.id}>
                <div
                  className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                    achievement.unlocked
                      ? 'opacity-100'
                      : 'opacity-35 grayscale'
                  }`}
                  title={achievement.unlocked ? achievement.description : `Locked: ${achievement.description}`}
                  aria-label={`${achievement.title}: ${achievement.description}${achievement.unlocked ? ' (Unlocked)' : ' (Locked)'}`}
                >
                  <span
                    className={`text-2xl mb-1 ${achievement.unlocked ? 'animate-bounce-once' : ''}`}
                    aria-hidden="true"
                  >
                    {achievement.icon}
                  </span>
                  <span className="text-xs text-carbon-muted text-center leading-tight">
                    {achievement.title}
                  </span>
                  {achievement.unlocked && (
                    <span className="sr-only">Unlocked</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
