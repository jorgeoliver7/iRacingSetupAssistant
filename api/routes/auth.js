const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Configurar pool de conexión para serverless
let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 1, // Límite para serverless
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

// Validation helpers
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateUsername = (username) => {
  const re = /^[a-zA-Z0-9_]{3,20}$/;
  return re.test(username);
};

// Register route
router.post('/register', async (req, res) => {
  const pool = getPool();
  try {
    const { username, email, password, firstName, lastName, iracingId } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email y password son requeridos'
      });
    }
    
    if (!validateUsername(username)) {
      return res.status(400).json({
        error: 'Username debe tener 3-20 caracteres y solo contener letras, números y guiones bajos'
      });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({
        error: 'Email inválido'
      });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Password debe tener al menos 6 caracteres'
      });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'Usuario o email ya existe'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, iracing_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, email, first_name, last_name, iracing_id, created_at, role`,
      [username, email, hashedPassword, firstName, lastName, iracingId]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        iracingId: user.iracing_id,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Error al registrar usuario'
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const pool = getPool();
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username/email y password son requeridos'
      });
    }

    // Find user by username or email
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        iracingId: user.iracing_id,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Error al iniciar sesión'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  const pool = getPool();
  try {
    const userId = req.user.id;
    
    // Get user with preferences
    const userResult = await pool.query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
              u.iracing_id, u.created_at, u.role
       FROM users u
       WHERE u.id = $1`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const user = userResult.rows[0];
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        iracingId: user.iracing_id,
        createdAt: user.created_at,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Error al obtener perfil'
    });
  }
});

// Logout route (for token invalidation if needed)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    res.json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Error al cerrar sesión'
    });
  }
});

module.exports = { router, authenticateToken, optionalAuth };