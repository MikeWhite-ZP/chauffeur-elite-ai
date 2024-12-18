CREATE TABLE driver_wellness_metrics (
  id SERIAL PRIMARY KEY,
  chauffeur_id INTEGER REFERENCES chauffeurs(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hours_worked_today DECIMAL(5,2) DEFAULT 0,
  hours_worked_week DECIMAL(5,2) DEFAULT 0,
  last_break_time TIMESTAMP,
  breaks_taken INTEGER DEFAULT 0,
  rest_hours_last_24h DECIMAL(5,2) DEFAULT 0,
  route_complexity_score DECIMAL(3,2) DEFAULT 0,
  traffic_stress_score DECIMAL(3,2) DEFAULT 0,
  wellness_score DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_driver_wellness_chauffeur_date ON driver_wellness_metrics(chauffeur_id, date);
