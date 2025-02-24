export { clamp, cloneDeep, debounce, throttle, chunk, range } from "lodash-es";

// https://gist.github.com/eplawless/52813b1d8ad9af510d85
export const generateSimpleHash = (str: string) => {
  const len = str.length;
  let h = 5381;

  for (let i = 0; i < len; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return String(h >>> 0);
};
