const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authenticateToken } = require('../auth');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Get user's favorite setups
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Validate sort_by
    const validSortFields = ['created_at', 'setup_name', 'rating_avg', 'downloads_count'];
    const sortBy = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    const query = `
      SELECT 
        s.id,
        s.setup_name,
        s.description,
        s.session_type,
        s.created_at,
        s.updated_at,
        s.downloads_count,
        s.rating_avg,
        s.rating_count,
        s.lap_time,
        c.id as car_id,
        c.name as car_name,
        c.category as car_category,
        t.id as track_id,
        t.name as track_name,
        t.type as track_type,
        u.username,
        uf.created_at as favorited_at
      FROM user_favorites uf
      JOIN setups s ON uf.setup_id = s.id
      JOIN cars c ON s.car_id = c.id
      JOIN tracks t ON s.track_id = t.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE uf.user_id = $1 AND s.is_public = true
      ORDER BY 
        CASE WHEN $4 = 'created_at' THEN uf.created_at
             WHEN $4 = 'setup_name' THEN s.setup_name
             WHEN $4 = 'rating_avg' THEN s.rating_avg::text
             WHEN $4 = 'downloads_count' THEN s.downloads_count::text
             ELSE uf.created_at::text
        END ${sortOrder}
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM user_favorites uf
      JOIN setups s ON uf.setup_id = s.id
      WHERE uf.user_id = $1 AND s.is_public = true
    `;
    
    const [favoritesResult, countResult] = await Promise.all([
      pool.query(query, [req.user.id, limit, offset, sortBy]),
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

// Add setup to favorites
router.post('/:setupId', authenticateToken, async (req, res) => {
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
    
    res.status(201).json({ message: 'Setup agregado a favoritos' });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Error al agregar a favoritos' });
  }
});

// Remove setup from favorites
router.delete('/:setupId', authenticateToken, async (req, res) => {
  try {
    const { setupId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND setup_id = $2 RETURNING id',
      [req.user.id, setupId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Favorito no encontrado' });
    }
    
    res.json({ message: 'Setup removido de favoritos' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Error al remover de favoritos' });
  }
});

// Check if setup is favorited
router.get('/check/:setupId', authenticateToken, async (req, res) => {
  try {
    const { setupId } = req.params;
    
    const result = await pool.query(
      'SELECT id FROM user_favorites WHERE user_id = $1 AND setup_id = $2',
      [req.user.id, setupId]
    );
    
    res.json({ isFavorite: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: 'Error al verificar favorito' });
  }
});

// Get favorite statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_favorites,
        COUNT(CASE WHEN c.category = 'GT3' THEN 1 END) as gt3_count,
        COUNT(CASE WHEN c.category = 'Formula' THEN 1 END) as formula_count,
        COUNT(CASE WHEN c.category = 'NASCAR' THEN 1 END) as nascar_count,
        COUNT(CASE WHEN t.type = 'road' THEN 1 END) as road_count,
        COUNT(CASE WHEN t.type = 'oval' THEN 1 END) as oval_count,
        COUNT(CASE WHEN t.type = 'dirt' THEN 1 END) as dirt_count,
        AVG(s.rating_avg) as avg_rating_of_favorites
      FROM user_favorites uf
      JOIN setups s ON uf.setup_id = s.id
      JOIN cars c ON s.car_id = c.id
      JOIN tracks t ON s.track_id = t.id
      WHERE uf.user_id = $1 AND s.is_public = true
    `;
    
    const result = await pool.query(statsQuery, [req.user.id]);
    const stats = result.rows[0];
    
    res.json({
      totalFavorites: parseInt(stats.total_favorites),
      byCategory: {
        gt3: parseInt(stats.gt3_count),
        formula: parseInt(stats.formula_count),
        nascar: parseInt(stats.nascar_count)
      },
      byTrackType: {
        road: parseInt(stats.road_count),
        oval: parseInt(stats.oval_count),
        dirt: parseInt(stats.dirt_count)
      },
      averageRating: parseFloat(stats.avg_rating_of_favorites) || 0
    });
  } catch (error) {
    console.error('Error fetching favorite stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas de favoritos' });
  }
});

module.exports = router;