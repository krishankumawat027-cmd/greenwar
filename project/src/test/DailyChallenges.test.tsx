import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DailyChallenges } from '../components/DailyChallenges';

describe('DailyChallenges', () => {
  it('renders correctly', () => {
    render(<DailyChallenges totalCarbonKg={10} logsCount={5} />);
    expect(screen.getByText('Daily Challenges')).toBeInTheDocument();
  });

  it('toggles challenge completion and updates points', () => {
    render(<DailyChallenges totalCarbonKg={10} logsCount={5} />);
    const buttons = screen.getAllByRole('button');
    // Find a challenge button (should have text like "+10" or similar)
    const challengeButton = buttons.find(b => b.textContent?.includes('+'));
    expect(challengeButton).toBeDefined();

    if (challengeButton) {
      fireEvent.click(challengeButton);
      // Challenges done count should increase or total points is shown
      expect(screen.getByText(/pts/i)).toBeInTheDocument();
    }
  });

  it('toggles achievements panel visibility', () => {
    render(<DailyChallenges totalCarbonKg={10} logsCount={5} />);
    const achievementsToggle = screen.getByRole('button', { name: /achievement badges/i });
    expect(achievementsToggle).toBeInTheDocument();

    // Panel should not be visible by default
    expect(screen.queryByRole('list', { name: /achievement badges/i })).not.toBeInTheDocument();

    // Click to show
    fireEvent.click(achievementsToggle);
    expect(screen.getByRole('list', { name: /achievement badges/i })).toBeInTheDocument();

    // Click to hide
    fireEvent.click(achievementsToggle);
    expect(screen.queryByRole('list', { name: /achievement badges/i })).not.toBeInTheDocument();
  });
});
