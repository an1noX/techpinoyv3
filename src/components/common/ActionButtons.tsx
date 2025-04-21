
import { Button, ButtonProps } from "@/components/ui/button";
import { Trash2, Edit, Eye, Check, ArrowUpDown, Settings, X, Download, FileText, History, Wrench } from "lucide-react";
import React from "react";

interface ActionButtonProps extends ButtonProps {
  icon?: React.ReactNode;
}

export function ViewButton({ onClick, className, children, ...props }: ActionButtonProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      className={`flex items-center gap-1 ${className}`}
      onClick={onClick}
      {...props}
    >
      <Eye className="h-4 w-4" />
      {children || "Details"}
    </Button>
  );
}

export function EditButton({ onClick, className, children, ...props }: ActionButtonProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      className={`flex items-center gap-1 ${className}`}
      onClick={onClick}
      {...props}
    >
      <Edit className="h-4 w-4" />
      {children || "Edit"}
    </Button>
  );
}

export function DeleteButton({ onClick, className, children, ...props }: ActionButtonProps) {
  return (
    <Button
      size="sm"
      variant="destructive"
      className={`flex items-center gap-1 ${className}`}
      onClick={onClick}
      {...props}
    >
      <Trash2 className="h-4 w-4" />
      {children || "Delete"}
    </Button>
  );
}

export function ApproveButton({ onClick, className, children, ...props }: ActionButtonProps) {
  return (
    <Button
      size="sm"
      variant="default"
      className={`flex items-center gap-1 bg-green-600 hover:bg-green-700 ${className}`}
      onClick={onClick}
      {...props}
    >
      <Check className="h-4 w-4" />
      {children || "Approve"}
    </Button>
  );
}

export function RejectButton({ onClick, className, children, ...props }: ActionButtonProps) {
  return (
    <Button
      size="sm"
      variant="destructive"
      className={`flex items-center gap-1 ${className}`}
      onClick={onClick}
      {...props}
    >
      <X className="h-4 w-4" />
      {children || "Reject"}
    </Button>
  );
}

export function TransferButton({ onClick, className, children, ...props }: ActionButtonProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      className={`flex items-center gap-1 ${className}`}
      onClick={onClick}
      {...props}
    >
      <ArrowUpDown className="h-4 w-4" />
      {children || "Transfer"}
    </Button>
  );
}

export function StatusButton({ onClick, className, children, ...props }: ActionButtonProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      className={`flex items-center gap-1 ${className}`}
      onClick={onClick}
      {...props}
    >
      <Settings className="h-4 w-4" />
      {children || "Status"}
    </Button>
  );
}

export function HistoryButton({ onClick, className, children, ...props }: ActionButtonProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      className={`flex items-center gap-1 ${className}`}
      onClick={onClick}
      {...props}
    >
      <History className="h-4 w-4" />
      {children || "History"}
    </Button>
  );
}

export function MaintenanceButton({ onClick, className, children, ...props }: ActionButtonProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      className={`flex items-center gap-1 ${className}`}
      onClick={onClick}
      {...props}
    >
      <Wrench className="h-4 w-4" />
      {children || "Maintenance"}
    </Button>
  );
}

export function ReportButton({ onClick, className, children, ...props }: ActionButtonProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      className={`flex items-center gap-1 ${className}`}
      onClick={onClick}
      {...props}
    >
      <FileText className="h-4 w-4" />
      {children || "Report"}
    </Button>
  );
}

export function DownloadButton({ onClick, className, children, ...props }: ActionButtonProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      className={`flex items-center gap-1 ${className}`}
      onClick={onClick}
      {...props}
    >
      <Download className="h-4 w-4" />
      {children || "Download"}
    </Button>
  );
}

export function CancelButton({ onClick, className, children, ...props }: ActionButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      {...props}
    >
      {children || "Cancel"}
    </Button>
  );
}

export function SubmitButton({ className, children, ...props }: Omit<ActionButtonProps, 'onClick'>) {
  return (
    <Button
      type="submit"
      {...props}
    >
      {children || "Submit"}
    </Button>
  );
}
