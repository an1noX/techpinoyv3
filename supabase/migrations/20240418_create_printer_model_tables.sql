
-- Create printer makes table
CREATE TABLE IF NOT EXISTS printer_makes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create printer series table
CREATE TABLE IF NOT EXISTS printer_series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  make_id UUID NOT NULL REFERENCES printer_makes(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create printer models table
CREATE TABLE IF NOT EXISTS printer_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id UUID NOT NULL REFERENCES printer_series(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS printer_series_make_id_idx ON printer_series (make_id);
CREATE INDEX IF NOT EXISTS printer_models_series_id_idx ON printer_models (series_id);
