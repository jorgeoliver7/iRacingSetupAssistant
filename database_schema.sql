-- Esquema de base de datos para iRacing Setup Assistant
-- Ejecutar este script en Supabase SQL Editor

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de coches
CREATE TABLE IF NOT EXISTS cars (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de circuitos
CREATE TABLE IF NOT EXISTS tracks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    length DECIMAL(5,3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de setups
CREATE TABLE IF NOT EXISTS setups (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    car_id INTEGER REFERENCES cars(id) ON DELETE CASCADE,
    track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    setup_data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    setup_id INTEGER REFERENCES setups(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, setup_id)
);

-- Tabla de calificaciones
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    setup_id INTEGER REFERENCES setups(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, setup_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_setups_user_id ON setups(user_id);
CREATE INDEX IF NOT EXISTS idx_setups_car_id ON setups(car_id);
CREATE INDEX IF NOT EXISTS idx_setups_track_id ON setups(track_id);
CREATE INDEX IF NOT EXISTS idx_setups_public ON setups(is_public);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_setup_id ON ratings(setup_id);

-- Datos iniciales de coches (Lista completa de iRacing)
INSERT INTO cars (name, category) VALUES 
-- Formula
('Formula Vee', 'Formula'),
('Skip Barber Formula 2000', 'Formula'),
('Formula Renault 2.0', 'Formula'),
('Formula 3', 'Formula'),
('Dallara F3', 'Formula'),
('Formula Renault 3.5', 'Formula'),
('Dallara DW12', 'IndyCar'),
('Dallara IR18', 'IndyCar'),
('Formula 1 W12 E Performance', 'Formula 1'),
('McLaren MP4-30', 'Formula 1'),
-- GT3
('Mercedes AMG GT3', 'GT3'),
('BMW M4 GT3', 'GT3'),
('Audi R8 LMS EVO', 'GT3'),
('Porsche 911 GT3 R', 'GT3'),
('Ferrari 488 GT3 Evo', 'GT3'),
('McLaren MP4-12C GT3', 'GT3'),
('Ford GT GT3', 'GT3'),
('Lamborghini Huracán GT3 EVO', 'GT3'),
('Acura NSX GT3', 'GT3'),
-- GT4
('BMW M4 GT4', 'GT4'),
('Porsche 718 Cayman GT4 Clubsport MR', 'GT4'),
('McLaren 570S GT4', 'GT4'),
('Aston Martin Vantage GT4', 'GT4'),
-- GTE/GTLM
('Ferrari 488 GTE', 'GTE'),
('Porsche 911 RSR', 'GTE'),
('BMW M8 GTE', 'GTE'),
('Ford GT', 'GTE'),
('Chevrolet Corvette C8.R', 'GTE'),
-- LMP
('Cadillac DPi-V.R', 'LMP'),
('Acura ARX-05', 'LMP'),
('Dallara P217', 'LMP2'),
('HPD ARX-01c', 'LMP2'),
('Audi R18', 'LMP1'),
('Porsche 919 Hybrid', 'LMP1'),
-- NASCAR
('NASCAR Cup Series', 'NASCAR Cup'),
('NASCAR Xfinity Series', 'NASCAR Xfinity'),
('NASCAR Truck Series', 'NASCAR Truck'),
('NASCAR Cup Series Next Gen', 'NASCAR Cup'),
-- Sports Car
('Mazda MX-5 Cup', 'Sports Car'),
('Global Mazda MX-5 Cup', 'Sports Car'),
('Porsche 911 GT3 Cup', 'Sports Car'),
('Ferrari 488 Challenge Evo', 'Sports Car'),
('Lamborghini Huracán Super Trofeo EVO', 'Sports Car'),
('BMW M2 CS Racing', 'Sports Car'),
-- Touring Car
('Audi RS 3 LMS', 'TCR'),
('Hyundai Elantra N TC', 'TCR'),
('Honda Civic Type R', 'TCR'),
-- Road
('Mazda MX-5', 'Road'),
('BMW Z4 M Coupe', 'Road'),
('Pontiac Solstice', 'Road'),
('Volkswagen Jetta TDI Cup', 'Road'),
-- Dirt Oval
('Dirt Late Model', 'Dirt Oval'),
('Sprint Car', 'Dirt Oval'),
('Dirt Midget', 'Dirt Oval'),
('UMP Modified', 'Dirt Oval'),
('Pro 2 Lite Truck', 'Dirt Oval'),
('Pro 4 Truck', 'Dirt Oval'),
-- Oval
('Late Model Stock Car', 'Oval'),
('Street Stock', 'Oval'),
('Legends Ford 34 Coupe', 'Oval'),
('Super Late Model', 'Oval')
ON CONFLICT (name) DO NOTHING;

-- Datos iniciales de circuitos (Lista completa de iRacing)
INSERT INTO tracks (name, location, length) VALUES 
-- Road Courses
('Laguna Seca', 'California, USA', 3.602),
('Silverstone Circuit', 'England, UK', 5.891),
('Spa-Francorchamps', 'Belgium', 7.004),
('Nürburgring GP-Strecke', 'Germany', 5.148),
('Road America', 'Wisconsin, USA', 6.515),
('Watkins Glen International', 'New York, USA', 5.428),
('Brands Hatch', 'England, UK', 3.908),
('Suzuka International Racing Course', 'Japan', 5.807),
('Circuit de Barcelona-Catalunya', 'Spain', 4.675),
('Autodromo Nazionale Monza', 'Italy', 5.793),
('Circuit de Monaco', 'Monaco', 3.337),
('Hungaroring', 'Hungary', 4.381),
('Red Bull Ring', 'Austria', 4.318),
('Circuit Zandvoort', 'Netherlands', 4.259),
('Imola', 'Italy', 4.909),
('Interlagos', 'Brazil', 4.309),
('Sebring International Raceway', 'Florida, USA', 6.019),
('Road Atlanta', 'Georgia, USA', 4.088),
('VIRginia International Raceway', 'Virginia, USA', 5.263),
('Mid-Ohio Sports Car Course', 'Ohio, USA', 3.634),
('Lime Rock Park', 'Connecticut, USA', 2.414),
('Mosport', 'Canada', 3.957),
('Circuit Gilles Villeneuve', 'Canada', 4.361),
('Donington Park', 'England, UK', 4.020),
('Oulton Park', 'England, UK', 4.332),
('Snetterton Circuit', 'England, UK', 4.778),
('Knockhill Racing Circuit', 'Scotland, UK', 2.023),
('Hockenheimring', 'Germany', 4.574),
('Nürburgring Nordschleife', 'Germany', 20.832),
('Circuit Paul Ricard', 'France', 5.842),
('Le Mans', 'France', 13.626),
('Phillip Island', 'Australia', 4.448),
('Mount Panorama', 'Australia', 6.213),
('Fuji International Speedway', 'Japan', 4.563),
('Twin Ring Motegi', 'Japan', 4.801),
('Okayama International Circuit', 'Japan', 3.703),
('Tsukuba Circuit', 'Japan', 2.045),
-- Oval Tracks
('Daytona International Speedway', 'Florida, USA', 4.023),
('Talladega Superspeedway', 'Alabama, USA', 4.280),
('Indianapolis Motor Speedway', 'Indiana, USA', 4.023),
('Charlotte Motor Speedway', 'North Carolina, USA', 2.414),
('Texas Motor Speedway', 'Texas, USA', 2.414),
('Atlanta Motor Speedway', 'Georgia, USA', 2.414),
('Las Vegas Motor Speedway', 'Nevada, USA', 2.414),
('Kansas Speedway', 'Kansas, USA', 2.414),
('Michigan International Speedway', 'Michigan, USA', 3.218),
('Auto Club Speedway', 'California, USA', 3.218),
('Homestead-Miami Speedway', 'Florida, USA', 2.414),
('Phoenix Raceway', 'Arizona, USA', 1.609),
('Richmond Raceway', 'Virginia, USA', 1.207),
('Martinsville Speedway', 'Virginia, USA', 0.846),
('Bristol Motor Speedway', 'Tennessee, USA', 0.846),
('Dover Motor Speedway', 'Delaware, USA', 1.609),
('Pocono Raceway', 'Pennsylvania, USA', 4.023),
('New Hampshire Motor Speedway', 'New Hampshire, USA', 1.609),
('Darlington Raceway', 'South Carolina, USA', 2.172),
('Iowa Speedway', 'Iowa, USA', 1.448),
('Gateway Motorsports Park', 'Missouri, USA', 2.012),
-- Dirt Ovals
('Eldora Speedway', 'Ohio, USA', 0.805),
('Knoxville Raceway', 'Iowa, USA', 0.805),
('Williams Grove Speedway', 'Pennsylvania, USA', 0.805),
('Volusia Speedway Park', 'Florida, USA', 0.805),
('Fairbury Speedway', 'Illinois, USA', 0.563),
('Kokomo Speedway', 'Indiana, USA', 0.402),
('Limaland Motorsports Park', 'Ohio, USA', 0.563),
('Cedar Lake Speedway', 'Wisconsin, USA', 0.563),
('Weedsport Speedway', 'New York, USA', 0.563),
('Lanier National Speedway', 'Georgia, USA', 0.563),
-- Street Circuits
('Long Beach', 'California, USA', 3.167),
('Detroit Belle Isle', 'Michigan, USA', 4.028),
('Toronto', 'Canada', 2.874),
('St. Petersburg', 'Florida, USA', 2.896)
ON CONFLICT (name) DO NOTHING;

-- Verificar que las tablas se crearon correctamente
SELECT 'Tablas creadas exitosamente' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';