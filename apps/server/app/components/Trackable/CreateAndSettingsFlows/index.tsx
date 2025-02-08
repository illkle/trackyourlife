import type { ReactFormExtendedApi } from "@tanstack/react-form";
import { useForm } from "@tanstack/react-form";
import { m } from "motion/react";

import type { ITrackableFlagsInputKV } from "~/components/Trackable/TrackableProviders/trackableFlags";
import type { ITrackableFlagsZero, ITrackableZero } from "~/schema";
import { Button } from "~/@shad/components/button";
import { DrawerMobileTitleProvider } from "~/@shad/components/drawer";
import { Label } from "~/@shad/components/label";
import { Switch } from "~/@shad/components/switch";
import ColorInput from "~/components/Inputs/Colors/colorInput";
import NumberColorSelector from "~/components/Inputs/Colors/numberColorSelector";
import DatePicker from "~/components/Inputs/DatePicker";
import { LogsAttributeList } from "~/components/Trackable/CreateAndSettingsFlows/logsAttributeCreator";
import { SettingsTitle } from "~/components/Trackable/CreateAndSettingsFlows/settingsTitle";
import { createFlagsForSettingsForm } from "~/components/Trackable/TrackableProviders/trackableFlags";
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

export const SettingsLogs = ({ form }: { form: FormType }) => {
  return (
    <>
      <SettingsTitle>Attributes Settings</SettingsTitle>
      <form.Field
        name="LogsSavedAttributes"
        children={(field) => (
          <LogsAttributeList
            items={field.state.value}
            onChange={(v) => {
              field.handleChange(v);
            }}
          />
        )}
      />
    </>
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
      <SettingsCommon form={form} />
      {trackableType === "boolean" && <SettingsBoolean form={form} />}
      {trackableType === "number" && <SettingsNumber form={form} />}
      {trackableType === "logs" && <SettingsLogs form={form} />}
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
