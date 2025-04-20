
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, Calendar, User, Tool, DollarSign, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function MaintenanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      fetchMaintenanceRecord(id);
    }
  }, [id]);

  const fetchMaintenanceRecord = async (recordId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('maintenance_records')
        .select(`
          *,
          printers (
            id,
            make,
            model,
            series,
            serial_number
          )
        `)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white';
      case 'pending': return 'bg-yellow-500 text-black';
      case 'unrepairable': return 'bg-red-500 text-white';
      case 'decommissioned': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const updateMaintenanceStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_records')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setRecord({ ...record, status });
      
      toast({
        title: "Status updated",
        description: `Maintenance status updated to ${status}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!record) {
    return (
      <MobileLayout>
        <div className="container px-4 py-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Maintenance record not found</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate('/maintenance')}
            >
              Back to Maintenance List
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="container px-4 py-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/maintenance')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Maintenance Details</h1>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Status</CardTitle>
            <Badge className={getStatusColor(record.status)}>
              {record.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateMaintenanceStatus('pending')}
                className={record.status === 'pending' ? 'bg-yellow-100' : ''}
              >
                Pending
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateMaintenanceStatus('in_progress')}
                className={record.status === 'in_progress' ? 'bg-blue-100' : ''}
              >
                In Progress
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateMaintenanceStatus('completed')}
                className={record.status === 'completed' ? 'bg-green-100' : ''}
              >
                Completed
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateMaintenanceStatus('unrepairable')}
                className={record.status === 'unrepairable' ? 'bg-red-100' : ''}
              >
                Unrepairable
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateMaintenanceStatus('decommissioned')}
                className={record.status === 'decommissioned' ? 'bg-gray-100' : ''}
              >
                Decommissioned
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Printer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <Printer className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="font-medium">{record.printers?.make} {record.printers?.model}</span>
            </div>
            {record.printers?.series && (
              <div className="flex items-center">
                <span className="mr-2 text-muted-foreground">Series:</span>
                <span>{record.printers.series}</span>
              </div>
            )}
            {record.printers?.serial_number && (
              <div className="flex items-center">
                <span className="mr-2 text-muted-foreground">Serial Number:</span>
                <span>{record.printers.serial_number}</span>
              </div>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate(`/printers/${record.printers?.id}`)}
            >
              View Printer Details
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Issue Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{record.issue_description || "No description provided"}</p>
          </CardContent>
        </Card>

        {record.repair_notes && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Repair Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{record.repair_notes}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          {record.started_at && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-col">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Started</span>
                  </div>
                  <span>{format(new Date(record.started_at), 'MMM d, yyyy')}</span>
                </div>
              </CardContent>
            </Card>
          )}
          
          {record.completed_at && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-col">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Completed</span>
                  </div>
                  <span>{format(new Date(record.completed_at), 'MMM d, yyyy')}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {record.technician && (
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground block">Technician</span>
                  <span>{record.technician}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {record.cost && (
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground block">Cost</span>
                  <span>${parseFloat(record.cost).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button 
          className="w-full mb-4"
          onClick={() => navigate(`/maintenance/${id}/edit`)}
        >
          Edit Maintenance Record
        </Button>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            toast({
              title: "Feature in development",
              description: "Service report generation will be available soon.",
            });
          }}
        >
          <ClipboardList className="h-4 w-4 mr-2" />
          Generate Service Report
        </Button>
      </div>
    </MobileLayout>
  );
}
