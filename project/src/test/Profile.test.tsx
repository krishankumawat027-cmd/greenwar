/**
 * Tests for the Profile component.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Profile } from '../components/Profile';

const defaultProps = {
  username: 'eco_champion',
  email: 'eco@test.com',
  totalCarbon: 14.5,
  logsCount: 8,
  onSignOut: vi.fn().mockResolvedValue(undefined),
};

describe('Profile – Rendering', () => {
  it('renders username', () => {
    render(<Profile {...defaultProps} />);
    expect(screen.getByText('eco_champion')).toBeInTheDocument();
  });

  it('renders email', () => {
    render(<Profile {...defaultProps} />);
    expect(screen.getByText('eco@test.com')).toBeInTheDocument();
  });

  it('renders total carbon stat', () => {
    render(<Profile {...defaultProps} />);
    expect(screen.getByText('14.5')).toBeInTheDocument();
    expect(screen.getByText(/kg co₂ total/i)).toBeInTheDocument();
  });

  it('renders logs count', () => {
    render(<Profile {...defaultProps} />);
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText(/activities/i)).toBeInTheDocument();
  });

  it('renders Account section', () => {
    render(<Profile {...defaultProps} />);
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('renders Achievements section', () => {
    render(<Profile {...defaultProps} />);
    expect(screen.getByText('Achievements')).toBeInTheDocument();
  });

  it('renders Sign Out button', () => {
    render(<Profile {...defaultProps} />);
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('renders Security, Notifications, Settings, and Help buttons', () => {
    render(<Profile {...defaultProps} />);
    expect(screen.getByRole('button', { name: /security/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /help/i })).toBeInTheDocument();
  });

  it('renders without email gracefully', () => {
    render(<Profile {...defaultProps} email={undefined} />);
    expect(screen.getByText('eco_champion')).toBeInTheDocument();
    expect(screen.queryByText('eco@test.com')).not.toBeInTheDocument();
  });
});

describe('Profile – Achievements', () => {
  it('renders First Log achievement', () => {
    render(<Profile {...defaultProps} logsCount={5} />);
    expect(screen.getByText(/first/i)).toBeInTheDocument();
  });
});

describe('Profile – Sign Out', () => {
  it('opens logout modal when Sign Out is clicked', () => {
    render(<Profile {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes logout modal when Cancel is clicked', () => {
    render(<Profile {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
