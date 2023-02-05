import Button from "@components/_UI/Button";
import DatePicker from "@components/_UI/DatePicker";
import type {
  IBooleanSettings,
  INumberSettings,
  IRangeSettings,
  ITrackable,
  ITrackableUnsaved,
} from "@t/trackable";
import { useRouter } from "next/router";
import { useState } from "react";
import { useTrackableSafe } from "src/helpers/trackableContext";
import ColorSelector from "./colorSelector";
import NumberColorSelector from "./numberColorSelector";
import RangeLabelSelector from "./rangeLabelSelector";

interface ISubSettingsProps<T> {
  settings: T;
  setSettings: (v: Partial<T>) => void;
  handleSave?: () => Promise<void>;
}

const SettingsBoolean = ({
  settings,
  setSettings,
  handleSave,
}: ISubSettingsProps<IBooleanSettings>) => {
  const changeActiveColor = (v: (typeof settings)["activeColor"]) => {
    setSettings({ ...settings, activeColor: v });
  };

  const chaneInactiveColor = (v: (typeof settings)["inactiveColor"]) => {
    setSettings({ ...settings, inactiveColor: v });
  };

  const changeStartDate = (v: (typeof settings)["startDate"]) => {
    setSettings({ ...settings, startDate: v });
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h3 className="text-xl">Tracking Start</h3>
        <DatePicker
          date={settings.startDate}
          onChange={changeStartDate}
          limits={{ start: new Date(1990, 0, 1), end: new Date() }}
          className="mt-2"
        />
      </div>

      <div>
        <h3 className="text-xl">Checked color</h3>
        <ColorSelector
          active={settings.activeColor || "green"}
          onChange={changeActiveColor}
          className="mt-2"
        />
      </div>

      <div>
        <h3 className="mt-4 text-xl">Unchecked color</h3>
        <ColorSelector
          active={settings.inactiveColor || "neutral"}
          onChange={chaneInactiveColor}
          className="mt-2"
        />
      </div>

      {handleSave && (
        <Button className="mt-2" onClick={() => void handleSave()}>
          Save
        </Button>
      )}
    </div>
  );
};

const SettingsNumber = ({
  settings,
  setSettings,
  handleSave,
}: ISubSettingsProps<INumberSettings>) => {
  const changeStartDate = (v: (typeof settings)["startDate"]) => {
    setSettings({ ...settings, startDate: v });
  };

  const changeColorCoding = (v: (typeof settings)["colorCoding"]) => {
    setSettings({ ...settings, colorCoding: v });
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h3 className="text-xl">Tracking Start</h3>
        <DatePicker
          date={settings.startDate}
          onChange={changeStartDate}
          limits={{ start: new Date(1990, 0, 1), end: new Date() }}
          className="mt-2"
        />
      </div>

      <div>
        <h3 className="mb-2 text-xl">Color coding</h3>
        <NumberColorSelector
          initialValue={settings.colorCoding}
          onChange={changeColorCoding}
        />
      </div>

      {handleSave && (
        <Button className="mt-2" onClick={() => void handleSave()}>
          Save
        </Button>
      )}
    </div>
  );
};

const SettingsRange = ({
  settings,
  setSettings,
  handleSave,
}: ISubSettingsProps<IRangeSettings>) => {
  const changeStartDate = (v: (typeof settings)["startDate"]) => {
    setSettings({ ...settings, startDate: v });
  };

  const changeRangeLabels = (v: (typeof settings)["labels"]) => {
    setSettings({ ...settings, labels: v });
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h3 className="text-xl">Tracking Start</h3>
        <DatePicker
          date={settings.startDate}
          onChange={changeStartDate}
          limits={{ start: new Date(1990, 0, 1), end: new Date() }}
          className="mt-2"
        />
      </div>

      <div>
        <h3 className="mb-2 text-xl">Range Labels</h3>
        <RangeLabelSelector
          initialValue={settings.labels}
          onChange={changeRangeLabels}
        />
      </div>

      {handleSave && (
        <Button className="mt-2" onClick={() => void handleSave()}>
          Save
        </Button>
      )}
    </div>
  );
};

const TrackableSettings = () => {
  const { trackable, changeSettings } = useTrackableSafe();

  const router = useRouter();

  const [settings, setSettings] = useState(trackable.settings);

  const handleSave = async () => {
    await changeSettings(settings);
    await router.push(`/trackable/${trackable.id}`);
  };

  if (trackable.type === "boolean") {
    return (
      <SettingsBoolean
        settings={settings}
        setSettings={setSettings}
        handleSave={handleSave}
      />
    );
  }

  if (trackable.type === "number") {
    return (
      <SettingsNumber
        settings={settings}
        setSettings={setSettings}
        handleSave={handleSave}
      />
    );
  }

  if (trackable.type === "range") {
    return (
      <SettingsRange
        settings={settings}
        setSettings={setSettings}
        handleSave={handleSave}
      />
    );
  }

  return <></>;
};

export const TrackableSettingsManual = ({
  trackable,
  setSettings,
}: {
  trackable: ITrackable | ITrackableUnsaved;
  setSettings: (v: ITrackable["settings"]) => void;
}) => {
  const settings = trackable.settings;

  if (trackable.type === "boolean") {
    return <SettingsBoolean settings={settings} setSettings={setSettings} />;
  }

  if (trackable.type === "number") {
    return <SettingsNumber settings={settings} setSettings={setSettings} />;
  }

  if (trackable.type === "range") {
    return <SettingsRange settings={settings} setSettings={setSettings} />;
  }

  return <></>;
};

export default TrackableSettings;