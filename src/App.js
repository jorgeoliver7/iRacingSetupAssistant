import React, { useEffect, useState, createContext, useContext, useCallback } from "react";
import "./App.css";
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

// Configuración de la API
const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? 'https://i-racing-setup-assistant.vercel.app' : 'http://localhost:3001');

// Context para autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

// Componente de autenticación
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Verificar token válido
      fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      });
    }
  }, [token]);

  const login = async (username, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      return true;
    }
    return false;
  };

  const register = async (username, email, password) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Componente de Login/Register
const AuthModal = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      let success;
      if (mode === 'login') {
        success = await login(username, password);
      } else {
        success = await register(username, email, password);
      }
      
      if (success) {
        onClose();
        setUsername('');
        setEmail('');
        setPassword('');
      } else {
        setError(t('credentialsError'));
      }
    } catch (err) {
      setError(t('connectionError'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{mode === 'login' ? t('loginTitle') : t('registerTitle')}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t('username')}
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          {mode === 'register' && (
            <input
              type="email"
              placeholder={t('email')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          )}
          <input
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="error">{error}</div>}
          <button type="submit">
            {mode === 'login' ? t('login') : t('register')}
          </button>
        </form>
        <p>
          {mode === 'login' ? t('noAccount') : t('hasAccount')}
          <button type="button" onClick={onSwitchMode}>
            {mode === 'login' ? t('register') : t('login')}
          </button>
        </p>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

// Componente principal de la aplicación
function AppContent() {
  const [cars, setCars] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [setups, setSetups] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  // Debug info removed
  const [currentView, setCurrentView] = useState('search'); // search, favorites, generator, compare
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  // Estados para búsqueda avanzada
  const [searchFilters, setSearchFilters] = useState({
    car_id: '',
    track_id: '',
    session_type: '',
    car_category: '',
    track_type: '',
    min_rating: '',
    search_term: ''
  });
  
  // Estados para comparador
  const [selectedSetups, setSelectedSetups] = useState([]);
  
  // Estados para generador
  const [generatorParams, setGeneratorParams] = useState({
    car_id: '',
    track_id: '',
    session_type: 'Race',
    setupStyle: 'balanced',
    conditions: {
      temperature: 25,
      weather: 'clear'
    }
  });
  
  const { user, token, logout } = useAuth();
  const { t, language, changeLanguage } = useLanguage();

  const searchSetups = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/setups?${params}`);
      const data = await response.json();
      setSetups(data.setups || []);
    } catch (err) {
      console.error('Error searching setups:', err);
    }
  }, [searchFilters]);

  const loadFavorites = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  }, [token]);

  // Cargar datos iniciales (cars y tracks)
  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true);
        console.log('API_URL:', API_URL);
        
        // Cargar coches
        const carsResponse = await fetch('/api/generator/cars');
        if (carsResponse.ok) {
          const carsData = await carsResponse.json();
          setCars(carsData);
        }
        
        // Cargar circuitos
        const tracksResponse = await fetch('/api/generator/tracks');
        if (tracksResponse.ok) {
          const tracksData = await tracksResponse.json();
          setTracks(tracksData);
        }
        
        setDataLoading(false);
        
      } catch (err) {
        console.error('Error loading data:', err);
        setDataLoading(false);
      }
    };
    
    loadData();
  }, []); // Sin dependencias para evitar re-renders
  
  // Cargar setups iniciales
  useEffect(() => {
    searchSetups();
  }, [searchSetups]);
  
  // Debug monitoring removed

  useEffect(() => {
    if (user && token) {
      loadFavorites();
    }
  }, [user, token, loadFavorites]);

  const toggleFavorite = async (setupId) => {
    if (!token) {
      setAuthModalOpen(true);
      return;
    }
    
    try {
      const isFavorited = favorites.some(f => f.setup_id === setupId);
      const method = isFavorited ? 'DELETE' : 'POST';
      
      await fetch(`/api/favorites/${setupId}`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      loadFavorites();
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const generateSetup = async () => {
    // Debug: Log current generator params
    console.log('Current generatorParams:', generatorParams);
    console.log('generatorParams.car_id:', generatorParams.car_id);
    console.log('generatorParams.track_id:', generatorParams.track_id);
    console.log('Type of car_id:', typeof generatorParams.car_id);
    console.log('Type of track_id:', typeof generatorParams.track_id);
    
    // Transform parameters to match backend expectations
    const requestParams = {
      car_id: generatorParams.car_id,
      track_id: generatorParams.track_id,
      session_type: generatorParams.session_type,
      setup_style: generatorParams.setupStyle,
      weather_conditions: generatorParams.conditions
    };
    
    // Debug: Log request params being sent
    console.log('Request params being sent:', requestParams);
    console.log('requestParams.car_id:', requestParams.car_id);
    console.log('requestParams.track_id:', requestParams.track_id);
    
    // Validate required params before sending
    if (!requestParams.car_id || !requestParams.track_id) {
      console.error('Missing required parameters:', {
        car_id: requestParams.car_id,
        track_id: requestParams.track_id
      });
      alert('Por favor selecciona un coche y un circuito antes de generar el setup.');
      return;
    }
    
    try {
      const response = await fetch('/api/generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestParams)
      });
      
      const data = await response.json();
      
      // Debug: Log response
      console.log('Response from server:', data);
      
      if (data.setup) {
        // Get car and track info from response
        const carName = data.car?.name || 'Unknown Car';
        const trackName = data.track?.name || 'Unknown Track';
        
        // Asegurar que los datos del coche y circuito estén en los arrays
        if (!cars.find(c => c.id === requestParams.car_id)) {
          setCars(prevCars => [...prevCars, { id: requestParams.car_id, name: carName }]);
        }
        if (!tracks.find(t => t.id === requestParams.track_id)) {
          setTracks(prevTracks => [...prevTracks, { id: requestParams.track_id, name: trackName }]);
        }
        
        // Create a setup object compatible with the UI
        const generatedSetup = {
          id: 'generated_' + Date.now(),
          car_id: requestParams.car_id,
          track_id: requestParams.track_id,
          session_type: requestParams.session_type,
          setup_name: `${t('generatedSetup')} - ${carName} ${t('at')} ${trackName}`,
          data: data.setup,
          metadata: {
            ...data.metadata,
            setupStyle: requestParams.setup_style,
            car_name: carName,
            track_name: trackName
          },
          average_rating: null,
          download_count: 0,
          is_generated: true
        };
        setSetups([generatedSetup]);
        setCurrentView('search');
      }
    } catch (err) {
      console.error('Error generating setup:', err);
    }
  };

  const exportSetup = (setup) => {
    const car = cars.find(c => c.id === setup.car_id);
    const track = tracks.find(t => t.id === setup.track_id);
    
    // Export setup data
    
    // Generate iRacing-compatible setup instructions
    const setupInstructions = generateIRacingSetupInstructions(setup, car, track);
    
    const blob = new Blob([setupInstructions], {
      type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Crear nombre del archivo con formato correcto
    const carName = car?.name || 'Unknown_Car';
    const trackName = track?.name || 'Unknown_Track';
    const sessionText = setup.session_type || 'Unknown';
    const styleText = setup.is_generated && setup.metadata?.setupStyle ? 
      `_${setup.metadata.setupStyle}` : '';
    
    // Limpiar nombres para el archivo (reemplazar caracteres especiales)
    const cleanCarName = carName.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanTrackName = trackName.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanSessionText = sessionText.replace(/[^a-zA-Z0-9]/g, '_');
    
    const fileName = `${cleanCarName}_${cleanTrackName}_${cleanSessionText}${styleText}_setup.txt`;
    
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateIRacingSetupInstructions = (setup, car, track) => {
    const data = setup.data;
    let instructions = `${t('setupForIracing')}\n\n`;
    instructions += `${t('car')}: ${car?.name || 'N/A'}\n`;
    instructions += `${t('track')}: ${track?.name || 'N/A'}\n`;
    instructions += `${t('session')}: ${setup.session_type}\n`;
    
    if (setup.is_generated && setup.metadata) {
      const styleText = setup.metadata.setupStyle === 'safe' ? t('safe') : 
                       setup.metadata.setupStyle === 'balanced' ? t('balanced') : t('aggressive');
      instructions += `${t('style')}: ${styleText}\n`;
    }
    
    instructions += `${t('generatedAt')}: ${new Date().toLocaleString(language === 'es' ? 'es-ES' : 'en-US')}\n\n`;
    
    instructions += `${t('applicationInstructions')}\n\n`;
    instructions += `${t('openIracing')}\n`;
    instructions += `${t('selectCarInstruction')}: ${car?.name}\n`;
    instructions += `${t('applyValues')}:\n\n`;
    
    // Suspension settings
    if (data.suspension) {
      instructions += `${t('suspension')}:\n`;
      if (data.suspension.front) {
        instructions += `   ${t('front')}:\n`;
        if (data.suspension.front.spring) instructions += `     - ${t('spring')}: ${data.suspension.front.spring}\n`;
        if (data.suspension.front.damper) {
          if (typeof data.suspension.front.damper === 'object') {
            if (data.suspension.front.damper.bump) instructions += `     - ${t('damper')} Bump: ${data.suspension.front.damper.bump}\n`;
            if (data.suspension.front.damper.rebound) instructions += `     - ${t('damper')} Rebound: ${data.suspension.front.damper.rebound}\n`;
          } else {
            instructions += `     - ${t('damper')}: ${data.suspension.front.damper}\n`;
          }
        }
        if (data.suspension.front.antiRollBar) instructions += `     - ${t('antiRollBar')}: ${data.suspension.front.antiRollBar}\n`;
        if (data.suspension.front.rideHeight) instructions += `     - ${t('height')}: ${data.suspension.front.rideHeight}mm\n`;
        if (data.suspension.front.camber) instructions += `     - Camber: ${data.suspension.front.camber}°\n`;
        if (data.suspension.front.caster) instructions += `     - Caster: ${data.suspension.front.caster}°\n`;
        if (data.suspension.front.toe) instructions += `     - Toe: ${data.suspension.front.toe}°\n`;
      }
      if (data.suspension.rear) {
        instructions += `   ${t('rear')}:\n`;
        if (data.suspension.rear.spring) instructions += `     - ${t('spring')}: ${data.suspension.rear.spring}\n`;
        if (data.suspension.rear.damper) {
          if (typeof data.suspension.rear.damper === 'object') {
            if (data.suspension.rear.damper.bump) instructions += `     - ${t('damper')} Bump: ${data.suspension.rear.damper.bump}\n`;
            if (data.suspension.rear.damper.rebound) instructions += `     - ${t('damper')} Rebound: ${data.suspension.rear.damper.rebound}\n`;
          } else {
            instructions += `     - ${t('damper')}: ${data.suspension.rear.damper}\n`;
          }
        }
        if (data.suspension.rear.antiRollBar) instructions += `     - ${t('antiRollBar')}: ${data.suspension.rear.antiRollBar}\n`;
        if (data.suspension.rear.rideHeight) instructions += `     - ${t('height')}: ${data.suspension.rear.rideHeight}mm\n`;
        if (data.suspension.rear.camber) instructions += `     - Camber: ${data.suspension.rear.camber}°\n`;
        if (data.suspension.rear.toe) instructions += `     - Toe: ${data.suspension.rear.toe}°\n`;
      }
      instructions += `\n`;
    }
    
    // Aerodynamics
    if (data.aerodynamics) {
      instructions += `${t('aerodynamics')}:\n`;
      if (data.aerodynamics.front) instructions += `   - ${t('front')}: ${data.aerodynamics.front}\n`;
      if (data.aerodynamics.rear) instructions += `   - ${t('rear')}: ${data.aerodynamics.rear}\n`;
      if (data.aerodynamics.frontWing) instructions += `   - ${t('frontWing')}: ${data.aerodynamics.frontWing}\n`;
      if (data.aerodynamics.rearWing) instructions += `   - ${t('rearWing')}: ${data.aerodynamics.rearWing}\n`;
      if (data.aerodynamics.frontSplitter) instructions += `   - ${t('frontSplitter')}: ${data.aerodynamics.frontSplitter}\n`;
      instructions += `\n`;
    }
    
    // Differential
    if (data.differential) {
      instructions += `${t('differential')}:\n`;
      if (data.differential.preload) instructions += `   - ${t('preload')}: ${data.differential.preload}\n`;
      if (data.differential.power) instructions += `   - ${t('power')}: ${data.differential.power}\n`;
      if (data.differential.coast) instructions += `   - ${t('coast')}: ${data.differential.coast}\n`;
      if (data.differential.entry) instructions += `   - Entry: ${data.differential.entry}\n`;
      if (data.differential.middle) instructions += `   - Middle: ${data.differential.middle}\n`;
      if (data.differential.exit) instructions += `   - Exit: ${data.differential.exit}\n`;
      instructions += `\n`;
    }
    
    // Brakes
    if (data.brakes) {
      instructions += `${t('brakes')}:\n`;
      if (data.brakes.balance) instructions += `   - ${t('balance')}: ${data.brakes.balance}%\n`;
      if (data.brakes.pressure) instructions += `   - ${t('pressure')}: ${data.brakes.pressure}%\n`;
      if (data.brakes.brakeDucts) {
        if (data.brakes.brakeDucts.front) instructions += `   - Front Brake Ducts: ${data.brakes.brakeDucts.front}\n`;
        if (data.brakes.brakeDucts.rear) instructions += `   - Rear Brake Ducts: ${data.brakes.brakeDucts.rear}\n`;
      }
      instructions += `\n`;
    }
    
    // Tires
    if (data.tires) {
      instructions += `${t('tires')}:\n`;
      if (data.tires.pressure) {
        instructions += `   ${t('tirePressurePsi')}:\n`;
        if (data.tires.pressure.fl) instructions += `     - ${t('frontLeft')}: ${data.tires.pressure.fl}\n`;
        if (data.tires.pressure.fr) instructions += `     - ${t('frontRight')}: ${data.tires.pressure.fr}\n`;
        if (data.tires.pressure.rl) instructions += `     - ${t('rearLeft')}: ${data.tires.pressure.rl}\n`;
        if (data.tires.pressure.rr) instructions += `     - ${t('rearRight')}: ${data.tires.pressure.rr}\n`;
        if (data.tires.pressure.front && !data.tires.pressure.fl) instructions += `     - ${t('frontPressure')}: ${data.tires.pressure.front}\n`;
        if (data.tires.pressure.rear && !data.tires.pressure.rl) instructions += `     - ${t('rearPressure')}: ${data.tires.pressure.rear}\n`;
        if (data.tires.pressure.frontLeft) instructions += `     - Front Left: ${data.tires.pressure.frontLeft} psi\n`;
        if (data.tires.pressure.frontRight) instructions += `     - Front Right: ${data.tires.pressure.frontRight} psi\n`;
        if (data.tires.pressure.rearLeft) instructions += `     - Rear Left: ${data.tires.pressure.rearLeft} psi\n`;
        if (data.tires.pressure.rearRight) instructions += `     - Rear Right: ${data.tires.pressure.rearRight} psi\n`;
      }
      if (data.tires.compound) instructions += `   - ${t('compound')}: ${data.tires.compound}\n`;
      if (data.tires.temperature) {
        instructions += `   - Temperature Settings:\n`;
        if (data.tires.temperature.front) instructions += `     - Front: ${data.tires.temperature.front}°F\n`;
        if (data.tires.temperature.rear) instructions += `     - Rear: ${data.tires.temperature.rear}°F\n`;
      }
      instructions += `\n`;
    }
    
    // Gearing
    if (data.gearing) {
      instructions += `${t('transmission')}:\n`;
      if (data.gearing.final) instructions += `   - ${t('finalRatio')}: ${data.gearing.final}\n`;
      if (data.gearing.ratios) {
        instructions += `   - ${t('gears')}:\n`;
        Object.entries(data.gearing.ratios).forEach(([gear, ratio]) => {
          instructions += `     ${gear}: ${ratio}\n`;
        });
      }
      if (data.gearing.differential) instructions += `   - Differential: ${data.gearing.differential}\n`;
      if (data.gearing.clutch) instructions += `   - Clutch: ${data.gearing.clutch}\n`;
      instructions += `\n`;
    }
    
    // Fuel settings
    if (data.fuel) {
      instructions += `Fuel:\n`;
      if (data.fuel.amount) instructions += `   - Amount: ${data.fuel.amount} L\n`;
      if (data.fuel.strategy) instructions += `   - Strategy: ${data.fuel.strategy}\n`;
      instructions += `\n`;
    }
    
    instructions += `${t('importantNotes')}\n\n`;
    instructions += `${t('optimizedStartingPoint')}\n`;
    instructions += `${t('adjustToStyle')}\n`;
    instructions += `${t('practiceFirst')}\n`;
    instructions += `${t('fineAdjustments')}\n\n`;
    
    if (setup.is_generated && setup.metadata?.setupStyle) {
      const style = setup.metadata.setupStyle;
      instructions += `${t('styleCharacteristics')} ${style.toUpperCase()} ===\n\n`;
      
      if (style === 'safe') {
        instructions += `${t('safeConfigFile')}\n`;
        instructions += `${t('safeFeature1')}\n`;
        instructions += `${t('safeFeature2')}\n`;
        instructions += `${t('safeFeature3')}\n`;
        instructions += `${t('safeFeature4')}\n`;
      } else if (style === 'balanced') {
        instructions += `${t('balancedConfigFile')}\n`;
        instructions += `${t('balancedFeature1')}\n`;
        instructions += `${t('balancedFeature2')}\n`;
        instructions += `${t('balancedFeature3')}\n`;
        instructions += `${t('balancedFeature4')}\n`;
      } else if (style === 'aggressive') {
        instructions += `${t('aggressiveConfigFile')}\n`;
        instructions += `${t('aggressiveFeature1')}\n`;
        instructions += `${t('aggressiveFeature2')}\n`;
        instructions += `${t('aggressiveFeature3')}\n`;
        instructions += `${t('aggressiveFeature4')}\n`;
      }
      instructions += `\n`;
    }
    
    instructions += `${t('generatedBy')}\n`;
    instructions += `${t('visitRepo')}\n`;
    
    return instructions;
  };

  return (
        <div className="App">
          <header className="app-header">
            <div className="header-content">
              <h1>iRacing Setup Assistant</h1>
              <nav className="main-nav">
                <button 
                  className={currentView === 'search' ? 'active' : ''}
                  onClick={() => setCurrentView('search')}
                >
                  🔍 {t('searchSetups')}
                </button>
                <button 
                  className={currentView === 'generator' ? 'active' : ''}
                  onClick={() => setCurrentView('generator')}
                >
                  ⚙️ {t('generator')}
                </button>
                {user && (
                  <>
                    <button 
                      className={currentView === 'favorites' ? 'active' : ''}
                      onClick={() => setCurrentView('favorites')}
                    >
                      ❤️ {t('favorites')}
                    </button>
                    <button 
                      className={currentView === 'compare' ? 'active' : ''}
                      onClick={() => setCurrentView('compare')}
                    >
                      📊 {t('compare')}
                    </button>
                  </>
                )}
              </nav>
              <div className="user-section">
                <div className="language-selector">
                  <select 
                    value={language} 
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="language-select"
                  >
                    <option value="es">🇪🇸 Español</option>
                    <option value="en">🇺🇸 English</option>
                  </select>
                </div>
                {user ? (
                  <div className="user-info">
                    <span>👤 {user.username}</span>
                    <button onClick={logout}>{t('logout')}</button>
                  </div>
                ) : (
                  <button onClick={() => setAuthModalOpen(true)}>{t('login')}</button>
                )}
              </div>
            </div>
          </header>

      <main className="main-content">
        {currentView === 'search' && (
          <div className="search-section">
            <div className="search-filters">
              <h2>🔍 {t('searchSetups')}</h2>
              <div className="filter-grid">
                <select 
                  value={searchFilters.car_id}
                  onChange={e => setSearchFilters({...searchFilters, car_id: e.target.value})}
                >
                  <option value="">{t('allCars')}</option>
                  {cars.map(car => (
                    <option key={car.id} value={car.id}>{car.name}</option>
                  ))}
                </select>
                
                <select 
                  value={searchFilters.track_id}
                  onChange={e => setSearchFilters({...searchFilters, track_id: e.target.value})}
                >
                  <option value="">{t('allTracks')}</option>
                  {tracks.map(track => (
                    <option key={track.id} value={track.id}>{track.name}</option>
                  ))}
                </select>
                
                <select 
                  value={searchFilters.session_type}
                  onChange={e => setSearchFilters({...searchFilters, session_type: e.target.value})}
                >
                  <option value="">{t('sessionType')}</option>
                  <option value="Qualifying">{t('qualifying')}</option>
                  <option value="Race">{t('race')}</option>
                  <option value="Rain">{t('rain')}</option>
                  <option value="Endurance">{t('endurance')}</option>
                </select>
                
                <input 
                  type="text"
                  placeholder={t('searchByName')}
                  value={searchFilters.search_term}
                  onChange={e => setSearchFilters({...searchFilters, search_term: e.target.value})}
                />
                
                <button onClick={searchSetups} className="search-button">
                  {t('search')}
                </button>
              </div>
            </div>
            
            <div className="setups-grid">
              {setups.map(setup => (
                <div key={setup.id} className={`setup-card ${setup.is_generated ? 'generated-setup' : ''}`}>
                  <div className="setup-header">
                    <div className="setup-title">
                      <h3>{cars.find(c => c.id === setup.car_id)?.name}</h3>
                    </div>
                    <div className="setup-actions">
                      <button 
                        onClick={() => exportSetup(setup)}
                        className="export-button"
                      >
                        📥 {t('download')}
                      </button>
                      {user && (
                        <>
                          <button 
                            onClick={() => toggleFavorite(setup.id)}
                            className={`favorite-button ${favorites.some(f => f.setup_id === setup.id) ? 'favorited' : ''}`}
                          >
                            {favorites.some(f => f.setup_id === setup.id) ? `❤️ ${t('favorite')}` : `🤍 ${t('addFavorite')}`}
                          </button>
                          <button 
                            onClick={() => {
                              if (selectedSetups.includes(setup.id)) {
                                setSelectedSetups(selectedSetups.filter(id => id !== setup.id));
                              } else if (selectedSetups.length < 3) {
                                setSelectedSetups([...selectedSetups, setup.id]);
                              }
                            }}
                            className={`compare-button ${selectedSetups.includes(setup.id) ? 'selected' : ''}`}
                            disabled={!selectedSetups.includes(setup.id) && selectedSetups.length >= 3}
                          >
                            {selectedSetups.includes(setup.id) ? `✅ ${t('selected')}` : `📊 ${t('compare')}`}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="setup-info">
                    <div className="car-track-info">
                      <p><strong>{t('car')}:</strong> {cars.find(c => c.id === setup.car_id)?.name}</p>
                      <p><strong>{t('track')}:</strong> {tracks.find(t => t.id === setup.track_id)?.name}</p>
                    </div>
                    <p><strong>{t('session')}:</strong> {setup.session_type}</p>
                    
                    {setup.is_generated && setup.metadata && (
                      <div className="generated-info">
                        <p><strong>{t('style')}:</strong> 
                          {setup.metadata.setupStyle === 'safe' && t('safe')}
                          {setup.metadata.setupStyle === 'balanced' && t('balanced')}
                          {setup.metadata.setupStyle === 'aggressive' && t('aggressive')}
                        </p>
                        <p><strong>{t('generated')}:</strong> {new Date(setup.metadata.generatedAt).toLocaleString(language === 'es' ? 'es-ES' : 'en-US')}</p>
                      </div>
                    )}
                    
                    {!setup.is_generated && (
                      <>
                        <p><strong>{t('rating')}:</strong> ⭐ {setup.average_rating || 'N/A'}</p>
                        <p><strong>{t('downloads')}:</strong> {setup.download_count || 0}</p>
                      </>
                    )}
                  </div>
                   
                   {setup.is_generated && setup.data && (
                     <div className="technical-details">
                       <button 
                         className="toggle-details-btn"
                         onClick={() => {
                           const detailsDiv = document.getElementById(`details-${setup.id}`);
                           const isVisible = detailsDiv.style.display !== 'none';
                           detailsDiv.style.display = isVisible ? 'none' : 'block';
                           const btn = document.querySelector(`[data-setup-id="${setup.id}"]`);
                           btn.textContent = isVisible ? `🔧 ${t('technicalDetails')}` : `🔧 ${t('hideTechnicalDetails')}`;
                         }}
                         data-setup-id={setup.id}
                       >
                         🔧 {t('technicalDetails')}
                       </button>
                       
                       <div id={`details-${setup.id}`} className="setup-technical-details" style={{display: 'none'}}>
                         <h4>📊 {t('completeTechnicalConfig')}</h4>
                         
                         {setup.data.suspension && (
                           <div className="tech-section">
                             <h5>🏎️ {t('suspension')}</h5>
                             <div className="tech-grid">
                               {setup.data.suspension.front && (
                                 <div className="tech-item">
                                   <strong>{t('front')}:</strong>
                                   <p>{t('spring')}: {setup.data.suspension.front.spring}</p>
                                   <p>{t('damper')}: {
                                     typeof setup.data.suspension.front.damper === 'object' 
                                       ? `Bump: ${setup.data.suspension.front.damper.bump || 'N/A'}, Rebound: ${setup.data.suspension.front.damper.rebound || 'N/A'}`
                                       : setup.data.suspension.front.damper
                                   }</p>
                                   <p>{t('antiRollBar')}: {setup.data.suspension.front.antiRollBar}</p>
                                 </div>
                               )}
                               {setup.data.suspension.rear && (
                                 <div className="tech-item">
                                   <strong>{t('rear')}:</strong>
                                   <p>{t('spring')}: {setup.data.suspension.rear.spring}</p>
                                   <p>{t('damper')}: {
                                     typeof setup.data.suspension.rear.damper === 'object' 
                                       ? `Bump: ${setup.data.suspension.rear.damper.bump || 'N/A'}, Rebound: ${setup.data.suspension.rear.damper.rebound || 'N/A'}`
                                       : setup.data.suspension.rear.damper
                                   }</p>
                                   <p>{t('antiRollBar')}: {setup.data.suspension.rear.antiRollBar}</p>
                                 </div>
                               )}
                             </div>
                           </div>
                         )}
                         
                         {setup.data.aerodynamics && (
                           <div className="tech-section">
                             <h5>✈️ {t('aerodynamics')}</h5>
                             <div className="tech-grid">
                               {setup.data.aerodynamics.frontWing && (
                                 <div className="tech-item">
                                   <strong>{t('frontWing')}:</strong> {setup.data.aerodynamics.frontWing}
                                 </div>
                               )}
                               {setup.data.aerodynamics.rearWing && (
                                 <div className="tech-item">
                                   <strong>{t('rearWing')}:</strong> {setup.data.aerodynamics.rearWing}
                                 </div>
                               )}
                               {setup.data.aerodynamics.frontSplitter && (
                                 <div className="tech-item">
                                   <strong>{t('frontSplitter')}:</strong> {setup.data.aerodynamics.frontSplitter}
                                 </div>
                               )}
                             </div>
                           </div>
                         )}
                         
                         {setup.data.differential && (
                           <div className="tech-section">
                             <h5>⚙️ {t('differential')}</h5>
                             <div className="tech-grid">
                               {setup.data.differential.preload && (
                                 <div className="tech-item">
                                   <strong>{t('preload')}:</strong> {setup.data.differential.preload}
                                 </div>
                               )}
                               {setup.data.differential.power && (
                                 <div className="tech-item">
                                   <strong>{t('power')}:</strong> {setup.data.differential.power}
                                 </div>
                               )}
                               {setup.data.differential.coast && (
                                 <div className="tech-item">
                                   <strong>{t('coast')}:</strong> {setup.data.differential.coast}
                                 </div>
                               )}
                             </div>
                           </div>
                         )}
                         
                         {setup.data.brakes && (
                           <div className="tech-section">
                             <h5>🛑 {t('brakes')}</h5>
                             <div className="tech-grid">
                               {setup.data.brakes.balance && (
                                 <div className="tech-item">
                                   <strong>{t('balance')}:</strong> {setup.data.brakes.balance}%
                                 </div>
                               )}
                               {setup.data.brakes.pressure && (
                                 <div className="tech-item">
                                   <strong>{t('pressure')}:</strong> {setup.data.brakes.pressure}
                                 </div>
                               )}
                             </div>
                           </div>
                         )}
                         
                         {setup.data.tires && (
                           <div className="tech-section">
                             <h5>🏁 {t('tires')}</h5>
                             <div className="tech-grid">
                               {setup.data.tires.pressure && (
                                 <>
                                   {setup.data.tires.pressure.fl && (
                                     <div className="tech-item">
                                       <strong>{t('frontLeft')}:</strong> {setup.data.tires.pressure.fl} psi
                                     </div>
                                   )}
                                   {setup.data.tires.pressure.fr && (
                                     <div className="tech-item">
                                       <strong>{t('frontRight')}:</strong> {setup.data.tires.pressure.fr} psi
                                     </div>
                                   )}
                                   {setup.data.tires.pressure.rl && (
                                     <div className="tech-item">
                                       <strong>{t('rearLeft')}:</strong> {setup.data.tires.pressure.rl} psi
                                     </div>
                                   )}
                                   {setup.data.tires.pressure.rr && (
                                     <div className="tech-item">
                                       <strong>{t('rearRight')}:</strong> {setup.data.tires.pressure.rr} psi
                                     </div>
                                   )}
                                   {/* Fallback para formatos antiguos */}
                                   {setup.data.tires.pressure.front && !setup.data.tires.pressure.fl && (
                                     <div className="tech-item">
                                       <strong>{t('frontPressure')}:</strong> {setup.data.tires.pressure.front} psi
                                     </div>
                                   )}
                                   {setup.data.tires.pressure.rear && !setup.data.tires.pressure.rl && (
                                     <div className="tech-item">
                                       <strong>{t('rearPressure')}:</strong> {setup.data.tires.pressure.rear} psi
                                     </div>
                                   )}
                                 </>
                               )}
                             </div>
                           </div>
                         )}
                         
                         {setup.data.gearing && (
                           <div className="tech-section">
                             <h5>🔧 {t('transmission')}</h5>
                             <div className="tech-grid">
                               {setup.data.gearing.final && (
                                 <div className="tech-item">
                                   <strong>{t('finalRatio')}:</strong> {setup.data.gearing.final}
                                 </div>
                               )}
                               {setup.data.gearing.ratios && (
                                 <div className="tech-item">
                                   <strong>{t('gears')}:</strong> {Object.entries(setup.data.gearing.ratios).map(([gear, ratio]) => `${gear}: ${ratio}`).join(', ')}
                                 </div>
                               )}
                             </div>
                           </div>
                         )}
                       </div>
                     </div>
                   )}
                 </div>
               ))}
            </div>
          </div>
        )}

        {currentView === 'generator' && (
          <div className="generator-section">
            <h2>⚙️ {t('automaticSetupGenerator')}</h2>
            
            <div className="generator-form">
              <select 
                value={generatorParams.car_id}
                onChange={e => {
                  setGeneratorParams({...generatorParams, car_id: e.target.value});
                }}
                disabled={dataLoading}
              >
                <option value="">{t('selectCar')}</option>
                {cars && Array.isArray(cars) && cars.length > 0 ? (
                  cars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay coches disponibles</option>
                )}
              </select>
              
              <select 
                value={generatorParams.track_id}
                onChange={e => {
                  setGeneratorParams({...generatorParams, track_id: e.target.value});
                }}
                disabled={dataLoading}
              >
                <option value="">{t('selectTrack')}</option>
                {tracks && Array.isArray(tracks) && tracks.length > 0 ? (
                  tracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay circuitos disponibles</option>
                )}
              </select>
              
              <select 
                value={generatorParams.session_type}
                onChange={e => setGeneratorParams({...generatorParams, session_type: e.target.value})}
              >
                <option value="Qualifying">{t('qualifying')}</option>
                <option value="Race">{t('race')}</option>
                <option value="Rain">{t('rain')}</option>
                <option value="Endurance">{t('endurance')}</option>
              </select>
              
              <select 
                value={generatorParams.setupStyle || 'balanced'}
                onChange={e => setGeneratorParams({...generatorParams, setupStyle: e.target.value})}
                className="setup-style-selector"
              >
                <option value="safe">🛡️ {t('safeConfiguration')}</option>
                <option value="balanced">⚖️ {t('balancedConfiguration')}</option>
                <option value="aggressive">⚡ {t('aggressiveConfiguration')}</option>
              </select>
              

              <button 
                onClick={() => {
                  generateSetup();
                }}
                disabled={!generatorParams.car_id || !generatorParams.track_id}
                className="generate-button"
                style={{backgroundColor: (!generatorParams.car_id || !generatorParams.track_id) ? '#ccc' : '#007bff'}}
              >
{t('generateBaseSetup')}
              </button>
            </div>
            
            <div className="generator-info">
              <h3>ℹ️ {t('generatorInformation')}</h3>
              <p>{t('generatorDescription')}</p>
              <ul>
                <li>🏁 {t('trackTypeInfo')}</li>
                <li>📏 {t('trackCharacteristics')}</li>
                <li>🏎️ {t('carCategory')}</li>
                <li>⏱️ {t('sessionType')}</li>
                <li>🎯 {t('selectedConfigurationStyle')}</li>
              </ul>
              
              <div className="setup-styles-info">
                <h4>🎯 {t('configurationStyles')}:</h4>
                <div className="style-descriptions">
                  <div className="style-item">
                    <strong>🛡️ {t('safe')}:</strong> {t('safeDescription')}
                  </div>
                  <div className="style-item">
                    <strong>⚖️ {t('balanced')}:</strong> {t('balancedDescription')}
                  </div>
                  <div className="style-item">
                    <strong>⚡ {t('aggressive')}:</strong> {t('aggressiveDescription')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'favorites' && user && (
          <div className="favorites-section">
            <h2>❤️ {t('favoriteSetups')}</h2>
            <div className="setups-grid">
              {favorites.map(favorite => (
                <div key={favorite.setup_id} className="setup-card">
                  <div className="setup-header">
                    <h3>{cars.find(c => c.id === favorite.car_id)?.name}</h3>
                    <button 
                      onClick={() => toggleFavorite(favorite.setup_id)}
                      className="favorite-btn favorited"
                    >
                      ❤️
                    </button>
                  </div>
                  <p><strong>{t('track')}:</strong> {tracks.find(t => t.id === favorite.track_id)?.name}</p>
                  <p><strong>{t('session')}:</strong> {favorite.session_type}</p>
                  <p><strong>Rating:</strong> ⭐ {favorite.average_rating || 'N/A'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'compare' && user && (
          <div className="compare-section">
            <h2>📊 {t('setupComparator')}</h2>
            <p>{t('selectUpToCompare')}</p>
            <div className="selected-setups">
              {selectedSetups.map(setup => (
                <div key={setup.id} className="selected-setup">
                  <span>{cars.find(c => c.id === setup.car_id)?.name}</span>
                  <button onClick={() => setSelectedSetups(selectedSetups.filter(s => s.id !== setup.id))}>
                    ×
                  </button>
                </div>
              ))}
            </div>
            {selectedSetups.length >= 2 && (
              <button className="compare-button">
                {t('compareSetups')}
              </button>
            )}
          </div>
        )}
      </main>

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
      />
        </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
