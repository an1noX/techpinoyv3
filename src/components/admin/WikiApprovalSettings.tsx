
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { WikiArticleType } from '@/types/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileText, Check, X, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export function WikiApprovalSettings() {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [pendingArticles, setPendingArticles] = useState<WikiArticleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const isAdmin = hasRole('admin');

  useEffect(() => {
    if (isAdmin) {
      fetchWikiSettings();
      fetchPendingArticles();
    }
  }, [isAdmin]);

  const fetchWikiSettings = async () => {
    try {
      setSettingsLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'wiki_requires_approval')
        .single();

      if (error) throw error;

      setRequiresApproval(data.value === true || data.value === 'true');
    } catch (error: any) {
      console.error('Error fetching wiki settings:', error);
      toast({
        title: 'Error fetching settings',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  const fetchPendingArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('status', 'pending');

      if (error) throw error;

      // Convert the data to match the WikiArticleType
      const typedArticles = (data || []).map(article => ({
        ...article,
        // Ensure status is the right type
        status: article.status as 'published' | 'pending' | 'rejected',
        videoUrl: article.video_url // Map video_url to videoUrl
      })) as WikiArticleType[];

      setPendingArticles(typedArticles);
    } catch (error: any) {
      console.error('Error fetching pending articles:', error);
      toast({
        title: 'Error fetching pending articles',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateWikiApprovalSetting = async (value: boolean) => {
    try {
      setSettingsLoading(true);
      const { error } = await supabase
        .from('app_settings')
        .update({ value: value })
        .eq('key', 'wiki_requires_approval');

      if (error) throw error;

      setRequiresApproval(value);
      toast({
        title: 'Settings updated',
        description: `Wiki article approval is now ${value ? 'required' : 'not required'}.`
      });
    } catch (error: any) {
      toast({
        title: 'Error updating settings',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleApproveArticle = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from('wiki_articles')
        .update({ status: 'published' })
        .eq('id', articleId);

      if (error) throw error;

      setPendingArticles(pendingArticles.filter(article => article.id !== articleId));
      toast({
        title: 'Article approved',
        description: 'The wiki article has been published successfully.'
      });
    } catch (error: any) {
      toast({
        title: 'Error approving article',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleRejectArticle = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from('wiki_articles')
        .update({ status: 'rejected' })
        .eq('id', articleId);

      if (error) throw error;

      setPendingArticles(pendingArticles.filter(article => article.id !== articleId));
      toast({
        title: 'Article rejected',
        description: 'The wiki article has been rejected.'
      });
    } catch (error: any) {
      toast({
        title: 'Error rejecting article',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="settings">
      <TabsList className="mb-6">
        <TabsTrigger value="settings">General Settings</TabsTrigger>
        <TabsTrigger value="pending">
          Pending Articles
          {pendingArticles.length > 0 && (
            <Badge className="ml-2" variant="destructive">
              {pendingArticles.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Wiki Approval Settings</CardTitle>
            <CardDescription>
              Configure approval requirements for technician-submitted Wiki articles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="wiki-approval">Require Admin Approval</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, technician-submitted Wiki articles will require admin approval before being published.
                </p>
              </div>
              <Switch
                id="wiki-approval"
                checked={requiresApproval}
                onCheckedChange={updateWikiApprovalSetting}
                disabled={settingsLoading}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="pending">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pending Wiki Articles
            </CardTitle>
            <CardDescription>
              Review and approve or reject articles submitted by technicians
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : pendingArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending articles to review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingArticles.map((article) => (
                  <Card key={article.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle>{article.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge>{article.category}</Badge>
                        {article.tags && article.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {article.content.substring(0, 200)}...
                      </p>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleRejectArticle(article.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-500 border-green-200 hover:bg-green-50 hover:text-green-600"
                          onClick={() => handleApproveArticle(article.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
