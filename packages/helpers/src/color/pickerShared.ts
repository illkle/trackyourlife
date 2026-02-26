import type {
  IColorCodingValue,
  IColorHSL,
  IColorRGB,
} from '@tyl/db/jsonValidators';

import { range } from '../animation';
import { makeColorString } from '../colorTools';

export type ColorControlKey =
  | 'hue'
  | 'saturation'
  | 'lightness'
  | 'red'
  | 'green'
  | 'blue';

type RGBKey = keyof IColorRGB;
type HSLKey = keyof IColorHSL;

type ColorDimensionConfig =
  | {
      color: 'rgb';
      x: RGBKey;
      y: RGBKey;
      l: RGBKey;
      key: ColorControlKey;
    }
  | {
      color: 'hsl';
      x: HSLKey;
      y: HSLKey;
      l: HSLKey;
      key: ColorControlKey;
    };

export const colorControlDimensions: Record<
  ColorControlKey,
  ColorDimensionConfig
> = {
  red: { color: 'rgb', x: 'b', y: 'g', l: 'r', key: 'red' },
  green: { color: 'rgb', x: 'b', y: 'r', l: 'g', key: 'green' },
  blue: { color: 'rgb', x: 'g', y: 'r', l: 'b', key: 'blue' },
  hue: { color: 'hsl', x: 's', y: 'l', l: 'h', key: 'hue' },
  saturation: { color: 'hsl', x: 'h', y: 'l', l: 's', key: 'saturation' },
  lightness: { color: 'hsl', x: 'h', y: 's', l: 'l', key: 'lightness' },
};

export const getControlMaxValue = (
  color: 'rgb' | 'hsl',
  key: RGBKey | HSLKey
): number => {
  if (color === 'rgb') return 255;
  if (key === 'h') return 360;
  return 100;
};

export const getControlXY = (
  key: ColorControlKey,
  rgb: IColorRGB,
  hsl: IColorHSL
) => {
  const attrs = colorControlDimensions[key];

  if (attrs.color === 'rgb') {
    return { x: rgb[attrs.x], y: rgb[attrs.y] };
  }

  return { x: hsl[attrs.x], y: hsl[attrs.y] };
};

export const getControlL = (
  key: ColorControlKey,
  rgb: IColorRGB,
  hsl: IColorHSL
) => {
  const attrs = colorControlDimensions[key];
  return attrs.color === 'rgb' ? rgb[attrs.l] : hsl[attrs.l];
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
  return key === 'hue' || key === 'saturation' || key === 'lightness';
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
  mode: 'light' | 'dark';
}) => {
  if (!values.length) return [] as { offset: number; color: string }[];

  if (values.length === 1 && values[0]) {
    const c = makeColorString(
      mode === 'light' ? values[0].color.lightMode : values[0].color.darkMode
    );
    return [
      { offset: 0, color: c },
      { offset: 1, color: c },
    ];
  }

  return values.map((v) => ({
    offset: range(min, max, 0, 1, v.point),
    color: makeColorString(
      mode === 'light' ? v.color.lightMode : v.color.darkMode
    ),
  }));
};

export const hueGradient =
  'linear-gradient(to right, rgb(255, 0, 0) 0%, rgb(255, 255, 0) 17%, rgb(0, 255, 0) 33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 67%, rgb(255, 0, 255) 83%, rgb(255, 0, 0) 100%)';
export const hueGradientDynamic = (s: number, l: number) =>
  `linear-gradient(to right, hsl(0, ${s}%, ${l}%) 0%, hsl(60, ${s}%, ${l}%) 17%, hsl(120, ${s}%, ${l}%)33%, hsl(180, ${s}%, ${l}%) 50%, hsl(240, ${s}%, ${l}%) 67%, hsl(300, ${s}%, ${l}%) 83%, hsl(360, ${s}%, ${l}%) 100%)`;

export const gg2D: Record<
  ColorControlKey,
  (rgb: IColorRGB, hsl: IColorHSL) => string
> = {
  red: (rgb, _) =>
    `linear-gradient(to top left, rgb(${rgb.r}, 255, 255), rgba(${rgb.r}, 128, 128, 0), rgb(${rgb.r}, 0, 0)), 
     linear-gradient(to top right, rgb(${rgb.r},255,0), rgba(${rgb.r}, 153, 150, 0), rgb(${rgb.r}, 0, 255)), 
     linear-gradient(rgba(${rgb.r}, 153, 150, 1),rgba(${rgb.r}, 153, 150, 1))`,
  green: (rgb, _) =>
    `linear-gradient(to bottom right, rgb(0,${rgb.g},0), rgba(128, ${rgb.g}, 128, 0), rgb(255, ${rgb.g}, 255)),
     linear-gradient(to bottom left, rgb(0, ${rgb.g}, 255), rgba(150, ${rgb.g}, 150, 0), rgb(255, ${rgb.g}, 0)), 
     linear-gradient(rgba(150, ${rgb.g}, 150, 1),rgba(150, ${rgb.g}, 150, 1))`,
  blue: (rgb, _) =>
    `linear-gradient(to bottom right, rgb(0, 0, ${rgb.b}), rgba(128, 128, ${rgb.b}, 0), rgb(255, 255, ${rgb.b})), 
     linear-gradient(to bottom left, rgb(0, 255, ${rgb.b}), rgba(150, 150, ${rgb.b}, 0), rgb(255, 0, ${rgb.b})),
      linear-gradient(rgba(150, 150, ${rgb.b}, 1),rgba(150, 150, ${rgb.b}, 1))`,
  hue: (rgb, hsl) =>
    `linear-gradient(to bottom, #000000 0%, #00000000 49%, #FFFFFF00 51%,  #FFFFFF 100%), linear-gradient(to right, hsl(${hsl.h}, 0%, 50%) 0%, hsl(${hsl.h}, 100%, 50%) 100%)`,
  saturation: (rgb, hsl) =>
    `linear-gradient(to bottom, #000000 0%, #00000000 49%, #FFFFFF00 51%,  #FFFFFF 100%), ${hueGradientDynamic(hsl.s, 50)}`,
  lightness: (rgb, hsl) =>
    `linear-gradient(to bottom, hsl(0, 0%, ${hsl.l}%) 0%, transparent 100%), ${hueGradientDynamic(100, hsl.l)}`,
};

export const ggLinear: Record<
  ColorControlKey,
  (rgb: IColorRGB, hsl: IColorHSL) => string
> = {
  red: (rgb, _) =>
    `linear-gradient(to right, rgb(0,${rgb.g}, ${rgb.b}) 0%, rgb(255,${rgb.g}, ${rgb.b}) 100% )`,
  green: (rgb, _) =>
    `linear-gradient(to right, rgb(${rgb.r}, 0, ${rgb.b}) 0%, rgb(${rgb.r}, 255, ${rgb.b}) 100% )`,
  blue: (rgb, _) =>
    `linear-gradient(to right, rgb(${rgb.r}, ${rgb.g}, 0) 0%, rgb(${rgb.r}, ${rgb.g}, 255) 100% )`,
  hue: () => hueGradient,
  saturation: (rgb, hsl) =>
    `linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%) 0%, hsl(${hsl.h}, 100%, ${hsl.l}%) 100% )`,
  lightness: (rgb, hsl) =>
    `linear-gradient(to right, hsl(${hsl.h}, ${hsl.s}%, 0%) 0%, hsl(${hsl.h}, ${hsl.s}%, 100%) 100% )`,
};
