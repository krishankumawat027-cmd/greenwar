import { useState, useEffect } from 'react';
import { Swords, Users, ShieldAlert, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useMockGreenWarStore } from '../lib/mockGreenWarStore';

interface GreenWarJoinTeamProps {
  userId: string;
  onBack: () => void;
}

export function GreenWarJoinTeam({ userId, onBack }: GreenWarJoinTeamProps) {
  const [joinStatus, setJoinStatus] = useState<'success' | 'switched' | 'error' | null>(null);

  const {
    currentGreenWar,
    teams,
    currentParticipant,
    leaderboard,
    joinTeam,
    loadLeaderboard,
  } = useMockGreenWarStore();

  // Load teams for current GreenWar
  useEffect(() => {
    if (currentGreenWar) {
      loadLeaderboard(currentGreenWar.id);
    }
  }, [currentGreenWar, loadLeaderboard]);

  const handleJoinTeam = async (teamId: string) => {
    setJoinStatus(null);

    const result = joinTeam(teamId, userId);

    if (result.success) {
      setJoinStatus(result.switched ? 'switched' : 'success');
    } else {
      setJoinStatus('error');
    }
  };

  // Get teams for current war
  const warTeams = teams.filter((t) => t.greenwar_id === currentGreenWar?.id);

  // Get member counts from leaderboard
  const getMemberCount = (teamId: string): number => {
    const entry = leaderboard.find((l) => l.team_id === teamId);
    return entry?.member_count || 0;
  };

  const getTeamScore = (teamId: string): number => {
    const entry = leaderboard.find((l) => l.team_id === teamId);
    return entry?.team_score || 0;
  };

  if (!currentGreenWar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-carbon-dark via-carbon-gray to-carbon-dark text-slate-100 p-4 font-sans flex items-center justify-center">
        <div className="text-center">
          <p className="text-carbon-muted">No GreenWar session active</p>
          <button
            onClick={onBack}
            aria-label="Go back to challenges"
            className="mt-4 text-emerald hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-carbon-dark via-carbon-gray to-carbon-dark pb-20 md:pb-4" role="dialog" aria-label="Join Team Dialog">
      <div className="max-w-md mx-auto p-4">
        {/* Back Button */}
        <button
          onClick={onBack}
          aria-label="Back to Challenges"
          className="flex items-center gap-2 text-carbon-muted hover:text-white transition-colors mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          <span>Back to Challenges</span>
        </button>

        {/* Main Card */}
        <div className="bg-carbon-gray border border-carbon-light rounded-3xl p-6 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-war-red/10 text-war-red rounded-2xl mb-3 border border-war-red/20" aria-hidden="true">
              <Swords size={28} aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase text-white">
              {currentGreenWar.title}
            </h2>
            <p className="text-xs text-carbon-muted mt-1">
              {currentGreenWar.description || 'Select a squad to deploy your footprint savings'}
            </p>
            <p className="text-xs text-war-amber mt-2 font-mono" aria-label={`Room code: ${currentGreenWar.room_code}`}>
              Room: {currentGreenWar.room_code}
            </p>
          </div>

          {/* Dynamic Status Notifications */}
          {joinStatus === 'success' && (
            <div
              role="status"
              aria-live="polite"
              className="bg-emerald/10 border border-emerald/30 p-3.5 rounded-2xl mb-5 flex items-center gap-3 text-emerald text-xs font-medium animate-slideUp"
            >
              <CheckCircle2 size={18} className="shrink-0" aria-hidden="true" />
              <span>Success! Profile linked to team. Your logs now power this squad.</span>
            </div>
          )}

          {joinStatus === 'switched' && (
            <div
              role="status"
              aria-live="polite"
              className="bg-war-amber/10 border border-war-amber/30 p-3.5 rounded-2xl mb-5 flex items-center gap-3 text-war-amber text-xs font-medium animate-slideUp"
            >
              <RefreshCw size={18} className="shrink-0" aria-hidden="true" />
              <span>Team switched! Your carbon savings transferred to the new squad.</span>
            </div>
          )}

          {joinStatus === 'error' && (
            <div
              role="alert"
              aria-live="assertive"
              className="bg-war-red/10 border border-war-red/30 p-3.5 rounded-2xl mb-5 flex items-center gap-3 text-war-red text-xs font-medium animate-slideUp"
            >
              <ShieldAlert size={18} className="shrink-0" aria-hidden="true" />
              <span>Join Blocked: Unable to join team. Please try again.</span>
            </div>
          )}

          {/* Current Team Badge */}
          {currentParticipant && (
            <div
              className="bg-carbon-dark/50 border border-emerald/30 p-3 rounded-xl mb-5 flex items-center gap-3"
              aria-label={`Currently on team: ${warTeams.find((t) => t.id === currentParticipant.team_id)?.team_name ?? 'Unknown'}`}
            >
              <div className="w-10 h-10 rounded-lg bg-emerald/20 flex items-center justify-center" aria-hidden="true">
                <Users className="w-5 h-5 text-emerald" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-carbon-muted">Currently on:</p>
                <p className="text-white font-semibold">
                  {warTeams.find((t) => t.id === currentParticipant.team_id)?.team_name}
                </p>
              </div>
              <span className="text-xs bg-emerald/20 text-emerald px-2 py-1 rounded-full font-medium" aria-label="Team status: Active">
                Active
              </span>
            </div>
          )}

          {/* Team Grid Stack */}
          <ul className="space-y-3 mb-6" role="list" aria-label="Available teams">
            {warTeams.map((team) => {
              const isCurrent = currentParticipant?.team_id === team.id;
              const memberCount = getMemberCount(team.id);
              const teamScore = getTeamScore(team.id);

              return (
                <li key={team.id}>
                  <button
                    onClick={() => handleJoinTeam(team.id)}
                    disabled={isCurrent}
                    aria-disabled={isCurrent}
                    aria-pressed={isCurrent}
                    aria-label={`${isCurrent ? 'Currently on' : 'Join'} Squad. ${memberCount} players active. Score: ${teamScore} points.`}
                    className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
                      isCurrent
                        ? 'bg-carbon-dark border-emerald/50 shadow-lg shadow-emerald/5 cursor-default'
                        : 'bg-carbon-dark/50 border-carbon-light hover:border-emerald/50 hover:bg-carbon-dark'
                    }`}
                  >
                    {/* Visual accent badge bar */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${
                        team.team_color || 'from-emerald-500 to-teal-600'
                      }`}
                      aria-hidden="true"
                    />

                    <div className="pl-2">
                      <h4 className="text-sm font-bold text-white tracking-wide">
                        {team.team_name}
                      </h4>
                      <p className="text-[11px] text-carbon-muted flex items-center gap-1 mt-0.5">
                        <Users size={12} aria-hidden="true" /> {memberCount} players active
                      </p>
                      <p className="text-[11px] text-war-amber mt-0.5">
                        Score: {teamScore} pts
                      </p>
                    </div>

                    <div
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                        isCurrent
                          ? 'bg-emerald text-carbon-dark font-black'
                          : 'bg-carbon-light text-carbon-muted hover:text-white'
                      }`}
                      aria-hidden="true"
                    >
                      {isCurrent ? 'Your Squad' : 'Join Squad'}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Leaderboard Preview */}
          {leaderboard.length > 0 && (
            <div className="border-t border-carbon-light pt-4">
              <h3 className="text-white font-semibold text-sm mb-3">Live Standings</h3>
              <ul className="space-y-2" role="list" aria-label="Team standings">
                {leaderboard.map((entry) => {
                  const isUserTeam = entry.team_id === currentParticipant?.team_id;
                  return (
                    <li
                      key={entry.team_id}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        isUserTeam ? 'bg-emerald/10 border border-emerald/30' : 'bg-carbon-dark/30'
                      }`}
                      aria-label={`Rank ${entry.rank_position}: ${entry.team_name}, ${entry.member_count} members, ${entry.team_score} points${isUserTeam ? ' (Your team)' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            entry.rank_position === 1
                              ? 'bg-yellow-500 text-carbon-dark'
                              : entry.rank_position === 2
                              ? 'bg-slate-400 text-carbon-dark'
                              : entry.rank_position === 3
                              ? 'bg-orange-500 text-carbon-dark'
                              : 'bg-carbon-light text-white'
                          }`}
                          aria-hidden="true"
                        >
                          {entry.rank_position}
                        </span>
                        <span className={`text-sm ${isUserTeam ? 'text-emerald font-semibold' : 'text-white'}`}>
                          {entry.team_name}
                          {isUserTeam && <span className="sr-only"> (Your team)</span>}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs" aria-hidden="true">
                        <span className="text-carbon-muted">{entry.member_count} members</span>
                        <span className="text-war-amber font-mono">{entry.team_score} pts</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
