
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, Hammer, SlidersHorizontal } from "lucide-react";

interface MaintenanceRecord {
  id: string;
  printer_id: string | null;
  status: string;
  remarks?: string;
  issue_description?: string;
  repair_notes?: string;
  started_at?: string;
  completed_at?: string;
  technician?: string;
  created_at: string;
  updated_at: string;
}

export default function Maintenance() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("maintenance_records")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setRecords(data as MaintenanceRecord[]);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-2 py-4">
      <div className="flex items-center gap-3 mb-6">
        <Wrench className="h-7 w-7 text-sky-700" />
        <h1 className="text-2xl font-bold">Repair & Maintenance</h1>
      </div>
      <div className="mb-4 text-muted-foreground max-w-2xl">
        Track, record, and manage printer maintenance and repair events in your fleet.
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              No repair or maintenance records found.
            </div>
          ) : (
            records.map((rec) => (
              <Card key={rec.id}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Hammer className="h-5 w-5" /> {rec.issue_description || "Maintenance Activity"}
                    </CardTitle>
                    {getStatusBadge(rec.status)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {rec.technician ? `Technician: ${rec.technician}` : ""}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <div className="text-sm mb-2">
                    {rec.repair_notes
                      ? rec.repair_notes
                      : rec.remarks
                      ? rec.remarks
                      : "No additional notes."}
                  </div>
                  <div className="text-xs text-muted-foreground flex gap-4">
                    <span>Started: {rec.started_at ? new Date(rec.started_at).toLocaleDateString() : "-"}</span>
                    <span>Finished: {rec.completed_at ? new Date(rec.completed_at).toLocaleDateString() : "-"}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
