
import { z } from 'zod';

// Enums for filtering
export const sportTypeSchema = z.enum(['football', 'rugby', 'swimming', 'tennis', 'hockey', 'rowing']);
export type SportType = z.infer<typeof sportTypeSchema>;

export const scholarshipTypeSchema = z.enum(['sports_scholarship', 'partial_scholarship', 'full_scholarship']);
export type ScholarshipType = z.infer<typeof scholarshipTypeSchema>;

export const regionSchema = z.enum(['england', 'scotland', 'northern_ireland', 'wales']);
export type Region = z.infer<typeof regionSchema>;

export const costRangeSchema = z.enum(['20000', '30000', '40000', '50000', '60000', '70000', '80000']);
export type CostRange = z.infer<typeof costRangeSchema>;

export const userRoleSchema = z.enum(['admin', 'user']);
export type UserRole = z.infer<typeof userRoleSchema>;

// Boarding School schema
export const boardingSchoolSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  region: regionSchema,
  cost_range: costRangeSchema,
  website_url: z.string().nullable(),
  contact_email: z.string().nullable(),
  contact_phone: z.string().nullable(),
  address: z.string().nullable(),
  profile_content: z.string().nullable(), // Rich text content from admin
  is_featured: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type BoardingSchool = z.infer<typeof boardingSchoolSchema>;

// School Sports relationship schema
export const schoolSportSchema = z.object({
  id: z.number(),
  school_id: z.number(),
  sport_type: sportTypeSchema,
  is_primary: z.boolean(), // Whether this is a primary sport for the school
  created_at: z.coerce.date()
});

export type SchoolSport = z.infer<typeof schoolSportSchema>;

// School Scholarships relationship schema
export const schoolScholarshipSchema = z.object({
  id: z.number(),
  school_id: z.number(),
  scholarship_type: scholarshipTypeSchema,
  description: z.string().nullable(),
  requirements: z.string().nullable(),
  created_at: z.coerce.date()
});

export type SchoolScholarship = z.infer<typeof schoolScholarshipSchema>;

// Blog Post schema
export const blogPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(), // Rich text content
  excerpt: z.string().nullable(),
  featured_image_url: z.string().nullable(),
  is_published: z.boolean(),
  author_id: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type BlogPost = z.infer<typeof blogPostSchema>;

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  role: userRoleSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Input schemas for creating/updating

// Create boarding school input
export const createBoardingSchoolInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  region: regionSchema,
  cost_range: costRangeSchema,
  website_url: z.string().url().nullable(),
  contact_email: z.string().email().nullable(),
  contact_phone: z.string().nullable(),
  address: z.string().nullable(),
  profile_content: z.string().nullable(),
  is_featured: z.boolean().default(false),
  sports: z.array(z.object({
    sport_type: sportTypeSchema,
    is_primary: z.boolean().default(false)
  })).optional(),
  scholarships: z.array(z.object({
    scholarship_type: scholarshipTypeSchema,
    description: z.string().nullable(),
    requirements: z.string().nullable()
  })).optional()
});

export type CreateBoardingSchoolInput = z.infer<typeof createBoardingSchoolInputSchema>;

// Update boarding school input
export const updateBoardingSchoolInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  region: regionSchema.optional(),
  cost_range: costRangeSchema.optional(),
  website_url: z.string().url().nullable().optional(),
  contact_email: z.string().email().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  profile_content: z.string().nullable().optional(),
  is_featured: z.boolean().optional(),
  sports: z.array(z.object({
    sport_type: sportTypeSchema,
    is_primary: z.boolean().default(false)
  })).optional(),
  scholarships: z.array(z.object({
    scholarship_type: scholarshipTypeSchema,
    description: z.string().nullable(),
    requirements: z.string().nullable()
  })).optional()
});

export type UpdateBoardingSchoolInput = z.infer<typeof updateBoardingSchoolInputSchema>;

// Filter schools input
export const filterSchoolsInputSchema = z.object({
  sports: z.array(sportTypeSchema).optional(),
  scholarships: z.array(scholarshipTypeSchema).optional(),
  regions: z.array(regionSchema).optional(),
  cost_ranges: z.array(costRangeSchema).optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0)
});

export type FilterSchoolsInput = z.infer<typeof filterSchoolsInputSchema>;

// Create blog post input
export const createBlogPostInputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().nullable(),
  featured_image_url: z.string().url().nullable(),
  is_published: z.boolean().default(false),
  author_id: z.number()
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostInputSchema>;

// Update blog post input
export const updateBlogPostInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().nullable().optional(),
  featured_image_url: z.string().url().nullable().optional(),
  is_published: z.boolean().optional()
});

export type UpdateBlogPostInput = z.infer<typeof updateBlogPostInputSchema>;

// Create user input
export const createUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: userRoleSchema.default('user')
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

// Get blog posts filter
export const getBlogPostsInputSchema = z.object({
  published_only: z.boolean().default(true),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0)
});

export type GetBlogPostsInput = z.infer<typeof getBlogPostsInputSchema>;
