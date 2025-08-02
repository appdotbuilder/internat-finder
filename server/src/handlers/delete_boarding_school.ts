
import { db } from '../db';
import { boardingSchoolsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteBoardingSchool(id: number): Promise<{ success: boolean }> {
  try {
    // Delete the boarding school record
    // Cascading deletes will automatically handle:
    // - Associated sports records (school_sports table)
    // - Associated scholarship records (school_scholarships table)
    const result = await db.delete(boardingSchoolsTable)
      .where(eq(boardingSchoolsTable.id, id))
      .execute();

    // Check if any rows were affected (i.e., if the school existed and was deleted)
    return { success: (result.rowCount ?? 0) > 0 };
  } catch (error) {
    console.error('Boarding school deletion failed:', error);
    throw error;
  }
}
