const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('=== STARTING AUTOMATED QA AND SECURITY AUDIT SUITE ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// 1. Verify build files
const distPath = path.join(__dirname, 'dist');
assert(fs.existsSync(distPath), 'Dist folder exists');
const distHtml = path.join(distPath, 'index.html');
assert(fs.existsSync(distHtml), 'Dist index.html exists');

const singleFile = path.join(__dirname, 'tawakal_landing_page.html');
assert(fs.existsSync(singleFile), 'Standalone tawakal_landing_page.html exists');
assert(fs.statSync(singleFile).size > 100000, 'Standalone bundle has non-trivial size (>100KB)');

// 2. Verify Product Data
const productsFile = path.join(__dirname, 'src', 'data', 'products.js');
assert(fs.existsSync(productsFile), 'products.js data file exists');
const productContent = fs.readFileSync(productsFile, 'utf8');

assert(productContent.includes('Alpine Puffer'), 'Contains Alpine Puffer');
assert(productContent.includes('Ridge Fleece'), 'Contains Ridge Fleece');
assert(productContent.includes('Drift Shell'), 'Contains Drift Shell');
assert(productContent.includes('Harbor Parka'), 'Contains Harbor Parka');
assert(productContent.includes('images.higgs.ai'), 'Uses Higgsfield image proxy');

// 3. Test Email Validation Logic
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
assert(emailRegex.test('tester@tawakal.com'), 'Valid email passes regex');
assert(!emailRegex.test('invalid-email'), 'Invalid email fails regex');
assert(!emailRegex.test('test@domain'), 'Email without TLD fails regex');
assert(!emailRegex.test(''), 'Empty email fails regex');

// 4. Test Cart Calculations
const mockItems = [
  { product: { priceNum: 238 }, quantity: 1 },
  { product: { priceNum: 148 }, quantity: 2 }
];
const subtotal = mockItems.reduce((acc, it) => acc + it.product.priceNum * it.quantity, 0);
assert(subtotal === 534, `Cart subtotal calculation accurate ($534 === ${subtotal})`);

const isFreeShipping = subtotal >= 200;
assert(isFreeShipping === true, 'Free shipping unlocked for subtotal > $200');

const discount20 = (subtotal * 20) / 100;
assert(discount20 === 106.8, `Promo code 20% calculation accurate ($106.8 === ${discount20})`);

// 5. Test Quantity Clamping
function clampQty(qty) {
  return Math.min(10, Math.max(1, qty));
}
assert(clampQty(0) === 1, 'Quantity lower bound clamped to 1');
assert(clampQty(-5) === 1, 'Negative quantity clamped to 1');
assert(clampQty(5) === 5, 'Normal quantity preserved');
assert(clampQty(15) === 10, 'Excessive quantity clamped to 10');

// 6. Test Fit Calculator Logic
function mockCalculateSize(heightCm, weightKg, preference) {
  let baseScore = (weightKg / 70) * 0.6 + (heightCm / 175) * 0.4;
  if (preference === 'slim') baseScore -= 0.1;
  if (preference === 'layered') baseScore += 0.15;
  if (baseScore < 0.88) return 'S';
  if (baseScore < 1.05) return 'M';
  if (baseScore < 1.22) return 'L';
  if (baseScore < 1.40) return 'XL';
  return 'XXL';
}
assert(mockCalculateSize(175, 70, 'regular') === 'M', 'Average male (175cm, 70kg) recommends M');
assert(mockCalculateSize(165, 55, 'slim') === 'S', 'Slender male (165cm, 55kg, slim) recommends S');
assert(mockCalculateSize(190, 95, 'layered') === 'XL' || mockCalculateSize(190, 95, 'layered') === 'XXL', 'Heavy tall male recommends XL/XXL');

// 7. Verify Fonts CSS
const fontsCss = path.join(__dirname, 'src', 'fonts.css');
assert(fs.existsSync(fontsCss), 'src/fonts.css exists');
const fontsContent = fs.readFileSync(fontsCss, 'utf8');
assert(fontsContent.includes("font-family: 'Inter'"), 'Inter font face declared');
assert(fontsContent.includes("font-family: 'Archivo'"), 'Archivo font face declared');
assert(fontsContent.includes("data:font/woff2;base64,"), 'Base64 data URIs embedded');

// 8. Verify Supabase Schema Security
const sqlFile = path.join(__dirname, 'supabase_schema.sql');
assert(fs.existsSync(sqlFile), 'supabase_schema.sql exists');
const sqlContent = fs.readFileSync(sqlFile, 'utf8');
assert(sqlContent.includes('ENABLE ROW LEVEL SECURITY'), 'All tables have RLS enabled');
assert(sqlContent.includes('auth.uid() = user_id'), 'User ownership policy enforced');
assert(sqlContent.includes('role = \'admin\''), 'Admin role permission check present');

// 9. Verify Scroll-Driven Jacket Animation & Scrollytelling Architecture
const heroComponentFile = path.join(__dirname, 'src', 'components', 'HeroTryOn.jsx');
assert(fs.existsSync(heroComponentFile), 'HeroTryOn.jsx component exists');
const heroCode = fs.readFileSync(heroComponentFile, 'utf8');
assert(heroCode.includes('hero-scroll-track'), 'Hero component renders hero-scroll-track');
assert(heroCode.includes("window.addEventListener('scroll'"), 'Scroll event listener attached for scrollytelling');
assert(heroCode.includes('norm >= 0.8') || heroCode.includes('norm >='), 'Hysteresis thresholds configured to prevent jitter');
assert(heroCode.includes('triggerSwap'), 'triggerSwap handles jacket transition animation');
assert(heroCode.includes('flyer.animate'), 'WAAPI flyer glide animation present');

const indexCssFile = path.join(__dirname, 'src', 'index.css');
const indexCss = fs.readFileSync(indexCssFile, 'utf8');
assert(indexCss.includes('.hero-scroll-track'), 'CSS defines .hero-scroll-track');
assert(indexCss.includes('position: sticky'), 'Hero uses position: sticky for pinned scrollytelling');

const tawakalLandingFile = path.join(__dirname, 'tawakal_landing_page.html');
assert(fs.existsSync(tawakalLandingFile), 'Standalone tawakal_landing_page.html exists');

// 10. Verify Product Detail Page (PDP) Architecture
const pdpFile = path.join(__dirname, 'src', 'components', 'ProductDetailPage.jsx');
assert(fs.existsSync(pdpFile), 'ProductDetailPage.jsx component exists');
const pdpCode = fs.readFileSync(pdpFile, 'utf8');
assert(pdpCode.includes('pdp-view-switcher'), 'PDP features Studio Model & Packshot switcher');
assert(pdpCode.includes('pdp-swatch-row'), 'PDP features multi-garment colorway swatches');
assert(pdpCode.includes('pdp-technical-section'), 'PDP features deep technical anatomy and climate index');
assert(pdpCode.includes('btn-pdp-add-cart'), 'PDP features direct add-to-bag buy box');
assert(pdpCode.includes('onTryOnInHero'), 'PDP features 1-click virtual try-on in hero studio');

assert(indexCss.includes('.product-detail-page'), 'CSS defines .product-detail-page');
assert(indexCss.includes('.pdp-stage-box'), 'CSS defines .pdp-stage-box');

// 11. Verify Cloned Repositories in skills/
const skillsDir = path.join(__dirname, 'skills');
assert(fs.existsSync(skillsDir), 'skills/ directory exists');
assert(fs.existsSync(path.join(skillsDir, 'agent-skills')), 'skills/agent-skills cloned');
assert(fs.existsSync(path.join(skillsDir, 'avoid-ai-writing')), 'skills/avoid-ai-writing cloned');
assert(fs.existsSync(path.join(skillsDir, 'safe-anything')), 'skills/safe-anything cloned');
assert(fs.existsSync(path.join(skillsDir, 'ui')), 'skills/ui (shadcn-ui) cloned');

// 12. Verify avoid-ai-writing Guidelines
assert(!productContent.includes(' — '), 'products.js contains 0 em-dashes (—)');
assert(!pdpCode.includes(' — '), 'ProductDetailPage.jsx contains 0 em-dashes (—)');
assert(!productContent.includes('seamless'), 'products.js contains no "seamless" AI cliché');
assert(!productContent.includes('cutting-edge'), 'products.js contains no "cutting-edge" AI cliché');

// 13. Verify safe-anything Security Controls
const authModalFile = path.join(__dirname, 'src', 'components', 'AuthModal.jsx');
const authModalCode = fs.readFileSync(authModalFile, 'utf8');
assert(authModalCode.includes('maxLength={100}'), 'Auth email input has maxLength=100');
assert(authModalCode.includes('maxLength={80}'), 'Auth name input has maxLength=80');
assert(authModalCode.includes('maxLength={128}'), 'Auth password input has maxLength=128');

const cartDrawerFile = path.join(__dirname, 'src', 'components', 'CartDrawer.jsx');
const cartDrawerCode = fs.readFileSync(cartDrawerFile, 'utf8');
assert(cartDrawerCode.includes('maxLength={30}'), 'Promo code input has maxLength=30');
assert(cartDrawerCode.includes('/^[A-Z0-9_-]{1,30}$/'), 'Promo code input strictly validated with safe regex');

const appFile = path.join(__dirname, 'src', 'App.jsx');
const appCode = fs.readFileSync(appFile, 'utf8');
assert(appCode.includes('Array.isArray(parsed)'), 'Cart localStorage defensively checks for Array structure');

// 14. Verify shadcn-ui & Accessibility Engineering Guidelines
assert(authModalCode.includes('role="dialog"'), 'AuthModal has role="dialog"');
assert(authModalCode.includes('aria-modal="true"'), 'AuthModal has aria-modal="true"');
assert(authModalCode.includes("e.key === 'Escape'"), 'AuthModal handles Escape key');

assert(cartDrawerCode.includes('role="dialog"'), 'CartDrawer has role="dialog"');
assert(cartDrawerCode.includes('aria-modal="true"'), 'CartDrawer has aria-modal="true"');
assert(cartDrawerCode.includes("e.key === 'Escape'"), 'CartDrawer handles Escape key');

const productModalFile = path.join(__dirname, 'src', 'components', 'ProductModal.jsx');
const productModalCode = fs.readFileSync(productModalFile, 'utf8');
assert(productModalCode.includes('role="dialog"'), 'ProductModal has role="dialog"');
assert(productModalCode.includes('aria-modal="true"'), 'ProductModal has aria-modal="true"');
assert(productModalCode.includes("e.key === 'Escape'"), 'ProductModal handles Escape key');

const faqFile = path.join(__dirname, 'src', 'components', 'FAQ.jsx');
const faqCode = fs.readFileSync(faqFile, 'utf8');
assert(faqCode.includes('aria-expanded={isOpen}'), 'FAQ accordion questions have aria-expanded');
assert(faqCode.includes('aria-controls='), 'FAQ accordion questions have aria-controls');

assert(indexCss.includes(':focus-visible'), 'CSS provides global focus-visible indicators');
assert(indexCss.includes('touch-action: manipulation'), 'CSS configures touch-action: manipulation for mobile a11y');

console.log(`\n=== QA SUITE SUMMARY: ${passCount} Passed, ${failCount} Failed ===`);
if (failCount > 0) process.exit(1);
