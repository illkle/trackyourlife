import { format } from "date-fns";
import { m } from "motion/react";

import { DrawerMobileTitleProvider } from "~/@shad/components/drawer";
import { Switch } from "~/@shad/components/switch";
import ColorInput from "~/components/Inputs/Colors/colorInput";
import NumberColorSelector from "~/components/Inputs/Colors/numberColorSelector";
import DatePicker from "~/components/Inputs/DatePicker";
import { LogsAttributeList } from "~/components/Trackable/Settings/logsAttributeCreator";
import { SettingsTitle } from "~/components/Trackable/Settings/settingsTitle";
import {
  useSetTrackableFlag,
  useTrackableFlag,
} from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";
import NumberLimitsSelector from "./numberLimitsSelector";

export const SettingsCommon = () => {
  const { id } = useTrackableMeta();
  const trackingStart = useTrackableFlag(id, "AnyTrackingStart");
  const setFlag = useSetTrackableFlag();

  return (
    <div>
      <SettingsTitle>Tracking Start</SettingsTitle>
      <DrawerMobileTitleProvider title="Tracking Start">
        <DatePicker
          date={trackingStart ? new Date(trackingStart) : undefined}
          onChange={(v) => {
            void setFlag(
              id,
              "AnyTrackingStart",
              v ? format(v, "yyyy-MM-dd") : "",
            );
          }}
          limits={{
            start: new Date(1990, 0, 1),
            end: new Date(),
          }}
        />
      </DrawerMobileTitleProvider>
    </div>
  );
};

export const SettingsLogs = () => {
  const { id } = useTrackableMeta();
  const v = useTrackableFlag(id, "LogsSavedAttributes");
  const setFlag = useSetTrackableFlag();
  return (
    <>
      <SettingsTitle>Attributes Settings</SettingsTitle>
      <LogsAttributeList
        items={v}
        onChange={(v) => {
          void setFlag(id, "LogsSavedAttributes", v);
        }}
      />
    </>
  );
};

export const SettingsBoolean = () => {
  const { id } = useTrackableMeta();
  const checked = useTrackableFlag(id, "BooleanCheckedColor");
  const unchecked = useTrackableFlag(id, "BooleanUncheckedColor");
  const setFlag = useSetTrackableFlag();
  return (
    <>
      <SettingsTitle>Checked color</SettingsTitle>
      <DrawerMobileTitleProvider title="Checked color">
        <ColorInput
          value={checked.raw}
          onChange={(v) => {
            void setFlag(id, "BooleanCheckedColor", v);
          }}
        />
      </DrawerMobileTitleProvider>
      <SettingsTitle>Unchecked color</SettingsTitle>
      <DrawerMobileTitleProvider title="Unchecked color">
        <ColorInput
          value={unchecked.raw}
          onChange={(v) => {
            void setFlag(id, "BooleanUncheckedColor", v);
          }}
        />
      </DrawerMobileTitleProvider>
    </>
  );
};

export const SettingsNumber = () => {
  const { id } = useTrackableMeta();
  const { progress } = useTrackableFlag(id, "NumberProgessBounds");
  const { colorCoding } = useTrackableFlag(id, "NumberColorCoding");
  const setFlag = useSetTrackableFlag();
  return (
    <>
      <div>
        <SettingsTitle>
          <label htmlFor="show-progress">Show progress</label>
          <Switch
            id="show-progress"
            checked={progress?.enabled}
            onCheckedChange={(v) => {
              void setFlag(id, "NumberProgessBounds", {
                ...progress,
                enabled: v,
                min: progress?.min ?? 0,
                max: progress?.max ?? 100,
              });
            }}
          />
        </SettingsTitle>

        <div className="mb-2 flex items-center space-x-2"></div>

        {progress?.enabled && (
          <NumberLimitsSelector
            value={progress}
            onChange={(v) => {
              void setFlag(id, "NumberProgessBounds", {
                ...progress,
                min: v.min,
                max: v.max,
              });
            }}
          />
        )}
      </div>

      <m.div layout layoutRoot>
        <SettingsTitle>
          <label htmlFor="color-coding-enabled">Color coding</label>
          <Switch
            id="color-coding-enabled"
            checked={colorCoding?.enabled}
            onCheckedChange={(v) => {
              void setFlag(id, "NumberColorCoding", {
                ...colorCoding,
                colors: colorCoding?.colors ?? [],
                enabled: v,
                timestamp: Date.now(),
              });
            }}
          />
        </SettingsTitle>

        <div className="mb-2 flex items-center space-x-2"></div>

        {colorCoding?.enabled && (
          <NumberColorSelector
            value={colorCoding.colors ?? []}
            timestamp={colorCoding.timestamp}
            onChange={(v, ts) => {
              void setFlag(id, "NumberColorCoding", {
                ...colorCoding,
                colors: v,
                timestamp: ts,
              });
            }}
          />
        )}
      </m.div>
    </>
  );
};

const TrackableSettingsV2 = () => {
  const { type } = useTrackableMeta();
  return (
    <div>
      <SettingsCommon />
      {type === "boolean" && <SettingsBoolean />}
      {type === "number" && <SettingsNumber />}
      {type === "logs" && <SettingsLogs />}
    </div>
  );
};

export default TrackableSettingsV2;
