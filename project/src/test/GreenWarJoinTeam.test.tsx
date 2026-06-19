/**
 * Tests for the GreenWarJoinTeam component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GreenWarJoinTeam } from '../components/GreenWarJoinTeam';

const mockLoadLeaderboard = vi.fn();
const mockJoinTeam = vi.fn().mockReturnValue({ success: true, switched: false });

const mockGreenWarStoreState = {
  currentGreenWar: {
    id: 'war-123',
    title: 'Green Sprints Battle',
    description: 'Reduce CO2 emissions',
    room_code: 'WAR-DEMO',
    is_active: true,
  },
  teams: [
    { id: 'team-1', greenwar_id: 'war-123', team_name: 'Leaf Squad', team_color: 'from-green-500 to-teal-500' },
    { id: 'team-2', greenwar_id: 'war-123', team_name: 'Eco Knights', team_color: 'from-blue-500 to-indigo-500' },
  ],
  currentParticipant: null,
  leaderboard: [
    { team_id: 'team-1', team_name: 'Leaf Squad', member_count: 5, team_score: 120, rank_position: 1 },
    { team_id: 'team-2', team_name: 'Eco Knights', member_count: 3, team_score: 90, rank_position: 2 },
  ],
  joinTeam: mockJoinTeam,
  loadLeaderboard: mockLoadLeaderboard,
};

vi.mock('../lib/mockGreenWarStore', () => {
  return {
    useMockGreenWarStore: vi.fn(() => mockGreenWarStoreState),
  };
});

describe('GreenWarJoinTeam', () => {
  const onBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGreenWarStoreState.currentGreenWar = {
      id: 'war-123',
      title: 'Green Sprints Battle',
      description: 'Reduce CO2 emissions',
      room_code: 'WAR-DEMO',
      is_active: true,
    };
    mockGreenWarStoreState.currentParticipant = null;
    mockJoinTeam.mockReturnValue({ success: true, switched: false });
  });

  it('renders no session page when currentGreenWar is null', () => {
    mockGreenWarStoreState.currentGreenWar = null;
    render(<GreenWarJoinTeam userId="user-1" onBack={onBack} />);
    expect(screen.getByText(/no greenwar session active/i)).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /go back/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('loads leaderboard on mount', () => {
    render(<GreenWarJoinTeam userId="user-1" onBack={onBack} />);
    expect(mockLoadLeaderboard).toHaveBeenCalledWith('war-123');
  });

  it('renders GreenWar title and description', () => {
    render(<GreenWarJoinTeam userId="user-1" onBack={onBack} />);
    expect(screen.getByText('Green Sprints Battle')).toBeInTheDocument();
    expect(screen.getByText(/reduce co2 emissions/i)).toBeInTheDocument();
  });

  it('renders available squads', () => {
    render(<GreenWarJoinTeam userId="user-1" onBack={onBack} />);
    expect(screen.getAllByText('Leaf Squad').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Eco Knights').length).toBeGreaterThan(0);
  });

  it('displays scores and player counts for teams', () => {
    render(<GreenWarJoinTeam userId="user-1" onBack={onBack} />);
    // Check score and member count rendering
    expect(screen.getByText(/5 players active/i)).toBeInTheDocument();
    expect(screen.getByText(/Score: 120 pts/i)).toBeInTheDocument();
    expect(screen.getByText(/3 players active/i)).toBeInTheDocument();
    expect(screen.getByText(/Score: 90 pts/i)).toBeInTheDocument();
  });

  it('triggers joinTeam when clicking squad join button', () => {
    render(<GreenWarJoinTeam userId="user-1" onBack={onBack} />);
    const joinButtons = screen.getAllByRole('button', { name: /join squad/i });
    
    // Click join squad for the first team
    fireEvent.click(joinButtons[0]);
    expect(mockJoinTeam).toHaveBeenCalledWith('team-1', 'user-1');
  });

  it('shows success notification on successful join', async () => {
    mockJoinTeam.mockReturnValue({ success: true, switched: false });
    render(<GreenWarJoinTeam userId="user-1" onBack={onBack} />);
    const joinButtons = screen.getAllByRole('button', { name: /join squad/i });
    
    fireEvent.click(joinButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText(/success! profile linked/i)).toBeInTheDocument();
    });
  });

  it('shows switched notification on team switch', async () => {
    mockJoinTeam.mockReturnValue({ success: true, switched: true });
    render(<GreenWarJoinTeam userId="user-1" onBack={onBack} />);
    const joinButtons = screen.getAllByRole('button', { name: /join squad/i });
    
    fireEvent.click(joinButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText(/team switched!/i)).toBeInTheDocument();
    });
  });

  it('shows error notification when joinTeam fails', async () => {
    mockJoinTeam.mockReturnValue({ success: false });
    render(<GreenWarJoinTeam userId="user-1" onBack={onBack} />);
    const joinButtons = screen.getAllByRole('button', { name: /join squad/i });
    
    fireEvent.click(joinButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText(/join blocked: unable to join/i)).toBeInTheDocument();
    });
  });

  it('renders active squad differently', () => {
    mockGreenWarStoreState.currentParticipant = { team_id: 'team-1', user_id: 'user-1' };
    render(<GreenWarJoinTeam userId="user-1" onBack={onBack} />);
    
    expect(screen.getByText('Your Squad')).toBeInTheDocument();
    expect(screen.getByText('Currently on:')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(<GreenWarJoinTeam userId="user-1" onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: /back to challenges/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
