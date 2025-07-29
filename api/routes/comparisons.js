const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// Configurar pool de conexión para serverless
let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

// Middleware de autenticación opcional
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

// Compare multiple setups
router.post('/compare', optionalAuth, async (req, res) => {
  const pool = getPool();
  try {
    const { setupIds } = req.body;
    
    if (!setupIds || !Array.isArray(setupIds) || setupIds.length < 2) {
      return res.status(400).json({ error: 'Se requieren al menos 2 setups para comparar' });
    }
    
    if (setupIds.length > 5) {
      return res.status(400).json({ error: 'Máximo 5 setups para comparar' });
    }
    
    // Get setups data
    const placeholders = setupIds.map((_, index) => `$${index + 1}`).join(',');
    
    const query = `
      SELECT 
        s.id,
        s.setup_name,
        s.description,
        s.session_type,
        s.data,
        s.rating_avg,
        s.downloads_count,
        s.created_at,
        c.name as car_name,
        c.category as car_category,
        t.name as track_name,
        u.username
      FROM setups s
      JOIN cars c ON s.car_id = c.id
      JOIN tracks t ON s.track_id = t.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id IN (${placeholders}) AND s.is_public = true
      ORDER BY s.created_at DESC
    `;
    
    const result = await pool.query(query, setupIds);
    
    if (result.rows.length !== setupIds.length) {
      return res.status(404).json({ error: 'Algunos setups no fueron encontrados' });
    }
    
    // Analyze differences
    const setups = result.rows;
    const comparison = {
      setups,
      analysis: {
        commonCar: setups.every(s => s.car_name === setups[0].car_name),
        commonTrack: setups.every(s => s.track_name === setups[0].track_name),
        ratingRange: {
          min: Math.min(...setups.map(s => s.rating_avg || 0)),
          max: Math.max(...setups.map(s => s.rating_avg || 0))
        },
        downloadRange: {
          min: Math.min(...setups.map(s => s.downloads_count || 0)),
          max: Math.max(...setups.map(s => s.downloads_count || 0))
        }
      }
    };
    
    res.json({ comparison });
  } catch (error) {
    console.error('Error comparing setups:', error);
    res.status(500).json({ error: 'Error al comparar setups' });
  }
});

// Get setup differences
router.get('/diff/:setupId1/:setupId2', optionalAuth, async (req, res) => {
  const pool = getPool();
  try {
    const { setupId1, setupId2 } = req.params;
    
    const query = `
      SELECT 
        s.id,
        s.setup_name,
        s.data,
        c.name as car_name,
        t.name as track_name
      FROM setups s
      JOIN cars c ON s.car_id = c.id
      JOIN tracks t ON s.track_id = t.id
      WHERE s.id IN ($1, $2) AND s.is_public = true
    `;
    
    const result = await pool.query(query, [setupId1, setupId2]);
    
    if (result.rows.length !== 2) {
      return res.status(404).json({ error: 'Setups no encontrados' });
    }
    
    const [setup1, setup2] = result.rows;
    
    // Calculate differences in setup data
    const differences = [];
    const data1 = setup1.data;
    const data2 = setup2.data;
    
    // Simple comparison of setup values
    for (const key in data1) {
      if (data1[key] !== data2[key]) {
        differences.push({
          parameter: key,
          setup1_value: data1[key],
          setup2_value: data2[key],
          difference: typeof data1[key] === 'number' && typeof data2[key] === 'number' 
            ? data2[key] - data1[key] 
            : null
        });
      }
    }
    
    res.json({
      setup1: {
        id: setup1.id,
        name: setup1.setup_name,
        car: setup1.car_name,
        track: setup1.track_name
      },
      setup2: {
        id: setup2.id,
        name: setup2.setup_name,
        car: setup2.car_name,
        track: setup2.track_name
      },
      differences
    });
  } catch (error) {
    console.error('Error calculating differences:', error);
    res.status(500).json({ error: 'Error al calcular diferencias' });
  }
});

module.exports = router;