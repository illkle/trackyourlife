import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface IUseRefSizeReturn {
  width: number;
  height: number;
  top: number;
  left: number;
}

// Note that when we access properties on render we can use regular data to rerender on change
// But when we access stuff in handlers(i.e mousemove\touchmove) we should use ref to guarantee up to date values
export const useRefSize = (ref: RefObject<HTMLDivElement>) => {
  const dataRef = useRef({ width: 0, height: 0, left: 0, top: 0 });
  const [data, setData] = useState<IUseRefSizeReturn>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });

  const calculate = useCallback(() => {
    if (!ref.current) return;
    const { width, height, top, left } = ref.current.getBoundingClientRect();
    const data = {
      width,
      height,
      top,
      left,
    };

    setData(data);
    dataRef.current = data;
  }, [ref]);

  useEffect(() => {
    calculate();
    addEventListener("resize", calculate);
    addEventListener("scroll", calculate);
    return () => {
      removeEventListener("resize", calculate);
      removeEventListener("scroll", calculate);
    };
  }, [calculate]);

  // Force refresh is useful when initial rendering position will be inaccurate later(i.e. modal that animate when appearing)
  return { ...data, dataRef, forceRefresh: calculate };
};
