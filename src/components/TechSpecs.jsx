import React, { useState } from 'react';

const TECH_PILLARS = [
  {
    id: "down",
    title: "800-Fill Goose Down",
    short: "Thermal Core",
    metric: "800 FP",
    desc: "Ethically harvested RDS-certified Hungarian goose down. Cluster-to-feather ratio of 90/10 provides unmatched heat-to-weight ratio, trapping air pockets while compressing into internal storage compartments.",
    bullets: [
      "RDS (Responsible Down Standard) certified tracking",
      "Hydrophobic DWR coating prevents down clumping in damp fog",
      "Box-wall baffle construction eliminates thermal leak lines"
    ]
  },
  {
    id: "shell",
    title: "Japanese 3-Layer Ripstop",
    short: "Weather Barrier",
    metric: "20,000 mm",
    desc: "High-density 40D Japanese ripstop nylon backed by a monolithic microporous membrane. Blocks hurricane-force rain and coastal gales while maintaining exceptional vapor permeability.",
    bullets: [
      "20,000 mm hydrostatic waterproof pressure threshold",
      "25,000 g/m²/24hr moisture vapor breathability rating",
      "Zero PFAS, PFC-free durable water-repellent exterior"
    ]
  },
  {
    id: "seams",
    title: "Heat-Taped Seam Welding",
    short: "Sealed Construction",
    metric: "13 mm Micro-Tape",
    desc: "Every critical seam is reinforced with ultra-thin 13mm seam tape under calibrated thermal pressure. Eliminates needle holes where biting sub-zero wind typically cuts through outerwear.",
    bullets: [
      "Ultrasonic seam welding on high-stress articulation points",
      "YKK Aquaguard matte urethane-coated zipper tracks",
      "Magnetic storm flap closure for rapid one-handed sealing"
    ]
  },
  {
    id: "mobility",
    title: "Ergonomic Articulation",
    short: "Full Range Motion",
    metric: "3D Patterning",
    desc: "Patterned around the body in motion. Underarm gussets and articulated sleeves prevent hem lift when reaching overhead, carrying equipment, or driving.",
    bullets: [
      "Zero hem creep during full shoulder extension",
      "Helmet-compatible 3-point cinch storm hood",
      "Dual internal fleece-lined quick-warm hand pockets"
    ]
  }
];

export default function TechSpecs() {
  const [activeTab, setActiveTab] = useState("down");

  const activePillar = TECH_PILLARS.find(p => p.id === activeTab) || TECH_PILLARS[0];

  return (
    <section className="section-tech" id="tech">
      <div className="section-container">
        <div className="section-header">
          <div className="section-eyebrow">MATERIALS & CRAFTSMANSHIP</div>
          <h2 className="section-title">The Anatomy of Protection</h2>
          <p className="section-subtitle">
            Engineered from raw fiber to final weld for uncompromising performance in freezing weather.
          </p>
        </div>

        {/* Tab Selectors */}
        <div className="tech-tabs-row">
          {TECH_PILLARS.map(p => (
            <button
              key={p.id}
              className={`tech-tab-btn ${activeTab === p.id ? 'active' : ''}`}
              onClick={() => setActiveTab(p.id)}
            >
              <span className="tech-tab-metric">{p.metric}</span>
              <span className="tech-tab-title">{p.short}</span>
            </button>
          ))}
        </div>

        {/* Active Tab Card */}
        <div className="tech-detail-card">
          <div className="tech-card-left">
            <div className="tech-highlight-badge">{activePillar.metric}</div>
            <h3 className="tech-card-heading">{activePillar.title}</h3>
            <p className="tech-card-text">{activePillar.desc}</p>
            <ul className="tech-bullets-list">
              {activePillar.bullets.map((b, i) => (
                <li key={i}>
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8.5 l3.5 3.5 6.5-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="tech-card-right">
            <div className="tech-spec-box">
              <span className="spec-label">Wind Resistance</span>
              <span className="spec-value">100% Windproof (&lt; 0.1 CFM)</span>
              <div className="spec-bar"><div className="spec-bar-fill" style={{ width: '98%' }} /></div>
            </div>
            <div className="tech-spec-box">
              <span className="spec-label">Thermal Retention</span>
              <span className="spec-value">-30°C Tested Tolerance</span>
              <div className="spec-bar"><div className="spec-bar-fill" style={{ width: '94%' }} /></div>
            </div>
            <div className="tech-spec-box">
              <span className="spec-label">Waterproof Barrier</span>
              <span className="spec-value">20,000 mm Hydrostatic Head</span>
              <div className="spec-bar"><div className="spec-bar-fill" style={{ width: '96%' }} /></div>
            </div>
            <div className="tech-spec-box">
              <span className="spec-label">Breathability Index</span>
              <span className="spec-value">25,000 g/m²/24hr</span>
              <div className="spec-bar"><div className="spec-bar-fill" style={{ width: '90%' }} /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
