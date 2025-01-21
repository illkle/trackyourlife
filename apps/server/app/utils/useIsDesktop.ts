import { useMediaQuery } from "usehooks-ts";

export const useIsDesktop = () => {
  return useMediaQuery("(min-width:768px)", {});
};

export const useIsMobile = () => {
  const isMobile = useMediaQuery("(max-width:767px)", {});
  return isMobile;
};
