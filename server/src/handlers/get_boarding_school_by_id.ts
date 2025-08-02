
import { db } from '../db';
import { boardingSchoolsTable, schoolSportsTable, schoolScholarshipsTable } from '../db/schema';
import { type BoardingSchool, type SchoolSport, type SchoolScholarship } from '../schema';
import { eq } from 'drizzle-orm';

export type BoardingSchoolWithRelations = BoardingSchool & {
  sports: SchoolSport[];
  scholarships: SchoolScholarship[];
};

export async function getBoardingSchoolById(id: number): Promise<BoardingSchoolWithRelations | null> {
  try {
    // Get the basic school information
    const schools = await db.select()
      .from(boardingSchoolsTable)
      .where(eq(boardingSchoolsTable.id, id))
      .execute();

    if (schools.length === 0) {
      return null;
    }

    const school = schools[0];

    // Get associated sports
    const sports = await db.select()
      .from(schoolSportsTable)
      .where(eq(schoolSportsTable.school_id, id))
      .execute();

    // Get associated scholarships
    const scholarships = await db.select()
      .from(schoolScholarshipsTable)
      .where(eq(schoolScholarshipsTable.school_id, id))
      .execute();

    // Return the complete boarding school with all related data
    return {
      ...school,
      sports: sports,
      scholarships: scholarships
    };
  } catch (error) {
    console.error('Failed to get boarding school by ID:', error);
    throw error;
  }
}
