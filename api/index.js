const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

// Importar rutas del backend
const { router: authRoutes } = require('./routes/auth');
const setupsRoutes = require('./routes/setups');
const favoritesRoutes = require('./routes/favorites');
const ratingsRoutes = require('./routes/ratings');
const comparisonsRoutes = require('./routes/comparisons');
const generatorRoutes = require('./routes/generator');

// Crear instancia de Express
const app = express();

// Configurar CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware para agregar pool a req
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// Endpoint de salud
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'OK',
      timestamp: result.rows[0].now,
      database: 'Connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message
    });
  }
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/setups', setupsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/comparisons', comparisonsRoutes);
app.use('/api/generator', generatorRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Exportar para Vercel
module.exports = app;