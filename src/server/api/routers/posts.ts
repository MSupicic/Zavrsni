import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

//import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
//import { Redis } from "@upstash/redis";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import type { Post, prethodni, rating } from "@prisma/client";

const addUserDataToPosts = async (posts: Post[]) => {
  const userId = posts.map((post) => post.authorId);
  const users = (
    await clerkClient.users.getUserList({
      userId: userId,
      limit: 110,
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);

    if (!author) {
      console.error("AUTHOR NOT FOUND", post);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Author for post not found. POST ID: ${post.id}, USER ID: ${post.authorId}`,
      });
    }
    if (!author.username) {
      // user the ExternalUsername
      if (!author.externalUsername) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Author has no Google Account: ${author.id}`,
        });
      }
      author.username = author.externalUsername;
    }
    return {
      post,
      author: {
        ...author,
        username: author.username ?? "(username not found)",
      },
    };
  });
};

const addUserDataToPrethodni = async (preths: prethodni[]) => {
  const userId = preths.map((preth) => preth.authorId);
  const users = (
    await clerkClient.users.getUserList({
      userId: userId,
      limit: 110,
    })
  ).map(filterUserForClient);

  return preths.map((preth) => {
    const author = users.find((user) => user.id === preth.authorId);

    if (!author) {
      console.error("AUTHOR NOT FOUND", preth);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Author for preth not found. preth ID: ${preth.id}, USER ID: ${preth.authorId}`,
      });
    }
    if (!author.username) {
      // user the ExternalUsername
      if (!author.externalUsername) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Author has no Google Account: ${author.id}`,
        });
      }
      author.username = author.externalUsername;
    }
    return {
      preth,
      author: {
        ...author,
        username: author.username ?? "(username not found)",
      },
    };
  });
};

// const addUserDataToRatings = async (posts: rating[]) => {
//   const userId = posts.map((post) => post.);
//   const users = (
//     await clerkClient.users.getUserList({
//       userId: userId,
//       limit: 110,
//     })
//   ).map(filterUserForClient);

//   return posts.map((post) => {
//     const author = users.find((user) => user.id === post.authorId);

//     if (!author) {
//       console.error("AUTHOR NOT FOUND", post);
//       throw new TRPCError({
//         code: "INTERNAL_SERVER_ERROR",
//         message: `Author for post not found. POST ID: ${post.id}, USER ID: ${post.authorId}`,
//       });
//     }
//     if (!author.username) {
//       // user the ExternalUsername
//       if (!author.externalUsername) {
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: `Author has no Google Account: ${author.id}`,
//         });
//       }
//       author.username = author.externalUsername;
//     }
//     return {
//       post,
//       author: {
//         ...author,
//         username: author.username ?? "(username not found)",
//       },
//     };
//   });
// };

// Create a new ratelimiter, that allows 3 requests per 1 minute
// const ratelimit = new Ratelimit({
//   redis: Redis.fromEnv(),
//   limiter: Ratelimit.slidingWindow(3, "1 m"),
//   analytics: true,
// });

export const postsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      return (await addUserDataToPosts([post]))[0];
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    return addUserDataToPosts(posts);
  }),

  getAllWorks: publicProcedure.query(async ({ ctx }) => {
    const works = await ctx.prisma.prethodni.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    return addUserDataToPrethodni(works);
  }),

  getPostsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(({ ctx, input }) =>
      ctx.prisma.post
        .findMany({
          where: {
            authorId: input.userId,
          },
          take: 100,
          orderBy: [{ createdAt: "desc" }],
        })
        .then(addUserDataToPosts)
    ),

  getWorksByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(({ ctx, input }) =>
      ctx.prisma.prethodni
        .findMany({
          where: {
            authorId: input.userId,
          },
          take: 100,
        })
        .then(addUserDataToPrethodni)
    ),

  // getRatingsByUserId

  create: privateProcedure
    .input(
      z.union([
        z.object({
          content: z.string().min(1).max(280),
          trazimUslugu: z.boolean(),
          kategorija: z.string(),
          lokacija: z.string(),
          cijena: z.number(),
        }),
        z.object({
          slika: z.string().min(1),
          opis: z.string().min(1),
        }),
      ])
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      // Check if the input contains `slika` and `opis` (for `prethodni`)
      if ("slika" in input && "opis" in input) {
        const prethodni = await ctx.prisma.prethodni.create({
          data: {
            authorId,
            slika: input.slika,
            opis: input.opis,
          },
        });
        return prethodni; // Return the created record for `prethodni`
      }

      // Otherwise, save to `Post`
      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
          trazimUslugu: input.trazimUslugu,
          kategorija: input.kategorija,
          lokacija: input.lokacija,
          cijena: input.cijena,
        },
      });
      return post; // Return the created record for `post`
    }),
});
