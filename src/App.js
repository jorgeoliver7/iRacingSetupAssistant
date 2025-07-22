import React, { useEffect, useState } from "react";

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
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>iRacing Setup Assistant</h1>

      <label>
        Coche:
        <select onChange={e => setSelectedCar(e.target.value)} value={selectedCar}>
          <option value="">--Selecciona--</option>
          {cars.map(car => (
            <option key={car.id} value={car.id}>{car.name}</option>
          ))}
        </select>
      </label>

      <br /><br />

      <label>
        Circuito:
        <select onChange={e => setSelectedTrack(e.target.value)} value={selectedTrack}>
          <option value="">--Selecciona--</option>
          {tracks.map(track => (
            <option key={track.id} value={track.id}>{track.name}</option>
          ))}
        </select>
      </label>

      <br /><br />

      <label>
        Tipo de sesión:
        <select onChange={e => setSelectedSession(e.target.value)} value={selectedSession}>
          <option value="">--Selecciona--</option>
          {sessions.map(session => (
            <option key={session} value={session}>{session}</option>
          ))}
        </select>
      </label>

      <br /><br />

      <button onClick={fetchSetup}>Mostrar Setup Recomendado</button>

      {setup && (
        <div style={{ marginTop: "2rem", border: "1px solid #ccc", padding: "1rem" }}>
          <h2>Setup recomendado</h2>
          <pre>{JSON.stringify(setup.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
