import type { ListenerValue } from "@tanstack/react-store";
import { Store, useStore } from "@tanstack/react-store";
import React, { useCallback, useRef, useState } from "react";
import { useEffect } from "react";
import { subDays } from "date-fns";
import { addDays } from "date-fns";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetBackdropProps,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Text } from "react-native";
import { useResolveClassNames } from "uniwind";
import {
  ITrackableContext,
  TrackableMetaProvider,
  useTrackableMeta,
} from "@tyl/helpers/data/TrackableMetaProvider";
import { getNumberSafe } from "@tyl/helpers/numberTools";
import { useLinkedValue } from "@tyl/helpers/useDbLinkedValue";
import { useRecordUpdateHandler, useTrackableDay } from "@tyl/helpers/data/dbHooks";

interface EditorModalRegisterInput {
  trackable: ITrackableContext;
  date: Date;
}

interface EditorModalStore {
  data: EditorModalRegisterInput | null;
}

export const editorModalStore = new Store<EditorModalStore>({
  data: null,
});

export const useAmIOpenInStore = (me: EditorModalRegisterInput) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const listener = (v: ListenerValue<EditorModalStore>) => {
      const { date, trackable: trackableId } = v.currentVal.data ?? {};

      const isMe = date && trackableId ? me.trackable === trackableId && me.date === date : false;

      setIsOpen(isMe);
    };

    editorModalStore.listeners.add(listener);

    return () => {
      editorModalStore.listeners.delete(listener);
    };
  }, [me.date, me.trackable]);

  return isOpen;
};

export const useOpenDayEditor = (timestamp: Date) => {
  const trackableMeta = useTrackableMeta();

  const openDayEditor = useCallback(() => {
    editorModalStore.setState((state) => ({
      ...state,
      data: { trackable: trackableMeta, date: timestamp },
      isCollapsed: false,
    }));
  }, [trackableMeta, timestamp]);

  return { openDayEditor };
};

export const closeDayEditor = () => {
  editorModalStore.setState((state) => ({ ...state, data: null }));
};

export const editorModalPreviousDay = () => {
  editorModalStore.setState((state) => ({
    ...state,
    data: state.data
      ? {
          trackable: state.data.trackable,
          date: subDays(state.data.date, 1),
        }
      : null,
  }));
};

export const editorModalNextDay = () => {
  editorModalStore.setState((state) => ({
    ...state,
    data: state.data
      ? {
          trackable: state.data.trackable,
          date: addDays(state.data.date, 1),
        }
      : null,
  }));
};

export const EditorSheet = () => {
  const data = useStore(editorModalStore, (state) => state.data);

  const styles = useResolveClassNames("bg-card");
  const stylesHandle = useResolveClassNames("bg-primary");

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (!bottomSheetModalRef.current) return;

    if (data) {
      bottomSheetModalRef.current.present();
    } else {
      bottomSheetModalRef.current.dismiss();
    }
  }, [data, bottomSheetModalRef]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        enableTouchThrough={false}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      backgroundStyle={styles}
      enableDynamicSizing={true}
      handleIndicatorStyle={stylesHandle}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      onDismiss={closeDayEditor}
    >
      <BottomSheetView className="px-4 py-8">
        {data?.trackable && (
          <TrackableMetaProvider trackable={data?.trackable}>
            <PopupEditor timestamp={data?.date} />
          </TrackableMetaProvider>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export const PopupEditor = ({ timestamp }: { timestamp: Date }) => {
  const { id, type } = useTrackableMeta();

  const q = useTrackableDay({ date: timestamp, trackableId: id });

  const {
    data: [trackable],
  } = q;

  const data = trackable?.data?.[0] ?? { value: undefined, updated_at: 0, id: undefined };

  const onChange = useRecordUpdateHandler({
    date: timestamp,
    trackableId: id,
    type: type,
  });

  return (
    <>
      {type === "number" && (
        <NumberPopupEditor
          value={data?.value}
          onChange={(v, ts) => {
            console.log("onChange", timestamp, v, ts);
            onChange({ value: v, recordId: data?.id, updatedAt: ts });
          }}
          timestamp={data.updated_at ?? 0}
        />
      )}
    </>
  );
};

export const NumberPopupEditor = ({
  value,
  onChange,
  timestamp,
}: {
  value?: string;
  onChange: (value: string, timestamp: number) => void;
  timestamp: number;
}) => {
  const { internalValue, internalValueValidated, updateHandler, reset } = useLinkedValue({
    value: String(getNumberSafe(value)),
    onChange,
    timestamp: timestamp,
    validate: (v) => {
      return !Number.isNaN(Number(v));
    },
  });

  const handleInputBlur = () => {
    if (internalValue !== internalValueValidated) {
      reset();
    }
    closeDayEditor();
  };

  return (
    <>
      <BottomSheetTextInput
        autoFocus
        className="rounded-md border-2 border-secondary py-2 text-center text-2xl font-bold text-primary"
        value={internalValue}
        onChangeText={(v) => updateHandler(v)}
        onBlur={handleInputBlur}
      />
    </>
  );
};
