
import { db } from '../db';
import { blogPostsTable, usersTable } from '../db/schema';
import { type GetBlogPostsInput, type BlogPost } from '../schema';
import { eq, desc } from 'drizzle-orm';

export async function getBlogPosts(input: GetBlogPostsInput): Promise<BlogPost[]> {
  try {
    // Build the complete query based on conditions
    const baseQuery = db.select({
      id: blogPostsTable.id,
      title: blogPostsTable.title,
      slug: blogPostsTable.slug,
      content: blogPostsTable.content,
      excerpt: blogPostsTable.excerpt,
      featured_image_url: blogPostsTable.featured_image_url,
      is_published: blogPostsTable.is_published,
      author_id: blogPostsTable.author_id,
      created_at: blogPostsTable.created_at,
      updated_at: blogPostsTable.updated_at
    })
    .from(blogPostsTable)
    .innerJoin(usersTable, eq(blogPostsTable.author_id, usersTable.id));

    // Create the final query with all conditions applied
    const finalQuery = input.published_only
      ? baseQuery
          .where(eq(blogPostsTable.is_published, true))
          .orderBy(desc(blogPostsTable.created_at))
          .limit(input.limit)
          .offset(input.offset)
      : baseQuery
          .orderBy(desc(blogPostsTable.created_at))
          .limit(input.limit)
          .offset(input.offset);

    const results = await finalQuery.execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    throw error;
  }
}
