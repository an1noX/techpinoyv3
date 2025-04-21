
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PrinterType, TonerType, PrinterStatusType, OwnershipType } from "@/types/types";
import { printerFormSchema, PrinterFormValues } from "../printer-form-schema";
import { toast } from "sonner";

export const usePrinterFormState = (
  printer?: PrinterType, 
  onAddToner?: (toner: TonerType) => void
) => {
  const [selectedToners, setSelectedToners] = useState<string[]>(
    printer?.toners || []
  );
  
  const [imageUrl, setImageUrl] = useState<string>(
    printer?.imageUrl || ''
  );
  
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  
  const defaultValues: Partial<PrinterFormValues> = {
    make: printer?.make || '',
    series: printer?.series || '',
    model: printer?.model || '',
    type: printer?.type || '',
    status: printer?.status as PrinterStatusType || 'available',
    description: printer?.description || '',
    category: printer?.category || '',
    price: printer?.price || 0,
    rentalPrice: printer?.rentalPrice || 0,
    quantityInStock: printer?.quantityInStock || 0,
    isRentalAvailable: printer?.isRentalAvailable || false,
    isFeatured: printer?.isFeatured || false,
    serialNumber: printer?.serialNumber || '',
    department: printer?.department || '',
    location: printer?.location || '',
    ownership: printer?.ownership as OwnershipType || 'system',
    clientId: printer?.clientId || '',
    oemToner: printer?.oemToner || '',
    notes: printer?.notes || '',
  };
  
  const form = useForm<PrinterFormValues>({
    resolver: zodResolver(printerFormSchema),
    defaultValues,
  });
  
  const formIsDirty = Object.keys(form.formState.dirtyFields).length > 0;
  
  const handleClose = () => {
    if (formIsDirty) {
      setIsAlertDialogOpen(true);
    } else {
      // Assuming onOpenChange is passed to this hook or function is called directly
      form.reset();
    }
  };
  
  const handleConfirmCancel = () => {
    setIsAlertDialogOpen(false);
    form.reset();
  };
  
  const handleTonerChange = (tonerId: string) => {
    setSelectedToners(prevToners => {
      if (prevToners.includes(tonerId)) {
        return prevToners.filter(id => id !== tonerId);
      } else {
        return [...prevToners, tonerId];
      }
    });
  };
  
  const handleAddNewToner = () => {
    if (onAddToner) {
      // Create a simplified toner object for the new toner modal to use
      const newToner: TonerType = {
        id: crypto.randomUUID(),
        name: 'New Toner',
        brand: '',
        model: '',
        color: 'black',
        page_yield: 0,
        stock: 0,
        threshold: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      };
      
      onAddToner(newToner);
    }
  };
  
  const ownershipType = form.watch('ownership');
  
  return {
    form,
    selectedToners,
    setSelectedToners,
    imageUrl,
    setImageUrl,
    ownershipType,
    isAlertDialogOpen,
    setIsAlertDialogOpen,
    handleClose,
    handleConfirmCancel,
    handleTonerChange,
    handleAddNewToner
  };
};
