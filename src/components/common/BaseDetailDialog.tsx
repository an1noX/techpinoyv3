
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { X } from "lucide-react";

interface BaseDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  actionButtons?: ReactNode;
  description?: string;
}

export function BaseDetailDialog({ 
  open, 
  onOpenChange, 
  title, 
  children, 
  size = "md",
  actionButtons,
  description
}: BaseDetailDialogProps) {
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
        <div className="flex justify-between items-center">
          {title && (
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && <p id="dialog-description" className="text-sm text-muted-foreground">{description}</p>}
            </DialogHeader>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="py-4">{children}</div>

        {actionButtons && (
          <div className="flex justify-end gap-3 mt-4 pt-3 border-t">
            {actionButtons}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
