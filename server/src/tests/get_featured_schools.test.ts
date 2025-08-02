
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { boardingSchoolsTable } from '../db/schema';
import { getFeaturedSchools } from '../handlers/get_featured_schools';

describe('getFeaturedSchools', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no featured schools exist', async () => {
    const result = await getFeaturedSchools();
    expect(result).toEqual([]);
  });

  it('should return only featured schools', async () => {
    // Create a mix of featured and non-featured schools
    await db.insert(boardingSchoolsTable).values([
      {
        name: 'Featured School 1',
        description: 'A featured school',
        region: 'england',
        cost_range: '30000',
        is_featured: true
      },
      {
        name: 'Non-Featured School',
        description: 'A regular school',
        region: 'scotland',
        cost_range: '40000',
        is_featured: false
      },
      {
        name: 'Featured School 2',
        description: 'Another featured school',
        region: 'wales',
        cost_range: '50000',
        is_featured: true
      }
    ]).execute();

    const result = await getFeaturedSchools();

    expect(result).toHaveLength(2);
    expect(result.every(school => school.is_featured)).toBe(true);
    expect(result.map(school => school.name)).toContain('Featured School 1');
    expect(result.map(school => school.name)).toContain('Featured School 2');
    expect(result.map(school => school.name)).not.toContain('Non-Featured School');
  });

  it('should order featured schools by updated_at DESC', async () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // Insert schools with different updated_at times
    await db.insert(boardingSchoolsTable).values([
      {
        name: 'Oldest Featured School',
        description: 'The oldest featured school',
        region: 'england',
        cost_range: '30000',
        is_featured: true,
        updated_at: twoHoursAgo
      },
      {
        name: 'Newest Featured School',
        description: 'The newest featured school',
        region: 'scotland',
        cost_range: '40000',
        is_featured: true,
        updated_at: now
      },
      {
        name: 'Middle Featured School',
        description: 'The middle featured school',
        region: 'wales',
        cost_range: '50000',
        is_featured: true,
        updated_at: oneHourAgo
      }
    ]).execute();

    const result = await getFeaturedSchools();

    expect(result).toHaveLength(3);
    expect(result[0].name).toEqual('Newest Featured School');
    expect(result[1].name).toEqual('Middle Featured School');
    expect(result[2].name).toEqual('Oldest Featured School');
  });

  it('should return complete school information', async () => {
    await db.insert(boardingSchoolsTable).values({
      name: 'Complete School',
      description: 'A complete school with all fields',
      region: 'northern_ireland',
      cost_range: '60000',
      website_url: 'https://example.com',
      contact_email: 'contact@school.com',
      contact_phone: '+44 123 456 7890',
      address: '123 School Street, City',
      profile_content: 'Rich text profile content',
      is_featured: true
    }).execute();

    const result = await getFeaturedSchools();

    expect(result).toHaveLength(1);
    const school = result[0];
    expect(school.name).toEqual('Complete School');
    expect(school.description).toEqual('A complete school with all fields');
    expect(school.region).toEqual('northern_ireland');
    expect(school.cost_range).toEqual('60000');
    expect(school.website_url).toEqual('https://example.com');
    expect(school.contact_email).toEqual('contact@school.com');
    expect(school.contact_phone).toEqual('+44 123 456 7890');
    expect(school.address).toEqual('123 School Street, City');
    expect(school.profile_content).toEqual('Rich text profile content');
    expect(school.is_featured).toBe(true);
    expect(school.id).toBeDefined();
    expect(school.created_at).toBeInstanceOf(Date);
    expect(school.updated_at).toBeInstanceOf(Date);
  });
});
