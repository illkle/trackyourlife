import { useCallback, useEffect, useMemo, useRef } from 'react';
import { router } from 'expo-router';
import { Text, TextInput, Pressable, View } from 'react-native';

import {
  TrackableMetaProvider,
  useTrackableMeta,
} from '@tyl/helpers/data/TrackableMetaProvider';
import {
  useRecordUpdateHandler,
  useTrackable,
  useTrackableData,
} from '@tyl/helpers/data/dbHooksTanstack';
import { getNumberSafe } from '@tyl/helpers/numberTools';
import { useLinkedValue } from '@tyl/helpers/useDbLinkedValue';
import { KeyboardStickyView } from 'react-native-keyboard-controller';

export const useOpenDayEditor = (timestamp: Date) => {
  const trackableMeta = useTrackableMeta();

  const openDayEditor = useCallback(() => {
    router.push({
      pathname: '/editor',
      params: {
        trackableId: trackableMeta.id,
        date: timestamp.toISOString(),
      },
    });
  }, [timestamp, trackableMeta.id]);

  return { openDayEditor };
};

export const EditorModal = ({
  trackableId,
  timestamp,
  onClose,
}: {
  trackableId: string;
  timestamp: Date;
  onClose: () => void;
}) => {
  const q = useTrackable({ id: trackableId });
  const trackable = useMemo(
    () => (Array.isArray(q.data) ? q.data[0] : q.data),
    [q.data]
  );

  return (
    <View className="flex-1 justify-end">
      <Pressable className="absolute inset-0 bg-black/50" onPress={onClose} />

      <KeyboardStickyView offset={{ opened: 100 }}>
        <View className="rounded-t-3xl border border-border bg-card px-4 py-8 pb-32">
          {!trackable && (
            <Text className="text-center text-muted-foreground">
              Loading editor...
            </Text>
          )}
          {trackable && (
            <TrackableMetaProvider trackable={trackable}>
              <PopupEditor
                trackableId={trackableId}
                timestamp={timestamp}
                onClose={onClose}
              />
            </TrackableMetaProvider>
          )}
        </View>
      </KeyboardStickyView>
    </View>
  );
};

const PopupEditor = ({
  trackableId,
  timestamp,
  onClose,
}: {
  trackableId: string;
  timestamp: Date;
  onClose: () => void;
}) => {
  const { type } = useTrackableMeta();

  const q = useTrackableData({
    firstDay: timestamp,
    lastDay: timestamp,
    id: trackableId,
  });

  const data = q.data[0] ?? {
    value: undefined,
    updated_at: 0,
    id: undefined,
  };

  const onChange = useRecordUpdateHandler({
    date: timestamp,
    trackableId,
    type,
  });

  if (type === 'number') {
    return (
      <NumberPopupEditor
        value={data.value}
        onChange={(v, ts) =>
          onChange({ value: v, recordId: data.id, updatedAt: ts })
        }
        timestamp={data.updated_at ?? 0}
        onClose={onClose}
      />
    );
  }

  return (
    <Text className="text-center text-muted-foreground">
      Editor for this type is not ready yet.
    </Text>
  );
};

const NumberPopupEditor = ({
  value,
  onChange,
  timestamp,
  onClose,
}: {
  value?: string;
  onChange: (value: string, timestamp: number) => void;
  timestamp: number;
  onClose: () => void;
}) => {
  const inputRef = useRef<TextInput>(null);
  const { internalValue, internalValueValidated, updateHandler, reset } =
    useLinkedValue({
      value: String(getNumberSafe(value)),
      onChange,
      timestamp,
      validate: (v) => !Number.isNaN(Number(v)),
    });

  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 30);

    return () => {
      clearTimeout(focusTimeout);
    };
  }, []);

  const handleInputBlur = () => {
    if (internalValue !== internalValueValidated) {
      reset();
    }
    onClose();
  };

  return (
    <TextInput
      ref={inputRef}
      className="rounded-md border-2 border-secondary py-2 text-center text-2xl font-bold text-primary"
      value={internalValue}
      onChangeText={(v) => updateHandler(v)}
      onBlur={handleInputBlur}
      keyboardType="decimal-pad"
    />
  );
};
