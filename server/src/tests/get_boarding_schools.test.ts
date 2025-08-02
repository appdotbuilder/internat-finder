
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { boardingSchoolsTable, schoolSportsTable, schoolScholarshipsTable, usersTable } from '../db/schema';
import { type FilterSchoolsInput } from '../schema';
import { getBoardingSchools } from '../handlers/get_boarding_schools';

describe('getBoardingSchools', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all schools when no filters applied', async () => {
    // Create test schools
    await db.insert(boardingSchoolsTable).values([
      {
        name: 'Eton College',
        description: 'Famous boarding school',
        region: 'england',
        cost_range: '80000',
        is_featured: true
      },
      {
        name: 'Fettes College',
        description: 'Scottish boarding school',
        region: 'scotland',
        cost_range: '60000',
        is_featured: false
      }
    ]);

    const result = await getBoardingSchools();

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('Eton College');
    expect(result[0].region).toEqual('england');
    expect(result[1].name).toEqual('Fettes College');
    expect(result[1].region).toEqual('scotland');
  });

  it('should filter schools by region', async () => {
    // Create test schools
    await db.insert(boardingSchoolsTable).values([
      {
        name: 'Eton College',
        description: 'Famous boarding school',
        region: 'england',
        cost_range: '80000',
        is_featured: true
      },
      {
        name: 'Fettes College',
        description: 'Scottish boarding school',
        region: 'scotland',
        cost_range: '60000',
        is_featured: false
      }
    ]);

    const filters: FilterSchoolsInput = {
      regions: ['england'],
      limit: 20,
      offset: 0
    };

    const result = await getBoardingSchools(filters);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Eton College');
    expect(result[0].region).toEqual('england');
  });

  it('should filter schools by cost range', async () => {
    // Create test schools
    await db.insert(boardingSchoolsTable).values([
      {
        name: 'Expensive School',
        description: 'Very expensive',
        region: 'england',
        cost_range: '80000',
        is_featured: true
      },
      {
        name: 'Affordable School',
        description: 'More affordable',
        region: 'england',
        cost_range: '30000',
        is_featured: false
      }
    ]);

    const filters: FilterSchoolsInput = {
      cost_ranges: ['30000'],
      limit: 20,
      offset: 0
    };

    const result = await getBoardingSchools(filters);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Affordable School');
    expect(result[0].cost_range).toEqual('30000');
  });

  it('should search schools by name and description', async () => {
    // Create test schools
    await db.insert(boardingSchoolsTable).values([
      {
        name: 'Rugby School',
        description: 'Famous for rugby sport',
        region: 'england',
        cost_range: '70000',
        is_featured: true
      },
      {
        name: 'Tennis Academy',
        description: 'Specialized in tennis training',
        region: 'england',
        cost_range: '60000',
        is_featured: false
      }
    ]);

    const filters: FilterSchoolsInput = {
      search: 'rugby',
      limit: 20,
      offset: 0
    };

    const result = await getBoardingSchools(filters);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Rugby School');
  });

  it('should filter schools by sports', async () => {
    // Create test schools
    const schools = await db.insert(boardingSchoolsTable).values([
      {
        name: 'Football Academy',
        description: 'Great football program',
        region: 'england',
        cost_range: '60000',
        is_featured: true
      },
      {
        name: 'Swimming School',
        description: 'Olympic swimming facilities',
        region: 'england',
        cost_range: '50000',
        is_featured: false
      }
    ]).returning();

    // Add sports to schools
    await db.insert(schoolSportsTable).values([
      {
        school_id: schools[0].id,
        sport_type: 'football',
        is_primary: true
      },
      {
        school_id: schools[1].id,
        sport_type: 'swimming',
        is_primary: true
      }
    ]);

    const filters: FilterSchoolsInput = {
      sports: ['football'],
      limit: 20,
      offset: 0
    };

    const result = await getBoardingSchools(filters);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Football Academy');
  });

  it('should filter schools by scholarships', async () => {
    // Create test schools
    const schools = await db.insert(boardingSchoolsTable).values([
      {
        name: 'Elite School',
        description: 'Full scholarships available',
        region: 'england',
        cost_range: '80000',
        is_featured: true
      },
      {
        name: 'Regular School',
        description: 'No scholarships',
        region: 'england',
        cost_range: '40000',
        is_featured: false
      }
    ]).returning();

    // Add scholarships to first school
    await db.insert(schoolScholarshipsTable).values([
      {
        school_id: schools[0].id,
        scholarship_type: 'full_scholarship',
        description: 'Full tuition coverage',
        requirements: 'Academic excellence'
      }
    ]);

    const filters: FilterSchoolsInput = {
      scholarships: ['full_scholarship'],
      limit: 20,
      offset: 0
    };

    const result = await getBoardingSchools(filters);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Elite School');
  });

  it('should apply pagination correctly', async () => {
    // Create multiple test schools
    const schools = Array.from({ length: 25 }, (_, i) => ({
      name: `School ${i + 1}`,
      description: `Description ${i + 1}`,
      region: 'england' as const,
      cost_range: '50000' as const,
      is_featured: false
    }));

    await db.insert(boardingSchoolsTable).values(schools);

    const filters: FilterSchoolsInput = {
      limit: 10,
      offset: 5
    };

    const result = await getBoardingSchools(filters);

    expect(result).toHaveLength(10);
    expect(result[0].name).toEqual('School 6'); // offset of 5 means we start from 6th school
  });

  it('should combine multiple filters correctly', async () => {
    // Create test schools
    const schools = await db.insert(boardingSchoolsTable).values([
      {
        name: 'Elite Football School',
        description: 'Best football training in England',
        region: 'england',
        cost_range: '70000',
        is_featured: true
      },
      {
        name: 'Scottish Rugby Academy',
        description: 'Rugby excellence in Scotland',
        region: 'scotland',
        cost_range: '60000',
        is_featured: false
      },
      {
        name: 'Welsh Football School',
        description: 'Football training in Wales',
        region: 'wales',
        cost_range: '50000',
        is_featured: false
      }
    ]).returning();

    // Add sports
    await db.insert(schoolSportsTable).values([
      {
        school_id: schools[0].id,
        sport_type: 'football',
        is_primary: true
      },
      {
        school_id: schools[1].id,
        sport_type: 'rugby',
        is_primary: true
      },
      {
        school_id: schools[2].id,
        sport_type: 'football',
        is_primary: true
      }
    ]);

    const filters: FilterSchoolsInput = {
      sports: ['football'],
      regions: ['england', 'wales'],
      cost_ranges: ['70000', '50000'],
      limit: 20,
      offset: 0
    };

    const result = await getBoardingSchools(filters);

    expect(result).toHaveLength(2);
    expect(result.map(s => s.name).sort()).toEqual(['Elite Football School', 'Welsh Football School']);
  });

  it('should use default pagination values when not provided', async () => {
    // Create test school
    await db.insert(boardingSchoolsTable).values({
      name: 'Test School',
      description: 'Test description',
      region: 'england',
      cost_range: '50000',
      is_featured: false
    });

    const result = await getBoardingSchools({
      limit: 20,
      offset: 0
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Test School');
  });
});
