
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { boardingSchoolsTable, schoolSportsTable, schoolScholarshipsTable } from '../db/schema';
import { deleteBoardingSchool } from '../handlers/delete_boarding_school';
import { eq } from 'drizzle-orm';

describe('deleteBoardingSchool', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a boarding school', async () => {
    // Create a test boarding school
    const [school] = await db.insert(boardingSchoolsTable)
      .values({
        name: 'Test School',
        description: 'A test school',
        region: 'england',
        cost_range: '30000'
      })
      .returning()
      .execute();

    // Delete the school
    const result = await deleteBoardingSchool(school.id);

    expect(result.success).toBe(true);

    // Verify the school was deleted
    const schools = await db.select()
      .from(boardingSchoolsTable)
      .where(eq(boardingSchoolsTable.id, school.id))
      .execute();

    expect(schools).toHaveLength(0);
  });

  it('should return false when deleting non-existent school', async () => {
    // Try to delete a school that doesn't exist
    const result = await deleteBoardingSchool(999);

    expect(result.success).toBe(false);
  });

  it('should cascade delete associated sports and scholarships', async () => {
    // Create a test boarding school
    const [school] = await db.insert(boardingSchoolsTable)
      .values({
        name: 'Test School with Relations',
        description: 'A test school with sports and scholarships',
        region: 'scotland',
        cost_range: '40000'
      })
      .returning()
      .execute();

    // Add associated sports
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

    // Add associated scholarships
    await db.insert(schoolScholarshipsTable)
      .values([
        {
          school_id: school.id,
          scholarship_type: 'sports_scholarship',
          description: 'Football scholarship'
        },
        {
          school_id: school.id,
          scholarship_type: 'partial_scholarship',
          description: 'Academic scholarship'
        }
      ])
      .execute();

    // Verify relations exist before deletion
    const sportsBefore = await db.select()
      .from(schoolSportsTable)
      .where(eq(schoolSportsTable.school_id, school.id))
      .execute();
    
    const scholarshipsBefore = await db.select()
      .from(schoolScholarshipsTable)
      .where(eq(schoolScholarshipsTable.school_id, school.id))
      .execute();

    expect(sportsBefore).toHaveLength(2);
    expect(scholarshipsBefore).toHaveLength(2);

    // Delete the school
    const result = await deleteBoardingSchool(school.id);

    expect(result.success).toBe(true);

    // Verify the school was deleted
    const schools = await db.select()
      .from(boardingSchoolsTable)
      .where(eq(boardingSchoolsTable.id, school.id))
      .execute();

    expect(schools).toHaveLength(0);

    // Verify associated sports were cascade deleted
    const sportsAfter = await db.select()
      .from(schoolSportsTable)
      .where(eq(schoolSportsTable.school_id, school.id))
      .execute();

    expect(sportsAfter).toHaveLength(0);

    // Verify associated scholarships were cascade deleted
    const scholarshipsAfter = await db.select()
      .from(schoolScholarshipsTable)
      .where(eq(schoolScholarshipsTable.school_id, school.id))
      .execute();

    expect(scholarshipsAfter).toHaveLength(0);
  });
});
