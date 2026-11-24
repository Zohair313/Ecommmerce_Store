import React, { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Safe input validation following safe-anything guidelines
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Sanitize and validate
    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail) {
      setStatus('error');
      setErrorMessage('Please enter an email address.');
      return;
    }

    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 100) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');

    // Simulate safe API submission
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 600);
  };

  return (
    <section className="section-newsletter" id="newsletter">
      <div className="section-container max-w-2xl text-center">
        <div className="newsletter-card">
          <div className="section-eyebrow">FIELD DISPATCH</div>
          <h2 className="newsletter-title">Join the TAWAKAL Testing Cohort</h2>
          <p className="newsletter-desc">
            Early access to limited production runs, arctic testing reports, and 10% off your initial outerwear order. No noise, just engineering updates.
          </p>

          {status === 'success' ? (
            <div className="newsletter-success-box">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <strong>You are on the dispatch list.</strong>
                <p>Check your inbox for your 10% welcome invitation code.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="newsletter-form" noValidate>
              <div className="form-input-wrap">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="newsletter-input"
                  disabled={status === 'submitting'}
                  aria-label="Email address for newsletter"
                />
                <button
                  type="submit"
                  className="newsletter-submit-btn"
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? 'Signing up...' : 'Subscribe'}
                </button>
              </div>

              {status === 'error' && (
                <div className="newsletter-error-msg">{errorMessage}</div>
              )}

              <p className="newsletter-privacy">
                We respect your inbox. Unsubscribe at any time with one click.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
