import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Printer, 
  Calendar, 
  User, 
  DollarSign, 
  ClipboardList, 
  Wrench,
  FileText,
  Wrench as WrenchIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

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
            serial_number,
            location,
            department
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

  const updateMaintenanceStatus = async (status: "pending" | "in_progress" | "completed" | "unrepairable" | "decommissioned") => {
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

  const generateServiceReport = async () => {
    try {
      // Check if report already exists
      const { data: existingReports, error: checkError } = await supabase
        .from('maintenance_reports')
        .select('id')
        .eq('maintenance_record_id', id);
      
      if (checkError) throw checkError;
      
      // Prepare report content
      const reportContent = {
        record_id: id,
        printer: {
          make: record.printers?.make,
          model: record.printers?.model,
          series: record.printers?.series,
          serial: record.printers?.serial_number,
          location: record.printers?.location,
          department: record.printers?.department
        },
        issue: record.issue_description,
        diagnosis: record.diagnostic_notes,
        repair_notes: record.repair_notes,
        parts_used: record.parts_used,
        technician: record.technician,
        cost: record.cost,
        dates: {
          reported: record.reported_at,
          started: record.started_at,
          completed: record.completed_at
        },
        status: record.status,
        generated_at: new Date().toISOString()
      };
      
      let reportId;
      
      if (existingReports && existingReports.length > 0) {
        // Update existing report
        const { error: updateError } = await supabase
          .from('maintenance_reports')
          .update({ 
            report_content: reportContent,
            generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('maintenance_record_id', id);
        
        if (updateError) throw updateError;
        
        reportId = existingReports[0].id;
      } else {
        // Create new report
        const { data: newReport, error: insertError } = await supabase
          .from('maintenance_reports')
          .insert([{
            maintenance_record_id: id,
            report_content: reportContent,
            generated_at: new Date().toISOString()
          }])
          .select();
        
        if (insertError) throw insertError;
        
        reportId = newReport[0].id;
      }
      
      toast({
        title: "Service report generated",
        description: "The service report has been created successfully.",
      });
      
      // In a real app, you might navigate to a report viewer or download it
      // For now, we'll just show a success message
    } catch (error: any) {
      toast({
        title: "Error generating report",
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
          
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">Actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/maintenance/edit/${id}`)}>
                  <WrenchIcon className="mr-2 h-4 w-4" />
                  Edit Record
                </DropdownMenuItem>
                <DropdownMenuItem onClick={generateServiceReport}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Status</CardTitle>
            <Badge className={getStatusColor(record.status)}>
              {record.status?.replace('_', ' ')}
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
            {record.printers?.location && (
              <div className="flex items-center">
                <span className="mr-2 text-muted-foreground">Location:</span>
                <span>{record.printers.location}</span>
              </div>
            )}
            {record.printers?.department && (
              <div className="flex items-center">
                <span className="mr-2 text-muted-foreground">Department:</span>
                <span>{record.printers.department}</span>
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
            {record.reported_by && (
              <CardDescription>
                Reported by {record.reported_by} 
                {record.reported_at && ` on ${format(new Date(record.reported_at), 'MMM d, yyyy')}`}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <p>{record.issue_description || "No description provided"}</p>
          </CardContent>
        </Card>

        {record.diagnostic_notes && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Diagnostic Notes</CardTitle>
              {record.diagnosed_by && (
                <CardDescription>
                  Diagnosed by {record.diagnosed_by}
                  {record.diagnosis_date && ` on ${format(new Date(record.diagnosis_date), 'MMM d, yyyy')}`}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p>{record.diagnostic_notes}</p>
            </CardContent>
          </Card>
        )}

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

        {record.parts_used && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Parts Used</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{record.parts_used}</p>
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

        {record.remarks && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Additional Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{record.remarks}</p>
            </CardContent>
          </Card>
        )}

        {record.next_maintenance_date && (
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground block">Next Scheduled Maintenance</span>
                  <span>{format(new Date(record.next_maintenance_date), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-4">
          <Button 
            onClick={() => navigate(`/maintenance/edit/${id}`)}
            className="w-full"
          >
            <WrenchIcon className="h-4 w-4 mr-2" />
            Edit Maintenance Record
          </Button>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={generateServiceReport}
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            Generate Service Report
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
