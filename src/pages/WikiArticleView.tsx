
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWikiArticles } from '@/hooks/useWikiArticles';
import { WikiStatusBadge } from '@/components/wiki/WikiStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Edit, Trash2, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

export default function WikiArticleView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { fetchArticle, updateStatus, deleteArticle } = useWikiArticles();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const data = await fetchArticle(id);
      setArticle(data);
      setLoading(false);
    };
    load();
  }, [id, fetchArticle]);

  const canEdit = hasRole('admin') || (hasRole as any)('editor');
  const canDelete = hasRole('admin');

  const handlePublish = async () => {
    if (article && article.status === 'pending') {
      await updateStatus(article.id, 'published');
      setArticle({ ...article, status: 'published' });
    }
  };

  const handleReject = async () => {
    if (article && article.status === 'pending') {
      await updateStatus(article.id, 'rejected');
      setArticle({ ...article, status: 'rejected' });
    }
  };

  const handleDelete = async () => {
    if (!article) return;
    if (window.confirm('Are you sure you want to delete this article?')) {
      await deleteArticle(article.id);
      navigate('/wiki');
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
            <WikiStatusBadge status={article.status} />
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

          {article.video_url && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Video URL</h3>
              <a href={article.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {article.video_url}
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
              <>
                <Button variant="ghost" size="sm" onClick={handlePublish}>
                  <Check className="h-4 w-4 mr-2" />
                  Publish
                </Button>
                <Button variant="ghost" size="sm" onClick={handleReject}>
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/wiki/edit/${article.id}`)}
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
