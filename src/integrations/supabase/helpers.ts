
import { supabase } from './client';
import { PrinterMake, PrinterSeries, PrinterModel } from '@/types';

// Helper function to fetch printer makes
export const getPrinterMakes = async (): Promise<PrinterMake[]> => {
  const { data, error } = await supabase.from('printer_makes')
    .select('*')
    .order('name');
  
  if (error) throw error;
  
  return (data || []).map(make => ({
    id: make.id,
    name: make.name,
    createdAt: make.created_at
  }));
};

// Helper function to fetch printer series by make ID
export const getPrinterSeries = async (makeId: string): Promise<PrinterSeries[]> => {
  const { data, error } = await supabase.from('printer_series')
    .select('*')
    .eq('make_id', makeId)
    .order('name');
  
  if (error) throw error;
  
  return (data || []).map(series => ({
    id: series.id,
    makeId: series.make_id,
    name: series.name,
    createdAt: series.created_at
  }));
};

// Helper function to fetch printer models by series ID
export const getPrinterModels = async (seriesId: string): Promise<PrinterModel[]> => {
  const { data, error } = await supabase.from('printer_models')
    .select('*')
    .eq('series_id', seriesId)
    .order('name');
  
  if (error) throw error;
  
  return (data || []).map(model => ({
    id: model.id,
    seriesId: model.series_id,
    name: model.name,
    createdAt: model.created_at
  }));
};

// Helper function to add a new make
export const addPrinterMake = async (name: string): Promise<PrinterMake> => {
  const { data, error } = await supabase.from('printer_makes')
    .insert({ name })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at
  };
};

// Helper function to add a new series
export const addPrinterSeries = async (name: string, makeId: string): Promise<PrinterSeries> => {
  const { data, error } = await supabase.from('printer_series')
    .insert({ name, make_id: makeId })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    makeId: data.make_id,
    name: data.name,
    createdAt: data.created_at
  };
};

// Helper function to add a new model
export const addPrinterModel = async (name: string, seriesId: string): Promise<PrinterModel> => {
  const { data, error } = await supabase.from('printer_models')
    .insert({ name, series_id: seriesId })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    seriesId: data.series_id,
    name: data.name,
    createdAt: data.created_at
  };
};
