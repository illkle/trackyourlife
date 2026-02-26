import chroma from 'chroma-js';

import type {
  IColorCodingValue,
  IColorHSL,
  IColorRGB,
  IColorValue,
} from '@tyl/db/jsonValidators';

import { range } from './animation';

export { chroma };

const black_c = chroma('#fafafa');
const white_c = chroma('#0a0a0a');

// It is probably possible to write this without using a library, especially because we only need a few transforms.

export function makeChroma({ h, s, l }: IColorHSL) {
  return chroma.hsl(h, s / 100, l / 100);
}

export const InterpolateColors = (
  first: IColorHSL,
  second: IColorHSL,
  ratio: number
): IColorHSL => {
  if (ratio >= 1) return second;
  if (ratio <= 0) return first;

  const c = chroma.mix(makeChroma(first), makeChroma(second), ratio, 'rgb');

  return makeColorFromChroma(c);
};

export const makeColorFromChroma = (c: chroma.Color) => {
  const [h, s, l] = c.hsl();
  return {
    h: Math.round(Number.isNaN(h) ? 0 : h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

export const makeColorString = (color: IColorHSL) =>
  `hsl(${color.h}, ${color.s}%, ${color.l}%)`;

export const makeColorStrings = (color: IColorValue) => ({
  lightMode: makeColorString(color.lightMode),
  darkMode: makeColorString(color.darkMode),
  raw: color,
});

export const getContrastierColorForDay = ({ h, s, l }: IColorHSL) => {
  const withBlack = chroma.contrast(
    chroma.hsl(h, s / 100, l / 100),
    chroma.rgb(0, 0, 0)
  );
  const withWhite = chroma.contrast(
    chroma.hsl(h, s / 100, l / 100),
    chroma.rgb(255, 255, 255)
  );

  return withBlack > withWhite ? 'black' : 'white';
};

export const RGBToHSL = ({ r, g, b }: IColorRGB): IColorHSL => {
  const c = chroma.rgb(r, g, b);
  return makeColorFromChroma(c);
};

export const HSLToRGB = (c: IColorHSL): IColorRGB => {
  const [r, g, b] = makeChroma(c).rgb(true);
  return { r, g, b };
};

export const makeCssGradient = (
  values: IColorCodingValue[],
  min: number,
  max: number,
  theme = 'dark',
  isApp?: boolean
) => {
  if (!values.length) return '';

  const prefix = isApp ? '' : 'in srgb ';

  if (values.length === 1 && values[0])
    return `linear-gradient(${prefix}to right, ${makeColorString(
      theme === 'light' ? values[0].color.lightMode : values[0].color.darkMode
    )} 0%, ${makeColorString(
      theme === 'light' ? values[0].color.lightMode : values[0].color.darkMode
    )} 100%`;

  return `linear-gradient(${prefix} to right, ${values
    .map(
      (v) =>
        makeColorString(
          theme === 'light' ? v.color.lightMode : v.color.darkMode
        ) +
        ' ' +
        range(min, max, 0, 100, v.point) +
        '%'
    )
    .join(', ')})`;
};

export const getColorAtPosition = ({
  value,
  point,
}: {
  value: IColorCodingValue[];
  point: number;
}): IColorValue => {
  if (!value.length) return presetsMap.neutral;
  if (value.length === 1 && value[0]) return value[0].color;

  let leftSide: IColorCodingValue | undefined = undefined;
  let rightSide: IColorCodingValue | undefined = undefined;

  for (const v of value) {
    if (!leftSide || v.point <= point) {
      leftSide = v;
    }
    if (!rightSide && v.point >= point) {
      rightSide = v;
    }
  }

  if (!leftSide && rightSide) return rightSide.color;
  if (!rightSide && leftSide) return leftSide.color;
  if (!leftSide || !rightSide) return presetsMap.neutral;

  if (point === leftSide.point) return leftSide.color;
  if (point === rightSide.point) return rightSide.color;

  const proportion = range(leftSide.point, rightSide.point, 0, 1, point);

  const l = InterpolateColors(
    leftSide.color.lightMode,
    rightSide.color.lightMode,

    proportion
  );
  const d = InterpolateColors(
    leftSide.color.darkMode,
    rightSide.color.darkMode,
    proportion
  );

  return {
    userSelect: l,
    lightMode: l,
    darkMode: d,
  };
};

export const findClosestDarkmode = (c: IColorHSL): IColorHSL => {
  const color = { ...c };
  let tries = 100;

  while (chroma.contrast(black_c, makeChroma(color)) < 4.5 && tries > 0) {
    color.l -= 1;
    tries--;
  }

  return color;
};

export const findClosestLightmode = (c: IColorHSL): IColorHSL => {
  const color = { ...c };
  let tries = 100;

  while (chroma.contrast(white_c, makeChroma(color)) < 4.5 && tries > 0) {
    color.l += 1;
    tries--;
  }

  return color;
};

export function findModeColorsFromUserSelect(c: IColorHSL) {
  const cc = makeChroma(c);
  const baseLight = chroma.contrast(white_c, cc) > chroma.contrast(black_c, cc);

  if (baseLight) {
    const lightMode = findClosestLightmode(c);
    const darkRough = { ...lightMode, l: 100 - lightMode.l };
    const darkMode = findClosestDarkmode(darkRough);
    return {
      lightMode,
      darkMode,
    };
  }

  const darkMode = findClosestDarkmode(c);
  const lightRough = { ...darkMode, l: 100 - darkMode.l };
  const lightMode = findClosestLightmode(lightRough);

  return {
    lightMode,
    darkMode,
  };
}

export const stringToColorHSL = (input: string): IColorHSL => {
  input = input.toLowerCase();

  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }

  hash = hash >>> 0;

  const h = hash % 360; // Hue: 0-360
  const s = 70 + (hash % 30); // Saturation: 70-100%
  const l = 50 + (hash % 20); // Lightness: 50-70%

  return {
    h: h,
    s: s,
    l: l,
  };
};




const neutral_base = {
  h: 0,
  s: 0,
  l: 80,
};

const neutral = {
  ...findModeColorsFromUserSelect(neutral_base),
  userSelect: neutral_base,
};

const red_base = {
  h: 352,
  s: 79,
  l: 41,
};

const red = {
  ...findModeColorsFromUserSelect(red_base),
  userSelect: red_base,
};

const orange_base = {
  h: 30,
  s: 99,
  l: 53,
};

const orange = {
  ...findModeColorsFromUserSelect(orange_base),
  userSelect: orange_base,
};

const blue_base = {
  h: 185,
  s: 59,
  l: 59,
};

const blue = {
  ...findModeColorsFromUserSelect(blue_base),
  userSelect: blue_base,
};

const green_base = {
  h: 73,
  s: 73,
  l: 53,
};

const green = {
  ...findModeColorsFromUserSelect(green_base),
  userSelect: green_base,
};

const purple_base = {
  h: 289,
  s: 33,
  l: 39,
};

const purple = {
  ...findModeColorsFromUserSelect(purple_base),
  userSelect: purple_base,
};

const pink_base = {
  h: 335,
  s: 59,
  l: 73,
};

const pink = {
  ...findModeColorsFromUserSelect(pink_base),
  userSelect: pink_base,
};

export const presetsMap = {
  red,
  orange,
  green,
  blue,
  purple,
  pink,
  neutral,
};
export const presetsArray: IColorValue[] = [
  neutral,
  red,
  orange,
  green,
  purple,
  pink,
];
