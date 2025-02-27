import { format } from "date-fns";
import { z } from "zod";

import type { ITrackableZero } from "@tyl/db/zero-schema";
import { and, between, db, eq, sql } from "@tyl/db";
import {
  trackable,
  trackableRecord,
  trackableRecordAttributes,
} from "@tyl/db/schema";
import { convertDateFromDbToLocal } from "@tyl/helpers/trackables";

export const zImportJson = z.object({
  date: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
  value: z.string(),
  updatedAt: z.number().nullable().optional(),
  externalKey: z.string().optional(),
  trackableRecordAttributes: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
        type: z.enum(["text", "number", "boolean"]),
      }),
    )
    .optional(),
});

export type IImportJson = z.infer<typeof zImportJson>;

export const importData = async (
  userId: string,
  data: IImportJson[],
  trackableId: string,
) => {
  const tr = await db.query.trackable.findFirst({
    where: eq(trackable.id, trackableId),
  });

  console.log("tr", tr);

  if (!tr) throw new Error("Trackable not found");

  const analysis = analyzeData(data, tr.type);

  console.log("analysis", analysis);

  if (analysis.typeCheckMisses > 0) {
    /** This will identify values with wrong types and throw error */

    throw new Error(
      "Json validation failed. " +
        "Encountered " +
        analysis.typeCheckMisses +
        " value" +
        (analysis.typeCheckMisses > 1 ? "s" : "") +
        " that do not match trackable type (number):" +
        analysis.typeCheckMissExamples.join(", "),
    );
  }

  const complexTrackable = tr.type === "logs";

  /** For logs we need existing values to determine if we should update or insert */
  const mapOfExistingRecords =
    complexTrackable && analysis.hasKeys
      ? await getMapOfExistingRecords(tr, analysis)
      : null;

  const toUpdate: { id: string; value: IImportJson }[] = [];
  const toInsert: IImportJson[] = [];

  for (const item of data) {
    const key = `${format(convertDateFromDbToLocal(item.date), "yyyy-MM-dd")}-${item.externalKey}`;

    const existingRecord = mapOfExistingRecords?.get(key);

    if (!existingRecord) {
      toInsert.push(item);
      continue;
    }

    if (!item.updatedAt) {
      // If there is no createdAt, we should never update
      continue;
    }

    if (
      !existingRecord.updatedAt ||
      existingRecord.updatedAt < item.updatedAt
    ) {
      // Update in value from import data is newer than db
      toUpdate.push({ id: existingRecord.recordId, value: item });
    }
  }
  await db.transaction(async (tx) => {
    try {
      if (toInsert.length > 0) {
        // Insert records then attributes
        const res = await tx
          .insert(trackableRecord)
          .values(
            toInsert.map((item) => ({
              trackableId: tr.id,
              user_id: userId,
              date: item.date,
              value: item.value,
              createdAt: Date.now(),
              updatedAt: getValidCreatedAt(item.updatedAt),
              externalKey: item.externalKey,
            })),
          )
          .returning();

        await tx.insert(trackableRecordAttributes).values(
          toInsert.flatMap((item, index) => {
            if (!item.trackableRecordAttributes) return [];
            const id = res[index]?.recordId;

            if (!id)
              throw new Error(
                "No record id returned from insert, something went wrong",
              );

            return item.trackableRecordAttributes.map((attr) => ({
              ...attr,
              trackableId: tr.id,
              user_id: userId,
              recordId: id,
            }));
          }),
        );
      }

      if (toUpdate.length > 0) {
        await tx
          .insert(trackableRecord)
          .values(
            toUpdate.map((item) => ({
              ...item.value,
              recordId: item.id,
              trackableId: tr.id,
              user_id: userId,
              createdAt: Date.now(),
              updatedAt: getValidCreatedAt(item.value.updatedAt),
              externalKey: item.value.externalKey,
            })),
          )
          .onConflictDoUpdate({
            target: [trackableRecord.recordId],
            set: {
              value: sql`excluded.value`,
              createdAt: sql`COALESCE(excluded.createdAt, 0)`,
              externalKey: sql`excluded.externalKey`,
              updatedAt: Date.now(),
            },
          });

        await tx
          .insert(trackableRecordAttributes)
          .values(
            toUpdate.flatMap((item) => {
              if (!item.value.trackableRecordAttributes) return [];
              return item.value.trackableRecordAttributes.map((attr) => ({
                ...attr,
                trackableId: tr.id,
                user_id: userId,
                recordId: item.id,
              }));
            }),
          )
          .onConflictDoUpdate({
            target: [trackableRecordAttributes.recordId],
            set: {
              value: sql`excluded.value`,
            },
          });
      }
    } catch (e) {
      tx.rollback();
      console.error(e);
      throw e;
    }
  });

  return {
    updated: toUpdate.length,
    inserted: toInsert.length,
  };
};

const getValidCreatedAt = (createdAt: number | null | undefined) => {
  if (!createdAt) return undefined;
  return Math.min(createdAt, Date.now());
};

const getMapOfExistingRecords = async (
  trackable: { id: string },
  analysis: { earliestDate: Date; latestDate: Date },
) => {
  const existingRecords = await db.query.trackableRecord.findMany({
    where: and(
      eq(trackableRecord.trackableId, trackable.id),
      between(trackableRecord.date, analysis.earliestDate, analysis.latestDate),
    ),
  });

  const mapOfExistingRecords = new Map(
    existingRecords
      .filter((record) => record.externalKey)
      .map((record) => [
        `${format(convertDateFromDbToLocal(record.date), "yyyy-MM-dd")}-${record.externalKey}`,
        record,
      ]),
  );

  return mapOfExistingRecords;
};

const isValueOfExpectedType = (value: string, type: ITrackableZero["type"]) => {
  if (type === "boolean") {
    return value === "true" || value === "false" || value.length === 0;
  }

  if (type === "number") {
    return !isNaN(Number(value));
  }

  return true;
};

export const analyzeData = (
  data: IImportJson[],
  type: ITrackableZero["type"],
) => {
  const itemsCount = data.length;

  const firstOne = data[0];

  if (!firstOne) throw new Error("Empty file passed");

  const hasAttrbibutes = firstOne.trackableRecordAttributes !== undefined;

  const info = data.reduce(
    (acc, item) => {
      if (hasAttrbibutes) {
        acc.attributesCount += item.trackableRecordAttributes?.length ?? 0;
      }

      if (acc.hasKeys === null) {
        if (item.externalKey) {
          acc.hasKeys = true;
        } else {
          acc.hasKeys = false;
        }
      } else if (
        (!item.externalKey && acc.hasKeys === true) ||
        (item.externalKey && acc.hasKeys === false)
      ) {
        throw new Error("Mixed external keys and no external keys");
      }

      if (!acc.earliestDate || item.date < acc.earliestDate) {
        acc.earliestDate = item.date;
      }

      if (!acc.latestDate || item.date > acc.latestDate) {
        acc.latestDate = item.date;
      }

      const typeCheck = isValueOfExpectedType(item.value, type);

      if (!typeCheck) {
        acc.typeCheckMisses++;

        if (acc.typeCheckMissExamples.length < 3) {
          acc.typeCheckMissExamples.push(item.value);
        }
      }

      return acc;
    },
    {
      hasKeys: null as null | true | false,
      attributesCount: 0,
      earliestDate: undefined as Date | undefined,
      latestDate: undefined as Date | undefined,
      typeCheckMisses: 0,
      typeCheckMissExamples: [] as string[],
    },
  );

  if (!info.earliestDate || !info.latestDate) {
    throw new Error(
      "Something went wrong with date parsing, please report bug",
    );
  }

  if (info.hasKeys === null) {
    throw new Error("Something went wrong with key parsing, please report bug");
  }

  return {
    ...info,
    hasAttrbibutes,
    itemsCount,
    latestDate: info.latestDate,
    earliestDate: info.earliestDate,
  };
};
