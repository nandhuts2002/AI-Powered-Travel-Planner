import React, { useState } from 'react';
import { MapPin, Calendar, Compass, ArrowRight, ArrowLeft, Send, Sparkles, AlertCircle } from 'lucide-react';

const SUGGESTED_DESTINATIONS = [
  "Kyoto, Japan",
  "Paris, France",
  "Rome, Italy",
  "Bali, Indonesia",
  "New York City, USA",
  "Reykjavik, Iceland",
  "Cape Town, South Africa",
  "Sydney, Australia",
  "Cairo, Egypt",
  "Rio de Janeiro, Brazil"
];

const COMPANIONS = [
  { id: 'Solo', label: 'Solo Traveler', desc: 'Indulge in absolute freedom' },
  { id: 'Couple', label: 'Couple / Romantic', desc: 'Curated for two, romantic pacing' },
  { id: 'Family', label: 'Family with Kids', desc: 'Kid-friendly, relaxed schedules' },
  { id: 'Friends', label: 'Group of Friends', desc: 'Social, fun-packed activities' }
];

const BUDGETS = [
  { id: 'Economy', label: 'Economy', desc: 'Hostels, local transit, street foods', price: '$' },
  { id: 'Mid-range', label: 'Mid-range', desc: 'Boutique stays, nice dining, taxis', price: '$$' },
  { id: 'Luxury', label: 'Luxury', desc: '5-star resorts, private guides, fine dining', price: '$$$' }
];

const INTERESTS = [
  { id: 'Adventure', label: '⛰️ Adventure & Outdoors' },
  { id: 'Culture', label: '⛩️ Culture & History' },
  { id: 'Culinary', label: '🍜 Local Culinary & Drinks' },
  { id: 'Relaxation', label: '🏝️ Relaxation & Spas' },
  { id: 'Nature', label: '🌿 Nature & Wildlife' },
  { id: 'Shopping', label: '🛍️ Shopping & Souvenirs' },
  { id: 'Nightlife', label: '✨ Nightlife & Social' }
];

export default function PlannerForm({ onGenerate, isGenerating, hasApiKey }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    destination: '',
    duration: 3,
    budget: 'Mid-range',
    companion: 'Solo',
    interests: []
  });
  const [isFocused, setIsFocused] = useState(false);

  const toggleInterest = (id) => {
    setFormData(prev => {
      const interests = prev.interests.includes(id)
        ? prev.interests.filter(item => item !== id)
        : [...prev.interests, id];
      return { ...prev, interests };
    });
  };

  const handleNext = () => {
    if (step === 1 && !formData.destination.trim()) return;
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.destination.trim()) return;
    if (formData.interests.length === 0) {
      alert("Please select at least one interest to personalize your trip.");
      return;
    }
    onGenerate(formData);
  };

  return (
    <div className="glass-panel" style={styles.formContainer}>
      {/* Progress Bar */}
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${(step / 3) * 100}%` }}></div>
      </div>

      <div style={styles.stepHeader}>
        <span style={styles.stepIndicator}>Step {step} of 3</span>
        <h2 style={styles.stepTitle}>
          {step === 1 && "Where and when?"}
          {step === 2 && "Travel vibe & budget"}
          {step === 3 && "What are your interests?"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* STEP 1: Destination and Duration */}
        {step === 1 && (
          <div style={styles.stepContent} className="animate-fade-in-up">
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <MapPin size={16} /> Destination
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="e.g., Tokyo, Japan"
                  style={styles.input}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  required
                />
                {isFocused && (
                  <div style={styles.suggestionsContainer}>
                    <div style={styles.suggestionTitle}>Popular Destinations</div>
                    {SUGGESTED_DESTINATIONS.filter(d => 
                      d.toLowerCase().includes(formData.destination.toLowerCase())
                    ).map(dest => (
                      <div
                        key={dest}
                        style={styles.suggestionItem}
                        onMouseDown={() => setFormData(prev => ({ ...prev, destination: dest }))}
                      >
                        {dest}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.sliderLabelRow}>
                <label style={styles.label}>
                  <Calendar size={16} /> Trip Duration
                </label>
                <span style={styles.sliderValue}>{formData.duration} {formData.duration === 1 ? 'Day' : 'Days'}</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                style={styles.slider}
              />
              <div style={styles.sliderTicks}>
                <span>1 Day</span>
                <span>8 Days</span>
                <span>15 Days</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Budget and Companions */}
        {step === 2 && (
          <div style={styles.stepContent} className="animate-fade-in-up">
            <div style={styles.inputGroup}>
              <label style={styles.label}>Companion Type</label>
              <div style={styles.cardGrid}>
                {COMPANIONS.map(comp => (
                  <div
                    key={comp.id}
                    onClick={() => setFormData(prev => ({ ...prev, companion: comp.id }))}
                    style={{
                      ...styles.optionCard,
                      borderColor: formData.companion === comp.id ? 'var(--accent-primary)' : 'var(--border-color)',
                      backgroundColor: formData.companion === comp.id ? 'var(--accent-light)' : 'rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div style={styles.cardHeader}>
                      <span style={styles.cardLabel}>{comp.label}</span>
                    </div>
                    <span style={styles.cardDesc}>{comp.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Budget Level</label>
              <div style={styles.cardGrid}>
                {BUDGETS.map(b => (
                  <div
                    key={b.id}
                    onClick={() => setFormData(prev => ({ ...prev, budget: b.id }))}
                    style={{
                      ...styles.optionCard,
                      borderColor: formData.budget === b.id ? 'var(--accent-primary)' : 'var(--border-color)',
                      backgroundColor: formData.budget === b.id ? 'var(--accent-light)' : 'rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div style={styles.cardHeader}>
                      <span style={styles.cardLabel}>{b.label}</span>
                      <span style={styles.cardPrice}>{b.price}</span>
                    </div>
                    <span style={styles.cardDesc}>{b.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Interests */}
        {step === 3 && (
          <div style={styles.stepContent} className="animate-fade-in-up">
            <label style={styles.label}>
              <Compass size={16} /> Choose one or more areas of interest
            </label>
            <div style={styles.interestGrid}>
              {INTERESTS.map(interest => {
                const selected = formData.interests.includes(interest.id);
                return (
                  <div
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    style={{
                      ...styles.interestTag,
                      borderColor: selected ? 'var(--accent-primary)' : 'var(--border-color)',
                      backgroundColor: selected ? 'var(--accent-light)' : 'rgba(0, 0, 0, 0.15)',
                      color: selected ? 'var(--accent-primary)' : 'var(--text-primary)'
                    }}
                  >
                    {interest.label}
                  </div>
                );
              })}
            </div>

            {!hasApiKey && (
              <div style={styles.apiKeyWarn}>
                <AlertCircle size={18} color="var(--status-warning)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  A valid Gemini API Key is required to generate itineraries. Click the key icon in the top right to configure it.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={styles.navRow}>
          {step > 1 ? (
            <button type="button" onClick={handleBack} className="btn btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!formData.destination.trim()}
              className="btn btn-primary"
              style={{ opacity: !formData.destination.trim() ? 0.6 : 1 }}
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isGenerating || !hasApiKey}
              className="btn btn-primary animate-pulse"
              style={{
                background: 'linear-gradient(135deg, var(--accent-secondary) 0%, #4338ca 100%)',
                opacity: (isGenerating || !hasApiKey) ? 0.6 : 1,
                cursor: (isGenerating || !hasApiKey) ? 'not-allowed' : 'pointer'
              }}
            >
              {isGenerating ? (
                <>
                  <span className="loader-ring" style={{ width: 16, height: 16, borderWidth: 2, marginRight: 8 }} />
                  Creating Trip...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Itinerary
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

const styles = {
  formContainer: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: '2rem',
  },
  progressBar: {
    height: '4px',
    backgroundColor: 'var(--border-color)',
    borderRadius: '2px',
    marginBottom: '1.5rem',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'var(--accent-primary)',
    transition: 'width 0.3s ease'
  },
  stepHeader: {
    marginBottom: '1.5rem',
  },
  stepIndicator: {
    fontSize: '0.8rem',
    color: 'var(--accent-primary)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  stepTitle: {
    fontSize: '1.5rem',
    marginTop: '0.25rem',
    color: 'var(--text-primary)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    flex: 1,
    minHeight: '260px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  input: {
    fontSize: '0.95rem'
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#0f172a',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    marginTop: '0.25rem',
    zIndex: 10,
    boxShadow: 'var(--shadow-lg)',
    maxHeight: '200px',
    overflowY: 'auto'
  },
  suggestionTitle: {
    padding: '0.5rem 0.75rem',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border-color)'
  },
  suggestionItem: {
    padding: '0.6rem 0.75rem',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: 'var(--border-color)'
    }
  },
  sliderLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sliderValue: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--accent-primary)'
  },
  slider: {
    WebkitAppearance: 'none',
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: 'var(--border-color)',
    outline: 'none',
    margin: '10px 0'
  },
  sliderTicks: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  optionCard: {
    border: '1px solid',
    borderRadius: 'var(--radius-md)',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
    }
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  cardPrice: {
    fontSize: '0.8rem',
    color: 'var(--accent-primary)',
    fontWeight: '700'
  },
  cardDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.3'
  },
  interestGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.6rem',
  },
  interestTag: {
    padding: '0.6rem 1rem',
    borderRadius: '20px',
    border: '1px solid',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    '&:hover': {
      transform: 'scale(1.02)'
    }
  },
  apiKeyWarn: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.85rem',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 'var(--radius-sm)',
    border: '1px dashed rgba(245, 158, 11, 0.3)',
    marginTop: 'auto'
  },
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '2rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem',
  }
};
