
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
import { MOCK_PRINTERS, mapPrinterToArticle, mapTonerToArticle } from "@/utils/mock-data";
import { WikiArticleType, ArticleStatus } from "@/types/types";

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

  // Add permissions checks
  const canCreate = hasPermission('create:wiki');
  const canEdit = hasPermission('update:wiki');
  const canDelete = hasPermission('delete:wiki');

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [searchTerm, activeTab, articles]);

  const seedData = async () => {
    try {
      setLoading(true);
      
      // Insert wiki printers
      const printersToInsert = MOCK_PRINTERS.map(printer => ({
        ...printer,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data: printers, error: printersError } = await supabase
        .from('wiki_printers')
        .upsert(printersToInsert, {
          onConflict: 'make,series,model'
        })
        .select();
      
      if (printersError) throw printersError;

      // Insert wiki toners with conflict handling
      const mockWikiToners = [
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

      // Use upsert with onConflict handling for toners
      const { data: toners, error: tonersError } = await supabase
        .from('wiki_toners')
        .upsert(mockWikiToners, {
          onConflict: 'brand,model',
          ignoreDuplicates: false
        })
        .select();
      
      if (tonersError) throw tonersError;

      // Create compatibility relationships with conflict handling
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
        description: 'Mock data seeded successfully'
      });

      // Refresh the articles list
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
      
      // Fetch and transform data
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

      // Map the data with type safety
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

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (activeTab !== 'all') {
      filtered = filtered.filter(article => article.category.toLowerCase() === activeTab.toLowerCase());
    }

    setFilteredArticles(filtered);
  };

  const handleDeleteArticle = async (articleId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the card click
    
    try {
      const { error } = await supabase
        .from('wiki_articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;

      toast({
        title: "Article deleted",
        description: "The article has been successfully removed."
      });

      // Refresh articles list
      fetchArticles();
    } catch (error: any) {
      toast({
        title: "Error deleting article",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditArticle = (articleId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the card click
    navigate(`/wiki/edit/${articleId}`);
  };

  const canCreateArticle = hasPermission('create:wiki');

  const handleArticleClick = (article: WikiArticleType) => {
    navigate(`/wiki/article/${article.id}`, { state: { article } });
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
    // Update the refresh function to actually fetch articles
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
                              onClick={(e) => handleEditArticle(article.id, e)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDeleteArticle(article.id, e)}
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
