
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchoolFilters } from '@/components/SchoolFilters';
import { SchoolCard } from '@/components/SchoolCard';
import { SchoolDetail } from '@/components/SchoolDetail';
import { BlogList } from '@/components/BlogList';
import { AdminDashboard } from '@/components/AdminDashboard';
import type { BoardingSchool, BlogPost, FilterSchoolsInput, SportType, ScholarshipType, Region, CostRange } from '../../server/src/schema';

function App() {
  const [activeTab, setActiveTab] = useState<string>('discover');
  const [schools, setSchools] = useState<BoardingSchool[]>([]);
  const [featuredSchools, setFeaturedSchools] = useState<BoardingSchool[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<BoardingSchool | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter states
  const [selectedSports, setSelectedSports] = useState<SportType[]>([]);
  const [selectedScholarships, setSelectedScholarships] = useState<ScholarshipType[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<Region[]>([]);
  const [selectedCostRanges, setSelectedCostRanges] = useState<CostRange[]>([]);

  // Load featured schools for homepage
  const loadFeaturedSchools = useCallback(async () => {
    try {
      const result = await trpc.getFeaturedSchools.query();
      setFeaturedSchools(result);
    } catch (error) {
      console.error('Fehler beim Laden der empfohlenen Internate:', error);
    }
  }, []);

  // Load schools with filters
  const loadSchools = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: FilterSchoolsInput = {
        sports: selectedSports.length > 0 ? selectedSports : undefined,
        scholarships: selectedScholarships.length > 0 ? selectedScholarships : undefined,
        regions: selectedRegions.length > 0 ? selectedRegions : undefined,
        cost_ranges: selectedCostRanges.length > 0 ? selectedCostRanges : undefined,
        search: searchTerm || undefined,
        limit: 20,
        offset: 0
      };
      const result = await trpc.getBoardingSchools.query(filters);
      setSchools(result);
    } catch (error) {
      console.error('Fehler beim Laden der Internate:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSports, selectedScholarships, selectedRegions, selectedCostRanges, searchTerm]);

  // Load blog posts
  const loadBlogPosts = useCallback(async () => {
    try {
      const result = await trpc.getBlogPosts.query({ published_only: true, limit: 10, offset: 0 });
      setBlogPosts(result);
    } catch (error) {
      console.error('Fehler beim Laden der Blog-Artikel:', error);
    }
  }, []);

  useEffect(() => {
    loadFeaturedSchools();
    loadBlogPosts();
  }, [loadFeaturedSchools, loadBlogPosts]);

  useEffect(() => {
    if (activeTab === 'discover') {
      loadSchools();
    }
  }, [activeTab, loadSchools]);

  const handleFilterChange = useCallback(() => {
    loadSchools();
  }, [loadSchools]);

  if (selectedSchool) {
    return (
      <SchoolDetail 
        school={selectedSchool} 
        onBack={() => setSelectedSchool(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏫</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">British Sports Boarding Schools</h1>
                <p className="text-sm text-gray-600">Finde dein perfektes Sportinternat in Großbritannien</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <span>🏠</span> Startseite
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <span>🔍</span> Internate entdecken
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <span>📖</span> Blog
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <span>⚙️</span> Admin
            </TabsTrigger>
          </TabsList>

          {/* Homepage */}
          <TabsContent value="home" className="space-y-8">
            <div className="text-center py-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Entdecke britische Sportinternate 🏆
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Finde das perfekte Internat für deine sportlichen Ambitionen. Von Fußball bis Rudern - 
                entdecke erstklassige Bildungseinrichtungen mit exzellenten Sportprogrammen.
              </p>
              <Button 
                size="lg" 
                onClick={() => setActiveTab('discover')}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                Jetzt Internate entdecken 🚀
              </Button>
            </div>

            {/* Featured Schools */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>⭐</span> Empfohlene Internate
              </h3>
              {featuredSchools.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-gray-500">Noch keine empfohlenen Internate vorhanden.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredSchools.map((school: BoardingSchool) => (
                    <SchoolCard 
                      key={school.id} 
                      school={school} 
                      onSelect={setSelectedSchool}
                      featured={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-blue-600">6</div>
                <div className="text-sm text-gray-600">Sportarten</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-green-600">4</div>
                <div className="text-sm text-gray-600">Regionen</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-purple-600">3</div>
                <div className="text-sm text-gray-600">Stipendienarten</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-orange-600">7</div>
                <div className="text-sm text-gray-600">Kostenbereiche</div>
              </Card>
            </div>
          </TabsContent>

          {/* Discover Schools */}
          <TabsContent value="discover" className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Filters Sidebar */}
              <div className="lg:w-1/4">
                <SchoolFilters
                  selectedSports={selectedSports}
                  selectedScholarships={selectedScholarships}
                  selectedRegions={selectedRegions}
                  selectedCostRanges={selectedCostRanges}
                  searchTerm={searchTerm}
                  onSportsChange={setSelectedSports}
                  onScholarshipsChange={setSelectedScholarships}
                  onRegionsChange={setSelectedRegions}
                  onCostRangesChange={setSelectedCostRanges}
                  onSearchChange={setSearchTerm}
                  onFilterChange={handleFilterChange}
                />
              </div>

              {/* Schools Grid */}
              <div className="lg:w-3/4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Internate entdecken {schools.length > 0 && `(${schools.length})`}
                  </h2>
                  {isLoading && (
                    <div className="text-sm text-gray-500">Lädt...</div>
                  )}
                </div>

                {schools.length === 0 && !isLoading ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Keine Internate gefunden
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Versuche andere Filterkriterien oder entferne einige Filter.
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSelectedSports([]);
                          setSelectedScholarships([]);
                          setSelectedRegions([]);
                          setSelectedCostRanges([]);
                          setSearchTerm('');
                        }}
                      >
                        Filter zurücksetzen
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {schools.map((school: BoardingSchool) => (
                      <SchoolCard 
                        key={school.id} 
                        school={school} 
                        onSelect={setSelectedSchool}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Blog */}
          <TabsContent value="blog">
            <BlogList blogPosts={blogPosts} />
          </TabsContent>

          {/* Admin Dashboard */}
          <TabsContent value="admin">
            <AdminDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
