const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authenticateToken } = require('../auth');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Compare multiple setups
router.post('/compare', async (req, res) => {
  try {
    const { setupIds } = req.body;
    
    if (!setupIds || !Array.isArray(setupIds) || setupIds.length < 2 || setupIds.length > 4) {
      return res.status(400).json({
        error: 'Debes proporcionar entre 2 y 4 setup IDs para comparar'
      });
    }
    
    // Get setups data
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
        s.rating_avg,
        s.rating_count,
        s.downloads_count,
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
        u.username,
        u.first_name,
        u.last_name
      FROM setups s
      JOIN cars c ON s.car_id = c.id
      JOIN tracks t ON s.track_id = t.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ANY($1) AND s.is_public = true
      ORDER BY array_position($1, s.id)
    `;
    
    const result = await pool.query(query, [setupIds]);
    
    if (result.rows.length !== setupIds.length) {
      return res.status(404).json({
        error: 'Uno o más setups no fueron encontrados o no son públicos'
      });
    }
    
    // Check if all setups are for the same car and track
    const firstSetup = result.rows[0];
    const sameCarTrack = result.rows.every(setup => 
      setup.car_id === firstSetup.car_id && setup.track_id === firstSetup.track_id
    );
    
    // Parse setup data for comparison
    const setups = result.rows.map(setup => ({
      ...setup,
      data: typeof setup.data === 'string' ? JSON.parse(setup.data) : setup.data
    }));
    
    // Generate comparison analysis
    const comparison = {
      setups,
      sameCarTrack,
      car: {
        id: firstSetup.car_id,
        name: firstSetup.car_name,
        category: firstSetup.car_category
      },
      track: {
        id: firstSetup.track_id,
        name: firstSetup.track_name,
        type: firstSetup.track_type
      },
      differences: sameCarTrack ? generateSetupDifferences(setups) : null,
      summary: generateComparisonSummary(setups)
    };
    
    res.json(comparison);
  } catch (error) {
    console.error('Error comparing setups:', error);
    res.status(500).json({ error: 'Error al comparar setups' });
  }
});

// Save comparison for later reference
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const { name, setupIds, notes } = req.body;
    
    if (!name || !setupIds || !Array.isArray(setupIds) || setupIds.length < 2) {
      return res.status(400).json({
        error: 'Nombre y al menos 2 setup IDs son requeridos'
      });
    }
    
    // Verify all setups exist and are public
    const setupCheck = await pool.query(
      'SELECT COUNT(*) as count FROM setups WHERE id = ANY($1) AND is_public = true',
      [setupIds]
    );
    
    if (parseInt(setupCheck.rows[0].count) !== setupIds.length) {
      return res.status(400).json({
        error: 'Uno o más setups no son válidos'
      });
    }
    
    const result = await pool.query(
      `INSERT INTO setup_comparisons (user_id, name, setup_ids, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, name, setupIds, notes]
    );
    
    res.status(201).json({
      message: 'Comparación guardada exitosamente',
      comparison: result.rows[0]
    });
  } catch (error) {
    console.error('Error saving comparison:', error);
    res.status(500).json({ error: 'Error al guardar comparación' });
  }
});

// Get user's saved comparisons
router.get('/saved', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        sc.id,
        sc.name,
        sc.setup_ids,
        sc.notes,
        sc.created_at,
        array_agg(
          json_build_object(
            'id', s.id,
            'name', s.setup_name,
            'car_name', c.name,
            'track_name', t.name
          ) ORDER BY array_position(sc.setup_ids, s.id)
        ) as setups_info
      FROM setup_comparisons sc
      LEFT JOIN setups s ON s.id = ANY(sc.setup_ids)
      LEFT JOIN cars c ON s.car_id = c.id
      LEFT JOIN tracks t ON s.track_id = t.id
      WHERE sc.user_id = $1
      GROUP BY sc.id, sc.name, sc.setup_ids, sc.notes, sc.created_at
      ORDER BY sc.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM setup_comparisons
      WHERE user_id = $1
    `;
    
    const [comparisonsResult, countResult] = await Promise.all([
      pool.query(query, [req.user.id, limit, offset]),
      pool.query(countQuery, [req.user.id])
    ]);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      comparisons: comparisonsResult.rows,
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
    console.error('Error fetching saved comparisons:', error);
    res.status(500).json({ error: 'Error al obtener comparaciones guardadas' });
  }
});

// Get specific saved comparison
router.get('/saved/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM setup_comparisons WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comparación no encontrada' });
    }
    
    const comparison = result.rows[0];
    
    // Get full setup data for the comparison
    const setupsQuery = `
      SELECT 
        s.*,
        c.name as car_name,
        c.category as car_category,
        t.name as track_name,
        t.type as track_type,
        u.username
      FROM setups s
      JOIN cars c ON s.car_id = c.id
      JOIN tracks t ON s.track_id = t.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ANY($1)
      ORDER BY array_position($1, s.id)
    `;
    
    const setupsResult = await pool.query(setupsQuery, [comparison.setup_ids]);
    
    res.json({
      ...comparison,
      setups: setupsResult.rows
    });
  } catch (error) {
    console.error('Error fetching comparison:', error);
    res.status(500).json({ error: 'Error al obtener comparación' });
  }
});

// Delete saved comparison
router.delete('/saved/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM setup_comparisons WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comparación no encontrada' });
    }
    
    res.json({ message: 'Comparación eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting comparison:', error);
    res.status(500).json({ error: 'Error al eliminar comparación' });
  }
});

// Get setup history/versions
router.get('/setup/:setupId/history', async (req, res) => {
  try {
    const { setupId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Check if setup exists and is public
    const setupCheck = await pool.query(
      'SELECT id FROM setups WHERE id = $1 AND is_public = true',
      [setupId]
    );
    
    if (setupCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Setup no encontrado' });
    }
    
    const query = `
      SELECT 
        sh.id,
        sh.version_number,
        sh.data,
        sh.change_description,
        sh.created_at,
        u.username,
        u.first_name,
        u.last_name
      FROM setup_history sh
      LEFT JOIN users u ON sh.user_id = u.id
      WHERE sh.setup_id = $1
      ORDER BY sh.version_number DESC
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM setup_history
      WHERE setup_id = $1
    `;
    
    const [historyResult, countResult] = await Promise.all([
      pool.query(query, [setupId, limit, offset]),
      pool.query(countQuery, [setupId])
    ]);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      history: historyResult.rows,
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
    console.error('Error fetching setup history:', error);
    res.status(500).json({ error: 'Error al obtener historial del setup' });
  }
});

// Compare two versions of the same setup
router.get('/setup/:setupId/versions/:version1/:version2', async (req, res) => {
  try {
    const { setupId, version1, version2 } = req.params;
    
    // Check if setup exists and is public
    const setupCheck = await pool.query(
      'SELECT id FROM setups WHERE id = $1 AND is_public = true',
      [setupId]
    );
    
    if (setupCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Setup no encontrado' });
    }
    
    const query = `
      SELECT 
        sh.version_number,
        sh.data,
        sh.change_description,
        sh.created_at,
        u.username
      FROM setup_history sh
      LEFT JOIN users u ON sh.user_id = u.id
      WHERE sh.setup_id = $1 AND sh.version_number IN ($2, $3)
      ORDER BY sh.version_number
    `;
    
    const result = await pool.query(query, [setupId, version1, version2]);
    
    if (result.rows.length !== 2) {
      return res.status(404).json({ error: 'Una o ambas versiones no encontradas' });
    }
    
    const [olderVersion, newerVersion] = result.rows;
    
    // Parse data for comparison
    const olderData = typeof olderVersion.data === 'string' ? 
      JSON.parse(olderVersion.data) : olderVersion.data;
    const newerData = typeof newerVersion.data === 'string' ? 
      JSON.parse(newerVersion.data) : newerVersion.data;
    
    // Generate differences
    const differences = generateDataDifferences(olderData, newerData);
    
    res.json({
      olderVersion: {
        ...olderVersion,
        data: olderData
      },
      newerVersion: {
        ...newerVersion,
        data: newerData
      },
      differences
    });
  } catch (error) {
    console.error('Error comparing versions:', error);
    res.status(500).json({ error: 'Error al comparar versiones' });
  }
});

// Helper function to generate setup differences
function generateSetupDifferences(setups) {
  if (setups.length < 2) return null;
  
  const differences = {};
  const baseSetup = setups[0].data;
  
  // Compare each setup against the first one
  for (let i = 1; i < setups.length; i++) {
    const currentSetup = setups[i].data;
    differences[`setup_${setups[i].id}`] = generateDataDifferences(baseSetup, currentSetup);
  }
  
  return differences;
}

// Helper function to generate data differences
function generateDataDifferences(data1, data2) {
  const differences = [];
  
  function compareObjects(obj1, obj2, path = '') {
    const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
    
    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;
      const val1 = obj1?.[key];
      const val2 = obj2?.[key];
      
      if (val1 !== val2) {
        if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null) {
          compareObjects(val1, val2, currentPath);
        } else {
          differences.push({
            path: currentPath,
            oldValue: val1,
            newValue: val2,
            type: val1 === undefined ? 'added' : val2 === undefined ? 'removed' : 'changed'
          });
        }
      }
    }
  }
  
  compareObjects(data1, data2);
  return differences;
}

// Helper function to generate comparison summary
function generateComparisonSummary(setups) {
  return {
    totalSetups: setups.length,
    averageRating: setups.reduce((sum, setup) => sum + (setup.rating_avg || 0), 0) / setups.length,
    totalDownloads: setups.reduce((sum, setup) => sum + (setup.downloads_count || 0), 0),
    dateRange: {
      oldest: Math.min(...setups.map(s => new Date(s.created_at).getTime())),
      newest: Math.max(...setups.map(s => new Date(s.created_at).getTime()))
    },
    lapTimes: setups.map(s => s.lap_time).filter(Boolean)
  };
}

module.exports = router;