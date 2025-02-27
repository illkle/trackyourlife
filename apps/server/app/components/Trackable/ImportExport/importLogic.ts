import { format } from "date-fns";
import { z } from "zod";

import type { ITrackableZero } from "@tyl/db/zero-schema";
import { and, between, db, eq } from "@tyl/db";
import { trackable, trackableRecord } from "@tyl/db/schema";
import { convertDateFromDbToLocal } from "@tyl/helpers/trackables";

export const zImportJson = z.object({
  date: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
  value: z.string(),
  updatedAt: z.number().nullable().optional(),
  externalKey: z.string().optional(),
  attrbites: z.record(z.string(), z.string()).optional(),
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

  /** We need existing values to determine if we should update or insert */
  const mapOfExistingRecords = await getMapOfExistingRecords(tr, analysis);

  const toUpdate: { id: string; value: IImportJson }[] = [];
  const toInsert: IImportJson[] = [];

  // Sort values in toUpdate and toInsert. Discard values that are older that what we have
  for (const item of data) {
    const key = `${format(convertDateFromDbToLocal(item.date), "yyyy-MM-dd")}-${item.externalKey}`;

    const existingRecord = mapOfExistingRecords.get(key);

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
      // Update if value from import data is newer than db
      toUpdate.push({ id: existingRecord.recordId, value: item });
    }
  }

  const complexTrackable = tr.type === "logs";

  // Apply db transaction
  await db.transaction(async (tx) => {
    try {
      if (toInsert.length > 0) {
        await tx
          .insert(trackableRecord)
          .values(
            toInsert.map((item) => ({
              trackableId: tr.id,
              user_id: userId,
              date: item.date,
              value: item.value,
              attributes: complexTrackable ? item.attrbites : undefined,
              createdAt: getValidDate(item.updatedAt),
              updatedAt: getValidDate(item.updatedAt),
              externalKey: item.externalKey,
            })),
          )
          .returning();
      }

      if (toUpdate.length > 0) {
        await Promise.all(
          toUpdate.map((item) =>
            tx
              .update(trackableRecord)
              .set({
                value: item.value.value,
                attributes: complexTrackable ? item.value.attrbites : undefined,
                updatedAt: getValidDate(item.value.updatedAt),
                externalKey: item.value.externalKey,
              })
              .where(eq(trackableRecord.recordId, item.id)),
          ),
        );
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

const getValidDate = (date: number | null | undefined) => {
  if (!date) return undefined;
  return Math.min(date, Date.now());
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

  const info = data.reduce(
    (acc, item) => {
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

  return {
    ...info,
    itemsCount,
    latestDate: info.latestDate,
    earliestDate: info.earliestDate,
  };
};
