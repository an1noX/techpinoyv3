import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WikiArticle } from '@/types/types';

const articleFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  content: z.string().min(10, { message: 'Content must be at least 10 characters' }),
  category: z.string().min(1, { message: 'Category is required' }),
  tags: z.array(z.string()).optional(),
  associated_with: z.string().optional(),
  videoUrl: z.string().optional(),
});

type ArticleFormValues = z.infer<typeof articleFormSchema>;

interface WikiAddArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function WikiAddArticleDialog({ open, onOpenChange, onSuccess }: WikiAddArticleDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: '',
      content: '',
      category: '',
      tags: [],
      associated_with: '',
      videoUrl: ''
    }
  });
  
  const onSubmit = async (data: ArticleFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create the article object with all required fields
      const articleData: WikiArticle = {
        id: crypto.randomUUID(),
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        associated_with: data.associated_with,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        videoUrl: data.videoUrl
      };
      
      const { error } = await supabase
        .from('wiki_articles')
        .insert(articleData);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Article created successfully',
        className: 'bg-green-500',
        duration: 3000
      });
      
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Wiki Article</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Article Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Article Content" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="printers">Printers</SelectItem>
                      <SelectItem value="toners">Toners</SelectItem>
                      <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="associated_with"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associated With</FormLabel>
                  <FormControl>
                    <Input placeholder="Associated Printer Model" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input placeholder="YouTube or Vimeo URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Add Article'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
