import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ExternalLink, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LinkPreviewData {
  title: string;
  description: string;
  image: string | null;
  url: string;
  siteName: string | null;
}

interface LinkPreviewProps {
  url: string;
}

export const LinkPreview = ({ url }: LinkPreviewProps) => {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-link-preview', {
          body: { url }
        });

        if (error) {
          console.error('Error fetching link preview:', error);
          setError(true);
        } else {
          setPreview(data);
        }
      } catch (err) {
        console.error('Error fetching link preview:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (loading) {
    return (
      <Card className="max-w-sm p-3 mt-2 animate-pulse">
        <div className="flex space-x-3">
          <div className="w-16 h-16 bg-muted rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        </div>
      </Card>
    );
  }

  if (error || !preview) {
    return (
      <Card className="max-w-sm p-3 mt-2 border border-muted">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Globe className="w-4 h-4" />
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm hover:underline truncate flex-1"
          >
            {url}
          </a>
          <ExternalLink className="w-3 h-3" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-sm mt-2 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <a 
        href={preview.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        {preview.image && (
          <div className="w-full h-32 overflow-hidden">
            <img 
              src={preview.image} 
              alt={preview.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2 mb-1">
                {preview.title}
              </h4>
              {preview.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {preview.description}
                </p>
              )}
              <div className="flex items-center text-xs text-muted-foreground">
                <Globe className="w-3 h-3 mr-1" />
                <span className="truncate">
                  {preview.siteName || new URL(preview.url).hostname}
                </span>
              </div>
            </div>
            <ExternalLink className="w-3 h-3 ml-2 flex-shrink-0" />
          </div>
        </div>
      </a>
    </Card>
  );
};