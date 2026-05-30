import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, Trash2, ExternalLink, ShieldCheck, X } from 'lucide-react';

export default function KeySettings({ isOpen, onClose, onSaveKey, currentKey }) {
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (currentKey) {
      setKeyInput(currentKey);
    } else {
      setKeyInput('');
    }
    setStatusMsg({ type: '', text: '' });
  }, [currentKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const cleanKey = keyInput.trim();
    if (!cleanKey) {
      setStatusMsg({ type: 'error', text: 'API Key cannot be empty.' });
      return;
    }

    if (!cleanKey.startsWith('AIzaSy')) {
      setStatusMsg({ 
        type: 'warning', 
        text: 'This key might be invalid (Gemini keys usually start with "AIzaSy"). But we will save it anyway.' 
      });
    } else {
      setStatusMsg({ type: 'success', text: 'API Key saved successfully!' });
    }

    onSaveKey(cleanKey);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    onSaveKey('');
    setKeyInput('');
    setStatusMsg({ type: 'info', text: 'API Key cleared.' });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.drawer} className="glass-panel animate-fade-in-up">
        <div style={styles.header}>
          <div style={styles.titleContainer}>
            <Key size={20} color="var(--accent-primary)" />
            <h3 style={{ margin: 0 }}>Gemini API Settings</h3>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          <p style={styles.infoText}>
            This application uses the <strong>Google Gemini API</strong> to generate travel itineraries. Your API key is stored safely in your browser's local storage (client-side only) and is never sent to any external server except Google.
          </p>

          <form onSubmit={handleSave} style={styles.form}>
            <div style={styles.inputWrapper}>
              <label style={styles.label}>Gemini API Key</label>
              <div style={styles.inputContainer}>
                <input
                  type={showKey ? 'text' : 'password'}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Paste your AIzaSy... API key here"
                  style={styles.input}
                />
                <button
                  type="button"
                  style={styles.eyeBtn}
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {statusMsg.text && (
              <div style={{
                ...styles.status,
                backgroundColor: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' :
                                 statusMsg.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' :
                                 statusMsg.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                color: statusMsg.type === 'success' ? 'var(--status-success)' :
                       statusMsg.type === 'warning' ? 'var(--status-warning)' :
                       statusMsg.type === 'error' ? 'var(--status-danger)' : 'var(--status-info)',
                borderColor: statusMsg.type === 'success' ? 'var(--status-success)' :
                             statusMsg.type === 'warning' ? 'var(--status-warning)' :
                             statusMsg.type === 'error' ? 'var(--status-danger)' : 'var(--status-info)',
              }}>
                {statusMsg.text}
              </div>
            )}

            <div style={styles.actions}>
              {currentKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  style={styles.clearBtn}
                  className="btn"
                >
                  <Trash2 size={16} />
                  Clear Key
                </button>
              )}
              <button
                type="submit"
                style={styles.saveBtn}
                className="btn btn-primary"
              >
                <Save size={16} />
                Save Settings
              </button>
            </div>
          </form>

          <div style={styles.footer}>
            <h4 style={styles.footerTitle}>Don't have a Gemini API key?</h4>
            <p style={styles.footerText}>
              Get a free developer API key from Google AI Studio in less than a minute.
            </p>
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
            >
              Get Gemini Key in Google AI Studio
              <ExternalLink size={14} />
            </a>
            
            <div style={styles.badgeContainer}>
              <ShieldCheck size={16} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Secure Local Integration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem'
  },
  drawer: {
    width: '100%',
    maxWidth: '480px',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-xl)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
    background: 'rgba(0, 0, 0, 0.1)',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'var(--border-color)',
      color: 'var(--text-primary)'
    }
  },
  body: {
    padding: '1.5rem',
  },
  infoText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    marginBottom: '2rem',
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    paddingRight: '2.75rem',
  },
  eyeBtn: {
    position: 'absolute',
    right: '0.75rem',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
  },
  status: {
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid',
    fontSize: '0.85rem',
    lineHeight: '1.4',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
  },
  clearBtn: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--status-danger)',
    flex: '1',
    '&:hover': {
      backgroundColor: 'rgba(239, 68, 68, 0.05)',
      borderColor: 'var(--status-danger)'
    }
  },
  saveBtn: {
    flex: '2',
  },
  footer: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.5rem',
    marginTop: '1.5rem',
  },
  footerTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  footerText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.75rem',
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: 'var(--accent-primary)',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '600',
    transition: 'opacity 0.2s',
    '&:hover': {
      textDecoration: 'underline',
      opacity: '0.9'
    }
  },
  badgeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1.25rem',
    justifyContent: 'center',
  }
};
