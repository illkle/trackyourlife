import type { ReactFormExtendedApi } from "@tanstack/react-form";
import { useState } from "react";
import { cn } from "@shad/utils";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { isAfter, isSameDay, subDays } from "date-fns";
import { m } from "motion/react";

import type { DbTrackableSelect } from "@tyl/db/schema";
import { presetsMap } from "@tyl/helpers/colorPresets";

import type { ITrackableFlagsKV } from "~/components/TrackableProviders/TrackableFlagsProvider";
import type { ITrackableZero } from "~/schema";
import { Button } from "~/@shad/components/button";
import { DrawerMobileTitleProvider } from "~/@shad/components/drawer";
import { Label } from "~/@shad/components/label";
import { Switch } from "~/@shad/components/switch";
import ColorInput from "~/components/Colors/colorInput";
import { SettingsTitle } from "~/components/CreateAndSettingsFlows/settingsTitle";
import DatePicker from "~/components/DatePicker";
import { DayCellContext, DayCellTypeRouter } from "~/components/DayCell";
import { TrackableFlagsProviderMock } from "~/components/TrackableProviders/TrackableFlagsProvider";
import TrackableProvider from "~/components/TrackableProviders/TrackableProvider";
import NumberColorSelector from "../Colors/numberColorSelector";
import NumberLimitsSelector from "./numberLimitsSelector";

export const SettingsCommon = ({
  form,
}: {
  form: ReactFormExtendedApi<ITrackableFlagsKV>;
}) => {
  return (
    <div>
      <SettingsTitle>Tracking Start</SettingsTitle>
      <form.Field
        name="AnyTrackingStart"
        children={(field) => (
          <>
            <DrawerMobileTitleProvider title="Tracking Start">
              <DatePicker
                date={
                  field.state.value ? new Date(field.state.value) : undefined
                }
                onChange={(v) => field.handleChange(v)}
                limits={{
                  start: new Date(1990, 0, 1),
                  end: new Date(),
                }}
              />
            </DrawerMobileTitleProvider>
          </>
        )}
      />
    </div>
  );
};

export const SettingsBoolean = ({
  form,
}: {
  form: ReactFormExtendedApi<ITrackableFlagsKV>;
}) => {
  return (
    <>
      <SettingsTitle>Checked color</SettingsTitle>
      <form.Field
        name="BooleanCheckedColor"
        children={(field) => (
          <>
            <DrawerMobileTitleProvider title="Checked color">
              <ColorInput
                value={field.state.value ?? presetsMap.green}
                onChange={(v) => {
                  field.handleChange(v);
                }}
              />
            </DrawerMobileTitleProvider>
          </>
        )}
      />
      <SettingsTitle>Unchecked color</SettingsTitle>
      <form.Field
        name="BooleanUncheckedColor"
        children={(field) => (
          <>
            <DrawerMobileTitleProvider title="Unchecked color">
              <ColorInput
                value={field.state.value ?? presetsMap.neutral}
                onChange={(v) => {
                  field.handleChange(v);
                }}
              />
            </DrawerMobileTitleProvider>
          </>
        )}
      />
    </>
  );
};

export const SettingsNumber = ({
  form,
}: {
  form: ReactFormExtendedApi<ITrackableFlagsKV>;
}) => {
  return (
    <>
      <div>
        <SettingsTitle>Progress</SettingsTitle>

        <form.Subscribe
          selector={(state) => [state.values.NumberProgessBounds]}
          children={([numberProgessBounds]) =>
            numberProgessBounds ? (
              <form.Field
                name="NumberProgessBounds.enabled"
                children={(field) => (
                  <div className="mb-2 flex items-center space-x-2">
                    <Switch
                      id="show-progress"
                      checked={field.state.value ?? false}
                      onCheckedChange={(v) => {
                        field.handleChange(v);
                      }}
                    />
                    <Label htmlFor="show-progress">Show progress</Label>
                  </div>
                )}
              />
            ) : (
              <form.Field
                name="NumberProgessBounds"
                children={(field) => (
                  <div className="mb-2 flex items-center space-x-2">
                    <Switch
                      id="show-progress"
                      checked={field.state.value ? true : false}
                      onCheckedChange={() => {
                        field.handleChange({ enabled: true });
                      }}
                    />
                    <Label htmlFor="show-progress">Show progress</Label>
                  </div>
                )}
              />
            )
          }
        />

        <form.Subscribe
          selector={(state) => [state.values.NumberProgessBounds]}
          children={([v]) =>
            v?.enabled && (
              <form.Field
                name="NumberProgessBounds"
                children={(field) =>
                  field.state.value && (
                    <NumberLimitsSelector
                      value={field.state.value}
                      onChange={(v) => {
                        field.handleChange(v);
                      }}
                    />
                  )
                }
              />
            )
          }
        />
      </div>

      <m.div layout layoutRoot>
        <SettingsTitle>Color coding</SettingsTitle>

        <form.Subscribe
          selector={(state) => [state.values.NumberProgessBounds]}
          children={([numberProgessBounds]) =>
            numberProgessBounds ? (
              <form.Field
                name="NumberColorCoding.enabled"
                children={(field) => (
                  <div className="mb-2 flex items-center space-x-2">
                    <Switch
                      id="color-coding-enabled"
                      checked={field.state.value ?? false}
                      onCheckedChange={(v) => {
                        field.handleChange(v);
                      }}
                    />
                    <Label htmlFor="show-progress">Enable color coding</Label>
                  </div>
                )}
              />
            ) : (
              <form.Field
                name="NumberColorCoding"
                children={(field) => (
                  <div className="mb-2 flex items-center space-x-2">
                    <Switch
                      id="color-coding-enabled"
                      checked={field.state.value ? true : false}
                      onCheckedChange={() => {
                        field.handleChange({ enabled: true, colors: [] });
                      }}
                    />
                    <Label htmlFor="show-progress">Enable color coding</Label>
                  </div>
                )}
              />
            )
          }
        />

        <form.Subscribe
          selector={(state) => [state.values.NumberColorCoding]}
          children={([cc]) =>
            cc?.enabled && (
              <form.Field
                name="NumberColorCoding.colors"
                children={(field) => (
                  <NumberColorSelector
                    value={field.state.value}
                    onChange={(v) => {
                      field.handleChange(v);
                    }}
                  />
                )}
              />
            )
          }
        />
      </m.div>
    </>
  );
};

const TrackableMock = ({
  type,
  form,
  className,
  index,
  length,
}: {
  type: DbTrackableSelect["type"];
  form: ReactFormExtendedApi<ITrackableFlagsKV>;
  className?: string;
  index: number;
  length: number;
}) => {
  const [value, onChange] = useState("");

  const settings = useStore(form.store, (state) => state.values);

  const now = new Date();
  const date = subDays(now, length - 2 - index);

  return (
    <div className={cn("relative w-full", className)}>
      <TrackableFlagsProviderMock flags={settings}>
        <TrackableProvider
          trackable={{ id: "1", type, name: "Not a real trackable yet" }}
        >
          <DayCellContext.Provider
            value={{
              date: date,
              isToday: isSameDay(date, now),
              isOutOfRange: isAfter(date, now),
              value,
              recordId: "1",
              onChange,
              labelType: "auto",
            }}
          >
            <div className={cn("flex flex-1 flex-col", className)}>
              <DayCellTypeRouter type={type}></DayCellTypeRouter>
            </div>
          </DayCellContext.Provider>
        </TrackableProvider>
      </TrackableFlagsProviderMock>
    </div>
  );
};

const TrackableSettings = ({
  trackableType,
  initialSettings,
  handleSave,
  customSaveButtonText,
}: {
  trackableType: ITrackableZero["type"];
  initialSettings?: ITrackableFlagsKV;
  handleSave: (v: ITrackableFlagsKV) => void | Promise<void>;
  customSaveButtonText?: string;
}) => {
  const form = useForm<ITrackableFlagsKV>({
    defaultValues: initialSettings,
    onSubmit: async (v) => {
      await handleSave(v.value);
    },
  });

  return (
    <div>
      <SettingsTitle>Preview</SettingsTitle>
      <div className="grid grid-cols-3 gap-1 md:grid-cols-6">
        {Array(6)
          .fill("")
          .map((_, i) => {
            return (
              <TrackableMock
                className="h-20"
                key={i}
                index={i}
                type={trackableType}
                form={form}
                length={6}
              />
            );
          })}
      </div>

      <SettingsCommon form={form} />
      {trackableType === "boolean" && <SettingsBoolean form={form} />}
      {trackableType === "number" && <SettingsNumber form={form} />}
      <Button
        isLoading={form.state.isSubmitting}
        className="mt-4 w-full"
        variant={"outline"}
        onClick={() => void form.handleSubmit()}
      >
        {customSaveButtonText ?? "Save"}
      </Button>
    </div>
  );
};

export default TrackableSettings;
