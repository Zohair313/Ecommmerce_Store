import React, { useState, useEffect } from 'react';

export default function AuthModal({
  isOpen,
  onClose,
  user,
  onLogin,
  onLogout
}) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Handle Escape key to close dialog (shadcn & WCAG AA requirement)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please provide a valid email format.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    // Successful mock authentication
    const displayName = isRegister && name.trim() ? name.trim() : cleanEmail.split('@')[0];
    onLogin({
      email: cleanEmail,
      name: displayName,
      memberSince: 'November 2026',
      ordersCount: 2
    });
    onClose();
  };

  const handleDemoLogin = () => {
    onLogin({
      email: 'alex.expedition@tawakal.com',
      name: 'Alex Mercer',
      memberSince: 'October 2026',
      ordersCount: 3
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="auth-modal-title">{user ? 'TAWAKAL Member Profile' : (isRegister ? 'Create Member Account' : 'Member Sign In')}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">×</button>
        </div>

        {user ? (
          <div className="user-profile-view">
            <div className="user-avatar-badge">{user.name[0]}</div>
            <h4>Welcome back, {user.name}</h4>
            <p className="user-email">{user.email}</p>
            <div className="user-meta-grid">
              <div className="meta-box">
                <span className="meta-num">{user.ordersCount}</span>
                <span className="meta-lbl">Total Orders</span>
              </div>
              <div className="meta-box">
                <span className="meta-num">VIP</span>
                <span className="meta-lbl">Arctic Tier</span>
              </div>
            </div>

            <div className="recent-orders-preview">
              <h5>Recent Dispatch</h5>
              <div className="order-row">
                <span>#TWK-8291 · Alpine Puffer (Ice Grey)</span>
                <span className="status-delivered">Delivered</span>
              </div>
            </div>

            <button className="btn-secondary w-full mt-4" onClick={onLogout}>
              Sign Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${!isRegister ? 'active' : ''}`}
                onClick={() => { setIsRegister(false); setError(''); }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab ${isRegister ? 'active' : ''}`}
                onClick={() => { setIsRegister(true); setError(''); }}
              >
                Register
              </button>
            </div>

            {error && <div className="auth-error-banner">{error}</div>}

            {isRegister && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  maxLength={80}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                maxLength={100}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  maxLength={128}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  required
                />
                <button
                  type="button"
                  className="toggle-pw-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>

            <div className="divider-text"><span>or explore immediately</span></div>

            <button
              type="button"
              className="btn-demo-login w-full"
              onClick={handleDemoLogin}
            >
              Sign In with 1-Click Demo Profile
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
