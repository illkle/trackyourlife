import { useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";

// This should be removed eventually, but now zero does first render with empty data
// and we don't want daycells to animate every time you navigate
export const useAllowAnimation = (animationDuration: number) => {
  const [isAllowedToAnimate, setIsAllowedToAnimate] = useState(false);

  const resetAnimation = useCallback(
    debounce(() => {
      setIsAllowedToAnimate(false);
    }, animationDuration),
    [animationDuration],
  );

  useEffect(() => {
    return () => {
      resetAnimation.cancel();
    };
  }, [resetAnimation]);

  const runAnimation = useCallback(() => {
    setIsAllowedToAnimate(true);
    resetAnimation();
    return true;
  }, [resetAnimation]);

  return {
    isAllowedToAnimate,
    runAnimation,
    animationMultiplier: isAllowedToAnimate ? 1 : 0,
  };
};
