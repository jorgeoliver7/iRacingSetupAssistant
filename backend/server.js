const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const setupsRoutes = require('./routes/setups');
const favoritesRoutes = require('./routes/favorites');
const ratingsRoutes = require('./routes/ratings');
const comparisonsRoutes = require('./routes/comparisons');
const generatorRoutes = require('./routes/generator');

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3002'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/setups', setupsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/comparisons', comparisonsRoutes);
app.use('/api/generator', generatorRoutes);

// Legacy routes for backward compatibility
app.get('/api/cars', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM cars';
    let params = [];
    
    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }
    
    query += ' ORDER BY name';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ error: 'Error al obtener coches' });
  }
});

app.get('/api/tracks', async (req, res) => {
  try {
    const { type, country } = req.query;
    let query = 'SELECT * FROM tracks';
    let params = [];
    let whereConditions = [];
    
    if (type) {
      whereConditions.push(`type = $${params.length + 1}`);
      params.push(type);
    }
    
    if (country) {
      whereConditions.push(`country = $${params.length + 1}`);
      params.push(country);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' ORDER BY name';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Error al obtener circuitos' });
  }
});

// Get statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM cars) as total_cars,
        (SELECT COUNT(*) FROM tracks) as total_tracks,
        (SELECT COUNT(*) FROM setups WHERE is_public = true) as total_setups,
        (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
        (SELECT COUNT(*) FROM setup_downloads) as total_downloads,
        (SELECT AVG(rating_avg) FROM setups WHERE rating_count > 0) as average_rating,
        (SELECT COUNT(*) FROM setup_ratings) as total_ratings
    `;
    
    const categoriesQuery = `
      SELECT 
        category,
        COUNT(*) as count
      FROM cars
      GROUP BY category
      ORDER BY count DESC
    `;
    
    const trackTypesQuery = `
      SELECT 
        type,
        COUNT(*) as count
      FROM tracks
      GROUP BY type
      ORDER BY count DESC
    `;
    
    const [statsResult, categoriesResult, trackTypesResult] = await Promise.all([
      pool.query(statsQuery),
      pool.query(categoriesQuery),
      pool.query(trackTypesQuery)
    ]);
    
    const stats = statsResult.rows[0];
    
    res.json({
      totalCars: parseInt(stats.total_cars),
      totalTracks: parseInt(stats.total_tracks),
      totalSetups: parseInt(stats.total_setups),
      totalUsers: parseInt(stats.total_users),
      totalDownloads: parseInt(stats.total_downloads),
      averageRating: parseFloat(stats.average_rating) || 0,
      totalRatings: parseInt(stats.total_ratings),
      carCategories: categoriesResult.rows,
      trackTypes: trackTypesResult.rows
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q, type = 'all', limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ results: [] });
    }
    
    const searchTerm = `%${q.trim()}%`;
    const results = {};
    
    if (type === 'all' || type === 'cars') {
      const carsResult = await pool.query(
        'SELECT id, name, category FROM cars WHERE name ILIKE $1 ORDER BY name LIMIT $2',
        [searchTerm, limit]
      );
      results.cars = carsResult.rows;
    }
    
    if (type === 'all' || type === 'tracks') {
      const tracksResult = await pool.query(
        'SELECT id, name, type, country FROM tracks WHERE name ILIKE $1 ORDER BY name LIMIT $2',
        [searchTerm, limit]
      );
      results.tracks = tracksResult.rows;
    }
    
    if (type === 'all' || type === 'setups') {
      const setupsResult = await pool.query(
        `SELECT s.id, s.setup_name, s.description, s.rating_avg, s.downloads_count,
                c.name as car_name, t.name as track_name, u.username
         FROM setups s
         JOIN cars c ON s.car_id = c.id
         JOIN tracks t ON s.track_id = t.id
         LEFT JOIN users u ON s.user_id = u.id
         WHERE s.is_public = true AND (
           s.setup_name ILIKE $1 OR 
           s.description ILIKE $1 OR
           c.name ILIKE $1 OR
           t.name ILIKE $1
         )
         ORDER BY s.rating_avg DESC, s.downloads_count DESC
         LIMIT $2`,
        [searchTerm, limit]
      );
      results.setups = setupsResult.rows;
    }
    
    res.json({ results });
  } catch (error) {
    console.error('Error in search:', error);
    res.status(500).json({ error: 'Error en la búsqueda' });
  }
});

// Export/Import endpoints
app.get('/api/setups/:id/export', async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;
    
    const result = await pool.query(
      `SELECT s.*, c.name as car_name, t.name as track_name
       FROM setups s
       JOIN cars c ON s.car_id = c.id
       JOIN tracks t ON s.track_id = t.id
       WHERE s.id = $1 AND s.is_public = true`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setup no encontrado' });
    }
    
    const setup = result.rows[0];
    
    if (format === 'iracing') {
      // Convert to iRacing format (simplified)
      const iracingSetup = {
        CarSetup: {
          UpdateDate: setup.updated_at,
          Name: setup.setup_name,
          Description: setup.description || '',
          ...setup.data
        }
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${setup.setup_name}.json"`);
      res.json(iracingSetup);
    } else {
      // Default JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${setup.setup_name}_export.json"`);
      res.json({
        setup: {
          name: setup.setup_name,
          description: setup.description,
          car: setup.car_name,
          track: setup.track_name,
          sessionType: setup.session_type,
          data: setup.data,
          exportedAt: new Date().toISOString(),
          source: 'iRacing Setup Assistant'
        }
      });
    }
    
    // Record download
    await pool.query(
      'INSERT INTO setup_downloads (setup_id, ip_address) VALUES ($1, $2)',
      [id, req.ip]
    );
  } catch (error) {
    console.error('Error exporting setup:', error);
    res.status(500).json({ error: 'Error al exportar setup' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;