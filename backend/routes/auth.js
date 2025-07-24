const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  authenticateToken,
  optionalAuth
} = require('../auth');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

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
    
    const result = await registerUser({
      username,
      email,
      password,
      firstName,
      lastName,
      iracingId
    });
    
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      error: error.message || 'Error al registrar usuario'
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username/email y password son requeridos'
      });
    }
    
    const result = await loginUser(username, password);
    
    res.json({
      message: 'Login exitoso',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      error: error.message || 'Error al iniciar sesión'
    });
  }
});

// Logout route
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    await logoutUser(token);
    
    res.json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Error al cerrar sesión'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user with preferences
    const userResult = await pool.query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
              u.iracing_id, u.created_at, u.role,
              p.preferred_units, p.default_car_category, 
              p.notification_settings, p.privacy_settings
       FROM users u
       LEFT JOIN user_preferences p ON u.id = p.user_id
       WHERE u.id = $1`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const user = userResult.rows[0];
    
    // Get user statistics
    const statsResult = await pool.query(
      `SELECT 
         COUNT(CASE WHEN s.user_id = $1 THEN 1 END) as setups_created,
         COUNT(CASE WHEN f.user_id = $1 THEN 1 END) as favorites_count,
         COALESCE(AVG(CASE WHEN s.user_id = $1 THEN s.rating_avg END), 0) as avg_rating,
         COALESCE(SUM(CASE WHEN s.user_id = $1 THEN s.downloads_count END), 0) as total_downloads
       FROM setups s
       LEFT JOIN user_favorites f ON f.user_id = $1`,
      [userId]
    );
    
    const stats = statsResult.rows[0];
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        iracingId: user.iracing_id,
        createdAt: user.created_at,
        role: user.role,
        preferences: {
          preferredUnits: user.preferred_units,
          defaultCarCategory: user.default_car_category,
          notificationSettings: user.notification_settings,
          privacySettings: user.privacy_settings
        },
        statistics: {
          setupsCreated: parseInt(stats.setups_created),
          favoritesCount: parseInt(stats.favorites_count),
          averageRating: parseFloat(stats.avg_rating),
          totalDownloads: parseInt(stats.total_downloads)
        }
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Error al obtener perfil'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, iracingId, email } = req.body;
    
    // Validate email if provided
    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    
    // Check if email is already taken by another user
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email ya está en uso' });
      }
    }
    
    // Update user
    const result = await pool.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           iracing_id = COALESCE($3, iracing_id),
           email = COALESCE($4, email),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, username, email, first_name, last_name, iracing_id`,
      [firstName, lastName, iracingId, email, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const user = result.rows[0];
    
    res.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        iracingId: user.iracing_id
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Error al actualizar perfil'
    });
  }
});

// Update user preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      preferredUnits,
      defaultCarCategory,
      notificationSettings,
      privacySettings
    } = req.body;
    
    const result = await pool.query(
      `UPDATE user_preferences 
       SET preferred_units = COALESCE($1, preferred_units),
           default_car_category = COALESCE($2, default_car_category),
           notification_settings = COALESCE($3, notification_settings),
           privacy_settings = COALESCE($4, privacy_settings),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $5
       RETURNING *`,
      [
        preferredUnits,
        defaultCarCategory,
        JSON.stringify(notificationSettings),
        JSON.stringify(privacySettings),
        userId
      ]
    );
    
    if (result.rows.length === 0) {
      // Create preferences if they don't exist
      await pool.query(
        `INSERT INTO user_preferences 
         (user_id, preferred_units, default_car_category, notification_settings, privacy_settings)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          preferredUnits || 'metric',
          defaultCarCategory,
          JSON.stringify(notificationSettings || {}),
          JSON.stringify(privacySettings || {})
        ]
      );
    }
    
    res.json({ message: 'Preferencias actualizadas exitosamente' });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      error: 'Error al actualizar preferencias'
    });
  }
});

// Check if username/email is available
router.post('/check-availability', async (req, res) => {
  try {
    const { username, email } = req.body;
    
    const result = await pool.query(
      'SELECT username, email FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    const taken = result.rows[0];
    
    res.json({
      available: !taken,
      usernameAvailable: !taken || taken.username !== username,
      emailAvailable: !taken || taken.email !== email
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({
      error: 'Error al verificar disponibilidad'
    });
  }
});

module.exports = router;