/**
 * App – Root component with lazy-loaded views, auth guard, and
 * semantic main landmark for accessibility.
 */
import { useState, useEffect, lazy, Suspense } from 'react';
import { Navigation } from './components/Navigation';
import { useMockStore } from './lib/mockData';
import { useMockAuthStore } from './lib/mockAuthStore';
import { useMockGreenWarStore } from './lib/mockGreenWarStore';
import type { ActivityInput } from './lib/calculations';

// Route-level lazy loading for performance
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const ActivityLogger = lazy(() => import('./components/ActivityLogger').then(m => ({ default: m.ActivityLogger })));
const ChallengeRoom = lazy(() => import('./components/ChallengeRoom').then(m => ({ default: m.ChallengeRoom })));
const Profile = lazy(() => import('./components/Profile').then(m => ({ default: m.Profile })));
const AuthPortal = lazy(() => import('./components/AuthPortal').then(m => ({ default: m.AuthPortal })));
const GreenWarJoinTeam = lazy(() => import('./components/GreenWarJoinTeam').then(m => ({ default: m.GreenWarJoinTeam })));

type View = 'dashboard' | 'log' | 'challenges' | 'profile';
type ChallengeSubView = 'list' | 'greenwar';

/** Full-page loading spinner shown during lazy-load and auth check. */
function LoadingSpinner() {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-carbon-dark via-carbon-gray to-carbon-dark flex items-center justify-center"
      aria-busy="true"
      aria-label="Loading EcoWarrior"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald to-emerald-dark flex items-center justify-center animate-pulse"
          aria-hidden="true"
        >
          <span className="text-carbon-dark font-bold text-lg">EC</span>
        </div>
        <p className="text-carbon-muted text-sm">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [challengeSubView, setChallengeSubView] = useState<ChallengeSubView>('list');
  const [isLogging, setIsLogging] = useState(false);

  const {
    userId,
    username,
    logs,
    currentRoom,
    leaderboard,
    submitActivity,
    createRoom,
    joinRoom,
    loadLeaderboard,
  } = useMockStore();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    signOut,
  } = useMockAuthStore();

  const { joinGreenWar } = useMockGreenWarStore();

  // Derived metrics
  const totalCarbon = logs.reduce((sum, log) => sum + log.carbon_kg, 0);
  const categoryTotals = logs.reduce(
    (acc, log) => {
      if (log.category in acc) {
        acc[log.category as keyof typeof acc] += log.carbon_kg;
      }
      return acc;
    },
    { transport: 0, food: 0, energy: 0 }
  );

  /** Submit a new activity log entry. */
  const handleActivitySubmit = (input: ActivityInput) => {
    setIsLogging(true);
    const result = submitActivity(input);
    setTimeout(() => setIsLogging(false), 500);
    return result;
  };

  /** Create a new challenge room and load its leaderboard. */
  const handleCreateRoom = (name: string, description?: string) => {
    const result = createRoom(name, description);
    if (result.success && result.code) {
      loadLeaderboard(currentRoom?.id || '');
    }
    return result;
  };

  /** Join a room; GreenWar codes are handled separately. */
  const handleJoinRoom = (code: string) => {
    // GreenWar codes start with "GREEN"
    if (code.toUpperCase().startsWith('GREEN')) {
      const result = joinGreenWar(code);
      if (result.success) {
        setChallengeSubView('greenwar');
      }
      return result;
    }

    const result = joinRoom(code);
    if (result.success) {
      loadLeaderboard(currentRoom?.id || '');
    }
    return result;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleViewChange = (view: View) => {
    setActiveView(view);
    if (view !== 'challenges') {
      setChallengeSubView('list');
    }
  };

  // Reload leaderboard when switching to challenges view
  useEffect(() => {
    if (activeView === 'challenges' && currentRoom) {
      loadLeaderboard(currentRoom.id);
    }
  }, [activeView, currentRoom, loadLeaderboard]);

  const userRank =
    leaderboard.find((e) => e.user_id === userId)?.rank_position ?? leaderboard.length + 1;

  // Show loading state during auth check
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // Show auth portal if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-carbon-dark via-carbon-gray to-carbon-dark">
        {/* Skip link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-emerald focus:text-carbon-dark focus:rounded-lg focus:font-semibold"
        >
          Skip to main content
        </a>
        <Suspense fallback={<LoadingSpinner />}>
          <main id="main-content">
            <AuthPortal />
          </main>
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-carbon-dark via-carbon-gray to-carbon-dark">
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-emerald focus:text-carbon-dark focus:rounded-lg focus:font-semibold"
      >
        Skip to main content
      </a>

      <Navigation activeView={activeView} onViewChange={handleViewChange} />

      <main id="main-content" className="max-w-lg mx-auto px-4 py-6 md:pt-20">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12" aria-busy="true" aria-label="Loading content">
            <div className="w-8 h-8 border-2 border-emerald border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          </div>
        }>
          {activeView === 'dashboard' && (
            <Dashboard
              totalCarbon={totalCarbon}
              categoryTotals={categoryTotals}
              logs={logs}
              username={user?.username || username}
            />
          )}

          {activeView === 'log' && (
            <ActivityLogger onSubmit={handleActivitySubmit} isLogging={isLogging} />
          )}

          {activeView === 'challenges' && challengeSubView === 'list' && (
            <ChallengeRoom
              currentRoom={currentRoom}
              leaderboard={leaderboard}
              userRank={userRank}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              totalCarbon={totalCarbon}
            />
          )}

          {activeView === 'challenges' && challengeSubView === 'greenwar' && (
            <GreenWarJoinTeam
              userId={user?.id || userId}
              onBack={() => setChallengeSubView('list')}
            />
          )}

          {activeView === 'profile' && (
            <Profile
              username={user?.username || username}
              email={user?.email}
              totalCarbon={totalCarbon}
              logsCount={logs.length}
              onSignOut={handleSignOut}
            />
          )}
        </Suspense>
      </main>
    </div>
  );
}

export default App;
