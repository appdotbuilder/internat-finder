
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable, usersTable } from '../db/schema';
import { type UpdateBlogPostInput, type CreateUserInput } from '../schema';
import { updateBlogPost } from '../handlers/update_blog_post';
import { eq } from 'drizzle-orm';

// Test user data
const testUser: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin'
};

describe('updateBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a blog post with all fields', async () => {
    // Create test user first
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create initial blog post
    const initialPost = await db.insert(blogPostsTable)
      .values({
        title: 'Original Title',
        slug: 'original-slug',
        content: 'Original content',
        excerpt: 'Original excerpt',
        featured_image_url: 'https://example.com/original.jpg',
        is_published: false,
        author_id: userId
      })
      .returning()
      .execute();

    const postId = initialPost[0].id;

    // Update the post
    const updateInput: UpdateBlogPostInput = {
      id: postId,
      title: 'Updated Title',
      slug: 'updated-slug',
      content: 'Updated content',
      excerpt: 'Updated excerpt',
      featured_image_url: 'https://example.com/updated.jpg',
      is_published: true
    };

    const result = await updateBlogPost(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(postId);
    expect(result.title).toEqual('Updated Title');
    expect(result.slug).toEqual('updated-slug');
    expect(result.content).toEqual('Updated content');
    expect(result.excerpt).toEqual('Updated excerpt');
    expect(result.featured_image_url).toEqual('https://example.com/updated.jpg');
    expect(result.is_published).toEqual(true);
    expect(result.author_id).toEqual(userId);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(result.created_at.getTime());
  });

  it('should update only specified fields', async () => {
    // Create test user first
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create initial blog post
    const initialPost = await db.insert(blogPostsTable)
      .values({
        title: 'Original Title',
        slug: 'original-slug',
        content: 'Original content',
        excerpt: 'Original excerpt',
        featured_image_url: 'https://example.com/original.jpg',
        is_published: false,
        author_id: userId
      })
      .returning()
      .execute();

    const postId = initialPost[0].id;

    // Update only title and is_published
    const updateInput: UpdateBlogPostInput = {
      id: postId,
      title: 'Updated Title Only',
      is_published: true
    };

    const result = await updateBlogPost(updateInput);

    // Verify only specified fields were updated
    expect(result.title).toEqual('Updated Title Only');
    expect(result.is_published).toEqual(true);
    
    // Verify other fields remained unchanged
    expect(result.slug).toEqual('original-slug');
    expect(result.content).toEqual('Original content');
    expect(result.excerpt).toEqual('Original excerpt');
    expect(result.featured_image_url).toEqual('https://example.com/original.jpg');
    expect(result.author_id).toEqual(userId);
  });

  it('should save updated blog post to database', async () => {
    // Create test user first
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create initial blog post
    const initialPost = await db.insert(blogPostsTable)
      .values({
        title: 'Original Title',
        slug: 'original-slug',
        content: 'Original content',
        excerpt: 'Original excerpt',
        featured_image_url: 'https://example.com/original.jpg',
        is_published: false,
        author_id: userId
      })
      .returning()
      .execute();

    const postId = initialPost[0].id;

    // Update the post
    const updateInput: UpdateBlogPostInput = {
      id: postId,
      title: 'Database Updated Title',
      content: 'Database updated content'
    };

    await updateBlogPost(updateInput);

    // Verify changes were saved to database
    const savedPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, postId))
      .execute();

    expect(savedPost).toHaveLength(1);
    expect(savedPost[0].title).toEqual('Database Updated Title');
    expect(savedPost[0].content).toEqual('Database updated content');
    expect(savedPost[0].slug).toEqual('original-slug'); // Unchanged
    expect(savedPost[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle nullable fields correctly', async () => {
    // Create test user first
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create initial blog post with non-null nullable fields
    const initialPost = await db.insert(blogPostsTable)
      .values({
        title: 'Original Title',
        slug: 'original-slug',
        content: 'Original content',
        excerpt: 'Original excerpt',
        featured_image_url: 'https://example.com/original.jpg',
        is_published: false,
        author_id: userId
      })
      .returning()
      .execute();

    const postId = initialPost[0].id;

    // Update nullable fields to null
    const updateInput: UpdateBlogPostInput = {
      id: postId,
      excerpt: null,
      featured_image_url: null
    };

    const result = await updateBlogPost(updateInput);

    // Verify nullable fields were set to null
    expect(result.excerpt).toBeNull();
    expect(result.featured_image_url).toBeNull();
    
    // Verify other fields remained unchanged
    expect(result.title).toEqual('Original Title');
    expect(result.content).toEqual('Original content');
  });

  it('should throw error when blog post does not exist', async () => {
    const updateInput: UpdateBlogPostInput = {
      id: 999999, // Non-existent ID
      title: 'Updated Title'
    };

    await expect(updateBlogPost(updateInput)).rejects.toThrow(/blog post with id 999999 not found/i);
  });
});
