/**
 * Tests for the Dashboard component.
 * Covers rendering of metrics, category breakdown, and recent activity.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../components/Dashboard';
import type { MockActivityLog } from '../lib/mockData';

// Mock recharts to avoid SVG rendering issues in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Bar: () => <div />,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}));

const mockLogs: MockActivityLog[] = [
  {
    id: '1',
    user_id: 'demo-user',
    category: 'transport',
    activity_type: 'car',
    value: 25,
    unit: 'km',
    carbon_kg: 4.5,
    verification_ticket: false,
    logged_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo-user',
    category: 'food',
    activity_type: 'vegan',
    value: 2,
    unit: 'meals',
    carbon_kg: 1.0,
    verification_ticket: false,
    logged_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

const defaultProps = {
  totalCarbon: 5.5,
  categoryTotals: { transport: 4.5, food: 1.0, energy: 0 },
  logs: mockLogs,
  username: 'eco_champion',
};

describe('Dashboard', () => {
  it('renders welcome message with username', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText('eco_champion')).toBeInTheDocument();
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  it('renders carbon footprint heading', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText(/your carbon footprint/i)).toBeInTheDocument();
  });

  it('renders category breakdown section', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Energy')).toBeInTheDocument();
  });

  it('renders emissions chart section', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText(/emissions by category/i)).toBeInTheDocument();
  });

  it('renders daily trend chart section', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText(/daily trend/i)).toBeInTheDocument();
  });

  it('renders recent activity section', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
  });

  it('renders up to 5 recent activity items', () => {
    render(<Dashboard {...defaultProps} />);
    // car activity should be shown
    expect(screen.getByText('car', { selector: 'p' })).toBeInTheDocument();
  });

  it('shows "Below average!" for low carbon footprint', () => {
    render(<Dashboard {...defaultProps} totalCarbon={5.5} />);
    expect(screen.getByText(/below average/i)).toBeInTheDocument();
  });

  it('shows "Above average" for high carbon footprint', () => {
    render(<Dashboard {...defaultProps} totalCarbon={100} />);
    expect(screen.getByText(/above average/i)).toBeInTheDocument();
  });

  it('renders Eco Score section', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText(/eco score/i)).toBeInTheDocument();
  });

  it('renders carbon saved metric', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText(/carbon saved/i)).toBeInTheDocument();
  });

  it('renders daily challenges section', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText(/daily challenges/i)).toBeInTheDocument();
  });

  it('renders category CO₂ values', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('renders with empty logs gracefully', () => {
    render(<Dashboard {...defaultProps} logs={[]} totalCarbon={0} />);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  it('displays main heading for screen readers', () => {
    render(<Dashboard {...defaultProps} />);
    const heading = screen.getByRole('heading', { name: /eco_champion/i });
    expect(heading).toBeInTheDocument();
  });
});
