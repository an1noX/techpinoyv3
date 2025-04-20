
import { PrinterType } from "@/types/types";
import { TabsContent } from "@/components/ui/tabs";
import { PrinterInfoCard } from "./PrinterInfoCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PrinterTabsContentProps {
  printer: PrinterType;
  activeTab: string;
}

export function PrinterTabsContent({ printer, activeTab }: PrinterTabsContentProps) {
  return (
    <>
      <TabsContent value="details" className="mt-4">
        <PrinterInfoCard printer={printer} />
      </TabsContent>
      
      <TabsContent value="specs" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Technical Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            {printer.description ? (
              <div className="space-y-2">
                <p className="text-muted-foreground">{printer.description}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No specifications available for this printer.
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      {printer.notes && (
        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{printer.notes}</p>
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </>
  );
}
