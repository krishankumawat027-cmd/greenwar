/**
 * AuthPortal – Sign In / Create Account form.
 * Accessibility: htmlFor/id on all inputs, aria-label on icon buttons,
 * role="alert" on errors, aria-invalid, aria-describedby.
 */
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useMockAuthStore, validatePassword, validateEmail } from '../lib/mockAuthStore';

export function AuthPortal() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp, error, clearError, isLoading } = useMockAuthStore();

  // Clear errors when mode changes
  useEffect(() => {
    setErrors({});
    clearError();
  }, [mode, clearError]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (mode === 'signup') {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.errors[0];
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!username.trim()) {
        newErrors.username = 'Username is required';
      } else if (username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    if (mode === 'signin') {
      await signIn(email, password, rememberMe);
    } else {
      await signUp(email, password, username);
    }
    setIsSubmitting(false);
  };

  const fillDemoCredentials = () => {
    setEmail('demo@ecowarrior.com');
    setPassword('Demo@123');
    setErrors({});
    clearError();
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12">
      {/* Logo & Branding */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald to-emerald-dark mb-4 shadow-lg shadow-emerald/20"
          aria-hidden="true"
        >
          <span className="text-carbon-dark font-bold text-2xl">EC</span>
        </div>
        <h1 className="text-white font-bold text-2xl mb-1">EcoWarrior</h1>
        <p className="text-carbon-muted text-sm">Carbon Footprint Tracker</p>
      </div>

      {/* Auth Card */}
      <div className="bg-carbon-gray rounded-2xl border border-carbon-light overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-carbon-light" role="tablist" aria-label="Authentication mode">
          <button
            role="tab"
            aria-selected={mode === 'signin'}
            aria-controls="auth-form"
            onClick={() => setMode('signin')}
            className={`flex-1 py-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald ${
              mode === 'signin'
                ? 'bg-carbon-dark/50 text-emerald border-b-2 border-emerald'
                : 'text-carbon-muted hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            role="tab"
            aria-selected={mode === 'signup'}
            aria-controls="auth-form"
            onClick={() => setMode('signup')}
            className={`flex-1 py-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald ${
              mode === 'signup'
                ? 'bg-carbon-dark/50 text-emerald border-b-2 border-emerald'
                : 'text-carbon-muted hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form
          id="auth-form"
          onSubmit={handleSubmit}
          className="p-6 space-y-4"
          noValidate
          aria-label={mode === 'signin' ? 'Sign in form' : 'Create account form'}
        >
          {/* Username (signup only) */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-username" className="block text-carbon-muted text-sm mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-carbon-muted" aria-hidden="true" />
                <input
                  id="auth-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  aria-required="true"
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                  className={`w-full bg-carbon-dark border rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-carbon-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald transition-colors ${
                    errors.username ? 'border-war-red' : 'border-carbon-light focus:border-emerald'
                  }`}
                />
              </div>
              {errors.username && (
                <p id="username-error" role="alert" className="text-war-red text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" aria-hidden="true" />
                  {errors.username}
                </p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="auth-email" className="block text-carbon-muted text-sm mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-carbon-muted" aria-hidden="true" />
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoCapitalize="none"
                autoComplete="email"
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full bg-carbon-dark border rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-carbon-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald transition-colors ${
                  errors.email ? 'border-war-red' : 'border-carbon-light focus:border-emerald'
                }`}
              />
            </div>
            {errors.email && (
              <p id="email-error" role="alert" className="text-war-red text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" aria-hidden="true" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="auth-password" className="block text-carbon-muted text-sm mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-carbon-muted" aria-hidden="true" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoCapitalize="none"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                aria-required="true"
                aria-invalid={!!errors.password}
                aria-describedby={`${errors.password ? 'password-error ' : ''}${mode === 'signup' ? 'password-hint' : ''}`}
                className={`w-full bg-carbon-dark border rounded-lg pl-12 pr-12 py-3 text-white placeholder:text-carbon-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald transition-colors ${
                  errors.password ? 'border-war-red' : 'border-carbon-light focus:border-emerald'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-carbon-muted hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded"
              >
                {showPassword
                  ? <EyeOff className="w-5 h-5" aria-hidden="true" />
                  : <Eye className="w-5 h-5" aria-hidden="true" />
                }
              </button>
            </div>
            {errors.password && (
              <p id="password-error" role="alert" className="text-war-red text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" aria-hidden="true" />
                {errors.password}
              </p>
            )}
            {mode === 'signup' && (
              <p id="password-hint" className="text-carbon-muted text-xs mt-2">
                Min 8 characters, 1 number, 1 special character
              </p>
            )}
          </div>

          {/* Confirm Password (signup only) */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-confirm-password" className="block text-carbon-muted text-sm mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-carbon-muted" aria-hidden="true" />
                <input
                  id="auth-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  autoCapitalize="none"
                  autoComplete="new-password"
                  aria-required="true"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                  className={`w-full bg-carbon-dark border rounded-lg pl-12 pr-12 py-3 text-white placeholder:text-carbon-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald transition-colors ${
                    errors.confirmPassword ? 'border-war-red' : 'border-carbon-light focus:border-emerald'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  aria-pressed={showConfirmPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-carbon-muted hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded"
                >
                  {showConfirmPassword
                    ? <EyeOff className="w-5 h-5" aria-hidden="true" />
                    : <Eye className="w-5 h-5" aria-hidden="true" />
                  }
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirm-password-error" role="alert" className="text-war-red text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" aria-hidden="true" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* Remember Me (signin only) */}
          {mode === 'signin' && (
            <div>
              <label htmlFor="auth-remember-me" className="flex items-center gap-3 cursor-pointer">
                <input
                  id="auth-remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded border-carbon-light bg-carbon-dark accent-emerald"
                />
                <span className="text-carbon-muted text-sm">Remember me</span>
              </label>
            </div>
          )}

          {/* API Error */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="bg-war-red/20 border border-war-red/30 rounded-lg p-3 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-war-red flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-war-red text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            aria-busy={isLoading || isSubmitting}
            aria-label={mode === 'signin' ? 'Sign in to your account' : 'Create new account'}
            className="w-full bg-gradient-to-r from-emerald to-emerald-dark text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald/20 transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
          >
            {(isLoading || isSubmitting) && <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />}
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          {/* Demo Credentials */}
          {mode === 'signin' && (
            <button
              type="button"
              onClick={fillDemoCredentials}
              aria-label="Fill demo credentials for testing"
              className="w-full bg-carbon-light/50 text-carbon-muted text-sm py-2 rounded-lg hover:bg-carbon-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
            >
              Use Demo Credentials
            </button>
          )}
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-carbon-muted text-xs mt-6">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
