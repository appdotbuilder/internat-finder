
import { db } from '../db';
import { blogPostsTable, usersTable } from '../db/schema';
import { type CreateBlogPostInput, type BlogPost } from '../schema';
import { eq } from 'drizzle-orm';

export const createBlogPost = async (input: CreateBlogPostInput): Promise<BlogPost> => {
  try {
    // Validate that the author exists and has admin role
    const author = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.author_id))
      .execute();

    if (author.length === 0) {
      throw new Error('Author not found');
    }

    if (author[0].role !== 'admin') {
      throw new Error('Only admin users can create blog posts');
    }

    // Check if slug is unique
    const existingPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.slug, input.slug))
      .execute();

    if (existingPost.length > 0) {
      throw new Error('Blog post with this slug already exists');
    }

    // Insert the blog post
    const result = await db.insert(blogPostsTable)
      .values({
        title: input.title,
        slug: input.slug,
        content: input.content,
        excerpt: input.excerpt,
        featured_image_url: input.featured_image_url,
        is_published: input.is_published,
        author_id: input.author_id
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Blog post creation failed:', error);
    throw error;
  }
};
