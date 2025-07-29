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

// Get user favorites
router.get('/', authenticateToken, async (req, res) => {
  const pool = getPool();
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        s.id,
        s.setup_name,
        s.description,
        s.session_type,
        s.created_at,
        s.rating_avg,
        s.downloads_count,
        c.name as car_name,
        c.category as car_category,
        t.name as track_name,
        u.username,
        uf.created_at as favorited_at
      FROM user_favorites uf
      JOIN setups s ON uf.setup_id = s.id
      JOIN cars c ON s.car_id = c.id
      JOIN tracks t ON s.track_id = t.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE uf.user_id = $1 AND s.is_public = true
      ORDER BY uf.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM user_favorites uf
      JOIN setups s ON uf.setup_id = s.id
      WHERE uf.user_id = $1 AND s.is_public = true
    `;
    
    const [favoritesResult, countResult] = await Promise.all([
      pool.query(query, [req.user.id, limit, offset]),
      pool.query(countQuery, [req.user.id])
    ]);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      favorites: favoritesResult.rows,
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
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
});

// Add to favorites
router.post('/:setupId', authenticateToken, async (req, res) => {
  const pool = getPool();
  try {
    const { setupId } = req.params;
    
    // Check if setup exists and is public
    const setupCheck = await pool.query(
      'SELECT id FROM setups WHERE id = $1 AND is_public = true',
      [setupId]
    );
    
    if (setupCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Setup no encontrado' });
    }
    
    // Check if already favorited
    const existingFavorite = await pool.query(
      'SELECT id FROM user_favorites WHERE user_id = $1 AND setup_id = $2',
      [req.user.id, setupId]
    );
    
    if (existingFavorite.rows.length > 0) {
      return res.status(400).json({ error: 'Setup ya está en favoritos' });
    }
    
    // Add to favorites
    await pool.query(
      'INSERT INTO user_favorites (user_id, setup_id) VALUES ($1, $2)',
      [req.user.id, setupId]
    );
    
    res.json({ message: 'Setup agregado a favoritos' });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Error al agregar a favoritos' });
  }
});

// Remove from favorites
router.delete('/:setupId', authenticateToken, async (req, res) => {
  const pool = getPool();
  try {
    const { setupId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND setup_id = $2',
      [req.user.id, setupId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Favorito no encontrado' });
    }
    
    res.json({ message: 'Setup removido de favoritos' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Error al remover de favoritos' });
  }
});

module.exports = router;