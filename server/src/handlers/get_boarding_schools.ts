
import { db } from '../db';
import { boardingSchoolsTable, schoolSportsTable, schoolScholarshipsTable } from '../db/schema';
import { type FilterSchoolsInput, type BoardingSchool } from '../schema';
import { eq, and, or, ilike, inArray, SQL } from 'drizzle-orm';

export async function getBoardingSchools(input?: FilterSchoolsInput): Promise<BoardingSchool[]> {
  try {
    // Apply defaults if input is not provided
    const filters: FilterSchoolsInput = {
      sports: input?.sports,
      scholarships: input?.scholarships,
      regions: input?.regions,
      cost_ranges: input?.cost_ranges,
      search: input?.search,
      limit: input?.limit ?? 20,
      offset: input?.offset ?? 0
    };

    // Collect conditions for filtering
    const conditions: SQL<unknown>[] = [];

    // Filter by regions
    if (filters.regions && filters.regions.length > 0) {
      conditions.push(inArray(boardingSchoolsTable.region, filters.regions));
    }

    // Filter by cost ranges
    if (filters.cost_ranges && filters.cost_ranges.length > 0) {
      conditions.push(inArray(boardingSchoolsTable.cost_range, filters.cost_ranges));
    }

    // Search in name and description
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(boardingSchoolsTable.name, searchTerm),
          ilike(boardingSchoolsTable.description, searchTerm)
        )!
      );
    }

    // Handle sports filtering with subquery
    if (filters.sports && filters.sports.length > 0) {
      const schoolIdsWithSports = db.select({ school_id: schoolSportsTable.school_id })
        .from(schoolSportsTable)
        .where(inArray(schoolSportsTable.sport_type, filters.sports));
      
      conditions.push(inArray(boardingSchoolsTable.id, schoolIdsWithSports));
    }

    // Handle scholarships filtering with subquery
    if (filters.scholarships && filters.scholarships.length > 0) {
      const schoolIdsWithScholarships = db.select({ school_id: schoolScholarshipsTable.school_id })
        .from(schoolScholarshipsTable)
        .where(inArray(schoolScholarshipsTable.scholarship_type, filters.scholarships));
      
      conditions.push(inArray(boardingSchoolsTable.id, schoolIdsWithScholarships));
    }

    // Build and execute the query
    const baseQuery = db.select().from(boardingSchoolsTable);
    
    let results;
    if (conditions.length === 0) {
      // No filters - simple query
      results = await baseQuery.limit(filters.limit).offset(filters.offset).execute();
    } else if (conditions.length === 1) {
      // Single condition
      results = await baseQuery
        .where(conditions[0])
        .limit(filters.limit)
        .offset(filters.offset)
        .execute();
    } else {
      // Multiple conditions
      results = await baseQuery
        .where(and(...conditions))
        .limit(filters.limit)
        .offset(filters.offset)
        .execute();
    }

    return results;
  } catch (error) {
    console.error('Get boarding schools failed:', error);
    throw error;
  }
}
