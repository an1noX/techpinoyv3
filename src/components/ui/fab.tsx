
import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';
import { motion } from 'framer-motion';

const fabVariants = cva(
  "rounded-full shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
      },
      size: {
        default: "h-14 w-14",
        sm: "h-12 w-12",
        lg: "h-16 w-16",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface FabProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fabVariants> {
  icon?: React.ReactNode;
  label?: string;
}

const Fab = React.forwardRef<HTMLButtonElement, FabProps>(
  ({ className, variant, size, icon, label, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(fabVariants({ variant, size }), className)}
        {...props}
      >
        <motion.div
          className="flex items-center justify-center w-full h-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.95 }}
        >
          {icon || <Plus size={24} />}
          {label && (
            <span className="sr-only">{label}</span>
          )}
        </motion.div>
      </button>
    );
  }
);
Fab.displayName = "Fab";

export { Fab };
