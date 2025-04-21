
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
      const { data, error } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
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
      
      const { error } = await supabase
        .from('wiki_articles')
        .delete()
        .eq('id', article.id);
      
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
            <p>{article.content}</p>
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
            {article.status === 'pending' && (
              <Button variant="ghost" size="sm" onClick={() => updateArticleStatus('published')}>
                <Check className="h-4 w-4 mr-2" />
                Publish
              </Button>
            )}
            {article.status === 'pending' && (
              <Button variant="ghost" size="sm" onClick={() => updateArticleStatus('rejected')}>
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate(`/wiki/edit/${article.id}`)}>
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
