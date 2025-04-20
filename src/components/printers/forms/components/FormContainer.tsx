
import React, { ReactNode } from 'react';
import { Card } from "@/components/ui/card";
import { utils } from "@/lib/utils";
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
  children: ReactNode;
  open: boolean;
  isAlertDialogOpen: boolean;
  title: string;
  description: string;
  onCloseAlert: () => void;
  onConfirmCancel: () => void;
}

export function FormContainer({ 
  children, 
  open, 
  isAlertDialogOpen, 
  title,
  description,
  onCloseAlert,
  onConfirmCancel 
}: FormContainerProps) {
  return (
    <AlertDialog open={isAlertDialogOpen}>
      <Card className={utils.cn("w-full max-w-2xl", !open ? "hidden" : "fixed inset-0 top-auto mx-auto h-[calc(100vh-4rem)] max-h-[90vh] rounded-2xl border bg-popover text-popover-foreground shadow-md animate-in fade-in-50 zoom-in-95 data-[state=open]:animate-out data-[state=open]:fade-out-50 data-[state=open]:zoom-out-95 sm:border md:max-h-[75vh]")}>
        {children}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Leaving will discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCloseAlert}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmCancel}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </Card>
    </AlertDialog>
  );
}
