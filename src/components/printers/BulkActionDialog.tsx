
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { BaseDialog } from "@/components/common/BaseDialog";
import { useAuth } from "@/context/AuthContext";

interface BulkActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: "archive" | "delete" | "transfer";
  count: number;
  onConfirm: () => void;
}

export function BulkActionDialog({ 
  open, 
  onOpenChange, 
  actionType, 
  count, 
  onConfirm 
}: BulkActionDialogProps) {
  const { hasPermission } = useAuth();
  
  const getTitleByAction = () => {
    switch (actionType) {
      case "archive":
        return "Archive Selected Printers";
      case "delete":
        return "Delete Selected Printers";
      case "transfer":
        return "Transfer Selected Printers";
    }
  };

  const getDescriptionByAction = () => {
    switch (actionType) {
      case "archive":
        return `Are you sure you want to archive ${count} selected printer${count !== 1 ? 's' : ''}? This action can be reversed later.`;
      case "delete":
        return `Are you sure you want to delete ${count} selected printer${count !== 1 ? 's' : ''}? This action cannot be undone.`;
      case "transfer":
        return `Are you sure you want to transfer ${count} selected printer${count !== 1 ? 's' : ''}?`;
    }
  };

  const getButtonColorByAction = () => {
    switch (actionType) {
      case "archive":
        return "secondary";
      case "delete":
        return "destructive";
      case "transfer":
        return "default";
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  // Check permissions based on action - fixing argument count by using a single string
  const canPerformAction = actionType === "delete" 
    ? hasPermission("delete:printers")
    : actionType === "archive" 
      ? hasPermission("archive:printers") 
      : hasPermission("transfer:printers");

  if (!canPerformAction) {
    return null;
  }

  const renderFooter = (
    <>
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        Cancel
      </Button>
      <Button 
        variant={getButtonColorByAction() as any}
        onClick={handleConfirm}
      >
        Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
      </Button>
    </>
  );

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={getTitleByAction()}
      description={getDescriptionByAction()}
      size="sm"
      footer={renderFooter}
    >
      {actionType === "delete" && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center justify-center bg-red-100 text-red-800 p-4 rounded-full">
            <AlertTriangle className="h-10 w-10" />
          </div>
        </div>
      )}
    </BaseDialog>
  );
}
