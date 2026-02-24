import { formatDate, isSameDay, isToday } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { DbTrackableRecordSelect, DbTrackableSelect } from "@tyl/db/client/schema-powersync";

import { Button } from "~/@shad/components/button";
import { editorModalNextDay, editorModalPreviousDay } from "~/components/Modal/EditorModalV2";
import { NumberPopupEditor } from "~/components/PopupEditor/NumberPopup";
import { TextPopupEditor } from "~/components/PopupEditor/TextPopup";
import { useTrackableMeta } from "@tyl/helpers/data/TrackableMetaProvider";
import {
  useRecordDeleteHandler,
  useRecordUpdateHandler,
  useTrackableData,
} from "@tyl/helpers/data/dbHooksTanstack";
import { useTrackableFlagValueCached } from "@tyl/helpers/data/TrackableFlagsProvider";

export const PopupEditor = ({ date }: { date: Date }) => {
  const { id, type } = useTrackableMeta();
  const { data } = useTrackableData({ id, firstDay: date, lastDay: date });

  const onChange = useRecordUpdateHandler({
    date,
  });

  const onDelete = useRecordDeleteHandler();

  return (
    <>
      <EditorTitle date={date} />
      <EditorFactory data={data} type={type} onChange={onChange} onDelete={onDelete} />
    </>
  );
};

const EditorTitle = ({ date }: { date: Date }) => {
  const { name } = useTrackableMeta();
  const trackingStart = useTrackableFlagValueCached("AnyTrackingStart");
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
  data: DbTrackableRecordSelect[];
  onDelete: ReturnType<typeof useRecordDeleteHandler>;
  onChange: ReturnType<typeof useRecordUpdateHandler>;
}
