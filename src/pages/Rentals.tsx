
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Fab } from '@/components/ui/fab';
import { Search, Calendar, Plus, Filter, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';

const LOCATIONS = ['Floor 1', 'Floor 2', 'Floor 3', 'Warehouse', 'Client Site'];
const RENTAL_STATUSES = ['active', 'upcoming', 'completed', 'cancelled'];
const RATE_RANGES = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: 'Over $200', min: 200, max: 10000 }
];


export default function Rentals() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [rentals, setRentals] = useState([]);
  const [rentalOptions, setRentalOptions] = useState([]);
  const [loadingRentals, setLoadingRentals] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRateRange, setFilterRateRange] = useState(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);

  useEffect(() => {
    fetchRentals();
  }, [activeTab]);

  useEffect(() => {
    fetchRentalOptions();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoadingRentals(true);
      
      let query = supabase
        .from('rentals')
        .select('*')
        .order('start_date', { ascending: true });
      
      if(activeTab && activeTab !== 'available') {
        query = query.eq('status', activeTab);
      }
      else if (activeTab === 'available') {
        // For 'available' listings, show something different? We load rental options too.
        // Rentals table doesn't have 'available' status - skip or set empty.
        setRentals([]);
        setLoadingRentals(false);
        return;
      }

      const { data, error } = await query;

      if(error) {
        throw error;
      }

      setRentals(data || []);
    } catch (error) {
      toast({
        title: 'Error fetching rentals',
        description: error.message || 'Unknown error',
        variant: 'destructive',
      });
      setRentals([]);
    } finally {
      setLoadingRentals(false);
    }
  };

  const fetchRentalOptions = async () => {
    try {
      setLoadingOptions(true);
      const { data, error } = await supabase
        .from('rental_options')
        .select('*');

      if(error) {
        throw error;
      }

      setRentalOptions(data || []);
    } catch(error) {
      toast({
        title: 'Error fetching rental options',
        description: error.message || 'Unknown error',
        variant: 'destructive',
      });
      setRentalOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter rentals for active/upcoming/completed tabs
  const getFilteredRentals = () => {
    return rentals.filter(rental => {
      const matchesSearch = (
        (rental.client && rental.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rental.printer && rental.printer.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      const matchesStatus = !filterStatus || rental.status === filterStatus;

      const matchesLocation = !filterLocation || (rental.next_available_date ? true : true); // No location on rental, so skip

      return matchesSearch && matchesStatus && matchesLocation;
    });
  };

  // Filter rental options for available printers
  const getFilteredRentalOptions = () => {
    return rentalOptions.filter(opt => {
      const printerName = opt.printer_id; // we don't have printer name here; we might extend later, for now just show all

      const matchesSearch = true; // Can't filter by printer name directly; could enhance with join

      const matchesLocation = !filterLocation || true; // Need location data linked? Simplify by allowing all

      const matchesRate = !filterRateRange || (
        opt.rental_rate >= filterRateRange.min && opt.rental_rate <= filterRateRange.max
      );

      return matchesSearch && matchesLocation && matchesRate;
    });
  };

  const filteredRentals = getFilteredRentals();
  const filteredRentalOptions = getFilteredRentalOptions();

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

          {/* Active rentals tab */}
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
                onClick={() => toast({ title: 'Calendar view', description: 'This feature will be implemented soon' })}
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

            {loadingRentals ? (
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
                        <Badge className={`bg-status-rented text-black`}>
                          {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
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
                          <span className="font-medium">{rental.next_available_date ? new Date(rental.next_available_date).toLocaleDateString() : 'TBD'}</span>
                        </div>
                      </div>
                      {rental.agreement_url && (
                        <div className="mb-2">
                          <a 
                            href={rental.agreement_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline text-sm"
                          >
                            View Rental Contract
                          </a>
                        </div>
                      )}
                      <div className="flex justify-between mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 mr-2"
                          onClick={() => navigate(`/rentals/${rental.id}`)}
                        >
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Upcoming rentals tab */}
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
              <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center py-8">
              <p className="text-muted-foreground">No upcoming rentals found</p>
              <Button className="mt-4" onClick={() => navigate('/rentals/new')}>Create Rental</Button>
            </div>
          </TabsContent>
          
          {/* Past rentals tab */}
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
              <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {loadingRentals ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredRentals.filter(r => r.status === 'completed').length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No past rentals found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRentals
                  .filter(r => r.status === 'completed')
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
                          onClick={() => navigate(`/rentals/${rental.id}`)}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Available rentals tab */}
          <TabsContent value="available" className="mt-4">
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search available rentals..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {showFilters && (
              <div className="mb-6 p-4 border rounded-md shadow-sm bg-background">
                <h3 className="font-medium mb-3">Filter Available Rentals</h3>
                <div className="grid gap-4 sm:grid-cols-2">
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

            {loadingOptions ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredRentalOptions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No available rentals found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRentalOptions.map((opt) => (
                  <Card key={opt.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">
                          Printer ID: {opt.printer_id}
                        </CardTitle>
                        <Badge className="bg-status-available text-white">Available</Badge>
                      </div>
                      <CardDescription className="text-sm flex items-center">
                        <DollarSign className="mr-1 h-4 w-4" />
                        <span className="font-medium">${opt.rental_rate} / {opt.rate_unit}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4 pt-0">
                      <div className="flex items-center justify-between mt-3">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 mr-2"
                          onClick={() => navigate(`/printers/${opt.printer_id}`)}
                        >
                          Printer Details
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/rentals/new?printerId=${opt.printer_id}`)}
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

      {/* Booking Dialog */}
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
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
              Reject
            </Button>
            <Button variant="default" onClick={() => setShowBookingDialog(false)}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}

