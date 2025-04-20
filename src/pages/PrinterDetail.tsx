import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  ChevronLeft, 
  Edit, 
  Share2, 
  AlertTriangle, 
  Info, 
  Trash2,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, PrinterStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface RentalOptions {
  isForRent: boolean;
  rentalRate: number;
  rateUnit: 'hourly' | 'daily' | 'weekly' | 'monthly';
  minimumDuration: number;
  durationUnit: 'hours' | 'days' | 'weeks' | 'months';
  securityDeposit: number;
  terms: string;
  cancellationPolicy: string;
  availability?: Date[];
}

const getStatusColor = (status: PrinterStatus) => {
  switch (status) {
    case 'available': return 'bg-status-available text-white';
    case 'rented': return 'bg-status-rented text-black';
    case 'maintenance': return 'bg-status-maintenance text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusEmoji = (status: PrinterStatus) => {
  switch (status) {
    case 'available': return '🟢';
    case 'rented': return '🟡';
    case 'maintenance': return '🔴';
    default: return '⚪';
  }
};

export default function PrinterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [printer, setPrinter] = useState<Printer | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmToggleDialogOpen, setConfirmToggleDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isForRent, setIsForRent] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [rentalOptions, setRentalOptions] = useState<RentalOptions>({
    isForRent: false,
    rentalRate: 0,
    rateUnit: 'daily',
    minimumDuration: 1,
    durationUnit: 'days',
    securityDeposit: 0,
    terms: '',
    cancellationPolicy: 'Standard 24-hour cancellation policy applies. Cancellations made less than 24 hours before rental start time are subject to a 50% fee.',
    availability: [],
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  useEffect(() => {
    if (id) {
      fetchPrinter(id);
      fetchRentalOptions(id);
    }
  }, [id]);
  
  const fetchPrinter = async (printerId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('printers')
        .select('*')
        .eq('id', printerId)
        .single();
      
      if (error) {
        throw error;
      }
      
      setPrinter(data as Printer);
      
    } catch (error: any) {
      toast({
        title: "Error fetching printer details",
        description: error.message,
        variant: "destructive"
      });
      
      const mockPrinters: Record<string, Printer> = {
        '1': { 
          id: '1', 
          make: 'HP', 
          series: 'LaserJet', 
          model: 'Pro MFP M428fdn',
          status: 'available',
          owned_by: 'system',
          department: 'Marketing',
          location: 'Floor 2, Room 201',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        '2': { 
          id: '2', 
          make: 'Brother', 
          series: 'MFC', 
          model: 'L8900CDW',
          status: 'rented',
          owned_by: 'system',
          assigned_to: 'Acme Corp',
          department: 'Sales',
          location: 'Floor 1, Room 105',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        '3': { 
          id: '3', 
          make: 'Canon', 
          series: 'imageRUNNER', 
          model: '1643i',
          status: 'maintenance',
          owned_by: 'client',
          assigned_to: 'TechSolutions Inc',
          department: 'IT',
          location: 'Floor 3, Room 302',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
      
      if (printerId in mockPrinters) {
        setPrinter(mockPrinters[printerId]);
      } else {
        setPrinter(null);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRentalOptions = async (printerId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockRentalOptions: RentalOptions = {
        isForRent: true,
        rentalRate: 25,
        rateUnit: 'daily',
        minimumDuration: 3,
        durationUnit: 'days',
        securityDeposit: 200,
        terms: 'Printer must be returned in the same condition. Any damage will be charged from the security deposit.',
        cancellationPolicy: 'Free cancellation up to 48 hours before rental start time.',
        availability: [
          new Date(2025, 3, 20),
          new Date(2025, 3, 21),
          new Date(2025, 3, 22),
        ],
      };
      
      setRentalOptions(mockRentalOptions);
      setIsForRent(mockRentalOptions.isForRent);
    } catch (error: any) {
      toast({
        title: "Error fetching rental options",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleChangeStatus = async (status: PrinterStatus) => {
    if (!printer) return;
    
    try {
      const { error } = await supabase
        .from('printers')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', printer.id);
      
      if (error) {
        throw error;
      }
      
      setPrinter({
        ...printer,
        status,
        updated_at: new Date().toISOString()
      });
      
      toast({
        title: "Status updated",
        description: `Printer status changed to ${status}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleDeletePrinter = async () => {
    if (!printer) return;
    
    try {
      const { error } = await supabase
        .from('printers')
        .delete()
        .eq('id', printer.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Printer deleted",
        description: "The printer has been removed from the inventory",
      });
      
      navigate('/printers');
    } catch (error: any) {
      toast({
        title: "Error deleting printer",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  const handleToggleRental = (checked: boolean) => {
    if (!checked && hasUnsavedChanges) {
      setConfirmToggleDialogOpen(true);
    } else {
      saveRentalToggleState(checked);
    }
  };
  
  const saveRentalToggleState = async (state: boolean) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('printers')
        .update({ 
          is_for_rent: state,
          updated_at: new Date().toISOString() 
        })
        .eq('id', printer!.id);
      
      if (error) {
        throw error;
      }

      if (printer) {
        setPrinter({
          ...printer,
          is_for_rent: state,
          updated_at: new Date().toISOString()
        });
      }
      
      setIsForRent(state);
      
      if (!state && activeTab === 'rentOptions') {
        setActiveTab('details');
      }
      
      toast({
        title: state ? "Rental enabled" : "Rental disabled",
        description: state 
          ? "This printer is now available for rent." 
          : "This printer is no longer available for rent.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating rental status",
        description: error.message,
        variant: "destructive"
      });
      setIsForRent(!state);
    } finally {
      setLoading(false);
      setConfirmToggleDialogOpen(false);
    }
  };

  useEffect(() => {
    if (printer) {
      setIsForRent(printer.is_for_rent || false);
    }
  }, [printer]);

  const handleRentalOptionChange = (
    field: keyof RentalOptions, 
    value: string | number | boolean | Date[] | undefined
  ) => {
    setRentalOptions(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };
  
  const handleSaveRentalOptions = async () => {
    try {
      setLoading(true);
      
      if (rentalOptions.rentalRate <= 0) {
        throw new Error("Rental rate must be greater than 0");
      }
      
      if (rentalOptions.minimumDuration <= 0) {
        throw new Error("Minimum duration must be greater than 0");
      }
      
      toast({
        title: "Rental options saved",
        description: "The rental options have been updated successfully.",
      });
      
      setHasUnsavedChanges(false);
    } catch (error: any) {
      toast({
        title: "Error saving rental options",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddAvailabilityDate = (date: Date | undefined) => {
    if (date) {
      setRentalOptions(prev => ({
        ...prev,
        availability: [...(prev.availability || []), date]
      }));
      setSelectedDate(undefined);
      setHasUnsavedChanges(true);
    }
  };
  
  const handleRemoveAvailabilityDate = (dateToRemove: Date) => {
    setRentalOptions(prev => ({
      ...prev,
      availability: (prev.availability || []).filter(date => 
        date.getTime() !== dateToRemove.getTime()
      )
    }));
    setHasUnsavedChanges(true);
  };
  
  if (loading) {
    return (
      <MobileLayout>
        <div className="container px-4 py-4 flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MobileLayout>
    );
  }
  
  if (!printer) {
    return (
      <MobileLayout>
        <div className="container px-4 py-4 text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-status-maintenance mb-4" />
          <h1 className="text-2xl font-bold">Printer Not Found</h1>
          <p className="text-muted-foreground mb-6">The requested printer could not be found.</p>
          <Button onClick={() => navigate('/printers')}>
            Back to Printers
          </Button>
        </div>
      </MobileLayout>
    );
  }
  
  return (
    <MobileLayout>
      <div className="container px-4 py-4">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 flex items-center"
          onClick={() => navigate('/printers')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{printer.make} {printer.model}</h1>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={() => {
              toast({
                title: "Share feature",
                description: "This feature will be implemented soon",
              });
            }}>
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate(`/printers/${printer.id}/edit`)}>
              <Edit className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
          <Badge className={`${getStatusColor(printer.status)}`}>
            {getStatusEmoji(printer.status)} {printer.status}
          </Badge>
          
          <div className="flex items-center ml-0 sm:ml-4">
            <Switch 
              id="rental-toggle"
              checked={isForRent} 
              onCheckedChange={handleToggleRental}
              className="mr-2"
            />
            <Label htmlFor="rental-toggle" className="text-sm font-medium">
              For Rent
            </Label>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="toners">Toners</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="rentOptions" disabled={!isForRent}>
              Rent Options
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Printer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center">
                    <Info className="h-5 w-5 mr-2 text-muted-foreground" />
                    <h3 className="font-medium">General Information</h3>
                  </div>
                  <Separator className="my-2" />
                  <div className="pl-7 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Make</span>
                      <span className="text-sm font-medium">{printer.make}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Series</span>
                      <span className="text-sm font-medium">{printer.series}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Model</span>
                      <span className="text-sm font-medium">{printer.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Owner</span>
                      <span className="text-sm font-medium capitalize">{printer.owned_by}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-muted-foreground">
                      <path d="M20 10V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
                      <path d="M20 14v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" />
                      <path d="M12 12H4v4a4 4 0 0 0 4 4h12" />
                      <path d="M2 12h20" />
                    </svg>
                    <h3 className="font-medium">Location</h3>
                  </div>
                  <Separator className="my-2" />
                  <div className="pl-7 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Department</span>
                      <span className="text-sm font-medium">{printer.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Location</span>
                      <span className="text-sm font-medium">{printer.location}</span>
                    </div>
                    {printer.assigned_to && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Assigned To</span>
                        <span className="text-sm font-medium">{printer.assigned_to}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <div className="flex-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full">Change Status</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Printer Status</DialogTitle>
                          <DialogDescription>
                            Select a new status for this printer
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-4 py-4">
                          <Button
                            className={`justify-start ${printer.status === 'available' ? 'border-2 border-primary' : ''}`}
                            variant={printer.status === 'available' ? 'default' : 'outline'}
                            onClick={() => handleChangeStatus('available')}
                          >
                            <span className="mr-2">🟢</span> Available
                          </Button>
                          <Button
                            className={`justify-start ${printer.status === 'rented' ? 'border-2 border-primary' : ''}`}
                            variant={printer.status === 'rented' ? 'default' : 'outline'}
                            onClick={() => handleChangeStatus('rented')}
                          >
                            <span className="mr-2">🟡</span> Rented
                          </Button>
                          <Button
                            className={`justify-start ${printer.status === 'maintenance' ? 'border-2 border-primary' : ''}`}
                            variant={printer.status === 'maintenance' ? 'default' : 'outline'}
                            onClick={() => handleChangeStatus('maintenance')}
                          >
                            <span className="mr-2">🔴</span> Maintenance
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {printer.status === 'available' && (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        toast({
                          title: "Rent feature",
                          description: "This feature will be implemented soon",
                        });
                      }}
                    >
                      Rent Out
                    </Button>
                  )}
                </div>
                
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Printer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this printer? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDeletePrinter}>
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="toners" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Compatible Toners</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Compatible toner cartridges for this printer model.
                </p>
                
                <div className="space-y-4">
                  {['Black', 'Cyan', 'Magenta', 'Yellow'].map((color) => (
                    <div key={color} className="border rounded-md p-3">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{color}</span>
                        <Badge variant="outline">In Stock: 12</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{printer.make} {color.charAt(0)}{color === 'Black' ? 'K' : color.charAt(1)}-120 Toner</p>
                      <p className="text-xs text-muted-foreground">
                        Page Yield: 2,000 pages
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Service History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-border ml-4"></div>
                  <div className="space-y-6 pl-10 relative">
                    {[
                      { date: '2023-04-01', action: 'Regular Maintenance', note: 'Cleaned printheads and replaced paper tray' },
                      { date: '2023-02-15', action: 'Toner Replacement', note: 'Replaced Cyan toner cartridge' },
                      { date: '2023-01-10', action: 'Initial Setup', note: 'Printer installed and configured' },
                    ].map((event, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-10 mt-1.5 w-4 h-4 rounded-full bg-primary"></div>
                        <h4 className="font-medium mb-1">{event.action}</h4>
                        <p className="text-sm text-muted-foreground mb-1">{new Date(event.date).toLocaleDateString()}</p>
                        <p className="text-sm">{event.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rentOptions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Rental Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rentalRate">Rental Rate</Label>
                    <div className="flex">
                      <Input 
                        id="rentalRate"
                        type="number" 
                        value={rentalOptions.rentalRate} 
                        onChange={(e) => handleRentalOptionChange('rentalRate', parseFloat(e.target.value) || 0)}
                        className="rounded-r-none"
                      />
                      <Select 
                        value={rentalOptions.rateUnit} 
                        onValueChange={(value) => handleRentalOptionChange('rateUnit', value as any)}
                      >
                        <SelectTrigger className="w-[110px] rounded-l-none">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Per Hour</SelectItem>
                          <SelectItem value="daily">Per Day</SelectItem>
                          <SelectItem value="weekly">Per Week</SelectItem>
                          <SelectItem value="monthly">Per Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="securityDeposit">Security Deposit</Label>
                    <Input 
                      id="securityDeposit"
                      type="number" 
                      value={rentalOptions.securityDeposit} 
                      onChange={(e) => handleRentalOptionChange('securityDeposit', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimumDuration">Minimum Duration</Label>
                    <div className="flex">
                      <Input 
                        id="minimumDuration"
                        type="number" 
                        value={rentalOptions.minimumDuration} 
                        onChange={(e) => handleRentalOptionChange('minimumDuration', parseInt(e.target.value) || 1)}
                        className="rounded-r-none"
                      />
                      <Select 
                        value={rentalOptions.durationUnit} 
                        onValueChange={(value) => handleRentalOptionChange('durationUnit', value as any)}
                      >
                        <SelectTrigger className="w-[110px] rounded-l-none">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <textarea 
                    id="terms"
                    className="w-full p-2 border rounded-md h-24"
                    value={rentalOptions.terms} 
                    onChange={(e) => handleRentalOptionChange('terms', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                  <textarea 
                    id="cancellationPolicy"
                    className="w-full p-2 border rounded-md h-24"
                    value={rentalOptions.cancellationPolicy} 
                    onChange={(e) => handleRentalOptionChange('cancellationPolicy', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="block mb-2">Availability</Label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="border rounded-md p-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'PPP') : <span>Add available date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                          <div className="p-2 border-t">
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAddAvailabilityDate(selectedDate)}
                              disabled={!selectedDate}
                            >
                              Add Date
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="flex-1 border rounded-md p-4">
                      <p className="text-sm font-medium mb-2">Available Dates:</p>
                      {rentalOptions.availability && rentalOptions.availability.length > 0 ? (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                          {rentalOptions.availability.map((date, i) => (
                            <div key={i} className="flex justify-between items-center text-sm border-b pb-1">
                              <span>{format(date, 'PPP')}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAvailabilityDate(date)}
                              >
                                &times;
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No available dates set</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      fetchRentalOptions(id!);
                      setHasUnsavedChanges(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveRentalOptions}
                    disabled={!hasUnsavedChanges}
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={confirmToggleDialogOpen} onOpenChange={setConfirmToggleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Rental</DialogTitle>
            <DialogDescription>
              Disabling rental will hide Rent Options. Unsaved changes will be lost. Do you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmToggleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => saveRentalToggleState(false)}
            >
              Disable Rental
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this printer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePrinter}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
