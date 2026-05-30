import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Key, Sun, Moon, AlertTriangle } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [apiKey, setApiKey] = useState('');
  const [isKeyDrawerOpen, setIsKeyDrawerOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [itinerary, setItinerary] = useState(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (savedKey) {
      setApiKey(savedKey);
    } else if (envKey) {
      setApiKey(envKey);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div style={styles.app}>
      <header style={styles.header} className="glass-panel no-print">
        <div style={styles.logoRow}>
          <div style={styles.logoCircle}>
            <Compass size={24} color="#fff" />
          </div>
          <span style={styles.logoText}>RoamAI</span>
          <span style={styles.logoVersion}>v1.0</span>
        </div>

        <div style={styles.navActions}>
          <button 
            onClick={() => setIsKeyDrawerOpen(true)} 
            style={{
              ...styles.navBtn,
              borderColor: apiKey ? 'var(--status-success)' : 'var(--status-warning)'
            }}
          >
            <Key size={16} color={apiKey ? 'var(--status-success)' : 'var(--status-warning)'} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {apiKey ? 'API Connected' : 'Configure Key'}
            </span>
          </button>

          <button onClick={toggleTheme} style={styles.iconBtn}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.dashboardGrid}>
          <div style={styles.sidebarCol} className="no-print">
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3>Parameters Wizard</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1rem' }}>
                Form wizard will be implemented here.
              </p>
            </div>
          </div>

          <div style={styles.contentCol}>
            <div style={styles.welcomeHero} className="glass-panel">
              <div style={styles.heroCircle}>
                <Sparkles size={48} color="var(--accent-primary)" />
              </div>
              <h1 style={styles.heroTitle}>Your AI Travel Companion</h1>
              <p style={{ ...styles.heroSubtitle, margin: 0 }}>
                Design a fully customized, day-by-day travel plan. Specify your destination, trip length, companion style, and interests.
              </p>
            </div>
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
    margin: '1rem 1rem 0 1rem',
    borderRadius: 'var(--radius-md) !important',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 10px rgba(16, 185, 129, 0.4)'
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
    backgroundColor: 'rgba(0,0,0,0.15)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
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
  welcomeHero: {
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  heroCircle: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
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
  }
};
