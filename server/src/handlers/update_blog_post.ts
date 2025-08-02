
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type UpdateBlogPostInput, type BlogPost } from '../schema';
import { eq } from 'drizzle-orm';

export const updateBlogPost = async (input: UpdateBlogPostInput): Promise<BlogPost> => {
  try {
    // First verify the post exists
    const existingPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, input.id))
      .execute();

    if (existingPost.length === 0) {
      throw new Error(`Blog post with id ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.slug !== undefined) {
      updateData.slug = input.slug;
    }
    if (input.content !== undefined) {
      updateData.content = input.content;
    }
    if (input.excerpt !== undefined) {
      updateData.excerpt = input.excerpt;
    }
    if (input.featured_image_url !== undefined) {
      updateData.featured_image_url = input.featured_image_url;
    }
    if (input.is_published !== undefined) {
      updateData.is_published = input.is_published;
    }

    // Update the blog post
    const result = await db.update(blogPostsTable)
      .set(updateData)
      .where(eq(blogPostsTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Blog post update failed:', error);
    throw error;
  }
};
