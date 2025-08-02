
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BoardingSchool } from '../../../server/src/schema';

interface SchoolCardProps {
  school: BoardingSchool;
  onSelect: (school: BoardingSchool) => void;
  featured?: boolean;
}

const REGION_LABELS = {
  england: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',
  scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Schottland',
  northern_ireland: '🇬🇧 Nordirland',
  wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales'
};

const COST_LABELS = {
  '20000': '€20.000+',
  '30000': '€30.000+',
  '40000': '€40.000+',
  '50000': '€50.000+',
  '60000': '€60.000+',
  '70000': '€70.000+',
  '80000': '€80.000+'
};

export function SchoolCard({ school, onSelect, featured = false }: SchoolCardProps) {
  return (
    <Card 
      className={`hover:shadow-lg transition-shadow cursor-pointer relative ${
        featured ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
      }`}
      onClick={() => onSelect(school)}
    >
      {featured && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
          ⭐ Empfohlen
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{school.name}</CardTitle>
            <CardDescription className="mt-1">
              {REGION_LABELS[school.region]}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 line-clamp-3">
          {school.description}
        </p>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {COST_LABELS[school.cost_range]} / Jahr
          </Badge>
          {school.website_url && (
            <Badge variant="secondary" className="text-xs">
              🌐 Website
            </Badge>
          )}
        </div>

        {(school.contact_email || school.contact_phone) && (
          <div className="text-xs text-gray-500 space-y-1">
            {school.contact_email && (
              <div className="flex items-center gap-1">
                <span>📧</span>
                <span className="truncate">{school.contact_email}</span>
              </div>
            )}
            {school.contact_phone && (
              <div className="flex items-center gap-1">
                <span>📞</span>
                <span>{school.contact_phone}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onSelect(school);
          }}
        >
          Details ansehen →
        </Button>
      </CardFooter>
    </Card>
  );
}
