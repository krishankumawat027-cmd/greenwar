/**
 * Tests for the Navigation component.
 * Covers rendering, active states, and view switching.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from '../components/Navigation';

describe('Navigation', () => {
  it('renders all navigation items', () => {
    const onViewChange = vi.fn();
    render(<Navigation activeView="dashboard" onViewChange={onViewChange} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Log')).toBeInTheDocument();
    expect(screen.getByText('Challenges')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('renders a nav element with accessible label', () => {
    const onViewChange = vi.fn();
    render(<Navigation activeView="dashboard" onViewChange={onViewChange} />);
    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it('marks dashboard button as current page when active', () => {
    const onViewChange = vi.fn();
    render(<Navigation activeView="dashboard" onViewChange={onViewChange} />);
    const dashBtn = screen.getByRole('button', { name: /dashboard/i });
    expect(dashBtn).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark inactive buttons as current', () => {
    const onViewChange = vi.fn();
    render(<Navigation activeView="dashboard" onViewChange={onViewChange} />);
    const logBtn = screen.getByRole('button', { name: /log/i });
    expect(logBtn).not.toHaveAttribute('aria-current', 'page');
  });

  it('calls onViewChange with correct view on click', () => {
    const onViewChange = vi.fn();
    render(<Navigation activeView="dashboard" onViewChange={onViewChange} />);
    fireEvent.click(screen.getByRole('button', { name: /challenges/i }));
    expect(onViewChange).toHaveBeenCalledWith('challenges');
  });

  it('calls onViewChange for profile button', () => {
    const onViewChange = vi.fn();
    render(<Navigation activeView="dashboard" onViewChange={onViewChange} />);
    fireEvent.click(screen.getByRole('button', { name: /profile/i }));
    expect(onViewChange).toHaveBeenCalledWith('profile');
  });

  it('calls onViewChange for log button', () => {
    const onViewChange = vi.fn();
    render(<Navigation activeView="dashboard" onViewChange={onViewChange} />);
    fireEvent.click(screen.getByRole('button', { name: /^log$/i }));
    expect(onViewChange).toHaveBeenCalledWith('log');
  });

  it('marks challenges as current when active', () => {
    const onViewChange = vi.fn();
    render(<Navigation activeView="challenges" onViewChange={onViewChange} />);
    const btn = screen.getByRole('button', { name: /challenges/i });
    expect(btn).toHaveAttribute('aria-current', 'page');
  });

  it('renders 4 navigation buttons', () => {
    const onViewChange = vi.fn();
    render(<Navigation activeView="dashboard" onViewChange={onViewChange} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });
});
