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
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de circuitos
CREATE TABLE IF NOT EXISTS tracks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
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

-- Datos iniciales de coches
INSERT INTO cars (name, category) VALUES 
('Formula Vee', 'Formula'),
('Mazda MX-5 Cup', 'Sports Car'),
('BMW M4 GT4', 'GT4'),
('Porsche 911 GT3 Cup', 'GT3'),
('Mercedes AMG GT3', 'GT3'),
('Formula 3.5', 'Formula'),
('Dallara DW12', 'IndyCar'),
('NASCAR Cup Series', 'NASCAR')
ON CONFLICT (name) DO NOTHING;

-- Datos iniciales de circuitos
INSERT INTO tracks (name, location, length) VALUES 
('Laguna Seca', 'California, USA', 3.602),
('Silverstone', 'England, UK', 5.891),
('Spa-Francorchamps', 'Belgium', 7.004),
('Nürburgring GP', 'Germany', 5.148),
('Road America', 'Wisconsin, USA', 6.515),
('Watkins Glen', 'New York, USA', 5.428),
('Brands Hatch', 'England, UK', 3.908),
('Suzuka', 'Japan', 5.807)
ON CONFLICT (name) DO NOTHING;

-- Verificar que las tablas se crearon correctamente
SELECT 'Tablas creadas exitosamente' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';