
import { useState } from "react";
import { PrinterType } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, MapPin, CalendarCheck, Building2, User2, Tag, FileText, Box, Copy } from "lucide-react";
import { toast } from "sonner";

interface PrinterDetailsTabProps {
  printer: PrinterType;
  onUpdate: (printer: PrinterType) => void;
  canEdit: boolean;
}

export function PrinterDetailsTab({ printer, onUpdate, canEdit }: PrinterDetailsTabProps) {
  const [notes, setNotes] = useState(printer.notes || "");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const handleEditNotes = () => {
    setIsEditingNotes(true);
  };

  const handleSaveNotes = () => {
    onUpdate({ ...printer, notes });
    setIsEditingNotes(false);
    toast.success("Notes updated successfully");
  };

  const handleCancelNotes = () => {
    setNotes(printer.notes || "");
    setIsEditingNotes(false);
  };

  const getStatusColor = () => {
    switch (printer.status) {
      case "available": return "bg-green-100 text-green-800";
      case "deployed": return "bg-blue-100 text-blue-800";
      case "maintenance": return "bg-amber-100 text-amber-800";
      case "for_repair": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Printer Information</h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Model:</span>
              </div>
              <span className="text-sm">{printer.model}</span>

              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Make:</span>
              </div>
              <span className="text-sm">{printer.make || "Unknown"}</span>

              <div className="flex items-center gap-2">
                <Copy className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Serial:</span>
              </div>
              <span className="text-sm">{printer.serialNumber || "N/A"}</span>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Status:</span>
              </div>
              <Badge className={`${getStatusColor()} px-2 py-1 text-xs`}>
                {printer.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Assignment Information</h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Client:</span>
              </div>
              <span className="text-sm">{printer.client || "Not assigned"}</span>

              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Department:</span>
              </div>
              <span className="text-sm">{printer.department || "Not assigned"}</span>

              <div className="flex items-center gap-2">
                <User2 className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Assigned to:</span>
              </div>
              <span className="text-sm">{printer.assignedAdmin || "Not assigned"}</span>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Location:</span>
              </div>
              <span className="text-sm">{printer.location || "N/A"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Notes</h3>
            {canEdit && !isEditingNotes && (
              <Button size="sm" variant="outline" onClick={handleEditNotes}>
                Edit Notes
              </Button>
            )}
          </div>

          {isEditingNotes ? (
            <div className="space-y-2">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this printer"
                className="h-32"
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={handleCancelNotes}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveNotes}>
                  Save Notes
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm">
              {printer.notes || "No notes added yet."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
