
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FormContainerProps {
  children: React.ReactNode;
  open: boolean;
  title: string;
  description: string;
  className?: string;
  isAlertDialogOpen: boolean;
  onCloseAlert: () => void;
  onConfirmCancel: () => void;
}

export function FormContainer({
  children,
  open,
  title,
  description,
  className,
  isAlertDialogOpen,
  onCloseAlert,
  onConfirmCancel,
}: FormContainerProps) {
  return (
    <>
      <Dialog open={open}>
        <DialogContent 
          className={cn(
            "flex flex-col max-h-[90vh] p-0 gap-0", 
            className
          )}
        >
          <DialogHeader className="px-6 pt-6 pb-0">
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
              You have unsaved changes. Are you sure you want to cancel?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Resume Editing</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmCancel}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
