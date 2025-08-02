
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable, usersTable } from '../db/schema';
import { type CreateBlogPostInput } from '../schema';
import { createBlogPost } from '../handlers/create_blog_post';
import { eq } from 'drizzle-orm';

// Test data
const adminUser = {
  email: 'admin@test.com',
  name: 'Admin User',
  role: 'admin' as const
};

const regularUser = {
  email: 'user@test.com',
  name: 'Regular User',
  role: 'user' as const
};

describe('createBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a blog post with admin user', async () => {
    // Create admin user
    const [author] = await db.insert(usersTable)
      .values(adminUser)
      .returning()
      .execute();

    const testInput: CreateBlogPostInput = {
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      content: 'This is test content for the blog post.',
      excerpt: 'Test excerpt',
      featured_image_url: 'https://example.com/image.jpg',
      is_published: true,
      author_id: author.id
    };

    const result = await createBlogPost(testInput);

    // Validate returned blog post
    expect(result.title).toEqual('Test Blog Post');
    expect(result.slug).toEqual('test-blog-post');
    expect(result.content).toEqual('This is test content for the blog post.');
    expect(result.excerpt).toEqual('Test excerpt');
    expect(result.featured_image_url).toEqual('https://example.com/image.jpg');
    expect(result.is_published).toEqual(true);
    expect(result.author_id).toEqual(author.id);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save blog post to database', async () => {
    // Create admin user
    const [author] = await db.insert(usersTable)
      .values(adminUser)
      .returning()
      .execute();

    const testInput: CreateBlogPostInput = {
      title: 'Database Test Post',
      slug: 'database-test-post',
      content: 'Content for database test',
      excerpt: null,
      featured_image_url: null,
      is_published: false,
      author_id: author.id
    };

    const result = await createBlogPost(testInput);

    // Query database to verify post was saved
    const blogPosts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, result.id))
      .execute();

    expect(blogPosts).toHaveLength(1);
    expect(blogPosts[0].title).toEqual('Database Test Post');
    expect(blogPosts[0].slug).toEqual('database-test-post');
    expect(blogPosts[0].content).toEqual('Content for database test');
    expect(blogPosts[0].excerpt).toBeNull();
    expect(blogPosts[0].featured_image_url).toBeNull();
    expect(blogPosts[0].is_published).toEqual(false);
    expect(blogPosts[0].author_id).toEqual(author.id);
  });

  it('should throw error when author does not exist', async () => {
    const testInput: CreateBlogPostInput = {
      title: 'Test Post',
      slug: 'test-post',
      content: 'Test content',
      excerpt: null,
      featured_image_url: null,
      is_published: false,
      author_id: 999 // Non-existent author ID
    };

    await expect(createBlogPost(testInput)).rejects.toThrow(/author not found/i);
  });

  it('should throw error when author is not admin', async () => {
    // Create regular user
    const [author] = await db.insert(usersTable)
      .values(regularUser)
      .returning()
      .execute();

    const testInput: CreateBlogPostInput = {
      title: 'Test Post',
      slug: 'test-post',
      content: 'Test content',
      excerpt: null,
      featured_image_url: null,
      is_published: false,
      author_id: author.id
    };

    await expect(createBlogPost(testInput)).rejects.toThrow(/only admin users can create blog posts/i);
  });

  it('should throw error when slug already exists', async () => {
    // Create admin user
    const [author] = await db.insert(usersTable)
      .values(adminUser)
      .returning()
      .execute();

    // Create first blog post
    const firstInput: CreateBlogPostInput = {
      title: 'First Post',
      slug: 'duplicate-slug',
      content: 'First post content',
      excerpt: null,
      featured_image_url: null,
      is_published: false,
      author_id: author.id
    };

    await createBlogPost(firstInput);

    // Try to create second blog post with same slug
    const secondInput: CreateBlogPostInput = {
      title: 'Second Post',
      slug: 'duplicate-slug',
      content: 'Second post content',
      excerpt: null,
      featured_image_url: null,
      is_published: false,
      author_id: author.id
    };

    await expect(createBlogPost(secondInput)).rejects.toThrow(/blog post with this slug already exists/i);
  });
});
