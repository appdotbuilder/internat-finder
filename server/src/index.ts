
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createBoardingSchoolInputSchema,
  updateBoardingSchoolInputSchema,
  filterSchoolsInputSchema,
  createBlogPostInputSchema,
  updateBlogPostInputSchema,
  getBlogPostsInputSchema,
  createUserInputSchema
} from './schema';

// Import handlers
import { createBoardingSchool } from './handlers/create_boarding_school';
import { getBoardingSchools } from './handlers/get_boarding_schools';
import { getBoardingSchoolById } from './handlers/get_boarding_school_by_id';
import { updateBoardingSchool } from './handlers/update_boarding_school';
import { deleteBoardingSchool } from './handlers/delete_boarding_school';
import { createBlogPost } from './handlers/create_blog_post';
import { getBlogPosts } from './handlers/get_blog_posts';
import { getBlogPostBySlug } from './handlers/get_blog_post_by_slug';
import { updateBlogPost } from './handlers/update_blog_post';
import { deleteBlogPost } from './handlers/delete_blog_post';
import { createUser } from './handlers/create_user';
import { getFeaturedSchools } from './handlers/get_featured_schools';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Boarding Schools routes
  createBoardingSchool: publicProcedure
    .input(createBoardingSchoolInputSchema)
    .mutation(({ input }) => createBoardingSchool(input)),

  getBoardingSchools: publicProcedure
    .input(filterSchoolsInputSchema.optional())
    .query(({ input }) => getBoardingSchools(input)),

  getBoardingSchoolById: publicProcedure
    .input(z.number())
    .query(({ input }) => getBoardingSchoolById(input)),

  updateBoardingSchool: publicProcedure
    .input(updateBoardingSchoolInputSchema)
    .mutation(({ input }) => updateBoardingSchool(input)),

  deleteBoardingSchool: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteBoardingSchool(input)),

  getFeaturedSchools: publicProcedure
    .query(() => getFeaturedSchools()),

  // Blog Posts routes
  createBlogPost: publicProcedure
    .input(createBlogPostInputSchema)
    .mutation(({ input }) => createBlogPost(input)),

  getBlogPosts: publicProcedure
    .input(getBlogPostsInputSchema.optional())
    .query(({ input }) => getBlogPosts(input)),

  getBlogPostBySlug: publicProcedure
    .input(z.string())
    .query(({ input }) => getBlogPostBySlug(input)),

  updateBlogPost: publicProcedure
    .input(updateBlogPostInputSchema)
    .mutation(({ input }) => updateBlogPost(input)),

  deleteBlogPost: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteBlogPost(input)),

  // User routes
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
