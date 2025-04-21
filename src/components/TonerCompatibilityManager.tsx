/**
 * TonerCompatibilityManager
 * 
 * This component manages the relationship between printers and their compatible OEM toner models.
 * It uses the reference data from the 'wiki_toners' table and maintains relationships in 'printer_toner_compatibility'.
 * 
 * Note: This is NOT related to product inventory management. This component only handles 
 * the reference data that indicates which toner models are compatible with which printers.
 * For actual product inventory management, see the TonerProducts page.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { WikiToner } from '@/types/types';

interface TonerCompatibilityManagerProps {
  printerId: string;
}

export function TonerCompatibilityManager({ printerId }: TonerCompatibilityManagerProps) {
  const [loading, setLoading] = useState(true);
  const [compatibleToners, setCompatibleToners] = useState<WikiToner[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompatibleToners();
  }, [printerId]);

  const fetchCompatibleToners = async () => {
    try {
      setLoading(true);

      // First get the printer-toner compatibility relationships
      const { data: relationships, error: relError } = await supabase
        .from('printer_toner_compatibility')
        .select('toner_id')
        .eq('printer_wiki_id', printerId);

      if (relError) throw relError;

      if (relationships && relationships.length > 0) {
        // Get all compatible toners
        const tonerIds = relationships.map(rel => rel.toner_id);
        const { data: toners, error: tonersError } = await supabase
          .from('wiki_toners')
          .select('*')
          .in('id', tonerIds);

        if (tonersError) throw tonersError;
        setCompatibleToners((toners || []) as WikiToner[]);
      }

    } catch (error: any) {
      console.error('Error fetching compatible toners:', error);
      toast({
        title: 'Error loading toners',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addCompatibility = async (tonerId: string) => {
    try {
      const { error } = await supabase
        .from('printer_toner_compatibility')
        .insert({
          printer_wiki_id: printerId,
          toner_id: tonerId
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Toner compatibility added'
      });

      // Refresh the list
      fetchCompatibleToners();

    } catch (error: any) {
      toast({
        title: 'Error adding compatibility',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const removeCompatibility = async (tonerId: string) => {
    try {
      const { error } = await supabase
        .from('printer_toner_compatibility')
        .delete()
        .match({
          printer_wiki_id: printerId,
          toner_id: tonerId
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Toner compatibility removed'
      });

      // Refresh the list
      fetchCompatibleToners();

    } catch (error: any) {
      toast({
        title: 'Error removing compatibility',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compatible Toners</CardTitle>
      </CardHeader>
      <CardContent>
        {compatibleToners.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No compatible toners found
          </p>
        ) : (
          <div className="space-y-2">
            {compatibleToners.map((toner) => (
              <div key={toner.id} className="flex justify-between items-center p-2 bg-muted rounded">
                <div>
                  <p className="font-medium">{toner.brand} {toner.model}</p>
                  <p className="text-sm text-muted-foreground">Color: {toner.color}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeCompatibility(toner.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
