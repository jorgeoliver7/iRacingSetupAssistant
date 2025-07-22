const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get("/api/cars", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM cars ORDER BY name");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/tracks", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM tracks ORDER BY name");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
