import React from 'react';
import { REVIEWS } from '../data/products';

export default function Reviews() {
  return (
    <section className="section-reviews" id="reviews">
      <div className="section-container">
        <div className="section-header">
          <div className="section-eyebrow">VERIFIED FIELD REPORTS</div>
          <h2 className="section-title">Tested Across Cold Climates</h2>
          <div className="overall-score-row">
            <div className="stars-row">★★★★★</div>
            <span className="score-text">4.9 / 5.0 Average Rating based on 1,420 field trials</span>
          </div>
        </div>

        <div className="reviews-grid">
          {REVIEWS.map(rev => (
            <div key={rev.id} className="review-card">
              <div className="review-card-top">
                <div className="review-stars">{"★".repeat(rev.rating)}</div>
                <span className="review-date">{rev.date}</span>
              </div>

              <h4 className="review-title">"{rev.title}"</h4>
              <p className="review-comment">{rev.comment}</p>

              <div className="review-footer">
                <div className="reviewer-avatar">{rev.author[0]}</div>
                <div className="reviewer-info">
                  <div className="reviewer-name">
                    {rev.author}
                    {rev.verified && <span className="verified-badge" title="Verified Customer">✓ Verified</span>}
                  </div>
                  <div className="reviewer-meta">{rev.location} · {rev.product}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Brand Guarantees Strip */}
        <div className="guarantees-strip">
          <div className="guarantee-item">
            <svg viewBox="0 0 24 24" className="guarantee-icon" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div>
              <strong>Lifetime Seam Guarantee</strong>
              <p>Free repairs on any seam, zipper, or baffle.</p>
            </div>
          </div>

          <div className="guarantee-item">
            <svg viewBox="0 0 24 24" className="guarantee-icon" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <div>
              <strong>30-Day Real-World Trial</strong>
              <p>Test in real sub-zero weather or full refund.</p>
            </div>
          </div>

          <div className="guarantee-item">
            <svg viewBox="0 0 24 24" className="guarantee-icon" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 8h14M5 8a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
            </svg>
            <div>
              <strong>Carbon-Neutral Express</strong>
              <p>Delivered worldwide via DHL Express in 2–4 days.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
