const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { optionalAuth } = require('./auth');
const { cars, tracks } = require('../../backend/update_iracing_data');

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

// Get all cars
router.get('/cars', async (req, res) => {
  try {
    const carsWithIds = cars.map((car, index) => ({
      id: index + 1,
      name: car.name,
      category: car.category
    }));
    console.log('Returning', carsWithIds.length, 'cars');
    res.json(carsWithIds);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ error: 'Error al obtener coches' });
  }
});

// Get all tracks
router.get('/tracks', async (req, res) => {
  try {
    const tracksWithIds = tracks.map((track, index) => ({
      id: index + 1,
      name: track.name,
      type: track.type,
      country: track.country
    }));
    console.log('Returning', tracksWithIds.length, 'tracks');
    res.json(tracksWithIds);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Error al obtener circuitos' });
  }
});

// Generate setup based on parameters
router.post('/generate', optionalAuth, async (req, res) => {
  const pool = getPool();
  try {
    const {
      car_id,
      track_id,
      session_type = 'Race',
      setup_style = 'balanced',
      weather_conditions,
      track_conditions = 'optimal'
    } = req.body;
    
    if (!car_id || !track_id) {
      return res.status(400).json({ error: 'Car ID y Track ID son requeridos' });
    }
    
    // Get car and track information from static data
    console.log('Getting car with ID:', car_id);
    const carIndex = parseInt(car_id) - 1;
    const car = cars[carIndex];
    
    console.log('Getting track with ID:', track_id);
    const trackIndex = parseInt(track_id) - 1;
    const track = tracks[trackIndex];
    
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    // Add IDs to the objects for compatibility
    car.id = car_id;
    track.id = track_id;
    
    // Generate base setup (simplified version without similar setups dependency)
    let generatedSetup = generateBaseSetup(car, track, setup_style, session_type);
    
    // Apply weather and track conditions adjustments
    if (weather_conditions) {
      generatedSetup = applyWeatherAdjustments(generatedSetup, weather_conditions);
    }
    
    if (track_conditions !== 'optimal') {
      generatedSetup = applyTrackConditionsAdjustments(generatedSetup, track_conditions);
    }
    
    const response = {
      generated_setup: {
        setup_name: `Generated ${setup_style} setup for ${car.name} at ${track.name}`,
        description: `Auto-generated ${setup_style} setup for ${session_type} session`,
        car_id,
        track_id,
        session_type,
        data: generatedSetup,
        weather_conditions,
        track_conditions,
        setup_style
      },
      metadata: {
        car_name: car.name,
        track_name: track.name,
        reference_setups_count: 0,
        generation_method: 'baseline'
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error generating setup:', error);
    res.status(500).json({ error: 'Error al generar setup' });
  }
});

// Helper function to generate base setup
function generateBaseSetup(car, track, style, sessionType) {
  const baseSetup = {
    // Suspension
    front_spring_rate: 100,
    rear_spring_rate: 120,
    front_damper_compression: 50,
    rear_damper_compression: 55,
    front_damper_rebound: 45,
    rear_damper_rebound: 50,
    front_anti_roll_bar: 30,
    rear_anti_roll_bar: 25,
    
    // Aerodynamics
    front_wing: 50,
    rear_wing: 60,
    
    // Tires
    tire_pressure_lf: 26.0,
    tire_pressure_rf: 26.0,
    tire_pressure_lr: 24.0,
    tire_pressure_rr: 24.0,
    
    // Differential
    differential_preload: 40,
    differential_coast: 30,
    differential_power: 50,
    
    // Gearing
    final_drive: 3.5,
    
    // Brake balance
    brake_balance: 52.0
  };
  
  // Adjust based on style
  switch (style) {
    case 'aggressive':
      baseSetup.front_wing += 10;
      baseSetup.rear_wing += 15;
      baseSetup.brake_balance += 2;
      break;
    case 'stable':
      baseSetup.front_spring_rate += 20;
      baseSetup.rear_spring_rate += 25;
      baseSetup.front_anti_roll_bar += 10;
      break;
    case 'loose':
      baseSetup.rear_wing -= 10;
      baseSetup.rear_anti_roll_bar -= 5;
      break;
  }
  
  // Adjust based on track type
  if (track.type === 'road') {
    baseSetup.front_wing += 5;
    baseSetup.rear_wing += 5;
  } else if (track.type === 'oval') {
    baseSetup.front_wing -= 10;
    baseSetup.rear_wing -= 15;
  }
  
  return baseSetup;
}

// Helper function to optimize setup from similar setups
function optimizeSetupFromSimilar(baseSetup, similarSetups) {
  const optimizedSetup = { ...baseSetup };
  
  // Calculate weighted averages from similar setups
  for (const key in baseSetup) {
    let weightedSum = 0;
    let totalWeight = 0;
    
    similarSetups.forEach(setup => {
      if (setup.data[key] !== undefined) {
        const weight = setup.rating_avg || 3.0;
        weightedSum += setup.data[key] * weight;
        totalWeight += weight;
      }
    });
    
    if (totalWeight > 0) {
      const averageValue = weightedSum / totalWeight;
      // Blend with base setup (70% similar setups, 30% base)
      optimizedSetup[key] = Math.round((averageValue * 0.7 + baseSetup[key] * 0.3) * 100) / 100;
    }
  }
  
  return optimizedSetup;
}

// Helper function to apply weather adjustments
function applyWeatherAdjustments(setup, weather) {
  const adjustedSetup = { ...setup };
  
  if (weather.temperature > 25) { // Hot weather
    adjustedSetup.tire_pressure_lf += 1.0;
    adjustedSetup.tire_pressure_rf += 1.0;
    adjustedSetup.tire_pressure_lr += 1.0;
    adjustedSetup.tire_pressure_rr += 1.0;
  } else if (weather.temperature < 15) { // Cold weather
    adjustedSetup.tire_pressure_lf -= 1.0;
    adjustedSetup.tire_pressure_rf -= 1.0;
    adjustedSetup.tire_pressure_lr -= 1.0;
    adjustedSetup.tire_pressure_rr -= 1.0;
  }
  
  if (weather.conditions === 'rain') {
    adjustedSetup.front_wing += 10;
    adjustedSetup.rear_wing += 15;
    adjustedSetup.brake_balance -= 2;
  }
  
  return adjustedSetup;
}

// Helper function to apply track conditions adjustments
function applyTrackConditionsAdjustments(setup, conditions) {
  const adjustedSetup = { ...setup };
  
  switch (conditions) {
    case 'green':
      adjustedSetup.tire_pressure_lf -= 0.5;
      adjustedSetup.tire_pressure_rf -= 0.5;
      adjustedSetup.tire_pressure_lr -= 0.5;
      adjustedSetup.tire_pressure_rr -= 0.5;
      break;
    case 'dusty':
      adjustedSetup.front_wing += 5;
      adjustedSetup.rear_wing += 5;
      break;
    case 'wet':
      adjustedSetup.front_wing += 15;
      adjustedSetup.rear_wing += 20;
      adjustedSetup.brake_balance -= 3;
      break;
  }
  
  return adjustedSetup;
}

module.exports = router;