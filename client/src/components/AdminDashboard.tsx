
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { BoardingSchool, BlogPost, CreateBoardingSchoolInput, CreateBlogPostInput, Region, CostRange } from '../../../server/src/schema';

export function AdminDashboard() {
  const [schools, setSchools] = useState<BoardingSchool[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // School form state
  const [schoolForm, setSchoolForm] = useState<CreateBoardingSchoolInput>({
    name: '',
    description: '',
    region: 'england',
    cost_range: '20000',
    website_url: null,
    contact_email: null,
    contact_phone: null,
    address: null,
    profile_content: null,
    is_featured: false,
    sports: [],
    scholarships: []
  });

  // Blog form state
  const [blogForm, setBlogForm] = useState<CreateBlogPostInput>({
    title: '',
    slug: '',
    content: '',
    excerpt: null,
    featured_image_url: null,
    is_published: false,
    author_id: 1 // Hardcoded for demo
  });

  // Load data
  const loadSchools = useCallback(async () => {
    try {
      const result = await trpc.getBoardingSchools.query();
      setSchools(result);
    } catch (error) {
      console.error('Fehler beim Laden der Internate:', error);
    }
  }, []);

  const loadBlogPosts = useCallback(async () => {
    try {
      const result = await trpc.getBlogPosts.query({ published_only: false, limit: 50, offset: 0 });
      setBlogPosts(result);
    } catch (error) {
      console.error('Fehler beim Laden der Blog-Artikel:', error);
    }
  }, []);

  useEffect(() => {
    loadSchools();
    loadBlogPosts();
  }, [loadSchools, loadBlogPosts]);

  // Handle school creation
  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await trpc.createBoardingSchool.mutate(schoolForm);
      setSchools(prev => [...prev, result]);
      // Reset form
      setSchoolForm({
        name: '',
        description: '',
        region: 'england',
        cost_range: '20000',
        website_url: null,
        contact_email: null,
        contact_phone: null,
        address: null,
        profile_content: null,
        is_featured: false,
        sports: [],
        scholarships: []
      });
    } catch (error) {
      console.error('Fehler beim Erstellen des Internats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle blog creation
  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await trpc.createBlogPost.mutate(blogForm);
      setBlogPosts(prev => [...prev, result]);
      // Reset form
      setBlogForm({
        title: '',
        slug: '',
        content: '',
        excerpt: null,
        featured_image_url: null,
        is_published: false,
        author_id: 1
      });
    } catch (error) {
      console.error('Fehler beim Erstellen des Blog-Artikels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchool = async (id: number) => {
    try {
      await trpc.deleteBoardingSchool.mutate(id);
      setSchools(prev => prev.filter(school => school.id !== id));
    } catch (error) {
      console.error('Fehler beim Löschen des Internats:', error);
    }
  };

  const handleDeleteBlog = async (id: number) => {
    try {
      await trpc.deleteBlogPost.mutate(id);
      setBlogPosts(prev => prev.filter(post => post.id !== id));
    } catch (error) {
      console.error('Fehler beim Löschen des Blog-Artikels:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ⚙️ Admin Dashboard
        </h2>
        <p className="text-lg text-gray-600">
          Verwalte Internate und Blog-Artikel
        </p>
      </div>

      <Tabs defaultValue="schools" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schools">🏫 Internate ({schools.length})</TabsTrigger>
          <TabsTrigger value="blog">📖 Blog ({blogPosts.length})</TabsTrigger>
        </TabsList>

        {/* Schools Management */}
        <TabsContent value="schools" className="space-y-6">
          {/* Create School Form */}
          <Card>
            <CardHeader>
              <CardTitle>Neues Internat erstellen</CardTitle>
              <CardDescription>
                Füge ein neues Internat zur Datenbank hinzu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSchool} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Name *
                    </label>
                    <Input
                      value={schoolForm.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSchoolForm(prev => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Internat Name"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Region *
                    </label>
                    <Select
                      value={schoolForm.region}
                      onValueChange={(value: Region) =>
                        setSchoolForm(prev => ({ ...prev, region: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Region auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="england">🏴󠁧󠁢󠁥󠁮󠁧󠁿 England</SelectItem>
                        <SelectItem value="scotland">🏴󠁧󠁢󠁳󠁣󠁴󠁿 Schottland</SelectItem>
                        <SelectItem value="northern_ireland">🇬🇧 Nordirland</SelectItem>
                        <SelectItem value="wales">🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Beschreibung *
                  </label>
                  <Textarea
                    value={schoolForm.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setSchoolForm(prev => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Kurze Beschreibung des Internats"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Kostenbereich
                    </label>
                    <Select
                      value={schoolForm.cost_range}
                      onValueChange={(value: CostRange) =>
                        setSchoolForm(prev => ({ ...prev, cost_range: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kostenbereich auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20000">€20.000 - €30.000</SelectItem>
                        <SelectItem value="30000">€30.000 - €40.000</SelectItem>
                        <SelectItem value="40000">€40.000 - €50.000</SelectItem>
                        <SelectItem value="50000">€50.000 - €60.000</SelectItem>
                        <SelectItem value="60000">€60.000 - €70.000</SelectItem>
                        <SelectItem value="70000">€70.000 - €80.000</SelectItem>
                        <SelectItem value="80000">€80.000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Website URL
                    </label>
                    <Input
                      type="url"
                      value={schoolForm.website_url || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSchoolForm(prev => ({ ...prev, website_url: e.target.value || null }))
                      }
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Kontakt E-Mail
                    </label>
                    <Input
                      type="email"
                      value={schoolForm.contact_email || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSchoolForm(prev => ({ ...prev, contact_email: e.target.value || null }))
                      }
                      placeholder="contact@school.edu"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Telefon
                    </label>
                    <Input
                      value={schoolForm.contact_phone || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSchoolForm(prev => ({ ...prev, contact_phone: e.target.value || null }))
                      }
                      placeholder="+44 123 456 7890"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Adresse
                  </label>
                  <Textarea
                    value={schoolForm.address || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setSchoolForm(prev => ({ ...prev, address: e.target.value || null }))
                    }
                    placeholder="Vollständige Adresse"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Detaillierte Profilinhalte (HTML)
                  </label>
                  <Textarea
                    value={schoolForm.profile_content || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setSchoolForm(prev => ({ ...prev, profile_content: e.target.value || null }))
                    }
                    placeholder="<h2>Über das Internat</h2><p>Detaillierte Beschreibung...</p>"
                    rows={6}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={schoolForm.is_featured}
                    onCheckedChange={(checked) =>
                      setSchoolForm(prev => ({ ...prev, is_featured: checked as boolean }))
                    }
                  />
                  <label htmlFor="featured" className="text-sm font-medium">
                    Als empfohlenes Internat markieren
                  </label>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Erstelle...' : 'Internat erstellen'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Schools List */}
          <Card>
            <CardHeader>
              <CardTitle>Verwaltete Internate</CardTitle>
              <CardDescription>
                Übersicht aller Internate in der Datenbank
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schools.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Noch keine Internate erstellt.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {schools.map((school: BoardingSchool) => (
                    <div key={school.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{school.name}</h3>
                          {school.is_featured && (
                            <Badge className="bg-yellow-400 text-yellow-900">⭐ Empfohlen</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{school.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>📍 {school.region}</span>
                          <span>💰 {school.cost_range}</span>
                          <span>📅 {school.created_at.toLocaleDateString('de-DE')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Löschen
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Internat löschen</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bist du sicher, dass du "{school.name}" löschen möchtest? 
                                Diese Aktion kann nicht rückgängig gemacht werden.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteSchool(school.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Löschen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blog Management */}
        <TabsContent value="blog" className="space-y-6">
          {/* Create Blog Form */}
          <Card>
            <CardHeader>
              <CardTitle>Neuen Blog-Artikel erstellen</CardTitle>
              <CardDescription>
                Erstelle einen neuen Artikel für den Blog-Bereich
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateBlog} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Titel *
                    </label>
                    <Input
                      value={blogForm.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setBlogForm(prev => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Artikel Titel"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Slug *
                    </label>
                    <Input
                      value={blogForm.slug}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setBlogForm(prev => ({ ...prev, slug: e.target.value }))
                      }
                      placeholder="artikel-slug"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Kurzbeschreibung
                  </label>
                  <Textarea
                    value={blogForm.excerpt || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setBlogForm(prev => ({ ...prev, excerpt: e.target.value || null }))
                    }
                    placeholder="Kurze Zusammenfassung des Artikels"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Inhalt *
                  </label>
                  <Textarea
                    value={blogForm.content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setBlogForm(prev => ({ ...prev, content: e.target.value }))
                    }
                    placeholder="Vollständiger Artikel-Inhalt (HTML unterstützt)"
                    rows={8}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Titelbild URL
                  </label>
                  <Input
                    type="url"
                    value={blogForm.featured_image_url || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setBlogForm(prev => ({ ...prev, featured_image_url: e.target.value || null }))
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="published"
                    checked={blogForm.is_published}
                    onCheckedChange={(checked) =>
                      setBlogForm(prev => ({ ...prev, is_published: checked as boolean }))
                    }
                  />
                  <label htmlFor="published" className="text-sm font-medium">
                    Artikel veröffentlichen
                  </label>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Erstelle...' : 'Artikel erstellen'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Blog Posts List */}
          <Card>
            <CardHeader>
              <CardTitle>Blog-Artikel</CardTitle>
              <CardDescription>
                Übersicht aller Blog-Artikel
              </CardDescription>
            </CardHeader>
            <CardContent>
              {blogPosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Noch keine Blog-Artikel erstellt.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {blogPosts.map((post: BlogPost) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{post.title}</h3>
                          <Badge variant={post.is_published ? 'default' : 'secondary'}>
                            {post.is_published ? 'Veröffentlicht' : 'Entwurf'}
                          </Badge>
                        </div>
                        {post.excerpt && (
                          <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>🔗 {post.slug}</span>
                          <span>👤 Autor {post.author_id}</span>
                          <span>📅 {post.created_at.toLocaleDateString('de-DE')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Löschen
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Artikel löschen</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bist du sicher, dass du "{post.title}" löschen möchtest?
                                Diese Aktion kann nicht rückgängig gemacht werden.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteBlog(post.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Löschen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
