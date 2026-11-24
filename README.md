# TAWAKAL — Technical Menswear & Virtual Try-On Outerwear

A high-performance luxury e-commerce platform and scrollytelling virtual try-on experience for **TAWAKAL**, a technical menswear outerwear brand engineered for sub-zero climates (-30°C).

![TAWAKAL Storefront](https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261115_071402_80cf9c12-dd74-45cf-a639-1f8580543ff3.png&w=1280&q=85)

---

## Key Features

1. **Scrollytelling Virtual Try-On Outerwear Hero**
   - Pure Web Animations API (WAAPI) zero-dependency physics.
   - Pinned scrollytelling track with hysteresis threshold logic.
   - Ghost-mannequin packshot cut-outs fly from the product rail directly onto the model torso with aerodynamic 3D parabolic arcs.
   - 220ms synchronized occlusion swap with 0% ghost double-exposure.
   - Ambient winter snowfall crystal canvas & glacial corner mist.

2. **Full Product Detail Page (PDP)**
   - Studio Model & Cut-out Packshot dual-mode viewer.
   - Interactive cursor-tracking zoom magnification.
   - Live colorway swatches & size selector.
   - Detailed Technical Anatomy, climate ratings, fabric breakdown, and lab test data.
   - 1-click **"Try On Live Model"** shortcut that brings the jacket into the hero studio.

3. **Complete Storefront Architecture**
   - **Curated Outerwear Collection Grid**: Filter by Down Puffers, Technical Shells, Thermal Fleece, and Storm Parkas.
   - **Interactive Fit Lab**: Precision sizing calculator supporting Metric (cm/kg) and Imperial (in/lbs).
   - **Technical Anatomy**: 4-pillar deep dive into 800-fill down, Japanese ripstop, and seam welding.
   - **Slide-over Shopping Bag (Cart Drawer)**: Real-time free shipping threshold meter, quantity stepper, promo code discounts (`WINTER20`, `TAWAKAL10`), and subtotal calculations.
   - **Member Authentication Modal**: Sign in, register, and 1-click demo profile with orders dashboard.
   - **Verified Field Reviews & Lifetime Warranty**: Arctic field reports and FAQ accordion.

4. **Security & Quality Engineering**
   - Integrated with 4 core engineering skills:
     - `avoid-ai-writing`: Clean, human, grounded technical copy without AI buzzwords or em-dashes.
     - `safe-anything`: Strict input sanitization, input boundaries (`maxLength`), XSS prevention, defensive `localStorage` schema checks.
     - `shadcn-ui`: Accessible dialogs (`role="dialog"`, `aria-modal="true"`, `Escape` key listeners) and high-contrast `:focus-visible` rings.
     - `agent-skills`: Core Web Vitals optimization, zero layout thrashing, and automated test suite.
   - Full PostgreSQL & Supabase schema with Row-Level Security (RLS) policies in `supabase_schema.sql`.

---

## Tech Stack

- **Frontend:** React 18, Vite 5, Vanilla CSS
- **Animations:** Web Animations API (WAAPI)
- **Database / Backend:** Supabase PostgreSQL with Row Level Security (RLS)
- **Testing:** Automated node test suite (`qa_verify.cjs` - 77 tests)

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

### 3. Run Automated QA Suite
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```
The optimized bundle is output to `dist/`.

---

## License

MIT License. Designed and engineered for TAWAKAL Outerwear Ltd.
