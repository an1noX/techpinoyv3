
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { MaintenanceForm } from '@/components/printers/maintenance/MaintenanceForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePrinterDetail } from '@/hooks/usePrinterDetail';

export default function MaintenanceEdit() {
  const { id, printerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<any>(null);
  
  // If printerId is provided, fetch printer details
  const { printer } = usePrinterDetail(printerId || '');
  
  useEffect(() => {
    if (id) {
      fetchMaintenanceRecord(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchMaintenanceRecord = async (recordId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('maintenance_records')
        .select('*')
        .eq('id', recordId)
        .single();

      if (error) throw error;
      setRecord(data);
    } catch (error: any) {
      toast({
        title: "Error fetching maintenance record",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (id) {
        // Update existing record
        const { error } = await supabase
          .from('maintenance_records')
          .update({ 
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Record updated",
          description: "Maintenance record has been updated successfully."
        });
        
        navigate(`/maintenance/${id}`);
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('maintenance_records')
          .insert([{ 
            ...formData,
            printer_id: printerId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();

        if (error) throw error;

        toast({
          title: "Record created",
          description: "New maintenance record has been created successfully."
        });
        
        navigate(`/maintenance/${data[0].id}`);
      }
    } catch (error: any) {
      toast({
        title: "Error saving record",
        description: error.message,
        variant: "destructive"
      });
      throw error; // Re-throw to be handled by the form
    }
  };

  const isLoading = loading || (printerId && !printer);

  return (
    <MobileLayout>
      <div className="container px-4 py-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => id ? navigate(`/maintenance/${id}`) : navigate('/maintenance')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {id ? 'Edit Maintenance Record' : 'New Maintenance Record'}
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <MaintenanceForm
            printer={printer}
            existingRecord={record}
            onSubmit={handleFormSubmit}
            onCancel={() => id ? navigate(`/maintenance/${id}`) : navigate('/maintenance')}
            mode={id ? 'edit' : 'create'}
          />
        )}
      </div>
    </MobileLayout>
  );
}
