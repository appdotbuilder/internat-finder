
import { db } from '../db';
import { boardingSchoolsTable } from '../db/schema';
import { type BoardingSchool } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getFeaturedSchools = async (): Promise<BoardingSchool[]> => {
  try {
    const results = await db.select()
      .from(boardingSchoolsTable)
      .where(eq(boardingSchoolsTable.is_featured, true))
      .orderBy(desc(boardingSchoolsTable.updated_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get featured schools:', error);
    throw error;
  }
};
