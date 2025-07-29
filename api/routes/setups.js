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

// Middleware de autenticación requerida
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

// Get all setups with filtering
router.get('/', optionalAuth, async (req, res) => {
  const pool = getPool();
  try {
    const {
      car_id,
      track_id,
      car_category,
      session_type,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC',
      page = 1,
      limit = 20,
      min_rating
    } = req.query;
    
    const offset = (page - 1) * limit;
    let whereConditions = ['s.is_public = true'];
    let queryParams = [];
    let paramCount = 0;
    
    // Build WHERE conditions
    if (car_id) {
      paramCount++;
      whereConditions.push(`s.car_id = $${paramCount}`);
      queryParams.push(car_id);
    }
    
    if (track_id) {
      paramCount++;
      whereConditions.push(`s.track_id = $${paramCount}`);
      queryParams.push(track_id);
    }
    
    if (car_category) {
      paramCount++;
      whereConditions.push(`c.category = $${paramCount}`);
      queryParams.push(car_category);
    }
    
    if (session_type) {
      paramCount++;
      whereConditions.push(`s.session_type = $${paramCount}`);
      queryParams.push(session_type);
    }
    
    if (search) {
      paramCount++;
      whereConditions.push(`(
        s.setup_name ILIKE $${paramCount} OR 
        s.description ILIKE $${paramCount} OR 
        c.name ILIKE $${paramCount} OR 
        t.name ILIKE $${paramCount}
      )`);
      queryParams.push(`%${search}%`);
    }
    
    if (min_rating) {
      paramCount++;
      whereConditions.push(`s.rating_avg >= $${paramCount}`);
      queryParams.push(min_rating);
    }
    
    // Validate sort_by
    const validSortFields = ['created_at', 'updated_at', 'rating_avg', 'downloads_count', 'name'];
    const sortBy = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Main query
    const query = `
      SELECT 
        s.id,
        s.name as setup_name,
        s.description,
        s.setup_data as data,
        s.created_at,
        s.updated_at,
        s.download_count as downloads_count,
        s.average_rating as rating_avg,
        s.rating_count,
        c.id as car_id,
        c.name as car_name,
        c.category as car_category,
        t.id as track_id,
        t.name as track_name,

        u.username,
        ${req.user ? `
        EXISTS(
          SELECT 1 FROM user_favorites uf 
          WHERE uf.setup_id = s.id AND uf.user_id = ${req.user.id}
        ) as is_favorite
        ` : 'false as is_favorite'}
      FROM setups s
      JOIN cars c ON s.car_id = c.id
      JOIN tracks t ON s.track_id = t.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY s.${sortBy} ${sortOrder}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    queryParams.push(limit, offset);
    
    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM setups s
      JOIN cars c ON s.car_id = c.id
      JOIN tracks t ON s.track_id = t.id
      WHERE ${whereConditions.join(' AND ')}
    `;
    
    const [setupsResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2))
    ]);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      setups: setupsResult.rows,
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
    console.error('Error fetching setups:', error);
    res.status(500).json({ error: 'Error al obtener setups' });
  }
});

// Get setup by ID
router.get('/:id', optionalAuth, async (req, res) => {
  const pool = getPool();
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        s.*,
        c.name as car_name,
        c.category as car_category,
        t.name as track_name,

        u.username,
        ${req.user ? `
        EXISTS(
          SELECT 1 FROM user_favorites uf 
          WHERE uf.setup_id = s.id AND uf.user_id = ${req.user.id}
        ) as is_favorite
        ` : 'false as is_favorite'}
      FROM setups s
      JOIN cars c ON s.car_id = c.id
      JOIN tracks t ON s.track_id = t.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = $1 AND s.is_public = true
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setup no encontrado' });
    }
    
    // Increment download count
    await pool.query(
      'UPDATE setups SET downloads_count = downloads_count + 1 WHERE id = $1',
      [id]
    );
    
    res.json({ setup: result.rows[0] });
  } catch (error) {
    console.error('Error fetching setup:', error);
    res.status(500).json({ error: 'Error al obtener setup' });
  }
});

// Create new setup
router.post('/', authenticateToken, async (req, res) => {
  const pool = getPool();
  try {
    const {
      setup_name,
      description,
      car_id,
      track_id,
      data,
      is_public = true
    } = req.body;
    
    if (!setup_name || !car_id || !track_id || !data) {
      return res.status(400).json({
        error: 'Nombre del setup, coche, pista y datos son requeridos'
      });
    }
    
    const result = await pool.query(
      `INSERT INTO setups 
       (name, description, car_id, track_id, setup_data, user_id, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [setup_name, description, car_id, track_id, JSON.stringify(data), req.user.id, is_public]
    );
    
    res.status(201).json({
      message: 'Setup creado exitosamente',
      setup: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating setup:', error);
    res.status(500).json({ error: 'Error al crear setup' });
  }
});

// Get cars
router.get('/data/cars', async (req, res) => {
  const pool = getPool();
  try {
    const result = await pool.query(
      'SELECT * FROM cars ORDER BY category, name'
    );
    res.json({ cars: result.rows });
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ error: 'Error al obtener coches' });
  }
});

// Get tracks
router.get('/data/tracks', async (req, res) => {
  const pool = getPool();
  try {
    const result = await pool.query(
      'SELECT * FROM tracks ORDER BY name'
    );
    res.json({ tracks: result.rows });
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Error al obtener pistas' });
  }
});

module.exports = router;