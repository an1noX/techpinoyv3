
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReactNode } from "react";

interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showClose?: boolean;
  description?: string;
  footer?: ReactNode;  // Add footer prop
}

export function BaseDialog({ 
  open, 
  onOpenChange, 
  title, 
  children, 
  size = "md",
  showClose = true,
  description,
  footer
}: BaseDialogProps) {
  const sizeClasses = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
    full: "sm:max-w-[95vw]"
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${sizeClasses[size]} max-h-[90vh] overflow-y-auto bg-background`}
        aria-describedby={description ? "dialog-description" : undefined}
      >
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <p id="dialog-description" className="text-sm text-muted-foreground">{description}</p>}
          </DialogHeader>
        )}
        <div className="py-2">{children}</div>
        {footer && <div className="mt-4 pt-3 border-t">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}
