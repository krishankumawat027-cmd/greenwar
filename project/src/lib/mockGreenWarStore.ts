import { create } from 'zustand';

export type MockGreenWar = {
  id: string;
  room_code: string;
  title: string;
  description?: string;
  creator_id: string;
  start_date: string;
  end_date?: string;
  max_teams: number;
  max_participants_per_team: number;
  is_active: boolean;
};

export type MockTeam = {
  id: string;
  greenwar_id: string;
  team_name: string;
  team_color: string;
};

export type MockParticipant = {
  id: string;
  greenwar_id: string;
  team_id: string;
  user_id: string;
  joined_at: string;
};

export type MockTeamLeaderboardEntry = {
  team_id: string;
  team_name: string;
  team_color: string;
  member_count: number;
  team_score: number;
  rank_position: number;
};

interface MockGreenWarState {
  greenWars: MockGreenWar[];
  teams: MockTeam[];
  participants: MockParticipant[];
  currentGreenWar: MockGreenWar | null;
  currentParticipant: MockParticipant | null;
  leaderboard: MockTeamLeaderboardEntry[];

  // Actions
  createGreenWar: (title: string, description?: string) => { success: boolean; code?: string; error?: string };
  joinGreenWar: (roomCode: string) => { success: boolean; greenwar?: MockGreenWar; error?: string };
  joinTeam: (teamId: string, userId: string) => { success: boolean; switched?: boolean; error?: string };
  leaveGreenWar: (userId: string) => { success: boolean };
  loadLeaderboard: (greenwarId: string) => void;
  calculateTeamScore: (teamId: string) => number;
}

// Demo data
const demoGreenWar: MockGreenWar = {
  id: 'gw-demo-001',
  room_code: 'GREEN-01',
  title: 'Planetary Protection League',
  description: 'Compete to save the planet! Teams with lowest carbon win.',
  creator_id: 'demo-user',
  start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  max_teams: 5,
  max_participants_per_team: 10,
  is_active: true,
};

const demoTeams: MockTeam[] = [
  { id: 'team-alpha', greenwar_id: 'gw-demo-001', team_name: 'Team Alpha Eco', team_color: 'from-emerald-500 to-teal-600' },
  { id: 'team-crushers', greenwar_id: 'gw-demo-001', team_name: 'Carbon Crushers', team_color: 'from-rose-500 to-orange-600' },
  { id: 'team-commandos', greenwar_id: 'gw-demo-001', team_name: 'Climate Commandos', team_color: 'from-blue-500 to-indigo-600' },
];

const demoParticipants: MockParticipant[] = [
  { id: 'p1', greenwar_id: 'gw-demo-001', team_id: 'team-alpha', user_id: 'eco-warrior-1', joined_at: new Date().toISOString() },
  { id: 'p2', greenwar_id: 'gw-demo-001', team_id: 'team-alpha', user_id: 'eco-warrior-2', joined_at: new Date().toISOString() },
  { id: 'p3', greenwar_id: 'gw-demo-001', team_id: 'team-crushers', user_id: 'green-panda', joined_at: new Date().toISOString() },
  { id: 'p4', greenwar_id: 'gw-demo-001', team_id: 'team-crushers', user_id: 'carbon-slayer', joined_at: new Date().toISOString() },
  { id: 'p5', greenwar_id: 'gw-demo-001', team_id: 'team-commandos', user_id: 'eco-ninja', joined_at: new Date().toISOString() },
];

export const useMockGreenWarStore = create<MockGreenWarState>((set, get) => ({
  greenWars: [demoGreenWar],
  teams: demoTeams,
  participants: demoParticipants,
  currentGreenWar: null,
  currentParticipant: null,
  leaderboard: [],

  createGreenWar: (title, description) => {
    const code = 'GREEN-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newWar: MockGreenWar = {
      id: `gw-${Date.now()}`,
      room_code: code,
      title,
      description,
      creator_id: 'demo-user',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      max_teams: 5,
      max_participants_per_team: 10,
      is_active: true,
    };

    // Auto-create default teams
    const defaultTeams: MockTeam[] = [
      { id: `team-${Date.now()}-1`, greenwar_id: newWar.id, team_name: 'Eco Warriors', team_color: 'from-emerald-500 to-teal-600' },
      { id: `team-${Date.now()}-2`, greenwar_id: newWar.id, team_name: 'Carbon Crushers', team_color: 'from-rose-500 to-orange-600' },
      { id: `team-${Date.now()}-3`, greenwar_id: newWar.id, team_name: 'Climate Commandos', team_color: 'from-blue-500 to-indigo-600' },
    ];

    set((state) => ({
      greenWars: [...state.greenWars, newWar],
      teams: [...state.teams, ...defaultTeams],
      currentGreenWar: newWar,
    }));

    return { success: true, code };
  },

  joinGreenWar: (roomCode) => {
    const war = get().greenWars.find(
      (g) => g.room_code.toUpperCase() === roomCode.toUpperCase() && g.is_active
    );

    if (!war) {
      return { success: false, error: 'GreenWar room not found or inactive' };
    }

    // Check if user already has a participation record
    const existingParticipant = get().participants.find(
      (p) => p.greenwar_id === war.id && p.user_id === 'demo-user'
    );

    set({
      currentGreenWar: war,
      currentParticipant: existingParticipant || null,
    });

    get().loadLeaderboard(war.id);

    return { success: true, greenwar: war };
  },

  // UPSERT operation: join or switch teams
  joinTeam: (teamId, userId) => {
    const { currentGreenWar, participants, teams } = get();

    if (!currentGreenWar) {
      return { success: false, error: 'No active GreenWar session' };
    }

    // Validate team exists and belongs to this GreenWar
    const team = teams.find((t) => t.id === teamId && t.greenwar_id === currentGreenWar.id);
    if (!team) {
      return { success: false, error: 'Team not found in this GreenWar' };
    }

    // Check if user already has a participation record
    const { currentParticipant } = get();
    const existingParticipant = participants.find(
      (p) => p.greenwar_id === currentGreenWar.id && p.user_id === userId
    ) ?? (currentParticipant?.user_id === userId ? currentParticipant : undefined);


    if (existingParticipant) {
      // UPSERT: Update existing participation (team switch)
      const updatedParticipant: MockParticipant = {
        ...existingParticipant,
        team_id: teamId,
        joined_at: new Date().toISOString(), // Update timestamp for transfer
      };

      set((state) => ({
        participants: state.participants.map((p) =>
          p.id === existingParticipant.id ? updatedParticipant : p
        ),
        currentParticipant: updatedParticipant,
      }));

      // Recalculate leaderboard after team switch
      get().loadLeaderboard(currentGreenWar.id);

      return { success: true, switched: true };
    } else {
      // INSERT: New participant
      const newParticipant: MockParticipant = {
        id: `p-${Date.now()}`,
        greenwar_id: currentGreenWar.id,
        team_id: teamId,
        user_id: userId,
        joined_at: new Date().toISOString(),
      };

      set((state) => ({
        participants: [...state.participants, newParticipant],
        currentParticipant: newParticipant,
      }));

      // Recalculate leaderboard
      get().loadLeaderboard(currentGreenWar.id);

      return { success: true, switched: false };
    }
  },

  leaveGreenWar: (userId) => {
    const { currentGreenWar, participants } = get();
    if (!currentGreenWar) return { success: false };

    const participant = participants.find(
      (p) => p.greenwar_id === currentGreenWar.id && p.user_id === userId
    );

    if (participant) {
      set((state) => ({
        participants: state.participants.filter((p) => p.id !== participant.id),
        currentParticipant: null,
      }));
    }

    return { success: true };
  },

  loadLeaderboard: (greenwarId) => {
    const { teams, participants } = get();

    const teamScores = teams
      .filter((t) => t.greenwar_id === greenwarId)
      .map((team) => {
        const memberCount = participants.filter((p) => p.team_id === team.id).length;
        const score = get().calculateTeamScore(team.id);

        return {
          team_id: team.id,
          team_name: team.team_name,
          team_color: team.team_color,
          member_count: memberCount,
          team_score: score,
          rank_position: 0,
        };
      })
      .sort((a, b) => b.team_score - a.team_score)
      .map((entry, index) => ({
        ...entry,
        rank_position: index + 1,
      }));

    set({ leaderboard: teamScores });
  },

  calculateTeamScore: (teamId) => {
    // Simple mock scoring - points based on member activity
    const { participants } = get();
    const teamMembers = participants.filter((p) => p.team_id === teamId);

    // Each member contributes points based on being active
    let score = teamMembers.length * 50; // Base participation bonus

    // Add randomness for demo purposes
    score += Math.floor(Math.random() * 100);

    return score;
  },
}));
