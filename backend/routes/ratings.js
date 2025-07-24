const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authenticateToken } = require('../auth');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Get ratings for a setup
router.get('/setup/:setupId', async (req, res) => {
  try {
    const { setupId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Check if setup exists
    const setupCheck = await pool.query(
      'SELECT id FROM setups WHERE id = $1 AND is_public = true',
      [setupId]
    );
    
    if (setupCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Setup no encontrado' });
    }
    
    // Get ratings with user info
    const ratingsQuery = `
      SELECT 
        sr.id,
        sr.rating,
        sr.comment,
        sr.created_at,
        u.id as user_id,
        u.username,
        u.first_name,
        u.last_name
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
    
    // Get rating distribution
    const distributionQuery = `
      SELECT 
        rating,
        COUNT(*) as count
      FROM setup_ratings
      WHERE setup_id = $1
      GROUP BY rating
      ORDER BY rating DESC
    `;
    
    const [ratingsResult, countResult, distributionResult] = await Promise.all([
      pool.query(ratingsQuery, [setupId, limit, offset]),
      pool.query(countQuery, [setupId]),
      pool.query(distributionQuery, [setupId])
    ]);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distributionResult.rows.forEach(row => {
      distribution[row.rating] = parseInt(row.count);
    });
    
    res.json({
      ratings: ratingsResult.rows,
      distribution,
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

// Add or update rating for a setup
router.post('/setup/:setupId', authenticateToken, async (req, res) => {
  try {
    const { setupId } = req.params;
    const { rating, comment } = req.body;
    
    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Rating debe ser un número entre 1 y 5'
      });
    }
    
    // Check if setup exists and is public
    const setupCheck = await pool.query(
      'SELECT id, user_id FROM setups WHERE id = $1 AND is_public = true',
      [setupId]
    );
    
    if (setupCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Setup no encontrado' });
    }
    
    // Prevent users from rating their own setups
    if (setupCheck.rows[0].user_id === req.user.id) {
      return res.status(400).json({
        error: 'No puedes calificar tu propio setup'
      });
    }
    
    // Check if user already rated this setup
    const existingRating = await pool.query(
      'SELECT id FROM setup_ratings WHERE setup_id = $1 AND user_id = $2',
      [setupId, req.user.id]
    );
    
    let result;
    if (existingRating.rows.length > 0) {
      // Update existing rating
      result = await pool.query(
        `UPDATE setup_ratings 
         SET rating = $1, comment = $2, created_at = CURRENT_TIMESTAMP
         WHERE setup_id = $3 AND user_id = $4
         RETURNING *`,
        [rating, comment, setupId, req.user.id]
      );
    } else {
      // Create new rating
      result = await pool.query(
        `INSERT INTO setup_ratings (setup_id, user_id, rating, comment)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [setupId, req.user.id, rating, comment]
      );
    }
    
    res.json({
      message: existingRating.rows.length > 0 ? 'Rating actualizado' : 'Rating agregado',
      rating: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding/updating rating:', error);
    res.status(500).json({ error: 'Error al procesar rating' });
  }
});

// Delete rating
router.delete('/setup/:setupId', authenticateToken, async (req, res) => {
  try {
    const { setupId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM setup_ratings WHERE setup_id = $1 AND user_id = $2 RETURNING id',
      [setupId, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rating no encontrado' });
    }
    
    res.json({ message: 'Rating eliminado' });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({ error: 'Error al eliminar rating' });
  }
});

// Get user's rating for a specific setup
router.get('/setup/:setupId/user', authenticateToken, async (req, res) => {
  try {
    const { setupId } = req.params;
    
    const result = await pool.query(
      'SELECT rating, comment, created_at FROM setup_ratings WHERE setup_id = $1 AND user_id = $2',
      [setupId, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.json({ hasRated: false });
    }
    
    res.json({
      hasRated: true,
      rating: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user rating:', error);
    res.status(500).json({ error: 'Error al obtener rating del usuario' });
  }
});

// Get top rated setups
router.get('/top', async (req, res) => {
  try {
    const {
      limit = 10,
      car_category,
      track_type,
      min_ratings = 3
    } = req.query;
    
    let whereConditions = ['s.is_public = true', `s.rating_count >= ${min_ratings}`];
    let queryParams = [limit];
    let paramCount = 1;
    
    if (car_category) {
      paramCount++;
      whereConditions.push(`c.category = $${paramCount}`);
      queryParams.push(car_category);
    }
    
    if (track_type) {
      paramCount++;
      whereConditions.push(`t.type = $${paramCount}`);
      queryParams.push(track_type);
    }
    
    const query = `
      SELECT 
        s.id,
        s.setup_name,
        s.description,
        s.rating_avg,
        s.rating_count,
        s.downloads_count,
        s.lap_time,
        c.name as car_name,
        c.category as car_category,
        t.name as track_name,
        t.type as track_type,
        u.username
      FROM setups s
      JOIN cars c ON s.car_id = c.id
      JOIN tracks t ON s.track_id = t.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY s.rating_avg DESC, s.rating_count DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, queryParams);
    
    res.json({
      topRatedSetups: result.rows
    });
  } catch (error) {
    console.error('Error fetching top rated setups:', error);
    res.status(500).json({ error: 'Error al obtener setups mejor calificados' });
  }
});

// Get user's ratings history
router.get('/user/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        sr.id,
        sr.rating,
        sr.comment,
        sr.created_at,
        s.id as setup_id,
        s.setup_name,
        c.name as car_name,
        t.name as track_name,
        u.username as setup_author
      FROM setup_ratings sr
      JOIN setups s ON sr.setup_id = s.id
      JOIN cars c ON s.car_id = c.id
      JOIN tracks t ON s.track_id = t.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE sr.user_id = $1
      ORDER BY sr.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM setup_ratings
      WHERE user_id = $1
    `;
    
    const [ratingsResult, countResult] = await Promise.all([
      pool.query(query, [req.user.id, limit, offset]),
      pool.query(countQuery, [req.user.id])
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
    console.error('Error fetching user ratings:', error);
    res.status(500).json({ error: 'Error al obtener historial de ratings' });
  }
});

// Get rating statistics for user
router.get('/user/stats', authenticateToken, async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_ratings,
        AVG(rating) as average_rating_given,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_count,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_count,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_count,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_count
      FROM setup_ratings
      WHERE user_id = $1
    `;
    
    const result = await pool.query(statsQuery, [req.user.id]);
    const stats = result.rows[0];
    
    res.json({
      totalRatings: parseInt(stats.total_ratings),
      averageRatingGiven: parseFloat(stats.average_rating_given) || 0,
      distribution: {
        5: parseInt(stats.five_star_count),
        4: parseInt(stats.four_star_count),
        3: parseInt(stats.three_star_count),
        2: parseInt(stats.two_star_count),
        1: parseInt(stats.one_star_count)
      }
    });
  } catch (error) {
    console.error('Error fetching rating stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas de ratings' });
  }
});

module.exports = router;