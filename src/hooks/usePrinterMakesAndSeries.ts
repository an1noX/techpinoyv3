
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PrinterSeries } from '@/types/types';

interface Make {
  id: string;
  name: string;
}

export function usePrinterMakesAndSeries() {
  const [makes, setMakes] = useState<Make[]>([]);
  const [series, setSeries] = useState<PrinterSeries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMakesAndSeries();
  }, []);

  const fetchMakesAndSeries = async () => {
    setLoading(true);
    try {
      // Fetch unique makes from wiki_printers
      const { data: makesData, error: makesError } = await supabase
        .from('wiki_printers')
        .select('make')
        .order('make');

      if (makesError) throw makesError;

      // Extract unique makes (replace distinct with manual deduplication)
      const uniqueMakes = Array.from(new Set(makesData.map(item => item.make)));
      
      // Transform to expected format with IDs
      const formattedMakes = uniqueMakes.map(make => ({
        id: make.toLowerCase().replace(/\s+/g, '-'),
        name: make
      }));

      setMakes(formattedMakes);

      // Fetch series from wiki_printers
      const { data: seriesData, error: seriesError } = await supabase
        .from('wiki_printers')
        .select('series, make')
        .order('series');

      if (seriesError) throw seriesError;

      // Extract unique series-make combinations
      const uniqueSeries = Array.from(
        new Set(
          seriesData
            .filter(item => item.series) // Filter out null/empty series
            .map(item => JSON.stringify({ series: item.series, make: item.make }))
        )
      ).map(str => JSON.parse(str));

      // Transform to expected format with makeId
      const formattedSeries = uniqueSeries.map(item => ({
        id: item.series.toLowerCase().replace(/\s+/g, '-'),
        name: item.series,
        makeId: item.make.toLowerCase().replace(/\s+/g, '-')
      }));

      setSeries(formattedSeries);
    } catch (error) {
      console.error('Error fetching printer makes and series:', error);
      // Fallback to empty arrays in case of error
      setMakes([]);
      setSeries([]);
    } finally {
      setLoading(false);
    }
  };

  const addNewMake = async (name: string) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if make already exists
    const { data, error } = await supabase
      .from('wiki_printers')
      .select('make')
      .eq('make', name)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking make existence:', error);
    }
    
    // Only add if doesn't exist
    if (!data) {
      // We don't directly insert a new make as it needs to be associated with a printer
      // Instead, we'll add it to our local state for now
      setMakes(prev => [...prev, { id, name }]);
    }
    
    return id;
  };

  const addNewSeries = async (name: string, makeId: string) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const makeName = makes.find(make => make.id === makeId)?.name || '';
    
    // Check if series already exists for this make
    const { data, error } = await supabase
      .from('wiki_printers')
      .select('series')
      .eq('make', makeName)
      .eq('series', name)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking series existence:', error);
    }
    
    // Only add if doesn't exist
    if (!data) {
      // Similar to makes, we'll add it to local state since series must be associated with a printer
      setSeries(prev => [...prev, { id, name, makeId }]);
    }
    
    return id;
  };

  return {
    makes,
    series,
    loading,
    addNewMake,
    addNewSeries
  };
}
