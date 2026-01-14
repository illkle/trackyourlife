import { defineMutator, defineMutators } from "@rocicorp/zero";
import { z } from "zod";

const trackableType = z.enum(["boolean", "number", "text"]);

// Helper to create deterministic composite IDs
const createCompositeId = (...parts: string[]) => parts.join("|");

export const mutators = defineMutators({
  // TYL_trackable mutations
  trackable: {
    insert: defineMutator(
      z.object({
        id: z.string(),
        name: z.string(),
        type: trackableType,
      }),
      async ({ tx, ctx, args }) => {
        await tx.mutate.TYL_trackable.insert({ ...args, user_id: ctx.userID });
      },
    ),
    update: defineMutator(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
      async ({ tx, ctx, args }) => {
        await tx.mutate.TYL_trackable.update({ ...args, user_id: ctx.userID });
      },
    ),
    delete: defineMutator(
      z.object({ id: z.string() }),
      async ({ tx, ctx, args }) => {
        await tx.mutate.TYL_trackable.delete({ ...args });
      },
    ),
  },

  // TYL_trackableRecord mutations
  trackableRecord: {
    insert: defineMutator(
      z.object({
        id: z.string(),
        date: z.number(),
        trackable_id: z.string(),
        value: z.string(),
        created_at: z.number().optional(),
        updated_at: z.number().optional(),
      }),
      async ({ tx, ctx, args }) => {
        await tx.mutate.TYL_trackableRecord.insert({
          ...args,
          user_id: ctx.userID,
        });
      },
    ),
    update: defineMutator(
      z.object({
        id: z.string(),
        value: z.string().optional(),
        updated_at: z.number().optional(),
      }),
      async ({ tx, ctx, args }) => {
        await tx.mutate.TYL_trackableRecord.update({
          ...args,
          user_id: ctx.userID,
        });
      },
    ),
    upsert: defineMutator(
      z.object({
        id: z.string(),
        date: z.number(),
        trackable_id: z.string(),
        value: z.string(),
        created_at: z.number().optional(),
        updated_at: z.number().optional(),
      }),
      async ({ tx, ctx, args }) => {
        await tx.mutate.TYL_trackableRecord.upsert({
          ...args,
          user_id: ctx.userID,
        });
      },
    ),
    delete: defineMutator(
      z.object({ id: z.string() }),
      async ({ tx, ctx, args }) => {
        await tx.mutate.TYL_trackableRecord.delete({
          ...args,
        });
      },
    ),
  },

  // TYL_trackableGroup mutations
  trackableGroup: {
    insert: defineMutator(
      z.object({
        trackable_id: z.string(),
        group: z.string(),
      }),
      async ({ tx, ctx, args }) => {
        const id = createCompositeId(args.trackable_id, args.group);
        await tx.mutate.TYL_trackableGroup.insert({
          id,
          ...args,
          user_id: ctx.userID,
        });
      },
    ),
    upsert: defineMutator(
      z.object({
        trackable_id: z.string(),
        group: z.string(),
      }),
      async ({ tx, ctx, args }) => {
        const id = createCompositeId(args.trackable_id, args.group);
        await tx.mutate.TYL_trackableGroup.upsert({
          id,
          ...args,
          user_id: ctx.userID,
        });
      },
    ),
    delete: defineMutator(
      z.object({
        trackable_id: z.string(),
        group: z.string(),
      }),
      async ({ tx, ctx, args }) => {
        const id = createCompositeId(args.trackable_id, args.group);
        await tx.mutate.TYL_trackableGroup.delete({
          id,
        });
      },
    ),
  },

  // TYL_trackableFlags mutations
  trackableFlags: {
    upsert: defineMutator(
      z.object({
        trackable_id: z.string(),
        key: z.string(),
        value: z.any().optional(),
      }),
      async ({ tx, ctx, args }) => {
        const id = createCompositeId(ctx.userID, args.trackable_id, args.key);
        await tx.mutate.TYL_trackableFlags.upsert({
          id,
          ...args,
          user_id: ctx.userID,
        });
      },
    ),
    delete: defineMutator(
      z.object({
        trackable_id: z.string(),
        key: z.string(),
      }),
      async ({ tx, ctx, args }) => {
        const id = createCompositeId(ctx.userID, args.trackable_id, args.key);
        await tx.mutate.TYL_trackableFlags.delete({
          id,
        });
      },
    ),
  },

  // TYL_userFlags mutations
  userFlags: {
    upsert: defineMutator(
      z.object({
        key: z.string(),
        value: z.any().optional(),
      }),
      async ({ tx, ctx, args }) => {
        const id = createCompositeId(ctx.userID, args.key);
        await tx.mutate.TYL_userFlags.upsert({
          id,
          ...args,
          user_id: ctx.userID,
        });
      },
    ),
    delete: defineMutator(
      z.object({
        key: z.string(),
      }),
      async ({ tx, ctx, args }) => {
        const id = createCompositeId(ctx.userID, args.key);
        await tx.mutate.TYL_userFlags.delete({
          id,
        });
      },
    ),
  },
});

export type Mutators = typeof mutators;
