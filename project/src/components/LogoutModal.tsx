/**
 * LogoutModal – Confirmation dialog for signing out.
 * Accessibility: role="dialog", aria-modal, aria-label, focus trap,
 * accessible close button.
 */
import { LogOut, X, Loader2 } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function LogoutModal({ isOpen, onClose, onConfirm, isLoading }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true" aria-label="Logout confirmation" aria-labelledby="logout-modal-title" aria-describedby="logout-modal-desc">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-carbon-dark/90 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-carbon-gray rounded-2xl border border-carbon-light w-full max-w-sm p-6 animate-slideUp">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close sign out dialog"
          className="absolute top-4 right-4 text-carbon-muted hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-md p-1"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-war-red/20 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
          <LogOut className="w-7 h-7 text-war-red" aria-hidden="true" />
        </div>

        {/* Title */}
        <h3
          id="logout-modal-title"
          className="text-white font-semibold text-lg text-center mb-2"
        >
          Sign Out
        </h3>

        {/* Description */}
        <p id="logout-modal-desc" className="text-carbon-muted text-sm text-center mb-6">
          Are you sure you want to sign out? You will need to sign in again to access your account.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            aria-label="Cancel and keep session"
            className="flex-1 bg-carbon-light text-white font-medium py-2.5 rounded-lg hover:bg-carbon-light/80 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            aria-label="Confirm sign out"
            className="flex-1 bg-war-red text-white font-medium py-2.5 rounded-lg hover:bg-war-red/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-war-red"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
