export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  brand: string;
  quantityInStock: number;
  imageUrl?: string;
}

export interface TonerType {
  id: string;
  name: string;
  description?: string;
  price?: number;
  manufacturer?: string;
  type: string;
  stock?: number;
  model?: string;
  imageUrl?: string;
}