
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BlogPost } from '../../../server/src/schema';

interface BlogListProps {
  blogPosts: BlogPost[];
}

export function BlogList({ blogPosts }: BlogListProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          📖 Blog & Ratgeber
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Hilfreiche Artikel und Tipps rund um britische Internate, Bewerbungsverfahren und das Leben im Ausland.
        </p>
      </div>

      {blogPosts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Noch keine Blog-Artikel
            </h3>
            <p className="text-gray-600">
              Blog-Artikel werden bald verfügbar sein. Schaue später wieder vorbei!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post: BlogPost) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              {post.featured_image_url && (
                <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  <img 
                    src={post.featured_image_url} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                  {post.is_published && (
                    <Badge variant="secondary" className="text-xs">
                      Veröffentlicht
                    </Badge>
                  )}
                </div>
                {post.excerpt && (
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Autor ID: {post.author_id}</span>
                  <span>{post.created_at.toLocaleDateString('de-DE')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
