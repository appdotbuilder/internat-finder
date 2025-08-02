
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { SportType, ScholarshipType, Region, CostRange } from '../../../server/src/schema';

interface SchoolFiltersProps {
  selectedSports: SportType[];
  selectedScholarships: ScholarshipType[];
  selectedRegions: Region[];
  selectedCostRanges: CostRange[];
  searchTerm: string;
  onSportsChange: (sports: SportType[]) => void;
  onScholarshipsChange: (scholarships: ScholarshipType[]) => void;
  onRegionsChange: (regions: Region[]) => void;
  onCostRangesChange: (costRanges: CostRange[]) => void;
  onSearchChange: (search: string) => void;
  onFilterChange: () => void;
}

const SPORT_LABELS: Record<SportType, string> = {
  football: '⚽ Fußball',
  rugby: '🏉 Rugby',
  swimming: '🏊 Schwimmen',
  tennis: '🎾 Tennis',
  hockey: '🏑 Hockey',
  rowing: '🚣 Rudern'
};

const SCHOLARSHIP_LABELS: Record<ScholarshipType, string> = {
  sports_scholarship: '🏆 Sportstipendium',
  partial_scholarship: '📚 Teilstipendium',
  full_scholarship: '🎓 Vollstipendium'
};

const REGION_LABELS: Record<Region, string> = {
  england: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',
  scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Schottland',
  northern_ireland: '🇬🇧 Nordirland',
  wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales'
};

const COST_LABELS: Record<CostRange, string> = {
  '20000': '€20.000 - €30.000',
  '30000': '€30.000 - €40.000',
  '40000': '€40.000 - €50.000',
  '50000': '€50.000 - €60.000',
  '60000': '€60.000 - €70.000',
  '70000': '€70.000 - €80.000',
  '80000': '€80.000+'
};

export function SchoolFilters({
  selectedSports,
  selectedScholarships,
  selectedRegions,
  selectedCostRanges,
  searchTerm,
  onSportsChange,
  onScholarshipsChange,
  onRegionsChange,
  onCostRangesChange,
  onSearchChange,
  onFilterChange
}: SchoolFiltersProps) {
  const handleSportToggle = (sport: SportType) => {
    const newSports = selectedSports.includes(sport)
      ? selectedSports.filter(s => s !== sport)
      : [...selectedSports, sport];
    onSportsChange(newSports);
  };

  const handleScholarshipToggle = (scholarship: ScholarshipType) => {
    const newScholarships = selectedScholarships.includes(scholarship)
      ? selectedScholarships.filter(s => s !== scholarship)
      : [...selectedScholarships, scholarship];
    onScholarshipsChange(newScholarships);
  };

  const handleRegionToggle = (region: Region) => {
    const newRegions = selectedRegions.includes(region)
      ? selectedRegions.filter(r => r !== region)
      : [...selectedRegions, region];
    onRegionsChange(newRegions);
  };

  const handleCostRangeToggle = (costRange: CostRange) => {
    const newCostRanges = selectedCostRanges.includes(costRange)
      ? selectedCostRanges.filter(c => c !== costRange)
      : [...selectedCostRanges, costRange];
    onCostRangesChange(newCostRanges);
  };

  const clearAllFilters = () => {
    onSportsChange([]);
    onScholarshipsChange([]);
    onRegionsChange([]);
    onCostRangesChange([]);
    onSearchChange('');
  };

  const hasActiveFilters = selectedSports.length > 0 || selectedScholarships.length > 0 || 
                          selectedRegions.length > 0 || selectedCostRanges.length > 0 || searchTerm;

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">🔍 Filter</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Zurücksetzen
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Suche
          </label>
          <Input
            placeholder="Internat suchen..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>

        <Separator />

        {/* Sports Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Sportarten {selectedSports.length > 0 && (
              <Badge variant="secondary" className="ml-2">{selectedSports.length}</Badge>
            )}
          </label>
          <div className="space-y-2">
            {Object.entries(SPORT_LABELS).map(([sport, label]) => (
              <div key={sport} className="flex items-center space-x-2">
                <Checkbox
                  id={`sport-${sport}`}
                  checked={selectedSports.includes(sport as SportType)}
                  onCheckedChange={() => handleSportToggle(sport as SportType)}
                />
                <label
                  htmlFor={`sport-${sport}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Scholarships Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Stipendien {selectedScholarships.length > 0 && (
              <Badge variant="secondary" className="ml-2">{selectedScholarships.length}</Badge>
            )}
          </label>
          <div className="space-y-2">
            {Object.entries(SCHOLARSHIP_LABELS).map(([scholarship, label]) => (
              <div key={scholarship} className="flex items-center space-x-2">
                <Checkbox
                  id={`scholarship-${scholarship}`}
                  checked={selectedScholarships.includes(scholarship as ScholarshipType)}
                  onCheckedChange={() => handleScholarshipToggle(scholarship as ScholarshipType)}
                />
                <label
                  htmlFor={`scholarship-${scholarship}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Regions Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Regionen {selectedRegions.length > 0 && (
              <Badge variant="secondary" className="ml-2">{selectedRegions.length}</Badge>
            )}
          </label>
          <div className="space-y-2">
            {Object.entries(REGION_LABELS).map(([region, label]) => (
              <div key={region} className="flex items-center space-x-2">
                <Checkbox
                  id={`region-${region}`}
                  checked={selectedRegions.includes(region as Region)}
                  onCheckedChange={() => handleRegionToggle(region as Region)}
                />
                <label
                  htmlFor={`region-${region}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Cost Range Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Kosten pro Jahr {selectedCostRanges.length > 0 && (
              <Badge variant="secondary" className="ml-2">{selectedCostRanges.length}</Badge>
            )}
          </label>
          <div className="space-y-2">
            {Object.entries(COST_LABELS).map(([costRange, label]) => (
              <div key={costRange} className="flex items-center space-x-2">
                <Checkbox
                  id={`cost-${costRange}`}
                  checked={selectedCostRanges.includes(costRange as CostRange)}
                  onCheckedChange={() => handleCostRangeToggle(costRange as CostRange)}
                />
                <label
                  htmlFor={`cost-${costRange}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={onFilterChange} className="w-full">
          Filter anwenden
        </Button>
      </CardContent>
    </Card>
  );
}
