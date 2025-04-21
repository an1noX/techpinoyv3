
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { WikiArticle, ArticleStatus, UserRole } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Edit, Trash2, Clock, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

interface StatusBadgeProps {
  status: ArticleStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let color = "neutral";
  let label = status;

  switch (status) {
    case "published":
      color = "green";
      break;
    case "pending":
      color = "amber";
      break;
    case "rejected":
      color = "red";
      break;
    default:
      color = "neutral";
      break;
  }

  return (
    <Badge className={`bg-${color}-100 text-${color}-800 dark:bg-${color}-700 dark:text-${color}-100`}>
      {label}
    </Badge>
  );
};

export default function WikiArticleView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [article, setArticle] = useState<WikiArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchArticle();
  }, [id]);
  
  const fetchArticle = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      // First try to get from wiki_articles
      let { data, error } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        // If not found in wiki_articles, try other tables
        const { data: printerData, error: printerError } = await supabase
          .from('wiki_printers')
          .select('*')
          .eq('id', id)
          .single();
          
        if (!printerError && printerData) {
          // Convert printer data to article format
          const specsStr = printerData.specs ? 
            Object.entries(printerData.specs).map(([k, v]) => `${k}: ${v}`).join('\n') : '';
          
          data = {
            id: printerData.id,
            title: `${printerData.make} ${printerData.model}`,
            content: printerData.description || '' + '\n\n' + specsStr + '\n\n' + (printerData.maintenance_tips || ''),
            category: 'printer',
            tags: [printerData.series, printerData.type].filter(Boolean) as string[],
            created_at: printerData.created_at,
            updated_at: printerData.updated_at,
            status: 'published',
            associated_with: printerData.model
          };
        } else {
          // Check if it's a toner
          const { data: tonerData, error: tonerError } = await supabase
            .from('wiki_toners')
            .select('*')
            .eq('id', id)
            .single();
            
          if (!tonerError && tonerData) {
            // Convert toner data to article format
            data = {
              id: tonerData.id,
              title: `${tonerData.brand} ${tonerData.model} (${tonerData.color})`,
              content: tonerData.description || `${tonerData.brand} ${tonerData.model} ${tonerData.color} toner cartridge\n\nPage Yield: ${tonerData.page_yield || 'Unknown'}\nStock: ${tonerData.stock || 0}`,
              category: 'toner',
              tags: tonerData.category || ['toner'],
              created_at: tonerData.created_at,
              updated_at: tonerData.updated_at,
              status: 'published'
            };
          } else {
            throw new Error("Article not found");
          }
        }
      }
      
      setArticle(data as WikiArticle);
    } catch (error: any) {
      toast({
        description: `Error fetching article: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const updateArticleStatus = async (status: ArticleStatus) => {
    if (!article) return;
    
    try {
      const { error } = await supabase
        .from('wiki_articles')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', article.id);
      
      if (error) throw error;
      
      // Update local state to reflect the change
      setArticle(prev => prev ? { ...prev, status } : null);
      
      toast({
        description: `Article has been ${status}.`
      });
    } catch (error: any) {
      toast({
        description: `Error updating status: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  // Check user has admin or editor role
  const canEdit = hasRole('admin') || (hasRole as any)('editor');
  const canDelete = hasRole('admin');
  
  const handleDelete = async () => {
    if (!article) return;
    
    try {
      if (!window.confirm("Are you sure you want to delete this article?")) {
        return;
      }
      
      // Delete from the appropriate table based on category
      let error;
      
      if (article.category === 'printer') {
        const result = await supabase
          .from('wiki_printers')
          .delete()
          .eq('id', article.id);
        error = result.error;
      } else if (article.category === 'toner') {
        const result = await supabase
          .from('wiki_toners')
          .delete()
          .eq('id', article.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('wiki_articles')
          .delete()
          .eq('id', article.id);
        error = result.error;
      }
      
      if (error) throw error;
      
      toast({
        description: "Article has been successfully deleted."
      });
      
      navigate('/wiki');
    } catch (error: any) {
      toast({
        description: `Error deleting article: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading article...</div>;
  }
  
  if (!article) {
    return <div className="text-center py-8">Article not found.</div>;
  }
  
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-2xl font-bold">
            {article.title}
          </CardTitle>
          <div className="space-x-2">
            <StatusBadge status={article.status} />
            <Button variant="ghost" size="sm" onClick={() => navigate('/wiki')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Wiki
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="py-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Content</h3>
            <p className="whitespace-pre-line">{article.content}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Category</h3>
            <p>{article.category}</p>
          </div>
          
          {article.tags && article.tags.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <Badge key={index}>{tag}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {article.associated_with && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Associated With</h3>
              <p>{article.associated_with}</p>
            </div>
          )}
          
          {article.videoUrl && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Video URL</h3>
              <a href={article.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {article.videoUrl}
              </a>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            Created At: {new Date(article.created_at).toLocaleDateString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Updated At: {new Date(article.updated_at).toLocaleDateString()}
          </div>
        </CardContent>
        
        {canEdit && (
          <div className="flex justify-end space-x-2 p-4">
            {article.category === 'article' && article.status === 'pending' && (
              <Button variant="ghost" size="sm" onClick={() => updateArticleStatus('published')}>
                <Check className="h-4 w-4 mr-2" />
                Publish
              </Button>
            )}
            {article.category === 'article' && article.status === 'pending' && (
              <Button variant="ghost" size="sm" onClick={() => updateArticleStatus('rejected')}>
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (article.category === 'printer') {
                  navigate(`/wiki/edit/${article.id}`);
                } else if (article.category === 'article' || article.category === 'maintenance') {
                  navigate(`/wiki/edit/${article.id}`);
                } else {
                  toast({
                    description: "Editing this type of entry is not yet supported",
                  });
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {canDelete && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
