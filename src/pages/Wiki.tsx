
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Plus, FileText, Printer, HelpCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WikiPrinter, Toner, WikiArticle } from '@/types/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TonerCompatibilityManager } from '@/components/TonerCompatibilityManager';
import { Fab } from '@/components/ui/fab';
import { WikiAddArticleDialog } from "@/components/wiki/WikiAddArticleDialog";
import { WikiAddTonerDialog } from "@/components/wiki/WikiAddTonerDialog";

const ARTICLE_CATEGORIES = [
  "Paper Jam",
  "Print Quality",
  "Network",
  "Installation",
  "Supplies",
  "Other",
];

export default function Wiki() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [printers, setPrinters] = useState<WikiPrinter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState('printerkb');
  const [detailsModal, setDetailsModal] = useState(false);
  const [specsModal, setSpecsModal] = useState(false);
  const [tonersModal, setTonersModal] = useState(false);
  const [helpModal, setHelpModal] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<WikiPrinter | null>(null);
  const [editDetails, setEditDetails] = useState(false);
  const [editSpecs, setEditSpecs] = useState(false);
  const [editableDetails, setEditableDetails] = useState<{ make: string; series: string; model: string }>({ make: '', series: '', model: '' });
  const [editableSpecs, setEditableSpecs] = useState<Record<string, string>>({});

  const [toners, setToners] = useState<Toner[]>([]);
  const [tonersLoading, setTonersLoading] = useState(true);
  const [tonerDialogOpen, setTonerDialogOpen] = useState(false);
  const [tonerToEdit, setTonerToEdit] = useState<Toner | null>(null);
  const [deleteTonerId, setDeleteTonerId] = useState<string | null>(null);

  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<WikiArticle | null>(null);
  const [deleteArticleId, setDeleteArticleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([...ARTICLE_CATEGORIES]);

  const fetchArticles = async () => {
    setArticlesLoading(true);
    try {
      const { data, error } = await supabase
        .from("wiki_articles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      
      const transformedArticles = (data || []).map(article => ({
        id: article.id,
        title: article.title,
        content: article.content,
        tags: article.tags || [],
        associatedWith: article.associated_with || "",
        category: article.category,
        created_at: article.created_at,
        updated_at: article.updated_at,
        videoUrl: article.video_url || "",
      }));
      
      setArticles(transformedArticles as WikiArticle[]);
    } catch (error: any) {
      toast({
        title: "Error fetching articles",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setArticlesLoading(false);
    }
  };

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

  // Make sure this component returns JSX
  return (
    <MobileLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Printer Knowledge Base</h1>
        
        <Tabs defaultValue="printerkb" className="w-full" value={tab} onValueChange={setTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="printerkb" className="flex-1">Printer KB</TabsTrigger>
            <TabsTrigger value="articles" className="flex-1" onClick={fetchArticles}>Articles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="printerkb">
            {/* Printer knowledge base content */}
            <div className="space-y-4">
              {/* Printer KB content here */}
              <p>Printer knowledge base content will appear here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="articles">
            {/* Articles content */}
            <div className="space-y-4">
              {/* Articles content here */}
              <p>Articles content will appear here.</p>
            </div>
          </TabsContent>
        </Tabs>
        
        <Fab
          icon={<Plus />}
          onClick={() => {
            if (tab === "printerkb") {
              navigate("/wiki/new");
            } else {
              setArticleDialogOpen(true);
            }
          }}
        />
      </div>
    </MobileLayout>
  );
}
