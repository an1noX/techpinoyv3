
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Fab } from '@/components/ui/fab';
import { Plus, FileText, Printer, HelpCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WikiPrinter } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TonerCompatibilityManager } from '@/components/TonerCompatibilityManager';

// Article type for sample usage
type Article = {
  id: string;
  title: string;
  tags: string[];
  content: string;
  associatedWith: string;
};

const SAMPLE_ARTICLES: Article[] = [
  {
    id: "1",
    title: "How to Load Paper in HP M402dn",
    tags: ['HP M402dn', 'PrinterKB'],
    content: "Follow these steps to load paper correctly into the HP LaserJet Pro M402dn tray...",
    associatedWith: "HP LaserJet Pro M402dn"
  }
];

export default function Wiki() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [printers, setPrinters] = useState<WikiPrinter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState('printerkb');
  // PrinterKB modals & state
  const [detailsModal, setDetailsModal] = useState(false);
  const [specsModal, setSpecsModal] = useState(false);
  const [tonersModal, setTonersModal] = useState(false);
  const [helpModal, setHelpModal] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<WikiPrinter | null>(null);
  const [editDetails, setEditDetails] = useState(false);
  const [editSpecs, setEditSpecs] = useState(false);
  // For editing details/specs inline
  const [editableDetails, setEditableDetails] = useState<{ make: string; series: string; model: string }>({ make: '', series: '', model: '' });
  const [editableSpecs, setEditableSpecs] = useState<Record<string, string>>({});

  useEffect(() => { fetchPrinters(); }, []);

  const fetchPrinters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('printer_wiki').select('*');
      if (error) throw error;
      setPrinters(data as WikiPrinter[]);
    } catch (error: any) {
      toast({
        title: "Error fetching printer wiki",
        description: error.message,
        variant: "destructive"
      });
      // Mock data as fallback
      setPrinters([
        {
          id: '1',
          make: 'HP',
          series: 'LaserJet',
          model: 'Pro MFP M428fdn',
          maintenance_tips: 'Clean monthly with compressed air. Replace toner when indicated.',
          specs: { resolution: '1200x1200 dpi', speed: '40 ppm', connectivity: 'USB, Ethernet, Wi-Fi' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          make: 'Brother',
          series: 'MFC',
          model: 'L8900CDW',
          maintenance_tips: 'Check drum units every 3 months. Clean paper path when jams occur.',
          specs: { resolution: '2400x600 dpi', speed: '33 ppm', connectivity: 'USB, Ethernet, Wi-Fi, NFC' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          make: 'Canon',
          series: 'imageRUNNER',
          model: '1643i',
          maintenance_tips: 'Replace toner according to manufacturer guidelines. Clean scanner glass daily.',
          specs: { resolution: '600x600 dpi', speed: '45 ppm', connectivity: 'USB, Ethernet' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Modal controls
  const handleOpenModal = (printer: WikiPrinter, modal: 'details' | 'specs' | 'toners' | 'help') => {
    setSelectedPrinter(printer);
    setDetailsModal(modal === 'details');
    setSpecsModal(modal === 'specs');
    setTonersModal(modal === 'toners');
    setHelpModal(modal === 'help');
    setEditDetails(false);
    setEditSpecs(false);
    // prefill edit states
    if (modal === 'details') {
      setEditableDetails({
        make: printer.make,
        series: printer.series,
        model: printer.model
      });
    }
    if (modal === 'specs') {
      setEditableSpecs({ ...(printer.specs || {}) });
    }
  };

  // Details edit/save
  const handleEditDetails = () => setEditDetails(true);
  const handleSaveDetails = () => {
    if (!selectedPrinter) return;
    // Here, you would update the details in Supabase, for now update local
    setPrinters(printers.map(p => p.id === selectedPrinter.id
      ? { ...p, ...editableDetails }
      : p
    ));
    setSelectedPrinter({ ...selectedPrinter, ...editableDetails });
    setEditDetails(false);
    toast({ title: "Updated", description: "Details updated." });
  };

  // Specs edit/save
  const handleEditSpecs = () => setEditSpecs(true);
  const handleAddSpec = () => setEditableSpecs({ ...editableSpecs, '': '' });
  const handleSpecChange = (key: string, value: string) => {
    setEditableSpecs(specs => {
      const copy = { ...specs };
      if (key === '') return copy;
      copy[key] = value;
      return copy;
    });
  };
  const handleSpecFieldChange = (k: string, v: string) => {
    setEditableSpecs(specs => {
      const copy = { ...specs };
      delete copy[k];  // remove old
      copy[v] = '';
      return copy;
    });
  };
  const handleSaveSpecs = () => {
    if (!selectedPrinter) return;
    setPrinters(printers.map(p => p.id === selectedPrinter.id
      ? { ...p, specs: editableSpecs }
      : p
    ));
    setSelectedPrinter({ ...selectedPrinter, specs: editableSpecs });
    setEditSpecs(false);
    toast({ title: "Updated", description: "Specs updated." });
  };

  // ---------------------------
  // RENDER LOGIC
  // ---------------------------
  return (
    <MobileLayout
      fab={
        tab === 'printerkb' ? (
          <Fab icon={<Plus size={24} />} aria-label="Add printer to wiki" onClick={() => navigate('/wiki/new')} />
        ) : null
      }
    >
      <div className="container px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Wiki</h1>
          <div className="text-sm bg-blue-100 text-blue-800 rounded-md px-2 py-1">
            Master List
          </div>
        </div>

        <Tabs value={tab} onValueChange={(t) => setTab(t)}>
          <TabsList className="mb-6 grid grid-cols-3">
            <TabsTrigger value="printerkb">PrinterKB</TabsTrigger>
            <TabsTrigger value="tonerkb">TonerKB</TabsTrigger>
            <TabsTrigger value="article">Article</TabsTrigger>
          </TabsList>

          {/* PRINTERKB TAB */}
          <TabsContent value="printerkb">
            <div className="mb-4 flex items-center space-x-2">
              <Input
                type="search"
                placeholder="Search printers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline" size="icon" onClick={() => setSearchTerm('')}>
                <FileText className="h-4 w-4" />
              </Button>
            </div>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : printers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No printers found</p>
                <Button className="mt-4" onClick={() => navigate('/wiki/new')}>Add Printer</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {printers
                  .filter(printer =>
                    printer.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    printer.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    printer.series.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((printer) => (
                    <Card key={printer.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{printer.make} {printer.model}</CardTitle>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => handleOpenModal(printer, 'details')}
                            >
                              <FileText size={16} /> Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => handleOpenModal(printer, 'specs')}
                            >
                              <FileText size={16} /> Specification
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => handleOpenModal(printer, 'toners')}
                            >
                              <Printer size={16} /> Toners
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => handleOpenModal(printer, 'help')}
                            >
                              <HelpCircle size={16} /> Help
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground">Series: {printer.series}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}

            {/* Details Modal */}
            <Dialog open={detailsModal} onOpenChange={setDetailsModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Printer Details</DialogTitle>
                </DialogHeader>
                {selectedPrinter &&
                  (editDetails ? (
                    <form className="space-y-2 py-2" onSubmit={(e) => { e.preventDefault(); handleSaveDetails(); }}>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Make:</span>
                        <Input
                          value={editableDetails.make}
                          onChange={e => setEditableDetails(d => ({ ...d, make: e.target.value }))}
                          className="w-40"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Series:</span>
                        <Input
                          value={editableDetails.series}
                          onChange={e => setEditableDetails(d => ({ ...d, series: e.target.value }))}
                          className="w-40"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Model:</span>
                        <Input
                          value={editableDetails.model}
                          onChange={e => setEditableDetails(d => ({ ...d, model: e.target.value }))}
                          className="w-40"
                        />
                      </div>
                      <DialogFooter className="gap-2 pt-4">
                        <Button type="submit" variant="default">Save</Button>
                        <Button variant="ghost" onClick={() => setEditDetails(false)}>Cancel</Button>
                      </DialogFooter>
                    </form>
                  ) : (
                    <div className="space-y-2 py-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Make:</span>
                        <span className="font-medium">{selectedPrinter.make}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Series:</span>
                        <span className="font-medium">{selectedPrinter.series}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Model:</span>
                        <span className="font-medium">{selectedPrinter.model}</span>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailsModal(false)}>Close</Button>
                        <Button variant="default" onClick={handleEditDetails}>
                          <Edit size={16} className="mr-1" /> Edit
                        </Button>
                      </DialogFooter>
                    </div>
                  ))}
              </DialogContent>
            </Dialog>

            {/* Specification Modal */}
            <Dialog open={specsModal} onOpenChange={setSpecsModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Technical Specifications</DialogTitle>
                </DialogHeader>
                {selectedPrinter && (editSpecs ? (
                  <form className="space-y-2 py-2" onSubmit={e => { e.preventDefault(); handleSaveSpecs(); }}>
                    {Object.entries(editableSpecs).map(([k, v], i) => (
                      <div key={i} className="flex justify-between items-center">
                        <Input
                          className="w-32"
                          value={k}
                          onChange={e => handleSpecFieldChange(k, e.target.value)}
                          placeholder="Spec Key"
                        />
                        <Input
                          className="w-40"
                          value={v}
                          onChange={e => handleSpecChange(k, e.target.value)}
                          placeholder="Spec Value"
                        />
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleAddSpec} type="button">
                      Add Spec Field
                    </Button>
                    <DialogFooter className="gap-2 pt-4">
                      <Button type="submit" variant="default">Save</Button>
                      <Button variant="ghost" onClick={() => setEditSpecs(false)}>Cancel</Button>
                    </DialogFooter>
                  </form>
                ) : (
                  <div className="space-y-2 py-2">
                    {selectedPrinter.specs && Object.keys(selectedPrinter.specs).length > 0 ? (
                      Object.entries(selectedPrinter.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">{key}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No specifications available for this printer.
                      </p>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSpecsModal(false)}>Close</Button>
                      <Button variant="default" onClick={handleEditSpecs}>
                        <Edit size={16} className="mr-1" /> Add / Edit
                      </Button>
                    </DialogFooter>
                  </div>
                ))}
              </DialogContent>
            </Dialog>

            {/* Toners Modal */}
            <Dialog open={tonersModal} onOpenChange={setTonersModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Toners & Compatibility</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  {selectedPrinter && (
                    <TonerCompatibilityManager printerId={selectedPrinter.id} />
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setTonersModal(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Help Modal (Article Filtered by Tag) */}
            <Dialog open={helpModal} onOpenChange={setHelpModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Help & Instructions</DialogTitle>
                </DialogHeader>
                {selectedPrinter ? (
                  <div>
                    {SAMPLE_ARTICLES
                      .filter(article =>
                        article.tags
                          .map(tag => tag.toLowerCase()).includes(
                            `${selectedPrinter.make} ${selectedPrinter.model}`.toLowerCase().trim()
                          )
                      )
                      .map(article => (
                        <div key={article.id} className="mb-4">
                          <h3 className="font-semibold">{article.title}</h3>
                          <p className="text-muted-foreground mb-2 text-xs">
                            Tags: {article.tags.join(', ')}
                          </p>
                          <p>{article.content}</p>
                        </div>
                      ))
                    }
                    {!SAMPLE_ARTICLES.some(article =>
                      article.tags
                        .map(tag => tag.toLowerCase()).includes(
                          `${selectedPrinter.make} ${selectedPrinter.model}`.toLowerCase().trim()
                        )
                    ) && (
                        <p className="text-muted-foreground text-center py-4">
                          No instructions/guides found for this printer.
                        </p>
                      )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">Select a printer to see help articles.</p>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setHelpModal(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* TONERKB TAB */}
          <TabsContent value="tonerkb">
            <div className="text-center text-muted-foreground py-10">
              <p>Coming soon: Toner Knowledge Base</p>
            </div>
          </TabsContent>

          {/* ARTICLE TAB */}
          <TabsContent value="article">
            <div className="max-w-xl mx-auto space-y-6">
              <h2 className="text-xl font-bold mb-4">Articles</h2>
              {SAMPLE_ARTICLES.map(article => (
                <Card key={article.id}>
                  <CardHeader>
                    <CardTitle>{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-1 text-muted-foreground text-xs">Tags: {article.tags.join(', ')}</p>
                    <p>{article.content}</p>
                    <div className="mt-2 text-xs text-muted-foreground">Associated with: {article.associatedWith}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
