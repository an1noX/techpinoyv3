
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Filter, Plus, Calendar, Printer, Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MaintenanceStatus } from '@/components/printers/MaintenanceStatus';
import { PrinterStatus } from '@/components/printers/PrinterStatus';
import { MaintenanceStatus as MaintenanceStatusType } from '@/types/printers';

export default function MaintenanceList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [selectedStatuses, setSelectedStatuses] = useState<MaintenanceStatusType[]>([]);
  const [needsAttention, setNeedsAttention] = useState(false);
  
  // For "New Record" dropdown
  const [printers, setPrinters] = useState<any[]>([]);
  const [loadingPrinters, setLoadingPrinters] = useState(false);

  useEffect(() => {
    fetchMaintenanceRecords();
    fetchPrinters();
  }, []);

  const fetchMaintenanceRecords = async () => {
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
            series
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching maintenance records",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPrinters = async () => {
    try {
      setLoadingPrinters(true);
      const { data, error } = await supabase
        .from('printers')
        .select('id, make, model, status')
        .order('make', { ascending: true });

      if (error) throw error;
      setPrinters(data || []);
    } catch (error: any) {
      console.error("Error fetching printers:", error);
    } finally {
      setLoadingPrinters(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Filter and search functionality
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      searchTerm === '' || 
      record.printers?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.printers?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.issue_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.technician?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      selectedStatuses.length === 0 || 
      selectedStatuses.includes(record.status);
    
    const matchesAttention = 
      !needsAttention || 
      record.status === 'pending' || 
      record.status === 'in_progress';
    
    return matchesSearch && matchesStatus && matchesAttention;
  });

  return (
    <MobileLayout>
      <div className="container px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Repair & Maintenance</h1>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Record
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Create for Printer</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {loadingPrinters ? (
                <div className="p-2 text-center">Loading printers...</div>
              ) : printers.length === 0 ? (
                <div className="p-2 text-center">No printers found</div>
              ) : (
                <>
                  <DropdownMenuCheckboxItem
                    onClick={() => navigate('/maintenance/new')}
                    className="cursor-pointer"
                  >
                    Select Printer Later
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  
                  {printers.map(printer => (
                    <DropdownMenuCheckboxItem
                      key={printer.id}
                      onClick={() => navigate(`/maintenance/new/${printer.id}`)}
                      className="cursor-pointer"
                    >
                      {printer.make} {printer.model}
                    </DropdownMenuCheckboxItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search records..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes('pending')}
                onCheckedChange={(checked) => {
                  setSelectedStatuses(prev => 
                    checked 
                      ? [...prev, 'pending'] 
                      : prev.filter(s => s !== 'pending')
                  );
                }}
              >
                <Badge className="bg-yellow-500 text-black mr-2">Pending</Badge>
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes('in_progress')}
                onCheckedChange={(checked) => {
                  setSelectedStatuses(prev => 
                    checked 
                      ? [...prev, 'in_progress'] 
                      : prev.filter(s => s !== 'in_progress')
                  );
                }}
              >
                <Badge className="bg-blue-500 text-white mr-2">In Progress</Badge>
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes('completed')}
                onCheckedChange={(checked) => {
                  setSelectedStatuses(prev => 
                    checked 
                      ? [...prev, 'completed'] 
                      : prev.filter(s => s !== 'completed')
                  );
                }}
              >
                <Badge className="bg-green-500 text-white mr-2">Completed</Badge>
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes('unrepairable')}
                onCheckedChange={(checked) => {
                  setSelectedStatuses(prev => 
                    checked 
                      ? [...prev, 'unrepairable'] 
                      : prev.filter(s => s !== 'unrepairable')
                  );
                }}
              >
                <Badge className="bg-red-500 text-white mr-2">Unrepairable</Badge>
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes('decommissioned')}
                onCheckedChange={(checked) => {
                  setSelectedStatuses(prev => 
                    checked 
                      ? [...prev, 'decommissioned'] 
                      : prev.filter(s => s !== 'decommissioned')
                  );
                }}
              >
                <Badge className="bg-gray-500 text-white mr-2">Decommissioned</Badge>
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Special Filters</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={needsAttention}
                onCheckedChange={setNeedsAttention}
              >
                Needs Attention
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No maintenance records found</p>
            <Button className="mt-4" onClick={() => navigate('/maintenance/new')}>
              Create New Record
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-1">
                      <Printer className="h-4 w-4 mr-2 text-muted-foreground" />
                      <h3 className="font-medium">
                        {record.printers?.make} {record.printers?.model}
                      </h3>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(record.created_at)}</span>
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
                <p className="mt-2 text-sm line-clamp-2">
                  {record.issue_description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/maintenance/${record.id}`)}
                    className="flex items-center"
                  >
                    <Wrench className="h-3 w-3 mr-1.5" />
                    View Details
                  </Button>
                  
                  {record.cost && (
                    <div className="text-sm font-medium">
                      ${parseFloat(record.cost).toFixed(2)}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
