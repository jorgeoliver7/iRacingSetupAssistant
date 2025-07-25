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

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  class VARCHAR(50),
  power_hp INTEGER,
  weight_kg INTEGER,
  drivetrain VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tracks table
CREATE TABLE IF NOT EXISTS tracks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(100),
  country VARCHAR(50),
  length_km DECIMAL(6,3),
  type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Setups table
CREATE TABLE IF NOT EXISTS setups (
  id SERIAL PRIMARY KEY,
  car_id INTEGER REFERENCES cars(id),
  track_id INTEGER REFERENCES tracks(id),
  data JSONB NOT NULL,
  user_id INTEGER REFERENCES users(id),
  setup_name VARCHAR(100),
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  version INTEGER DEFAULT 1,
  parent_setup_id INTEGER REFERENCES setups(id),
  downloads_count INTEGER DEFAULT 0,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  weather_conditions JSONB,
  track_conditions VARCHAR(50),
  fuel_load DECIMAL(5,2),
  lap_time VARCHAR(20),
  notes TEXT
);

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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_setups_user_id ON setups(user_id);
CREATE INDEX IF NOT EXISTS idx_setups_car_track ON setups(car_id, track_id);
CREATE INDEX IF NOT EXISTS idx_setups_public ON setups(is_public);
CREATE INDEX IF NOT EXISTS idx_setups_rating ON setups(rating_avg DESC);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_setup_ratings_setup ON setup_ratings(setup_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);

-- Insert sample data
INSERT INTO cars (name, category, class, power_hp, weight_kg, drivetrain) VALUES
('Formula Vee', 'Open Wheel', 'Formula Vee', 60, 500, 'RWD'),
('Mazda MX-5 Cup', 'Sports Car', 'MX-5 Cup', 155, 1050, 'RWD'),
('BMW M4 GT3', 'GT', 'GT3', 500, 1300, 'RWD'),
('Porsche 911 GT3 Cup', 'GT', 'Porsche Cup', 450, 1200, 'RWD'),
('NASCAR Cup Series', 'Stock Car', 'Cup', 750, 1500, 'RWD')
ON CONFLICT DO NOTHING;

INSERT INTO tracks (name, location, country, length_km, type) VALUES
('Laguna Seca', 'California', 'USA', 3.602, 'Road'),
('Charlotte Motor Speedway', 'North Carolina', 'USA', 2.414, 'Oval'),
('Spa-Francorchamps', 'Ardennes', 'Belgium', 7.004, 'Road'),
('Daytona International Speedway', 'Florida', 'USA', 4.023, 'Oval'),
('Nurburgring GP', 'Rhineland-Palatinate', 'Germany', 5.148, 'Road')
ON CONFLICT DO NOTHING;

-- Sample setup data
INSERT INTO setups (car_id, track_id, data, setup_name, description, is_public) VALUES
(1, 1, '{"suspension": {"front": {"springs": 350, "dampers": 2800}, "rear": {"springs": 300, "dampers": 2600}}, "aerodynamics": {"front_wing": 5, "rear_wing": 8}}', 'Laguna Seca Balanced', 'Balanced setup for Laguna Seca with good handling', true),
(2, 1, '{"suspension": {"front": {"springs": 400, "dampers": 3000}, "rear": {"springs": 350, "dampers": 2800}}, "differential": {"power": 45, "coast": 25}}', 'MX-5 Laguna Race', 'Race setup for MX-5 at Laguna Seca', true),
(3, 3, '{"suspension": {"front": {"springs": 800, "dampers": 4500}, "rear": {"springs": 750, "dampers": 4200}}, "aerodynamics": {"front_wing": 12, "rear_wing": 15}}', 'Spa High Downforce', 'High downforce setup for Spa-Francorchamps', true)
ON CONFLICT DO NOTHING;

SELECT 'Database initialization completed successfully!' as status;