
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WikiArticle, ArticleStatus } from "@/types/types";
import { useToast } from "@/hooks/use-toast";

export function useWikiArticles() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Fetch all articles
  const fetchArticles = useCallback(async (): Promise<WikiArticle[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("wiki_articles")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      console.log("Fetched wiki articles:", data);
      return data || [];
    } catch (err: any) {
      toast({ description: `Error fetching articles: ${err.message}`, variant: "destructive" });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch article by id
  const fetchArticle = useCallback(async (id: string): Promise<WikiArticle | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("wiki_articles")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      console.log("Fetched single wiki article:", data);
      return data || null;
    } catch (err: any) {
      toast({ description: `Error fetching article: ${err.message}`, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create article
  const createArticle = useCallback(async (article: Omit<WikiArticle, "id" | "created_at" | "updated_at">) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("wiki_articles")
        .insert([{ ...article, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);
      if (error) throw error;
      toast({ description: "Article created!" });
      return data;
    } catch (err: any) {
      toast({ description: `Error creating article: ${err.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update article status
  const updateStatus = useCallback(async (id: string, status: ArticleStatus) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("wiki_articles")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast({ description: `Status updated to ${status}` });
      return true;
    } catch (err: any) {
      toast({ description: `Failed to update status: ${err.message}`, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update article
  const updateArticle = useCallback(async (id: string, updates: Partial<WikiArticle>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("wiki_articles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast({ description: "Article updated." });
      return true;
    } catch (err: any) {
      toast({ description: `Failed to update: ${err.message}`, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Delete article
  const deleteArticle = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.from("wiki_articles").delete().eq("id", id);
      if (error) throw error;
      toast({ description: "Article deleted." });
      return true;
    } catch (err: any) {
      toast({ description: `Failed to delete: ${err.message}`, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchArticles,
    fetchArticle,
    createArticle,
    updateArticle,
    updateStatus,
    deleteArticle,
  };
}
