import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PRODUCTS, BASE_FILE, SHEET_FILE, buildImageUrl } from '../data/products';

// Synthetic realistic fabric rustle / swish via Web Audio API (zero dependencies)
function playFabricSwoosh() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => { });
    }
    const sampleRate = ctx.sampleRate;
    const duration = 0.22; // 220ms
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.35;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(520, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    setTimeout(() => {
      try { ctx.close(); } catch { }
    }, 350);
  } catch {
    // Silently continue if audio context is blocked
  }
}

export default function HeroTryOn({
  activeProduct,
  onSelectProduct,
  onAddToCart
}) {
  const [pillProduct, setPillProduct] = useState(activeProduct);
  const [railProducts, setRailProducts] = useState([
    (activeProduct + 1) % 4,
    (activeProduct + 2) % 4
  ]);
  const [loadingOverlayVisible, setLoadingOverlayVisible] = useState(true);
  const [isMobileView, setIsMobileView] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 820 : false));

  // Layout metrics
  const metricsRef = useRef({
    u: 1,
    ps: 0.703,
    ox: 0,
    oy: 0,
    s: 0.335,
    cy: 450,
    slot0Left: 1047,
    slot1Left: 1320,
    isMobile: false
  });

  // State refs
  const activeProductRef = useRef(activeProduct);
  const isSwappingRef = useRef(false);
  const queuedTargetRef = useRef(null);
  const isReducedMotionRef = useRef(false);
  const isInitialMountRef = useRef(true);

  // DOM refs
  const trackRef = useRef(null);
  const heroRef = useRef(null);
  const plateContainerRef = useRef(null);
  const plateRefs = useRef([]);
  const titleMaskRef = useRef(null);
  const titleSpanRef = useRef(null);
  const priceMaskRef = useRef(null);
  const priceSpanRef = useRef(null);
  const pillThumbRef = useRef(null);
  const pillMetaRef = useRef(null);
  const pillPriceRef = useRef(null);
  const railContainerRef = useRef(null);
  const paginationRef = useRef(null);
  const overlayRef = useRef(null);
  const winterCanvasRef = useRef(null);

  useEffect(() => {
    activeProductRef.current = activeProduct;
  }, [activeProduct]);

  // Image URLs based on screen width
  const plateWidth = isMobileView ? 1280 : 2048;
  const sheetWidth = isMobileView ? 1024 : 2048;

  const basePlateUrl = buildImageUrl(BASE_FILE, plateWidth);
  const packshotSheetUrl = buildImageUrl(SHEET_FILE, sheetWidth);
  const wearPlateUrls = PRODUCTS.map(p => buildImageUrl(p.wearFile, plateWidth));

  // Compute Layout Metrics
  const computeMetrics = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 820;

    setIsMobileView(prev => (prev !== isMobile ? isMobile : prev));

    let u, ps, ox, oy, s, cy, slot0Left, slot1Left, dashTop, dashLeft;

    if (!isMobile) {
      // Desktop: --u = min(100vw/1440, 100vh/900)
      u = Math.min(vw / 1440, vh / 900);
      ps = Math.max(vw / 2048, vh / 1360);
      ox = (vw - 2048 * ps) / 2;
      oy = (vh - 1360 * ps) / 2;
      const navHeight = Math.max(44 * u, 40);
      oy = Math.min(0, Math.max(oy, navHeight + 18 * u - 150 * ps));
      s = 0.335 * u;
      cy = vh / 2 - 13 * u;
      slot0Left = vw - 393 * u;
      slot1Left = vw - 120 * u;
      dashTop = vh / 2 + 190 * u;
      dashLeft = vw - 393 * u;
    } else {
      // Phone: --u = 100vw/390
      u = vw / 390;
      const shopNowEl = document.querySelector('.btn-shop-now');
      let shopNowBottom = 76 + 140;
      if (shopNowEl) {
        const rect = shopNowEl.getBoundingClientRect();
        shopNowBottom = rect.bottom;
      }
      const stageTop = shopNowBottom + 8;
      const stageBottom = vh - 82;
      const stageHeight = Math.max(10, stageBottom - stageTop);

      ps = Math.min(stageHeight / 1080, (0.64 * vw) / 600);
      ox = 0.39 * vw - 1012 * ps;
      oy = stageTop - 120 * ps;
      s = 0.29 * ps;
      cy = stageTop + 0.40 * stageHeight;
      slot0Left = vw - 102 * u;
      slot1Left = vw - 10 * u;
      dashTop = cy + 500 * s;
      dashLeft = vw - 102 * u;
    }

    metricsRef.current = {
      u, ps, ox, oy, s, cy, slot0Left, slot1Left, dashTop, dashLeft, isMobile
    };

    document.documentElement.style.setProperty('--u', `${u}px`);

    if (plateContainerRef.current) {
      plateContainerRef.current.style.transform = `translate(${ox}px, ${oy}px) scale(${ps})`;
    }

    if (paginationRef.current && isMobile) {
      paginationRef.current.style.top = `${dashTop}px`;
      paginationRef.current.style.left = `${dashLeft}px`;
    } else if (paginationRef.current && !isMobile) {
      paginationRef.current.style.top = '';
      paginationRef.current.style.left = '';
    }

    return metricsRef.current;
  }, []);

  const triggerSwapRef = useRef(null);

  // Core Garment Swap (Exact 1200ms timeline)
  const triggerSwap = useCallback((targetProduct) => {
    const currentA = activeProductRef.current;
    if (targetProduct === currentA && !isSwappingRef.current) return;

    if (isSwappingRef.current) {
      if (targetProduct === currentA) {
        queuedTargetRef.current = null;
      } else {
        queuedTargetRef.current = targetProduct;
      }
      return;
    }

    if (isReducedMotionRef.current) {
      onSelectProduct(targetProduct);
      setPillProduct(targetProduct);
      setRailProducts([(targetProduct + 1) % 4, (targetProduct + 2) % 4]);
      if (titleSpanRef.current) titleSpanRef.current.textContent = PRODUCTS[targetProduct].title;
      if (priceSpanRef.current) priceSpanRef.current.textContent = PRODUCTS[targetProduct].price;
      return;
    }

    isSwappingRef.current = true;
    const targetT = targetProduct;
    activeProductRef.current = targetT;
    const { u, ps, ox, oy, s, cy, slot0Left, slot1Left } = metricsRef.current;
    const targetCrop = PRODUCTS[targetT].crop;

    // 0. Physical fabric swish sound via Web Audio API
    playFabricSwoosh();

    // Clean up any stale flyers or sheens and cancel any active plate animations
    if (heroRef.current) {
      heroRef.current.querySelectorAll('.flyer-packshot, .cloth-sheen-sweep').forEach(el => el.remove());
    }
    plateRefs.current.forEach(plate => {
      if (plate) {
        plate.getAnimations().forEach(a => a.cancel());
      }
    });

    // 1. Synchronized wear plate cross-fade:
    // Model base plate remains completely rock-solid and stable.
    // At t = 500ms when the flyer is aligned on the torso, T fades in and A fades out in 220ms.
    plateRefs.current.forEach((plate, idx) => {
      if (!plate) return;
      if (idx === currentA) {
        plate.style.zIndex = '1';
        plate.style.opacity = '1';
      } else if (idx === targetT) {
        plate.style.zIndex = '2';
        plate.style.opacity = '0';
      } else {
        plate.style.zIndex = '0';
        plate.style.opacity = '0';
      }
    });

    const plateA = plateRefs.current[currentA];
    const plateT = plateRefs.current[targetT];

    let plateFade = null;
    let plateAFade = null;

    if (plateT) {
      plateFade = plateT.animate([
        { opacity: 0 },
        { opacity: 1 }
      ], {
        delay: 500,
        duration: 220,
        easing: 'cubic-bezier(.25, 1, .5, 1)',
        fill: 'both'
      });

      if (plateA) {
        plateAFade = plateA.animate([
          { opacity: 1 },
          { opacity: 0 }
        ], {
          delay: 500,
          duration: 220,
          easing: 'cubic-bezier(.25, 1, .5, 1)',
          fill: 'both'
        });
      }

      plateFade.onfinish = () => {
        plateT.style.opacity = '1';
        plateT.style.zIndex = '1';
        if (plateA) {
          plateA.style.opacity = '0';
          plateA.style.zIndex = '0';
        }
        plateFade.cancel();
        if (plateAFade) plateAFade.cancel();
        onSelectProduct(targetT);
      };
    }

    // 2. Title & Price Roll behind mask
    if (titleSpanRef.current && titleMaskRef.current) {
      const oldTitle = titleSpanRef.current;
      oldTitle.style.position = 'absolute';
      oldTitle.style.top = '0';
      oldTitle.style.left = '0';
      oldTitle.style.width = '100%';

      const animTitleOut = oldTitle.animate([
        { transform: 'translateY(0%)' },
        { transform: 'translateY(-105%)' }
      ], {
        delay: 100,
        duration: 250,
        easing: 'cubic-bezier(.55, 0, .8, .3)',
        fill: 'forwards'
      });
      animTitleOut.onfinish = () => {
        if (oldTitle.parentNode) oldTitle.remove();
      };

      const newTitle = document.createElement('span');
      newTitle.className = 'copy-title-span';
      newTitle.textContent = PRODUCTS[targetT].title;
      newTitle.style.display = 'block';
      newTitle.style.transform = 'translateY(105%)';
      titleMaskRef.current.appendChild(newTitle);
      titleSpanRef.current = newTitle;

      newTitle.animate([
        { transform: 'translateY(105%)' },
        { transform: 'translateY(0%)' }
      ], {
        delay: 350,
        duration: 450,
        easing: 'cubic-bezier(.22, .61, .36, 1)',
        fill: 'forwards'
      });
    }

    if (priceSpanRef.current && priceMaskRef.current) {
      const oldPrice = priceSpanRef.current;
      oldPrice.style.position = 'absolute';
      oldPrice.style.top = '0';
      oldPrice.style.left = '0';
      oldPrice.style.width = '100%';

      const animPriceOut = oldPrice.animate([
        { transform: 'translateY(0%)' },
        { transform: 'translateY(-105%)' }
      ], {
        delay: 100,
        duration: 250,
        easing: 'cubic-bezier(.55, 0, .8, .3)',
        fill: 'forwards'
      });
      animPriceOut.onfinish = () => {
        if (oldPrice.parentNode) oldPrice.remove();
      };

      const newPrice = document.createElement('span');
      newPrice.className = 'copy-price-span';
      newPrice.textContent = PRODUCTS[targetT].price;
      newPrice.style.display = 'block';
      newPrice.style.transform = 'translateY(105%)';
      priceMaskRef.current.appendChild(newPrice);
      priceSpanRef.current = newPrice;

      newPrice.animate([
        { transform: 'translateY(105%)' },
        { transform: 'translateY(0%)' }
      ], {
        delay: 350,
        duration: 450,
        easing: 'cubic-bezier(.22, .61, .36, 1)',
        fill: 'forwards'
      });
    }

    // 3. Rail packshots handling
    const isInSlot0 = (targetT === (currentA + 1) % 4);
    const isInSlot1 = (targetT === (currentA + 2) % 4);

    const railPackshots = railContainerRef.current
      ? Array.from(railContainerRef.current.querySelectorAll('.rail-packshot'))
      : [];
    railPackshots.forEach((psEl, idx) => {
      const isThisFlyer = (idx === 0 && isInSlot0) || (idx === 1 && isInSlot1);
      if (isThisFlyer) {
        setTimeout(() => {
          psEl.style.opacity = '0';
        }, 60);
      } else {
        psEl.animate([
          { opacity: 1 },
          { opacity: 0 }
        ], {
          delay: 100,
          duration: 200,
          easing: 'linear',
          fill: 'forwards'
        });
      }
    });

    // 4. Flyer Packshot Glide with Aerodynamic 3D Arc and Torso Landing (60-860 ms)
    const flyer = document.createElement('div');
    flyer.className = 'flyer-packshot';

    const startSlotLeft = isInSlot1 ? slot1Left : slot0Left;
    const startSlotTop = cy - (targetCrop.h * s) / 2;
    const startW = targetCrop.w * s;
    const startH = targetCrop.h * s;

    flyer.style.left = `${startSlotLeft}px`;
    flyer.style.top = `${startSlotTop}px`;
    flyer.style.width = `${startW}px`;
    flyer.style.height = `${startH}px`;
    flyer.style.backgroundImage = `url(${packshotSheetUrl})`;
    flyer.style.backgroundSize = `${2048 * s}px ${2048 * s}px`;
    flyer.style.backgroundPosition = `${-targetCrop.x * s}px ${-targetCrop.y * s}px`;
    flyer.style.backgroundRepeat = 'no-repeat';

    if (heroRef.current) {
      heroRef.current.appendChild(flyer);
    }

    // EXACT chest center from prompt: (1012, 640)
    const endCx = ox + 1012 * ps;
    const endCy = oy + 640 * ps;
    const startCx = startSlotLeft + startW / 2;
    const startCy = startSlotTop + startH / 2;
    const dx = endCx - startCx;
    const dy = endCy - startCy;
    const k = (600 * ps) / startW; // EXACT physical garment scale on model body!

    // Aerodynamic flight trajectory: lifts upward into flight (-26*u px), banks slightly (-5.5deg), then lands squarely on shoulders
    flyer.animate([
      {
        transform: 'translate(0px, 0px) scale(1) rotate(0deg)',
        filter: 'drop-shadow(0 6px 14px rgba(24, 34, 45, 0.16))'
      },
      {
        offset: 0.32,
        transform: `translate(${dx * 0.36}px, ${dy * 0.26 - 26 * u}px) scale(${1 + (k - 1) * 0.3}) rotate(-5.5deg)`,
        filter: 'drop-shadow(0 26px 36px rgba(24, 34, 45, 0.30))'
      },
      {
        offset: 0.72,
        transform: `translate(${dx * 0.86}px, ${dy * 0.93}px) scale(${k * 1.03}) rotate(-1.5deg)`,
        filter: 'drop-shadow(0 14px 20px rgba(24, 34, 45, 0.20))'
      },
      {
        offset: 1.0,
        transform: `translate(${dx}px, ${dy}px) scale(${k}) rotate(0deg)`,
        filter: 'drop-shadow(0 4px 8px rgba(24, 34, 45, 0.10))'
      }
    ], {
      delay: 60,
      duration: 860,
      easing: 'cubic-bezier(.22, .9, .3, 1)',
      fill: 'forwards'
    });

    const isFromRail = isInSlot0 || isInSlot1;
    const opacityKeyframes = isFromRail
      ? [
        { opacity: 1, offset: 0 },
        { opacity: 1, offset: 0.58 },
        { opacity: 0.7, offset: 0.76 },
        { opacity: 0, offset: 1.0 }
      ]
      : [
        { opacity: 0, offset: 0 },
        { opacity: 1, offset: 0.16 },
        { opacity: 1, offset: 0.58 },
        { opacity: 0.7, offset: 0.76 },
        { opacity: 0, offset: 1.0 }
      ];

    const flyerOpacityAnim = flyer.animate(opacityKeyframes, {
      delay: 60,
      duration: 900,
      easing: 'ease-in-out',
      fill: 'forwards'
    });

    flyerOpacityAnim.onfinish = () => {
      flyer.remove();
    };

    // 5. At t = 560 ms: Rebuild rail and cross-fade pill
    setTimeout(() => {
      setRailProducts([(targetT + 1) % 4, (targetT + 2) % 4]);

      const pillEls = [pillThumbRef.current, pillMetaRef.current, pillPriceRef.current].filter(Boolean);
      pillEls.forEach(el => {
        el.animate([
          { opacity: 1 },
          { opacity: 0 }
        ], {
          duration: 140,
          easing: 'linear',
          fill: 'forwards'
        }).onfinish = () => {
          setPillProduct(targetT);
          el.animate([
            { opacity: 0 },
            { opacity: 1 }
          ], {
            duration: 140,
            easing: 'linear',
            fill: 'forwards'
          });
        };
      });
    }, 560);

    // 6. At t = 900 ms: Swap complete
    setTimeout(() => {
      isSwappingRef.current = false;
      if (queuedTargetRef.current !== null) {
        const next = queuedTargetRef.current;
        queuedTargetRef.current = null;
        triggerSwap(next);
      }
    }, 900);
  }, [packshotSheetUrl, onSelectProduct]);

  triggerSwapRef.current = triggerSwap;

  // External product changes
  useEffect(() => {
    if (activeProduct !== activeProductRef.current && !isSwappingRef.current) {
      triggerSwap(activeProduct);
    }
  }, [activeProduct, triggerSwap]);

  // Initial layout & Resize
  useEffect(() => {
    isReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    computeMetrics();
    const handleResize = () => computeMetrics();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [computeMetrics]);

  // Loading Reveal
  useEffect(() => {
    if (isReducedMotionRef.current) {
      setLoadingOverlayVisible(false);
      return;
    }

    const isMobile = window.innerWidth < 820;
    const cols = isMobile ? 5 : 10;
    const rows = isMobile ? 9 : 6;
    const totalTiles = cols * rows;

    const overlay = overlayRef.current;
    if (!overlay) return;

    overlay.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    overlay.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    overlay.innerHTML = '';
    const tileEls = [];
    for (let i = 0; i < totalTiles; i++) {
      const tile = document.createElement('div');
      tile.className = 'loading-tile';
      overlay.appendChild(tile);
      tileEls.push(tile);
    }

    const indices = tileEls.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const startReveal = () => {
      let startTime = null;
      function revealFrame(now) {
        if (!startTime) startTime = now;
        const elapsed = now - startTime;
        const count = indices.length;
        const hideUpTo = Math.min(count, Math.floor((elapsed / 600) * count));
        for (let k = 0; k < hideUpTo; k++) {
          if (tileEls[indices[k]]) {
            tileEls[indices[k]].style.visibility = 'hidden';
          }
        }
        if (elapsed < 600) {
          requestAnimationFrame(revealFrame);
        } else {
          setLoadingOverlayVisible(false);
        }
      }
      requestAnimationFrame(revealFrame);
    };

    const baseImg = new Image();
    baseImg.src = basePlateUrl;
    const wear0Img = new Image();
    wear0Img.src = wearPlateUrls[0];

    const decodePromise = Promise.all([
      baseImg.decode ? baseImg.decode().catch(() => { }) : Promise.resolve(),
      wear0Img.decode ? wear0Img.decode().catch(() => { }) : Promise.resolve()
    ]);

    const failsafePromise = new Promise(resolve => setTimeout(resolve, 1800));

    Promise.race([decodePromise, failsafePromise]).then(() => {
      startReveal();
    });

    const safetyTimer = setTimeout(() => {
      setLoadingOverlayVisible(false);
    }, 2800);

    return () => clearTimeout(safetyTimer);
  }, [basePlateUrl, wearPlateUrls]);

  // Rail packshot enter animation
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    if (isReducedMotionRef.current || !railContainerRef.current) return;

    const { u } = metricsRef.current;
    const packshots = railContainerRef.current.querySelectorAll('.rail-packshot');
    packshots.forEach(ps => {
      ps.animate([
        { transform: `translateX(${45 * u}px)`, opacity: 0 },
        { transform: 'translateX(0px)', opacity: 1 }
      ], {
        duration: 350,
        easing: 'cubic-bezier(.22, .61, .36, 1)',
        fill: 'forwards'
      });
    });
  }, [railProducts]);

  // Cinematic Winter Atmosphere: Frost particles, micro-snow crystals & ambient drift
  useEffect(() => {
    if (isReducedMotionRef.current) return;
    const canvas = winterCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = null;
    let isVisible = true;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // 55 realistic winter snow & ice frost crystals
    const particleCount = 55;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * (width || window.innerWidth),
        y: Math.random() * (height || window.innerHeight),
        radius: Math.random() * 2.2 + 0.6,
        alpha: Math.random() * 0.5 + 0.2,
        drift: Math.random() * 0.6 - 0.3,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.7 + 0.35
      });
    }

    // Pause when hero is scrolled out of view to preserve 0% CPU
    let observer = null;
    if (typeof IntersectionObserver !== 'undefined' && canvas.parentElement) {
      observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
      }, { threshold: 0.05 });
      observer.observe(canvas.parentElement);
    }

    const render = () => {
      if (isVisible && width > 0 && height > 0) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.angle += 0.012;
          p.y += p.speed;
          p.x += Math.sin(p.angle) * 0.35 + p.drift;

          if (p.y > height) {
            p.y = -5;
            p.x = Math.random() * width;
          }
          if (p.x > width + 10) p.x = -10;
          if (p.x < -10) p.x = width + 10;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.fill();
        }
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
    };
  }, []);

  // SCROLL-DRIVEN JACKET ANIMATION (Scrollytelling within pinned hero track)
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          ticking = false;
          const trackEl = trackRef.current;
          if (!trackEl) return;

          const trackTop = trackEl.offsetTop;
          const scrollY = window.scrollY;
          const relScroll = scrollY - trackTop;

          const isMobile = window.innerWidth < 820;
          const stepDist = isMobile ? 220 : 300;

          // Hysteresis calculation for stable transitions between jackets
          let target = activeProductRef.current;
          if (relScroll < 0) {
            target = 0;
          } else if (relScroll <= stepDist * 3.5) {
            const norm = relScroll / stepDist;
            const curr = activeProductRef.current;

            if (curr === 0) {
              if (norm >= 0.7) target = 1;
            } else if (curr === 1) {
              if (norm < 0.5) target = 0;
              else if (norm >= 1.7) target = 2;
            } else if (curr === 2) {
              if (norm < 1.5) target = 1;
              else if (norm >= 2.7) target = 3;
            } else if (curr === 3) {
              if (norm < 2.5) target = 2;
            }
          } else {
            target = 3;
          }

          if (target !== activeProductRef.current && !isSwappingRef.current) {
            triggerSwap(target);
          }
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [triggerSwap]);

  // WHEEL SCROLL LISTENER: Each scroll step brings up the next product (0 -> 1 -> 2 -> 3),
  // and the final scroll at product 3 immediately scrolls to the next section (#collection)!
  const wheelLockRef = useRef(false);

  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;

    const handleWheel = (e) => {
      const trackEl = trackRef.current;
      if (!trackEl) return;

      const rect = trackEl.getBoundingClientRect();
      // Only capture wheel when hero track is actively in view at the top of the viewport
      if (rect.top > 80 || rect.bottom < window.innerHeight * 0.4) {
        return;
      }

      // Ignore micro-deltas from trackpad drift
      if (Math.abs(e.deltaY) < 16) return;

      if (wheelLockRef.current || isSwappingRef.current) {
        e.preventDefault();
        return;
      }

      if (e.deltaY > 0) {
        // Scrolling DOWN
        const curr = activeProductRef.current;
        if (curr < 3) {
          e.preventDefault();
          wheelLockRef.current = true;
          handleStepTo(curr + 1);
          setTimeout(() => {
            wheelLockRef.current = false;
          }, 650);
        } else {
          // All products (0, 1, 2, 3) have been viewed! Scrolling down moves straight to next section!
          e.preventDefault();
          wheelLockRef.current = true;
          scrollToCollection();
          setTimeout(() => {
            wheelLockRef.current = false;
          }, 800);
        }
      } else if (e.deltaY < 0) {
        // Scrolling UP
        const curr = activeProductRef.current;
        if (curr > 0) {
          e.preventDefault();
          wheelLockRef.current = true;
          handleStepTo(curr - 1);
          setTimeout(() => {
            wheelLockRef.current = false;
          }, 650);
        }
        // If curr === 0 and deltaY < 0, let normal scroll to top occur
      }
    };

    heroEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      heroEl.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Keyboard navigation & Touch swipes
  useEffect(() => {
    const handleKeyDown = (e) => {
      const heroEl = heroRef.current;
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        if (rect.bottom < window.innerHeight * 0.5) return;
      }

      if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) {
        if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        const curr = activeProductRef.current;
        if (curr < 3) {
          e.preventDefault();
          handleStepTo(curr + 1);
        } else {
          e.preventDefault();
          scrollToCollection();
        }
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
        if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        const curr = activeProductRef.current;
        if (curr > 0) {
          e.preventDefault();
          handleStepTo(curr - 1);
        }
      }
    };

    let startX = 0;
    let startY = 0;

    const handlePointerDown = (e) => {
      startX = e.clientX;
      startY = e.clientY;
    };

    const handlePointerUp = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (Math.hypot(dx, dy) > 40) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          // Horizontal swipe
          if (dx < -40) {
            // Swipe left (next)
            const curr = activeProductRef.current;
            if (curr < 3) {
              handleStepTo(curr + 1);
            } else {
              scrollToCollection();
            }
          } else if (dx > 40) {
            // Swipe right (prev)
            const curr = activeProductRef.current;
            if (curr > 0) {
              handleStepTo(curr - 1);
            }
          }
        } else {
          // Vertical swipe
          if (dy < -40) {
            // Swipe up (scroll down to next product or collection)
            const curr = activeProductRef.current;
            if (curr < 3) {
              handleStepTo(curr + 1);
            } else {
              scrollToCollection();
            }
          } else if (dy > 40) {
            // Swipe down (scroll up to prev product)
            const curr = activeProductRef.current;
            if (curr > 0) {
              handleStepTo(curr - 1);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const heroEl = heroRef.current;
    if (heroEl) {
      heroEl.addEventListener('pointerdown', handlePointerDown);
      heroEl.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (heroEl) {
        heroEl.removeEventListener('pointerdown', handlePointerDown);
        heroEl.removeEventListener('pointerup', handlePointerUp);
      }
    };
  }, []);

  const handleStepTo = (targetIdx) => {
    const trackEl = trackRef.current;
    const baseTop = trackEl ? trackEl.offsetTop : 0;
    const isMobile = window.innerWidth < 820;
    const stepDist = isMobile ? 220 : 300;
    window.scrollTo({
      top: baseTop + targetIdx * stepDist,
      behavior: 'smooth'
    });
    if (triggerSwapRef.current) {
      triggerSwapRef.current(targetIdx);
    }
  };

  const scrollToCollection = () => {
    const el = document.getElementById('collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Thumbnail sizing for pill
  const pillCrop = PRODUCTS[pillProduct].crop;
  const { u, isMobile, s, cy, slot0Left, slot1Left } = metricsRef.current;
  const thumbBox = isMobile ? 40 : 42 * u;
  const maxCropDim = Math.max(pillCrop.w, pillCrop.h);
  const kThumb = (0.92 * thumbBox) / maxCropDim;
  const thumbW = pillCrop.w * kThumb;
  const thumbH = pillCrop.h * kThumb;

  return (
    <div className="hero-scroll-track" ref={trackRef}>
      <section className="vestra-hero-section" id="hero" ref={heroRef}>
        {/* Loading Overlay Tiles */}
        {loadingOverlayVisible && (
          <div className="loading-overlay" ref={overlayRef}></div>
        )}

        {/* Plates Container */}
        <div className="plate-container" ref={plateContainerRef}>
          <img
            src={basePlateUrl}
            alt="TAWAKAL outerwear studio base"
            className="plate-img plate-base"
          />
          {PRODUCTS.map((prod, idx) => (
            <img
              key={prod.id}
              ref={el => (plateRefs.current[idx] = el)}
              src={wearPlateUrls[idx]}
              alt={prod.title}
              className={`plate-img plate-wear ${idx === activeProduct ? 'on' : ''}`}
            />
          ))}
        </div>

        {/* Ambient Winter Snow & Glacial Corner Mist */}
        <canvas ref={winterCanvasRef} className="hero-winter-canvas" aria-hidden="true" />
        <div className="winter-corner-mist mist-left" aria-hidden="true" />
        <div className="winter-corner-mist mist-right" aria-hidden="true" />

        {/* Left Copy Column */}
        <div className="copy-column">
          <div className="copy-eyebrow">NEW SEASON · TAWAKAL WINTER 2026</div>

          <h1 className="copy-title-heading">
            <span className="copy-title-mask" ref={titleMaskRef}>
              <span className="copy-title-span" ref={titleSpanRef}>
                {PRODUCTS[activeProduct].title}
              </span>
            </span>
          </h1>

          <div className="copy-price-wrapper">
            <span className="copy-price-mask" ref={priceMaskRef}>
              <span className="copy-price-span" ref={priceSpanRef}>
                {PRODUCTS[activeProduct].price}
              </span>
            </span>
          </div>

          <button
            className="btn-shop-now"
            onClick={scrollToCollection}
          >
            <span>Shop Collection</span>
            <svg viewBox="0 0 16 16">
              <path d="M2 8 h11" />
              <path d="M9 4 l4 4-4 4" />
            </svg>
          </button>
        </div>

        {/* Product Rail */}
        <div className="product-rail" ref={railContainerRef}>
          {railProducts.map((pIdx, slotIndex) => {
            const prod = PRODUCTS[pIdx];
            const slotLeft = slotIndex === 0 ? slot0Left : slot1Left;
            const slotTop = cy - (prod.crop.h * s) / 2;
            const w = prod.crop.w * s;
            const h = prod.crop.h * s;

            return (
              <div
                key={`${pIdx}-${slotIndex}`}
                className="rail-packshot"
                style={{
                  left: `${slotLeft}px`,
                  top: `${slotTop}px`,
                  width: `${w}px`,
                  height: `${h}px`,
                  backgroundImage: `url(${packshotSheetUrl})`,
                  backgroundSize: `${2048 * s}px ${2048 * s}px`,
                  backgroundPosition: `${-prod.crop.x * s}px ${-prod.crop.y * s}px`,
                  backgroundRepeat: 'no-repeat'
                }}
                onClick={() => handleStepTo(pIdx)}
                title={`Try on ${prod.title}`}
              />
            );
          })}
        </div>

        {/* Pagination Dashes */}
        <div className="pagination-dashes" ref={paginationRef}>
          {PRODUCTS.map((p, idx) => (
            <div
              key={p.id}
              className={`pagination-dash ${idx === activeProduct ? 'active' : ''}`}
              onClick={() => handleStepTo(idx)}
              title={`${idx + 1} / 4: ${p.title}`}
            />
          ))}
        </div>

        {/* Right-Edge Indicator */}
        <div className="right-indicator">
          <div className="right-indicator-bar" />
        </div>

        {/* Cart Pill */}
        <div className="cart-pill">
          <div className="pill-thumb-box" ref={pillThumbRef}>
            <div
              className="pill-thumb-img"
              style={{
                width: `${thumbW}px`,
                height: `${thumbH}px`,
                backgroundImage: `url(${packshotSheetUrl})`,
                backgroundSize: `${2048 * kThumb}px ${2048 * kThumb}px`,
                backgroundPosition: `${-pillCrop.x * kThumb}px ${-pillCrop.y * kThumb}px`
              }}
            />
          </div>

          <div className="pill-meta" ref={pillMetaRef}>
            <div className="pill-name">{PRODUCTS[pillProduct].pillName}</div>
            <div className="pill-sub">{PRODUCTS[pillProduct].pillSub}</div>
          </div>

          <div className="pill-price" ref={pillPriceRef}>
            {PRODUCTS[pillProduct].price}
          </div>

          <button
            className="pill-btn"
            onClick={() => onAddToCart(PRODUCTS[pillProduct])}
            aria-label={`Add ${PRODUCTS[pillProduct].pillName} to cart`}
          >
            <svg viewBox="0 0 16 16">
              <path d="M3.5 5.5 h9 l-.7 8 h-7.6 z" />
              <path d="M6 7 V4.6 a2 2 0 0 1 4 0 V7" />
            </svg>
            <span>Add to cart</span>
          </button>
        </div>

        {/* Drag to explore / Scroll prompt */}
        <div
          className="drag-explore"
          onClick={() => {
            if (activeProduct < 3) {
              handleStepTo(activeProduct + 1);
            } else {
              scrollToCollection();
            }
          }}
          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
        >
          <span>
            {activeProduct < 3
              ? `Scroll to try ${PRODUCTS[(activeProduct + 1) % 4].title}`
              : "Scroll to explore full collection"}
          </span>
          <svg viewBox="0 0 16 16">
            <path d="M8 2 v11" />
            <path d="M4 9 l4 4 4-4" />
          </svg>
        </div>

        {/* Smooth Scroll Down Indicator */}
        <button
          className="hero-scroll-indicator"
          onClick={() => {
            if (activeProduct < 3) {
              handleStepTo(activeProduct + 1);
            } else {
              scrollToCollection();
            }
          }}
          aria-label={activeProduct < 3 ? `Switch to jacket 0${activeProduct + 2}` : "Scroll to collection"}
        >
          <span className="scroll-mouse">
            <span className="scroll-wheel" />
          </span>
          <span className="scroll-text">
            {activeProduct < 3 ? `SCROLL TO TRY JACKET 0${activeProduct + 2}` : "SCROLL TO EXPLORE COLLECTION"}
          </span>
        </button>
      </section>
    </div>
  );
}
