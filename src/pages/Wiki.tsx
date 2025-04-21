
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookText, Plus, Search, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WikiArticleType } from '@/types/types';
import { useAuth } from '@/hooks/useAuth';

export default function Wiki() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [articles, setArticles] = useState<WikiArticleType[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<WikiArticleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [searchTerm, activeTab, articles]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wiki_articles')
        .select('*');

      if (error) throw error;

      // Map the database response to your WikiArticleType
      const mappedArticles = data.map(article => ({
        id: article.id,
        title: article.title,
        content: article.content,
        category: article.category,
        tags: article.tags || [],
        created_at: article.created_at,
        updated_at: article.updated_at,
        associated_with: article.associated_with || '',
        status: article.status || 'published',
        submitted_by: article.submitted_by || '',
        videoUrl: article.video_url || '', // Map from video_url to videoUrl
      }));

      setArticles(mappedArticles);
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

  const canCreateArticle = hasPermission('create:wiki');

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Printer Wiki</h1>
        {canCreateArticle && (
          <Button onClick={() => navigate('/wiki/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Article
          </Button>
        )}
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
            <Link 
              to={`/wiki/article/${article.id}`} 
              state={{ article }} 
              key={article.id}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
