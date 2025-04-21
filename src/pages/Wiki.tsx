import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookText, Plus, Search, Tag, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { WikiEntryTypeDialog } from '@/components/wiki/WikiEntryTypeDialog';
import { WikiTonerForm } from '@/components/wiki/WikiTonerForm';
import { WikiPrinterForm } from '@/components/wiki/WikiPrinterForm';
import { WikiMaintenanceGuideForm } from '@/components/wiki/WikiMaintenanceGuideForm';
import { WikiArticleForm } from '@/components/wiki/WikiArticleForm';
import { WikiArticleType, ArticleStatus, WikiPrinter, WikiToner, Json } from "@/types/types";

export default function Wiki() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [articles, setArticles] = useState<WikiArticleType[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<WikiArticleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [tonerFormOpen, setTonerFormOpen] = useState(false);
  const [printerFormOpen, setPrinterFormOpen] = useState(false);
  const [maintenanceFormOpen, setMaintenanceFormOpen] = useState(false);
  const [articleFormOpen, setArticleFormOpen] = useState(false);

  const canCreate = hasPermission('create:wiki');
  const canEdit = hasPermission('update:wiki');
  const canDelete = hasPermission('delete:wiki');

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [searchTerm, activeTab, articles]);

  const mapPrinterToArticle = (printer: WikiPrinter): WikiArticleType => {
    const specsFormatted = printer.specs 
      ? Object.entries(printer.specs)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return `${key}: ${value.join(', ')}`;
            }
            return `${key}: ${value}`;
          })
          .join('\n') 
      : '';

    const content = `${printer.description || ''}\n\n${specsFormatted}\n\n${printer.maintenance_tips || ''}`;

    return {
      id: printer.id || '',
      title: `${printer.make} ${printer.model}`,
      content: content.trim(),
      category: 'printer',
      tags: [printer.series, printer.type].filter(Boolean) as string[],
      created_at: printer.created_at || new Date().toISOString(),
      updated_at: printer.updated_at || new Date().toISOString(),
      status: 'published',
      associated_with: printer.model
    };
  };

  const mapTonerToArticle = (toner: WikiToner): WikiArticleType => {
    const contentParts = [
      toner.description || `${toner.brand} ${toner.model} ${toner.color} toner cartridge`,
      toner.page_yield ? `Page Yield: Approximately ${toner.page_yield} pages` : '',
      toner.stock ? `Current Stock: ${toner.stock}` : '',
      toner.oem_code ? `OEM Code: ${toner.oem_code}` : ''
    ].filter(Boolean);

    const content = contentParts.join('\n\n');

    return {
      id: toner.id || '',
      title: `${toner.brand} ${toner.model} (${toner.color})`,
      content,
      category: 'toner',
      tags: toner.category || ['toner'],
      created_at: toner.created_at || new Date().toISOString(),
      updated_at: toner.updated_at || new Date().toISOString(),
      status: 'published'
    };
  };

  const seedData = async () => {
    try {
      setLoading(true);
      
      const samplePrinters = [
        {
          make: "HP",
          series: "LaserJet",
          model: "Pro M404n",
          description: "Black and white laser printer for small to medium business use. Fast printing at up to 40 pages per minute.",
          type: "laser",
          specs: {
            color: false,
            ppm: 40,
            duplex: true,
            connectivity: ["USB", "Ethernet"],
            paperSize: ["A4", "Letter", "Legal"]
          },
          maintenance_tips: "Replace toner when print quality diminishes. Clean printer regularly to prevent paper jams.",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          make: "Brother",
          series: "MFC",
          model: "L8900CDW",
          description: "Color laser all-in-one printer with scanning, copying, and faxing capabilities.",
          type: "multifunction",
          specs: {
            color: true,
            ppm: 33,
            duplex: true,
            connectivity: ["USB", "Ethernet", "WiFi", "WiFi Direct"],
            paperSize: ["A4", "Letter", "Legal", "Photo"]
          },
          maintenance_tips: "Replace toner cartridges when indicated. Clean scanner glass regularly for best quality.",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      const { data: printers, error: printersError } = await supabase
        .from('wiki_printers')
        .upsert(samplePrinters, {
          onConflict: 'make,series,model'
        })
        .select();
      
      if (printersError) throw printersError;

      const sampleToners = [
        {
          brand: 'HP',
          model: 'CF258A',
          color: 'black',
          page_yield: 3000,
          oem_code: '58A',
          stock: 10,
          threshold: 3,
          description: 'Original HP 58A Black toner cartridge',
          category: ['laser', 'original'],
          is_active: true,
          is_commercial_product: true
        },
        {
          brand: 'Brother',
          model: 'TN-436BK',
          color: 'black',
          page_yield: 6500,
          oem_code: 'TN436BK',
          stock: 5,
          threshold: 2,
          description: 'Original Brother Ultra High-Yield Black toner cartridge',
          category: ['laser', 'original'],
          is_active: true,
          is_commercial_product: true
        }
      ];

      const { data: toners, error: tonersError } = await supabase
        .from('wiki_toners')
        .upsert(sampleToners, {
          onConflict: 'brand,model',
          ignoreDuplicates: false
        })
        .select();
      
      if (tonersError) throw tonersError;

      if (printers && printers.length > 0 && toners && toners.length > 0) {
        const mockCompatibilities = [
          {
            printer_wiki_id: printers[0].id,
            toner_id: toners[0].id
          },
          {
            printer_wiki_id: printers[1].id,
            toner_id: toners[1].id
          }
        ];

        const { error: compatError } = await supabase
          .from('printer_toner_compatibility')
          .upsert(mockCompatibilities, {
            onConflict: 'printer_wiki_id,toner_id',
            ignoreDuplicates: true
          });
        
        if (compatError) throw compatError;
      }

      toast({
        title: 'Success',
        description: 'Sample data seeded successfully'
      });

      fetchArticles();
    } catch (error: any) {
      console.error('Error seeding data:', error);
      toast({
        title: 'Error seeding data',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      const printersResult = await supabase
        .from('wiki_printers')
        .select('*');

      const tonersResult = await supabase
        .from('wiki_toners')
        .select(`
          id,
          brand,
          model,
          color,
          page_yield,
          description,
          oem_code,
          stock,
          threshold,
          is_active,
          created_at,
          updated_at,
          category
        `);

      if (printersResult.error) throw printersResult.error;
      if (tonersResult.error) throw tonersResult.error;

      const printerArticles = (printersResult.data || []).map(printer => mapPrinterToArticle({
        ...printer,
        specs: typeof printer.specs === 'string' ? JSON.parse(printer.specs) : printer.specs
      }));

      const tonerArticles = (tonersResult.data || []).map(toner => mapTonerToArticle({
        ...toner,
        compatible_printers: {},
        variant_details: {},
        is_commercial_product: true,
        is_base_model: true,
        aliases: []
      }));

      setArticles([...printerArticles, ...tonerArticles]);
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      toast({
        title: 'Error fetching articles',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = [...articles];

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (activeTab !== 'all') {
      filtered = filtered.filter(article => article.category.toLowerCase() === activeTab.toLowerCase());
    }

    setFilteredArticles(filtered);
  };

  const handleDeleteArticle = async (articleId: string, category: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      if (!window.confirm("Are you sure you want to delete this entry?")) {
        return;
      }
      
      let error;
      
      if (category === 'printer') {
        const result = await supabase
          .from('wiki_printers')
          .delete()
          .eq('id', articleId);
        error = result.error;
      } else if (category === 'toner') {
        const result = await supabase
          .from('wiki_toners')
          .delete()
          .eq('id', articleId);
        error = result.error;
      } else {
        const result = await supabase
          .from('wiki_articles')
          .delete()
          .eq('id', articleId);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Entry deleted",
        description: "The entry has been successfully removed."
      });

      fetchArticles();
    } catch (error: any) {
      toast({
        title: "Error deleting entry",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditArticle = (articleId: string, category: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (category === 'printer') {
      navigate(`/wiki/edit/${articleId}`);
    } else if (category === 'toner') {
      toast({
        description: "Edit toner functionality is not yet implemented",
        variant: "default"
      });
    } else {
      navigate(`/wiki/edit/${articleId}`);
    }
  };

  const canCreateArticle = hasPermission('create:wiki');

  const handleArticleClick = (article: WikiArticleType) => {
    if (article.category === 'printer') {
      navigate(`/wiki/${article.id}`);
    } else if (article.category === 'maintenance' || article.category === 'article') {
      navigate(`/wiki/article/${article.id}`);
    } else if (article.category === 'toner') {
      navigate(`/wiki/article/${article.id}`);
    } else {
      navigate(`/wiki/article/${article.id}`);
    }
  };

  const handleTypeSelect = (type: 'printer' | 'toner' | 'article' | 'maintenance') => {
    switch (type) {
      case 'printer':
        setPrinterFormOpen(true);
        break;
      case 'toner':
        setTonerFormOpen(true);
        break;
      case 'article':
        setArticleFormOpen(true);
        break;
      case 'maintenance':
        setMaintenanceFormOpen(true);
        break;
    }
  };

  const handleRefresh = () => {
    fetchArticles();
  };

  return (
    <MobileLayout>
      <div className="container mx-auto py-6 px-4 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Printer Wiki</h1>
          <div className="flex gap-2">
            {process.env.NODE_ENV === 'development' && (
              <Button variant="outline" onClick={seedData} disabled={loading}>
                Seed Data
              </Button>
            )}
            {canCreateArticle && (
              <Button onClick={() => setTypeDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="printer">Printers</TabsTrigger>
            <TabsTrigger value="toner">Toners</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <BookText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No articles found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <div 
                key={article.id}
                onClick={() => handleArticleClick(article)}
                className="cursor-pointer relative"
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                      {(canEdit || canDelete) && (
                        <div className="flex gap-2">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleEditArticle(article.id, article.category, e)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDeleteArticle(article.id, article.category, e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    <CardDescription className="flex gap-2 flex-wrap mt-2">
                      <Badge variant="outline">{article.category}</Badge>
                      {article.tags?.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-muted-foreground">
                      {article.content.substring(0, 150)}...
                    </p>
                  </CardContent>
                  <CardFooter>
                    <p className="text-xs text-muted-foreground">
                      Updated {new Date(article.updated_at).toLocaleDateString()}
                    </p>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      <WikiEntryTypeDialog
        open={typeDialogOpen}
        onOpenChange={setTypeDialogOpen}
        onSelect={handleTypeSelect}
      />

      <WikiTonerForm
        open={tonerFormOpen}
        onOpenChange={setTonerFormOpen}
        onSuccess={handleRefresh}
      />

      <WikiPrinterForm
        open={printerFormOpen}
        onOpenChange={setPrinterFormOpen}
        onSuccess={handleRefresh}
      />

      <WikiMaintenanceGuideForm
        open={maintenanceFormOpen}
        onOpenChange={setMaintenanceFormOpen}
        onSuccess={handleRefresh}
      />

      <WikiArticleForm
        open={articleFormOpen}
        onOpenChange={setArticleFormOpen}
        onSuccess={handleRefresh}
      />
    </MobileLayout>
  );
}
