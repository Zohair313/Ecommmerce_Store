import React from 'react';

export default function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-top-grid">
          {/* Brand Info */}
          <div className="footer-col brand-col">
            <span className="footer-brand">TAWAKAL</span>
            <p className="footer-manifesto">
              Technical menswear engineered for sub-zero climates and extreme cold weather. Built without compromise, tested on alpine glaciers, and guaranteed for life.
            </p>
            <div className="footer-certifications">
              <span>RDS Certified Down</span> · <span>PFAS-Free DWR</span> · <span>Zero Carbon Logistics</span>
            </div>
          </div>

          {/* Nav links */}
          <div className="footer-col">
            <h4>Outerwear</h4>
            <ul>
              <li><button onClick={() => scrollTo('collection')}>Alpine Down Puffers</button></li>
              <li><button onClick={() => scrollTo('collection')}>Technical Storm Shells</button></li>
              <li><button onClick={() => scrollTo('collection')}>Bonded Thermal Fleece</button></li>
              <li><button onClick={() => scrollTo('collection')}>Heavy Expedition Parkas</button></li>
            </ul>
          </div>

          {/* Engineering */}
          <div className="footer-col">
            <h4>Engineering & Fit</h4>
            <ul>
              <li><button onClick={() => scrollTo('tech')}>Materials & Lab Data</button></li>
              <li><button onClick={() => scrollTo('fit-lab')}>Interactive Fit Lab</button></li>
              <li><button onClick={() => scrollTo('reviews')}>Field Test Reports</button></li>
              <li><button onClick={() => scrollTo('faq')}>Care & Lifetime Warranty</button></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="footer-col">
            <h4>Customer Care</h4>
            <ul>
              <li><span>DHL Express Global Tracking</span></li>
              <li><span>30-Day Arctic Trial Policy</span></li>
              <li><span>Seam & Zipper Lifetime Repairs</span></li>
              <li><span>support@tawakal.com</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copy">
            © 2026 TAWAKAL OUTERWEAR LTD. All rights reserved.
          </div>
          <div className="footer-badges">
            <span className="secure-badge">🔒 256-Bit Encrypted Checkout</span>
            <span className="secure-badge">🛡️ Verified Authentic RDS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
