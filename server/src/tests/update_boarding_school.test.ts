
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { boardingSchoolsTable, schoolSportsTable, schoolScholarshipsTable } from '../db/schema';
import { type UpdateBoardingSchoolInput } from '../schema';
import { updateBoardingSchool } from '../handlers/update_boarding_school';
import { eq } from 'drizzle-orm';

describe('updateBoardingSchool', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let schoolId: number;

  beforeEach(async () => {
    // Create a test boarding school directly using database insert
    const schoolResult = await db.insert(boardingSchoolsTable)
      .values({
        name: 'Original School',
        description: 'Original description',
        region: 'england',
        cost_range: '30000',
        website_url: 'https://original.school.uk',
        contact_email: 'contact@original.school.uk',
        contact_phone: '+44 1234 567890',
        address: '123 Original Street, London',
        profile_content: 'Original profile content',
        is_featured: false
      })
      .returning()
      .execute();

    schoolId = schoolResult[0].id;

    // Add some sports
    await db.insert(schoolSportsTable)
      .values([
        { school_id: schoolId, sport_type: 'football', is_primary: true },
        { school_id: schoolId, sport_type: 'rugby', is_primary: false }
      ])
      .execute();

    // Add some scholarships
    await db.insert(schoolScholarshipsTable)
      .values([
        { 
          school_id: schoolId,
          scholarship_type: 'sports_scholarship', 
          description: 'Football scholarship', 
          requirements: 'Must be excellent at football' 
        }
      ])
      .execute();
  });

  it('should update basic school information', async () => {
    const updateInput: UpdateBoardingSchoolInput = {
      id: schoolId,
      name: 'Updated School Name',
      description: 'Updated description',
      region: 'scotland',
      cost_range: '50000',
      is_featured: true
    };

    const result = await updateBoardingSchool(updateInput);

    expect(result.id).toEqual(schoolId);
    expect(result.name).toEqual('Updated School Name');
    expect(result.description).toEqual('Updated description');
    expect(result.region).toEqual('scotland');
    expect(result.cost_range).toEqual('50000');
    expect(result.is_featured).toEqual(true);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    const updateInput: UpdateBoardingSchoolInput = {
      id: schoolId,
      name: 'Partially Updated School'
    };

    const result = await updateBoardingSchool(updateInput);

    expect(result.name).toEqual('Partially Updated School');
    expect(result.description).toEqual('Original description'); // Should remain unchanged
    expect(result.region).toEqual('england'); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update contact information and nullable fields', async () => {
    const updateInput: UpdateBoardingSchoolInput = {
      id: schoolId,
      website_url: 'https://updated.school.uk',
      contact_email: 'new@updated.school.uk',
      contact_phone: '+44 9876 543210',
      address: '456 Updated Avenue, Edinburgh',
      profile_content: 'Updated rich profile content'
    };

    const result = await updateBoardingSchool(updateInput);

    expect(result.website_url).toEqual('https://updated.school.uk');
    expect(result.contact_email).toEqual('new@updated.school.uk');
    expect(result.contact_phone).toEqual('+44 9876 543210');
    expect(result.address).toEqual('456 Updated Avenue, Edinburgh');
    expect(result.profile_content).toEqual('Updated rich profile content');
  });

  it('should set nullable fields to null', async () => {
    const updateInput: UpdateBoardingSchoolInput = {
      id: schoolId,
      website_url: null,
      contact_email: null,
      contact_phone: null,
      address: null,
      profile_content: null
    };

    const result = await updateBoardingSchool(updateInput);

    expect(result.website_url).toBeNull();
    expect(result.contact_email).toBeNull();
    expect(result.contact_phone).toBeNull();
    expect(result.address).toBeNull();
    expect(result.profile_content).toBeNull();
  });

  it('should update sports associations', async () => {
    const updateInput: UpdateBoardingSchoolInput = {
      id: schoolId,
      sports: [
        { sport_type: 'tennis', is_primary: true },
        { sport_type: 'swimming', is_primary: false },
        { sport_type: 'hockey', is_primary: false }
      ]
    };

    await updateBoardingSchool(updateInput);

    // Check that old sports are removed and new ones added
    const sports = await db.select()
      .from(schoolSportsTable)
      .where(eq(schoolSportsTable.school_id, schoolId))
      .execute();

    expect(sports).toHaveLength(3);
    expect(sports.map(s => s.sport_type).sort()).toEqual(['hockey', 'swimming', 'tennis']);
    
    const primarySport = sports.find(s => s.is_primary);
    expect(primarySport?.sport_type).toEqual('tennis');
  });

  it('should clear sports when empty array provided', async () => {
    const updateInput: UpdateBoardingSchoolInput = {
      id: schoolId,
      sports: []
    };

    await updateBoardingSchool(updateInput);

    const sports = await db.select()
      .from(schoolSportsTable)
      .where(eq(schoolSportsTable.school_id, schoolId))
      .execute();

    expect(sports).toHaveLength(0);
  });

  it('should update scholarship associations', async () => {
    const updateInput: UpdateBoardingSchoolInput = {
      id: schoolId,
      scholarships: [
        { 
          scholarship_type: 'full_scholarship', 
          description: 'Full academic scholarship', 
          requirements: 'Outstanding academic performance' 
        },
        { 
          scholarship_type: 'partial_scholarship', 
          description: null, 
          requirements: null 
        }
      ]
    };

    await updateBoardingSchool(updateInput);

    const scholarships = await db.select()
      .from(schoolScholarshipsTable)
      .where(eq(schoolScholarshipsTable.school_id, schoolId))
      .execute();

    expect(scholarships).toHaveLength(2);
    expect(scholarships.map(s => s.scholarship_type).sort()).toEqual(['full_scholarship', 'partial_scholarship']);
    
    const fullScholarship = scholarships.find(s => s.scholarship_type === 'full_scholarship');
    expect(fullScholarship?.description).toEqual('Full academic scholarship');
    expect(fullScholarship?.requirements).toEqual('Outstanding academic performance');

    const partialScholarship = scholarships.find(s => s.scholarship_type === 'partial_scholarship');
    expect(partialScholarship?.description).toBeNull();
    expect(partialScholarship?.requirements).toBeNull();
  });

  it('should clear scholarships when empty array provided', async () => {
    const updateInput: UpdateBoardingSchoolInput = {
      id: schoolId,
      scholarships: []
    };

    await updateBoardingSchool(updateInput);

    const scholarships = await db.select()
      .from(schoolScholarshipsTable)
      .where(eq(schoolScholarshipsTable.school_id, schoolId))
      .execute();

    expect(scholarships).toHaveLength(0);
  });

  it('should update school record in database', async () => {
    const updateInput: UpdateBoardingSchoolInput = {
      id: schoolId,
      name: 'Database Updated School',
      region: 'wales'
    };

    await updateBoardingSchool(updateInput);

    const schools = await db.select()
      .from(boardingSchoolsTable)
      .where(eq(boardingSchoolsTable.id, schoolId))
      .execute();

    expect(schools).toHaveLength(1);
    expect(schools[0].name).toEqual('Database Updated School');
    expect(schools[0].region).toEqual('wales');
    expect(schools[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent school', async () => {
    const updateInput: UpdateBoardingSchoolInput = {
      id: 99999,
      name: 'Non-existent School'
    };

    await expect(updateBoardingSchool(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should update both sports and scholarships together', async () => {
    const updateInput: UpdateBoardingSchoolInput = {
      id: schoolId,
      name: 'Comprehensive Update',
      sports: [
        { sport_type: 'rowing', is_primary: true }
      ],
      scholarships: [
        { 
          scholarship_type: 'sports_scholarship', 
          description: 'Rowing excellence scholarship', 
          requirements: 'National level rowing experience' 
        }
      ]
    };

    const result = await updateBoardingSchool(updateInput);

    expect(result.name).toEqual('Comprehensive Update');

    // Check sports
    const sports = await db.select()
      .from(schoolSportsTable)
      .where(eq(schoolSportsTable.school_id, schoolId))
      .execute();

    expect(sports).toHaveLength(1);
    expect(sports[0].sport_type).toEqual('rowing');
    expect(sports[0].is_primary).toEqual(true);

    // Check scholarships
    const scholarships = await db.select()
      .from(schoolScholarshipsTable)
      .where(eq(schoolScholarshipsTable.school_id, schoolId))
      .execute();

    expect(scholarships).toHaveLength(1);
    expect(scholarships[0].scholarship_type).toEqual('sports_scholarship');
    expect(scholarships[0].description).toEqual('Rowing excellence scholarship');
  });

  it('should leave sports unchanged when not provided', async () => {
    const updateInput: UpdateBoardingSchoolInput = {
      id: schoolId,
      name: 'Updated Name Only'
    };

    await updateBoardingSchool(updateInput);

    // Sports should remain unchanged
    const sports = await db.select()
      .from(schoolSportsTable)
      .where(eq(schoolSportsTable.school_id, schoolId))
      .execute();

    expect(sports).toHaveLength(2);
    expect(sports.map(s => s.sport_type).sort()).toEqual(['football', 'rugby']);
  });

  it('should leave scholarships unchanged when not provided', async () => {
    const updateInput: UpdateBoardingSchoolInput = {
      id: schoolId,
      name: 'Updated Name Only'
    };

    await updateBoardingSchool(updateInput);

    // Scholarships should remain unchanged
    const scholarships = await db.select()
      .from(schoolScholarshipsTable)
      .where(eq(schoolScholarshipsTable.school_id, schoolId))
      .execute();

    expect(scholarships).toHaveLength(1);
    expect(scholarships[0].scholarship_type).toEqual('sports_scholarship');
    expect(scholarships[0].description).toEqual('Football scholarship');
  });
});
