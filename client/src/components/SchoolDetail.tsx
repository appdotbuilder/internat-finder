
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { BoardingSchool } from '../../../server/src/schema';

interface SchoolDetailProps {
  school: BoardingSchool;
  onBack: () => void;
}

const REGION_LABELS = {
  england: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',
  scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Schottland',
  northern_ireland: '🇬🇧 Nordirland',
  wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales'
};

const COST_LABELS = {
  '20000': '€20.000 - €30.000',
  '30000': '€30.000 - €40.000',
  '40000': '€40.000 - €50.000',
  '50000': '€50.000 - €60.000',
  '60000': '€60.000 - €70.000',
  '70000': '€70.000 - €80.000',
  '80000': '€80.000+'
};

export function SchoolDetail({ school, onBack }: SchoolDetailProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              ← Zurück zur Übersicht
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{school.name}</h1>
              <p className="text-sm text-gray-600">{REGION_LABELS[school.region]}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{school.name}</CardTitle>
                    <CardDescription className="text-lg mt-2">
                      {school.description}
                    </CardDescription>
                  </div>
                  {school.is_featured && (
                    <Badge className="bg-yellow-400 text-yellow-900">
                      ⭐ Empfohlen
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Profile Content */}
            {school.profile_content && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📋 Detailierte Informationen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: school.profile_content }}
                
                  />
                </CardContent>
              </Card>
            )}

            {/* Placeholder for Sports and Scholarships */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🏃 Sportprogramme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Sport-Informationen werden über die API geladen.
                    {/* STUB: In der echten Anwendung würden hier die Sportarten aus school_sports angezeigt */}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🎓 Stipendien
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Stipendien-Informationen werden über die API geladen.
                    {/* STUB: In der echten Anwendung würden hier die Stipendien aus school_scholarships angezeigt */}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Kurzinfo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Region</div>
                  <div className="text-sm text-gray-900">{REGION_LABELS[school.region]}</div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm font-medium text-gray-700">Kosten pro Jahr</div>
                  <div className="text-sm text-gray-900 font-semibold">
                    {COST_LABELS[school.cost_range]}
                  </div>
                </div>

                {school.address && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm font-medium text-gray-700">Adresse</div>
                      <div className="text-sm text-gray-900">{school.address}</div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📞 Kontakt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {school.contact_email && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">E-Mail</div>
                    <a 
                      href={`mailto:${school.contact_email}`}
                      className="text-sm text-blue-600 hover:text-blue-800 break-all"
                    >
                      {school.contact_email}
                    </a>
                  </div>
                )}

                {school.contact_phone && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">Telefon</div>
                    <a 
                      href={`tel:${school.contact_phone}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {school.contact_phone}
                    </a>
                  </div>
                )}

                {school.website_url && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">Website</div>
                    <a 
                      href={school.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 break-all"
                    >
                      {school.website_url}
                    </a>
                  </div>
                )}

                <Separator />

                <Button className="w-full" asChild>
                  <a 
                    href={`mailto:${school.contact_email || 'info@school.edu'}?subject=Interesse an ${school.name}`}
                    className="flex items-center gap-2"
                  >
                    📧 Kontakt aufnehmen
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ℹ️ Weitere Informationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-gray-500">
                  Erstellt: {school.created_at.toLocaleDateString('de-DE')}
                </div>
                <div className="text-xs text-gray-500">
                  Aktualisiert: {school.updated_at.toLocaleDateString('de-DE')}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
