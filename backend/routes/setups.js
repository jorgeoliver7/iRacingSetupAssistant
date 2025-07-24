const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authenticateToken, optionalAuth } = require('../auth');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Get all setups with advanced filtering and search
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      car_id,
      track_id,
      car_category,
      track_type,
      session_type,
      user_id,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC',
      page = 1,
      limit = 20,
      min_rating,
      weather_conditions,
      track_conditions,
      only_favorites
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
    
    if (track_type) {
      paramCount++;
      whereConditions.push(`t.type = $${paramCount}`);
      queryParams.push(track_type);
    }
    
    if (session_type) {
      paramCount++;
      whereConditions.push(`s.session_type = $${paramCount}`);
      queryParams.push(session_type);
    }
    
    if (user_id) {
      paramCount++;
      whereConditions.push(`s.user_id = $${paramCount}`);
      queryParams.push(user_id);
    }
    
    if (search) {
      paramCount++;
      whereConditions.push(`(
        s.setup_name ILIKE $${paramCount} OR 
        s.description ILIKE $${paramCount} OR 
        c.name ILIKE $${paramCount} OR 
        t.name ILIKE $${paramCount} OR 
        u.username ILIKE $${paramCount}
      )`);
      queryParams.push(`%${search}%`);
    }
    
    if (min_rating) {
      paramCount++;
      whereConditions.push(`s.rating_avg >= $${paramCount}`);
      queryParams.push(min_rating);
    }
    
    if (weather_conditions) {
      paramCount++;
      whereConditions.push(`s.weather_conditions @> $${paramCount}`);
      queryParams.push(JSON.stringify({ type: weather_conditions }));
    }
    
    if (track_conditions) {
      paramCount++;
      whereConditions.push(`s.track_conditions = $${paramCount}`);
      queryParams.push(track_conditions);
    }
    
    // Only favorites filter (requires authentication)
    if (only_favorites === 'true' && req.user) {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM user_favorites uf 
        WHERE uf.setup_id = s.id AND uf.user_id = ${req.user.id}
      )`);
    }
    
    // Validate sort_by
    const validSortFields = [
      'created_at', 'updated_at', 'rating_avg', 'downloads_count', 
      'setup_name', 'lap_time'
    ];
    const sortBy = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Main query
    const query = `
      SELECT 
        s.id,
        s.setup_name,
        s.description,
        s.session_type,
        s.data,
        s.created_at,
        s.updated_at,
        s.version,
        s.downloads_count,
        s.rating_avg,
        s.rating_count,
        s.weather_conditions,
        s.track_conditions,
        s.fuel_load,
        s.lap_time,
        s.notes,
        c.id as car_id,
        c.name as car_name,
        c.category as car_category,
        t.id as track_id,
        t.name as track_name,
        t.type as track_type,
        t.country as track_country,
        u.id as user_id,
        u.username,
        u.first_name,
        u.last_name,
        ${req.user ? `
        EXISTS(
          SELECT 1 FROM user_favorites uf 
          WHERE uf.setup_id = s.id AND uf.user_id = ${req.user.id}
        ) as is_favorite,
        CASE WHEN s.user_id = ${req.user.id} THEN true ELSE false END as is_owner
        ` : 'false as is_favorite, false as is_owner'}
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
      LEFT JOIN users u ON s.user_id = u.id
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
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        s.*,
        c.name as car_name,
        c.category as car_category,
        t.name as track_name,
        t.type as track_type,
        t.country as track_country,
        t.variants as track_variants,
        u.username,
        u.first_name,
        u.last_name,
        ${req.user ? `
        EXISTS(
          SELECT 1 FROM user_favorites uf 
          WHERE uf.setup_id = s.id AND uf.user_id = ${req.user.id}
        ) as is_favorite,
        CASE WHEN s.user_id = ${req.user.id} THEN true ELSE false END as is_owner
        ` : 'false as is_favorite, false as is_owner'}
      FROM setups s
      JOIN cars c ON s.car_id = c.id
      JOIN tracks t ON s.track_id = t.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = $1 AND (s.is_public = true OR s.user_id = $2)
    `;
    
    const result = await pool.query(query, [id, req.user?.id || null]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setup no encontrado' });
    }
    
    // Get setup ratings and comments
    const ratingsResult = await pool.query(
      `SELECT 
         sr.rating,
         sr.comment,
         sr.created_at,
         u.username,
         u.first_name,
         u.last_name
       FROM setup_ratings sr
       JOIN users u ON sr.user_id = u.id
       WHERE sr.setup_id = $1
       ORDER BY sr.created_at DESC`,
      [id]
    );
    
    const setup = result.rows[0];
    setup.ratings = ratingsResult.rows;
    
    res.json(setup);
  } catch (error) {
    console.error('Error fetching setup:', error);
    res.status(500).json({ error: 'Error al obtener setup' });
  }
});

// Create new setup
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      car_id,
      track_id,
      setup_name,
      description,
      session_type,
      data,
      is_public = true,
      weather_conditions,
      track_conditions,
      fuel_load,
      lap_time,
      notes
    } = req.body;
    
    // Validation
    if (!car_id || !track_id || !setup_name || !data) {
      return res.status(400).json({
        error: 'car_id, track_id, setup_name y data son requeridos'
      });
    }
    
    // Verify car and track exist
    const carCheck = await pool.query('SELECT id FROM cars WHERE id = $1', [car_id]);
    const trackCheck = await pool.query('SELECT id FROM tracks WHERE id = $1', [track_id]);
    
    if (carCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Coche no encontrado' });
    }
    
    if (trackCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Circuito no encontrado' });
    }
    
    const result = await pool.query(
      `INSERT INTO setups (
         user_id, car_id, track_id, setup_name, description, session_type,
         data, is_public, weather_conditions, track_conditions, fuel_load,
         lap_time, notes
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        req.user.id,
        car_id,
        track_id,
        setup_name,
        description,
        session_type,
        JSON.stringify(data),
        is_public,
        weather_conditions ? JSON.stringify(weather_conditions) : null,
        track_conditions,
        fuel_load,
        lap_time,
        notes
      ]
    );
    
    // Create initial history entry
    await pool.query(
      `INSERT INTO setup_history (setup_id, user_id, version_number, data, change_description)
       VALUES ($1, $2, 1, $3, 'Setup inicial')`,
      [result.rows[0].id, req.user.id, JSON.stringify(data)]
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

// Update setup
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      setup_name,
      description,
      session_type,
      data,
      is_public,
      weather_conditions,
      track_conditions,
      fuel_load,
      lap_time,
      notes,
      change_description
    } = req.body;
    
    // Check if user owns the setup
    const ownerCheck = await pool.query(
      'SELECT user_id, version FROM setups WHERE id = $1',
      [id]
    );
    
    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Setup no encontrado' });
    }
    
    if (ownerCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos para editar este setup' });
    }
    
    const currentVersion = ownerCheck.rows[0].version;
    const newVersion = currentVersion + 1;
    
    const result = await pool.query(
      `UPDATE setups SET
         setup_name = COALESCE($1, setup_name),
         description = COALESCE($2, description),
         session_type = COALESCE($3, session_type),
         data = COALESCE($4, data),
         is_public = COALESCE($5, is_public),
         weather_conditions = COALESCE($6, weather_conditions),
         track_conditions = COALESCE($7, track_conditions),
         fuel_load = COALESCE($8, fuel_load),
         lap_time = COALESCE($9, lap_time),
         notes = COALESCE($10, notes),
         version = $11,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [
        setup_name,
        description,
        session_type,
        data ? JSON.stringify(data) : null,
        is_public,
        weather_conditions ? JSON.stringify(weather_conditions) : null,
        track_conditions,
        fuel_load,
        lap_time,
        notes,
        newVersion,
        id
      ]
    );
    
    // Create history entry if data changed
    if (data) {
      await pool.query(
        `INSERT INTO setup_history (setup_id, user_id, version_number, data, change_description)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          id,
          req.user.id,
          newVersion,
          JSON.stringify(data),
          change_description || `Actualización versión ${newVersion}`
        ]
      );
    }
    
    res.json({
      message: 'Setup actualizado exitosamente',
      setup: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating setup:', error);
    res.status(500).json({ error: 'Error al actualizar setup' });
  }
});

// Delete setup
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user owns the setup or is admin
    const ownerCheck = await pool.query(
      'SELECT user_id FROM setups WHERE id = $1',
      [id]
    );
    
    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Setup no encontrado' });
    }
    
    if (ownerCheck.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este setup' });
    }
    
    await pool.query('DELETE FROM setups WHERE id = $1', [id]);
    
    res.json({ message: 'Setup eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting setup:', error);
    res.status(500).json({ error: 'Error al eliminar setup' });
  }
});

// Download setup (increment counter)
router.post('/:id/download', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get setup data
    const setupResult = await pool.query(
      `SELECT s.*, c.name as car_name, t.name as track_name
       FROM setups s
       JOIN cars c ON s.car_id = c.id
       JOIN tracks t ON s.track_id = t.id
       WHERE s.id = $1 AND s.is_public = true`,
      [id]
    );
    
    if (setupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Setup no encontrado' });
    }
    
    // Record download
    await pool.query(
      'INSERT INTO setup_downloads (setup_id, user_id, ip_address) VALUES ($1, $2, $3)',
      [id, req.user?.id || null, req.ip]
    );
    
    const setup = setupResult.rows[0];
    
    res.json({
      setup: {
        id: setup.id,
        name: setup.setup_name,
        car: setup.car_name,
        track: setup.track_name,
        data: setup.data,
        session_type: setup.session_type,
        weather_conditions: setup.weather_conditions,
        track_conditions: setup.track_conditions,
        fuel_load: setup.fuel_load,
        lap_time: setup.lap_time,
        notes: setup.notes
      }
    });
  } catch (error) {
    console.error('Error downloading setup:', error);
    res.status(500).json({ error: 'Error al descargar setup' });
  }
});

module.exports = router;