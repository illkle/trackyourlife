import type { CSSProperties, ReactNode } from "react";
import { createContext, memo, useCallback, useContext, useMemo } from "react";

import type {
  IBooleanSettings,
  IColorValue,
  INumberSettings,
  IRangeSettings,
} from "@tyl/db/jsonValidators";
import type { DbTrackableSelect } from "@tyl/db/schema";
import {
  getDayCellBooleanColors,
  getRangeLabelMapping,
  getValueToColorFunc,
  getValueToProgressPercentage,
} from "@tyl/helpers/trackables";

export interface IDayCellBooleanContext {
  type: "boolean";
  themeActiveLight: string;
  themeInactiveLight: string;
  themeActiveDark: string;
  themeInactiveDark: string;
  settings: IBooleanSettings;
}

export interface IDayCellNumberContext {
  type: "number";
  valueToColor: (v: number) => IColorValue;
  valueToProgressPercentage: (v: number | undefined) => number | null;
  settings: INumberSettings;
}

export interface IDayCellRangeContext {
  type: "range";
  labelMapping: Record<string, string>;
  labels: IRangeSettings["labels"];
  settings: IRangeSettings;
}

export type IDayCellContext =
  | IDayCellBooleanContext
  | IDayCellNumberContext
  | IDayCellRangeContext;

const DayCellContext = createContext<IDayCellContext | null>(null);

const DayCellBooleanProvider = ({
  settings,
  children,
}: {
  settings: IBooleanSettings;
  children: ReactNode;
}) => {
  const {
    themeActiveDark,
    themeActiveLight,
    themeInactiveDark,
    themeInactiveLight,
  } = useMemo(() => getDayCellBooleanColors(settings), [settings]);

  return (
    <div
      style={
        {
          "--themeActiveLight": themeActiveLight,
          "--themeActiveDark": themeActiveDark,
          "--themeInactiveLight": themeInactiveLight,
          "--themeInactiveDark": themeInactiveDark,
        } as CSSProperties
      }
    >
      <DayCellContext.Provider
        value={{
          type: "boolean",
          themeActiveDark,
          themeActiveLight,
          themeInactiveDark,
          themeInactiveLight,
          settings,
        }}
      >
        {children}
      </DayCellContext.Provider>
    </div>
  );
};

const DayCellNumberProvider = ({
  settings,
  children,
}: {
  settings: INumberSettings;
  children: ReactNode;
}) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const valueToColor = useCallback(getValueToColorFunc(settings), [settings]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const valueToProgressPercentage = useCallback(
    getValueToProgressPercentage(settings),
    [settings],
  );

  return (
    <div>
      <DayCellContext.Provider
        value={{
          type: "number",
          valueToColor,
          valueToProgressPercentage,
          settings,
        }}
      >
        {children}
      </DayCellContext.Provider>
    </div>
  );
};

const DayCellRangeProvider = ({
  settings,
  children,
}: {
  settings: IRangeSettings;
  children: ReactNode;
}) => {
  const labelMapping = useMemo(
    () => getRangeLabelMapping(settings),
    [settings],
  );

  return (
    <div>
      <DayCellContext.Provider
        value={{
          type: "range",
          labelMapping,
          labels: settings.labels,
          settings,
        }}
      >
        {children}
      </DayCellContext.Provider>
    </div>
  );
};

export const DayCellProvider = ({
  type,
  settings,
  children,
}: {
  type: DbTrackableSelect["type"] | undefined;
  settings: DbTrackableSelect["settings"] | undefined;
  children: ReactNode;
}) => {
  if (!type || !settings) {
    return <>{children}</>;
  }

  if (type === "boolean") {
    return (
      <DayCellBooleanProvider settings={settings}>
        {children}
      </DayCellBooleanProvider>
    );
  }

  if (type === "number") {
    return (
      <DayCellNumberProvider settings={settings}>
        {children}
      </DayCellNumberProvider>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (type === "range") {
    return (
      <DayCellRangeProvider settings={settings}>
        {children}
      </DayCellRangeProvider>
    );
  }

  throw new Error("Unsupported by DayCellProvider Trackable type");
};

export const MemoDayCellProvider = memo(DayCellProvider);

export const useDayCellContextBoolean = () => {
  const data = useContext(DayCellContext);

  if (!data) {
    throw new Error("No DayCell context provided");
  }

  if (data.type === "boolean") {
    return data;
  }
  throw new Error(
    `Wrong DayCell context provided or requested. Context type is ${data.type}. Requested type is boolean`,
  );
};

export const useDayCellContextNumber = () => {
  const data = useContext(DayCellContext);

  if (!data) {
    throw new Error("No DayCell context provided");
  }

  if (data.type === "number") {
    return data;
  }
  throw new Error(
    `Wrong DayCell context provided or requested. Context type is ${data.type}. Requested type is number`,
  );
};

export const useDayCellContextRange = () => {
  const data = useContext(DayCellContext);

  if (!data) {
    throw new Error("No DayCell context provided");
  }

  if (data.type === "range") {
    return data;
  }
  throw new Error(
    `Wrong DayCell context provided or requested. Context type is ${data.type}. Requested type is range`,
  );
};
