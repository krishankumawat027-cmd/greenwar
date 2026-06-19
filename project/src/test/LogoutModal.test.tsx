/**
 * Tests for the LogoutModal component.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogoutModal } from '../components/LogoutModal';

describe('LogoutModal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <LogoutModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} isLoading={false} />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog when isOpen is true', () => {
    render(
      <LogoutModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} isLoading={false} />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has accessible dialog label', () => {
    render(
      <LogoutModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} isLoading={false} />
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label');
  });

  it('displays Sign Out title', () => {
    render(
      <LogoutModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} isLoading={false} />
    );
    expect(screen.getByRole('heading', { name: 'Sign Out' })).toBeInTheDocument();
  });

  it('shows confirmation message', () => {
    render(
      <LogoutModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} isLoading={false} />
    );
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(
      <LogoutModal isOpen={true} onClose={onClose} onConfirm={vi.fn()} isLoading={false} />
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onConfirm when Sign Out button is clicked', () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <LogoutModal isOpen={true} onClose={vi.fn()} onConfirm={onConfirm} isLoading={false} />
    );
    fireEvent.click(screen.getByRole('button', { name: /confirm sign out/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <LogoutModal isOpen={true} onClose={onClose} onConfirm={vi.fn()} isLoading={false} />
    );
    // Click the backdrop (first div inside the fixed container)
    const backdrop = document.querySelector('.absolute.inset-0');
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('disables buttons while loading', () => {
    render(
      <LogoutModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} isLoading={true} />
    );
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    const signOutBtn = screen.getByRole('button', { name: /confirm sign out/i });
    expect(cancelBtn).toBeDisabled();
    expect(signOutBtn).toBeDisabled();
  });

  it('shows close button with accessible label', () => {
    render(
      <LogoutModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} isLoading={false} />
    );
    const closeBtn = screen.getByRole('button', { name: /close/i });
    expect(closeBtn).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <LogoutModal isOpen={true} onClose={onClose} onConfirm={vi.fn()} isLoading={false} />
    );
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
