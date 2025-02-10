import type { ITrackableRecordZero } from "~/schema";
import { TagsPopupEditor } from "~/components/PopupEditor/TagsPopup";
import { TextPopupEditor } from "~/components/PopupEditor/TextPopup";
import TrackableProvider from "~/components/Trackable/TrackableProviders/TrackableProvider";
import {
  useAttrbutesUpdateHandler,
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
    id: trackableId,
    type: data?.type ?? "",
  });

  const onDelete = useRecordDeleteHandler();
  const onAttributesChange = useAttrbutesUpdateHandler({
    trackableId,
  });

  if (!data) return null;

  return (
    <TrackableProvider trackable={data}>
      {data.type === "text" && (
        <TextPopupEditor values={data.trackableRecord} onChange={onChange} />
      )}
      {data.type === "tags" && (
        <TagsPopupEditor
          values={data.trackableRecord}
          onChange={onChange}
          onDelete={onDelete}
          onAttributesChange={onAttributesChange}
        />
      )}
    </TrackableProvider>
  );
};

export interface PopupEditorProps {
  values: readonly ITrackableRecordZero[];
  onDelete: ReturnType<typeof useRecordDeleteHandler>;
  onChange: ReturnType<typeof useRecordUpdateHandler>;
  onAttributesChange: ReturnType<typeof useAttrbutesUpdateHandler>;
}
