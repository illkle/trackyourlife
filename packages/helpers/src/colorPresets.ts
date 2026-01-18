import type { IColorValue } from "@tyl/db/jsonValidators";

import { findModeColorsFromUserSelect } from "./colorTools";

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
export const presetsArray: IColorValue[] = [neutral, red, orange, green, purple, pink];
