-- Script de Inicializacion Completa para Railway PostgreSQL
-- Ejecutar en orden despues de crear la base de datos

-- 1. Verificar conexion
SELECT version();

-- 2. Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Ejecutar esquema principal
-- === ENHANCED DATABASE SCHEMA ===
-- Enhanced Database Schema for iRacing Setup Assistant
-- Includes user system, favorites, history, and advanced features

-- Users table for authentication and user management
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  iracing_id VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  role VARCHAR(20) DEFAULT 'user' -- 'user', 'moderator', 'admin'
);

-- Sessions table for user authentication
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced setups table with user ownership and metadata
ALTER TABLE setups ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
ALTER TABLE setups ADD COLUMN IF NOT EXISTS setup_name VARCHAR(100);
ALTER TABLE setups ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE setups ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE setups ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE setups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE setups ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE setups ADD COLUMN IF NOT EXISTS parent_setup_id INTEGER REFERENCES setups(id);
ALTER TABLE setups ADD COLUMN IF NOT EXISTS downloads_count INTEGER DEFAULT 0;
ALTER TABLE setups ADD COLUMN IF NOT EXISTS rating_avg DECIMAL(3,2) DEFAULT 0;
ALTER TABLE setups ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
ALTER TABLE setups ADD COLUMN IF NOT EXISTS weather_conditions JSONB;
ALTER TABLE setups ADD COLUMN IF NOT EXISTS track_conditions VARCHAR(50);
ALTER TABLE setups ADD COLUMN IF NOT EXISTS fuel_load DECIMAL(5,2);
ALTER TABLE setups ADD COLUMN IF NOT EXISTS lap_time VARCHAR(20);
ALTER TABLE setups ADD COLUMN IF NOT EXISTS notes TEXT;

-- Setup ratings table
CREATE TABLE IF NOT EXISTS setup_ratings (
  id SERIAL PRIMARY KEY,
  setup_id INTEGER REFERENCES setups(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(setup_id, user_id)
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  setup_id INTEGER REFERENCES setups(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, setup_id)
);

-- Setup history/versions table
CREATE TABLE IF NOT EXISTS setup_history (
  id SERIAL PRIMARY KEY,
  setup_id INTEGER REFERENCES setups(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,
  change_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Setup downloads tracking
CREATE TABLE IF NOT EXISTS setup_downloads (
  id SERIAL PRIMARY KEY,
  setup_id INTEGER REFERENCES setups(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET
);

-- Setup templates for automatic generation
CREATE TABLE IF NOT EXISTS setup_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'oval', 'road', 'dirt'
  track_type VARCHAR(50),
  car_category VARCHAR(50),
  base_setup JSONB NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Track characteristics for automatic setup generation
CREATE TABLE IF NOT EXISTS track_characteristics (
  id SERIAL PRIMARY KEY,
  track_id INTEGER REFERENCES tracks(id),
  length_km DECIMAL(6,3),
  corners_count INTEGER,
  elevation_change DECIMAL(6,2),
  banking_avg DECIMAL(5,2),
  banking_max DECIMAL(5,2),
  surface_type VARCHAR(50),
  grip_level VARCHAR(20), -- 'low', 'medium', 'high'
  downforce_importance VARCHAR(20), -- 'low', 'medium', 'high'
  brake_wear VARCHAR(20), -- 'low', 'medium', 'high'
  tire_wear VARCHAR(20), -- 'low', 'medium', 'high'
  fuel_consumption VARCHAR(20), -- 'low', 'medium', 'high'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  preferred_units VARCHAR(20) DEFAULT 'metric', -- 'metric', 'imperial'
  default_car_category VARCHAR(50),
  notification_settings JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Setup comparisons (for side-by-side comparison feature)
CREATE TABLE IF NOT EXISTS setup_comparisons (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100),
  setup_ids INTEGER[] NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Telemetry data (for future telemetry integration)
CREATE TABLE IF NOT EXISTS telemetry_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  setup_id INTEGER REFERENCES setups(id),
  car_id INTEGER REFERENCES cars(id),
  track_id INTEGER REFERENCES tracks(id),
  session_type VARCHAR(50),
  lap_time VARCHAR(20),
  file_path VARCHAR(500),
  analysis_data JSONB,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_setups_user_id ON setups(user_id);
CREATE INDEX IF NOT EXISTS idx_setups_car_track ON setups(car_id, track_id);
CREATE INDEX IF NOT EXISTS idx_setups_public ON setups(is_public);
CREATE INDEX IF NOT EXISTS idx_setups_rating ON setups(rating_avg DESC);
CREATE INDEX IF NOT EXISTS idx_setups_downloads ON setups(downloads_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_setup_ratings_setup ON setup_ratings(setup_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Functions for automatic rating calculation
CREATE OR REPLACE FUNCTION update_setup_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE setups 
  SET 
    rating_avg = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM setup_ratings 
      WHERE setup_id = COALESCE(NEW.setup_id, OLD.setup_id)
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM setup_ratings 
      WHERE setup_id = COALESCE(NEW.setup_id, OLD.setup_id)
    )
  WHERE id = COALESCE(NEW.setup_id, OLD.setup_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_update_setup_rating ON setup_ratings;
CREATE TRIGGER trigger_update_setup_rating
  AFTER INSERT OR UPDATE OR DELETE ON setup_ratings
  FOR EACH ROW EXECUTE FUNCTION update_setup_rating();

-- Function to update downloads count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE setups 
  SET downloads_count = downloads_count + 1
  WHERE id = NEW.setup_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_download_count ON setup_downloads;
CREATE TRIGGER trigger_increment_download_count
  AFTER INSERT ON setup_downloads
  FOR EACH ROW EXECUTE FUNCTION increment_download_count();

-- === SETUP DATABASE ===
-- Crear tablas
CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS tracks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS setups (
  id SERIAL PRIMARY KEY,
  car_id INTEGER REFERENCES cars(id),
  track_id INTEGER REFERENCES tracks(id),
  session_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL
);

-- Insertar datos de ejemplo
INSERT INTO cars (name) VALUES 
  ('Ferrari 488 GT3'),
  ('Porsche 911 GT3 R'),
  ('BMW M4 GT3'),
  ('Mercedes AMG GT3');

INSERT INTO tracks (name) VALUES 
  ('Spa-Francorchamps'),
  ('NÃ¼rburgring'),
  ('Monza'),
  ('Silverstone');

-- Insertar configuraciones de ejemplo
INSERT INTO setups (car_id, track_id, session_type, data) VALUES
  (1, 1, 'Practice', '{"suspension": {"front_ride_height": "60mm", "rear_ride_height": "70mm", "front_spring_rate": "120 N/mm", "rear_spring_rate": "140 N/mm"}, "aero": {"front_wing": "6", "rear_wing": "8"}, "tires": {"front_pressure": "27.5 psi", "rear_pressure": "28.0 psi"}}'),
  (1, 1, 'Qualifying', '{"suspension": {"front_ride_height": "58mm", "rear_ride_height": "68mm", "front_spring_rate": "125 N/mm", "rear_spring_rate": "145 N/mm"}, "aero": {"front_wing": "7", "rear_wing": "9"}, "tires": {"front_pressure": "28.0 psi", "rear_pressure": "28.5 psi"}}'),
  (1, 1, 'Race', '{"suspension": {"front_ride_height": "62mm", "rear_ride_height": "72mm", "front_spring_rate": "118 N/mm", "rear_spring_rate": "138 N/mm"}, "aero": {"front_wing": "5", "rear_wing": "7"}, "tires": {"front_pressure": "27.0 psi", "rear_pressure": "27.5 psi"}}');
-- === DATOS DE PRUEBA ===
-- Insertar algunos datos basicos para verificar funcionamiento

INSERT INTO tracks (name, config, category) VALUES 
('Watkins Glen International', 'Boot', 'Road'),
('Charlotte Motor Speedway', 'Oval', 'Oval'),
('Spa-Francorchamps', 'Grand Prix', 'Road')
ON CONFLICT (name, config) DO NOTHING;

INSERT INTO cars (name, category, class) VALUES 
('BMW M4 GT3', 'GT3', 'GT3'),
('Porsche 911 GT3 Cup', 'GT3 Cup', 'GT3 Cup'),
('Formula Vee', 'Formula', 'Formula Vee')
ON CONFLICT (name) DO NOTHING;

-- Verificar insercion
SELECT 'Tracks insertados:' as info, COUNT(*) as count FROM tracks;
SELECT 'Cars insertados:' as info, COUNT(*) as count FROM cars;
SELECT 'Usuarios registrados:' as info, COUNT(*) as count FROM users;

-- Verificar estructura de tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

SELECT 'Base de datos inicializada correctamente' as status;
