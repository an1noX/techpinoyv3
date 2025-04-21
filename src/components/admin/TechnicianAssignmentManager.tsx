
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Printer as PrinterType } from '@/types/printers';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Wrench, UserCheck, Search, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Technician {
  id: string;
  name: string;
  email: string;
}

interface Assignment {
  id: string;
  printer_id: string;
  user_id: string;
  created_at: string;
  printer: {
    make: string;
    model: string;
  };
  user_name: string;
}

export function TechnicianAssignmentManager() {
  const { toast } = useToast();
  const { user, hasRole } = useAuth();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [printers, setPrinters] = useState<PrinterType[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const isAdmin = hasRole('admin');

  useEffect(() => {
    if (isAdmin) {
      fetchTechnicians();
      fetchPrinters();
      fetchAssignments();
    }
  }, [isAdmin]);

  const fetchTechnicians = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'technician');

      if (profilesError) throw profilesError;

      // Get emails from auth users
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      const techniciansList = profilesData.map(profile => {
        const authUser = authData.users.find(u => u.id === profile.id);
        return {
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name}`.trim() || 'Unnamed Technician',
          email: authUser?.email || 'Unknown email'
        };
      });

      setTechnicians(techniciansList);
    } catch (error: any) {
      console.error('Error fetching technicians:', error);
      toast({
        title: 'Error fetching technicians',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const fetchPrinters = async () => {
    try {
      const { data, error } = await supabase
        .from('printers')
        .select('*');

      if (error) throw error;
      setPrinters(data);
    } catch (error: any) {
      console.error('Error fetching printers:', error);
      toast({
        title: 'Error fetching printers',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_printer_assignments')
        .select(`
          id,
          printer_id,
          user_id,
          created_at,
          printers:printer_id (make, model),
          profiles:user_id (first_name, last_name)
        `);

      if (error) throw error;

      const formattedAssignments = data.map(item => ({
        id: item.id,
        printer_id: item.printer_id,
        user_id: item.user_id,
        created_at: item.created_at,
        printer: {
          make: item.printers?.make || 'Unknown',
          model: item.printers?.model || 'Unknown'
        },
        user_name: `${item.profiles?.first_name || ''} ${item.profiles?.last_name || ''}`.trim() || 'Unknown Technician'
      }));

      setAssignments(formattedAssignments);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      toast({
        title: 'Error fetching assignments',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async () => {
    if (!selectedTechnician || !selectedPrinter) {
      toast({
        title: 'Incomplete information',
        description: 'Please select both a technician and a printer.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Check if assignment already exists
      const { data: existingData, error: existingError } = await supabase
        .from('user_printer_assignments')
        .select('id')
        .eq('user_id', selectedTechnician)
        .eq('printer_id', selectedPrinter);

      if (existingError) throw existingError;

      if (existingData && existingData.length > 0) {
        toast({
          title: 'Assignment already exists',
          description: 'This technician is already assigned to this printer.',
          variant: 'destructive'
        });
        return;
      }

      const { data, error } = await supabase
        .from('user_printer_assignments')
        .insert({
          user_id: selectedTechnician,
          printer_id: selectedPrinter,
          assigned_by: user?.id
        })
        .select();

      if (error) throw error;

      toast({
        title: 'Assignment created',
        description: 'Technician has been assigned to the printer successfully.'
      });

      // Reset selection
      setSelectedTechnician('');
      setSelectedPrinter('');
      
      // Refresh assignments
      fetchAssignments();
    } catch (error: any) {
      toast({
        title: 'Error creating assignment',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('user_printer_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      setAssignments(assignments.filter(a => a.id !== assignmentId));
      toast({
        title: 'Assignment removed',
        description: 'Technician assignment has been removed successfully.'
      });
    } catch (error: any) {
      toast({
        title: 'Error removing assignment',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredAssignments = assignments.filter(assignment => 
    assignment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${assignment.printer.make} ${assignment.printer.model}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Technician Printer Assignments
        </CardTitle>
        <CardDescription>
          Assign printers to technicians to grant them management permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Card className="mb-6 bg-muted/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Select Technician</label>
                <Select
                  value={selectedTechnician}
                  onValueChange={setSelectedTechnician}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map(tech => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Select Printer</label>
                <Select
                  value={selectedPrinter}
                  onValueChange={setSelectedPrinter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a printer" />
                  </SelectTrigger>
                  <SelectContent>
                    {printers.map(printer => (
                      <SelectItem key={printer.id} value={printer.id}>
                        {printer.make} {printer.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button onClick={createAssignment} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex items-center mb-6 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search assignments..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No assignments found</p>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <div key={assignment.id} className="p-4 border rounded flex items-center justify-between">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    {assignment.user_name}
                  </div>
                  <div className="flex items-center mt-1">
                    <Wrench className="h-4 w-4 text-blue-600 mr-2" />
                    <Badge variant="outline">
                      {assignment.printer.make} {assignment.printer.model}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => deleteAssignment(assignment.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
