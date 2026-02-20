import { format } from "date-fns";
import { m } from "motion/react";

import { DrawerMobileTitleProvider } from "~/@shad/components/drawer";
import { Switch } from "~/@shad/components/switch";
import ColorInput from "~/components/Inputs/Colors/colorInput";
import NumberColorSelector from "~/components/Inputs/Colors/numberColorSelector";
import DatePicker from "~/components/Inputs/DatePicker";
import { SettingsTitle } from "~/components/Trackable/Settings/settingsTitle";
import { useTrackableMeta } from "@tyl/helpers/data/TrackableMetaProvider";
import NumberLimitsSelector from "./numberLimitsSelector";
import { useCallback } from "react";
import { IColorCodingValueInput } from "@tyl/db/jsonValidators";
import { useTrackableFlag } from "@tyl/helpers/data/dbHooksTanstack";

export const SettingsCommon = () => {
  const { id } = useTrackableMeta();
  const { data: trackingStart, setFlag } = useTrackableFlag(id, "AnyTrackingStart");

  console.log("SettingsCommon", trackingStart && format(trackingStart, "yyyy-MM-dd"));

  return (
    <div>
      <SettingsTitle>Tracking Start</SettingsTitle>
      <DrawerMobileTitleProvider title="Tracking Start">
        <DatePicker
          date={trackingStart ? new Date(trackingStart) : undefined}
          onChange={(v) => {
            void setFlag(v ? format(v, "yyyy-MM-dd") : "");
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

export const SettingsBoolean = () => {
  const { id } = useTrackableMeta();
  const { data: checked, setFlag: setChecked } = useTrackableFlag(id, "BooleanCheckedColor");
  const { data: unchecked, setFlag: setUnchecked } = useTrackableFlag(id, "BooleanUncheckedColor");

  return (
    <>
      <SettingsTitle>Checked color</SettingsTitle>
      <DrawerMobileTitleProvider title="Checked color">
        <ColorInput value={checked.raw} onChange={setChecked} />
      </DrawerMobileTitleProvider>
      <SettingsTitle>Unchecked color</SettingsTitle>
      <DrawerMobileTitleProvider title="Unchecked color">
        <ColorInput value={unchecked.raw} onChange={setUnchecked} />
      </DrawerMobileTitleProvider>
    </>
  );
};

export const SettingsNumber = () => {
  const { id } = useTrackableMeta();
  const { data: progress, setFlag: setNumberBounds } = useTrackableFlag(id, "NumberProgessBounds");
  const {
    data: { colorCoding },
    setFlag: setColorCoding,
  } = useTrackableFlag(id, "NumberColorCoding");

  const setColorCodingHandle = useCallback(
    (v: NonNullable<IColorCodingValueInput[]>, ts: number) => {
      void setColorCoding({
        enabled: true,
        colors: v,
        timestamp: ts,
      });
    },
    [setColorCoding],
  );

  return (
    <>
      <div>
        <SettingsTitle>
          <label htmlFor="show-progress">Show progress</label>
          <Switch
            id="show-progress"
            checked={progress.progress?.enabled}
            onCheckedChange={(v) => {
              void setNumberBounds({
                ...progress,
                enabled: v,
                min: progress.progress?.min ?? 0,
                max: progress.progress?.max ?? 100,
              });
            }}
          />
        </SettingsTitle>

        <div className="mb-2 flex items-center space-x-2"></div>

        {progress.progress?.enabled && (
          <NumberLimitsSelector
            value={progress.progress}
            onChange={(v) => {
              void setNumberBounds({
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
              void setColorCoding({
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
            onChange={setColorCodingHandle}
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
    </div>
  );
};

export default TrackableSettingsV2;
