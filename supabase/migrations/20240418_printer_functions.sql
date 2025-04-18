
-- Create functions to work around type issues in the Supabase client

-- Function to get printer makes
CREATE OR REPLACE FUNCTION get_printer_makes()
RETURNS SETOF printer_makes
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY SELECT * FROM printer_makes ORDER BY name;
END;
$$;

-- Function to get printer series by make ID
CREATE OR REPLACE FUNCTION get_printer_series(make_id_param UUID)
RETURNS SETOF printer_series
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY SELECT * FROM printer_series WHERE make_id = make_id_param ORDER BY name;
END;
$$;

-- Function to get printer models by series ID
CREATE OR REPLACE FUNCTION get_printer_models(series_id_param UUID)
RETURNS SETOF printer_models
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY SELECT * FROM printer_models WHERE series_id = series_id_param ORDER BY name;
END;
$$;

-- Function to insert a printer make
CREATE OR REPLACE FUNCTION insert_printer_make(make_name TEXT)
RETURNS printer_makes
LANGUAGE plpgsql
AS $$
DECLARE
  new_make printer_makes;
BEGIN
  INSERT INTO printer_makes (name)
  VALUES (make_name)
  RETURNING * INTO new_make;
  
  RETURN new_make;
END;
$$;

-- Function to insert a printer series
CREATE OR REPLACE FUNCTION insert_printer_series(series_name TEXT, make_id_param UUID)
RETURNS printer_series
LANGUAGE plpgsql
AS $$
DECLARE
  new_series printer_series;
BEGIN
  INSERT INTO printer_series (name, make_id)
  VALUES (series_name, make_id_param)
  RETURNING * INTO new_series;
  
  RETURN new_series;
END;
$$;

-- Function to insert a printer model
CREATE OR REPLACE FUNCTION insert_printer_model(model_name TEXT, series_id_param UUID)
RETURNS printer_models
LANGUAGE plpgsql
AS $$
DECLARE
  new_model printer_models;
BEGIN
  INSERT INTO printer_models (name, series_id)
  VALUES (model_name, series_id_param)
  RETURNING * INTO new_model;
  
  RETURN new_model;
END;
$$;
