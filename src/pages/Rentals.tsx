
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
import { Slider } from '@/components/ui/slider';  // Corrected import path
import { Toggle } from '@/components/ui/toggle';
import { Switch } from '@/components/ui/switch';
import { Rental, Printer, RentalOptions } from '@/types';
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

// Config for filter options
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
  
  // State management
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
  
  // Fetch data when component mounts or when activeTab changes
  useEffect(() => {
    fetchRentals();
    fetchAvailablePrinters();
  }, [activeTab]);
  
  // Fetch rentals from the database
  const fetchRentals = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('rentals')
        .select('*');
      
      // Filter by status based on active tab
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
      
      // Transform the data to match our Rental type
      const transformedRentals: Rental[] = (data || []).map(rental => ({
        id: rental.id,
        printerId: rental.printer_id,
        clientId: rental.client_id,
        client: rental.client,
        printer: rental.printer,
        startDate: rental.start_date,
        endDate: rental.end_date,
        status: rental.status as 'active' | 'completed' | 'cancelled' | 'upcoming',
        signatureUrl: rental.signature_url,
        agreementUrl: rental.agreement_url,
        // Mock data for inquiries and bookings
        inquiryCount: Math.floor(Math.random() * 5),
        bookingCount: Math.floor(Math.random() * 3),
        nextAvailableDate: new Date(
          new Date(rental.end_date).getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      }));
      
      setRentals(transformedRentals);
    } catch (error: any) {
      toast({
        title: "Error fetching rentals",
        description: error.message,
        variant: "destructive"
      });
      
      // Fallback to mock data if database isn't set up yet
      const mockRentals: Rental[] = [
        { 
          id: '1',
          printerId: '1',
          clientId: 'client1',
          client: 'Acme Corp',
          printer: 'HP LaserJet Pro MFP M428fdn',
          startDate: '2023-04-10',
          endDate: '2023-06-10',
          status: 'active',
          signatureUrl: null,
          agreementUrl: null,
          inquiryCount: 3,
          bookingCount: 2,
          nextAvailableDate: '2023-06-15',
        },
        { 
          id: '2',
          printerId: '2',
          clientId: 'client2',
          client: 'TechSolutions Inc',
          printer: 'Brother MFC-L8900CDW',
          startDate: '2023-03-15',
          endDate: '2023-05-15',
          status: 'active',
          signatureUrl: null,
          agreementUrl: null,
          inquiryCount: 1,
          bookingCount: 1,
          nextAvailableDate: '2023-05-20',
        },
        { 
          id: '3',
          printerId: '3',
          clientId: 'client3',
          client: 'Global Services LLC',
          printer: 'Canon imageRUNNER 1643i',
          startDate: '2023-02-01',
          endDate: '2023-04-01',
          status: 'completed',
          signatureUrl: null,
          agreementUrl: null,
          inquiryCount: 0,
          bookingCount: 0,
          nextAvailableDate: '2023-04-02',
        },
      ];
      
      setRentals(mockRentals);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch available printers that are marked for rent
  const fetchAvailablePrinters = async () => {
    try {
      const { data, error } = await supabase
        .from('printers')
        .select('*')
        .eq('status', 'available');
        
      if (error) {
        throw error;
      }
      
      // Transform the data to match our Printer type
      const printers: Printer[] = (data || []).map(printer => ({
        id: printer.id,
        make: printer.make,
        series: printer.series,
        model: printer.model,
        status: printer.status as 'available' | 'rented' | 'maintenance',
        ownedBy: printer.owned_by,
        assignedTo: printer.assigned_to,
        department: printer.department,
        location: printer.location,
        createdAt: printer.created_at,
        updatedAt: printer.updated_at,
        isForRent: true, // We're only fetching printers marked for rent
      }));
      
      setAvailablePrinters(printers);
    } catch (error: any) {
      toast({
        title: "Error fetching available printers",
        description: error.message,
        variant: "destructive"
      });
      
      // Mock data
      const mockPrinters: Printer[] = [
        {
          id: '4',
          make: 'Xerox',
          series: 'WorkCentre',
          model: '6515',
          status: 'available',
          ownedBy: 'system',
          department: 'Sales',
          location: 'Floor 1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isForRent: true,
        },
        {
          id: '5',
          make: 'Epson',
          series: 'WorkForce',
          model: 'WF-7840',
          status: 'available',
          ownedBy: 'system',
          department: 'Marketing',
          location: 'Floor 2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isForRent: true,
        },
      ];
      
      setAvailablePrinters(mockPrinters);
    }
  };

  // Search and filter functions
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const getFilteredRentals = () => {
    return rentals.filter(rental => {
      // Search term filter
      const matchesSearch = (
        (rental.client && rental.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rental.printer && rental.printer.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      return matchesSearch;
    });
  };
  
  const getFilteredPrinters = () => {
    return availablePrinters.filter(printer => {
      // Search term filter
      const matchesSearch = (
        printer.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        printer.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (printer.department && printer.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (printer.location && printer.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      // Location filter
      const matchesLocation = !filterLocation || 
        (printer.location && printer.location.includes(filterLocation));
        
      // Status filter
      const matchesStatus = !filterStatus || printer.status === filterStatus;
      
      return matchesSearch && matchesLocation && matchesStatus;
    });
  };
  
  // Action handlers
  const handleApproveBooking = async (rentalId: string) => {
    try {
      // Here you would update the status in the database
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
      // Here you would update the status in the database
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
  
  const handleStatusChange = async (printerId: string) => {
    try {
      // Here you would update the printer status in the database
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
    // This would open a form/dialog to extend the rental
    toast({
      title: "Extend rental",
      description: "This feature will be implemented soon",
    });
  };
  
  const handleViewRentalDetails = (rentalId: string) => {
    // Navigate to rental details page
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Rental Management</h1>
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
                        {rental.inquiryCount > 0 && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {rental.inquiryCount} {rental.inquiryCount === 1 ? 'inquiry' : 'inquiries'}
                          </Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-sm mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-muted-foreground">Start:</span>
                          <span className="font-medium">{new Date(rental.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">End:</span>
                          <span className="font-medium">{new Date(rental.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-muted-foreground">Next Available:</span>
                          <span className="font-medium">{rental.nextAvailableDate ? 
                            new Date(rental.nextAvailableDate).toLocaleDateString() : 'TBD'}</span>
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
            {/* Similar content to active tab but for upcoming rentals */}
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
            {/* Similar content to active tab but for completed rentals */}
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
                            <span className="font-medium">{new Date(rental.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ended:</span>
                            <span className="font-medium">{new Date(rental.endDate).toLocaleDateString()}</span>
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
      
      {/* Booking Request Dialog */}
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
                    <TableCell>{new Date(selectedRental.startDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">End Date</TableCell>
                    <TableCell>{new Date(selectedRental.endDate).toLocaleDateString()}</TableCell>
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
      
      {/* Status Change Dialog */}
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
              onClick={() => handleStatusChange(selectedRental?.printerId || '')}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
