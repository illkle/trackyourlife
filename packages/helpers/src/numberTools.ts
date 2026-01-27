import millify from "millify";

export const getNumberSafe = (v: string | undefined) => {
  if (!v) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

export const formatNumberShort = (n: number, precision: number = 1) => {
  return millify(n, { precision });
};
