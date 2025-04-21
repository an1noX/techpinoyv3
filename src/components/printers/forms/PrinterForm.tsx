
import { PrinterType, TonerType, OwnershipType, PrinterStatus, WikiToner } from "@/types/types";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { FormContainer } from "./components/FormContainer";
import { FormActions } from "./components/FormActions";
import { printerFormSchema, type PrinterFormValues } from "./printer-form-schema";
import { GeneralInfoSection } from "./sections/GeneralInfoSection";
import { DetailsSection } from "./sections/DetailsSection";
import { PricingSection } from "./sections/PricingSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { TonerSection } from "./sections/TonerSection";
import { ImageSection } from "./sections/ImageSection";
import { PrinterOwnershipSection } from "./PrinterOwnershipSection";
import { usePrinterMakesAndSeries } from "@/hooks/usePrinterMakesAndSeries";
import { usePrinterFormState } from "./hooks/usePrinterFormState";
import { tonerTypesToWikiToners } from "@/utils/typeHelpers";

interface PrinterFormProps {
  printer?: PrinterType;
  toners: TonerType[];
  clients?: Array<{ id: string; name: string }>;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PrinterType) => void;
  onAddToner?: (toner: TonerType) => void;
}

export function PrinterForm({
  printer,
  toners,
  clients = [],
  open,
  onClose,
  onSubmit,
  onAddToner
}: PrinterFormProps) {
  const {
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
  } = usePrinterFormState(printer, onAddToner);

  const { makes, series, addNewMake, addNewSeries } = usePrinterMakesAndSeries();
  
  // Convert TonerType[] to WikiToner[] for compatibility
  const wikiToners = tonerTypesToWikiToners(toners);

  const onSubmitData = (data: PrinterFormValues) => {
    // Create printer data with the form values and selected toners
    const printerData: PrinterType = {
      id: printer?.id || crypto.randomUUID(),
      model: data.model,
      series: data.series,
      type: data.type,
      status: data.status as PrinterStatus,
      make: data.make,
      serialNumber: data.serialNumber,
      department: data.department,
      location: data.location,
      description: data.description,
      category: data.category,
      price: data.price,
      rentalPrice: data.rentalPrice,
      quantityInStock: data.quantityInStock,
      imageUrl: imageUrl,
      isRentalAvailable: data.isRentalAvailable,
      isFeatured: data.isFeatured,
      toners: selectedToners,
      ownership: data.ownership,
      clientId: data.clientId,
      oemToner: data.oemToner,
      // Required fields for PrinterType
      owned_by: data.ownership,
      created_at: printer?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: data.notes
    };

    onSubmit(printerData);
    onClose();
    toast.success(`Printer has been saved!`);
  };

  return (
    <FormContainer 
      open={open}
      isAlertDialogOpen={isAlertDialogOpen}
      title={printer ? "Edit Printer" : "Add Printer"}
      description={printer ? "Edit the details of the selected printer." : "Add a new printer to the catalog."}
      onCloseAlert={() => setIsAlertDialogOpen(false)}
      onConfirmCancel={handleConfirmCancel}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitData)} className="grid gap-6 p-6">
          <h2 className="text-xl font-semibold">{printer ? "Edit Printer" : "Add Printer"}</h2>
          <p className="text-sm text-muted-foreground">
            {printer ? "Edit the details of the selected printer." : "Add a new printer to the catalog."}
          </p>
          
          <div className="grid gap-6 overflow-y-auto max-h-[calc(90vh-12rem)] p-1">
            <GeneralInfoSection 
              form={form} 
              makes={makes} 
              series={series}
              onAddNewMake={addNewMake}
              onAddNewSeries={addNewSeries}
            />
            <DetailsSection 
              form={form}
              toners={toners.map(t => ({ id: t.id, name: t.name || t.model }))}
              onAddNewToner={handleAddNewToner}
            />
            <PricingSection form={form} />
            <FeaturesSection form={form} />
            <PrinterOwnershipSection 
              form={form} 
              clients={clients}
            />
            <TonerSection 
              form={form} 
              toners={wikiToners} 
              selectedToners={selectedToners} 
              onTonerChange={handleTonerChange} 
              onAddToner={onAddToner ? 
                ((toner: WikiToner) => onAddToner(toner as unknown as TonerType)) : 
                undefined} 
            />
            <ImageSection 
              imageUrl={imageUrl} 
              setImageUrl={setImageUrl} 
            />
          </div>

          <FormActions 
            isEditing={!!printer} 
            onCancel={handleClose} 
          />
        </form>
      </Form>
    </FormContainer>
  );
}
