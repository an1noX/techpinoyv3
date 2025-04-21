import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PrinterType, TonerType, PrinterStatus, OwnershipType } from "@/types/types"; 
import { printerFormSchema, type PrinterFormValues } from "../printer-form-schema";

export function usePrinterFormState(printer?: PrinterType, onAddToner?: (toner: TonerType) => void) {
  const [selectedToners, setSelectedToners] = useState<string[]>(printer?.toners || []);
  const [imageUrl, setImageUrl] = useState<string>(printer?.imageUrl || "");
  const [ownershipType, setOwnershipType] = useState<OwnershipType>(printer?.ownership || "system");
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState<boolean>(false);

  const form = useForm<PrinterFormValues>({
    resolver: zodResolver(printerFormSchema),
    defaultValues: {
      make: printer?.make || "",
      series: printer?.series || "",
      model: printer?.model || "",
      type: printer?.type || "",
      status: printer?.status || "available",
      description: printer?.description || "",
      category: printer?.category || "",
      price: printer?.price || 0,
      rentalPrice: printer?.rentalPrice || 0,
      quantityInStock: printer?.quantityInStock || 0,
      isRentalAvailable: printer?.isRentalAvailable || false,
      isFeatured: printer?.isFeatured || false,
      serialNumber: printer?.serialNumber || "",
      department: printer?.department || "",
      location: printer?.location || "",
      ownership: printer?.ownership || "system",
      clientId: printer?.clientId || "",
      oemToner: printer?.oemToner || "",
      notes: printer?.notes || "",
    },
  });

  const handleClose = () => {
    if (form.isDirty) {
      setIsAlertDialogOpen(true);
    } else {
      onClose();
    }
  };

  const handleConfirmCancel = () => {
    form.reset();
    setIsAlertDialogOpen(false);
    onClose();
  };

  const handleTonerChange = (tonerId: string) => {
    setSelectedToners((prevSelectedToners) => {
      if (prevSelectedToners.includes(tonerId)) {
        return prevSelectedToners.filter((id) => id !== tonerId);
      } else {
        return [...prevSelectedToners, tonerId];
      }
    });
  };

  // When creating a new toner, update to include all required fields
  const handleAddNewToner = () => {
    if (onAddToner) {
      const newToner: TonerType = {
        id: crypto.randomUUID(),
        name: "New Toner",
        brand: "Generic",
        model: "Model",
        color: "black",
        page_yield: 1000,
        stock: 0,
        threshold: 5,
        is_active: true
      };
      onAddToner(newToner);
    }
  };

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
}
