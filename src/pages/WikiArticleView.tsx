import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { WikiArticleType } from "@/types/types";
import { useToast } from "@/hooks/use-toast";

// Utility to extract the YouTube video ID from various link formats
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const match =
    url.match(/(?:youtube\.com.*(?:\/|v=)|youtu\.be\/)([^&\n?#]+)/i) ||
    url.match(/embed\/([^\?&"\'>]+)/i);
  return match ? match[1] : null;
}

// Facebook Comments section
const FacebookComments = ({ url }: { url: string }) => {
  React.useEffect(() => {
    // Load FB SDK script only once per page
    const id = "fb-root";
    if (!document.getElementById(id)) {
      const div = document.createElement("div");
      div.id = id;
      document.body.appendChild(div);
    }
    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v16.0";
      document.body.appendChild(script);
    } else if ((window as any).FB) {
      (window as any).FB.XFBML.parse();
    }
  }, []);
  return (
    <div className="mt-4">
      <div
        className="fb-comments"
        data-href={url}
        data-width="100%"
        data-numposts="5"
      ></div>
    </div>
  );
};

export default function WikiArticleView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [article, setArticle] = React.useState<WikiArticleType | null>(
    location.state?.article || null
  );
  const [loading, setLoading] = React.useState(!location.state?.article);

  // If no article passed in location state, fetch it
  React.useEffect(() => {
    if (!article && id) {
      fetchArticle(id);
    }
  }, [id, article]);

  const fetchArticle = async (articleId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Map database fields to our WikiArticleType
        const mappedArticle: WikiArticleType = {
          id: data.id,
          title: data.title,
          content: data.content,
          category: data.category,
          tags: data.tags || [],
          created_at: data.created_at,
          updated_at: data.updated_at,
          associated_with: data.associated_with || '',
          status: 'published' as ArticleStatus,
          submitted_by: data.submitted_by || '',
          videoUrl: data.video_url || '', // Map video_url to videoUrl
        };
        setArticle(mappedArticle);
      }
    } catch (error: any) {
      console.error('Error fetching article:', error);
      toast({
        title: 'Error fetching article',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Article not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/wiki")}>Back to Wiki</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ytId = getYouTubeId(article.videoUrl || "");

  return (
    <div className="container max-w-xl mx-auto py-4 pb-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{article.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 text-muted-foreground text-sm">
            {article.tags?.map((t: string) => (
              <span key={t} className="inline-block bg-gray-200 px-2 rounded mr-1">{t}</span>
            ))}
          </div>
          <div className="mb-2 text-muted-foreground text-xs">
            Category: {article.category}
          </div>
          {ytId && (
            <div className="my-4">
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${ytId}`}
                title="YouTube video"
                frameBorder={0}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          <div className="prose">{article.content}</div>
          <div className="mt-6">
            Associated Printer: <span className="font-semibold">{article.associated_with || "None"}</span>
          </div>
        </CardContent>
      </Card>
      <FacebookComments url={window.location.href} />
      <div className="mt-4 flex justify-end">
        <Button onClick={() => navigate("/wiki")}>Back to Wiki</Button>
      </div>
    </div>
  );
}
