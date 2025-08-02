
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { boardingSchoolsTable, schoolSportsTable, schoolScholarshipsTable, usersTable } from '../db/schema';
import { getBoardingSchoolById } from '../handlers/get_boarding_school_by_id';
import { type SchoolSport, type SchoolScholarship } from '../schema';

describe('getBoardingSchoolById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a boarding school with all related data', async () => {
    // Create a boarding school
    const schoolResult = await db.insert(boardingSchoolsTable)
      .values({
        name: 'Test School',
        description: 'A test boarding school',
        region: 'england',
        cost_range: '30000',
        website_url: 'https://testschool.com',
        contact_email: 'info@testschool.com',
        contact_phone: '+44123456789',
        address: '123 Test Street, London',
        profile_content: 'Rich profile content',
        is_featured: true
      })
      .returning()
      .execute();

    const school = schoolResult[0];

    // Add sports
    await db.insert(schoolSportsTable)
      .values([
        {
          school_id: school.id,
          sport_type: 'football',
          is_primary: true
        },
        {
          school_id: school.id,
          sport_type: 'rugby',
          is_primary: false
        }
      ])
      .execute();

    // Add scholarships
    await db.insert(schoolScholarshipsTable)
      .values([
        {
          school_id: school.id,
          scholarship_type: 'sports_scholarship',
          description: 'Football scholarship',
          requirements: 'Must be excellent at football'
        },
        {
          school_id: school.id,
          scholarship_type: 'partial_scholarship',
          description: 'Academic partial scholarship',
          requirements: 'Good grades required'
        }
      ])
      .execute();

    // Test the handler
    const result = await getBoardingSchoolById(school.id);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(school.id);
    expect(result!.name).toEqual('Test School');
    expect(result!.description).toEqual('A test boarding school');
    expect(result!.region).toEqual('england');
    expect(result!.cost_range).toEqual('30000');
    expect(result!.website_url).toEqual('https://testschool.com');
    expect(result!.contact_email).toEqual('info@testschool.com');
    expect(result!.contact_phone).toEqual('+44123456789');
    expect(result!.address).toEqual('123 Test Street, London');
    expect(result!.profile_content).toEqual('Rich profile content');
    expect(result!.is_featured).toEqual(true);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);

    // Check sports
    expect(result!.sports).toHaveLength(2);
    const footballSport = result!.sports.find((s: SchoolSport) => s.sport_type === 'football');
    expect(footballSport).toBeDefined();
    expect(footballSport!.is_primary).toEqual(true);
    expect(footballSport!.school_id).toEqual(school.id);

    const rugbySport = result!.sports.find((s: SchoolSport) => s.sport_type === 'rugby');
    expect(rugbySport).toBeDefined();
    expect(rugbySport!.is_primary).toEqual(false);

    // Check scholarships
    expect(result!.scholarships).toHaveLength(2);
    const sportsScholarship = result!.scholarships.find((s: SchoolScholarship) => s.scholarship_type === 'sports_scholarship');
    expect(sportsScholarship).toBeDefined();
    expect(sportsScholarship!.description).toEqual('Football scholarship');
    expect(sportsScholarship!.requirements).toEqual('Must be excellent at football');
    expect(sportsScholarship!.school_id).toEqual(school.id);

    const partialScholarship = result!.scholarships.find((s: SchoolScholarship) => s.scholarship_type === 'partial_scholarship');
    expect(partialScholarship).toBeDefined();
    expect(partialScholarship!.description).toEqual('Academic partial scholarship');
    expect(partialScholarship!.requirements).toEqual('Good grades required');
  });

  it('should return null when boarding school does not exist', async () => {
    const result = await getBoardingSchoolById(999);
    expect(result).toBeNull();
  });

  it('should return boarding school with empty arrays when no sports or scholarships exist', async () => {
    // Create a boarding school without sports or scholarships
    const schoolResult = await db.insert(boardingSchoolsTable)
      .values({
        name: 'Minimal School',
        description: 'A minimal boarding school',
        region: 'scotland',
        cost_range: '40000',
        website_url: null,
        contact_email: null,
        contact_phone: null,
        address: null,
        profile_content: null,
        is_featured: false
      })
      .returning()
      .execute();

    const school = schoolResult[0];

    const result = await getBoardingSchoolById(school.id);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(school.id);
    expect(result!.name).toEqual('Minimal School');
    expect(result!.sports).toHaveLength(0);
    expect(result!.scholarships).toHaveLength(0);
    expect(result!.website_url).toBeNull();
    expect(result!.contact_email).toBeNull();
    expect(result!.contact_phone).toBeNull();
    expect(result!.address).toBeNull();
    expect(result!.profile_content).toBeNull();
    expect(result!.is_featured).toEqual(false);
  });

  it('should return boarding school with only sports when no scholarships exist', async () => {
    // Create a boarding school
    const schoolResult = await db.insert(boardingSchoolsTable)
      .values({
        name: 'Sports Only School',
        description: 'A school with only sports',
        region: 'wales',
        cost_range: '50000'
      })
      .returning()
      .execute();

    const school = schoolResult[0];

    // Add only sports
    await db.insert(schoolSportsTable)
      .values({
        school_id: school.id,
        sport_type: 'tennis',
        is_primary: true
      })
      .execute();

    const result = await getBoardingSchoolById(school.id);

    expect(result).toBeDefined();
    expect(result!.sports).toHaveLength(1);
    expect(result!.sports[0].sport_type).toEqual('tennis');
    expect(result!.scholarships).toHaveLength(0);
  });
});
