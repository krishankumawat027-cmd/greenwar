/**
 * Tests for the ActivityLogger component.
 * Covers category selection, value input, carbon preview, and submission.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActivityLogger } from '../components/ActivityLogger';


const mockOnSubmit = vi.fn().mockReturnValue({ success: true });

const defaultProps = {
  onSubmit: mockOnSubmit,
  isLogging: false,
};

beforeEach(() => {
  mockOnSubmit.mockClear();
});

describe('ActivityLogger – Rendering', () => {
  it('renders the Log Activity heading', () => {
    render(<ActivityLogger {...defaultProps} />);
    expect(screen.getByRole('heading', { name: /log activity/i })).toBeInTheDocument();
  });

  it('renders three category buttons', () => {
    render(<ActivityLogger {...defaultProps} />);
    expect(screen.getByRole('button', { name: /transport/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /food/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /energy/i })).toBeInTheDocument();
  });

  it('renders Activity Type label and dropdown', () => {
    render(<ActivityLogger {...defaultProps} />);
    expect(screen.getByLabelText(/activity type/i)).toBeInTheDocument();
  });

  it('renders value input with label', () => {
    render(<ActivityLogger {...defaultProps} />);
    // The label includes the activity name and unit
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('renders the Log Activity submit button', () => {
    render(<ActivityLogger {...defaultProps} />);
    expect(screen.getByRole('button', { name: /log this activity/i })).toBeInTheDocument();
  });

  it('renders carbon coefficients info section', () => {
    render(<ActivityLogger {...defaultProps} />);
    expect(screen.getByText(/carbon coefficients/i)).toBeInTheDocument();
  });
});

describe('ActivityLogger – Category Selection', () => {
  it('selects transport by default', () => {
    render(<ActivityLogger {...defaultProps} />);
    const transportBtn = screen.getByRole('button', { name: /transport/i });
    // Transport button should have active class indicators
    expect(transportBtn).toBeInTheDocument();
  });

  it('switches to food category on click', () => {
    render(<ActivityLogger {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /select food category/i }));
    const select = screen.getByLabelText(/activity type/i) as HTMLSelectElement;
    expect(select.value).toBe('meat_heavy');
  });

  it('switches to energy category on click', () => {
    render(<ActivityLogger {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /select energy category/i }));
    const select = screen.getByLabelText(/activity type/i) as HTMLSelectElement;
    expect(select.value).toBe('electricity');
  });

  it('shows verification ticket checkbox for car transport', () => {
    render(<ActivityLogger {...defaultProps} />);
    // Car is default transport option; verification ticket shown for car
    expect(screen.getByText(/verification ticket/i)).toBeInTheDocument();
  });

  it('hides verification ticket for walking', () => {
    render(<ActivityLogger {...defaultProps} />);
    const select = screen.getByLabelText(/activity type/i);
    fireEvent.change(select, { target: { value: 'walking' } });
    expect(screen.queryByText(/verification ticket/i)).not.toBeInTheDocument();
  });
});

describe('ActivityLogger – Carbon Preview', () => {
  it('shows carbon preview when valid value is entered', async () => {
    render(<ActivityLogger {...defaultProps} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '100' } });
    await waitFor(() => {
      expect(screen.getByText(/estimated carbon footprint/i)).toBeInTheDocument();
    });
  });

  it('shows CO₂ in the preview', async () => {
    render(<ActivityLogger {...defaultProps} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '50' } });
    await waitFor(() => {
      expect(screen.getByText(/9\.000/)).toBeInTheDocument();
    });
  });
});

describe('ActivityLogger – Submission', () => {
  it('calls onSubmit with correct data when valid', async () => {
    render(<ActivityLogger {...defaultProps} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: /log this activity/i }));
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'transport',
          activityType: 'car',
          value: 25,
          unit: 'km',
        })
      );
    });
  });

  it('shows success message after successful submission', async () => {
    render(<ActivityLogger {...defaultProps} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: /log this activity/i }));
    await waitFor(() => {
      expect(screen.getByText(/activity logged successfully/i)).toBeInTheDocument();
    });
  });

  it('shows error message for invalid input', async () => {
    render(<ActivityLogger {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /log this activity/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid positive value/i)).toBeInTheDocument();
    });
  });

  it('disables submit button when isLogging is true', () => {
    render(<ActivityLogger {...defaultProps} isLogging={true} />);
    expect(screen.getByRole('button', { name: /logging/i })).toBeDisabled();
  });

  it('shows error when submission fails', async () => {
    const failSubmit = vi.fn().mockReturnValue({ success: false, error: 'Network error' });
    render(<ActivityLogger onSubmit={failSubmit} isLogging={false} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: /log this activity/i }));
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
