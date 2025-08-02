
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, blogPostsTable } from '../db/schema';
import { type CreateUserInput, type CreateBlogPostInput } from '../schema';
import { getBlogPostBySlug } from '../handlers/get_blog_post_by_slug';

const testUser: CreateUserInput = {
  email: 'author@example.com',
  name: 'Test Author',
  role: 'admin'
};

const testBlogPost: CreateBlogPostInput = {
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  content: 'This is test content for the blog post.',
  excerpt: 'Test excerpt',
  featured_image_url: 'https://example.com/image.jpg',
  is_published: true,
  author_id: 1 // Will be set after user creation
};

describe('getBlogPostBySlug', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return blog post by slug', async () => {
    // Create test user first
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    
    const userId = userResult[0].id;

    // Create test blog post
    await db.insert(blogPostsTable)
      .values({
        ...testBlogPost,
        author_id: userId
      })
      .execute();

    // Test the handler
    const result = await getBlogPostBySlug('test-blog-post');

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Test Blog Post');
    expect(result!.slug).toEqual('test-blog-post');
    expect(result!.content).toEqual('This is test content for the blog post.');
    expect(result!.excerpt).toEqual('Test excerpt');
    expect(result!.featured_image_url).toEqual('https://example.com/image.jpg');
    expect(result!.is_published).toBe(true);
    expect(result!.author_id).toEqual(userId);
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent slug', async () => {
    const result = await getBlogPostBySlug('non-existent-slug');
    expect(result).toBeNull();
  });

  it('should return unpublished posts', async () => {
    // Create test user first
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    
    const userId = userResult[0].id;

    // Create unpublished blog post
    await db.insert(blogPostsTable)
      .values({
        ...testBlogPost,
        slug: 'unpublished-post',
        is_published: false,
        author_id: userId
      })
      .execute();

    // Test the handler
    const result = await getBlogPostBySlug('unpublished-post');

    expect(result).not.toBeNull();
    expect(result!.slug).toEqual('unpublished-post');
    expect(result!.is_published).toBe(false);
  });

  it('should handle posts with null optional fields', async () => {
    // Create test user first
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    
    const userId = userResult[0].id;

    // Create blog post with null optional fields
    await db.insert(blogPostsTable)
      .values({
        title: 'Minimal Post',
        slug: 'minimal-post',
        content: 'Just basic content',
        excerpt: null,
        featured_image_url: null,
        is_published: true,
        author_id: userId
      })
      .execute();

    // Test the handler
    const result = await getBlogPostBySlug('minimal-post');

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Minimal Post');
    expect(result!.excerpt).toBeNull();
    expect(result!.featured_image_url).toBeNull();
    expect(result!.is_published).toBe(true);
  });
});
