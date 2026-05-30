import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Key, Sun, Moon, AlertTriangle, Map, CloudSun, Utensils } from 'lucide-react';
import PlannerForm from './components/PlannerForm';
import ItineraryView from './components/ItineraryView';
import { generateItinerary } from './services/geminiService';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [itinerary, setItinerary] = useState(null);

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
    <div style={styles.app}>
      {/* Background gradient blobs */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      {/* Header navbar */}
      <header style={styles.header} className="glass-panel no-print">
        <div style={styles.logoRow}>
          <div style={styles.logoCircle}>
            <Compass size={20} color="var(--accent-primary)" />
          </div>
          <span style={styles.logoText} className="text-gradient">RoamAI</span>
          <span style={styles.logoVersion}>v1.0</span>
        </div>

        <div style={styles.navActions}>
          <button onClick={toggleTheme} className="icon-btn" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main style={styles.main}>

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

        <div style={styles.dashboardGrid}>
          {/* Left panel form */}
          <div style={styles.sidebarCol} className="no-print">
            <PlannerForm
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>

          {/* Right panel itinerary view */}
          <div style={styles.contentCol}>
            {isGenerating ? (
              <div style={styles.loadingContainer} className="glass-panel">
                <div className="loader-ring" />
                <h2 style={styles.loadingTitle}>Generating Itinerary</h2>
                <p style={styles.loadingSubtitle}>
                  Consulting Gemini to design the ultimate schedule, local cuisine lists, and route maps...
                </p>
                <div style={styles.loadingTips}>
                  <Sparkles size={16} color="var(--accent-primary)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Tip: Leaflet coordinates are being plotted to create interactive maps.
                  </span>
                </div>
              </div>
            ) : itinerary ? (
              <ItineraryView itinerary={itinerary} />
            ) : (
              <div style={styles.welcomeHero} className="glass-panel animate-fade-in-up">
                <div style={styles.heroCircle}>
                  <Sparkles size={32} color="var(--accent-primary)" />
                </div>
                <h1 style={styles.heroTitle} className="text-gradient">Your AI Travel Companion</h1>
                <p style={styles.heroSubtitle}>
                  Design a fully customized, day-by-day travel plan. Specify your destination, trip length, companion style, and interests to generate accommodations, maps, weather forecasts, and dining coordinates instantly.
                </p>
                
                <div style={styles.featureGrid}>
                  <div style={styles.featCard}>
                    <div style={styles.featIcon}>
                      <Map size={24} color="var(--accent-primary)" />
                    </div>
                    <h4 style={styles.featTitle}>Interactive Maps</h4>
                    <p style={styles.featText}>Plotted coordinates show exact pins for accommodations and activities.</p>
                  </div>
                  <div style={styles.featCard}>
                    <div style={styles.featIcon}>
                      <CloudSun size={24} color="var(--accent-primary)" />
                    </div>
                    <h4 style={styles.featTitle}>Live Weather</h4>
                    <p style={styles.featText}>Real-time weather forecast details using latitude and longitude coordinates.</p>
                  </div>
                  <div style={styles.featCard}>
                    <div style={styles.featIcon}>
                      <Utensils size={24} color="var(--accent-primary)" />
                    </div>
                    <h4 style={styles.featTitle}>Local Cuisines</h4>
                    <p style={styles.featText}>Suggested local dishes, beverages, and the best places to try them.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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
