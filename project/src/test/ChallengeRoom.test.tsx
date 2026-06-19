/**
 * Tests for the ChallengeRoom component.
 * Covers join/create tabs, form validation, and leaderboard display.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChallengeRoom } from '../components/ChallengeRoom';
import type { MockChallengeRoom, MockLeaderboardEntry } from '../lib/mockData';

const mockOnCreateRoom = vi.fn().mockReturnValue({ success: true, code: 'WAR-TEST' });
const mockOnJoinRoom = vi.fn().mockReturnValue({ success: true });

const mockRoom: MockChallengeRoom = {
  id: 'room-1',
  code: 'WAR-DEMO',
  name: 'Eco Champions League',
  description: 'Weekly carbon footprint challenge',
  creator_id: 'demo-user',
  start_date: new Date().toISOString(),
  max_participants: 10,
  is_active: true,
  participants: ['demo-user', 'eco-warrior'],
};

const mockLeaderboard: MockLeaderboardEntry[] = [
  { user_id: 'eco-warrior', username: 'eco_warrior', total_carbon: 8.2, rank_position: 1 },
  { user_id: 'demo-user', username: 'eco_champion', total_carbon: 14.5, rank_position: 2 },
];

const noRoomProps = {
  currentRoom: null,
  leaderboard: [],
  userRank: 1,
  onCreateRoom: mockOnCreateRoom,
  onJoinRoom: mockOnJoinRoom,
  totalCarbon: 14.5,
};

beforeEach(() => {
  mockOnCreateRoom.mockClear();
  mockOnJoinRoom.mockClear();
});

describe('ChallengeRoom – No Room State', () => {
  it('renders Challenge War header', () => {
    render(<ChallengeRoom {...noRoomProps} />);
    expect(screen.getByText(/challenge war/i)).toBeInTheDocument();
  });

  it('shows Join Room and Create Room tabs', () => {
    render(<ChallengeRoom {...noRoomProps} />);
    expect(screen.getByRole('tab', { name: /join room/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /create room/i })).toBeInTheDocument();
  });

  it('shows Join Room form by default', () => {
    render(<ChallengeRoom {...noRoomProps} />);
    expect(screen.getByLabelText(/room code/i)).toBeInTheDocument();
  });

  it('shows demo room codes', () => {
    render(<ChallengeRoom {...noRoomProps} />);
    expect(screen.getByText('WAR-DEMO')).toBeInTheDocument();
    expect(screen.getByText('GREEN-01')).toBeInTheDocument();
  });
});

describe('ChallengeRoom – Join Form', () => {
  it('calls onJoinRoom when Join Challenge is clicked with code', async () => {
    render(<ChallengeRoom {...noRoomProps} />);
    fireEvent.change(screen.getByLabelText(/room code/i), { target: { value: 'WAR-TEST' } });
    fireEvent.click(screen.getByRole('button', { name: /join the challenge room/i }));
    expect(mockOnJoinRoom).toHaveBeenCalledWith('WAR-TEST');
  });

  it('join button is disabled when code is empty', () => {
    render(<ChallengeRoom {...noRoomProps} />);
    expect(screen.getByRole('button', { name: /join the challenge room/i })).toBeDisabled();
  });

  it('uppercases typed room code', async () => {
    render(<ChallengeRoom {...noRoomProps} />);
    fireEvent.change(screen.getByLabelText(/room code/i), { target: { value: 'war-demo' } });
    expect(screen.getByLabelText(/room code/i)).toHaveValue('WAR-DEMO');
  });
});

describe('ChallengeRoom – Create Form', () => {
  it('switches to Create Room form on tab click', () => {
    render(<ChallengeRoom {...noRoomProps} />);
    fireEvent.click(screen.getByRole('tab', { name: /create room/i }));
    expect(screen.getByLabelText(/room name/i)).toBeInTheDocument();
  });

  it('shows description field in create form', () => {
    render(<ChallengeRoom {...noRoomProps} />);
    fireEvent.click(screen.getByRole('tab', { name: /create room/i }));
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('calls onCreateRoom with room name on submit', async () => {
    render(<ChallengeRoom {...noRoomProps} />);
    fireEvent.click(screen.getByRole('tab', { name: /create room/i }));
    fireEvent.change(screen.getByLabelText(/room name/i), { target: { value: 'My Eco Team' } });
    fireEvent.click(screen.getByRole('button', { name: /create a new challenge room/i }));
    expect(mockOnCreateRoom).toHaveBeenCalledWith('My Eco Team', undefined);
  });

  it('shows error when creating room with empty name', async () => {
    render(<ChallengeRoom {...noRoomProps} />);
    fireEvent.click(screen.getByRole('tab', { name: /create room/i }));
    fireEvent.click(screen.getByRole('button', { name: /create a new challenge room/i }));
    await waitFor(() => {
      expect(screen.getByText(/room name is required/i)).toBeInTheDocument();
    });
  });
});

describe('ChallengeRoom – Active Room State', () => {
  const roomProps = {
    currentRoom: mockRoom,
    leaderboard: mockLeaderboard,
    userRank: 2,
    onCreateRoom: mockOnCreateRoom,
    onJoinRoom: mockOnJoinRoom,
    totalCarbon: 14.5,
  };

  it('shows room name when in a room', () => {
    render(<ChallengeRoom {...roomProps} />);
    expect(screen.getByText('Eco Champions League')).toBeInTheDocument();
  });

  it('shows participant count', () => {
    render(<ChallengeRoom {...roomProps} />);
    expect(screen.getByText('2/10')).toBeInTheDocument();
  });

  it('shows user rank', () => {
    render(<ChallengeRoom {...roomProps} />);
    expect(screen.getAllByText(/#2/i).length).toBeGreaterThan(0);
  });

  it('shows leaderboard section', () => {
    render(<ChallengeRoom {...roomProps} />);
    expect(screen.getByText(/leaderboard/i)).toBeInTheDocument();
  });

  it('shows leaderboard entries', () => {
    render(<ChallengeRoom {...roomProps} />);
    expect(screen.getByText('eco_warrior')).toBeInTheDocument();
    expect(screen.getByText(/eco_champion/i)).toBeInTheDocument();
  });

  it('shows copy room code button', () => {
    render(<ChallengeRoom {...roomProps} />);
    expect(screen.getByRole('button', { name: /copy room code/i })).toBeInTheDocument();
  });

  it('shows room description when present', () => {
    render(<ChallengeRoom {...roomProps} />);
    expect(screen.getByText(/weekly carbon footprint challenge/i)).toBeInTheDocument();
  });
});
