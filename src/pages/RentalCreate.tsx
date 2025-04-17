
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Printer } from '@/types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Form schema
const formSchema = z.object({
  clientName: z.string().min(2, {
    message: "Client name must be at least 2 characters.",
  }),
  clientEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  clientPhone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  printerId: z.string().min(1, {
    message: "Please select a printer.",
  }),
  startDate: z.date({
    required_error: "Please select a start date.",
  }),
  endDate: z.date({
    required_error: "Please select an end date.",
  }).refine(date => date > new Date(), {
    message: "End date must be in the future.",
  }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RentalCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Get the printer ID from URL params if it exists
  const initialPrinterId = searchParams.get('printerId') || '';
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      printerId: initialPrinterId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      notes: '',
    },
  });
  
  useEffect(() => {
    fetchPrinters();
  }, []);
  
  const fetchPrinters = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('printers')
        .select('*')
        .eq('status', 'available');
      
      if (error) {
        throw error;
      }
      
      // Transform to match our Printer type
      const transformedPrinters: Printer[] = (data || []).map(printer => ({
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
        isForRent: true,
      }));
      
      setPrinters(transformedPrinters);
    } catch (error: any) {
      toast({
        title: "Error loading printers",
        description: error.message,
        variant: "destructive"
      });
      
      // Mock data for development
      const mockPrinters: Printer[] = [
        {
          id: '1',
          make: 'HP',
          series: 'LaserJet',
          model: 'Pro MFP M428fdn',
          status: 'available',
          ownedBy: 'system',
          department: 'Marketing',
          location: 'Floor 2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isForRent: true,
        },
        {
          id: '2',
          make: 'Brother',
          series: 'MFC',
          model: 'L8900CDW',
          status: 'available',
          ownedBy: 'system',
          department: 'Sales',
          location: 'Floor 1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isForRent: true,
        },
      ];
      
      setPrinters(mockPrinters);
    } finally {
      setLoading(false);
    }
  };
  
  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);
      
      // Find the selected printer
      const selectedPrinter = printers.find(p => p.id === data.printerId);
      
      if (!selectedPrinter) {
        toast({
          title: "Error",
          description: "Selected printer not found",
          variant: "destructive"
        });
        return;
      }
      
      // Format dates
      const formattedStartDate = format(data.startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(data.endDate, 'yyyy-MM-dd');
      
      // Create the rental in Supabase
      const { data: rentalData, error } = await supabase
        .from('rentals')
        .insert({
          client: data.clientName,
          printer: `${selectedPrinter.make} ${selectedPrinter.model}`,
          printer_id: selectedPrinter.id,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          status: 'upcoming',
          // Additional fields would be added here
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      // Success!
      toast({
        title: "Rental created",
        description: "The rental has been created successfully",
      });
      
      // Navigate to the rentals page
      navigate('/rentals');
    } catch (error: any) {
      toast({
        title: "Error creating rental",
        description: error.message,
        variant: "destructive"
      });
      
      // For development, still navigate back as if it was successful
      toast({
        title: "Development mode",
        description: "Rental would have been created in production",
      });
      navigate('/rentals');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <MobileLayout>
      <div className="container px-4 py-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4 pl-0" 
          onClick={() => navigate('/rentals')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Rentals
        </Button>
        
        <h1 className="text-2xl font-bold mb-6">Create New Rental</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter client name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="clientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter client email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="clientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter client phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Rental Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="printerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Printer</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a printer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loading ? (
                            <SelectItem value="loading" disabled>Loading printers...</SelectItem>
                          ) : printers.length === 0 ? (
                            <SelectItem value="none" disabled>No available printers</SelectItem>
                          ) : (
                            printers.map(printer => (
                              <SelectItem key={printer.id} value={printer.id}>
                                {printer.make} {printer.model}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => {
                                const startDate = form.getValues("startDate");
                                return date < startDate;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any special requirements or notes"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/rentals')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Rental'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </MobileLayout>
  );
}
