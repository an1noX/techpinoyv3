
import { useState, useEffect } from 'react';
import { mockPrinterMakes, mockPrinterSeries } from '@/data/mockData';
import { PrinterSeries } from '@/types/types';

interface Make {
  id: string;
  name: string;
}

export function usePrinterMakesAndSeries() {
  const [makes, setMakes] = useState<Make[]>(mockPrinterMakes);
  const [series, setSeries] = useState<PrinterSeries[]>(
    mockPrinterSeries.map(s => ({
      ...s,
      makeId: s.makeId || '' // Ensure makeId is always set
    }))
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch this data from your API/database
    // For now, we're using mock data initialized in state
  }, []);

  const addNewMake = (name: string) => {
    const newMake = {
      id: crypto.randomUUID(),
      name
    };
    setMakes(prev => [...prev, newMake]);
    return newMake.id;
  };

  const addNewSeries = (name: string, makeId: string) => {
    const newSeries = {
      id: crypto.randomUUID(),
      name,
      makeId
    };
    setSeries(prev => [...prev, newSeries]);
    return newSeries.id;
  };

  return {
    makes,
    series,
    loading,
    addNewMake,
    addNewSeries
  };
}
