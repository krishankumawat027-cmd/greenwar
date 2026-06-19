import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EcoScoreCard } from '../components/EcoScoreCard';

describe('EcoScoreCard', () => {
  const categoryTotals = { transport: 5, food: 3, energy: 2 };

  it('renders Eco Score and Carbon Saved', () => {
    render(<EcoScoreCard totalCarbonKg={10} categoryTotals={categoryTotals} />);
    expect(screen.getByText('Eco Score')).toBeInTheDocument();
    expect(screen.getByText('Carbon Saved')).toBeInTheDocument();
  });

  it('toggles AI recommendations panel', () => {
    render(<EcoScoreCard totalCarbonKg={10} categoryTotals={categoryTotals} />);
    const recommendationsToggle = screen.getByRole('button', { name: /ai recommendations/i });
    expect(recommendationsToggle).toBeInTheDocument();

    // Should not show recommendations list initially
    expect(screen.queryByRole('list', { name: /ai sustainability recommendations/i })).not.toBeInTheDocument();

    // Click to show
    fireEvent.click(recommendationsToggle);
    expect(screen.getByRole('list', { name: /ai sustainability recommendations/i })).toBeInTheDocument();

    // Click to hide
    fireEvent.click(recommendationsToggle);
    expect(screen.queryByRole('list', { name: /ai sustainability recommendations/i })).not.toBeInTheDocument();
  });
});
