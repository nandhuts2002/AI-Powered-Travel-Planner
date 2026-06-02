import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Key, Sun, Moon, AlertTriangle, Map, CloudSun, Utensils, Mic, AudioLines, ArrowUp, Plus, Send, ArrowUpRight, Home } from 'lucide-react';
import PlannerForm from './components/PlannerForm';
import ItineraryView from './components/ItineraryView';
import { generateItinerary } from './services/geminiService';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [itinerary, setItinerary] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize API Key from env or localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (savedKey) {
      setApiKey(savedKey);
    } else if (envKey) {
      setApiKey(envKey);
    }
  }, []);

  // Theme application
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleGenerate = async (formData) => {
    setIsModalOpen(false);
    setIsGenerating(true);
    setError('');
    
    try {
      const data = await generateItinerary({
        ...formData,
        apiKey
      });
      setItinerary(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={styles.app} className="hero-wrapper">
      {/* Universal Background */}
      <img src={`${import.meta.env.BASE_URL}hero_bg.png`} alt="Hero Background" className="hero-bg" />
      <div className="hero-overlay"></div>

      {/* Universal Header */}
      <header className="glass-header no-print animate-fade-in-up" style={{ padding: '1.5rem 3rem', background: 'transparent', border: 'none', boxShadow: 'none' }}>
        <div style={{...styles.logoRow, cursor: 'pointer'}} onClick={() => { setItinerary(null); setIsGenerating(false); }}>
          <div style={{...styles.logoCircle, background: 'rgba(255,255,255,0.2)'}}>
            <Compass size={20} color="#fff" />
          </div>
          <span style={{...styles.logoText, color: '#fff', fontSize: '1.5rem'}}>RoamAI</span>
        </div>

        {(itinerary || isGenerating) && (
          <button className="btn-glass" onClick={() => { setItinerary(null); setIsGenerating(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Home size={16} /> Home
          </button>
        )}
      </header>

      <main style={{...styles.main, display: 'flex', flexDirection: 'column'}}>

        {error && (
          <div style={styles.errorAlert} className="glass-panel animate-fade-in-up">
            <div style={styles.alertContent}>
              <AlertTriangle size={24} color="var(--status-danger)" />
              <div>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Generation Failed</h4>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {!itinerary && !isGenerating ? (
          <div className="hero-content animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="hero-left">
              <div className="hero-badge">
                <Sparkles size={14} /> I'll design a trip for you.
              </div>
              <h1 className="hero-title">Hey I'm RoamAI, your AI trip planner</h1>
              <button className="btn-hero" onClick={() => setIsModalOpen(true)}>
                Plan Your Trip <ArrowUpRight size={20} />
              </button>
            </div>

            <div className="teaser-card">
              <div className="teaser-badge">Trips Planned</div>
              <img src={`${import.meta.env.BASE_URL}resort_thumb.png`} alt="Tropical Resort" className="teaser-img" />
              <div className="teaser-title">Your trip in minutes, not weeks.</div>
              <div className="teaser-desc">Plan your next trip with me and discover the world's hidden gems.</div>
              <div className="teaser-actions">
                <button className="btn-teaser" onClick={() => setIsModalOpen(true)}>
                  <Send size={14} /> Plan my trip
                </button>
                <button className="btn-icon-teaser" onClick={() => setIsModalOpen(true)}>
                  <Compass size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : isGenerating ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, padding: '2rem' }}>
            <div style={{...styles.loadingContainer, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '24px', maxWidth: '500px', width: '100%' }} className="glass-panel animate-fade-in-up">
              <div className="loader-ring" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff', width: '60px', height: '60px', borderWidth: '4px' }} />
              <h2 style={{...styles.loadingTitle, color: '#fff', marginTop: '1rem'}}>Generating Itinerary</h2>
              <p style={{...styles.loadingSubtitle, color: 'rgba(255,255,255,0.8)'}}>
                Consulting Gemini to design the ultimate schedule, local cuisine lists, and route maps...
              </p>
              <div style={{...styles.loadingTips, background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)'}}>
                <Sparkles size={16} color="#fff" />
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)' }}>
                  Tip: Leaflet coordinates are being plotted to create interactive maps.
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up" style={{ padding: '0 2rem 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h2 style={{ color: '#fff', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)', fontFamily: 'var(--font-display)' }}>Your Itinerary is Ready</h2>
               <button className="btn-hero" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }} onClick={() => setIsModalOpen(true)}>
                 Plan Another Trip <ArrowUpRight size={16} />
               </button>
             </div>
             <ItineraryView itinerary={itinerary} />
          </div>
        )}

        {/* Modal for PlannerForm */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
              <PlannerForm onGenerate={handleGenerate} isGenerating={isGenerating} />
            </div>
          </div>
        )}
      </main>

    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    margin: '1.5rem 1.5rem 0 1.5rem',
    borderRadius: 'var(--radius-lg) !important',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoCircle: {
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--accent-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: '800',
    fontFamily: 'var(--font-display)',
    color: 'var(--text-primary)',
  },
  logoVersion: {
    fontSize: '0.7rem',
    backgroundColor: 'var(--border-color)',
    color: 'var(--text-secondary)',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    fontWeight: '700'
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    border: '1px solid',
    backgroundColor: 'rgba(0,0,0,0.15)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  iconBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: 'var(--text-muted)'
    }
  },
  main: {
    flex: 1,
    padding: '1.5rem 1rem',
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  setupAlert: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderRadius: 'var(--radius-md) !important',
    borderLeft: '4px solid var(--status-warning)',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  errorAlert: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderRadius: 'var(--radius-md) !important',
    borderLeft: '4px solid var(--status-danger)',
  },
  alertContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: '1.5rem',
    alignItems: 'start',
    flex: 1
  },
  sidebarCol: {
    position: 'sticky',
    top: '1rem'
  },
  contentCol: {
    flex: 1
  },
  loadingContainer: {
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: '1.5rem',
  },
  loadingTitle: {
    fontSize: '1.75rem',
    color: 'var(--text-primary)',
    margin: 0
  },
  loadingSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    maxWidth: '500px',
    lineHeight: '1.6',
    margin: 0
  },
  loadingTips: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    marginTop: '1rem'
  },
  welcomeHero: {
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  heroCircle: {
    width: '64px',
    height: '64px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--accent-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  heroTitle: {
    fontSize: '2.5rem',
    color: 'var(--text-primary)',
    marginBottom: '1rem'
  },
  heroSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    lineHeight: '1.6',
    maxWidth: '650px',
    marginBottom: '3rem'
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
    width: '100%',
    maxWidth: '850px'
  },
  featCard: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  featIcon: {
    fontSize: '2rem',
    marginBottom: '0.75rem'
  },
  featTitle: {
    fontSize: '1.1rem',
    color: 'var(--text-primary)',
    marginBottom: '0.4rem'
  },
  featText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    margin: 0
  }
};

// Add responsive media query CSS dynamically for dashboard grid columns
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    @media (max-width: 1024px) {
      div[style*="gridTemplateColumns: 400px 1fr"] {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(styleEl);
}
