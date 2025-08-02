
import { db } from '../db';
import { boardingSchoolsTable, schoolSportsTable, schoolScholarshipsTable } from '../db/schema';
import { type UpdateBoardingSchoolInput, type BoardingSchool } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateBoardingSchool(input: UpdateBoardingSchoolInput): Promise<BoardingSchool> {
  try {
    // Start transaction to ensure data consistency
    return await db.transaction(async (tx) => {
      // Update the boarding school record
      const updateData: any = {};
      
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.region !== undefined) updateData.region = input.region;
      if (input.cost_range !== undefined) updateData.cost_range = input.cost_range;
      if (input.website_url !== undefined) updateData.website_url = input.website_url;
      if (input.contact_email !== undefined) updateData.contact_email = input.contact_email;
      if (input.contact_phone !== undefined) updateData.contact_phone = input.contact_phone;
      if (input.address !== undefined) updateData.address = input.address;
      if (input.profile_content !== undefined) updateData.profile_content = input.profile_content;
      if (input.is_featured !== undefined) updateData.is_featured = input.is_featured;
      
      // Always update the updated_at timestamp
      updateData.updated_at = new Date();

      const schoolResults = await tx.update(boardingSchoolsTable)
        .set(updateData)
        .where(eq(boardingSchoolsTable.id, input.id))
        .returning()
        .execute();

      if (schoolResults.length === 0) {
        throw new Error(`Boarding school with id ${input.id} not found`);
      }

      // Update sports if provided
      if (input.sports !== undefined) {
        // Delete existing sports
        await tx.delete(schoolSportsTable)
          .where(eq(schoolSportsTable.school_id, input.id))
          .execute();

        // Insert new sports
        if (input.sports.length > 0) {
          await tx.insert(schoolSportsTable)
            .values(input.sports.map(sport => ({
              school_id: input.id,
              sport_type: sport.sport_type,
              is_primary: sport.is_primary
            })))
            .execute();
        }
      }

      // Update scholarships if provided
      if (input.scholarships !== undefined) {
        // Delete existing scholarships
        await tx.delete(schoolScholarshipsTable)
          .where(eq(schoolScholarshipsTable.school_id, input.id))
          .execute();

        // Insert new scholarships
        if (input.scholarships.length > 0) {
          await tx.insert(schoolScholarshipsTable)
            .values(input.scholarships.map(scholarship => ({
              school_id: input.id,
              scholarship_type: scholarship.scholarship_type,
              description: scholarship.description,
              requirements: scholarship.requirements
            })))
            .execute();
        }
      }

      return schoolResults[0];
    });
  } catch (error) {
    console.error('Boarding school update failed:', error);
    throw error;
  }
}
