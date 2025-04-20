
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface FormContainerProps {
  open: boolean;
  isAlertDialogOpen: boolean;
  title: string;
  description: string;
  onCloseAlert: () => void;
  onConfirmCancel: () => void;
  children: React.ReactNode;
  className?: string;
}

export function FormContainer({
  open,
  isAlertDialogOpen,
  title,
  description,
  onCloseAlert,
  onConfirmCancel,
  children,
  className
}: FormContainerProps) {
  return (
    <>
      <Dialog open={open}>
        <DialogContent 
          className={cn("max-w-[900px] max-h-[90vh] overflow-hidden p-0", className)}
        >
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertDialogOpen} onOpenChange={onCloseAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close this form?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, continue editing</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmCancel}>
              Yes, discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
