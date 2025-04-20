
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MaintenanceStatus } from '@/components/printers/MaintenanceStatus';
import { QuickUpdateDialog } from '@/components/printers/maintenance/QuickUpdateDialog';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface PrinterMaintenanceTabProps {
  printerId: string;
  printerDetails: any;
  onRefresh?: () => void;
}

export function PrinterMaintenanceTab({ 
  printerId, 
  printerDetails,
  onRefresh 
}: PrinterMaintenanceTabProps) {
  const navigate = useNavigate();
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickUpdateOpen, setQuickUpdateOpen] = useState(false);
  
  useEffect(() => {
    fetchMaintenanceRecords();
  }, [printerId]);
  
  const fetchMaintenanceRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('maintenance_records')
        .select('*')
        .eq('printer_id', printerId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setMaintenanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateMaintenanceRecord = () => {
    navigate(`/maintenance/new/${printerId}`);
  };
  
  const handleQuickUpdateSuccess = () => {
    fetchMaintenanceRecords();
    if (onRefresh) onRefresh();
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Maintenance & Repair History</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setQuickUpdateOpen(true)}
          >
            <Wrench className="h-4 w-4 mr-2" />
            Quick Update
          </Button>
          <Button 
            size="sm" 
            onClick={handleCreateMaintenanceRecord}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Record
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : maintenanceRecords.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <Wrench className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No maintenance or repair records found</p>
          <Button 
            className="mt-4" 
            onClick={handleCreateMaintenanceRecord}
          >
            Create First Record
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {maintenanceRecords.map((record) => (
            <Card key={record.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/maintenance/${record.id}`)}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{record.issue_description || 'Maintenance Record'}</p>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <span>{format(new Date(record.created_at), 'MMM d, yyyy')}</span>
                    {record.technician && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{record.technician}</span>
                      </>
                    )}
                  </div>
                </div>
                <MaintenanceStatus status={record.status} />
              </div>
              {record.repair_notes && (
                <p className="mt-2 text-sm line-clamp-2 text-muted-foreground">
                  {record.repair_notes}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
      
      <QuickUpdateDialog
        open={quickUpdateOpen}
        onOpenChange={setQuickUpdateOpen}
        printer={{
          id: printerId,
          make: printerDetails?.make || '',
          model: printerDetails?.model || '',
          status: printerDetails?.status || 'unknown'
        }}
        onSuccess={handleQuickUpdateSuccess}
      />
    </div>
  );
}
