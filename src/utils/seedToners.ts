
import { supabase } from "@/integrations/supabase/client";

// Initial static toner product data matching EnhancedTonerType
const TONER_PRODUCTS = [
  {
    name: "HP 26A Black Toner",
    sku: "HP-26A",
    price: 1899.99,
    manufacturer: "HP",
    type: "toner",
    stock_level: 25,
    image_url: 'https://placehold.co/200x200/e6f7ff/333?text=HP 26A',
    category: ["toner"],
    brand: "HP",
    is_active: true,
    reorder_point: 5,
  },
  {
    name: "Canon PGI-280 Black Ink",
    sku: "CANON-280",
    price: 1299.99,
    manufacturer: "Canon",
    type: "ink",
    stock_level: 18,
    image_url: 'https://placehold.co/200x200/e6f7ff/333?text=Canon 280',
    category: ["ink"],
    brand: "Canon",
    is_active: true,
    reorder_point: 5,
  },
  {
    name: "Brother TN-760 High Yield Toner",
    sku: "BRO-760",
    price: 1599.99,
    manufacturer: "Brother",
    type: "toner",
    stock_level: 15,
    image_url: 'https://placehold.co/200x200/e6f7ff/333?text=Brother 760',
    category: ["toner"],
    brand: "Brother",
    is_active: true,
    reorder_point: 5,
  },
  {
    name: "Epson 702 Cyan Ink",
    sku: "EPS-702-C",
    price: 1099.99,
    manufacturer: "Epson",
    type: "ink",
    stock_level: 30,
    image_url: 'https://placehold.co/200x200/e6f7ff/333?text=Epson 702',
    category: ["ink"],
    brand: "Epson",
    is_active: true,
    reorder_point: 5,
  },
  {
    name: "Samsung MLT-D111S Black Toner",
    sku: "SAM-D111S",
    price: 1799.99,
    manufacturer: "Samsung",
    type: "toner",
    stock_level: 12,
    image_url: 'https://placehold.co/200x200/e6f7ff/333?text=Samsung D111S',
    category: ["toner"],
    brand: "Samsung",
    is_active: true,
    reorder_point: 5,
  },
  {
    name: "Lexmark 71B10K0 Black Toner",
    sku: "LEX-71B",
    price: 2199.99,
    manufacturer: "Lexmark",
    type: "toner",
    stock_level: 8,
    image_url: 'https://placehold.co/200x200/e6f7ff/333?text=Lexmark 71B',
    category: ["toner"],
    brand: "Lexmark",
    is_active: true,
    reorder_point: 5,
  },
  {
    name: "Xerox 106R03745 Cyan Toner",
    sku: "XER-106R",
    price: 2299.99,
    manufacturer: "Xerox",
    type: "toner",
    stock_level: 9,
    image_url: 'https://placehold.co/200x200/e6f7ff/333?text=Xerox 106R',
    category: ["toner"],
    brand: "Xerox",
    is_active: true,
    reorder_point: 5,
  },
  {
    name: "HP 63XL Tri-color Ink",
    sku: "HP-63XL",
    price: 1499.99,
    manufacturer: "HP",
    type: "ink",
    stock_level: 22,
    image_url: 'https://placehold.co/200x200/e6f7ff/333?text=HP 63XL',
    category: ["ink"],
    brand: "HP",
    is_active: true,
    reorder_point: 5,
  }
];

// Utility for seeding toner products, only runs if table is empty
export async function seedTonerProducts() {
  // Check if any products exist
  const { data: existing, error: fetchError } = await supabase
    .from('commercial_toner_products')
    .select('id')
    .limit(1);

  if (fetchError) {
    console.error("Failed to check commercial_toner_products:", fetchError.message);
    return { error: fetchError };
  }
  if (existing && existing.length > 0) {
    console.log("Toner products already seeded. Skipping.");
    return { alreadySeeded: true };
  }

  // Insert products batch
  const { error } = await supabase
    .from('commercial_toner_products')
    .insert(TONER_PRODUCTS);

  if (error) {
    console.error("Failed to seed toner products:", error.message);
    return { error };
  }

  console.log("Toner products seeded successfully!");
  return { success: true };
}
