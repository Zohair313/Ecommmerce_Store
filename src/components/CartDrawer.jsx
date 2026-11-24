import React, { useState, useEffect } from 'react';
import { SHEET_FILE, buildImageUrl } from '../data/products';

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onCheckout
}) {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  // Handle Escape key to close drawer (shadcn & WCAG AA requirement)
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

  const sheetUrl = buildImageUrl(SHEET_FILE, 1024);

  // Subtotal calculation
  const subtotal = items.reduce((sum, item) => sum + item.product.priceNum * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const shippingThreshold = 200;
  const isFreeShipping = subtotal >= shippingThreshold;
  const shippingCost = items.length === 0 || isFreeShipping ? 0 : 25;
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  // Apply promo code safely with strict sanitization
  const handleApplyPromo = (e) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase().slice(0, 30);
    if (!/^[A-Z0-9_-]{1,30}$/.test(cleanCode)) {
      setPromoMessage('Please enter a valid promotional code.');
      return;
    }
    if (cleanCode === 'WINTER20') {
      setDiscountPercent(20);
      setPromoMessage('20% Winter discount applied!');
    } else if (cleanCode === 'TAWAKAL10') {
      setDiscountPercent(10);
      setPromoMessage('10% Welcome discount applied!');
    } else {
      setPromoMessage('Invalid promo code. Try WINTER20');
    }
  };

  return (
    <div className="cart-drawer-backdrop" onClick={onClose}>
      <div
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Bag"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-header-title">
            <h3>Shopping Bag</h3>
            <span className="cart-header-count">({items.reduce((acc, it) => acc + it.quantity, 0)} items)</span>
          </div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close Shopping Bag">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="shipping-progress-banner">
          {isFreeShipping ? (
            <span className="free-ship-unlocked">✓ Free Worldwide Express Shipping Unlocked!</span>
          ) : (
            <span>Add ${(shippingThreshold - subtotal).toFixed(2)} more for Free Express Shipping</span>
          )}
          <div className="shipping-bar">
            <div
              className="shipping-bar-fill"
              style={{ width: `${Math.min(100, (subtotal / shippingThreshold) * 100)}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="cart-items-list">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M5 8h14l-1 12.5H6z" />
                <path d="M8.5 10V6.8a3.5 3.5 0 0 1 7 0V10" />
              </svg>
              <h4>Your bag is currently empty</h4>
              <p>Explore the TAWAKAL collection or try on jackets on our virtual model.</p>
              <button className="btn-secondary mt-4" onClick={onClose}>
                Browse Collection
              </button>
            </div>
          ) : (
            items.map(item => {
              const prod = item.product;
              const crop = prod.crop;
              const k = 60 / Math.max(crop.w, crop.h);
              const w = crop.w * k;
              const h = crop.h * k;

              return (
                <div key={`${prod.id}-${item.size}`} className="cart-item-row">
                  <div className="cart-item-thumb">
                    <div
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

                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <h4 className="cart-item-name">{prod.title}</h4>
                      <button
                        className="cart-remove-btn"
                        onClick={() => onRemoveItem(prod.id, item.size)}
                        title="Remove item"
                      >
                        ×
                      </button>
                    </div>

                    <div className="cart-item-meta">
                      Size: {item.size} · {prod.pillSub}
                    </div>

                    <div className="cart-item-bottom">
                      {/* Quantity Controller */}
                      <div className="qty-control">
                        <button
                          onClick={() => onUpdateQty(prod.id, item.size, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQty(prod.id, item.size, item.quantity + 1)}
                          disabled={item.quantity >= 10}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-price">
                        ${(prod.priceNum * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout */}
        {items.length > 0 && (
          <div className="cart-drawer-footer">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="promo-form">
              <input
                type="text"
                placeholder="Discount code (try WINTER20)"
                value={promoCode}
                maxLength={30}
                onChange={(e) => setPromoCode(e.target.value)}
                className="promo-input"
                aria-label="Promotional discount code"
              />
              <button type="submit" className="promo-btn">Apply</button>
            </form>
            {promoMessage && (
              <div className={`promo-msg ${discountPercent > 0 ? 'success' : 'error'}`}>
                {promoMessage}
              </div>
            )}

            {/* Calculations */}
            <div className="cart-summary-line">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="cart-summary-line discount">
                <span>Discount ({discountPercent}%)</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="cart-summary-line">
              <span>Express Shipping</span>
              <span>{isFreeShipping ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
            </div>
            <div className="cart-summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button className="btn-checkout" onClick={onCheckout}>
              Proceed to Secure Checkout
            </button>
            <p className="checkout-trust-note">
              30-Day Arctic Trial · Free Returns · Carbon-Neutral Shipping
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
