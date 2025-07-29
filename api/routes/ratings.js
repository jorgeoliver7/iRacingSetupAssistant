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

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rate a setup
router.post('/:setupId', authenticateToken, async (req, res) => {
  const pool = getPool();
  try {
    const { setupId } = req.params;
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating debe ser entre 1 y 5' });
    }
    
    // Check if setup exists
    const setupCheck = await pool.query(
      'SELECT id FROM setups WHERE id = $1 AND is_public = true',
      [setupId]
    );
    
    if (setupCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Setup no encontrado' });
    }
    
    // Check if user already rated this setup
    const existingRating = await pool.query(
      'SELECT id FROM setup_ratings WHERE user_id = $1 AND setup_id = $2',
      [req.user.id, setupId]
    );
    
    if (existingRating.rows.length > 0) {
      // Update existing rating
      await pool.query(
        'UPDATE setup_ratings SET rating = $1, comment = $2, updated_at = NOW() WHERE user_id = $3 AND setup_id = $4',
        [rating, comment, req.user.id, setupId]
      );
    } else {
      // Insert new rating
      await pool.query(
        'INSERT INTO setup_ratings (user_id, setup_id, rating, comment) VALUES ($1, $2, $3, $4)',
        [req.user.id, setupId, rating, comment]
      );
    }
    
    // Update setup rating average
    const avgResult = await pool.query(
      'SELECT AVG(rating)::numeric(3,2) as avg_rating, COUNT(*) as count FROM setup_ratings WHERE setup_id = $1',
      [setupId]
    );
    
    await pool.query(
      'UPDATE setups SET rating_avg = $1, rating_count = $2 WHERE id = $3',
      [avgResult.rows[0].avg_rating, avgResult.rows[0].count, setupId]
    );
    
    res.json({ message: 'Rating guardado exitosamente' });
  } catch (error) {
    console.error('Error saving rating:', error);
    res.status(500).json({ error: 'Error al guardar rating' });
  }
});

// Get ratings for a setup
router.get('/:setupId', async (req, res) => {
  const pool = getPool();
  try {
    const { setupId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        sr.rating,
        sr.comment,
        sr.created_at,
        u.username
      FROM setup_ratings sr
      JOIN users u ON sr.user_id = u.id
      WHERE sr.setup_id = $1
      ORDER BY sr.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM setup_ratings
      WHERE setup_id = $1
    `;
    
    const [ratingsResult, countResult] = await Promise.all([
      pool.query(query, [setupId, limit, offset]),
      pool.query(countQuery, [setupId])
    ]);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      ratings: ratingsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Error al obtener ratings' });
  }
});

module.exports = router;