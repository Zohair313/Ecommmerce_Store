import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroTryOn from './components/HeroTryOn';
import ProductGrid from './components/ProductGrid';
import TechSpecs from './components/TechSpecs';
import FitCalculator from './components/FitCalculator';
import Reviews from './components/Reviews';
import FAQ from './components/FAQ';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import ProductModal from './components/ProductModal';
import ProductDetailPage from './components/ProductDetailPage';

// Error Boundary following safe-anything guidelines
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("TAWAKAL Application Error Boundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback-view">
          <h2>An unexpected error occurred</h2>
          <p>{this.state.error?.message || "Please refresh the page to continue."}</p>
          <button className="btn-primary mt-4" onClick={() => window.location.reload()}>
            Reload Storefront
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activeHeroProduct, setActiveHeroProduct] = useState(0);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'pdp'
  const [pdpProductId, setPdpProductId] = useState(0);

  // Cart State (stored in memory and localStorage with defensive schema check)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('tawakal_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && item.product && typeof item.product.id === 'number' && typeof item.quantity === 'number');
      }
      return [];
    } catch {
      return [];
    }
  });

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // User Auth State with defensive parsing
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tawakal_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.email) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Sync Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tawakal_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Unable to persist cart to localStorage', e);
    }
  }, [cartItems]);

  // Sync User to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('tawakal_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('tawakal_user');
      }
    } catch (e) {
      console.warn('Unable to persist user to localStorage', e);
    }
  }, [user]);

  // Show temporary toast notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3200);
  };

  // Add to cart handler
  const handleAddToCart = (product, size = 'M') => {
    const chosenSize = product.selectedSize || size;
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id && item.size === chosenSize);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: Math.min(10, next[existingIdx].quantity + 1)
        };
        return next;
      } else {
        return [...prev, { product, size: chosenSize, quantity: 1 }];
      }
    });

    showToast(`Added ${product.title} (${chosenSize}) to shopping bag`);
    setCartDrawerOpen(true);
  };

  // Update Cart Quantity
  const handleUpdateQty = (productId, size, qty) => {
    if (qty <= 0) {
      handleRemoveItem(productId, size);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity: Math.min(10, Math.max(1, qty)) }
          : item
      )
    );
  };

  // Remove Item from Cart
  const handleRemoveItem = (productId, size) => {
    setCartItems(prev => prev.filter(item => !(item.product.id === productId && item.size === size)));
  };

  const handleOpenPdp = (productId) => {
    setPdpProductId(productId);
    setCurrentView('pdp');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCollection = () => {
    setCurrentView('home');
    setTimeout(() => {
      const el = document.getElementById('collection');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  };

  const handleNavigateSection = (sectionId) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 80);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Try on jacket: activates jacket in Hero and smoothly scrolls up to hero
  const handleTryOnInHero = (productId) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        executeTryOn(productId);
      }, 80);
    } else {
      executeTryOn(productId);
    }
  };

  const executeTryOn = (productId) => {
    setActiveHeroProduct(productId);
    const isMobile = window.innerWidth < 820;
    const stepDist = isMobile ? 220 : 300;
    const heroTrack = document.querySelector('.hero-scroll-track');
    const baseTop = heroTrack ? heroTrack.offsetTop : 0;
    window.scrollTo({
      top: baseTop + productId * stepDist,
      behavior: 'smooth'
    });
    showToast(`Active on virtual model: ${productId === 0 ? 'Alpine Puffer' : productId === 1 ? 'Ridge Fleece' : productId === 2 ? 'Drift Shell' : 'Harbor Parka'}`);
  };

  // Checkout Handler
  const handleCheckout = () => {
    showToast("Checkout initiated: Routing to secure payment gateway (Demo)");
  };

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <ErrorBoundary>
      <div className="tawakal-app">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="app-toast-banner" role="status" aria-live="polite">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Global Navigation Bar */}
        <Navbar
          cartCount={totalCartCount}
          onOpenCart={() => setCartDrawerOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
          user={user}
          onNavigateHome={handleBackToHome}
          onNavigateSection={handleNavigateSection}
        />

        {currentView === 'home' ? (
          <>
            {/* Hero Section: Virtual Try-On Outerwear Studio */}
            <HeroTryOn
              activeProduct={activeHeroProduct}
              onSelectProduct={setActiveHeroProduct}
              onAddToCart={handleAddToCart}
            />

            {/* Section 2: Curated Outerwear Collection */}
            <ProductGrid
              onTryOn={handleTryOnInHero}
              onAddToCart={handleAddToCart}
              onQuickView={setQuickViewProduct}
              onOpenPdp={handleOpenPdp}
            />

            {/* Section 3: Technical Anatomy / Craftsmanship */}
            <TechSpecs />

            {/* Section 4: Interactive Size & Fit Lab */}
            <FitCalculator />

            {/* Section 5: Verified Field Reviews */}
            <Reviews />

            {/* Section 6: Frequently Asked Questions */}
            <FAQ />

            {/* Section 7: Field Dispatch Newsletter */}
            <Newsletter />
          </>
        ) : (
          /* Dedicated Product Detail Page (PDP) */
          <ProductDetailPage
            productId={pdpProductId}
            onSelectProduct={setPdpProductId}
            onAddToCart={handleAddToCart}
            onTryOnInHero={handleTryOnInHero}
            onBackToHome={handleBackToHome}
            onBackToCollection={handleBackToCollection}
          />
        )}

        {/* Section 8: Global Footer */}
        <Footer />

        {/* Slide-over Cart Drawer */}
        <CartDrawer
          isOpen={cartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
          items={cartItems}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
        />

        {/* Member Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          user={user}
          onLogin={setUser}
          onLogout={() => {
            setUser(null);
            showToast("Successfully signed out");
          }}
        />

        {/* Quick View Product Modal */}
        <ProductModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
          onTryOn={handleTryOnInHero}
          onOpenPdp={handleOpenPdp}
        />
      </div>
    </ErrorBoundary>
  );
}
