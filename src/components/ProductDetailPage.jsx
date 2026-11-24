import React, { useState, useEffect } from 'react';
import { PRODUCTS, SHEET_FILE, buildImageUrl } from '../data/products';

export default function ProductDetailPage({
  productId,
  onSelectProduct,
  onAddToCart,
  onTryOnInHero,
  onBackToHome,
  onBackToCollection
}) {
  const product = PRODUCTS[productId] || PRODUCTS[0];
  const [activeMediaTab, setActiveMediaTab] = useState('model'); // 'model' | 'packshot'
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeSpecTab, setActiveSpecTab] = useState('specs'); // 'specs' | 'climate' | 'care'
  const [zoomStyle, setZoomStyle] = useState({ transform: 'scale(1)', transformOrigin: 'center center' });

  // Reset state on product change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setQuantity(1);
    setSelectedSize('M');
  }, [productId]);

  // Image URLs
  const modelWearUrl = buildImageUrl(product.wearFile, 2048);
  const sheetUrl = buildImageUrl(SHEET_FILE, 2048);

  // Packshot calculations
  const crop = product.crop;
  const containerW = 480;
  const containerH = 540;
  const k = Math.min((containerW * 0.88) / crop.w, (containerH * 0.88) / crop.h);
  const packshotW = crop.w * k;
  const packshotH = crop.h * k;

  // Zoom on hover handler
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transform: 'scale(1.4)',
      transformOrigin: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transform: 'scale(1)',
      transformOrigin: 'center center'
    });
  };

  // Stepper bounded between 1 and 10
  const handleQtyChange = (delta) => {
    setQuantity(prev => Math.min(10, Math.max(1, prev + delta)));
  };

  // Adjacent navigation
  const prevId = (product.id + 3) % 4;
  const nextId = (product.id + 1) % 4;

  const installmentPrice = (product.priceNum / 4).toFixed(2);

  return (
    <div className="product-detail-page">
      {/* Breadcrumbs & Adjacent Navigation Bar */}
      <div className="pdp-top-bar">
        <div className="pdp-container pdp-bar-inner">
          <div className="pdp-breadcrumbs">
            <button className="breadcrumb-link" onClick={onBackToHome}>Home</button>
            <span className="breadcrumb-sep">/</span>
            <button className="breadcrumb-link" onClick={onBackToCollection}>Outerwear</button>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{product.title}</span>
          </div>

          <div className="pdp-adjacent-nav">
            <button
              className="adjacent-btn"
              onClick={() => onSelectProduct(prevId)}
              title={`View ${PRODUCTS[prevId].title}`}
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M10 13L5 8l5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Prev: {PRODUCTS[prevId].title}</span>
            </button>
            <span className="adjacent-divider">|</span>
            <button
              className="adjacent-btn"
              onClick={() => onSelectProduct(nextId)}
              title={`View ${PRODUCTS[nextId].title}`}
            >
              <span>Next: {PRODUCTS[nextId].title}</span>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <section className="pdp-main-section">
        <div className="pdp-container pdp-grid-layout">
          {/* Left Column: Visual Studio & Media Viewer */}
          <div className="pdp-visual-column">
            {/* View Switcher Tabs */}
            <div className="pdp-view-switcher">
              <button
                className={`pdp-view-tab ${activeMediaTab === 'model' ? 'active' : ''}`}
                onClick={() => setActiveMediaTab('model')}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="7" r="4" />
                  <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
                </svg>
                <span>Studio Model</span>
              </button>
              <button
                className={`pdp-view-tab ${activeMediaTab === 'packshot' ? 'active' : ''}`}
                onClick={() => setActiveMediaTab('packshot')}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
                </svg>
                <span>Cut-out Packshot</span>
              </button>
            </div>

            {/* Media Stage */}
            <div
              className="pdp-stage-box"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {activeMediaTab === 'model' ? (
                <div className="pdp-model-wrapper">
                  <img
                    src={modelWearUrl}
                    alt={`${product.title} worn by model in ice-stone studio`}
                    className="pdp-model-img"
                    style={zoomStyle}
                  />
                  <div className="pdp-model-meta-badge">
                    <span>Model 6'1" (185 cm) · Wearing Size M · Ice-Stone Studio</span>
                  </div>
                </div>
              ) : (
                <div className="pdp-packshot-wrapper">
                  <div
                    className="pdp-packshot-img"
                    style={{
                      width: `${packshotW}px`,
                      height: `${packshotH}px`,
                      backgroundImage: `url(${sheetUrl})`,
                      backgroundSize: `${2048 * k}px ${2048 * k}px`,
                      backgroundPosition: `${-crop.x * k}px ${-crop.y * k}px`,
                      backgroundRepeat: 'no-repeat',
                      ...zoomStyle
                    }}
                  />
                  <div className="pdp-model-meta-badge">
                    <span>Isolated Ghost-Mannequin Packshot · 2048px Resolution</span>
                  </div>
                </div>
              )}

              {/* Floating Badges */}
              <div className="pdp-badge-stack">
                <span className="pdp-pill-badge">{product.badge}</span>
                <span className="pdp-pill-badge alt">{product.temperatureRating}</span>
              </div>
            </div>

            {/* Live Model Try-On Shortcut Box */}
            <div className="pdp-tryon-banner" onClick={() => onTryOnInHero(product.id)}>
              <div className="pdp-tryon-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="7" r="4" />
                  <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="pdp-tryon-text">
                <strong>Try On Live 3D Studio Model</strong>
                <p>Experience the garment fly and fit on our virtual model with real-time physics.</p>
              </div>
              <button className="pdp-tryon-arrow" aria-label="Launch try on studio">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Column: Buy Box & Product Configuration */}
          <div className="pdp-info-column">
            {/* Header info */}
            <div className="pdp-header-info">
              <div className="pdp-eyebrow">
                <span>TAWAKAL ARCTIC LAB · SERIES 0{product.id + 1}</span>
                <span className="pdp-sku">SKU: TWK-2026-0{product.id + 1}</span>
              </div>

              <h1 className="pdp-title">{product.title}</h1>
              <p className="pdp-subheading">{product.pillName} · {product.pillSub}</p>

              <div className="pdp-price-row">
                <span className="pdp-price">{product.price}</span>
                <span className="pdp-tax-note">Taxes included · Free express delivery</span>
              </div>

              <div className="pdp-installments">
                <span>or 4 interest-free payments of <strong>${installmentPrice}</strong> with Klarna or Afterpay</span>
              </div>

              {/* Rating */}
              <div className="pdp-rating-row">
                <div className="pdp-stars">★★★★★</div>
                <span className="pdp-rating-score">{product.rating}</span>
                <span className="pdp-reviews-link">({product.reviewsCount} verified expedition field reviews)</span>
              </div>
            </div>

            {/* Description */}
            <p className="pdp-description">{product.description}</p>

            {/* Colorway / Garment Swatches */}
            <div className="pdp-section-block">
              <div className="pdp-label-row">
                <span className="pdp-label">Colorway</span>
                <span className="pdp-label-value">{product.pillSub}</span>
              </div>
              <div className="pdp-swatch-row">
                {PRODUCTS.map(p => (
                  <button
                    key={p.id}
                    className={`pdp-swatch-btn ${p.id === product.id ? 'active' : ''}`}
                    onClick={() => onSelectProduct(p.id)}
                    title={`${p.title} (${p.pillSub})`}
                  >
                    <span className="swatch-circle" style={{ backgroundColor: p.colorHex || '#999' }} />
                    <span className="swatch-label">{p.pillSub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="pdp-section-block">
              <div className="pdp-label-row">
                <span className="pdp-label">Select Size</span>
                <span className="pdp-stock-status">In Stock · Ships within 24 hours</span>
              </div>
              <div className="pdp-sizes-row">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    className={`pdp-size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <div className="pdp-fit-note">
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M8 1v14M1 8h14" strokeLinecap="round" />
                </svg>
                <span>{product.fitDetails}</span>
              </div>
            </div>

            {/* Quantity & Add to Cart CTAs */}
            <div className="pdp-purchase-row">
              <div className="pdp-qty-stepper">
                <button
                  className="qty-btn"
                  onClick={() => handleQtyChange(-1)}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="qty-number">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => handleQtyChange(1)}
                  disabled={quantity >= 10}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                className="btn-pdp-add-cart"
                onClick={() => {
                  for (let i = 0; i < quantity; i++) {
                    onAddToCart(product, selectedSize);
                  }
                }}
              >
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3.5 5.5 h9 l-.7 8 h-7.6 z" />
                  <path d="M6 7 V4.6 a2 2 0 0 1 4 0 V7" />
                </svg>
                <span>Add to Shopping Bag · ${(product.priceNum * quantity).toFixed(2)}</span>
              </button>
            </div>

            {/* Quick Virtual Try On CTA */}
            <button
              className="btn-pdp-tryon-hero"
              onClick={() => onTryOnInHero(product.id)}
            >
              <span>Launch Virtual Try-On Studio Model</span>
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Service & Guarantee Badges */}
            <div className="pdp-guarantee-grid">
              <div className="pdp-guarantee-card">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <div>
                  <strong>Free Express Shipping</strong>
                  <p>On all orders over $200 worldwide</p>
                </div>
              </div>

              <div className="pdp-guarantee-card">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
                </svg>
                <div>
                  <strong>30-Day Arctic Trial</strong>
                  <p>Test in real cold weather. Free returns</p>
                </div>
              </div>

              <div className="pdp-guarantee-card">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <div>
                  <strong>Lifetime Seam Warranty</strong>
                  <p>All zippers and heat seals guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Accordion & Craftsmanship Deep Dive */}
      <section className="pdp-technical-section">
        <div className="pdp-container">
          <div className="pdp-tech-nav-tabs">
            <button
              className={`tech-tab-btn ${activeSpecTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveSpecTab('specs')}
            >
              Technical Specifications & Anatomy
            </button>
            <button
              className={`tech-tab-btn ${activeSpecTab === 'climate' ? 'active' : ''}`}
              onClick={() => setActiveSpecTab('climate')}
            >
              Climate & Temperature Rating
            </button>
            <button
              className={`tech-tab-btn ${activeSpecTab === 'care' ? 'active' : ''}`}
              onClick={() => setActiveSpecTab('care')}
            >
              Garment Care & Restoration
            </button>
          </div>

          <div className="pdp-tech-content-card">
            {activeSpecTab === 'specs' && (
              <div className="pdp-tech-tab-panel">
                <div className="pdp-tech-grid">
                  <div className="tech-spec-row">
                    <span className="spec-name">Primary Insulation</span>
                    <span className="spec-val">{product.specs[0]}</span>
                  </div>
                  <div className="tech-spec-row">
                    <span className="spec-name">Weatherproof Membrane</span>
                    <span className="spec-val">{product.specs[1]}</span>
                  </div>
                  <div className="tech-spec-row">
                    <span className="spec-name">Total Garment Weight</span>
                    <span className="spec-val">{product.weight}</span>
                  </div>
                  <div className="tech-spec-row">
                    <span className="spec-name">Face Fabric Composition</span>
                    <span className="spec-val">{product.fabricDetails}</span>
                  </div>
                  <div className="tech-spec-row">
                    <span className="spec-name">Zippers & Hardware</span>
                    <span className="spec-val">YKK Aquaguard Matte Waterproof Zippers</span>
                  </div>
                  <div className="tech-spec-row">
                    <span className="spec-name">Pocket Architecture</span>
                    <span className="spec-val">Dual polar fleece-lined storm pockets + internal media chest pocket</span>
                  </div>
                </div>

                <div className="pdp-highlights-box">
                  <h4>Field Engineering Highlights</h4>
                  <ul>
                    {product.highlights?.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeSpecTab === 'climate' && (
              <div className="pdp-tech-tab-panel">
                <div className="pdp-climate-gauge">
                  <div className="gauge-header">
                    <h3>Sub-Zero Thermal Retention Index</h3>
                    <span className="gauge-score">{product.temperatureRating}</span>
                  </div>
                  <div className="gauge-bar-track">
                    <div className="gauge-bar-fill" style={{ width: product.id === 0 ? '90%' : product.id === 1 ? '60%' : product.id === 2 ? '50%' : '98%' }} />
                  </div>
                  <div className="gauge-labels">
                    <span>-40°C Extreme Arctic</span>
                    <span>-20°C Sub-Zero</span>
                    <span>0°C Freezing</span>
                    <span>+15°C Mild</span>
                  </div>
                </div>

                <p className="gauge-explanation">
                  This garment was rigorously evaluated in wind tunnel chambers with simulated 50-knot gales and sub-zero moisture. It preserves core body warmth without trapping excessive perspiration during high-output activity.
                </p>
              </div>
            )}

            {activeSpecTab === 'care' && (
              <div className="pdp-tech-tab-panel">
                <div className="pdp-care-guide">
                  <div className="care-step">
                    <strong>1. Washing</strong>
                    <p>{product.care}</p>
                  </div>
                  <div className="care-step">
                    <strong>2. DWR Reactivation</strong>
                    <p>To refresh the water-beading outer shell, place the clean dry jacket in the dryer on warm for 20 minutes.</p>
                  </div>
                  <div className="care-step">
                    <strong>3. Off-Season Storage</strong>
                    <p>Store uncompressed in a cool, dry breathable garment bag. Avoid tight compression sacks during off-season months to prevent down clumping.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Complete The Outerwear System Carousel */}
      <section className="pdp-pair-section">
        <div className="pdp-container">
          <div className="section-header text-left">
            <div className="section-eyebrow">TAWAKAL MODULAR SYSTEM</div>
            <h2 className="section-title">Complete Your Outerwear Wardrobe</h2>
          </div>

          <div className="pdp-related-grid">
            {PRODUCTS.filter(p => p.id !== product.id).map(rel => {
              const relCrop = rel.crop;
              const relK = 180 / Math.max(relCrop.w, relCrop.h);
              const rw = relCrop.w * relK;
              const rh = relCrop.h * relK;

              return (
                <div key={rel.id} className="pdp-related-card">
                  <div
                    className="related-image-box"
                    onClick={() => onSelectProduct(rel.id)}
                    title={`View ${rel.title}`}
                  >
                    <div
                      className="related-packshot-img"
                      style={{
                        width: `${rw}px`,
                        height: `${rh}px`,
                        backgroundImage: `url(${sheetUrl})`,
                        backgroundSize: `${2048 * relK}px ${2048 * relK}px`,
                        backgroundPosition: `${-relCrop.x * relK}px ${-relCrop.y * relK}px`,
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                  </div>

                  <div className="related-card-info">
                    <span className="related-category">{rel.category}</span>
                    <h3 className="related-title" onClick={() => onSelectProduct(rel.id)}>{rel.title}</h3>
                    <div className="related-price">{rel.price}</div>

                    <div className="related-actions">
                      <button
                        className="btn-related-view"
                        onClick={() => onSelectProduct(rel.id)}
                      >
                        View Garment
                      </button>
                      <button
                        className="btn-related-tryon"
                        onClick={() => onTryOnInHero(rel.id)}
                        title="Try on model in hero"
                      >
                        Try On
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
