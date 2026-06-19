/**
 * Navigation – Bottom tab bar (mobile) / top nav bar (desktop).
 * Accessibility: role="navigation", aria-label, aria-current="page".
 */
import { LayoutDashboard, PlusCircle, Swords, User } from 'lucide-react';

type View = 'dashboard' | 'log' | 'challenges' | 'profile';

interface NavigationProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'log', label: 'Log', icon: PlusCircle },
  { id: 'challenges', label: 'Challenges', icon: Swords },
  { id: 'profile', label: 'Profile', icon: User },
];

export function Navigation({ activeView, onViewChange }: NavigationProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-carbon-dark/95 backdrop-blur-lg border-t border-carbon-light md:top-0 md:bottom-auto md:border-t-0 md:border-b md:h-16 safe-bottom"
    >
      <div className="max-w-7xl mx-auto px-2 md:px-6">
        <div className="flex items-center justify-around md:justify-start md:gap-8 md:h-full">
          {/* Logo – desktop only */}
          <div className="hidden md:flex items-center gap-2 mr-8" aria-hidden="true">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald to-emerald-dark flex items-center justify-center">
              <span className="text-carbon-dark font-bold text-sm">EC</span>
            </div>
            <span className="font-semibold text-white">EcoWarrior</span>
          </div>

          {/* Nav items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onViewChange(item.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-0 px-3 transition-all duration-200 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2 focus-visible:ring-offset-carbon-dark rounded-lg ${
                  isActive
                    ? 'text-emerald'
                    : 'text-carbon-muted hover:text-white'
                }`}
              >
                <Icon
                  size={22}
                  className={isActive ? 'animate-pulse-green' : ''}
                  aria-hidden="true"
                />
                <span className="text-xs md:text-sm font-medium">
                  {item.label}
                </span>
                {isActive && (
                  <div
                    className="absolute md:relative bottom-0 md:bottom-auto left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 w-1 h-1 md:w-0.5 md:h-6 bg-emerald rounded-full hidden md:block"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
