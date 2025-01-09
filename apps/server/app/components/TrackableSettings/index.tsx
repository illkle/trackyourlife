import type { ReactFormExtendedApi } from "@tanstack/react-form";
import { useState } from "react";
import { cn } from "@shad/utils";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";

import type {
  IBooleanSettings,
  INumberSettings,
  IRangeSettings,
  ITrackableSettings,
} from "@tyl/db/jsonValidators";
import type { DbTrackableSelect } from "@tyl/db/schema";
import { presetsMap } from "@tyl/helpers/colorPresets";
import { getGMTWithTimezoneOffset } from "@tyl/helpers/timezone";

import { Button } from "~/@shad/components/button";
import { DrawerMobileTitleProvider } from "~/@shad/components/drawer";
import { Label } from "~/@shad/components/label";
import { Switch } from "~/@shad/components/switch";
import ColorInput from "~/components/Colors/colorInput";
import DatePicker from "~/components/DatePicker";
import { DayCellBaseClasses } from "~/components/DayCell";
import { DayCellBoolean } from "~/components/DayCell/DayCellBoolean";
import { DayCellNumber } from "~/components/DayCell/DayCellNumber";
import { DayCellRange } from "~/components/DayCell/DayCellRange";
import { DayCellProvider } from "~/components/Providers/DayCellProvider";
import NumberColorSelector from "../Colors/numberColorSelector";
import NumberLimitsSelector from "./numberLimitsSelector";
import RangeLabelSelector from "./rangeLabelSelector";

export const SettingsTitle = ({ children }: { children: React.ReactNode }) => {
  return <h3 className="mb-1 mt-3 text-xl">{children}</h3>;
};

export const SettingsCommon = ({
  form,
}: {
  form: ReactFormExtendedApi<ITrackableSettings>;
}) => {
  return (
    <div>
      <SettingsTitle>Tracking Start</SettingsTitle>
      <form.Field
        name="startDate"
        children={(field) => (
          <>
            <DrawerMobileTitleProvider title="Tracking Start">
              <DatePicker
                date={
                  field.state.value ? new Date(field.state.value) : undefined
                }
                onChange={(v) => field.handleChange(String(v))}
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
  form: ReactFormExtendedApi<IBooleanSettings>;
}) => {
  return (
    <>
      <SettingsTitle>Checked color</SettingsTitle>
      <form.Field
        name="activeColor"
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
        name="inactiveColor"
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
  form: ReactFormExtendedApi<INumberSettings>;
}) => {
  return (
    <>
      <div>
        <SettingsTitle>Progress</SettingsTitle>
        <form.Field
          name="progressEnabled"
          children={(field) => (
            <div className="mb-2 flex items-center space-x-2">
              <Switch
                id="show-progress"
                checked={field.state.value}
                onCheckedChange={(v) => {
                  field.handleChange(v);
                }}
              />
              <Label htmlFor="show-progress">Show progress</Label>
            </div>
          )}
        />
        <form.Subscribe
          selector={(state) => [state.values.progressEnabled]}
          children={([progressEnabled]) =>
            progressEnabled && (
              <form.Field
                name="progress"
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

      <SettingsTitle>Color coding</SettingsTitle>
      <form.Field
        name="colorCodingEnabled"
        children={(field) => (
          <div className="mb-2 flex items-center space-x-2">
            <Switch
              id="color-coding-enabled"
              checked={field.state.value}
              onCheckedChange={(v) => {
                field.handleChange(v);
              }}
            />
            <Label htmlFor="show-progress">Enable color coding</Label>
          </div>
        )}
      />
      <form.Subscribe
        selector={(state) => [state.values.colorCodingEnabled]}
        children={([colorCodingEnabled]) =>
          colorCodingEnabled && (
            <form.Field
              name="colorCoding"
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
    </>
  );
};

export const SettingsRange = ({
  form,
}: {
  form: ReactFormExtendedApi<IRangeSettings>;
}) => {
  return (
    <>
      <SettingsTitle>States</SettingsTitle>
      <form.Field
        name="labels"
        children={(field) => (
          <RangeLabelSelector
            initialValue={field.state.value ?? []}
            onChange={(v) => {
              field.handleChange(v);
            }}
          />
        )}
      />

      <SettingsTitle>Cycle values</SettingsTitle>
      <form.Field
        name="isCycle"
        children={(field) => (
          <div className="flex items-center space-x-2">
            <Switch
              id="is-cycle"
              checked={field.state.value}
              onCheckedChange={(v) => {
                field.handleChange(v);
              }}
            />
            <Label htmlFor="is-cycle">Select next label on click</Label>
          </div>
        )}
      />
      <form.Field
        name="cycleToEmpty"
        children={(field) => (
          <div className="mt-2 flex items-center space-x-2">
            <Switch
              id="cycle-empty"
              checked={field.state.value}
              onCheckedChange={(v) => {
                field.handleChange(v);
              }}
            />
            <Label htmlFor="cycle-empty">Cycle to empty</Label>
          </div>
        )}
      />
    </>
  );
};

const TrackableMock = ({
  type,
  form,
  mockLabel,
  className,
}: {
  type: DbTrackableSelect["type"];
  form: ReactFormExtendedApi<ITrackableSettings>;
  mockLabel: string;
  className?: string;
}) => {
  const [value, onChange] = useState("");

  const classes = cn(DayCellBaseClasses, "h-20");

  const Label = (
    <div className="absolute left-0.5 top-0.5 select-none text-neutral-800 sm:left-1 sm:top-0 sm:text-base">
      <span className={"font-light"}>{mockLabel}</span>
    </div>
  );

  const settings = useStore(form.store, (state) => state.values);

  return (
    <div className={cn("relative w-full", className)}>
      <DayCellProvider type={type} settings={settings}>
        {type === "boolean" && (
          <DayCellBoolean className={classes} value={value} onChange={onChange}>
            {Label}
          </DayCellBoolean>
        )}
        {type === "number" && (
          <DayCellNumber
            className={classes}
            dateDay={new Date()}
            value={value}
            onChange={onChange}
          >
            {Label}
          </DayCellNumber>
        )}
        {type === "range" && (
          <DayCellRange className={classes} value={value} onChange={onChange}>
            {Label}
          </DayCellRange>
        )}
      </DayCellProvider>
    </div>
  );
};

const TrackableSettings = ({
  trackableType,
  initialSettings,
  handleSave,
  customSaveButtonText,
}: {
  trackableType: DbTrackableSelect["type"];
  initialSettings: ITrackableSettings;
  handleSave: (v: ITrackableSettings) => void | Promise<void>;
  customSaveButtonText?: string;
}) => {
  const form = useForm<ITrackableSettings>({
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
                mockLabel={String(i + 1)}
                type={trackableType}
                form={form}
              />
            );
          })}
      </div>

      <SettingsCommon form={form} />
      {trackableType === "boolean" && <SettingsBoolean form={form} />}
      {trackableType === "number" && <SettingsNumber form={form} />}
      {trackableType === "range" && <SettingsRange form={form} />}
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
