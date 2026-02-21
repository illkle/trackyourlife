import { useMemo } from 'react';
import { isAfter, isBefore, isSameDay } from 'date-fns';

import { DayCellTextPopup } from './Text';
import { useTrackableMeta } from '@tyl/helpers/data/TrackableMetaProvider';
import {
  useRecordDeleteHandler,
  useRecordUpdateHandler,
  useTrackableData,
  useTrackableFlag,
} from '@tyl/helpers/data/dbHooksTanstack';
import { DayCellBoolean } from './Boolean';
import { DayCellNumber } from './Number';
import { cn } from '@/lib/utils';
import { StyleProp, View, ViewStyle } from 'react-native';
import {
  IDayCellLabelType,
  IDayCellProps,
  LabelOutside,
  OutOfRangeSimple,
} from '@/components/cells/common';

interface DayCellRouterProps {
  className?: string;
  labelType: IDayCellLabelType;
  disabled?: boolean;
  timestamp: Date;
  style?: StyleProp<ViewStyle>;
}

export const DayCellRouter = ({
  timestamp,
  labelType = 'auto',
  className,
  style,
}: DayCellRouterProps) => {
  const { id, type } = useTrackableMeta();
  const { data: trackingStart } = useTrackableFlag(id, 'AnyTrackingStart');

  const now = useMemo(() => new Date(), []);
  const isToday = useMemo(() => isSameDay(timestamp, now), [timestamp, now]);
  const isOutOfRange = useMemo(
    () =>
      isAfter(timestamp, now) ||
      Boolean(trackingStart && isBefore(timestamp, trackingStart)),
    [timestamp, now, trackingStart]
  );

  const onChange = useRecordUpdateHandler({
    date: timestamp,
    trackableId: id,
    type,
  });
  const onDelete = useRecordDeleteHandler();

  const { data: values } = useTrackableData({
    id,
    firstDay: timestamp,
    lastDay: timestamp,
  });

  const cellData = {
    type,
    isOutOfRange,
    values,
    onChange,
    onDelete,
    labelType,
    timestamp,
    isToday,
  };

  return (
    <View className={cn('relative', className)} style={style}>
      {labelType === 'outside' && <LabelOutside cellData={cellData} />}
      <DayCellTypeRouter cellData={cellData}></DayCellTypeRouter>
    </View>
  );
};

export const DayCellTypeRouter = (props: IDayCellProps) => {
  if (props.cellData.isOutOfRange) {
    return <OutOfRangeSimple {...props} />;
  }

  if (props.cellData.type === 'boolean') {
    return <DayCellBoolean cellData={props.cellData} />;
  }

  if (props.cellData.type === 'number') {
    return <DayCellNumber cellData={props.cellData} />;
  }

  if (props.cellData.type === 'text') {
    return <DayCellTextPopup cellData={props.cellData} />;
  }

  throw new Error('Unsupported trackable type');
};

export default DayCellRouter;
