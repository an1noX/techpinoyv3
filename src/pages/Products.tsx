import React from 'react';
import { StaticSettingsProvider } from '@/context/StaticSettingsContext';
import ProductsContent from './ProductsContent';

// Wrap the products content with StaticSettingsProvider to avoid auth context
const Products = () => (
  <StaticSettingsProvider>
    <ProductsContent />
  </StaticSettingsProvider>
);

export default Products;
