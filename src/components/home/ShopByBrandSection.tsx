import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { SectionTitle } from './SectionTitle';
import { Brand } from '@/types/types';
import { Link } from 'react-router-dom';

export function ShopByBrandSection() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

const fetchBrands = async () => {
  setIsLoading(true);
  try {
    // Fixed: Changed 'printer_wiki' to 'wiki_printers' which is the correct table name
    const { data, error } = await supabase
      .from('wiki_printers')
      .select('make')
      .order('make');
    
    if (error) throw error;
    
    // Extract unique makes
    const uniqueMakes = Array.from(new Set(data.map(item => item.make)));
    setBrands(uniqueMakes.map(make => ({ name: make })));
  } catch (error) {
    console.error('Error fetching brands:', error);
    // You might want to handle this error in the UI
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4">
        <SectionTitle title="Shop by Brand" />
        {isLoading ? (
          <div className="text-center">Loading brands...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {brands.map((brand) => (
              <Link to={`/shop?brand=${brand.name}`} key={brand.name} className="flex items-center justify-center bg-gray-100 rounded-md p-4 hover:shadow-md transition">
                <span className="text-gray-700 font-medium">{brand.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
