
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { boardingSchoolsTable, schoolSportsTable, schoolScholarshipsTable } from '../db/schema';
import { type CreateBoardingSchoolInput } from '../schema';
import { createBoardingSchool } from '../handlers/create_boarding_school';
import { eq } from 'drizzle-orm';

const testInput: CreateBoardingSchoolInput = {
  name: 'Test School',
  description: 'A prestigious boarding school for testing',
  region: 'england',
  cost_range: '50000',
  website_url: 'https://testschool.edu',
  contact_email: 'contact@testschool.edu',
  contact_phone: '+44 123 456 7890',
  address: '123 Test Street, London',
  profile_content: 'Rich content about the school',
  is_featured: true,
  sports: [
    { sport_type: 'football', is_primary: true },
    { sport_type: 'rugby', is_primary: false }
  ],
  scholarships: [
    { 
      scholarship_type: 'sports_scholarship', 
      description: 'For outstanding athletes',
      requirements: 'Minimum 2 years experience'
    }
  ]
};

describe('createBoardingSchool', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a boarding school with basic fields', async () => {
    const result = await createBoardingSchool(testInput);

    expect(result.name).toEqual('Test School');
    expect(result.description).toEqual('A prestigious boarding school for testing');
    expect(result.region).toEqual('england');
    expect(result.cost_range).toEqual('50000');
    expect(result.website_url).toEqual('https://testschool.edu');
    expect(result.contact_email).toEqual('contact@testschool.edu');
    expect(result.contact_phone).toEqual('+44 123 456 7890');
    expect(result.address).toEqual('123 Test Street, London');
    expect(result.profile_content).toEqual('Rich content about the school');
    expect(result.is_featured).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save boarding school to database', async () => {
    const result = await createBoardingSchool(testInput);

    const schools = await db.select()
      .from(boardingSchoolsTable)
      .where(eq(boardingSchoolsTable.id, result.id))
      .execute();

    expect(schools).toHaveLength(1);
    expect(schools[0].name).toEqual('Test School');
    expect(schools[0].region).toEqual('england');
    expect(schools[0].is_featured).toEqual(true);
  });

  it('should create associated sports when provided', async () => {
    const result = await createBoardingSchool(testInput);

    const sports = await db.select()
      .from(schoolSportsTable)
      .where(eq(schoolSportsTable.school_id, result.id))
      .execute();

    expect(sports).toHaveLength(2);
    
    const footballSport = sports.find(s => s.sport_type === 'football');
    const rugbySport = sports.find(s => s.sport_type === 'rugby');
    
    expect(footballSport).toBeDefined();
    expect(footballSport!.is_primary).toEqual(true);
    expect(rugbySport).toBeDefined();
    expect(rugbySport!.is_primary).toEqual(false);
  });

  it('should create associated scholarships when provided', async () => {
    const result = await createBoardingSchool(testInput);

    const scholarships = await db.select()
      .from(schoolScholarshipsTable)
      .where(eq(schoolScholarshipsTable.school_id, result.id))
      .execute();

    expect(scholarships).toHaveLength(1);
    expect(scholarships[0].scholarship_type).toEqual('sports_scholarship');
    expect(scholarships[0].description).toEqual('For outstanding athletes');
    expect(scholarships[0].requirements).toEqual('Minimum 2 years experience');
  });

  it('should work without sports and scholarships', async () => {
    const minimalInput: CreateBoardingSchoolInput = {
      name: 'Minimal School',
      description: 'Basic school setup',
      region: 'scotland',
      cost_range: '30000',
      website_url: null,
      contact_email: null,
      contact_phone: null,
      address: null,
      profile_content: null,
      is_featured: false
    };

    const result = await createBoardingSchool(minimalInput);

    expect(result.name).toEqual('Minimal School');
    expect(result.is_featured).toEqual(false);
    expect(result.id).toBeDefined();

    // Verify no sports were created
    const sports = await db.select()
      .from(schoolSportsTable)
      .where(eq(schoolSportsTable.school_id, result.id))
      .execute();
    expect(sports).toHaveLength(0);

    // Verify no scholarships were created
    const scholarships = await db.select()
      .from(schoolScholarshipsTable)
      .where(eq(schoolScholarshipsTable.school_id, result.id))
      .execute();
    expect(scholarships).toHaveLength(0);
  });

  it('should handle empty sports and scholarships arrays', async () => {
    const inputWithEmptyArrays: CreateBoardingSchoolInput = {
      ...testInput,
      sports: [],
      scholarships: []
    };

    const result = await createBoardingSchool(inputWithEmptyArrays);

    expect(result.id).toBeDefined();

    // Verify no sports were created
    const sports = await db.select()
      .from(schoolSportsTable)
      .where(eq(schoolSportsTable.school_id, result.id))
      .execute();
    expect(sports).toHaveLength(0);

    // Verify no scholarships were created
    const scholarships = await db.select()
      .from(schoolScholarshipsTable)
      .where(eq(schoolScholarshipsTable.school_id, result.id))
      .execute();
    expect(scholarships).toHaveLength(0);
  });
});
