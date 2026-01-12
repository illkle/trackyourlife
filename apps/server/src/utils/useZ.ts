/* eslint-disable @typescript-eslint/unbound-method */
import type { Row } from "@rocicorp/zero";
import { useCallback, useMemo } from "react";
import { useQuery, useZero } from "@rocicorp/zero/react";
import {
  addMonths,
  addYears,
  endOfDay,
  isSameDay,
  startOfDay,
  subMonths,
} from "date-fns";
import { v4 as uuidv4 } from "uuid";

import type { Schema } from "@tyl/db/zero-schema";
import type { RecordAttribute } from "@tyl/helpers/trackables";
import { mutators } from "@tyl/db/mutators";
import { queries } from "@tyl/db/queries";
import { convertDateFromLocalToDb } from "@tyl/helpers/trackables";

import { useSessionAuthed } from "~/utils/useSessionInfo";

export const useZ = () => {
  return useZero<Schema>();
};

interface TrackableRangeParams {
  firstDay: number;
  lastDay: number;
}

export const useZeroTrackablesList = () => {
  const s = useSessionAuthed();

  return useQuery(queries.trackablesList({}));
};

export type TrackableListItem = Row<Schema["tables"]["TYL_trackable"]> & {
  trackableGroup: readonly Row<Schema["tables"]["TYL_trackableGroup"]>[];
};

export const useZeroTrackableListWithData = (params: TrackableRangeParams) => {
  const firstDay = convertDateFromLocalToDb(startOfDay(params.firstDay));
  const lastDay = convertDateFromLocalToDb(endOfDay(params.lastDay));
  return useQuery(queries.trackablesListWithData({ firstDay, lastDay }));
};

export const useZeroTrackable = ({ id }: { id: string }) => {
  return useQuery(queries.trackableById({ id }));
};

interface ByIdParams extends TrackableRangeParams {
  id: string;
}
const useTrackableQuery = (params: ByIdParams) => {
  const firstDay = convertDateFromLocalToDb(startOfDay(params.firstDay));
  const lastDay = convertDateFromLocalToDb(endOfDay(params.lastDay));

  return queries.trackableData({ id: params.id, firstDay, lastDay });
};

export const useZeroTrackableData = ({ id, firstDay, lastDay }: ByIdParams) => {
  return useQuery(useTrackableQuery({ id, firstDay, lastDay }));
};

export const usePreloadZeroTrackableData = (p: ByIdParams) => {
  const z = useZero();
  z.preload(useTrackableQuery(p));
};

export const usePreloadTrackableMonthView = ({
  id,
  year,
}: {
  id: string;
  year: number;
}) => {
  const z = useZero();
  const now = Date.UTC(year, 0, 1);
  return z.preload(
    queries.trackableMonthViewData({
      id,
      startDate: addMonths(now, -3).getTime(),
      endDate: addMonths(now, 15).getTime(),
    }),
  );
};

export const usePreloadTrackableYearView = ({
  id,
  year,
}: {
  id: string;
  year: number;
}) => {
  const z = useZero();
  const now = Date.UTC(year, 0, 1);
  return z.preload(
    queries.trackableMonthViewData({
      id,
      startDate: addYears(now, -2).getTime(),
      endDate: addYears(now, 2).getTime(),
    }),
  );
};

export const usePreloadCore = () => {
  const z = useZero();
  const now = new Date();

  z.preload(queries.corePreload({ sinceDate: subMonths(now, 3).getTime() }));

  z.preload(queries.userFlags({}));
};

export const useZeroGroupList = (group: string) => {
  return useQuery(queries.groupList({ group }));
};

export const useZeroGroupSet = (group: string) => {
  const [data] = useZeroGroupList(group);

  return useMemo(() => {
    return new Set<string>(data.map((f) => f.trackable_id));
  }, [data]);
};

export const useZeroInGroup = (trackableId: string, group: string) => {
  return useQuery(queries.trackableInGroup({ trackableId, group }));
};

export const useTrackableDay = ({
  date,
  trackableId,
}: {
  date: Date;
  trackableId: string;
}) => {
  return useQuery(
    queries.trackableDay({
      trackableId,
      dayStart: convertDateFromLocalToDb(startOfDay(date)),
      dayEnd: convertDateFromLocalToDb(endOfDay(date)),
    }),
  );
};

const generateDateTime = (date: Date, storeTime?: boolean) => {
  if (storeTime) {
    const d = new Date();

    if (isSameDay(date, d)) {
      return Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        d.getHours(),
        d.getMinutes(),
        d.getSeconds(),
      );
    }

    return Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
    );
  }

  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
};

export const useRecordUpdateHandler = ({
  date,
  trackableId,
  type,
}: {
  date: Date;
  trackableId: string;
  type: string;
}) => {
  const zero = useZero();

  return useCallback(
    async ({
      value,
      recordId,
      updatedAt,
      attributes,
    }: {
      value: string;
      recordId?: string;
      updatedAt?: number;
      attributes?: Record<string, string>;
    }) => {
      const d = generateDateTime(date, type === "logs");

      if (recordId) {
        await zero.mutate(
          mutators.trackableRecord.update({
            record_id: recordId,
            value,
            updated_at: updatedAt,
            attributes,
          }),
        );

        return recordId;
      } else {
        const rid = uuidv4();
        await zero.mutate(
          mutators.trackableRecord.upsert({
            record_id: rid,
            date: d,
            trackable_id: trackableId,
            value,
            created_at: updatedAt,
            updated_at: updatedAt,
            attributes,
          }),
        );
        return rid;
      }
    },
    [date, trackableId, zero, type],
  );
};

export const updateAttributesRaw = async (
  trackableId: string,
  recordId: string,
  attributes: readonly RecordAttribute[],
) => {
  const promises = attributes.map((a) =>
    mutators.recordAttributes.upsert({
      record_id: recordId,
      trackable_id: trackableId,
      key: a.key,
      value: a.value,
      type: a.type,
    }),
  );

  await Promise.allSettled(promises);
};

export const useAttrbutesUpdateHandler = ({
  trackableId,
}: {
  trackableId: string;
}) => {
  return useCallback(
    async (recordId: string, attributes: readonly RecordAttribute[]) => {
      return await updateAttributesRaw(trackableId, recordId, attributes);
    },
    [trackableId],
  );
};

export const useRecordDeleteHandler = () => {
  return useCallback(
    async (recordId: string) => {
      await mutators.trackableRecord.delete({
        record_id: recordId,
      });
    },
    [mutators],
  );
};
