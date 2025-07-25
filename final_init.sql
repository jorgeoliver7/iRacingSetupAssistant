SELECT current_database();
CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS cars (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, category VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS tracks (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, location VARCHAR(100), length_km DECIMAL(5,3), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS setups (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), car_id INTEGER REFERENCES cars(id), track_id INTEGER REFERENCES tracks(id), name VARCHAR(100) NOT NULL, description TEXT, setup_data JSONB NOT NULL, is_public BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
INSERT INTO cars (name, category) VALUES ('BMW M4 GT3', 'GT3'), ('Porsche 911 GT3 R', 'GT3'), ('Mercedes-AMG GT3', 'GT3') ON CONFLICT (name) DO NOTHING;
INSERT INTO tracks (name, location, length_km) VALUES ('Spa-Francorchamps', 'Belgium', 7.004), ('Nurburgring GP', 'Germany', 5.148), ('Silverstone GP', 'United Kingdom', 5.891) ON CONFLICT (name) DO NOTHING;
SELECT 'Tablas creadas exitosamente' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
