import type { ReactFormExtendedApi } from "@tanstack/react-form";
import { useState } from "react";
import { cn } from "@shad/utils";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { isAfter, isSameDay, subDays } from "date-fns";
import { m } from "motion/react";
import { v4 as uuidv4 } from "uuid";

import type { DbTrackableSelect } from "@tyl/db/schema";
import type { RecordValue } from "@tyl/helpers/trackables";

import type { ITrackableFlagsInputKV } from "~/components/Trackable/TrackableProviders/trackableFlags";
import type { ITrackableFlagsZero, ITrackableZero } from "~/schema";
import { Button } from "~/@shad/components/button";
import { DrawerMobileTitleProvider } from "~/@shad/components/drawer";
import { Label } from "~/@shad/components/label";
import { Switch } from "~/@shad/components/switch";
import ColorInput from "~/components/Colors/colorInput";
import NumberColorSelector from "~/components/Colors/numberColorSelector";
import DatePicker from "~/components/DatePicker";
import { DayCellContext, DayCellTypeRouter } from "~/components/DayCell";
import { SettingsTitle } from "~/components/Trackable/CreateAndSettingsFlows/settingsTitle";
import { createFlagsForSettingsForm } from "~/components/Trackable/TrackableProviders/trackableFlags";
import { TrackableFlagsProviderMock } from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import TrackableProvider from "~/components/Trackable/TrackableProviders/TrackableProvider";
import NumberLimitsSelector from "./numberLimitsSelector";

type FormType = ReactFormExtendedApi<ITrackableFlagsInputKV>;

export const SettingsCommon = ({ form }: { form: FormType }) => {
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
                onChange={(v) => field.handleChange(v.toUTCString())}
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

export const SettingsBoolean = ({ form }: { form: FormType }) => {
  return (
    <>
      <SettingsTitle>Checked color</SettingsTitle>
      <form.Field
        name="BooleanCheckedColor"
        children={(field) => (
          <>
            <DrawerMobileTitleProvider title="Checked color">
              <ColorInput
                value={field.state.value}
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
                value={field.state.value}
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

export const SettingsNumber = ({ form }: { form: FormType }) => {
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
                      checked={true}
                      onCheckedChange={() => {
                        field.handleChange({
                          min: 0,
                          max: 100,
                          ...field.state.value,
                          enabled: true,
                        });
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
                children={(field) => (
                  <NumberLimitsSelector
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
                      checked={field.state.value.enabled}
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
                    value={field.state.value ?? []}
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
  form: FormType;
  className?: string;
  index: number;
  length: number;
}) => {
  const [values, setValues] = useState<RecordValue[]>([
    { value: "", recordId: "1", createdAt: 1 },
  ]);

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
              values,
              onChange: (v, id, createdAt) => {
                if (values.some((p) => p.recordId === id)) {
                  setValues((prev) =>
                    prev.map((p) =>
                      p.recordId === id ? { ...p, value: v } : p,
                    ),
                  );
                } else {
                  setValues((prev) => [
                    ...prev,
                    {
                      value: v,
                      recordId: uuidv4(),
                      createdAt: createdAt ?? null,
                    },
                  ]);
                }
              },
              labelType: "auto",
              onDelete: (id) => {
                setValues((prev) => prev.filter((p) => p.recordId !== id));
              },
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
  initialSettings = [],
  handleSave,
  customSaveButtonText,
}: {
  trackableType: ITrackableZero["type"];
  initialSettings?: ITrackableFlagsZero[];
  handleSave: (v: ITrackableFlagsInputKV) => void | Promise<void>;
  customSaveButtonText?: string;
}) => {
  const form: FormType = useForm<ITrackableFlagsInputKV>({
    defaultValues: createFlagsForSettingsForm(initialSettings),
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
