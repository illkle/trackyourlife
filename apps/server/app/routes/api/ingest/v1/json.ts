import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";
import { format } from "date-fns";
import { z } from "zod";

import { and, between, db, eq } from "@tyl/db";
import { ingestApiKeys, trackableRecord } from "@tyl/db/schema";
import { convertDateFromDbToLocal } from "@tyl/helpers/trackables";

import { analyzeData, zImportJson } from "~/components/Trackable/ImportExport";

export const APIRoute = createAPIFileRoute("/api/ingest/v1/json")({
  PUT: async ({ request }) => {
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey) {
      return json({ error: "No API key provided" }, { status: 401 });
    }

    const keyValue = await db.query.ingestApiKeys.findFirst({
      where: eq(ingestApiKeys.key, apiKey),
      with: {
        user: true,
        trackable: true,
      },
    });

    if (!keyValue) {
      return json({ error: "Invalid API key" }, { status: 401 });
    }

    if (keyValue.user.id !== keyValue.trackable.user_id) {
      return json({ error: "Invalid API key" }, { status: 401 });
    }

    const body = (await request.json()) as unknown;

    const validated = z.array(zImportJson).safeParse(body);

    if (!validated.success) {
      return json(
        { error: "Invalid JSON", message: validated.error.message },
        { status: 400 },
      );
    }

    const analysis = analyzeData(validated.data, keyValue.trackable.type);

    if (analysis.typeCheckMisses > 0) {
      return json(
        {
          error: "Json validation failed. ",
          message:
            "Encountered " +
            analysis.typeCheckMisses +
            " value" +
            (analysis.typeCheckMisses > 1 ? "s" : "") +
            " that do not match trackable type (number):" +
            analysis.typeCheckMissExamples.join(", "),
        },
        { status: 400 },
      );
    }

    const complexTrackable = keyValue.trackable.type !== "logs";

    const mapOfExistingRecords =
      complexTrackable && analysis.hasKeys
        ? await getMapOfExistingRecords(keyValue, analysis)
        : null;

    const toUpdate: { id: string; value: (typeof validated.data)[number] }[] =
      [];
    const toInsert: typeof validated.data = [];

    for (const item of validated.data) {
      const key = `${format(convertDateFromDbToLocal(item.date), "yyyy-MM-dd")}-${item.externalKey}`;

      const existingRecord = mapOfExistingRecords?.get(key);

      if (existingRecord) {
        toUpdate.push({ id: existingRecord.recordId, value: item });
      } else {
        toInsert.push(item);
      }
    }

    await db.transaction(async (tx) => {
      const promises = [];

      if (toInsert.length > 0) {
        promises.push(
          tx.insert(trackableRecord).values(
            toInsert.map((item) => ({
              trackableId: keyValue.trackable.id,
              user_id: keyValue.user.id,
              date: item.date,
              value: item.value,
            })),
          ),
        );
      }

      for (const item of toUpdate) {
        promises.push(
          tx
            .update(trackableRecord)
            .set({
              value: item.value.value,
            })
            .where(eq(trackableRecord.recordId, item.id)),
        );
      }

      await Promise.all(promises);
    });

    return json({ success: true }, { status: 200 });
  },
});

const getMapOfExistingRecords = async (
  keyValue: { trackable: { id: string } },
  analysis: { earliestDate: Date; latestDate: Date },
) => {
  const existingRecords = await db.query.trackableRecord.findMany({
    where: and(
      eq(trackableRecord.trackableId, keyValue.trackable.id),
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
