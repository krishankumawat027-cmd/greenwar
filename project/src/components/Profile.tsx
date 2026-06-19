/**
 * Profile – User profile page showing stats, achievements, and account options.
 * Accessibility: aria-labels on icon buttons, semantic list roles, accessible
 * profile card landmarks.
 */
import { useState, useMemo } from 'react';
import { User, Leaf, Trophy, Calendar, Settings, LogOut, Shield, Bell, HelpCircle } from 'lucide-react';
import { LogoutModal } from './LogoutModal';
import { getAchievements, calculateEcoScore } from '../lib/ecoScore';

interface ProfileProps {
  username: string;
  email?: string;
  totalCarbon: number;
  logsCount: number;
  onSignOut: () => Promise<void>;
}

export function Profile({ username, email, totalCarbon, logsCount, onSignOut }: ProfileProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await onSignOut();
    setShowLogoutModal(false);
    setIsSigningOut(false);
  };

  // Compute achievements for display (completed challenges count = 0 on profile page)
  const ecoScore = useMemo(() => calculateEcoScore(totalCarbon).score, [totalCarbon]);
  const achievements = useMemo(
    () => getAchievements(logsCount, totalCarbon, 0, ecoScore),
    [logsCount, totalCarbon, ecoScore]
  );
  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <>
      <div className="space-y-4 pb-20 md:pb-4">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-carbon-dark to-carbon-gray rounded-2xl p-5 border border-carbon-light">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald to-emerald-dark flex items-center justify-center"
              aria-hidden="true"
            >
              <User className="w-8 h-8 text-carbon-dark" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-semibold text-xl truncate">{username}</h2>
              {email && (
                <p className="text-carbon-muted text-sm truncate">{email}</p>
              )}
              <p className="text-emerald text-xs mt-1">Verified User</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-carbon-muted text-sm">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span>Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div
          className="grid grid-cols-3 gap-3"
          aria-label="Profile statistics"
        >
          <div
            className="bg-carbon-gray rounded-xl p-4 border border-carbon-light text-center"
            aria-label={`Total carbon: ${totalCarbon.toFixed(1)} kg CO₂`}
          >
            <Leaf className="w-6 h-6 mx-auto mb-2 text-emerald" aria-hidden="true" />
            <p className="text-white font-mono font-bold text-lg">{totalCarbon.toFixed(1)}</p>
            <p className="text-carbon-muted text-xs">kg CO₂ Total</p>
          </div>
          <div
            className="bg-carbon-gray rounded-xl p-4 border border-carbon-light text-center"
            aria-label={`Eco score: ${ecoScore} out of 100`}
          >
            <Trophy className="w-6 h-6 mx-auto mb-2 text-war-amber" aria-hidden="true" />
            <p className="text-white font-bold text-lg">{ecoScore}</p>
            <p className="text-carbon-muted text-xs">Eco Score</p>
          </div>
          <div
            className="bg-carbon-gray rounded-xl p-4 border border-carbon-light text-center"
            aria-label={`Activities logged: ${logsCount}`}
          >
            <User className="w-6 h-6 mx-auto mb-2 text-blue-500" aria-hidden="true" />
            <p className="text-white font-bold text-lg">{logsCount}</p>
            <p className="text-carbon-muted text-xs">Activities</p>
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-carbon-gray rounded-2xl p-4 border border-carbon-light">
          <h3 className="text-white font-semibold mb-3">Account</h3>
          <nav aria-label="Account settings">
            <ul className="space-y-1" role="list">
              {[
                { Icon: Shield, label: 'Security', sublabel: 'Password, 2FA, sessions' },
                { Icon: Bell, label: 'Notifications', sublabel: 'Push, email preferences' },
                { Icon: Settings, label: 'Settings', sublabel: 'App preferences' },
                { Icon: HelpCircle, label: 'Help & Support', sublabel: 'FAQs, contact us' },
              ].map(({ Icon, label, sublabel }) => (
                <li key={label}>
                  <button
                    aria-label={`${label}: ${sublabel}`}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-carbon-light/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald text-left"
                  >
                    <Icon className="w-5 h-5 text-carbon-muted" aria-hidden="true" />
                    <div className="flex-1 text-left">
                      <p className="text-white text-sm">{label}</p>
                      <p className="text-carbon-muted text-xs">{sublabel}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Achievements */}
        <div className="bg-carbon-gray rounded-2xl p-4 border border-carbon-light">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Achievements</h3>
            <span className="text-carbon-muted text-xs">
              {unlockedAchievements.length}/{achievements.length} unlocked
            </span>
          </div>
          <ul
            className="grid grid-cols-4 gap-2"
            role="list"
            aria-label="Achievement badges"
          >
            {achievements.map((achievement) => (
              <li
                key={achievement.id}
                className={`flex flex-col items-center p-2 rounded-lg ${
                  achievement.unlocked ? 'opacity-100' : 'opacity-35 grayscale'
                }`}
                title={achievement.unlocked ? achievement.description : `Locked: ${achievement.description}`}
                aria-label={`${achievement.title}${achievement.unlocked ? ' (Unlocked)' : ' (Locked)'}`}
              >
                <span className="text-2xl mb-1" aria-hidden="true">{achievement.icon}</span>
                <span className="text-xs text-carbon-muted text-center leading-tight">
                  {achievement.title}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          aria-label="Sign out of your account"
          className="w-full bg-war-red/20 border border-war-red/30 text-war-red font-medium py-3 rounded-xl hover:bg-war-red/30 transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-war-red"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          <span>Sign Out</span>
        </button>

        {/* App Info */}
        <div className="text-center text-carbon-muted text-xs">
          <p>EcoWarrior v1.0.0</p>
          <p className="mt-1">Carbon Footprint Tracker</p>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleSignOut}
        isLoading={isSigningOut}
      />
    </>
  );
}
