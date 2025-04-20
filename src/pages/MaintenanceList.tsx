
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MaintenanceStatus } from '@/components/printers/MaintenanceStatus';
import { PrinterStatus } from '@/components/printers/PrinterStatus';
import { MaintenanceStatus as MaintenanceStatusType, PrinterStatus as PrinterStatusType } from '@/types/printers';
import { PlusCircle, Wrench, Filter, Search, Calendar, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';
import { DatePickerField } from '@/components/printers/maintenance/DatePickerField';

export default function MaintenanceList() {
  const navigate = useNavigate();
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatusType | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [printerDetailsMap, setPrinterDetailsMap] = useState<{[key: string]: any}>({});
  
  const fetchMaintenanceRecords = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('maintenance_records')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (dateFilter) {
        const dateString = format(dateFilter, 'yyyy-MM-dd');
        query = query.gte('created_at', `${dateString}T00:00:00`)
          .lt('created_at', `${dateString}T23:59:59`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const printerIds = [...new Set((data || []).map((record) => record.printer_id))];
      await fetchPrinterDetails(printerIds);
      
      setMaintenanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPrinterDetails = async (printerIds: string[]) => {
    if (printerIds.length === 0) return;
    
    try {
      const { data, error } = await supabase
        .from('printers')
        .select('id, make, model, status')
        .in('id', printerIds);
      
      if (error) throw error;
      
      const detailsMap: {[key: string]: any} = {};
      (data || []).forEach(printer => {
        detailsMap[printer.id] = printer;
      });
      
      setPrinterDetailsMap(detailsMap);
    } catch (error) {
      console.error('Error fetching printer details:', error);
    }
  };
  
  useEffect(() => {
    fetchMaintenanceRecords();
  }, [statusFilter, dateFilter]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMaintenanceRecords();
  };
  
  const handleCreateRecord = () => {
    navigate('/maintenance/new');
  };
  
  const handleRefresh = () => {
    fetchMaintenanceRecords();
  };
  
  const filteredRecords = maintenanceRecords.filter(record => 
    record.issue_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.technician?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    printerDetailsMap[record.printer_id]?.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    printerDetailsMap[record.printer_id]?.make.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Create the content that will be rendered inside AdminLayout
  const maintenanceListContent = (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Maintenance & Repair</h1>
          <p className="text-muted-foreground">Manage printer maintenance and repair records</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateRecord}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Record
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <Input 
                  placeholder="Search by description, technician, or printer model..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </div>
            <div className="flex space-x-2">
              <div className="w-48">
                <Select 
                  value={statusFilter} 
                  onValueChange={(value) => setStatusFilter(value as MaintenanceStatusType | 'all')}
                >
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                    </SelectItem>
                    <SelectItem value="in_progress">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>
                    </SelectItem>
                    <SelectItem value="completed">
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
                    </SelectItem>
                    <SelectItem value="unrepairable">
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Unrepairable</Badge>
                    </SelectItem>
                    <SelectItem value="decommissioned">
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Decommissioned</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-48">
                <DatePickerField 
                  field={{
                    value: dateFilter,
                    onChange: setDateFilter
                  }}
                  label="Filter by date"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Wrench className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No maintenance records found</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Create a new maintenance record to track repair activity and maintenance schedule for your printers.
          </p>
          <Button onClick={handleCreateRecord}>
            Create First Record
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Printer</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Printer Status</TableHead>
                <TableHead>Record Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/maintenance/${record.id}`)}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {printerDetailsMap[record.printer_id]?.make} {printerDetailsMap[record.printer_id]?.model}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="truncate">{record.issue_description || 'Maintenance Record'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(record.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {record.technician || 'Not assigned'}
                  </TableCell>
                  <TableCell>
                    {printerDetailsMap[record.printer_id]?.status && (
                      <PrinterStatus 
                        status={printerDetailsMap[record.printer_id].status as PrinterStatusType} 
                        size="sm"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <MaintenanceStatus 
                      status={record.status as MaintenanceStatusType} 
                      size="sm"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
  
  // Since AdminLayout uses Outlet, we need a different approach
  // We'll return the AdminLayout without children
  return (
    <div className="admin-layout">
      {maintenanceListContent}
    </div>
  );
}
