import React, { useState, useEffect } from 'react';
import { Calendar, Hotel, Coffee, DollarSign, ShieldAlert, Navigation, Sun, CloudRain, Download, Thermometer } from 'lucide-react';
import MapWidget from './MapWidget';

// Weather code interpreter for Open-Meteo
const getWeatherDetails = (code) => {
  if (code === 0) return { label: 'Clear Sky', emoji: '☀️' };
  if ([1, 2, 3].includes(code)) return { label: 'Partly Cloudy', emoji: '⛅' };
  if ([45, 48].includes(code)) return { label: 'Foggy', emoji: '🌫️' };
  if ([51, 53, 55].includes(code)) return { label: 'Drizzle', emoji: '🌦️' };
  if ([61, 63, 65].includes(code)) return { label: 'Rainy', emoji: '🌧️' };
  if ([71, 73, 75].includes(code)) return { label: 'Snowy', emoji: '❄️' };
  if ([80, 81, 82].includes(code)) return { label: 'Rain Showers', emoji: '🌦️' };
  if ([95, 96, 99].includes(code)) return { label: 'Thunderstorm', emoji: '⛈️' };
  return { label: 'Overcast', emoji: '☁️' };
};

export default function ItineraryView({ itinerary }) {
  const [activeTab, setActiveTab] = useState('schedule');
  const [activeDay, setActiveDay] = useState(1);
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const { lat, lng } = itinerary.coordinates || {};

  // Fetch real-time weather from Open-Meteo
  useEffect(() => {
    if (!lat || !lng) return;
    
    async function fetchWeather() {
      setLoadingWeather(true);
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
        );
        if (response.ok) {
          const data = await response.json();
          setWeather(data);
        }
      } catch (err) {
        console.error("Failed to fetch weather data:", err);
      } finally {
        setLoadingWeather(false);
      }
    }
    fetchWeather();
  }, [lat, lng]);

  // Extract all activity locations to display on map
  const allLocations = [];
  itinerary.days.forEach(day => {
    day.activities.forEach(act => {
      allLocations.push({
        ...act,
        dayNumber: day.dayNumber
      });
    });
  });

  // Add hotel accommodations to map locations
  itinerary.accommodations.forEach(hotel => {
    allLocations.push(hotel);
  });

  // Filter locations for active day view
  const currentDayLocations = allLocations.filter(loc => 
    loc.dayNumber === activeDay || loc.pricePerNight !== undefined
  );

  // Trigger PDF print export
  const handlePrint = () => {
    window.print();
  };

  // Compute total expenses
  const expenses = itinerary.budgetBreakdown;
  const totalCost = expenses.transportation + expenses.accommodation + expenses.dining + expenses.activities;

  return (
    <div className="animate-fade-in-up print-area">
      {/* Screen layout wrapper (hidden during printing) */}
      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Overview Card */}
        <div style={styles.overviewCard} className="glass-panel">
        <div style={styles.overviewMain}>
          <div>
            <span style={styles.badge}>Generated Itinerary</span>
            <h1 style={styles.title}>{itinerary.destination}</h1>
            <p style={styles.desc}>{itinerary.description}</p>
          </div>
          
          {/* Weather Widget */}
          <div style={styles.weatherWidget}>
            {loadingWeather ? (
              <div style={styles.weatherLoading}>
                <span className="loader-ring" style={{ width: 24, height: 24 }} />
              </div>
            ) : weather ? (
              <div style={styles.weatherInfo}>
                <div style={styles.weatherHeader}>
                  <span style={{ fontSize: '1.75rem' }}>
                    {getWeatherDetails(weather.current_weather.weathercode).emoji}
                  </span>
                  <div>
                    <div style={styles.temp}>{Math.round(weather.current_weather.temperature)}°C</div>
                    <div style={styles.weatherLabel}>
                      {getWeatherDetails(weather.current_weather.weathercode).label}
                    </div>
                  </div>
                </div>
                <div style={styles.forecast}>
                  {weather.daily.time.slice(0, 3).map((time, idx) => (
                    <div key={time} style={styles.forecastDay}>
                      <span style={{ fontSize: '0.8rem' }}>
                        {new Date(time).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span>{getWeatherDetails(weather.daily.weathercode[idx]).emoji}</span>
                      <span style={styles.forecastTemp}>
                        {Math.round(weather.daily.temperature_2m_max[idx])}°/
                        {Math.round(weather.daily.temperature_2m_min[idx])}°
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={styles.weatherError}>
                <Sun size={20} color="var(--text-muted)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weather Unavailable</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Row */}
        <div style={styles.actionRow} className="no-print">
          <div style={styles.stats}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Duration</span>
              <span style={styles.statVal}>{itinerary.days.length} Days</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Budget Level</span>
              <span style={styles.statVal}>{itinerary.accommodations[0]?.type || 'Standard'}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Currency</span>
              <span style={styles.statVal}>{itinerary.currencySymbol || '$'}</span>
            </div>
          </div>
          <button onClick={handlePrint} style={styles.printBtn} className="btn btn-secondary">
            <Download size={16} /> Export PDF / Print
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={styles.tabs} className="no-print">
        <button
          onClick={() => setActiveTab('schedule')}
          style={{
            ...styles.tabBtn,
            borderColor: activeTab === 'schedule' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'schedule' ? 'var(--accent-primary)' : 'var(--text-secondary)'
          }}
        >
          <Calendar size={16} /> Schedule
        </button>
        <button
          onClick={() => setActiveTab('stays')}
          style={{
            ...styles.tabBtn,
            borderColor: activeTab === 'stays' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'stays' ? 'var(--accent-primary)' : 'var(--text-secondary)'
          }}
        >
          <Hotel size={16} /> Recommended Stays
        </button>
        <button
          onClick={() => setActiveTab('food')}
          style={{
            ...styles.tabBtn,
            borderColor: activeTab === 'food' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'food' ? 'var(--accent-primary)' : 'var(--text-secondary)'
          }}
        >
          <Coffee size={16} /> Cuisine & Drinks
        </button>
        <button
          onClick={() => setActiveTab('budget')}
          style={{
            ...styles.tabBtn,
            borderColor: activeTab === 'budget' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'budget' ? 'var(--accent-primary)' : 'var(--text-secondary)'
          }}
        >
          <DollarSign size={16} /> Budget & Tips
        </button>
      </div>

      {/* Main Tab Panels */}
      <div style={styles.tabContent}>
        {/* Map Panel - Rendered on schedule tab for context */}
        {activeTab === 'schedule' && (
          <MapWidget
            center={itinerary.coordinates}
            locations={currentDayLocations}
          />
        )}

        {/* SCHEDULE TAB */}
        {activeTab === 'schedule' && (
          <div>
            {/* Days Selector */}
            <div style={styles.daysSelector} className="no-print">
              {itinerary.days.map(day => (
                <button
                  key={day.dayNumber}
                  onClick={() => setActiveDay(day.dayNumber)}
                  style={{
                    ...styles.dayBtn,
                    backgroundColor: activeDay === day.dayNumber ? 'var(--accent-primary)' : 'rgba(0, 0, 0, 0.1)',
                    color: activeDay === day.dayNumber ? '#fff' : 'var(--text-primary)',
                    borderColor: activeDay === day.dayNumber ? 'var(--accent-primary)' : 'var(--border-color)',
                  }}
                >
                  Day {day.dayNumber}
                </button>
              ))}
            </div>

            {/* Current Day Itinerary */}
            {itinerary.days.filter(d => d.dayNumber === activeDay).map(day => (
              <div key={day.dayNumber} className="animate-fade-in-up">
                <div style={styles.dayThemeHeader}>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Theme: {day.theme}</h3>
                </div>

                <div style={styles.timeline}>
                  {day.activities.map((act, index) => (
                    <div key={index} style={styles.timelineItem} className="glass-card">
                      <div style={styles.timelinePoint}>
                        <div style={styles.timelinePointInner} />
                      </div>
                      
                      <div style={styles.activityMeta}>
                        <span style={styles.activityTime}>{act.timeOfDay}</span>
                        <span style={styles.costBadge}>{act.costEstimate}</span>
                      </div>

                      <h4 style={styles.activityTitle}>{act.title}</h4>
                      <p style={styles.activityDesc}>{act.description}</p>
                      
                      <div style={styles.locationLink}>
                        <Navigation size={14} color="var(--accent-primary)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                          {act.locationName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RECOMMENDED STAYS TAB */}
        {activeTab === 'stays' && (
          <div style={styles.gridList} className="animate-fade-in-up">
            {itinerary.accommodations.map((hotel, idx) => (
              <div key={idx} style={styles.hotelCard} className="glass-card">
                <div style={styles.hotelHeader}>
                  <div>
                    <span style={styles.hotelType}>{hotel.type}</span>
                    <h3 style={styles.hotelName}>{hotel.name}</h3>
                  </div>
                  <div style={styles.hotelPrice}>
                    <span>{hotel.pricePerNight}</span>
                    <span style={styles.hotelPriceLabel}>/ night</span>
                  </div>
                </div>
                <p style={styles.hotelDesc}>{hotel.description}</p>
                <div style={styles.locationLink}>
                  <Navigation size={14} color="var(--accent-secondary)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)' }}>
                    Plot coordinate: ({hotel.coordinates.lat.toFixed(4)}, {hotel.coordinates.lng.toFixed(4)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CUISINE & DRINKS TAB */}
        {activeTab === 'food' && (
          <div style={styles.gridList} className="animate-fade-in-up">
            {itinerary.cuisines.map((food, idx) => (
              <div key={idx} style={styles.foodCard} className="glass-card">
                <div style={styles.foodHeader}>
                  <span style={{
                    ...styles.foodTypeBadge,
                    backgroundColor: food.type.toLowerCase() === 'drink' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: food.type.toLowerCase() === 'drink' ? 'var(--accent-secondary)' : 'var(--accent-tertiary)',
                  }}>
                    {food.type}
                  </span>
                  <h3 style={styles.foodName}>{food.name}</h3>
                </div>
                <p style={styles.foodDesc}>{food.description}</p>
                <div style={styles.foodTry}>
                  <strong style={{ color: 'var(--text-primary)' }}>Best Spot:</strong> {food.whereToTry}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EXPENSES & PRACTICAL TIPS TAB */}
        {activeTab === 'budget' && (
          <div style={styles.budgetLayout} className="animate-fade-in-up">
            {/* Budget Breakdown */}
            <div style={styles.budgetCard} className="glass-panel">
              <h3 style={styles.sectionHeading}>Trip Budget Allocation</h3>
              
              <div style={styles.chart}>
                <div style={styles.chartRow}>
                  <div style={styles.chartLabel}>✈️ Transport</div>
                  <div style={styles.barWrapper}>
                    <div style={{ ...styles.bar, width: `${(expenses.transportation / totalCost) * 100}%`, backgroundColor: 'var(--accent-secondary)' }} />
                    <span style={styles.barVal}>{itinerary.currencySymbol}{expenses.transportation.toLocaleString()}</span>
                  </div>
                </div>
                
                <div style={styles.chartRow}>
                  <div style={styles.chartLabel}>🏨 Lodging</div>
                  <div style={styles.barWrapper}>
                    <div style={{ ...styles.bar, width: `${(expenses.accommodation / totalCost) * 100}%`, backgroundColor: 'var(--accent-primary)' }} />
                    <span style={styles.barVal}>{itinerary.currencySymbol}{expenses.accommodation.toLocaleString()}</span>
                  </div>
                </div>
                
                <div style={styles.chartRow}>
                  <div style={styles.chartLabel}>🍜 Dining</div>
                  <div style={styles.barWrapper}>
                    <div style={{ ...styles.bar, width: `${(expenses.dining / totalCost) * 100}%`, backgroundColor: 'var(--accent-tertiary)' }} />
                    <span style={styles.barVal}>{itinerary.currencySymbol}{expenses.dining.toLocaleString()}</span>
                  </div>
                </div>
                
                <div style={styles.chartRow}>
                  <div style={styles.chartLabel}>🎟️ Activities</div>
                  <div style={styles.barWrapper}>
                    <div style={{ ...styles.bar, width: `${(expenses.activities / totalCost) * 100}%`, backgroundColor: '#ef4444' }} />
                    <span style={styles.barVal}>{itinerary.currencySymbol}{expenses.activities.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div style={styles.totalRow}>
                <span>Estimated Total:</span>
                <span style={styles.totalVal}>{itinerary.currencySymbol}{totalCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Practical Tips */}
            <div style={styles.tipsCard} className="glass-panel">
              <h3 style={styles.sectionHeading}>
                <ShieldAlert size={18} color="var(--accent-tertiary)" /> Local Rules & Tips
              </h3>
              <ul style={styles.tipsList}>
                {itinerary.practicalTips.map((tip, idx) => (
                  <li key={idx} style={styles.tipItem}>
                    <div style={styles.bullet} />
                    <span style={styles.tipText}>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* PRINT-ONLY LAYOUT (Hidden on browser screen, structured for export) */}
      <div className="print-only">
        <div className="print-header">
          <h1 className="print-title">✈️ TRAVEL PLANNER ITINERARY</h1>
          <h2 style={{ fontSize: '18px', margin: '5px 0 10px 0', color: '#334155' }}>Destination: {itinerary.destination}</h2>
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: 0 }}>{itinerary.description}</p>
          
          <div className="print-meta-grid">
            <div className="print-meta-item"><strong>Duration:</strong> {itinerary.days.length} Days</div>
            <div className="print-meta-item"><strong>Budget Tier:</strong> {itinerary.accommodations[0]?.type || 'Standard'}</div>
            <div className="print-meta-item"><strong>Currency:</strong> {itinerary.currencySymbol || '$'}</div>
          </div>
        </div>
        
        <div>
          <h2 style={{ fontSize: '16px', borderBottom: '1.5px solid #0f172a', paddingBottom: '5px', margin: '20px 0 15px 0', color: '#0f172a', fontWeight: 'bold' }}>🗓️ Day-by-Day Schedule</h2>
          {itinerary.days.map(day => (
            <div key={day.dayNumber} className="print-day">
              <div className="print-day-header">
                Day {day.dayNumber}: {day.theme}
              </div>
              <div className="print-timeline">
                {day.activities.map((act, index) => (
                  <div key={index} className="print-activity">
                    <div className="print-flex-row">
                      <span className="print-activity-title">{act.timeOfDay} - {act.title}</span>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{act.costEstimate}</span>
                    </div>
                    <p className="print-activity-desc">{act.description}</p>
                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600', marginTop: '2px' }}>
                      📍 {act.locationName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="print-section">
          <h2 style={{ fontSize: '16px', borderBottom: '1.5px solid #0f172a', paddingBottom: '5px', margin: '20px 0 15px 0', color: '#0f172a', fontWeight: 'bold' }}>🏨 Suggested Accommodations</h2>
          <div className="print-grid">
            {itinerary.accommodations.map((hotel, idx) => (
              <div key={idx} className="print-card">
                <div className="print-flex-row">
                  <span className="print-card-title">{hotel.name}</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#059669' }}>{hotel.pricePerNight}</span>
                </div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6366f1', fontWeight: 'bold', marginBottom: '5px', letterSpacing: '0.02em' }}>{hotel.type}</div>
                <p className="print-card-desc" style={{ margin: 0 }}>{hotel.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="print-section">
          <h2 style={{ fontSize: '16px', borderBottom: '1.5px solid #0f172a', paddingBottom: '5px', margin: '20px 0 15px 0', color: '#0f172a', fontWeight: 'bold' }}>🍜 Local Cuisine & Beverages</h2>
          <div className="print-grid">
            {itinerary.cuisines.map((food, idx) => (
              <div key={idx} className="print-card">
                <div className="print-flex-row">
                  <span className="print-card-title">{food.name}</span>
                  <span style={{ fontSize: '10px', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569', fontWeight: '600' }}>{food.type}</span>
                </div>
                <p className="print-card-desc">{food.description}</p>
                <div style={{ fontSize: '11px', color: '#334155', borderTop: '1px solid #f1f5f9', paddingTop: '6px', marginTop: '6px' }}>
                  <strong>Best Spot:</strong> {food.whereToTry}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="print-section" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={{ fontSize: '16px', borderBottom: '1.5px solid #0f172a', paddingBottom: '5px', margin: '20px 0 15px 0', color: '#0f172a', fontWeight: 'bold' }}>📊 Budget & Practical Tips</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div>
              <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#0f172a', fontWeight: 'bold' }}>Expense Estimates</h3>
              <div className="print-budget-row">
                <span>Transportation</span>
                <strong>{itinerary.currencySymbol}{expenses.transportation.toLocaleString()}</strong>
              </div>
              <div className="print-budget-row">
                <span>Accommodation</span>
                <strong>{itinerary.currencySymbol}{expenses.accommodation.toLocaleString()}</strong>
              </div>
              <div className="print-budget-row">
                <span>Dining</span>
                <strong>{itinerary.currencySymbol}{expenses.dining.toLocaleString()}</strong>
              </div>
              <div className="print-budget-row">
                <span>Activities</span>
                <strong>{itinerary.currencySymbol}{expenses.activities.toLocaleString()}</strong>
              </div>
              <div className="print-total-row">
                <span>Total Budget</span>
                <span>{itinerary.currencySymbol}{totalCost.toLocaleString()}</span>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#0f172a', fontWeight: 'bold' }}>Local Customs & Safety</h3>
              <ul style={{ paddingLeft: '15px', margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.6' }}>
                {itinerary.practicalTips.map((tip, idx) => (
                  <li key={idx} style={{ marginBottom: '8px' }}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  overviewCard: {
    padding: '2rem',
    borderRadius: 'var(--radius-lg)',
  },
  overviewMain: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '2rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  badge: {
    display: 'inline-block',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: 'var(--accent-primary)',
    fontWeight: '700',
    backgroundColor: 'var(--accent-light)',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    marginBottom: '0.5rem',
    letterSpacing: '0.05em'
  },
  title: {
    fontSize: '2.25rem',
    margin: '0 0 0.5rem 0',
    color: 'var(--text-primary)',
    lineHeight: '1.2'
  },
  desc: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    lineHeight: '1.6',
    maxWidth: '550px'
  },
  weatherWidget: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '1rem',
    minWidth: '240px',
  },
  weatherLoading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100px'
  },
  weatherInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  weatherHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  temp: {
    fontSize: '1.5rem',
    fontWeight: '800',
    lineHeight: 1,
    color: 'var(--text-primary)'
  },
  weatherLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)'
  },
  forecast: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '0.5rem',
    gap: '0.5rem'
  },
  forecastDay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '0.7rem',
    flex: 1
  },
  forecastTemp: {
    color: 'var(--text-secondary)',
    fontSize: '0.65rem'
  },
  weatherError: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100px',
    gap: '0.5rem'
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem',
    marginTop: '1.5rem',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  stats: {
    display: 'flex',
    gap: '1.5rem'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  statLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  statVal: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  printBtn: {
    backgroundColor: 'var(--bg-secondary)',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    gap: '1.5rem',
    overflowX: 'auto',
    paddingBottom: '2px'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    padding: '0.75rem 0.25rem',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-display)',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    '&:hover': {
      color: 'var(--text-primary)'
    }
  },
  tabContent: {
    marginTop: '0.5rem'
  },
  daysSelector: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem'
  },
  dayBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    border: '1px solid',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  dayThemeHeader: {
    padding: '0.5rem 0',
    marginBottom: '1.5rem',
    borderBottom: '1px dashed var(--border-color)'
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    position: 'relative',
    paddingLeft: '1.75rem',
    borderLeft: '2px solid var(--border-color)'
  },
  timelineItem: {
    position: 'relative',
    padding: '1.25rem',
  },
  timelinePoint: {
    position: 'absolute',
    left: '-2.25rem',
    top: '1.5rem',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-primary)',
    border: '2px solid var(--accent-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelinePointInner: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-primary)'
  },
  activityMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  activityTime: {
    fontSize: '0.75rem',
    color: 'var(--accent-primary)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  costBadge: {
    fontSize: '0.75rem',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-color)',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    color: 'var(--text-secondary)'
  },
  activityTitle: {
    fontSize: '1.15rem',
    color: 'var(--text-primary)',
    margin: '0 0 0.5rem 0'
  },
  activityDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '0.75rem'
  },
  locationLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  gridList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.25rem',
  },
  hotelCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '180px'
  },
  hotelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    gap: '1rem'
  },
  hotelType: {
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    color: 'var(--accent-secondary)',
    fontWeight: '700',
    letterSpacing: '0.05em'
  },
  hotelName: {
    fontSize: '1.15rem',
    color: 'var(--text-primary)',
    margin: '0.15rem 0 0 0'
  },
  hotelPrice: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    fontSize: '1.15rem',
    fontWeight: '700',
    color: 'var(--accent-primary)'
  },
  hotelPriceLabel: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    fontWeight: '400'
  },
  hotelDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '1rem',
    flex: 1
  },
  foodCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '180px'
  },
  foodHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    marginBottom: '0.75rem'
  },
  foodTypeBadge: {
    alignSelf: 'flex-start',
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    letterSpacing: '0.05em'
  },
  foodName: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    margin: 0
  },
  foodDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '1rem',
    flex: 1
  },
  foodTry: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '0.75rem'
  },
  budgetLayout: {
    display: 'grid',
    gridTemplateColumns: '3fr 2fr',
    gap: '1.5rem',
  },
  budgetCard: {
    padding: '1.5rem'
  },
  sectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.15rem',
    marginBottom: '1.5rem',
    color: 'var(--text-primary)'
  },
  chart: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  chartRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  chartLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  barWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  bar: {
    height: '10px',
    borderRadius: '5px',
    minWidth: '4px',
    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  barVal: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '2rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem',
    fontSize: '1.15rem',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  totalVal: {
    color: 'var(--accent-primary)',
    fontSize: '1.35rem'
  },
  tipsCard: {
    padding: '1.5rem'
  },
  tipsList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  tipItem: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start'
  },
  bullet: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-tertiary)',
    marginTop: '0.5rem',
    flexShrink: 0
  },
  tipText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5'
  }
};

// Insert a print styles stylesheet dynamically to handle hides and layouts during print triggering
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .print-only {
      display: none;
    }
    @media print {
      /* Reset all parent grid/flex containers to block layout for full printable width */
      body, html, #root, main, main > div, .print-area {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        background: transparent !important;
      }
      
      body {
        background: white !important;
        color: #1e293b !important;
        font-family: 'Plus Jakarta Sans', sans-serif !important;
        padding: 20px !important;
      }
      .no-print, header, .no-print *, .leaflet-container {
        display: none !important;
      }
      .print-area {
        display: block !important;
        width: 100% !important;
      }
      .print-only {
        display: block !important;
        width: 100% !important;
      }
      .print-header {
        border-bottom: 2px solid #0f172a;
        padding-bottom: 15px;
        margin-bottom: 25px;
      }
      .print-title {
        font-size: 26px !important;
        font-family: 'Outfit', sans-serif !important;
        color: #0f172a !important;
        margin: 0 0 5px 0 !important;
        font-weight: 800 !important;
      }
      .print-meta-grid {
        display: flex;
        gap: 30px;
        margin-top: 15px;
        font-size: 13px;
        color: #475569;
      }
      .print-meta-item strong {
        color: #0f172a;
      }
      .print-section {
        margin-top: 30px;
        page-break-before: always;
      }
      .print-day {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        page-break-inside: avoid;
      }
      .print-day-header {
        border-bottom: 1px dashed #cbd5e1;
        padding-bottom: 6px;
        margin-bottom: 12px;
        font-size: 15px;
        font-weight: bold;
        color: #0f172a;
      }
      .print-timeline {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .print-activity {
        padding-left: 12px;
        border-left: 3px solid #10b981;
      }
      .print-activity-title {
        font-size: 13px;
        font-weight: bold;
        color: #0f172a;
      }
      .print-activity-desc {
        font-size: 11.5px;
        color: #475569;
        margin: 3px 0;
        line-height: 1.4;
      }
      .print-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }
      .print-card {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px;
        page-break-inside: avoid;
        background: #f8fafc;
      }
      .print-card-title {
        font-size: 13px;
        font-weight: bold;
        color: #0f172a;
      }
      .print-card-desc {
        font-size: 11px;
        color: #475569;
        line-height: 1.4;
      }
      .print-flex-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 3px;
      }
      .print-budget-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid #f1f5f9;
        font-size: 12.5px;
        color: #475569;
      }
      .print-total-row {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        font-size: 15px;
        margin-top: 15px;
        padding-top: 10px;
        border-top: 2px solid #0f172a;
        color: #0f172a;
      }
    }
  `;
  document.head.appendChild(styleEl);
}
