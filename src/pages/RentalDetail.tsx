import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, FileText, Signature, Clock, ArrowLeft, Edit, Printer, Building } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rental } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function RentalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchRentalDetails();
  }, [id]);
  
  const fetchRentalDetails = async () => {
    try {
      setLoading(true);
      
      if (!id) {
        toast({
          title: "Error",
          description: "Rental ID is missing",
          variant: "destructive"
        });
        navigate('/rentals');
        return;
      }
      
      const { data, error } = await supabase
        .from('rentals')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        toast({
          title: "Rental not found",
          description: "The rental you're looking for doesn't exist",
          variant: "destructive"
        });
        navigate('/rentals');
        return;
      }
      
      setRental(data as Rental);
    } catch (error: any) {
      toast({
        title: "Error loading rental",
        description: error.message,
        variant: "destructive"
      });
      
      // Mock data for development
      const mockRental: Rental = {
        id: id || '1',
        printer_id: '1',
        client_id: 'client1',
        client: 'Acme Corp',
        printer: 'HP LaserJet Pro MFP M428fdn',
        start_date: '2023-04-10',
        end_date: '2023-06-10',
        status: 'active',
        signature_url: null,
        agreement_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
        notes: null
      };
      
      setRental(mockRental);
    } finally {
      setLoading(false);
    }
  };
  
  const handleExtendRental = () => {
    toast({
      title: "Extend rental",
      description: "This feature will be implemented soon",
    });
  };
  
  const handleCancelRental = () => {
    toast({
      title: "Cancel rental",
      description: "This feature will be implemented soon",
    });
  };
  
  const handleViewAgreement = () => {
    toast({
      title: "View agreement",
      description: "This feature will be implemented soon",
    });
  };
  
  const handleEditRental = () => {
    toast({
      title: "Edit rental",
      description: "This feature will be implemented soon",
    });
  };
  
  if (loading) {
    return (
      <MobileLayout>
        <div className="container px-4 py-8">
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </MobileLayout>
    );
  }
  
  if (!rental) {
    return (
      <MobileLayout>
        <div className="container px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Rental not found</p>
            <Button className="mt-4" onClick={() => navigate('/rentals')}>
              Back to Rentals
            </Button>
          </div>
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
          className="mb-4 pl-0" 
          onClick={() => navigate('/rentals')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Rentals
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{rental.client}</h1>
            <p className="text-muted-foreground">{rental.printer}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Badge className={
              rental.status === 'active' ? 'bg-status-rented text-black' :
              rental.status === 'completed' ? 'bg-gray-500 text-white' :
              rental.status === 'cancelled' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }>
              {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
            </Badge>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Rental Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                <div className="flex justify-between w-full">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span>{new Date(rental.start_date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                <div className="flex justify-between w-full">
                  <span className="text-muted-foreground">End Date:</span>
                  <span>{new Date(rental.end_date || '').toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <div className="flex justify-between w-full">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>
                    {Math.ceil(
                      (new Date(rental.end_date || '').getTime() - new Date(rental.start_date).getTime()) / 
                      (1000 * 60 * 60 * 24)
                    )} days
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="information" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="information">Information</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="information" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div className="flex justify-between w-full">
                      <span className="text-muted-foreground">Company:</span>
                      <span>{rental.client}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Printer className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div className="flex justify-between w-full">
                      <span className="text-muted-foreground">Printer:</span>
                      <span>{rental.printer}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => navigate(`/printers/${rental.printer_id}`)}
                >
                  View Printer Details
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div className="flex justify-between w-full">
                      <span>Rental Agreement</span>
                      <Button variant="ghost" size="sm" onClick={() => {}}>
                        View
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Signature className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div className="flex justify-between w-full">
                      <span>Signature</span>
                      <Button variant="ghost" size="sm" onClick={() => {}}>
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Rental History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div className="flex items-center justify-between w-full">
                      <span>Created</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(rental.start_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {rental.status === 'completed' && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div className="flex items-center justify-between w-full">
                        <span>Completed</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(rental.end_date || '').toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {rental.status === 'active' && (
            <>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {}}
              >
                Extend Rental
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {}}
              >
                Cancel Rental
              </Button>
            </>
          )}
          {rental.status === 'upcoming' && (
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {}}
            >
              Cancel Booking
            </Button>
          )}
          <Button 
            variant="default" 
            className="flex-1"
            onClick={() => {}}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
