const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authenticateToken, optionalAuth } = require('../auth');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Get all cars
router.get('/cars', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, category FROM cars ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ error: 'Error al obtener coches' });
  }
});

// Get all tracks
router.get('/tracks', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, type, country FROM tracks ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Error al obtener circuitos' });
  }
});

// Generate base setup for car/track combination
router.post('/generate', optionalAuth, async (req, res) => {
  try {
    console.log('Generator endpoint called with body:', req.body);
    const { carId, trackId, sessionType = 'race', conditions = {}, setupStyle = 'balanced' } = req.body;
    
    console.log('Extracted params:', { carId, trackId, sessionType, conditions, setupStyle });
    
    if (!carId || !trackId) {
      console.log('Missing required params - carId:', carId, 'trackId:', trackId);
      return res.status(400).json({
        error: 'carId and trackId are required'
      });
    }
    
    // Get car and track information
    console.log('Querying car with ID:', carId);
    const carResult = await pool.query(
      'SELECT * FROM cars WHERE id = $1',
      [carId]
    );
    console.log('Car query result:', carResult.rows.length, 'rows');
    
    console.log('Querying track with ID:', trackId);
    const trackResult = await pool.query(
      'SELECT * FROM tracks WHERE id = $1',
      [trackId]
    );
    console.log('Track query result:', trackResult.rows.length, 'rows');
    
    if (carResult.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    if (trackResult.rows.length === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    const car = carResult.rows[0];
    const track = trackResult.rows[0];
    console.log('Car found:', car.name, 'Category:', car.category);
    console.log('Track found:', track.name, 'Type:', track.type);
    
    // Get track characteristics if available (handle missing table gracefully)
    console.log('Querying track characteristics for track ID:', trackId);
    let trackCharacteristics = null;
    try {
      const characteristicsResult = await pool.query(
        'SELECT * FROM track_characteristics WHERE track_id = $1',
        [trackId]
      );
      console.log('Track characteristics result:', characteristicsResult.rows.length, 'rows');
      trackCharacteristics = characteristicsResult.rows[0];
    } catch (error) {
      console.log('Track characteristics table not found, using defaults');
      trackCharacteristics = null;
    }
    console.log('Track characteristics:', trackCharacteristics ? 'found' : 'not found');
    
    // Get existing template for this combination (handle missing table gracefully)
    console.log('Querying templates with car category:', car.category, 'track type:', track.type);
    let templateResult = { rows: [] };
    try {
      templateResult = await pool.query(
        `SELECT * FROM setup_templates 
         WHERE (car_category = $1 OR car_category IS NULL)
         AND (track_type = $2 OR track_type IS NULL)
         AND category = $3
         AND is_active = true
         ORDER BY 
           CASE WHEN car_category = $1 THEN 1 ELSE 2 END,
           CASE WHEN track_type = $2 THEN 1 ELSE 2 END
         LIMIT 1`,
        [car.category, track.type, track.type]
      );
    } catch (error) {
      console.log('Setup templates table not found, using default generation');
      templateResult = { rows: [] };
    }
    console.log('Template query result:', templateResult.rows.length, 'rows');
    
    let baseSetup;
    if (templateResult.rows.length > 0) {
      console.log('Using template setup');
      baseSetup = templateResult.rows[0].base_setup;
    } else {
      // Generate default setup based on car category and track type
      console.log('No template found, generating default setup for category:', car.category, 'track type:', track.type);
      baseSetup = generateDefaultSetup(car.category, track.type);
      console.log('Generated base setup:', baseSetup ? 'success' : 'failed');
    }
    
    // Apply adaptive modifications based on track characteristics
    console.log('Applying track adaptations...');
    const adaptedSetup = applyTrackAdaptations(
      baseSetup,
      track,
      trackCharacteristics,
      conditions
    );
    console.log('Track adaptations applied:', adaptedSetup ? 'success' : 'failed');
    
    // Apply setup style modifications (safe, aggressive, balanced)
    console.log('Applying setup style:', setupStyle);
    const styledSetup = applySetupStyle(adaptedSetup, setupStyle, car.category, track.type);
    console.log('Setup style applied:', styledSetup ? 'success' : 'failed');
    
    // Apply session-specific modifications
    console.log('Applying session modifications for:', sessionType);
    const sessionSetup = applySessionModifications(styledSetup, sessionType);
    console.log('Session modifications applied:', sessionSetup ? 'success' : 'failed');
    
    // Round all values to realistic iRacing numbers
    console.log('Rounding setup values to realistic numbers...');
    const finalSetup = roundSetupValues(sessionSetup);
    console.log('Setup values rounded:', finalSetup ? 'success' : 'failed');
    
    // Generate setup metadata
    const setupMetadata = {
      generatedAt: new Date().toISOString(),
      algorithm: 'adaptive_v1',
      basedOnTemplate: templateResult.rows.length > 0,
      templateId: templateResult.rows[0]?.id,
      adaptations: getAppliedAdaptations(track, trackCharacteristics, conditions),
      confidence: calculateConfidence(car, track, trackCharacteristics)
    };
    
    console.log('Generating final response...');
    const response = {
      setup: finalSetup,
      metadata: setupMetadata,
      car: {
        id: car.id,
        name: car.name,
        category: car.category
      },
      track: {
        id: track.id,
        name: track.name,
        type: track.type,
        country: track.country
      },
      recommendations: generateRecommendations(car, track, trackCharacteristics)
    };
    console.log('Sending response with setup:', finalSetup ? 'generated' : 'null');
    res.json(response);
  } catch (error) {
    console.error('Error generating setup:', error);
    res.status(500).json({ error: 'Error generating setup' });
  }
});

// Save generated setup
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const {
      carId,
      trackId,
      setupData,
      setupName,
      description,
      sessionType,
      metadata,
      isPublic = true
    } = req.body;
    
    if (!carId || !trackId || !setupData || !setupName) {
      return res.status(400).json({
        error: 'carId, trackId, setupData and setupName are required'
      });
    }
    
    const result = await pool.query(
      `INSERT INTO setups (
         user_id, car_id, track_id, setup_name, description, session_type,
         data, is_public, notes
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.user.id,
        carId,
        trackId,
        setupName,
        description || 'Automatically generated setup',
        sessionType,
        JSON.stringify(setupData),
        isPublic,
        metadata ? `Automatically generated. Metadata: ${JSON.stringify(metadata)}` : null
      ]
    );
    
    // Create initial history entry
    await pool.query(
      `INSERT INTO setup_history (setup_id, user_id, version_number, data, change_description)
       VALUES ($1, $2, 1, $3, 'Automatically generated setup')`,
      [result.rows[0].id, req.user.id, JSON.stringify(setupData)]
    );
    
    res.status(201).json({
      message: 'Setup generated and saved successfully',
      setup: result.rows[0]
    });
  } catch (error) {
    console.error('Error saving generated setup:', error);
    res.status(500).json({ error: 'Error saving generated setup' });
  }
});

// Get available templates
router.get('/templates', async (req, res) => {
  try {
    const { category, carCategory, trackType } = req.query;
    
    let whereConditions = ['is_active = true'];
    let queryParams = [];
    let paramCount = 0;
    
    if (category) {
      paramCount++;
      whereConditions.push(`category = $${paramCount}`);
      queryParams.push(category);
    }
    
    if (carCategory) {
      paramCount++;
      whereConditions.push(`(car_category = $${paramCount} OR car_category IS NULL)`);
      queryParams.push(carCategory);
    }
    
    if (trackType) {
      paramCount++;
      whereConditions.push(`(track_type = $${paramCount} OR track_type IS NULL)`);
      queryParams.push(trackType);
    }
    
    const query = `
      SELECT 
        st.*,
        u.username as created_by_username
      FROM setup_templates st
      LEFT JOIN users u ON st.created_by = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY st.name
    `;
    
    const result = await pool.query(query, queryParams);
    
    res.json({
      templates: result.rows
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Error fetching templates' });
  }
});

// Create new template (admin only)
router.post('/templates', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can create templates' });
    }
    
    const {
      name,
      category,
      trackType,
      carCategory,
      baseSetup,
      description
    } = req.body;
    
    if (!name || !category || !baseSetup) {
      return res.status(400).json({
        error: 'name, category and baseSetup are required'
      });
    }
    
    const result = await pool.query(
      `INSERT INTO setup_templates 
       (name, category, track_type, car_category, base_setup, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name,
        category,
        trackType,
        carCategory,
        JSON.stringify(baseSetup),
        description,
        req.user.id
      ]
    );
    
    res.status(201).json({
      message: 'Template created successfully',
      template: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Error creating template' });
  }
});

// Get track characteristics
router.get('/track-characteristics/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    
    const result = await pool.query(
      `SELECT tc.*, t.name as track_name, t.type as track_type
       FROM track_characteristics tc
       JOIN tracks t ON tc.track_id = t.id
       WHERE tc.track_id = $1`,
      [trackId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Track characteristics not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching track characteristics:', error);
    res.status(500).json({ error: 'Error fetching track characteristics' });
  }
});

// Helper function to round setup values to realistic iRacing numbers
function roundSetupValues(setup) {
  const roundedSetup = JSON.parse(JSON.stringify(setup)); // Deep clone
  
  // Round suspension values
  if (roundedSetup.suspension) {
    ['front', 'rear'].forEach(position => {
      if (roundedSetup.suspension[position]) {
        const susp = roundedSetup.suspension[position];
        
        // Round basic suspension values
        if (typeof susp.spring === 'number') {
          susp.spring = Math.round(susp.spring);
        }
        if (typeof susp.antiRollBar === 'number') {
          susp.antiRollBar = Math.round(susp.antiRollBar);
        }
        if (typeof susp.rideHeight === 'number') {
          susp.rideHeight = Math.round(susp.rideHeight);
        }
        
        // Round damper values (can be object or number)
        if (typeof susp.damper === 'number') {
          susp.damper = Math.round(susp.damper);
        } else if (typeof susp.damper === 'object' && susp.damper) {
          if (typeof susp.damper.bump === 'number') {
            susp.damper.bump = Math.round(susp.damper.bump);
          }
          if (typeof susp.damper.rebound === 'number') {
            susp.damper.rebound = Math.round(susp.damper.rebound);
          }
        }
        
        // Round alignment values to 1 decimal place
        if (typeof susp.camber === 'number') {
          susp.camber = Math.round(susp.camber * 10) / 10;
        }
        if (typeof susp.caster === 'number') {
          susp.caster = Math.round(susp.caster * 10) / 10;
        }
        if (typeof susp.toe === 'number') {
          susp.toe = Math.round(susp.toe * 10) / 10;
        }
      }
    });
  }
  
  // Round aerodynamics values
  if (roundedSetup.aerodynamics) {
    Object.keys(roundedSetup.aerodynamics).forEach(key => {
      if (typeof roundedSetup.aerodynamics[key] === 'number') {
        roundedSetup.aerodynamics[key] = Math.round(roundedSetup.aerodynamics[key]);
      }
    });
  }
  
  // Round differential values
  if (roundedSetup.differential) {
    Object.keys(roundedSetup.differential).forEach(key => {
      if (typeof roundedSetup.differential[key] === 'number') {
        roundedSetup.differential[key] = Math.round(roundedSetup.differential[key]);
      } else if (typeof roundedSetup.differential[key] === 'object' && roundedSetup.differential[key]) {
        // Handle nested objects like ramp settings
        Object.keys(roundedSetup.differential[key]).forEach(subKey => {
          if (typeof roundedSetup.differential[key][subKey] === 'number') {
            roundedSetup.differential[key][subKey] = Math.round(roundedSetup.differential[key][subKey] * 10) / 10;
          }
        });
      }
    });
  }
  
  // Round brake values
  if (roundedSetup.brakes) {
    Object.keys(roundedSetup.brakes).forEach(key => {
      if (typeof roundedSetup.brakes[key] === 'number') {
        if (key === 'balance') {
          // Brake balance to 1 decimal place
          roundedSetup.brakes[key] = Math.round(roundedSetup.brakes[key] * 10) / 10;
        } else {
          roundedSetup.brakes[key] = Math.round(roundedSetup.brakes[key]);
        }
      } else if (typeof roundedSetup.brakes[key] === 'object' && roundedSetup.brakes[key]) {
        // Handle nested objects like ducting
        Object.keys(roundedSetup.brakes[key]).forEach(subKey => {
          if (typeof roundedSetup.brakes[key][subKey] === 'number') {
            roundedSetup.brakes[key][subKey] = Math.round(roundedSetup.brakes[key][subKey]);
          }
        });
      }
    });
  }
  
  // Round tire pressures to 1 decimal place
  if (roundedSetup.tires?.pressure) {
    Object.keys(roundedSetup.tires.pressure).forEach(tire => {
      if (typeof roundedSetup.tires.pressure[tire] === 'number') {
        roundedSetup.tires.pressure[tire] = Math.round(roundedSetup.tires.pressure[tire] * 10) / 10;
      }
    });
  }
  
  // Round gearing values
  if (roundedSetup.gearing) {
    if (roundedSetup.gearing.final && typeof roundedSetup.gearing.final === 'number') {
      roundedSetup.gearing.final = Math.round(roundedSetup.gearing.final * 100) / 100; // 2 decimal places
    }
    if (roundedSetup.gearing.ratios) {
      Object.keys(roundedSetup.gearing.ratios).forEach(gear => {
        if (typeof roundedSetup.gearing.ratios[gear] === 'number') {
          roundedSetup.gearing.ratios[gear] = Math.round(roundedSetup.gearing.ratios[gear] * 100) / 100; // 2 decimal places
        }
      });
    }
  }
  
  // Round fuel amount
  if (roundedSetup.fuel?.amount && typeof roundedSetup.fuel.amount === 'number') {
    roundedSetup.fuel.amount = Math.round(roundedSetup.fuel.amount);
  }
  
  // Round NASCAR-specific values
  if (typeof roundedSetup.trackBar === 'number') {
    roundedSetup.trackBar = Math.round(roundedSetup.trackBar);
  }
  if (typeof roundedSetup.wedge === 'number') {
    roundedSetup.wedge = Math.round(roundedSetup.wedge * 10) / 10;
  }
  if (roundedSetup.weight) {
    Object.keys(roundedSetup.weight).forEach(key => {
      if (typeof roundedSetup.weight[key] === 'number') {
        roundedSetup.weight[key] = Math.round(roundedSetup.weight[key] * 10) / 10;
      }
    });
  }
  
  return roundedSetup;
}

// Helper function to apply setup style with realistic iRacing principles
function applySetupStyle(baseSetup, style, carCategory, trackType) {
  const setup = JSON.parse(JSON.stringify(baseSetup)); // Deep clone
  
  if (style === 'safe') {
    // SAFE Configuration - Stability and predictability over ultimate pace
    // Based on real iRacing setup principles for consistent, forgiving handling
    
    // Softer suspension for better mechanical grip and stability
    if (setup.suspension) {
      setup.suspension.front.spring *= 0.88; // Softer springs for better tire contact
      setup.suspension.rear.spring *= 0.90;
      
      // Handle damper adjustments (object or number)
      if (typeof setup.suspension.front.damper === 'object') {
        setup.suspension.front.damper.bump *= 0.92;
        setup.suspension.front.damper.rebound *= 0.92;
      } else if (typeof setup.suspension.front.damper === 'number') {
        setup.suspension.front.damper *= 0.92;
      }
      if (typeof setup.suspension.rear.damper === 'object') {
        setup.suspension.rear.damper.bump *= 0.92;
        setup.suspension.rear.damper.rebound *= 0.92;
      } else if (typeof setup.suspension.rear.damper === 'number') {
        setup.suspension.rear.damper *= 0.92;
      }
      
      setup.suspension.front.antiRollBar *= 0.85; // Less roll stiffness for better grip
      setup.suspension.rear.antiRollBar *= 0.88;
      setup.suspension.front.rideHeight += 2; // Higher ride height for stability
      setup.suspension.rear.rideHeight += 2;
      
      // Conservative alignment settings
      if (setup.suspension.front.camber) setup.suspension.front.camber += 0.2; // Less aggressive camber
      if (setup.suspension.rear.camber) setup.suspension.rear.camber += 0.1;
    }
    
    // Conservative aerodynamics - more downforce for stability
    if (setup.aerodynamics) {
      if (setup.aerodynamics.frontWing) setup.aerodynamics.frontWing += 1; // More front downforce
      if (setup.aerodynamics.rearWing) setup.aerodynamics.rearWing += 2; // More rear downforce for stability
      if (setup.aerodynamics.frontSplitter) setup.aerodynamics.frontSplitter += 1;
      if (setup.aerodynamics.rearSpoiler) setup.aerodynamics.rearSpoiler += 2;
    }
    
    // Open differential for predictable handling
    if (setup.differential) {
      setup.differential.preload *= 0.85; // Less preload for smoother operation
      setup.differential.power *= 0.78; // Less locking on power for stability
      setup.differential.coast *= 0.75; // Less locking on coast for predictability
    }
    
    // Conservative brake setup
    if (setup.brakes) {
      setup.brakes.balance += 2; // More forward bias for stability (less rear lockup)
      setup.brakes.pressure *= 0.95; // Lower pressure to avoid lockups
    }
    
    // Conservative tire pressures for consistent grip
    if (setup.tires?.pressure) {
      Object.keys(setup.tires.pressure).forEach(tire => {
        setup.tires.pressure[tire] += 0.5; // Slightly higher pressures for consistency
      });
    }
    
  } else if (style === 'aggressive') {
    // AGGRESSIVE Configuration - Maximum performance and responsiveness
    // Based on qualifying/sprint race setups in iRacing
    
    // Stiffer suspension for maximum responsiveness
    if (setup.suspension) {
      setup.suspension.front.spring *= 1.12; // Stiffer springs for better aero platform
      setup.suspension.rear.spring *= 1.10;
      
      // Handle damper adjustments (object or number)
      if (typeof setup.suspension.front.damper === 'object') {
        setup.suspension.front.damper.bump *= 1.08;
        setup.suspension.front.damper.rebound *= 1.08;
      } else if (typeof setup.suspension.front.damper === 'number') {
        setup.suspension.front.damper *= 1.08;
      }
      if (typeof setup.suspension.rear.damper === 'object') {
        setup.suspension.rear.damper.bump *= 1.08;
        setup.suspension.rear.damper.rebound *= 1.08;
      } else if (typeof setup.suspension.rear.damper === 'number') {
        setup.suspension.rear.damper *= 1.08;
      }
      
      setup.suspension.front.antiRollBar *= 1.15; // More roll stiffness for precision
      setup.suspension.rear.antiRollBar *= 1.12;
      setup.suspension.front.rideHeight -= 2; // Lower for better aero and CoG
      setup.suspension.rear.rideHeight -= 2;
      
      // Aggressive alignment settings
      if (setup.suspension.front.camber) setup.suspension.front.camber -= 0.3; // More aggressive camber
      if (setup.suspension.rear.camber) setup.suspension.rear.camber -= 0.2;
    }
    
    // Aggressive aerodynamics - balance between downforce and drag
    if (setup.aerodynamics && trackType === 'road') {
      // Slightly reduce downforce for better straight-line speed
      if (setup.aerodynamics.frontWing) setup.aerodynamics.frontWing = Math.max(1, setup.aerodynamics.frontWing - 1);
      if (setup.aerodynamics.rearWing) setup.aerodynamics.rearWing = Math.max(1, setup.aerodynamics.rearWing - 1);
      if (setup.aerodynamics.frontSplitter) setup.aerodynamics.frontSplitter = Math.max(1, setup.aerodynamics.frontSplitter - 1);
    }
    
    // Locked differential for maximum power transfer
    if (setup.differential) {
      setup.differential.preload *= 1.12; // More preload for quicker engagement
      setup.differential.power *= 1.18; // More locking for better traction
      setup.differential.coast *= 1.08; // More coast locking for stability under braking
    }
    
    // Aggressive brake setup for maximum performance
    if (setup.brakes) {
      setup.brakes.balance -= 1; // Slightly more rear bias for shorter stopping distances
      setup.brakes.pressure *= 1.03; // Higher pressure for maximum braking force
    }
    
    // Aggressive tire pressures for maximum grip
    if (setup.tires?.pressure) {
      Object.keys(setup.tires.pressure).forEach(tire => {
        // Lower pressures for larger contact patch, but not too low
        setup.tires.pressure[tire] = Math.max(19.0, setup.tires.pressure[tire] - 0.8);
      });
    }
    
    // Category-specific aggressive adjustments
    if (carCategory === 'GT3') {
      // GT3 aggressive: more rake for better aero balance
      if (setup.suspension) {
        setup.suspension.front.rideHeight -= 3; // More rake for aero efficiency
      }
    } else if (carCategory === 'Formula') {
      // Formula aggressive: qualifying-style high downforce
      if (setup.aerodynamics?.frontWing) setup.aerodynamics.frontWing += 1;
      if (setup.aerodynamics?.rearWing) setup.aerodynamics.rearWing += 1;
    }
  }
  
  // 'balanced' style uses the base setup without modifications
  
  // Round all values after style modifications
  return roundSetupValues(setup);
}

// Helper function to generate default setup with realistic iRacing values
function generateDefaultSetup(carCategory, trackType) {
  const baseSetups = {
    'GT3': {
      road: {
        suspension: {
          // GT3 spring rates: ~950-1050 N/mm (170-185 lb/in equivalent)
          front: { 
            spring: 950, 
            damper: { bump: 65, rebound: 70 }, 
            antiRollBar: 8, 
            rideHeight: 55,
            camber: -2.8,
            caster: 6.2,
            toe: 0.1
          },
          rear: { 
            spring: 1050, 
            damper: { bump: 60, rebound: 65 }, 
            antiRollBar: 6, 
            rideHeight: 60,
            camber: -2.2,
            toe: 0.2
          }
        },
        // GT3 aero: Medium downforce setup (+3 to +6 wing range typical)
        aerodynamics: { 
          frontWing: 4, 
          rearWing: 6,
          frontSplitter: 3,
          rearDiffuser: 2
        },
        differential: { 
          preload: 80, 
          power: 65, 
          coast: 45,
          ramp: { power: 1.5, coast: 1.2 }
        },
        // GT3 brake bias: 52-54% typical
        brakes: { 
          balance: 53.2, 
          pressure: 80,
          ducting: { front: 3, rear: 2 },
          pads: { front: 'medium', rear: 'medium' }
        },
        // GT3 optimal hot pressures: 22-24 psi
        tires: { 
          pressure: { fl: 23.0, fr: 23.0, rl: 22.5, rr: 22.5 },
          compound: 'medium'
        },
        gearing: {
          final: 3.73,
          ratios: {
            '1st': 2.85,
            '2nd': 2.05,
            '3rd': 1.58,
            '4th': 1.28,
            '5th': 1.05,
            '6th': 0.89
          }
        },
        fuel: {
          amount: 65,
          strategy: 'balanced'
        }
      },
      oval: {
        suspension: {
          front: { 
            spring: 1100, 
            damper: { bump: 70, rebound: 75 }, 
            antiRollBar: 12, 
            rideHeight: 45,
            camber: -3.5,
            caster: 8.0,
            toe: 0.0
          },
          rear: { 
            spring: 1200, 
            damper: { bump: 65, rebound: 70 }, 
            antiRollBar: 8, 
            rideHeight: 50,
            camber: -1.8,
            toe: 0.1
          }
        },
        aerodynamics: { frontWing: 6, rearWing: 8, frontSplitter: 5 },
        differential: { preload: 90, power: 75, coast: 55 },
        brakes: { balance: 52.0, pressure: 80 },
        tires: { 
          pressure: { fl: 24.0, fr: 24.0, rl: 23.0, rr: 23.0 },
          compound: 'hard'
        },
        gearing: { final: 3.55 },
        fuel: { amount: 75 }
      }
    },
    'Formula': {
      road: {
        suspension: {
          // Formula cars: Very stiff springs for high downforce
          front: { 
            spring: 1400, 
            damper: { bump: 80, rebound: 85 }, 
            antiRollBar: 15, 
            rideHeight: 35,
            camber: -3.2,
            caster: 7.5,
            toe: 0.0
          },
          rear: { 
            spring: 1500, 
            damper: { bump: 75, rebound: 80 }, 
            antiRollBar: 12, 
            rideHeight: 40,
            camber: -2.8,
            toe: 0.1
          }
        },
        // Formula: High downforce setup
        aerodynamics: { 
          frontWing: 8, 
          rearWing: 12,
          frontFlap: 2,
          rearFlap: 3
        },
        differential: { preload: 60, power: 50, coast: 35 },
        // Formula: More forward brake bias
        brakes: { 
          balance: 56.5, 
          pressure: 85,
          ducting: { front: 4, rear: 3 }
        },
        // Formula: Higher tire pressures
        tires: { 
          pressure: { fl: 24.0, fr: 24.0, rl: 23.5, rr: 23.5 },
          compound: 'soft'
        },
        gearing: {
          final: 4.12,
          ratios: {
            '1st': 3.15,
            '2nd': 2.28,
            '3rd': 1.75,
            '4th': 1.42,
            '5th': 1.18,
            '6th': 1.00,
            '7th': 0.86,
            '8th': 0.75
          }
        },
        fuel: { amount: 45 }
      }
    },
    'NASCAR': {
      oval: {
        suspension: {
          // NASCAR: Very stiff springs (1000+ lb/in typical)
          front: { 
            spring: 1600, 
            damper: { bump: 90, rebound: 95 }, 
            antiRollBar: 20, 
            rideHeight: 40,
            camber: -4.0,
            caster: 9.5,
            toe: 0.0
          },
          rear: { 
            spring: 1700, 
            damper: { bump: 85, rebound: 90 }, 
            antiRollBar: 15, 
            rideHeight: 45,
            camber: -2.5,
            toe: 0.2
          }
        },
        // NASCAR: Oval-specific aero
        aerodynamics: { 
          frontSplitter: 4, 
          rearSpoiler: 7,
          grille: 'medium'
        },
        differential: { preload: 100, power: 80, coast: 60 },
        // NASCAR: Balanced brake bias for oval
        brakes: { 
          balance: 50.0, 
          pressure: 75,
          ducting: { front: 2, rear: 1 }
        },
        // NASCAR: Higher pressures with cross-weight consideration
        tires: { 
          pressure: { fl: 32.0, fr: 35.0, rl: 31.0, rr: 34.0 },
          compound: 'hard'
        },
        gearing: {
          final: 3.08,
          ratios: {
            '1st': 2.97,
            '2nd': 1.78,
            '3rd': 1.30,
            '4th': 1.00
          }
        },
        fuel: { amount: 85 },
        trackBar: 12,
        wedge: 52.5,
        weight: {
          front: 52.0,
          left: 56.0
        }
      }
    },
    'GT4': {
      road: {
        suspension: {
          front: { 
            spring: 850, 
            damper: { bump: 55, rebound: 60 }, 
            antiRollBar: 6, 
            rideHeight: 60,
            camber: -2.5,
            caster: 5.8,
            toe: 0.1
          },
          rear: { 
            spring: 950, 
            damper: { bump: 50, rebound: 55 }, 
            antiRollBar: 4, 
            rideHeight: 65,
            camber: -2.0,
            toe: 0.2
          }
        },
        aerodynamics: { frontWing: 3, rearWing: 4 },
        differential: { preload: 70, power: 55, coast: 35 },
        brakes: { balance: 54.0, pressure: 75 },
        tires: { 
          pressure: { fl: 22.5, fr: 22.5, rl: 22.0, rr: 22.0 },
          compound: 'medium'
        },
        gearing: { final: 3.92 },
        fuel: { amount: 60 }
      }
    },
    'Prototype': {
      road: {
        suspension: {
          front: { 
            spring: 1200, 
            damper: { bump: 75, rebound: 80 }, 
            antiRollBar: 12, 
            rideHeight: 45,
            camber: -3.0,
            caster: 7.0,
            toe: 0.0
          },
          rear: { 
            spring: 1300, 
            damper: { bump: 70, rebound: 75 }, 
            antiRollBar: 10, 
            rideHeight: 50,
            camber: -2.5,
            toe: 0.1
          }
        },
        aerodynamics: { frontWing: 6, rearWing: 9 },
        differential: { preload: 75, power: 60, coast: 40 },
        brakes: { balance: 55.0, pressure: 85 },
        tires: { 
          pressure: { fl: 23.5, fr: 23.5, rl: 23.0, rr: 23.0 },
          compound: 'soft'
        },
        gearing: { final: 3.45 },
        fuel: { amount: 70 }
      }
    }
  };
  
  // Fallback logic with better category matching
  if (baseSetups[carCategory]?.[trackType]) {
    return baseSetups[carCategory][trackType];
  }
  
  // Try to find a setup for the same category but different track type
  if (baseSetups[carCategory]) {
    const availableTypes = Object.keys(baseSetups[carCategory]);
    if (availableTypes.length > 0) {
      return baseSetups[carCategory][availableTypes[0]];
    }
  }
  
  // Final fallback to GT3 road
  return baseSetups['GT3']['road'];
}

// Helper function to apply track adaptations with realistic iRacing considerations
function applyTrackAdaptations(baseSetup, track, characteristics, conditions) {
  const setup = JSON.parse(JSON.stringify(baseSetup)); // Deep clone
  
  if (!characteristics) return setup;
  
  // Adjust for track length - realistic aero considerations
  if (characteristics.length_km > 5) { // Long tracks (Monza, Le Mans style)
    if (setup.aerodynamics) {
      // Reduce downforce for higher top speed on long straights
      if (setup.aerodynamics.frontWing) setup.aerodynamics.frontWing = Math.max(1, setup.aerodynamics.frontWing - 2);
      if (setup.aerodynamics.rearWing) setup.aerodynamics.rearWing = Math.max(1, setup.aerodynamics.rearWing - 3);
      if (setup.aerodynamics.frontSplitter) setup.aerodynamics.frontSplitter = Math.max(1, setup.aerodynamics.frontSplitter - 1);
    }
    // Stiffer suspension for high-speed stability
    if (setup.suspension) {
      setup.suspension.front.spring *= 1.05;
      setup.suspension.rear.spring *= 1.05;
    }
    // Long tracks - reduce tire pressure for heat management
    if (setup.tires?.pressure) {
      Object.keys(setup.tires.pressure).forEach(tire => {
        setup.tires.pressure[tire] -= 0.5;
      });
    }
  } else if (characteristics.length_km < 2) { // Short tracks (Monaco, street circuits)
    if (setup.aerodynamics) {
      // Increase downforce for better mechanical grip in slow corners
      if (setup.aerodynamics.frontWing) setup.aerodynamics.frontWing += 1;
      if (setup.aerodynamics.rearWing) setup.aerodynamics.rearWing += 2;
      if (setup.aerodynamics.frontSplitter) setup.aerodynamics.frontSplitter += 1;
    }
    // Softer suspension for better mechanical grip
    if (setup.suspension) {
      setup.suspension.front.spring *= 0.95;
      setup.suspension.rear.spring *= 0.95;
    }
  }
  
  // Adjust for elevation changes (Nürburgring, Bathurst style)
  if (characteristics.elevation_change > 50) {
    if (setup.suspension) {
      // Stiffer springs for better control over crests and dips
      setup.suspension.front.spring *= 1.08;
      setup.suspension.rear.spring *= 1.06;
      // Higher ride height for clearance
      setup.suspension.front.rideHeight += 2;
      setup.suspension.rear.rideHeight += 2;
    }
  }
  
  // Adjust for banking (oval tracks)
  if (characteristics.banking_max > 15) {
    if (setup.suspension) {
      // Much stiffer springs for banking loads
      setup.suspension.front.spring *= 1.15;
      setup.suspension.rear.spring *= 1.12;
      setup.suspension.front.antiRollBar += 3;
      setup.suspension.rear.antiRollBar += 2;
    }
    // Oval-specific tire pressure adjustments for cross-weight
    if (setup.tires?.pressure) {
      setup.tires.pressure.fr += 2.0; // Right front higher for banking
      setup.tires.pressure.rr += 2.0; // Right rear higher for banking
    }
  }
  
  // Adjust based on grip level (track surface conditions)
  if (characteristics.grip_level === 'low') {
    // Low grip - softer setup for better mechanical grip
    if (setup.suspension) {
      setup.suspension.front.spring *= 0.88;
      setup.suspension.rear.spring *= 0.90;
    }
    if (setup.differential) {
      setup.differential.power -= 15; // Less aggressive differential
      setup.differential.coast -= 8;
    }
    // Lower tire pressures for better contact patch
    if (setup.tires?.pressure) {
      Object.keys(setup.tires.pressure).forEach(tire => {
        setup.tires.pressure[tire] = Math.max(18.0, setup.tires.pressure[tire] - 1.5);
      });
    }
  } else if (characteristics.grip_level === 'high') {
    // High grip - stiffer setup to handle more load
    if (setup.suspension) {
      setup.suspension.front.spring *= 1.06;
      setup.suspension.rear.spring *= 1.04;
    }
    // Higher tire pressures for high grip surface
    if (setup.tires?.pressure) {
      Object.keys(setup.tires.pressure).forEach(tire => {
        setup.tires.pressure[tire] += 0.5;
      });
    }
  }
  
  // Adjust based on downforce importance
  if (characteristics.downforce_importance === 'high' && setup.aerodynamics) {
    if (setup.aerodynamics.frontWing) setup.aerodynamics.frontWing += 2;
    if (setup.aerodynamics.rearWing) setup.aerodynamics.rearWing += 3;
  }
  
  // Weather and temperature adjustments
  if (conditions.weather === 'rain') {
    // Rain setup adjustments
    if (setup.tires?.pressure) {
      Object.keys(setup.tires.pressure).forEach(tire => {
        setup.tires.pressure[tire] += 1.5; // Higher pressure for rain tires
      });
    }
    if (setup.suspension) {
      setup.suspension.front.spring *= 0.85; // Softer for rain
      setup.suspension.rear.spring *= 0.88;
    }
    if (setup.differential) {
      setup.differential.power -= 20; // Much less aggressive in rain
      setup.differential.coast -= 10;
    }
  }
  
  // Temperature-based adjustments
  if (conditions.temperature) {
    if (conditions.temperature > 30) { // Hot conditions
      if (setup.tires?.pressure) {
        Object.keys(setup.tires.pressure).forEach(tire => {
          setup.tires.pressure[tire] -= 1.0; // Lower starting pressures for hot weather
        });
      }
    } else if (conditions.temperature < 15) { // Cold conditions
      if (setup.tires?.pressure) {
        Object.keys(setup.tires.pressure).forEach(tire => {
          setup.tires.pressure[tire] += 1.0; // Higher starting pressures for cold weather
        });
      }
    }
  }
  
  // Round all values after track adaptations
  return roundSetupValues(setup);
}

// Helper function to apply session modifications
function applySessionModifications(setup, sessionType) {
  const modifiedSetup = JSON.parse(JSON.stringify(setup));
  
  switch (sessionType) {
    case 'qualifying':
      // Qualifying setup - more aggressive
      if (modifiedSetup.aerodynamics?.frontWing) {
        modifiedSetup.aerodynamics.frontWing += 1;
      }
      if (modifiedSetup.aerodynamics?.rearWing) {
        modifiedSetup.aerodynamics.rearWing += 2;
      }
      break;
      
    case 'race':
      // Race setup - more conservative for tire wear
      if (modifiedSetup.tires?.pressure) {
        Object.keys(modifiedSetup.tires.pressure).forEach(tire => {
          modifiedSetup.tires.pressure[tire] += 0.2;
        });
      }
      break;
      
    case 'practice':
      // Practice setup - balanced
      break;
  }
  
  // Round all values after session modifications
  return roundSetupValues(modifiedSetup);
}

// Helper function to get applied adaptations
function getAppliedAdaptations(track, characteristics, conditions) {
  const adaptations = [];
  
  if (characteristics) {
    if (characteristics.length_km > 5) {
      adaptations.push('Reduced tire pressure for long track');
    }
    if (characteristics.elevation_change > 50) {
      adaptations.push('Stiffened suspension for elevation changes');
    }
    if (characteristics.banking_max > 15) {
      adaptations.push('Adjusted anti-roll bars for banking');
    }
    if (characteristics.grip_level === 'low') {
      adaptations.push('Softened setup for low grip surface');
    }
    if (characteristics.downforce_importance === 'high') {
      adaptations.push('Increased downforce for high-speed track');
    }
  }
  
  if (conditions.weather === 'rain') {
    adaptations.push('Rain setup modifications applied');
  }
  
  return adaptations;
}

// Helper function to calculate confidence
function calculateConfidence(car, track, characteristics) {
  let confidence = 0.7; // Base confidence
  
  if (characteristics) {
    confidence += 0.2; // Boost if we have track characteristics
  }
  
  // Popular car categories get higher confidence
  if (['GT3', 'Formula', 'NASCAR'].includes(car.category)) {
    confidence += 0.1;
  }
  
  return Math.min(confidence, 1.0);
}

// Helper function to generate recommendations
function generateRecommendations(car, track, characteristics) {
  const recommendations = [];
  
  if (track.type === 'oval') {
    recommendations.push('Consider adjusting tire pressures based on track temperature');
    recommendations.push('Monitor tire wear during longer runs');
  } else if (track.type === 'road') {
    recommendations.push('Fine-tune brake balance for different corner types');
    recommendations.push('Adjust differential settings based on track layout');
  }
  
  if (characteristics) {
    if (characteristics.brake_wear === 'high') {
      recommendations.push('Consider more conservative brake settings for this track');
    }
    if (characteristics.tire_wear === 'high') {
      recommendations.push('Monitor tire temperatures and adjust pressures accordingly');
    }
  }
  
  recommendations.push('Test the setup in practice sessions before racing');
  recommendations.push('Make small adjustments based on your driving style');
  
  return recommendations;
}

module.exports = router;