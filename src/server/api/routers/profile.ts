import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user) {
        // if we hit here we need a unsantized username so hit api once more and find the user.
        const users = await clerkClient.users.getUserList({
          limit: 200,
        });
        const user = users.find((user) =>
          user.externalAccounts.find(
            (account) => account.username === input.username
          )
        );
        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User not found",
          });
        }

        return filterUserForClient(user);
      }

      return filterUserForClient(user);
    }),

  getUserById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const users = await clerkClient.users.getUserList({
        userId: [input.userId],
        limit: 1,
      });

      if (!users[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return filterUserForClient(users[0]);
    }),
});
