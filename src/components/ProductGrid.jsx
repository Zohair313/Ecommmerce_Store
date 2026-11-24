import React, { useState } from 'react';
import { PRODUCTS, SHEET_FILE, buildImageUrl } from '../data/products';

export default function ProductGrid({
  onTryOn,
  onAddToCart,
  onQuickView,
  onOpenPdp
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Down Puffers", "Technical Shells", "Thermal Fleece", "Storm Parkas"];

  const filteredProducts = selectedCategory === "All"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === selectedCategory);

  const sheetUrl = buildImageUrl(SHEET_FILE, 1024);

  return (
    <section className="section-collection" id="collection">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-eyebrow">CURATED OUTERWEAR</div>
          <h2 className="section-title">Tested in Arctic Conditions. Tailored for Life.</h2>
          <p className="section-subtitle">
            Every garment in the TAWAKAL collection is engineered with cold-weather barrier membranes, 800-fill down, and heat-taped seams.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="filter-pill-row">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="product-grid">
          {filteredProducts.map(prod => {
            // Render packshot crop inside fixed container
            const crop = prod.crop;
            const containerW = 280;
            const containerH = 320;
            const k = Math.min((containerW * 0.85) / crop.w, (containerH * 0.85) / crop.h);
            const w = crop.w * k;
            const h = crop.h * k;

            return (
              <div key={prod.id} className="product-card">
                {/* Badge */}
                <div className="product-badge-wrap">
                  <span className="product-badge">{prod.badge}</span>
                  <span className="product-rating">★ {prod.rating} ({prod.reviewsCount})</span>
                </div>

                {/* Packshot Image Container */}
                <div
                  className="product-image-stage"
                  onClick={() => onOpenPdp ? onOpenPdp(prod.id) : onQuickView(prod)}
                  title={`View details for ${prod.title}`}
                >
                  <div
                    className="product-crop-img"
                    style={{
                      width: `${w}px`,
                      height: `${h}px`,
                      backgroundImage: `url(${sheetUrl})`,
                      backgroundSize: `${2048 * k}px ${2048 * k}px`,
                      backgroundPosition: `${-crop.x * k}px ${-crop.y * k}px`,
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                  <div className="product-hover-overlay">
                    <span onClick={(e) => { e.stopPropagation(); onOpenPdp ? onOpenPdp(prod.id) : onQuickView(prod); }}>View Details</span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="product-card-body">
                  <div className="product-card-header">
                    <h3
                      className="product-card-title clickable-title"
                      onClick={() => onOpenPdp && onOpenPdp(prod.id)}
                      title={`Open ${prod.title} product page`}
                      style={{ cursor: 'pointer' }}
                    >
                      {prod.title}
                    </h3>
                    <span className="product-card-price">{prod.price}</span>
                  </div>
                  <p className="product-card-color">{prod.pillSub} · {prod.category}</p>
                  <p className="product-card-desc">{prod.description}</p>

                  {/* Specs Tags */}
                  <div className="product-specs-tags">
                    {prod.specs.slice(0, 2).map((s, i) => (
                      <span key={i} className="spec-tag">{s}</span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="product-card-actions">
                    <button
                      className="btn-try-on"
                      onClick={() => onTryOn(prod.id)}
                      title="Activate this jacket on the virtual try-on model"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <circle cx="12" cy="7" r="4" />
                        <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
                      </svg>
                      <span>Try On Model</span>
                    </button>

                    <button
                      className="btn-view-details"
                      onClick={() => onOpenPdp ? onOpenPdp(prod.id) : onQuickView(prod)}
                      title={`View full details of ${prod.title}`}
                    >
                      <span>Details</span>
                    </button>

                    <button
                      className="btn-quick-add"
                      onClick={() => onAddToCart(prod)}
                      aria-label={`Add ${prod.title} to cart`}
                    >
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
