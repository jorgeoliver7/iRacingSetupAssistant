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
  ('Nürburgring'),
  ('Monza'),
  ('Silverstone');

-- Insertar configuraciones de ejemplo
INSERT INTO setups (car_id, track_id, session_type, data) VALUES
  (1, 1, 'Practice', '{"suspension": {"front_ride_height": "60mm", "rear_ride_height": "70mm", "front_spring_rate": "120 N/mm", "rear_spring_rate": "140 N/mm"}, "aero": {"front_wing": "6", "rear_wing": "8"}, "tires": {"front_pressure": "27.5 psi", "rear_pressure": "28.0 psi"}}'),
  (1, 1, 'Qualifying', '{"suspension": {"front_ride_height": "58mm", "rear_ride_height": "68mm", "front_spring_rate": "125 N/mm", "rear_spring_rate": "145 N/mm"}, "aero": {"front_wing": "7", "rear_wing": "9"}, "tires": {"front_pressure": "28.0 psi", "rear_pressure": "28.5 psi"}}'),
  (1, 1, 'Race', '{"suspension": {"front_ride_height": "62mm", "rear_ride_height": "72mm", "front_spring_rate": "118 N/mm", "rear_spring_rate": "138 N/mm"}, "aero": {"front_wing": "5", "rear_wing": "7"}, "tires": {"front_pressure": "27.0 psi", "rear_pressure": "27.5 psi"}}');