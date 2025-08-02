
import { db } from '../db';
import { blogPostsTable, usersTable } from '../db/schema';
import { type BlogPost } from '../schema';
import { eq } from 'drizzle-orm';

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const results = await db.select()
      .from(blogPostsTable)
      .innerJoin(usersTable, eq(blogPostsTable.author_id, usersTable.id))
      .where(eq(blogPostsTable.slug, slug))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const result = results[0];
    
    return {
      id: result.blog_posts.id,
      title: result.blog_posts.title,
      slug: result.blog_posts.slug,
      content: result.blog_posts.content,
      excerpt: result.blog_posts.excerpt,
      featured_image_url: result.blog_posts.featured_image_url,
      is_published: result.blog_posts.is_published,
      author_id: result.blog_posts.author_id,
      created_at: result.blog_posts.created_at,
      updated_at: result.blog_posts.updated_at
    };
  } catch (error) {
    console.error('Failed to get blog post by slug:', error);
    throw error;
  }
}
