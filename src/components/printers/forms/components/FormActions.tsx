
import React from 'react';
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isEditing: boolean;
  onCancel: () => void;
}

export function FormActions({ isEditing, onCancel }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-2 pt-4 border-t mt-2">
      <Button type="button" variant="outline" onClick={onCancel} className="w-full">
        Cancel
      </Button>
      <Button type="submit" className="w-full">
        {isEditing ? "Update Printer" : "Add Printer"}
      </Button>
    </div>
  );
}
