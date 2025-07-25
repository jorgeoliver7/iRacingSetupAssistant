const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

// Configuración CORS para producción
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get("/api/cars", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM cars ORDER BY name");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching cars:", error.message);
    // Devolver datos de ejemplo si no se puede conectar a la base de datos
    const exampleCars = [
      { id: 1, name: "Ferrari 488 GT3" },
      { id: 2, name: "Porsche 911 GT3 R" },
      { id: 3, name: "BMW M4 GT3" },
      { id: 4, name: "Mercedes AMG GT3" }
    ];
    res.json(exampleCars);
  }
});

app.get("/api/tracks", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM tracks ORDER BY name");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tracks:", error.message);
    // Devolver datos de ejemplo si no se puede conectar a la base de datos
    const exampleTracks = [
      { id: 1, name: "Spa-Francorchamps" },
      { id: 2, name: "Nürburgring" },
      { id: 3, name: "Monza" },
      { id: 4, name: "Silverstone" }
    ];
    res.json(exampleTracks);
  }
});

app.get("/api/setup", async (req, res) => {
  const { car, track, session } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM setups WHERE car_id = $1 AND track_id = $2 AND session_type = $3",
      [car, track, session]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Setup no encontrado" });
    }
  } catch (error) {
    console.error("Error fetching setup:", error.message);
    // Devolver datos de ejemplo si no se puede conectar a la base de datos
    const exampleSetup = {
      id: 1,
      car_id: car,
      track_id: track,
      session_type: session,
      data: {
        suspension: {
          front_ride_height: "60mm",
          rear_ride_height: "70mm",
          front_spring_rate: "120 N/mm",
          rear_spring_rate: "140 N/mm"
        },
        aero: {
          front_wing: "6",
          rear_wing: "8"
        },
        tires: {
          front_pressure: "27.5 psi",
          rear_pressure: "28.0 psi"
        }
      }
    };
    res.json(exampleSetup);
  }
});

// Health check endpoint para monitoreo
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
