
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable, usersTable } from '../db/schema';
import { deleteBlogPost } from '../handlers/delete_blog_post';
import { eq } from 'drizzle-orm';

describe('deleteBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing blog post', async () => {
    // Create a test user first (required for foreign key)
    const userResult = await db.insert(usersTable)
      .values({
        email: 'author@test.com',
        name: 'Test Author',
        role: 'admin'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create a test blog post
    const blogResult = await db.insert(blogPostsTable)
      .values({
        title: 'Test Blog Post',
        slug: 'test-blog-post',
        content: 'This is test content',
        excerpt: 'Test excerpt',
        featured_image_url: 'https://example.com/image.jpg',
        is_published: true,
        author_id: userId
      })
      .returning()
      .execute();

    const blogId = blogResult[0].id;

    // Delete the blog post
    const result = await deleteBlogPost(blogId);

    // Verify deletion was successful
    expect(result.success).toBe(true);

    // Verify the post no longer exists in database
    const deletedPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, blogId))
      .execute();

    expect(deletedPost).toHaveLength(0);
  });

  it('should throw error when blog post does not exist', async () => {
    const nonExistentId = 999;

    await expect(deleteBlogPost(nonExistentId))
      .rejects
      .toThrow(/Blog post with ID 999 not found/i);
  });

  it('should verify post exists before attempting deletion', async () => {
    // Create a test user first
    const userResult = await db.insert(usersTable)
      .values({
        email: 'author@test.com',
        name: 'Test Author',
        role: 'user'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create multiple blog posts
    const blog1Result = await db.insert(blogPostsTable)
      .values({
        title: 'First Blog Post',
        slug: 'first-blog-post',
        content: 'First content',
        excerpt: null,
        featured_image_url: null,
        is_published: false,
        author_id: userId
      })
      .returning()
      .execute();

    const blog2Result = await db.insert(blogPostsTable)
      .values({
        title: 'Second Blog Post',
        slug: 'second-blog-post',
        content: 'Second content',
        excerpt: 'Second excerpt',
        featured_image_url: 'https://example.com/image2.jpg',
        is_published: true,
        author_id: userId
      })
      .returning()
      .execute();

    const blog1Id = blog1Result[0].id;
    const blog2Id = blog2Result[0].id;

    // Delete only the first blog post
    const result = await deleteBlogPost(blog1Id);
    expect(result.success).toBe(true);

    // Verify first post is deleted
    const deletedPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, blog1Id))
      .execute();

    expect(deletedPost).toHaveLength(0);

    // Verify second post still exists
    const remainingPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, blog2Id))
      .execute();

    expect(remainingPost).toHaveLength(1);
    expect(remainingPost[0].title).toEqual('Second Blog Post');
  });
});
