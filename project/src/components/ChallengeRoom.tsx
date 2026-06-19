/**
 * ChallengeRoom – Join or create carbon challenge rooms.
 * Accessibility: role=tablist/tab/tabpanel, aria-selected, htmlFor/id,
 * aria-label on copy button, role=list on leaderboard.
 */
import { useState } from 'react';
import {
  Swords,
  Trophy,
  Users,
  Copy,
  Check,
  Crown,
  Flame,
  Shield,
  Sparkles,
} from 'lucide-react';
import type { MockChallengeRoom, MockLeaderboardEntry } from '../lib/mockData';

interface ChallengeRoomProps {
  currentRoom: MockChallengeRoom | null;
  leaderboard: MockLeaderboardEntry[];
  userRank: number;
  onCreateRoom: (name: string, description?: string) => { success: boolean; code?: string; error?: string };
  onJoinRoom: (code: string) => { success: boolean; error?: string };
  totalCarbon: number;
}

export function ChallengeRoom({
  currentRoom,
  leaderboard,
  userRank,
  onCreateRoom,
  onJoinRoom,
  totalCarbon,
}: ChallengeRoomProps) {
  const [joinCode, setJoinCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomDesc, setRoomDesc] = useState('');
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = () => {
    setError(null);
    const result = onJoinRoom(joinCode);
    if (!result.success) {
      setError(result.error || 'Failed to join room');
    } else {
      setJoinCode('');
    }
  };

  const handleCreate = () => {
    setError(null);
    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }
    const result = onCreateRoom(roomName, roomDesc || undefined);
    if (!result.success) {
      setError(result.error || 'Failed to create room');
    } else {
      setRoomName('');
      setRoomDesc('');
    }
  };

  const copyCode = () => {
    if (currentRoom?.code) {
      navigator.clipboard.writeText(currentRoom.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4 pb-20 md:pb-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-war-red/20 to-war-amber/20 rounded-2xl p-5 border border-war-red/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-war-red to-war-amber flex items-center justify-center" aria-hidden="true">
              <Swords className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Challenge War</h2>
              <p className="text-carbon-muted text-sm">Compete for lowest emissions</p>
            </div>
          </div>
        </div>
      </div>

      {currentRoom ? (
        <>
          {/* Current Room Info */}
          <div className="bg-carbon-gray rounded-2xl p-4 border border-carbon-light">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">{currentRoom.name}</h3>
              <button
                onClick={copyCode}
                aria-label={`Copy room code ${currentRoom.code} to clipboard`}
                aria-pressed={copied}
                className="flex items-center gap-1 px-3 py-1 bg-carbon-light rounded-lg text-sm hover:bg-carbon-light/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald" aria-hidden="true" />
                    <span className="text-emerald">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-carbon-muted" aria-hidden="true" />
                    <span className="text-carbon-muted">{currentRoom.code}</span>
                  </>
                )}
              </button>
            </div>
            {currentRoom.description && (
              <p className="text-carbon-muted text-sm mb-3">{currentRoom.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-emerald" aria-hidden="true" />
                <span className="text-carbon-muted" aria-label={`${currentRoom.participants.length} of ${currentRoom.max_participants} participants`}>
                  {currentRoom.participants.length}/{currentRoom.max_participants}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-war-amber" aria-hidden="true" />
                <span className="text-carbon-muted" aria-label={`Your rank: number ${userRank}`}>
                  #{userRank} your rank
                </span>
              </div>
            </div>
          </div>

          {/* Your Buff Status */}
          <div className="bg-gradient-to-r from-emerald/20 to-emerald-dark/20 rounded-xl p-4 border border-emerald/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald" aria-hidden="true" />
                <div>
                  <p className="text-white font-medium">Footprint Shield Active</p>
                  <p className="text-carbon-muted text-sm">
                    Your total: {totalCarbon.toFixed(2)} kg CO₂
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-war-amber" aria-hidden="true" />
                  <span className="text-war-amber font-semibold text-sm" aria-label={`Your current rank: number ${userRank}`}>
                    Rank #{userRank}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-carbon-gray rounded-2xl p-4 border border-carbon-light">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-war-amber" aria-hidden="true" />
                Leaderboard
              </h3>
              <Flame className="w-5 h-5 text-war-red" aria-hidden="true" />
            </div>
            <ul className="space-y-2" role="list" aria-label="Challenge leaderboard">
              {leaderboard.map((entry) => {
                const isUser = entry.user_id === 'demo-user';
                return (
                  <li
                    key={entry.user_id}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                      isUser
                        ? 'bg-emerald/20 border border-emerald/30'
                        : 'bg-carbon-dark/50'
                    }`}
                    aria-label={`Rank ${entry.rank_position}: ${entry.username}, ${entry.total_carbon.toFixed(2)} kg CO₂${isUser ? ' (You)' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          entry.rank_position === 1
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-carbon-dark'
                            : entry.rank_position === 2
                            ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-carbon-dark'
                            : entry.rank_position === 3
                            ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-carbon-dark'
                            : 'bg-carbon-light text-white'
                        }`}
                        aria-hidden="true"
                      >
                        {entry.rank_position === 1 ? (
                          <Crown className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          entry.rank_position
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${isUser ? 'text-emerald' : 'text-white'}`}>
                          {entry.username}
                          {isUser && ' (You)'}
                        </p>
                        <p className="text-carbon-muted text-xs">
                          {entry.total_carbon.toFixed(2)} kg CO₂
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {entry.rank_position <= 3 && (
                        <span className="text-xs px-2 py-1 bg-war-amber/20 text-war-amber rounded-full">
                          {entry.rank_position === 1
                            ? 'Champion'
                            : entry.rank_position === 2
                            ? 'Elite'
                            : 'Rising'}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      ) : (
        <>
          {/* Join/Create Tabs */}
          <div
            className="flex gap-2 p-1 bg-carbon-dark rounded-xl"
            role="tablist"
            aria-label="Room options"
          >
            <button
              id="tab-join"
              role="tab"
              aria-selected={activeTab === 'join'}
              aria-controls="panel-join"
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
                activeTab === 'join'
                  ? 'bg-emerald text-carbon-dark'
                  : 'text-carbon-muted hover:text-white'
              }`}
            >
              Join Room
            </button>
            <button
              id="tab-create"
              role="tab"
              aria-selected={activeTab === 'create'}
              aria-controls="panel-create"
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
                activeTab === 'create'
                  ? 'bg-emerald text-carbon-dark'
                  : 'text-carbon-muted hover:text-white'
              }`}
            >
              Create Room
            </button>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="bg-war-red/20 border border-war-red/30 rounded-lg p-3 text-war-red text-sm"
            >
              {error}
            </div>
          )}

          {activeTab === 'join' ? (
            <div
              id="panel-join"
              role="tabpanel"
              aria-labelledby="tab-join"
              className="bg-carbon-gray rounded-2xl p-4 border border-carbon-light space-y-4"
            >
              <div>
                <label htmlFor="room-code-input" className="block text-carbon-muted text-sm mb-2">
                  Room Code
                </label>
                <input
                  id="room-code-input"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g., WAR-DEMO"
                  aria-describedby="join-code-hint"
                  className="w-full bg-carbon-dark border border-carbon-light rounded-lg px-4 py-3 text-white font-mono placeholder:text-carbon-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus:border-emerald transition-colors"
                />
                <p id="join-code-hint" className="text-carbon-muted text-xs mt-1">
                  Enter the room code shared by the challenge host.
                </p>
              </div>
              <button
                onClick={handleJoin}
                disabled={!joinCode.trim()}
                aria-disabled={!joinCode.trim()}
                aria-label="Join the challenge room"
                className="w-full bg-gradient-to-r from-emerald to-emerald-dark text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
              >
                Join Challenge
              </button>
            </div>
          ) : (
            <div
              id="panel-create"
              role="tabpanel"
              aria-labelledby="tab-create"
              className="bg-carbon-gray rounded-2xl p-4 border border-carbon-light space-y-4"
            >
              <div>
                <label htmlFor="room-name-input" className="block text-carbon-muted text-sm mb-2">
                  Room Name
                </label>
                <input
                  id="room-name-input"
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g., Office Green Team"
                  aria-required="true"
                  className="w-full bg-carbon-dark border border-carbon-light rounded-lg px-4 py-3 text-white placeholder:text-carbon-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus:border-emerald transition-colors"
                />
              </div>
              <div>
                <label htmlFor="room-desc-input" className="block text-carbon-muted text-sm mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="room-desc-input"
                  value={roomDesc}
                  onChange={(e) => setRoomDesc(e.target.value)}
                  placeholder="Challenge description..."
                  rows={2}
                  className="w-full bg-carbon-dark border border-carbon-light rounded-lg px-4 py-3 text-white placeholder:text-carbon-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus:border-emerald transition-colors resize-none"
                />
              </div>
              <button
                onClick={handleCreate}
                aria-label="Create a new challenge room"
                className="w-full bg-gradient-to-r from-war-red to-war-amber text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
              >
                Create Challenge Room
              </button>
            </div>
          )}

          {/* Available Demo Rooms */}
          <div className="bg-carbon-gray/50 rounded-xl p-4 border border-carbon-light">
            <p className="text-carbon-muted text-sm mb-2">Try demo rooms:</p>
            <ul className="space-y-2" role="list">
              <li>
                <button
                  onClick={() => onJoinRoom('WAR-DEMO')}
                  aria-label="Join Eco Champions League demo room with code WAR-DEMO"
                  className="flex items-center gap-2 text-emerald hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded"
                >
                  <Swords className="w-4 h-4" aria-hidden="true" />
                  <span className="font-mono">WAR-DEMO</span>
                  <span className="text-carbon-muted">- Eco Champions League</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onJoinRoom('GREEN-01')}
                  aria-label="Join Planetary Protection League demo room with code GREEN-01"
                  className="flex items-center gap-2 text-war-red hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded"
                >
                  <Swords className="w-4 h-4" aria-hidden="true" />
                  <span className="font-mono">GREEN-01</span>
                  <span className="text-carbon-muted">- Planetary Protection League</span>
                </button>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
