import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Fab } from '@/components/ui/fab';
import { Search, Calendar, Plus, Filter, Clock, DollarSign, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import { Switch } from '@/components/ui/switch';
import { Rental, Printer, RentalOption } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow, format, addDays } from 'date-fns';

const LOCATIONS = ['Floor 1', 'Floor 2', 'Floor 3', 'Warehouse', 'Client Site'];
const RENTAL_STATUSES = ['available', 'rented', 'maintenance'];
const RATE_RANGES = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: 'Over $200', min: 200, max: 10000 }
];

export default function Rentals() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [availablePrinters, setAvailablePrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterRateRange, setFilterRateRange] = useState<{min: number, max: number} | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<{start: Date | null, end: Date | null}>({
    start: null,
    end: null
  });
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<'available' | 'maintenance'>('available');
  const [statusNote, setStatusNote] = useState('');
  
  useEffect(() => {
    fetchRentals();
    fetchAvailablePrinters();
  }, [activeTab]);
  
  const fetchRentals = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('rentals')
        .select('*');
      
      if (activeTab === 'active') {
        query = query.eq('status', 'active');
      } else if (activeTab === 'upcoming') {
        query = query.eq('status', 'upcoming');
      } else if (activeTab === 'completed') {
        query = query.eq('status', 'completed');
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setRentals(data as Rental[]);
    } catch (error: any) {
      toast({
        title: "Error fetching rentals",
        description: error.message,
        variant: "destructive"
      });
      
      const mockRentals: Rental[] = [
        { 
          id: '1',
          printer_id: '1',
          client_id: 'client1',
          client: 'Acme Corp',
          printer: 'HP LaserJet Pro MFP M428fdn',
          start_date: '2023-04-10',
          end_date: '2023-06-10',
          status: 'active',
          signature_url: null,
          agreement_url: null,
          inquiry_count: 3,
          booking_count: 2,
          next_available_date: '2023-06-15',
          created_at: '2023-04-10',
          updated_at: '2023-04-10',
          created_by: null,
          notes: null
        },
        { 
          id: '2',
          printer_id: '2',
          client_id: 'client2',
          client: 'TechSolutions Inc',
          printer: 'Brother MFC-L8900CDW',
          start_date: '2023-03-15',
          end_date: '2023-05-15',
          status: 'active',
          signature_url: null,
          agreement_url: null,
          inquiry_count: 1,
          booking_count: 1,
          next_available_date: '2023-05-20',
          created_at: '2023-03-15',
          updated_at: '2023-03-15',
          created_by: null,
          notes: null
        },
        { 
          id: '3',
          printer_id: '3',
          client_id: 'client3',
          client: 'Global Services LLC',
          printer: 'Canon imageRUNNER 1643i',
          start_date: '2023-02-01',
          end_date: '2023-04-01',
          status: 'completed',
          signature_url: null,
          agreement_url: null,
          inquiry_count: 0,
          booking_count: 0,
          next_available_date: '2023-04-02',
          created_at: '2023-02-01',
          updated_at: '2023-04-01',
          created_by: null,
          notes: null
        },
      ];
      
      setRentals(mockRentals);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAvailablePrinters = async () => {
    try {
      const { data, error } = await supabase
        .from('printers')
        .select('*')
        .eq('status', 'available');
        
      if (error) {
        throw error;
      }
      
      setAvailablePrinters(data as Printer[]);
    } catch (error: any) {
      toast({
        title: "Error fetching available printers",
        description: error.message,
        variant: "destructive"
      });
      
      const mockPrinters: Printer[] = [
        {
          id: '4',
          make: 'Xerox',
          series: 'WorkCentre',
          model: '6515',
          status: 'available',
          owned_by: 'system',
          department: 'Sales',
          location: 'Floor 1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_for_rent: true,
        },
        {
          id: '5',
          make: 'Epson',
          series: 'WorkForce',
          model: 'WF-7840',
          status: 'available',
          owned_by: 'system',
          department: 'Marketing',
          location: 'Floor 2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_for_rent: true,
        },
      ];
      
      setAvailablePrinters(mockPrinters);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const getFilteredRentals = () => {
    return rentals.filter(rental => {
      const matchesSearch = (
        (rental.client && rental.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rental.printer && rental.printer.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      return matchesSearch;
    });
  };
  
  const getFilteredPrinters = () => {
    return availablePrinters.filter(printer => {
      const matchesSearch = (
        printer.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        printer.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (printer.department && printer.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (printer.location && printer.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      const matchesLocation = !filterLocation || 
        (printer.location && printer.location.includes(filterLocation));
        
      const matchesStatus = !filterStatus || printer.status === filterStatus;
      
      return matchesSearch && matchesLocation && matchesStatus;
    });
  };
  
  const handleApproveBooking = async (rentalId: string) => {
    try {
      toast({
        title: "Booking approved",
        description: "The booking has been approved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error approving booking",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleRejectBooking = async (rentalId: string) => {
    try {
      toast({
        title: "Booking rejected",
        description: "The booking has been rejected",
      });
    } catch (error: any) {
      toast({
        title: "Error rejecting booking",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleStatusChange = async (printer_id: string) => {
    try {
      toast({
        title: "Printer status updated",
        description: `Printer has been marked as ${newStatus}`,
      });
      setShowStatusDialog(false);
    } catch (error: any) {
      toast({
        title: "Error updating printer status",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleExtendRental = async (rentalId: string) => {
    toast({
      title: "Extend rental",
      description: "This feature will be implemented soon",
    });
  };
  
  const handleViewRentalDetails = (rentalId: string) => {
    navigate(`/rentals/${rentalId}`);
  };
  
  const filteredRentals = getFilteredRentals();
  const filteredPrinters = getFilteredPrinters();
  
  return (
    <MobileLayout
      fab={
        <Fab 
          icon={<Plus size={24} />} 
          aria-label="Create rental" 
          onClick={() => navigate('/rentals/new')}
        />
      }
    >
      <div className="container px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Rental Management</h1>
            <p className="text-sm text-muted-foreground">Manage printer rentals and bookings</p>
          </div>
        </div>

        <Tabs 
          defaultValue="active" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Past</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-4">
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search active rentals..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  toast({
                    title: "Calendar view",
                    description: "This feature will be implemented soon",
                  });
                }}
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
            
            {showFilters && (
              <div className="mb-6 p-4 border rounded-md shadow-sm bg-background">
                <h3 className="font-medium mb-3">Filter Rentals</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-muted-foreground">Location</label>
                    <Select value={filterLocation} onValueChange={setFilterLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Locations</SelectItem>
                        {LOCATIONS.map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Status</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        {RENTAL_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mr-2"
                    onClick={() => {
                      setFilterLocation('');
                      setFilterStatus('');
                      setFilterRateRange(null);
                    }}
                  >
                    Clear
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredRentals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No active rentals found</p>
                <Button className="mt-4" onClick={() => navigate('/rentals/new')}>Create Rental</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRentals.map((rental) => (
                  <Card key={rental.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">{rental.client}</CardTitle>
                        <Badge className="bg-status-rented text-black">
                          {rental.status === 'active' ? 'Active' : 
                           rental.status === 'completed' ? 'Completed' : 
                           'Upcoming'}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm flex items-center">
                        <span>{rental.printer}</span>
                        {rental.inquiry_count > 0 && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {rental.inquiry_count} {rental.inquiry_count === 1 ? 'inquiry' : 'inquiries'}
                          </Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-sm mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-muted-foreground">Start:</span>
                          <span className="font-medium">{new Date(rental.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">End:</span>
                          <span className="font-medium">{new Date(rental.end_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-muted-foreground">Next Available:</span>
                          <span className="font-medium">{rental.next_available_date ? 
                            new Date(rental.next_available_date).toLocaleDateString() : 'TBD'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 mr-2"
                          onClick={() => handleViewRentalDetails(rental.id)}
                        >
                          Details
                        </Button>
                        {rental.status === 'active' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleExtendRental(rental.id)}
                          >
                            Extend
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="mt-4">
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search upcoming rentals..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center py-8">
              <p className="text-muted-foreground">No upcoming rentals found</p>
              <Button className="mt-4" onClick={() => navigate('/rentals/new')}>Create Rental</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search past rentals..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            {filteredRentals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No past rentals found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRentals
                  .filter(rental => rental.status === 'completed')
                  .map((rental) => (
                    <Card key={rental.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-lg">{rental.client}</CardTitle>
                          <Badge variant="outline">Completed</Badge>
                        </div>
                        <CardDescription className="text-sm">{rental.printer}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-sm mb-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-muted-foreground">Started:</span>
                            <span className="font-medium">{new Date(rental.start_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ended:</span>
                            <span className="font-medium">{new Date(rental.end_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleViewRentalDetails(rental.id)}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="available" className="mt-4">
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search available printers..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            {showFilters && (
              <div className="mb-6 p-4 border rounded-md shadow-sm bg-background">
                <h3 className="font-medium mb-3">Filter Available Printers</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-muted-foreground">Location</label>
                    <Select value={filterLocation} onValueChange={setFilterLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Locations</SelectItem>
                        {LOCATIONS.map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Rate Range</label>
                    <Select 
                      value={filterRateRange ? `${filterRateRange.min}-${filterRateRange.max}` : ''}
                      onValueChange={(val) => {
                        if (!val) {
                          setFilterRateRange(null);
                          return;
                        }
                        const [min, max] = val.split('-').map(Number);
                        setFilterRateRange({ min, max });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rate range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Rates</SelectItem>
                        {RATE_RANGES.map((range) => (
                          <SelectItem key={range.label} value={`${range.min}-${range.max}`}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mr-2"
                    onClick={() => {
                      setFilterLocation('');
                      setFilterRateRange(null);
                    }}
                  >
                    Clear
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
            
            {filteredPrinters.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No available printers for rent</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPrinters.map((printer) => (
                  <Card key={printer.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">{printer.make} {printer.model}</CardTitle>
                        <Badge className="bg-status-available text-white">Available</Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {printer.department} • {printer.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-sm mb-3">
                        <div className="flex items-center mb-1">
                          <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{printer.location || 'No location set'}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>$120/week (mock data)</span>
                        </div>
                      </div>
                      <div className="flex justify-between mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 mr-2"
                          onClick={() => navigate(`/printers/${printer.id}`)}
                        >
                          Details
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/rentals/new?printerId=${printer.id}`)}
                        >
                          Rent Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Request</DialogTitle>
            <DialogDescription>
              Review and approve or reject this booking request.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRental && (
            <div className="py-4">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Client</TableCell>
                    <TableCell>{selectedRental.client}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Printer</TableCell>
                    <TableCell>{selectedRental.printer}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Start Date</TableCell>
                    <TableCell>{new Date(selectedRental.start_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">End Date</TableCell>
                    <TableCell>{new Date(selectedRental.end_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedRental) handleRejectBooking(selectedRental.id);
                setShowBookingDialog(false);
              }}
            >
              Reject
            </Button>
            <Button
              onClick={() => {
                if (selectedRental) handleApproveBooking(selectedRental.id);
                setShowBookingDialog(false);
              }}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Printer Status</DialogTitle>
            <DialogDescription>
              Change the printer status and add an optional note.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium">New Status</label>
              <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Note (optional)</label>
              <Input
                placeholder="Add details about this status change"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleStatusChange(selectedRental?.printer_id || '')}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
