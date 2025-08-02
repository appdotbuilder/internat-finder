
import { db } from '../db';
import { boardingSchoolsTable, schoolSportsTable, schoolScholarshipsTable } from '../db/schema';
import { type CreateBoardingSchoolInput, type BoardingSchool } from '../schema';

export const createBoardingSchool = async (input: CreateBoardingSchoolInput): Promise<BoardingSchool> => {
  try {
    // Insert the boarding school
    const schoolResult = await db.insert(boardingSchoolsTable)
      .values({
        name: input.name,
        description: input.description,
        region: input.region,
        cost_range: input.cost_range,
        website_url: input.website_url,
        contact_email: input.contact_email,
        contact_phone: input.contact_phone,
        address: input.address,
        profile_content: input.profile_content,
        is_featured: input.is_featured
      })
      .returning()
      .execute();

    const school = schoolResult[0];

    // Insert associated sports if provided
    if (input.sports && input.sports.length > 0) {
      await db.insert(schoolSportsTable)
        .values(
          input.sports.map(sport => ({
            school_id: school.id,
            sport_type: sport.sport_type,
            is_primary: sport.is_primary
          }))
        )
        .execute();
    }

    // Insert associated scholarships if provided
    if (input.scholarships && input.scholarships.length > 0) {
      await db.insert(schoolScholarshipsTable)
        .values(
          input.scholarships.map(scholarship => ({
            school_id: school.id,
            scholarship_type: scholarship.scholarship_type,
            description: scholarship.description,
            requirements: scholarship.requirements
          }))
        )
        .execute();
    }

    return school;
  } catch (error) {
    console.error('Boarding school creation failed:', error);
    throw error;
  }
};
