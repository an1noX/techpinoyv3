
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Fab } from '@/components/ui/fab';
import { Search, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rental } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Rentals() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchRentals();
  }, [activeTab]);
  
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
        agreementUrl: rental.agreement_url
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
        },
      ];
      
      setRentals(mockRentals);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredRentals = rentals.filter(rental => 
    (rental.client && rental.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (rental.printer && rental.printer.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
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
          <h1 className="text-2xl font-bold">Rentals</h1>
        </div>

        <Tabs 
          defaultValue="active" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search rentals..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
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
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredRentals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No rentals found</p>
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
                  <CardDescription className="text-sm">{rental.printer}</CardDescription>
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
      </div>
    </MobileLayout>
  );
}
