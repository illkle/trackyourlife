import type { IColorCodingValue, IColorHSL, IColorRGB } from "@tyl/db/jsonValidators";

import { range } from "../animation";
import { makeColorString } from "../colorTools";

export type ColorControlKey = "hue" | "saturation" | "lightness" | "red" | "green" | "blue";

type RGBKey = keyof IColorRGB;
type HSLKey = keyof IColorHSL;

type ColorDimensionConfig =
  | {
      color: "rgb";
      x: RGBKey;
      y: RGBKey;
      l: RGBKey;
      key: ColorControlKey;
    }
  | {
      color: "hsl";
      x: HSLKey;
      y: HSLKey;
      l: HSLKey;
      key: ColorControlKey;
    };

export const colorControlDimensions: Record<ColorControlKey, ColorDimensionConfig> = {
  red: { color: "rgb", x: "b", y: "g", l: "r", key: "red" },
  green: { color: "rgb", x: "b", y: "r", l: "g", key: "green" },
  blue: { color: "rgb", x: "g", y: "r", l: "b", key: "blue" },
  hue: { color: "hsl", x: "s", y: "l", l: "h", key: "hue" },
  saturation: { color: "hsl", x: "h", y: "l", l: "s", key: "saturation" },
  lightness: { color: "hsl", x: "h", y: "s", l: "l", key: "lightness" },
};

export const getControlMaxValue = (
  color: "rgb" | "hsl",
  key: RGBKey | HSLKey,
): number => {
  if (color === "rgb") return 255;
  if (key === "h") return 360;
  return 100;
};

export const getControlXY = (key: ColorControlKey, rgb: IColorRGB, hsl: IColorHSL) => {
  const attrs = colorControlDimensions[key];

  if (attrs.color === "rgb") {
    return { x: rgb[attrs.x], y: rgb[attrs.y] };
  }

  return { x: hsl[attrs.x], y: hsl[attrs.y] };
};

export const getControlL = (key: ColorControlKey, rgb: IColorRGB, hsl: IColorHSL) => {
  const attrs = colorControlDimensions[key];
  return attrs.color === "rgb" ? rgb[attrs.l] : hsl[attrs.l];
};

export const getControlMaxima = (key: ColorControlKey) => {
  const attrs = colorControlDimensions[key];

  return {
    maxX: getControlMaxValue(attrs.color, attrs.x),
    maxY: getControlMaxValue(attrs.color, attrs.y),
    maxL: getControlMaxValue(attrs.color, attrs.l),
  };
};

export const isHSLControl = (key: ColorControlKey) => {
  return key === "hue" || key === "saturation" || key === "lightness";
};

const hueStops = [0, 60, 120, 180, 240, 300, 360];

export const makeHueStops = (s: number, l: number) => {
  return hueStops.map((h) => ({
    offset: h / 360,
    color: `hsl(${h}, ${s}%, ${l}%)`,
  }));
};

export const makeColorCodingStops = ({
  values,
  min,
  max,
  mode,
}: {
  values: IColorCodingValue[];
  min: number;
  max: number;
  mode: "light" | "dark";
}) => {
  if (!values.length) return [] as { offset: number; color: string }[];

  if (values.length === 1 && values[0]) {
    const c = makeColorString(mode === "light" ? values[0].color.lightMode : values[0].color.darkMode);
    return [
      { offset: 0, color: c },
      { offset: 1, color: c },
    ];
  }

  return values.map((v) => ({
    offset: range(min, max, 0, 1, v.point),
    color: makeColorString(mode === "light" ? v.color.lightMode : v.color.darkMode),
  }));
};
