import React, { useState } from 'react';

export default function FitCalculator() {
  const [unit, setUnit] = useState('metric'); // 'metric' or 'imperial'
  const [height, setHeight] = useState(180); // cm or inches
  const [weight, setWeight] = useState(78); // kg or lbs
  const [fitPreference, setFitPreference] = useState('regular'); // 'slim', 'regular', 'layered'

  // Calculate recommendation
  const calculateSize = () => {
    let weightKg = unit === 'metric' ? weight : weight * 0.453592;
    let heightCm = unit === 'metric' ? height : height * 2.54;

    // Body Mass & Height composite
    let baseScore = (weightKg / 70) * 0.6 + (heightCm / 175) * 0.4;

    if (fitPreference === 'slim') baseScore -= 0.1;
    if (fitPreference === 'layered') baseScore += 0.15;

    if (baseScore < 0.88) return { size: 'S', chest: '36–38"', note: 'Fitted cut across chest, clean sleeve drape' };
    if (baseScore < 1.05) return { size: 'M', chest: '39–41"', note: 'Balanced silhouette with ergonomic room for thermal mid-layer' };
    if (baseScore < 1.22) return { size: 'L', chest: '42–44"', note: 'Comfortable chest box with freedom for thick knitwear' };
    if (baseScore < 1.40) return { size: 'XL', chest: '45–47"', note: 'Generous cut with extended back length and sleeve coverage' };
    return { size: 'XXL', chest: '48–50"', note: 'Maximum room for heavy multi-layering in extreme conditions' };
  };

  const rec = calculateSize();

  return (
    <section className="section-fit" id="fit-lab">
      <div className="section-container">
        <div className="section-header">
          <div className="section-eyebrow">TAWAKAL FIT LAB</div>
          <h2 className="section-title">Precision Sizing Calculator</h2>
          <p className="section-subtitle">
            Enter your measurements to find your optimal outerwear size for cold-weather layering.
          </p>
        </div>

        <div className="fit-calc-wrapper">
          {/* Controls */}
          <div className="fit-inputs-card">
            <div className="fit-unit-toggle">
              <button
                className={`unit-btn ${unit === 'metric' ? 'active' : ''}`}
                onClick={() => {
                  if (unit !== 'metric') {
                    setUnit('metric');
                    setHeight(Math.round(height * 2.54));
                    setWeight(Math.round(weight * 0.453592));
                  }
                }}
              >
                Metric (cm / kg)
              </button>
              <button
                className={`unit-btn ${unit === 'imperial' ? 'active' : ''}`}
                onClick={() => {
                  if (unit !== 'imperial') {
                    setUnit('imperial');
                    setHeight(Math.round(height / 2.54));
                    setWeight(Math.round(weight / 0.453592));
                  }
                }}
              >
                Imperial (in / lbs)
              </button>
            </div>

            {/* Height Slider */}
            <div className="input-group">
              <div className="input-label-row">
                <label>Height</label>
                <span className="slider-val">{height} {unit === 'metric' ? 'cm' : 'in'}</span>
              </div>
              <input
                type="range"
                min={unit === 'metric' ? 150 : 59}
                max={unit === 'metric' ? 210 : 83}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="fit-slider"
              />
            </div>

            {/* Weight Slider */}
            <div className="input-group">
              <div className="input-label-row">
                <label>Weight</label>
                <span className="slider-val">{weight} {unit === 'metric' ? 'kg' : 'lbs'}</span>
              </div>
              <input
                type="range"
                min={unit === 'metric' ? 50 : 110}
                max={unit === 'metric' ? 125 : 275}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="fit-slider"
              />
            </div>

            {/* Fit Preference */}
            <div className="input-group">
              <label className="mb-2 block">Fit Silhouette</label>
              <div className="fit-pref-row">
                <button
                  className={`pref-btn ${fitPreference === 'slim' ? 'active' : ''}`}
                  onClick={() => setFitPreference('slim')}
                >
                  Tailored / Trim
                </button>
                <button
                  className={`pref-btn ${fitPreference === 'regular' ? 'active' : ''}`}
                  onClick={() => setFitPreference('regular')}
                >
                  Standard Regular
                </button>
                <button
                  className={`pref-btn ${fitPreference === 'layered' ? 'active' : ''}`}
                  onClick={() => setFitPreference('layered')}
                >
                  Multi-Layering
                </button>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="fit-result-card">
            <div className="fit-result-badge">YOUR RECOMMENDED SIZE</div>
            <div className="fit-recommended-size">{rec.size}</div>
            <div className="fit-chest-range">Recommended for Chest: {rec.chest}</div>
            <p className="fit-result-note">{rec.note}</p>

            <div className="fit-guarantee-box">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span>Guaranteed Perfect Fit: Free exchanges within 30 days.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
