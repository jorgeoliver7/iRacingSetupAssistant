const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Lista completa de coches de iRacing (basada en información de 2024-2025)
const cars = [
  // NASCAR
  { name: 'NASCAR Cup Series Chevrolet Camaro ZL1', category: 'NASCAR', type: 'Stock Car' },
  { name: 'NASCAR Cup Series Ford Mustang', category: 'NASCAR', type: 'Stock Car' },
  { name: 'NASCAR Cup Series Toyota Camry', category: 'NASCAR', type: 'Stock Car' },
  { name: 'NASCAR Next Gen Chevrolet Camaro ZL1', category: 'NASCAR', type: 'Stock Car' },
  { name: 'NASCAR Next Gen Ford Mustang', category: 'NASCAR', type: 'Stock Car' },
  { name: 'NASCAR Next Gen Toyota Camry', category: 'NASCAR', type: 'Stock Car' },
  { name: 'NASCAR Xfinity Chevrolet Camaro', category: 'NASCAR', type: 'Stock Car' },
  { name: 'NASCAR Xfinity Ford Mustang', category: 'NASCAR', type: 'Stock Car' },
  { name: 'NASCAR Xfinity Toyota Supra', category: 'NASCAR', type: 'Stock Car' },
  { name: 'NASCAR Truck Series Chevrolet Silverado', category: 'NASCAR', type: 'Truck' },
  { name: 'NASCAR Truck Series Ford F150', category: 'NASCAR', type: 'Truck' },
  { name: 'NASCAR Truck Series Toyota Tundra TRD Pro', category: 'NASCAR', type: 'Truck' },
  { name: 'JR Motorsports Street Stock', category: 'NASCAR', type: 'Street Stock' },
  { name: 'Legends Ford \'34 Coupe', category: 'NASCAR', type: 'Legends' },
  { name: 'Super Late Model', category: 'NASCAR', type: 'Late Model' },
  { name: 'NASCAR Late Model Stock', category: 'NASCAR', type: 'Late Model' },
  { name: 'Whelen Tour Modified', category: 'NASCAR', type: 'Modified' },
  { name: 'SK Modified', category: 'NASCAR', type: 'Modified' },
  { name: 'ARCA Menards Chevrolet Impala', category: 'NASCAR', type: 'Stock Car' },
  
  // Formula 1 & Open Wheel
  { name: 'Mercedes-AMG W13 F1', category: 'Formula 1', type: 'Formula 1' },
  { name: 'Mercedes-AMG W12 F1', category: 'Formula 1', type: 'Formula 1' },
  { name: 'McLaren MP4-30 F1', category: 'Formula 1', type: 'Formula 1' },
  { name: 'Williams FW31 F1', category: 'Formula 1', type: 'Formula 1' },
  { name: 'Dallara IR18 IndyCar', category: 'IndyCar', type: 'IndyCar' },
  { name: 'Dallara DW12', category: 'IndyCar', type: 'IndyCar' },
  { name: 'Indy Pro 2000', category: 'Open Wheel', type: 'Indy Pro' },
  { name: 'USF 2000', category: 'Open Wheel', type: 'Formula' },
  { name: 'Formula Vee', category: 'Open Wheel', type: 'Formula' },
  { name: 'Formula Renault 2.0', category: 'Open Wheel', type: 'Formula' },
  { name: 'Formula Renault 3.5', category: 'Open Wheel', type: 'Formula' },
  { name: 'Dallara F3', category: 'Open Wheel', type: 'Formula 3' },
  { name: 'Dallara iR-01', category: 'Open Wheel', type: 'Formula' },
  { name: 'Dallara iR05', category: 'Open Wheel', type: 'Formula' },
  { name: 'iRacing Formula iR-04', category: 'Open Wheel', type: 'Formula' },
  { name: 'Skip Barber Formula 2000', category: 'Open Wheel', type: 'Formula' },
  { name: 'Pro Mazda', category: 'Open Wheel', type: 'Formula' },
  { name: 'Lotus 49', category: 'Open Wheel', type: 'Historic Formula' },
  { name: 'Lotus 79', category: 'Open Wheel', type: 'Historic Formula' },
  { name: 'C&R Racing Silver Crown', category: 'Open Wheel', type: 'Silver Crown' },
  { name: 'Sprint Car', category: 'Open Wheel', type: 'Sprint Car' },
  
  // GT3 Cars
  { name: 'Audi R8 LMS EVO II GT3', category: 'GT3', type: 'GT3' },
  { name: 'BMW M4 GT3', category: 'GT3', type: 'GT3' },
  { name: 'Ferrari 296 GT3', category: 'GT3', type: 'GT3' },
  { name: 'Lamborghini Huracán GT3 EVO', category: 'GT3', type: 'GT3' },
  { name: 'McLaren 720S GT3 EVO', category: 'GT3', type: 'GT3' },
  { name: 'Mercedes-AMG GT3 2020', category: 'GT3', type: 'GT3' },
  { name: 'Porsche 911 GT3 R (992)', category: 'GT3', type: 'GT3' },
  { name: 'Chevrolet Corvette Z06 GT3.R', category: 'GT3', type: 'GT3' },
  { name: 'Ford Mustang GT3', category: 'GT3', type: 'GT3' },
  { name: 'Acura NSX GT3 Evo 22', category: 'GT3', type: 'GT3' },
  
  // GT4 Cars
  { name: 'Aston Martin Vantage GT4', category: 'GT4', type: 'GT4' },
  { name: 'BMW M4 G82 GT4', category: 'GT4', type: 'GT4' },
  { name: 'McLaren 570S GT4', category: 'GT4', type: 'GT4' },
  { name: 'Mercedes-AMG GT4', category: 'GT4', type: 'GT4' },
  { name: 'Porsche 718 Cayman GT4 Clubsport MR', category: 'GT4', type: 'GT4' },
  
  // GTE/GTLM Cars
  { name: 'BMW M8 GTE', category: 'GTE', type: 'GTE' },
  { name: 'Chevrolet Corvette C8.R GTE', category: 'GTE', type: 'GTE' },
  { name: 'Ferrari 488 GTE', category: 'GTE', type: 'GTE' },
  { name: 'Ford GTE', category: 'GTE', type: 'GTE' },
  { name: 'Porsche 911 RSR', category: 'GTE', type: 'GTE' },
  
  // Prototype Cars
  { name: 'Ferrari 499P', category: 'LMH', type: 'Le Mans Hypercar' },
  { name: 'BMW M Hybrid V8', category: 'LMDh', type: 'LMDh' },
  { name: 'Cadillac V-Series.R GTP', category: 'LMDh', type: 'LMDh' },
  { name: 'Acura ARX-06 GTP', category: 'LMDh', type: 'LMDh' },
  { name: 'Porsche 963 GTP', category: 'LMDh', type: 'LMDh' },
  { name: 'Dallara P217', category: 'LMP2', type: 'LMP2' },
  { name: 'Ligier JS P320', category: 'LMP3', type: 'LMP3' },
  { name: 'Radical SR10', category: 'Prototype', type: 'Sports Prototype' },
  { name: 'Radical SR8 V8', category: 'Prototype', type: 'Sports Prototype' },
  { name: 'HPD ARX-01c', category: 'Prototype', type: 'LMP1' },
  { name: 'Audi R18', category: 'Prototype', type: 'LMP1' },
  { name: 'Chevrolet Corvette C7 Daytona Prototype', category: 'Prototype', type: 'Daytona Prototype' },
  
  // Touring Cars
  { name: 'Audi RS3 LMS TCR', category: 'TCR', type: 'TCR' },
  { name: 'Honda Civic Type R TCR', category: 'TCR', type: 'TCR' },
  { name: 'Hyundai Elantra N TCR', category: 'TCR', type: 'TCR' },
  { name: 'Hyundai Veloster N TCR', category: 'TCR', type: 'TCR' },
  
  // Supercars
  { name: 'Supercars Chevrolet Camaro Gen3', category: 'Supercars', type: 'Supercar' },
  { name: 'Supercars Ford Mustang Gen3', category: 'Supercars', type: 'Supercar' },
  { name: 'Supercars Ford Mustang GT', category: 'Supercars', type: 'Supercar' },
  { name: 'Supercars Holden ZB Commodore', category: 'Supercars', type: 'Supercar' },
  
  // Road Cars
  { name: 'BMW M2 CS Racing', category: 'Road', type: 'Sports Car' },
  { name: 'Toyota GR86', category: 'Road', type: 'Sports Car' },
  { name: 'Global Mazda MX-5 Cup', category: 'Road', type: 'Cup Car' },
  { name: 'Cadillac CTS-V', category: 'Road', type: 'Sports Sedan' },
  { name: 'Kia Optima', category: 'Road', type: 'Sedan' },
  { name: 'Volkswagen Jetta TDi', category: 'Road', type: 'Sedan' },
  { name: 'Pontiac Solstice Club Sport', category: 'Road', type: 'Sports Car' },
  { name: 'Porsche 911 GT3 Cup (992)', category: 'Road', type: 'Cup Car' },
  
  // Spec Cars
  { name: 'SCCA Spec Racer Ford', category: 'Spec', type: 'Spec Racer' },
  
  // Dirt Cars
  { name: 'UMP Modified', category: 'Dirt', type: 'Modified' },
  { name: 'Dirt Legends Ford \'34 Coupe', category: 'Dirt', type: 'Legends' },
  { name: 'Dirt Street Stock', category: 'Dirt', type: 'Street Stock' },
  
  // Off-Road
  { name: 'Lucas Oil Off-Road Pro 2 Lite Truck', category: 'Off-Road', type: 'Off-Road Truck' },
  { name: 'VW Beetle', category: 'Rallycross', type: 'Rallycross' }
];

// Lista completa de circuitos de iRacing con sus variantes principales
const tracks = [
  // Circuitos de F1
  { name: 'Circuit de Spa-Francorchamps', country: 'Belgium', type: 'Road', variants: ['Grand Prix', 'Classic Pits'] },
  { name: 'Silverstone Circuit', country: 'United Kingdom', type: 'Road', variants: ['Grand Prix', 'International', 'National'] },
  { name: 'Circuit de Monaco', country: 'Monaco', type: 'Road', variants: ['Grand Prix'] },
  { name: 'Autodromo Nazionale Monza', country: 'Italy', type: 'Road', variants: ['Grand Prix', 'Junior', 'Oval'] },
  { name: 'Circuit Zandvoort', country: 'Netherlands', type: 'Road', variants: ['Grand Prix', 'Club', 'National'] },
  { name: 'Hungaroring', country: 'Hungary', type: 'Road', variants: ['Grand Prix'] },
  { name: 'Red Bull Ring', country: 'Austria', type: 'Road', variants: ['Grand Prix', 'Club', 'National'] },
  { name: 'Circuit Paul Ricard', country: 'France', type: 'Road', variants: ['Grand Prix', 'Club'] },
  { name: 'Autodromo Enzo e Dino Ferrari', country: 'Italy', type: 'Road', variants: ['Grand Prix', 'Moto'] },
  { name: 'Suzuka International Racing Course', country: 'Japan', type: 'Road', variants: ['Grand Prix', 'East', 'West'] },
  { name: 'Fuji International Speedway', country: 'Japan', type: 'Road', variants: ['Grand Prix', 'Short'] },
  { name: 'Circuit of the Americas', country: 'United States', type: 'Road', variants: ['Grand Prix', 'Club'] },
  { name: 'Autódromo José Carlos Pace', country: 'Brazil', type: 'Road', variants: ['Grand Prix', 'Moto'] },
  { name: 'Autódromo Hermanos Rodríguez', country: 'Mexico', type: 'Road', variants: ['Grand Prix', 'Club'] },
  { name: 'Circuit Gilles Villeneuve', country: 'Canada', type: 'Road', variants: ['Grand Prix'] },
  
  // Circuitos Europeos Clásicos
  { name: 'Nürburgring', country: 'Germany', type: 'Road', variants: ['Grand Prix', 'Sprint', 'Nordschleife', 'Combined'] },
  { name: 'Hockenheimring Baden-Württemberg', country: 'Germany', type: 'Road', variants: ['Grand Prix', 'Short', 'National', 'Porsche Test Track'] },
  { name: 'Brands Hatch Circuit', country: 'United Kingdom', type: 'Road', variants: ['Grand Prix', 'Indy'] },
  { name: 'Donington Park Racing Circuit', country: 'United Kingdom', type: 'Road', variants: ['Grand Prix', 'National'] },
  { name: 'Oulton Park Circuit', country: 'United Kingdom', type: 'Road', variants: ['International', 'Island', 'Fosters'] },
  { name: 'Snetterton Circuit', country: 'United Kingdom', type: 'Road', variants: ['300', '200', '100'] },
  { name: 'Knockhill Racing Circuit', country: 'United Kingdom', type: 'Road', variants: ['International', 'National', 'Reverse'] },
  { name: 'Thruxton Circuit', country: 'United Kingdom', type: 'Road', variants: ['Grand Prix'] },
  { name: 'Circuit de Barcelona-Catalunya', country: 'Spain', type: 'Road', variants: ['Grand Prix', 'Club', 'National', 'School'] },
  { name: 'Circuit Park Zandvoort', country: 'Netherlands', type: 'Road', variants: ['Grand Prix', 'Club', 'National'] },
  { name: 'Autodromo di Mugello', country: 'Italy', type: 'Road', variants: ['Grand Prix'] },
  { name: 'Autodromo Internazionale del Mugello', country: 'Italy', type: 'Road', variants: ['Grand Prix'] },
  { name: 'Automotodrom Brno', country: 'Czech Republic', type: 'Road', variants: ['Grand Prix'] },
  { name: 'Motorsport Arena Oschersleben', country: 'Germany', type: 'Road', variants: ['A Course', 'B Course', 'C Course'] },
  { name: 'Autodromo Internazionale Enzo e Dino Ferrari', country: 'Italy', type: 'Road', variants: ['Grand Prix', 'Moto'] },
  { name: 'Okayama International Circuit', country: 'Japan', type: 'Road', variants: ['Grand Prix', 'Short'] },
  
  // Circuitos Americanos
  { name: 'Road America', country: 'United States', type: 'Road', variants: ['Full Course'] },
  { name: 'Watkins Glen International', country: 'United States', type: 'Road', variants: ['Grand Prix', 'Short', 'Boot'] },
  { name: 'Laguna Seca Raceway', country: 'United States', type: 'Road', variants: ['Full Course'] },
  { name: 'Road Atlanta', country: 'United States', type: 'Road', variants: ['Full Course', 'Club'] },
  { name: 'Virginia International Raceway', country: 'United States', type: 'Road', variants: ['Full Course', 'Grand Course', 'North Course', 'South Course', 'Patriot Course'] },
  { name: 'Sebring International Raceway', country: 'United States', type: 'Road', variants: ['International', 'Club', 'Short'] },
  { name: 'Mid-Ohio Sports Car Course', country: 'United States', type: 'Road', variants: ['Full Course', 'Chicane'] },
  { name: 'Lime Rock Park', country: 'United States', type: 'Road', variants: ['Full Course', 'Chicane'] },
  { name: 'Barber Motorsports Park', country: 'United States', type: 'Road', variants: ['Full Course'] },
  { name: 'WeatherTech Raceway Laguna Seca', country: 'United States', type: 'Road', variants: ['Full Course'] },
  { name: 'Sonoma Raceway', country: 'United States', type: 'Road', variants: ['Cup', 'IndyCar', 'Long'] },
  { name: 'Portland International Raceway', country: 'United States', type: 'Road', variants: ['Full Course', 'Chicane'] },
  { name: 'Long Beach Street Circuit', country: 'United States', type: 'Road', variants: ['Grand Prix'] },
  { name: 'Detroit Belle Isle Grand Prix', country: 'United States', type: 'Road', variants: ['Grand Prix'] },
  { name: 'Streets of Toronto', country: 'Canada', type: 'Road', variants: ['Grand Prix'] },
  
  // Óvalos NASCAR
  { name: 'Daytona International Speedway', country: 'United States', type: 'Oval', variants: ['Oval', 'Road Course', 'Moto', 'Club', 'RallyCross'] },
  { name: 'Talladega Superspeedway', country: 'United States', type: 'Oval', variants: ['Superspeedway'] },
  { name: 'Indianapolis Motor Speedway', country: 'United States', type: 'Oval', variants: ['Oval', 'Road Course'] },
  { name: 'Charlotte Motor Speedway', country: 'United States', type: 'Oval', variants: ['Oval', 'Roval', 'Legends Oval', 'Infield Road Course'] },
  { name: 'Atlanta Motor Speedway', country: 'United States', type: 'Oval', variants: ['Oval', 'Road Course', 'Legends Oval'] },
  { name: 'Las Vegas Motor Speedway', country: 'United States', type: 'Oval', variants: ['Oval', 'Road Course', 'Legends Oval'] },
  { name: 'Texas Motor Speedway', country: 'United States', type: 'Oval', variants: ['Oval', 'Road Course'] },
  { name: 'Kansas Speedway', country: 'United States', type: 'Oval', variants: ['Oval', 'Road Course'] },
  { name: 'Michigan International Speedway', country: 'United States', type: 'Oval', variants: ['Oval'] },
  { name: 'Auto Club Speedway', country: 'United States', type: 'Oval', variants: ['Oval', 'Road Course', 'Infield'] },
  { name: 'Phoenix Raceway', country: 'United States', type: 'Oval', variants: ['Oval', 'Road Course'] },
  { name: 'Homestead-Miami Speedway', country: 'United States', type: 'Oval', variants: ['Oval', 'Road Course'] },
  { name: 'Martinsville Speedway', country: 'United States', type: 'Oval', variants: ['Oval'] },
  { name: 'Bristol Motor Speedway', country: 'United States', type: 'Oval', variants: ['Oval', 'Dirt'] },
  { name: 'Richmond Raceway', country: 'United States', type: 'Oval', variants: ['Oval'] },
  { name: 'Dover Motor Speedway', country: 'United States', type: 'Oval', variants: ['Oval'] },
  { name: 'Pocono Raceway', country: 'United States', type: 'Oval', variants: ['Oval'] },
  { name: 'New Hampshire Motor Speedway', country: 'United States', type: 'Oval', variants: ['Oval', 'Road Course'] },
  { name: 'Darlington Raceway', country: 'United States', type: 'Oval', variants: ['Oval'] },
  { name: 'Nashville Superspeedway', country: 'United States', type: 'Oval', variants: ['Oval'] },
  { name: 'Nashville Fairgrounds Speedway', country: 'United States', type: 'Oval', variants: ['Oval'] },
  { name: 'Iowa Speedway', country: 'United States', type: 'Oval', variants: ['Oval', 'Road Course', 'Short Oval'] },
  { name: 'Gateway Motorsports Park', country: 'United States', type: 'Oval', variants: ['Oval', 'Road Course'] },
  { name: 'Chicagoland Speedway', country: 'United States', type: 'Oval', variants: ['Oval'] },
  
  // Circuitos Australianos
  { name: 'Mount Panorama Circuit', country: 'Australia', type: 'Road', variants: ['Bathurst'] },
  { name: 'Philip Island Grand Prix Circuit', country: 'Australia', type: 'Road', variants: ['Grand Prix'] },
  { name: 'Sandown International Raceway', country: 'Australia', type: 'Road', variants: ['International'] },
  { name: 'Winton Motor Raceway', country: 'Australia', type: 'Road', variants: ['Long', 'Short'] },
  { name: 'The Bend Motorsport Park', country: 'Australia', type: 'Road', variants: ['GT Circuit', 'International Circuit', 'West Circuit'] },
  { name: 'Sydney Motorsport Park', country: 'Australia', type: 'Road', variants: ['Grand Prix', 'Druitt', 'Gardner', 'Brabham', 'Amaroo'] },
  
  // Circuitos de Dirt
  { name: 'Eldora Speedway', country: 'United States', type: 'Dirt Oval', variants: ['Half Mile'] },
  { name: 'Knoxville Raceway', country: 'United States', type: 'Dirt Oval', variants: ['Half Mile'] },
  { name: 'Williams Grove Speedway', country: 'United States', type: 'Dirt Oval', variants: ['Half Mile'] },
  { name: 'Volusia Speedway Park', country: 'United States', type: 'Dirt Oval', variants: ['Half Mile'] },
  { name: 'Fairbury Speedway', country: 'United States', type: 'Dirt Oval', variants: ['Half Mile'] },
  { name: 'Cedar Lake Speedway', country: 'United States', type: 'Dirt Oval', variants: ['3/8 Mile'] },
  { name: 'Kokomo Speedway', country: 'United States', type: 'Dirt Oval', variants: ['Quarter Mile'] },
  { name: 'Limaland Motorsports Park', country: 'United States', type: 'Dirt Oval', variants: ['Quarter Mile'] },
  { name: 'Lanier National Speedway', country: 'United States', type: 'Dirt Oval', variants: ['3/8 Mile'] },
  { name: 'USA International Speedway', country: 'United States', type: 'Dirt Oval', variants: ['3/8 Mile'] },
  { name: 'Huset\'s Speedway', country: 'United States', type: 'Dirt Oval', variants: ['3/8 Mile'] },
  
  // Circuitos Históricos
  { name: 'North Wilkesboro Speedway', country: 'United States', type: 'Oval', variants: ['1987 Historic', 'Modern'] },
  { name: 'Rockingham Speedway', country: 'United States', type: 'Oval', variants: ['Oval', 'Road Course'] },
  
  // Circuitos de Rallycross
  { name: 'Hell Rallycross', country: 'Norway', type: 'Rallycross', variants: ['RX'] },
  { name: 'Daytona International Speedway', country: 'United States', type: 'Rallycross', variants: ['RallyCross'] },
  
  // Circuitos Especiales
  { name: 'Centripetal Circuit', country: 'Virtual', type: 'Test', variants: ['Circle'] },
  { name: 'iRacing Superspeedway', country: 'Virtual', type: 'Oval', variants: ['Superspeedway'] }
];

async function updateDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Iniciando actualización de la base de datos...');
    
    // Agregar columnas si no existen
    try {
      await client.query('ALTER TABLE cars ADD COLUMN IF NOT EXISTS category VARCHAR(50)');
      await client.query('ALTER TABLE cars ADD COLUMN IF NOT EXISTS type VARCHAR(50)');
      await client.query('ALTER TABLE tracks ADD COLUMN IF NOT EXISTS country VARCHAR(50)');
      await client.query('ALTER TABLE tracks ADD COLUMN IF NOT EXISTS type VARCHAR(50)');
      await client.query('ALTER TABLE tracks ADD COLUMN IF NOT EXISTS variants TEXT[]');
      console.log('Columnas agregadas/verificadas.');
    } catch (err) {
      console.log('Error agregando columnas (pueden ya existir):', err.message);
    }
    
    // Limpiar tablas existentes
    await client.query('DELETE FROM setups');
    await client.query('DELETE FROM cars');
    await client.query('DELETE FROM tracks');
    console.log('Tablas limpiadas. Insertando coches...');
    
    // Insertar coches
    for (const car of cars) {
      await client.query(
        'INSERT INTO cars (name, category, type) VALUES ($1, $2, $3)',
        [car.name, car.category, car.type]
      );
    }
    
    console.log(`${cars.length} coches insertados. Insertando circuitos...`);
    
    // Insertar circuitos
    for (const track of tracks) {
      await client.query(
        'INSERT INTO tracks (name, country, type, variants) VALUES ($1, $2, $3, $4)',
        [track.name, track.country, track.type, track.variants]
      );
    }
    
    console.log(`${tracks.length} circuitos insertados.`);
    
    // Obtener IDs de coches y circuitos específicos para los setups de ejemplo
    const ferrariResult = await client.query('SELECT id FROM cars WHERE name = $1', ['Ferrari 296 GT3']);
    const bmwResult = await client.query('SELECT id FROM cars WHERE name = $1', ['BMW M4 GT3']);
    const mercedesResult = await client.query('SELECT id FROM cars WHERE name = $1', ['Mercedes-AMG GT3 2020']);
    
    const spaResult = await client.query('SELECT id FROM tracks WHERE name = $1', ['Circuit de Spa-Francorchamps']);
    const nurburgringResult = await client.query('SELECT id FROM tracks WHERE name = $1', ['Nürburgring']);
    const silverstoneResult = await client.query('SELECT id FROM tracks WHERE name = $1', ['Silverstone Circuit']);
    
    if (ferrariResult.rows.length > 0 && spaResult.rows.length > 0) {
      await client.query(
        'INSERT INTO setups (car_id, track_id, session_type, data) VALUES ($1, $2, $3, $4)',
        [ferrariResult.rows[0].id, spaResult.rows[0].id, 'Race', JSON.stringify({
          suspension: { front_spring: 120, rear_spring: 110 },
          aerodynamics: { front_wing: 8, rear_wing: 12 },
          differential: { preload: 45, coast: 25, power: 65 }
        })]
      );
    }
    
    if (bmwResult.rows.length > 0 && nurburgringResult.rows.length > 0) {
      await client.query(
        'INSERT INTO setups (car_id, track_id, session_type, data) VALUES ($1, $2, $3, $4)',
        [bmwResult.rows[0].id, nurburgringResult.rows[0].id, 'Practice', JSON.stringify({
          suspension: { front_spring: 115, rear_spring: 105 },
          aerodynamics: { front_wing: 6, rear_wing: 10 },
          differential: { preload: 40, coast: 20, power: 60 }
        })]
      );
    }
    
    if (mercedesResult.rows.length > 0 && silverstoneResult.rows.length > 0) {
      await client.query(
        'INSERT INTO setups (car_id, track_id, session_type, data) VALUES ($1, $2, $3, $4)',
        [mercedesResult.rows[0].id, silverstoneResult.rows[0].id, 'Qualifying', JSON.stringify({
          suspension: { front_spring: 125, rear_spring: 115 },
          aerodynamics: { front_wing: 9, rear_wing: 13 },
          differential: { preload: 50, coast: 30, power: 70 }
        })]
      );
    }
    
    console.log('3 setups de ejemplo insertados.');
    console.log('\n=== ACTUALIZACIÓN COMPLETADA ===');
    console.log(`Total de coches: ${cars.length}`);
    console.log(`Total de circuitos: ${tracks.length}`);
    console.log('Total de setups de ejemplo: 3');
    
    // Mostrar estadísticas por categoría
    const carCategories = {};
    cars.forEach(car => {
      carCategories[car.category] = (carCategories[car.category] || 0) + 1;
    });
    
    console.log('\n=== ESTADÍSTICAS DE COCHES POR CATEGORÍA ===');
    Object.entries(carCategories).forEach(([category, count]) => {
      console.log(`${category}: ${count} coches`);
    });
    
    const trackTypes = {};
    tracks.forEach(track => {
      trackTypes[track.type] = (trackTypes[track.type] || 0) + 1;
    });
    
    console.log('\n=== ESTADÍSTICAS DE CIRCUITOS POR TIPO ===');
    Object.entries(trackTypes).forEach(([type, count]) => {
      console.log(`${type}: ${count} circuitos`);
    });
    
  } catch (error) {
    console.error('Error actualizando la base de datos:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar la actualización
if (require.main === module) {
  updateDatabase();
}

module.exports = { updateDatabase, cars, tracks };