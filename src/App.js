import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [cars, setCars] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [sessions] = useState(["Practice", "Qualifying", "Race", "Rain", "Endurance"]);

  const [selectedCar, setSelectedCar] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("");
  const [selectedSession, setSelectedSession] = useState("");

  const [setup, setSetup] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/cars")
      .then(res => res.json())
      .then(data => setCars(data));

    fetch("http://localhost:4000/api/tracks")
      .then(res => res.json())
      .then(data => setTracks(data));
  }, []);

  const fetchSetup = () => {
    if (!selectedCar || !selectedTrack || !selectedSession) return;

    fetch(`http://localhost:4000/api/setup?car=${selectedCar}&track=${selectedTrack}&session=${selectedSession}`)
      .then(res => res.json())
      .then(data => setSetup(data));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>iRacing Setup Assistant</h1>
        <p>Encuentra la configuración perfecta para tu coche en cualquier circuito</p>
      </header>

      <div className="selection-form">
        <div className="form-group">
          <label htmlFor="car-select">Coche:</label>
          <select 
            id="car-select"
            onChange={e => setSelectedCar(e.target.value)} 
            value={selectedCar}
          >
            <option value="">--Selecciona un coche--</option>
            {cars.map(car => (
              <option key={car.id} value={car.id}>{car.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="track-select">Circuito:</label>
          <select 
            id="track-select"
            onChange={e => setSelectedTrack(e.target.value)} 
            value={selectedTrack}
          >
            <option value="">--Selecciona un circuito--</option>
            {tracks.map(track => (
              <option key={track.id} value={track.id}>{track.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="session-select">Tipo de sesión:</label>
          <select 
            id="session-select"
            onChange={e => setSelectedSession(e.target.value)} 
            value={selectedSession}
          >
            <option value="">--Selecciona una sesión--</option>
            {sessions.map(session => (
              <option key={session} value={session}>{session}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{textAlign: 'center'}}>
        <button 
          className="submit-button" 
          onClick={fetchSetup}
          disabled={!selectedCar || !selectedTrack || !selectedSession}
        >
          Mostrar Setup Recomendado
        </button>
      </div>

      {setup && (
        <div className="setup-results">
          <h2>Setup Recomendado para {cars.find(c => c.id === selectedCar)?.name} en {tracks.find(t => t.id === selectedTrack)?.name}</h2>
          
          <div className="setup-data">
            {Object.entries(setup.data || {}).map(([category, values]) => (
              <div key={category} className="setup-section">
                <h3>{category}</h3>
                {Object.entries(values).map(([key, value]) => (
                  <div key={key} className="setup-item">
                    <span className="setup-item-label">{key}:</span>
                    <span className="setup-item-value">{value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
