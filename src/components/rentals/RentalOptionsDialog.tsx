
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Printer } from "@/types/printers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RentalOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printer: Printer;
  onSuccess?: () => void;
}

export function RentalOptionsDialog({ open, onOpenChange, printer, onSuccess }: RentalOptionsDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rentalOption, setRentalOption] = useState<any>({
    printer_id: printer?.id,
    rental_rate: 0,
    rate_unit: 'day',
    minimum_duration: 1,
    duration_unit: 'day',
    security_deposit: 0,
    terms: '',
    cancellation_policy: '',
  });

  useEffect(() => {
    if (open && printer?.id) {
      fetchRentalOption();
    }
  }, [open, printer]);

  const fetchRentalOption = async () => {
    if (!printer?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rental_options')
        .select('*')
        .eq('printer_id', printer.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setRentalOption(data);
      } else {
        // Initialize with default values if no record exists
        setRentalOption({
          printer_id: printer.id,
          rental_rate: 0,
          rate_unit: 'day',
          minimum_duration: 1,
          duration_unit: 'day',
          security_deposit: 0,
          terms: '',
          cancellation_policy: '',
        });
      }
    } catch (error: any) {
      toast({
        title: "Error fetching rental options",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRentalOption(prev => ({
      ...prev,
      [name]: name === 'rental_rate' || name === 'security_deposit' || name === 'minimum_duration' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setRentalOption(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if record already exists
      const { data: existingData, error: checkError } = await supabase
        .from('rental_options')
        .select('id')
        .eq('printer_id', printer.id)
        .maybeSingle();

      if (checkError) throw checkError;

      let result;
      
      if (existingData?.id) {
        // Update existing record
        const { data, error } = await supabase
          .from('rental_options')
          .update(rentalOption)
          .eq('id', existingData.id)
          .select();
          
        if (error) throw error;
        result = data;
        
        toast({
          title: "Rental options updated",
          description: `Rental options for ${printer.make} ${printer.model} have been updated.`
        });
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('rental_options')
          .insert(rentalOption)
          .select();
          
        if (error) throw error;
        result = data;
        
        toast({
          title: "Rental options created",
          description: `Rental options for ${printer.make} ${printer.model} have been created.`
        });
      }

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Error saving rental options",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rental Options for {printer?.make} {printer?.model}</DialogTitle>
          <DialogDescription>
            Set the rental options for this printer. These options will be visible to customers when they browse available rentals.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rental_rate">Rental Rate</Label>
              <div className="flex items-center">
                <span className="mr-2">$</span>
                <Input
                  id="rental_rate"
                  name="rental_rate"
                  type="number"
                  value={rentalOption.rental_rate}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate_unit">Rate Unit</Label>
              <Select 
                value={rentalOption.rate_unit} 
                onValueChange={(value) => handleSelectChange('rate_unit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Per Hour</SelectItem>
                  <SelectItem value="day">Per Day</SelectItem>
                  <SelectItem value="week">Per Week</SelectItem>
                  <SelectItem value="month">Per Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimum_duration">Minimum Duration</Label>
              <Input
                id="minimum_duration"
                name="minimum_duration"
                type="number"
                value={rentalOption.minimum_duration}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_unit">Duration Unit</Label>
              <Select 
                value={rentalOption.duration_unit} 
                onValueChange={(value) => handleSelectChange('duration_unit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Hours</SelectItem>
                  <SelectItem value="day">Days</SelectItem>
                  <SelectItem value="week">Weeks</SelectItem>
                  <SelectItem value="month">Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="security_deposit">Security Deposit ($)</Label>
            <Input
              id="security_deposit"
              name="security_deposit"
              type="number"
              value={rentalOption.security_deposit}
              onChange={handleInputChange}
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Input
              id="terms"
              name="terms"
              value={rentalOption.terms || ''}
              onChange={handleInputChange}
              placeholder="E.g., Responsible for any damage, return in good condition..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
            <Input
              id="cancellation_policy"
              name="cancellation_policy"
              value={rentalOption.cancellation_policy || ''}
              onChange={handleInputChange}
              placeholder="E.g., 24 hours notice required for cancellation..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                  Saving...
                </>
              ) : (
                'Save Options'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
