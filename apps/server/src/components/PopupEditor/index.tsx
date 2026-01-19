import { Spinner } from "@shad/components/spinner";
import { formatDate, isSameDay, isToday } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import type { PureDataRecord } from "@tyl/helpers/data/trackables";
import { DbTrackableSelect } from "@tyl/db/client/schema-powersync";
import {
  useRecordDeleteHandler,
  useRecordUpdateHandler,
  useTrackableDay,
} from "@tyl/helpers/data/dbHooks";
import { mapDataToRange } from "@tyl/helpers/data/trackables";

import { Button } from "~/@shad/components/button";
import { editorModalNextDay, editorModalPreviousDay } from "~/components/Modal/EditorModalV2";
import { NumberPopupEditor } from "~/components/PopupEditor/NumberPopup";
import { TextPopupEditor } from "~/components/PopupEditor/TextPopup";
import { QueryError } from "~/components/QueryError";
import { useTrackableFlag } from "@tyl/helpers/data/TrackableFlagsProvider";
import TrackableProvider, {
  useTrackableMeta,
} from "~/components/Trackable/TrackableProviders/TrackableProvider";

export const PopupEditor = ({ date, trackableId }: { date: Date; trackableId: string }) => {
  const q = useTrackableDay({ date, trackableId });

  const {
    data: [trackable],
  } = q;

  if (q.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (q.error) {
    return <QueryError error={q.error} onRetry={q.refresh} />;
  }

  const onChange = useRecordUpdateHandler({
    date,
    trackableId,
    type: trackable?.type ?? "",
  });

  const onDelete = useRecordDeleteHandler();

  if (!trackable) return null;

  // Convert TrackableRecordRow[] to DataRecord[] by converting ISO string dates to timestamps
  const dataRecords = trackable.data.map((record) => ({
    id: record.id,
    value: record.value,
    timestamp: new Date(record.timestamp).getTime(),
    updated_at: record.updated_at,
  }));

  const mapped = mapDataToRange(date, date, dataRecords);

  if (mapped.length !== 1) {
    throw new Error("Error, mapDataToRange popup editor returned zero, or multiple days");
  }

  const mapDay = mapped[0];

  if (!mapDay) {
    throw new Error("Error, mapDataToRange returned invalid value");
  }

  return (
    <TrackableProvider trackable={trackable}>
      <EditorTitle date={date} />
      <EditorFactory type={trackable.type} data={mapDay} onChange={onChange} onDelete={onDelete} />
    </TrackableProvider>
  );
};

const EditorTitle = ({ date }: { date: Date }) => {
  const { name, id } = useTrackableMeta();
  const trackingStart = useTrackableFlag(id, "AnyTrackingStart");
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border pr-2 sm:text-sm">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="sm:h-6"
          disabled={trackingStart ? isSameDay(date, trackingStart) : false}
          onClick={editorModalPreviousDay}
        >
          <ChevronLeftIcon size={16} />
        </Button>
        <span className="opacity-80">{formatDate(date, "MMMM d")}</span>
        <Button
          disabled={isToday(date)}
          variant="ghost"
          size="icon"
          className="sm:h-6"
          onClick={editorModalNextDay}
        >
          <ChevronRightIcon size={16} />
        </Button>
      </div>
      <span className="text-xs font-medium opacity-50">{name}</span>
    </div>
  );
};

const components: Record<DbTrackableSelect["type"], React.ComponentType<PopupEditorProps> | null> =
  {
    text: TextPopupEditor,
    number: NumberPopupEditor,
    boolean: null,
  };

const EditorFactory = ({
  type,
  ...props
}: PopupEditorProps & { type: DbTrackableSelect["type"] }) => {
  const SpecificEditor = components[type];

  if (!SpecificEditor) {
    throw new Error(`No popup editor exists for type: ${type}`);
  }

  return <SpecificEditor {...props} />;
};

export interface PopupEditorProps {
  data: PureDataRecord;
  onDelete: ReturnType<typeof useRecordDeleteHandler>;
  onChange: ReturnType<typeof useRecordUpdateHandler>;
}
