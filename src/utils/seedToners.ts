
import { supabase } from '@/integrations/supabase/client';

export async function seedTonerData() {
  try {
    // Check if toners already exist
    const { data: existingToners, error: selectError } = await supabase
      .from('wiki_toners')
      .select('*');

    if (selectError) {
      console.error('Error checking existing toners:', selectError);
      return;
    }

    if (existingToners && existingToners.length > 0) {
      console.log('Toners already exist, skipping seeding.');
      return;
    }

    // Seed toner data
    const { data, error } = await supabase
      .from('wiki_toners')
      .upsert([
        {
          brand: 'HP',
          model: 'CF258A',
          color: 'Black',
          page_yield: 3000,
          stock: 100,
          threshold: 20,
          is_active: true,
        },
        {
          brand: 'Canon',
          model: '055',
          color: 'Cyan',
          page_yield: 2100,
          stock: 50,
          threshold: 10,
          is_active: true,
        },
        {
          brand: 'Epson',
          model: 'T802XL',
          color: 'Magenta',
          page_yield: 2600,
          stock: 75,
          threshold: 15,
          is_active: true,
        },
        {
          brand: 'Brother',
          model: 'TN760',
          color: 'Yellow',
          page_yield: 3000,
          stock: 60,
          threshold: 12,
          is_active: true,
        },
      ]);

    if (error) {
      console.error('Error seeding toners:', error);
    } else {
      console.log('Toners seeded successfully:', data);
    }
  } catch (err) {
    console.error('Unexpected error during toner seeding:', err);
  }
}

export async function seedCommercialTonerProducts() {
  try {
    // Check if commercial toner products already exist
    const { data: existingProducts, error: selectError } = await supabase
      .from('product_toners')
      .select('*');

    if (selectError) {
      console.error('Error checking existing commercial toner products:', selectError);
      return;
    }

    if (existingProducts && existingProducts.length > 0) {
      console.log('Commercial toner products already exist, skipping seeding.');
      return;
    }

    // Fetch all toner IDs from wiki_toners
    const { data: toners, error: tonerError } = await supabase
      .from('wiki_toners')
      .select('id');

    if (tonerError) {
      console.error('Error fetching toner IDs:', tonerError);
      return;
    }

    if (!toners || toners.length === 0) {
      console.warn('No toners found, cannot seed commercial toner products.');
      return;
    }

    const tonerProducts = toners.map((toner, index) => ({
      name: `Commercial Toner ${index + 1}`,
      sku: `CT-${index + 1}`,
      price: 75 + index * 5,
      stock_level: 50 + index * 3,
      reorder_point: 10,
      is_active: true,
      toner_id: toner.id,
      category: ['toner'],
      description: 'High-quality commercial toner product',
    }));

    // Seed commercial toner product data
    const { data, error } = await supabase
      .from('product_toners')
      .upsert(tonerProducts);

    if (error) {
      console.error('Error seeding commercial toner products:', error);
    } else {
      console.log('Commercial toner products seeded successfully:', data);
    }
  } catch (err) {
    console.error('Unexpected error during commercial toner product seeding:', err);
  }
}

// Add alias to match import in Store.tsx
export const seedTonerProducts = seedCommercialTonerProducts;

export async function getCommercialTonerProducts() {
  try {
    // Fetch commercial toner products with related toner information
    const { data, error } = await supabase
      .from('product_toners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching commercial toner products:', error);
      return null;
    }

    console.log('Commercial toner products fetched successfully:', data);
    return data;
  } catch (err) {
    console.error('Unexpected error during fetching commercial toner products:', err);
    return null;
  }
}
