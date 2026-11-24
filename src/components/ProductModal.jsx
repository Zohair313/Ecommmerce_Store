import React, { useState, useEffect } from 'react';
import { SHEET_FILE, buildImageUrl } from '../data/products';

export default function ProductModal({
  product,
  onClose,
  onAddToCart,
  onTryOn,
  onOpenPdp
}) {
  const [selectedSize, setSelectedSize] = useState('M');

  // Handle Escape key to close modal (shadcn & WCAG AA requirement)
  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const sheetUrl = buildImageUrl(SHEET_FILE, 1024);
  const crop = product.crop;
  const k = 220 / Math.max(crop.w, crop.h);
  const w = crop.w * k;
  const h = crop.h * k;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content product-quick-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">×</button>

        <div className="quick-modal-grid">
          {/* Image Stage */}
          <div className="quick-modal-image-col">
            <div
              className="modal-packshot-img"
              style={{
                width: `${w}px`,
                height: `${h}px`,
                backgroundImage: `url(${sheetUrl})`,
                backgroundSize: `${2048 * k}px ${2048 * k}px`,
                backgroundPosition: `${-crop.x * k}px ${-crop.y * k}px`,
                backgroundRepeat: 'no-repeat'
              }}
            />
          </div>

          {/* Details Column */}
          <div className="quick-modal-details-col">
            <div className="quick-badge-row">
              <span className="spec-badge">{product.badge}</span>
              <span className="product-card-color">{product.pillSub}</span>
            </div>

            <h3 id="quick-modal-title" className="quick-modal-title">{product.title}</h3>
            <div className="quick-modal-price">{product.price}</div>
            <p className="quick-modal-desc">{product.description}</p>

            {/* Size Selector */}
            <div className="quick-size-section">
              <div className="size-label-row">
                <span>Select Size</span>
                <span className="size-guide-hint">True to size</span>
              </div>
              <div className="size-pill-row">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    className={`size-pill ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Specs Checklist */}
            <div className="quick-specs-list">
              {product.specs.map((s, i) => (
                <div key={i} className="quick-spec-item">
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8.5 l3.5 3.5 6.5-7" strokeLinecap="round" />
                  </svg>
                  <span>{s}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="quick-modal-actions">
              <button
                className="btn-primary flex-1"
                onClick={() => {
                  onAddToCart({ ...product, selectedSize });
                  onClose();
                }}
              >
                Add Size {selectedSize} to Bag
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  onTryOn(product.id);
                  onClose();
                }}
              >
                Try On
              </button>
              {onOpenPdp && (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    onOpenPdp(product.id);
                    onClose();
                  }}
                  title="View full product page"
                >
                  Full Page →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
