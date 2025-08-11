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
      carId,
      trackId,
      sessionType = 'race',
      setupStyle = 'balanced',
      conditions = {}
    } = req.body;
    
    if (!carId || !trackId) {
      return res.status(400).json({ error: 'Car ID y Track ID son requeridos' });
    }
    
    // Get car and track information from static data
    console.log('Getting car with ID:', carId);
    const carIndex = parseInt(carId) - 1;
    const car = cars[carIndex];
    
    console.log('Getting track with ID:', trackId);
    const trackIndex = parseInt(trackId) - 1;
    const track = tracks[trackIndex];
    
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    // Add IDs to the objects for compatibility
    car.id = carId;
    track.id = trackId;
    
    // Generate base setup (simplified version without similar setups dependency)
    let generatedSetup = generateBaseSetup(car, track, setupStyle, sessionType);
    
    // Apply weather and track conditions adjustments
    if (conditions.weather) {
      generatedSetup = applyWeatherAdjustments(generatedSetup, conditions.weather);
    }
    
    if (conditions.track && conditions.track !== 'optimal') {
      generatedSetup = applyTrackConditionsAdjustments(generatedSetup, conditions.track);
    }
    
    const response = {
      setup: generatedSetup,
      car: {
        id: carId,
        name: car.name,
        category: car.category
      },
      track: {
        id: trackId,
        name: track.name,
        type: track.type
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        setupStyle: setupStyle,
        sessionType: sessionType,
        car_name: car.name,
        track_name: track.name,
        generation_method: 'static_data'
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
  // Default GT3 road setup structure
  const baseSetup = {
    suspension: {
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
    aerodynamics: { 
      frontWing: 4, 
      rearWing: 6,
      frontSplitter: 3
    },
    differential: { 
      preload: 80, 
      power: 65, 
      coast: 45
    },
    brakes: { 
      balance: 53.2, 
      pressure: 80,
      brakeDucts: { front: 3, rear: 2 }
    },
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
  };
  
  // Adjust based on style
  switch (style) {
    case 'aggressive':
      baseSetup.aerodynamics.frontWing += 2;
      baseSetup.aerodynamics.rearWing += 3;
      baseSetup.brakes.balance += 1.5;
      baseSetup.suspension.front.spring += 50;
      baseSetup.suspension.rear.spring += 50;
      break;
    case 'safe':
      baseSetup.suspension.front.spring -= 50;
      baseSetup.suspension.rear.spring -= 50;
      baseSetup.aerodynamics.frontWing -= 1;
      baseSetup.aerodynamics.rearWing += 1;
      baseSetup.brakes.balance -= 1.0;
      break;
    case 'balanced':
    default:
      // Keep base values
      break;
  }
  
  // Adjust based on track type
  if (track.type === 'oval') {
    baseSetup.aerodynamics.frontWing += 2;
    baseSetup.aerodynamics.rearWing += 2;
    baseSetup.suspension.front.spring += 100;
    baseSetup.suspension.rear.spring += 100;
    baseSetup.tires.pressure.fl += 1.0;
    baseSetup.tires.pressure.fr += 1.0;
    baseSetup.tires.pressure.rl += 1.0;
    baseSetup.tires.pressure.rr += 1.0;
  }
  
  // Adjust based on session type
  if (sessionType === 'qualifying') {
    baseSetup.aerodynamics.frontWing += 1;
    baseSetup.aerodynamics.rearWing += 2;
    baseSetup.fuel.amount = Math.max(20, baseSetup.fuel.amount - 30);
  }
  
  return baseSetup;
}

// Helper function to apply weather adjustments
function applyWeatherAdjustments(setup, weather) {
  const adjustedSetup = JSON.parse(JSON.stringify(setup));
  
  if (weather === 'rain' || weather === 'wet') {
    // Wet weather adjustments
    adjustedSetup.aerodynamics.frontWing += 2;
    adjustedSetup.aerodynamics.rearWing += 3;
    adjustedSetup.suspension.front.spring -= 100;
    adjustedSetup.suspension.rear.spring -= 100;
    adjustedSetup.brakes.balance -= 2.0;
    adjustedSetup.tires.pressure.fl -= 2.0;
    adjustedSetup.tires.pressure.fr -= 2.0;
    adjustedSetup.tires.pressure.rl -= 2.0;
    adjustedSetup.tires.pressure.rr -= 2.0;
  }
  
  return adjustedSetup;
}

// Helper function to apply track condition adjustments
function applyTrackConditionsAdjustments(setup, trackConditions) {
  const adjustedSetup = JSON.parse(JSON.stringify(setup));
  
  if (trackConditions === 'low_grip') {
    // Low grip adjustments
    adjustedSetup.suspension.front.spring -= 50;
    adjustedSetup.suspension.rear.spring -= 50;
    adjustedSetup.aerodynamics.rearWing += 1;
    adjustedSetup.differential.power -= 10;
  } else if (trackConditions === 'high_grip') {
    // High grip adjustments
    adjustedSetup.suspension.front.spring += 50;
    adjustedSetup.suspension.rear.spring += 50;
    adjustedSetup.aerodynamics.frontWing += 1;
    adjustedSetup.differential.power += 10;
  }
  
  return adjustedSetup;
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