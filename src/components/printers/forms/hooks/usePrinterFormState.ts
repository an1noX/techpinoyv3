
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { PrinterType, TonerType } from "@/types/types";
import { PrinterOwnershipType } from "@/types/enums";
import { toast } from "sonner";
import { printerFormSchema, type PrinterFormValues } from "../printer-form-schema";

export function usePrinterFormState(
  printer?: PrinterType,
  onAddToner?: (toner: TonerType) => void
) {
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [selectedToners, setSelectedToners] = useState<string[]>(printer?.toners || []);
  const [imageUrl, setImageUrl] = useState<string>(printer?.imageUrl || "");
  const [ownershipType, setOwnershipType] = useState<"system_asset" | "client_owned">(
    printer?.ownership === "client_owned" ? "client_owned" : "system_asset"
  );

  const form = useForm<PrinterFormValues>({
    resolver: zodResolver(printerFormSchema),
    defaultValues: {
      make: printer?.make || "",
      series: printer?.series || "",
      model: printer?.model || "",
      type: printer?.type || "laser",
      status: printer?.status || "available",
      description: printer?.description || "",
      category: printer?.category || "printer",
      price: printer?.price || 0,
      rentalPrice: printer?.rentalPrice || 0,
      quantityInStock: printer?.quantityInStock || 0,
      isRentalAvailable: printer?.isRentalAvailable || false,
      isFeatured: printer?.isFeatured || false,
      serialNumber: printer?.serialNumber || "",
      department: printer?.department || "",
      location: printer?.location || "",
      ownership: printer?.ownership || "system_asset",
      clientId: printer?.clientId || "",
      oemToner: printer?.oemToner || "",
    },
    mode: "onChange"
  });

  // Watch for ownership changes to update the ownershipType state
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "ownership") {
        setOwnershipType(value.ownership as PrinterOwnershipType);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  useEffect(() => {
    if (printer) {
      form.reset({
        make: printer.make || "",
        series: printer.series || "",
        model: printer.model || "",
        type: printer.type || "laser",
        status: printer.status || "available", 
        description: printer.description || "",
        category: printer.category || "printer",
        price: printer.price || 0,
        rentalPrice: printer.rentalPrice || 0,
        quantityInStock: printer.quantityInStock || 0,
        isRentalAvailable: printer.isRentalAvailable || false,
        isFeatured: printer.isFeatured || false,
        serialNumber: printer.serialNumber || "",
        department: printer.department || "",
        location: printer.location || "",
        ownership: printer.ownership || "system_asset",
        clientId: printer.clientId || "",
        oemToner: printer.oemToner || "",
      });
      setSelectedToners(printer.toners || []);
      setImageUrl(printer.imageUrl || "");
      setOwnershipType(printer.ownership === "client_owned" ? "client_owned" : "system_asset");
    }
  }, [printer, form]);

  const handleTonerChange = (tonerId: string) => {
    setSelectedToners((prevSelected) => {
      if (prevSelected.includes(tonerId)) {
        return prevSelected.filter((id) => id !== tonerId);
      } else {
        return [...prevSelected, tonerId];
      }
    });
  };

  const handleClose = () => {
    if (form.formState.isDirty) {
      setIsAlertDialogOpen(true);
    } else {
      handleConfirmCancel();
    }
  };

  const handleConfirmCancel = () => {
    setIsAlertDialogOpen(false);
  };
  
  const handleAddNewToner = (tonerName: string) => {
    if (onAddToner) {
      const newToner: TonerType = {
        id: crypto.randomUUID(),
        name: tonerName,
        model: tonerName,
      };
      onAddToner(newToner);
      toast.success(`New toner ${tonerName} added`);
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
