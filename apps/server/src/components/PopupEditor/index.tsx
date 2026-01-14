import { formatDate, isSameDay, isToday } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import type { PureDataRecord } from "@tyl/helpers/trackables";
import { mapDataToRange } from "@tyl/helpers/trackables";

import type { ITrackableZero } from "@tyl/db/client/zero-schema";
import { Button } from "~/@shad/components/button";
import {
  editorModalNextDay,
  editorModalPreviousDay,
} from "~/components/Modal/EditorModalV2";
import { NumberPopupEditor } from "~/components/PopupEditor/NumberPopup";
import { TextPopupEditor } from "~/components/PopupEditor/TextPopup";
import { useTrackableFlag } from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import TrackableProvider, {
  useTrackableMeta,
} from "~/components/Trackable/TrackableProviders/TrackableProvider";
import {
  useRecordDeleteHandler,
  useRecordUpdateHandler,
  useTrackableDay,
} from "~/utils/useZ";

export const PopupEditor = ({
  date,
  trackableId,
}: {
  date: Date;
  trackableId: string;
}) => {
  const [data] = useTrackableDay({ date, trackableId });

  const onChange = useRecordUpdateHandler({
    date,
    trackableId,
    type: data?.type ?? "",
  });

  const onDelete = useRecordDeleteHandler();

  if (!data) return null;

  const mapped = mapDataToRange(date, date, data.trackableRecord);

  if (mapped.length !== 1) {
    throw new Error(
      "Error, mapDataToRange popup editor returned zero, or multiple days",
    );
  }

  const mapDay = mapped[0];

  if (!mapDay) {
    throw new Error("Error, mapDataToRange returned invalid value");
  }

  return (
    <TrackableProvider trackable={data}>
      <EditorTitle date={date} />
      <EditorFactory
        type={data.type}
        data={mapDay}
        onChange={onChange}
        onDelete={onDelete}
      />
    </TrackableProvider>
  );
};

const EditorTitle = ({ date }: { date: Date }) => {
  const { name, id } = useTrackableMeta();
  const trackingStart = useTrackableFlag(id, "AnyTrackingStart");
  return (
    <div className="border-border flex items-center justify-between gap-2 border-b pr-2 sm:text-sm">
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

const components: Record<
  ITrackableZero["type"],
  React.ComponentType<PopupEditorProps> | null
> = {
  text: TextPopupEditor,
  number: NumberPopupEditor,
  boolean: null,
};

const EditorFactory = ({
  type,
  ...props
}: PopupEditorProps & { type: ITrackableZero["type"] }) => {
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
