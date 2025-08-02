
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { createUser } from '../handlers/create_user';
import { eq } from 'drizzle-orm';

const testInput: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User',
  role: 'user'
};

const adminInput: CreateUserInput = {
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin'
};

describe('createUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a user with default role', async () => {
    const inputWithoutRole: CreateUserInput = {
      email: 'user@example.com',
      name: 'Regular User',
      role: 'user' // Zod default already applied
    };

    const result = await createUser(inputWithoutRole);

    expect(result.email).toEqual('user@example.com');
    expect(result.name).toEqual('Regular User');
    expect(result.role).toEqual('user');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a user with admin role', async () => {
    const result = await createUser(adminInput);

    expect(result.email).toEqual('admin@example.com');
    expect(result.name).toEqual('Admin User');
    expect(result.role).toEqual('admin');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save user to database', async () => {
    const result = await createUser(testInput);

    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual('test@example.com');
    expect(users[0].name).toEqual('Test User');
    expect(users[0].role).toEqual('user');
    expect(users[0].created_at).toBeInstanceOf(Date);
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should reject duplicate email addresses', async () => {
    // Create first user
    await createUser(testInput);

    // Attempt to create user with same email
    const duplicateInput: CreateUserInput = {
      email: 'test@example.com',
      name: 'Another User',
      role: 'admin'
    };

    await expect(createUser(duplicateInput))
      .rejects.toThrow(/already exists/i);
  });

  it('should allow different users with different emails', async () => {
    const user1 = await createUser(testInput);
    const user2 = await createUser(adminInput);

    expect(user1.id).not.toEqual(user2.id);
    expect(user1.email).toEqual('test@example.com');
    expect(user2.email).toEqual('admin@example.com');

    // Verify both are in database
    const allUsers = await db.select()
      .from(usersTable)
      .execute();

    expect(allUsers).toHaveLength(2);
  });

  it('should set timestamps correctly', async () => {
    const beforeCreate = new Date();
    const result = await createUser(testInput);
    const afterCreate = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
  });
});
