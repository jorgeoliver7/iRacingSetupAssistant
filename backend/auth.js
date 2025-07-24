const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
const generateToken = (userId, username) => {
  return jwt.sign(
    { userId, username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Register user
const registerUser = async (userData) => {
  const { username, email, password, firstName, lastName, iracingId } = userData;
  
  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (existingUser.rows.length > 0) {
      throw new Error('Usuario o email ya existe');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, iracing_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, email, first_name, last_name, iracing_id, created_at`,
      [username, email, hashedPassword, firstName, lastName, iracingId]
    );
    
    const user = result.rows[0];
    
    // Create user preferences
    await pool.query(
      'INSERT INTO user_preferences (user_id) VALUES ($1)',
      [user.id]
    );
    
    // Generate token
    const token = generateToken(user.id, user.username);
    
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        iracingId: user.iracing_id,
        createdAt: user.created_at
      },
      token
    };
  } catch (error) {
    throw error;
  }
};

// Login user
const loginUser = async (username, password) => {
  try {
    // Find user by username or email
    const result = await pool.query(
      `SELECT id, username, email, password_hash, first_name, last_name, iracing_id, is_active
       FROM users 
       WHERE (username = $1 OR email = $1) AND is_active = true`,
      [username]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Credenciales inválidas');
    }
    
    const user = result.rows[0];
    
    // Check password
    const isValidPassword = await comparePassword(password, user.password_hash);
    
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }
    
    // Generate token
    const token = generateToken(user.id, user.username);
    
    // Store session
    await pool.query(
      `INSERT INTO user_sessions (user_id, session_token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, token]
    );
    
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        iracingId: user.iracing_id
      },
      token
    };
  } catch (error) {
    throw error;
  }
};

// Logout user
const logoutUser = async (token) => {
  try {
    await pool.query(
      'DELETE FROM user_sessions WHERE session_token = $1',
      [token]
    );
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Get user by token
const getUserByToken = async (token) => {
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }
    
    // Check if session exists and is valid
    const sessionResult = await pool.query(
      `SELECT user_id FROM user_sessions 
       WHERE session_token = $1 AND expires_at > NOW()`,
      [token]
    );
    
    if (sessionResult.rows.length === 0) {
      return null;
    }
    
    // Get user data
    const userResult = await pool.query(
      `SELECT id, username, email, first_name, last_name, iracing_id, role, created_at
       FROM users 
       WHERE id = $1 AND is_active = true`,
      [decoded.userId]
    );
    
    if (userResult.rows.length === 0) {
      return null;
    }
    
    const user = userResult.rows[0];
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      iracingId: user.iracing_id,
      role: user.role,
      createdAt: user.created_at
    };
  } catch (error) {
    return null;
  }
};

// Middleware for authentication
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }
  
  try {
    const user = await getUserByToken(token);
    if (!user) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const user = await getUserByToken(token);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Ignore errors for optional auth
    }
  }
  
  next();
};

// Clean expired sessions
const cleanExpiredSessions = async () => {
  try {
    await pool.query('DELETE FROM user_sessions WHERE expires_at < NOW()');
  } catch (error) {
    console.error('Error cleaning expired sessions:', error);
  }
};

// Run cleanup every hour
setInterval(cleanExpiredSessions, 60 * 60 * 1000);

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  registerUser,
  loginUser,
  logoutUser,
  getUserByToken,
  authenticateToken,
  optionalAuth,
  cleanExpiredSessions
};