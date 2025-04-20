
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedTonerType } from '@/pages/Store';
import { Product } from '@/types/types';

type ProductDetailsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: EnhancedTonerType | Product;
};

export function ProductDetailsDialog({ open, onOpenChange, product }: ProductDetailsProps) {
  const isInStock = (product.quantityInStock || 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Brand: {product.brand}</span>
            <Badge variant="outline" className="ml-auto">
              {product.category}
            </Badge>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="flex justify-center">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="object-contain rounded-md h-48 md:h-64"
            />
          </div>
          
          <div className="space-y-3">
            <div>
              <h3 className="font-medium">Price</h3>
              <p className="text-2xl font-bold">₱{product.price.toFixed(2)}</p>
            </div>

            <div>
              <h3 className="font-medium">Availability</h3>
              <p className={isInStock ? 'text-green-600' : 'text-red-600'}>
                {isInStock ? 'In Stock' : 'Out of Stock'}
                {isInStock && product.quantityInStock && ` (${product.quantityInStock} available)`}
              </p>
            </div>

            <div>
              <h3 className="font-medium">Category</h3>
              <p>{product.category}</p>
            </div>

            <div>
              <h3 className="font-medium">Brand</h3>
              <p>{product.brand}</p>
            </div>

            {'description' in product && product.description && (
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
