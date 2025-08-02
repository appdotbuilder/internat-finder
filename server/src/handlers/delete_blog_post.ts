
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteBlogPost(id: number): Promise<{ success: boolean }> {
  try {
    // First verify the blog post exists
    const existingPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, id))
      .execute();

    if (existingPost.length === 0) {
      throw new Error(`Blog post with ID ${id} not found`);
    }

    // Delete the blog post
    const result = await db.delete(blogPostsTable)
      .where(eq(blogPostsTable.id, id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Blog post deletion failed:', error);
    throw error;
  }
}
