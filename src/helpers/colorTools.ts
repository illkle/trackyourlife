import type { IColorHSL, IColorRGB } from "@t/trackable";
import chroma from "chroma-js";

// It is probably possible to write this without using a library, especially because we only need a few transforms.

export const InterpolateColors = (
  first: IColorHSL,
  second: IColorHSL,
  ratio: number,
): IColorHSL => {
  const c = chroma
    .mix(
      chroma.hsl(first.h, first.s / 100, first.l / 100),
      chroma.hsl(second.h, second.s / 100, second.l / 100),
      1 - ratio,
      "rgb",
    )
    .hsl();

  return { h: Number.isNaN(c[0]) ? 0 : c[0], s: c[1] * 100, l: c[2] * 100 };
};

export const makeColorString = (color: IColorHSL) =>
  `hsl(${color.h}, ${color.s}%, ${color.l}%)`;

export const RGBToHSL = ({ r, g, b }: IColorRGB): IColorHSL => {
  const [h, s, l] = chroma.rgb(r, g, b).hsl();
  return { h, s: s * 100, l: l * 100 };
};

export const HSLToRGB = ({ h, s, l }: IColorHSL): IColorRGB => {
  const [r, g, b] = chroma.hsl(h, s / 100, l / 100).rgb(true);
  return { r, g, b };
};

