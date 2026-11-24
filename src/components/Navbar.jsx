import React, { useState } from 'react';

export default function Navbar({
  cartCount,
  onOpenCart,
  onOpenAuth,
  user,
  onNavigateHome,
  onNavigateSection
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleBrandClick = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="site-header">
        {/* Top Announcement Bar */}
        <div className="announcement-bar">
          <span>Complimentary worldwide express shipping on orders over $200 · 30-Day Arctic Trial</span>
        </div>

        {/* Main Navbar */}
        <nav className="vestra-nav">
          <div className="nav-left">
            <button
              className="nav-collections-btn"
              onClick={() => handleNavClick('collection')}
              aria-label="View Collections"
            >
              <span className="nav-collections">Collections</span>
              <svg className="nav-chevron" viewBox="0 0 10 10">
                <path d="M2 3.5 l3 3 3-3" />
              </svg>
            </button>

            <div className="nav-links-desktop">
              <button onClick={() => handleNavClick('collection')} className="nav-text-link">Outerwear</button>
              <button onClick={() => handleNavClick('tech')} className="nav-text-link">Specs</button>
              <button onClick={() => handleNavClick('fit-lab')} className="nav-text-link">Fit Lab</button>
              <button onClick={() => handleNavClick('reviews')} className="nav-text-link">Reviews</button>
              <button onClick={() => handleNavClick('faq')} className="nav-text-link">FAQ</button>
            </div>
          </div>

          {/* Centered Brand Name: TAWAKAL */}
          <a href="#" className="nav-brand" onClick={handleBrandClick}>
            TAWAKAL
          </a>

          <div className="nav-right">
            {/* Account / User Button */}
            <button
              className="nav-icon-btn"
              aria-label="Account"
              onClick={onOpenAuth}
              title={user ? `Signed in as ${user.name}` : "Sign in to account"}
            >
              <svg className="nav-icon" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M4.5 20.5 c1.2-3.8 4-5.5 7.5-5.5 s6.3 1.7 7.5 5.5 z" />
              </svg>
              {user && <span className="nav-user-dot" />}
            </button>

            {/* Shopping Bag / Cart Drawer Button */}
            <button
              className="nav-icon-btn"
              aria-label="Shopping Bag"
              onClick={onOpenCart}
            >
              <svg className="nav-icon" viewBox="0 0 24 24">
                <path d="M5 8 h14 l-1 12.5 H6 z" />
                <path d="M8.5 10 V6.8 a3.5 3.5 0 0 1 7 0 V10" />
              </svg>
              {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              className="nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              <svg viewBox="0 0 24 24" className="nav-icon">
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-links">
            <button onClick={() => handleNavClick('collection')}>Outerwear Collection</button>
            <button onClick={() => handleNavClick('tech')}>Technical Anatomy</button>
            <button onClick={() => handleNavClick('fit-lab')}>Interactive Fit Lab</button>
            <button onClick={() => handleNavClick('reviews')}>Field Reviews</button>
            <button onClick={() => handleNavClick('faq')}>FAQ & Support</button>
            <div className="mobile-nav-auth">
              <button onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }} className="btn-secondary w-full">
                {user ? `Account (${user.name})` : "Sign In / Register"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
