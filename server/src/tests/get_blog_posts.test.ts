
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, blogPostsTable } from '../db/schema';
import { type GetBlogPostsInput, getBlogPostsInputSchema } from '../schema';
import { getBlogPosts } from '../handlers/get_blog_posts';

describe('getBlogPosts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUserId: number;

  beforeEach(async () => {
    // Create test user first (required for foreign key)
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test Author',
        role: 'admin'
      })
      .returning()
      .execute();
    
    testUserId = userResult[0].id;
  });

  it('should return empty array when no blog posts exist', async () => {
    const input = getBlogPostsInputSchema.parse({});
    const result = await getBlogPosts(input);
    expect(result).toEqual([]);
  });

  it('should return all published posts when published_only is true', async () => {
    // Create published and unpublished posts
    await db.insert(blogPostsTable)
      .values([
        {
          title: 'Published Post',
          slug: 'published-post',
          content: 'This is published content',
          is_published: true,
          author_id: testUserId
        },
        {
          title: 'Draft Post',
          slug: 'draft-post',
          content: 'This is draft content',
          is_published: false,
          author_id: testUserId
        }
      ])
      .execute();

    const input = getBlogPostsInputSchema.parse({ published_only: true });
    const result = await getBlogPosts(input);

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Published Post');
    expect(result[0].is_published).toBe(true);
    expect(result[0].author_id).toEqual(testUserId);
  });

  it('should return all posts when published_only is false', async () => {
    // Create published and unpublished posts
    await db.insert(blogPostsTable)
      .values([
        {
          title: 'Published Post',
          slug: 'published-post',
          content: 'This is published content',
          is_published: true,
          author_id: testUserId
        },
        {
          title: 'Draft Post',
          slug: 'draft-post',
          content: 'This is draft content',
          is_published: false,
          author_id: testUserId
        }
      ])
      .execute();

    const input = getBlogPostsInputSchema.parse({ published_only: false });
    const result = await getBlogPosts(input);

    expect(result).toHaveLength(2);
    expect(result.some(post => post.title === 'Published Post')).toBe(true);
    expect(result.some(post => post.title === 'Draft Post')).toBe(true);
  });

  it('should order posts by created_at DESC (newest first)', async () => {
    // Create posts with different timestamps
    const firstPost = await db.insert(blogPostsTable)
      .values({
        title: 'First Post',
        slug: 'first-post',
        content: 'First content',
        is_published: true,
        author_id: testUserId
      })
      .returning()
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondPost = await db.insert(blogPostsTable)
      .values({
        title: 'Second Post',
        slug: 'second-post',
        content: 'Second content',
        is_published: true,
        author_id: testUserId
      })
      .returning()
      .execute();

    const input = getBlogPostsInputSchema.parse({});
    const result = await getBlogPosts(input);

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Second Post'); // Newest first
    expect(result[1].title).toEqual('First Post');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should apply pagination correctly', async () => {
    // Create multiple posts
    const posts = Array.from({ length: 5 }, (_, i) => ({
      title: `Post ${i + 1}`,
      slug: `post-${i + 1}`,
      content: `Content ${i + 1}`,
      is_published: true,
      author_id: testUserId
    }));

    await db.insert(blogPostsTable).values(posts).execute();

    // Test limit
    const limitInput = getBlogPostsInputSchema.parse({ limit: 2 });
    const limitResult = await getBlogPosts(limitInput);
    expect(limitResult).toHaveLength(2);

    // Test offset
    const offsetInput = getBlogPostsInputSchema.parse({ limit: 2, offset: 2 });
    const offsetResult = await getBlogPosts(offsetInput);
    expect(offsetResult).toHaveLength(2);
    
    // Verify different posts returned
    expect(limitResult[0].id).not.toEqual(offsetResult[0].id);
  });

  it('should use default values when no input provided', async () => {
    // Create mix of published and unpublished posts
    await db.insert(blogPostsTable)
      .values([
        {
          title: 'Published Post',
          slug: 'published-post',
          content: 'Published content',
          is_published: true,
          author_id: testUserId
        },
        {
          title: 'Draft Post',
          slug: 'draft-post',
          content: 'Draft content',
          is_published: false,
          author_id: testUserId
        }
      ])
      .execute();

    // Call with empty object (should use defaults: published_only: true, limit: 10, offset: 0)
    const input = getBlogPostsInputSchema.parse({});
    const result = await getBlogPosts(input);

    expect(result).toHaveLength(1); // Only published post
    expect(result[0].is_published).toBe(true);
  });

  it('should include all required blog post fields', async () => {
    await db.insert(blogPostsTable)
      .values({
        title: 'Test Post',
        slug: 'test-post',
        content: 'Test content',
        excerpt: 'Test excerpt',
        featured_image_url: 'https://example.com/image.jpg',
        is_published: true,
        author_id: testUserId
      })
      .execute();

    const input = getBlogPostsInputSchema.parse({});
    const result = await getBlogPosts(input);

    expect(result).toHaveLength(1);
    const post = result[0];
    
    expect(post.id).toBeDefined();
    expect(post.title).toEqual('Test Post');
    expect(post.slug).toEqual('test-post');
    expect(post.content).toEqual('Test content');
    expect(post.excerpt).toEqual('Test excerpt');
    expect(post.featured_image_url).toEqual('https://example.com/image.jpg');
    expect(post.is_published).toBe(true);
    expect(post.author_id).toEqual(testUserId);
    expect(post.created_at).toBeInstanceOf(Date);
    expect(post.updated_at).toBeInstanceOf(Date);
  });
});
