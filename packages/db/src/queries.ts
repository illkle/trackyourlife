import { defineQueries, defineQuery } from "@rocicorp/zero";
import { z } from "zod";

import { zql } from "./zero-schema";

export const queries = defineQueries({
  trackablesList: defineQuery(z.object(), ({ ctx }) =>
    zql.TYL_trackable.where("user_id", "=", ctx.userID)
      .orderBy("name", "asc")
      .related("trackableGroup"),
  ),

  trackablesListWithData: defineQuery(
    z.object({
      firstDay: z.number(),
      lastDay: z.number(),
    }),
    ({ args: { firstDay, lastDay }, ctx }) =>
      zql.TYL_trackable.where("user_id", "=", ctx.userID)
        .orderBy("name", "asc")
        .related("trackableRecord", (q) =>
          q
            .where(({ cmp, and }) =>
              and(cmp("date", ">=", firstDay), cmp("date", "<=", lastDay)),
            )
            .orderBy("date", "asc")
            .orderBy("created_at", "asc"),
        )
        .related("trackableGroup"),
  ),

  trackableById: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id }, ctx }) =>
      zql.TYL_trackable.where("id", "=", id)
        .where("user_id", "=", ctx.userID)
        .one()
        .related("trackableGroup"),
  ),

  trackableData: defineQuery(
    z.object({
      id: z.string(),
      firstDay: z.number(),
      lastDay: z.number(),
    }),
    ({ args: { id, firstDay, lastDay }, ctx }) =>
      zql.TYL_trackableRecord.where(({ cmp, and }) =>
        and(
          cmp("trackable_id", "=", id),
          cmp("user_id", "=", ctx.userID),
          cmp("date", ">=", firstDay),
          cmp("date", "<=", lastDay),
        ),
      )
        .orderBy("date", "asc")
        .orderBy("created_at", "asc"),
  ),

  trackableMonthViewData: defineQuery(
    z.object({
      id: z.string(),
      startDate: z.number(),
      endDate: z.number(),
    }),
    ({ args: { id, startDate, endDate }, ctx }) =>
      zql.TYL_trackableRecord.where("trackable_id", "=", id)
        .where("date", ">=", startDate)
        .where("date", "<=", endDate)
        .where("user_id", "=", ctx.userID),
  ),

  trackableYearViewData: defineQuery(
    z.object({
      id: z.string(),
      startDate: z.number(),
      endDate: z.number(),
    }),
    ({ args: { id, startDate, endDate }, ctx }) =>
      zql.TYL_trackableRecord.where("trackable_id", "=", id)
        .where("date", ">=", startDate)
        .where("date", "<=", endDate)
        .where("user_id", "=", ctx.userID),
  ),

  corePreload: defineQuery(
    z.object({
      sinceDate: z.number(),
    }),
    ({ args: { sinceDate }, ctx }) =>
      zql.TYL_trackable.where("user_id", "=", ctx.userID)
        .related("trackableRecord", (q) => q.where("date", ">=", sinceDate))
        .related("trackableGroup")
        .related("trackableFlag"),
  ),

  userFlags: defineQuery(z.object({}), ({ ctx }) =>
    zql.TYL_userFlags.where("user_id", "=", ctx.userID),
  ),

  groupList: defineQuery(
    z.object({ group: z.string() }),
    ({ args: { group }, ctx }) =>
      zql.TYL_trackableGroup.where("group", "=", group).where(
        "user_id",
        "=",
        ctx.userID,
      ),
  ),

  trackableInGroup: defineQuery(
    z.object({
      trackableId: z.string(),
      group: z.string(),
    }),
    ({ args: { trackableId, group }, ctx }) =>
      zql.TYL_trackableGroup.where(({ cmp, and }) =>
        and(
          cmp("user_id", "=", ctx.userID),
          cmp("trackable_id", "=", trackableId),
          cmp("group", "=", group),
        ),
      ).limit(1),
  ),

  trackableDay: defineQuery(
    z.object({
      trackableId: z.string(),
      dayStart: z.number(),
      dayEnd: z.number(),
    }),
    ({ args: { trackableId, dayStart, dayEnd }, ctx }) =>
      zql.TYL_trackable.where("id", "=", trackableId)
        .where("user_id", "=", ctx.userID)
        .one()
        .related("trackableRecord", (q) =>
          q
            .where(({ cmp, and }) =>
              and(cmp("date", ">=", dayStart), cmp("date", "<=", dayEnd)),
            )
            .orderBy("date", "asc")
            .orderBy("value", "asc")
            .orderBy("created_at", "asc"),
        ),
  ),
  flags: defineQuery(
    z.object({ ids: z.array(z.string()) }),
    ({ args, ctx }) => {
      if (args.ids.length > 0) {
        return zql.TYL_trackableFlags.where("user_id", "=", ctx.userID).where(
          "trackable_id",
          "IN",
          args.ids,
        );
      }

      return zql.TYL_trackableFlags.where("user_id", "=", ctx.userID);
    },
  ),
});
