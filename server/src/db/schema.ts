
import { serial, text, pgTable, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define PostgreSQL enums
export const sportTypeEnum = pgEnum('sport_type', ['football', 'rugby', 'swimming', 'tennis', 'hockey', 'rowing']);
export const scholarshipTypeEnum = pgEnum('scholarship_type', ['sports_scholarship', 'partial_scholarship', 'full_scholarship']);
export const regionEnum = pgEnum('region', ['england', 'scotland', 'northern_ireland', 'wales']);
export const costRangeEnum = pgEnum('cost_range', ['20000', '30000', '40000', '50000', '60000', '70000', '80000']);
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('user'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Boarding schools table
export const boardingSchoolsTable = pgTable('boarding_schools', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  region: regionEnum('region').notNull(),
  cost_range: costRangeEnum('cost_range').notNull(),
  website_url: text('website_url'),
  contact_email: text('contact_email'),
  contact_phone: text('contact_phone'),
  address: text('address'),
  profile_content: text('profile_content'), // Rich text content managed by admin
  is_featured: boolean('is_featured').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// School sports junction table
export const schoolSportsTable = pgTable('school_sports', {
  id: serial('id').primaryKey(),
  school_id: integer('school_id').notNull().references(() => boardingSchoolsTable.id, { onDelete: 'cascade' }),
  sport_type: sportTypeEnum('sport_type').notNull(),
  is_primary: boolean('is_primary').notNull().default(false), // Whether this is a primary sport
  created_at: timestamp('created_at').defaultNow().notNull()
});

// School scholarships junction table
export const schoolScholarshipsTable = pgTable('school_scholarships', {
  id: serial('id').primaryKey(),
  school_id: integer('school_id').notNull().references(() => boardingSchoolsTable.id, { onDelete: 'cascade' }),
  scholarship_type: scholarshipTypeEnum('scholarship_type').notNull(),
  description: text('description'),
  requirements: text('requirements'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Blog posts table
export const blogPostsTable = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(), // Rich text content
  excerpt: text('excerpt'),
  featured_image_url: text('featured_image_url'),
  is_published: boolean('is_published').notNull().default(false),
  author_id: integer('author_id').notNull().references(() => usersTable.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Define relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  blogPosts: many(blogPostsTable)
}));

export const boardingSchoolsRelations = relations(boardingSchoolsTable, ({ many }) => ({
  sports: many(schoolSportsTable),
  scholarships: many(schoolScholarshipsTable)
}));

export const schoolSportsRelations = relations(schoolSportsTable, ({ one }) => ({
  school: one(boardingSchoolsTable, {
    fields: [schoolSportsTable.school_id],
    references: [boardingSchoolsTable.id]
  })
}));

export const schoolScholarshipsRelations = relations(schoolScholarshipsTable, ({ one }) => ({
  school: one(boardingSchoolsTable, {
    fields: [schoolScholarshipsTable.school_id],
    references: [boardingSchoolsTable.id]
  })
}));

export const blogPostsRelations = relations(blogPostsTable, ({ one }) => ({
  author: one(usersTable, {
    fields: [blogPostsTable.author_id],
    references: [usersTable.id]
  })
}));

// TypeScript types for the table schemas
export type BoardingSchool = typeof boardingSchoolsTable.$inferSelect;
export type NewBoardingSchool = typeof boardingSchoolsTable.$inferInsert;
export type SchoolSport = typeof schoolSportsTable.$inferSelect;
export type NewSchoolSport = typeof schoolSportsTable.$inferInsert;
export type SchoolScholarship = typeof schoolScholarshipsTable.$inferSelect;
export type NewSchoolScholarship = typeof schoolScholarshipsTable.$inferInsert;
export type BlogPost = typeof blogPostsTable.$inferSelect;
export type NewBlogPost = typeof blogPostsTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  boardingSchools: boardingSchoolsTable,
  schoolSports: schoolSportsTable,
  schoolScholarships: schoolScholarshipsTable,
  blogPosts: blogPostsTable
};
